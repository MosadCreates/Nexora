import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting (shared with analyze endpoint to prevent abuse)
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    const { query, report } = await req.json()

    if (!query || !report) {
      return NextResponse.json({ error: 'Query and report are required' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Reserve credit
    const { error: reserveError } = await supabaseAdmin.rpc('reserve_analysis_credit', {
      p_user_id: user.id,
    })

    if (reserveError) {
      if (reserveError.message?.includes('NO_CREDITS_REMAINING')) {
        return NextResponse.json({ error: 'No credits remaining. Please upgrade your plan.' }, { status: 403 })
      }
      return NextResponse.json({ error: 'Unable to verify account status.' }, { status: 500 })
    }

    // Save history
    const { data: savedData, error: saveError } = await supabaseAdmin
      .from('analysis_history')
      .insert({
        user_id: user.id,
        query: query.trim(),
        report: report,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (saveError) {
      await supabaseAdmin.rpc('refund_analysis_credit', { p_user_id: user.id })
      logger.error('[save-analysis] Failed to save', { error: saveError })
      return NextResponse.json({ error: 'Failed to save analysis results.' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      id: savedData.id 
    })

  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[save-analysis] Server error', { error: err.message })
    Sentry.captureException(err)
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 })
  }
}
