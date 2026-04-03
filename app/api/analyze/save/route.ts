import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { redis } from '@/lib/rateLimit'
import { setCachedAnalysis } from '@/lib/analysisCache'

/**
 * Save endpoint for client-side Puter.js analysis.
 * Called AFTER the AI response is received on the client.
 * Reserves credit, saves report, caches result, releases lock.
 */
export async function POST(req: NextRequest) {
  try {
    // ── Auth check ──────────────────────────────────────────────────
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
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Parse body ──────────────────────────────────────────────────
    const { query, report } = await req.json()

    if (!query || !report) {
      return NextResponse.json(
        { error: 'Query and report are required' },
        { status: 400 }
      )
    }

    // ── Service role client for DB operations ───────────────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // ── Reserve credit ──────────────────────────────────────────────
    const { error: reserveError } = await supabaseAdmin.rpc(
      'reserve_analysis_credit',
      { p_user_id: user.id }
    )

    if (reserveError) {
      logger.error('[save] Credit reservation failed', {
        error: reserveError.message,
        userId: user.id,
      })

      if (reserveError.message?.includes('NO_CREDITS_REMAINING')) {
        return NextResponse.json(
          { error: 'No credits remaining. Please upgrade your plan.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: 'Unable to verify account status.' },
        { status: 500 }
      )
    }

    // ── Save to analysis_history ────────────────────────────────────
    const { data: insertedRow, error: saveError } = await supabaseAdmin
      .from('analysis_history')
      .insert({
        user_id: user.id,
        query: query.trim(),
        report,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (saveError || !insertedRow) {
      // Refund credit if save failed
      await supabaseAdmin.rpc('refund_analysis_credit', {
        p_user_id: user.id,
      })
      logger.error('[save] Failed to save analysis', {
        error: saveError?.message,
        userId: user.id,
      })
      return NextResponse.json(
        { error: 'Failed to save analysis results.' },
        { status: 500 }
      )
    }

    // ── Cache the result ────────────────────────────────────────────
    try {
      await setCachedAnalysis(query.trim(), user.id, report)
    } catch (cacheErr) {
      // Non-critical — log but don't fail
      logger.warn('[save] Cache write failed', {
        error: (cacheErr as Error).message,
      })
    }

    // ── Release lock ────────────────────────────────────────────────
    const lockKey = `analyze:lock:${user.id}`
    try {
      await redis().del(lockKey)
    } catch (lockErr) {
      logger.warn('[save] Lock release failed', {
        error: (lockErr as Error).message,
      })
    }

    logger.info('[save] Analysis saved', {
      userId: user.id,
      analysisId: insertedRow.id,
    })

    return NextResponse.json({ id: insertedRow.id })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    Sentry.captureException(err)
    logger.error('[save] Server error', {
      error: err.message,
      stack: err.stack,
    })
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
