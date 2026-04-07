import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { generalLimiter, applyRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  try {
    // ── Authentication ─────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Missing Authorization header' },
        { status: 401 }
      )
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

    // ── Fix #3: Rate Limiting ──────────────────────────────────────
    const rateLimitResponse = await applyRateLimit(generalLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // ── Service role client for DB operations ──────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      logger.error('[cancel-subscription] SUPABASE_SERVICE_ROLE_KEY not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          headers: { 'x-connection-hint': 'read-write' },
        },
      }
    )

    // ── Fetch active subscription ──────────────────────────────────
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select('polar_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError) {
      logger.error('[cancel-subscription] DB error fetching subscription', {
        error: subError.message
      })
      return NextResponse.json(
        { error: 'Failed to retrieve active subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    const polarToken = process.env.POLAR_ORGANIZATION_TOKEN
    if (!polarToken) {
      logger.error('[cancel-subscription] POLAR_ORGANIZATION_TOKEN not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    logger.info('[cancel-subscription] Cancelling subscription', {
      userId: user.id,
      polarSubId: subscription.polar_subscription_id
    })

    // ── Fix #7B: 15-second timeout for Polar API ───────────────────
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)

    let polarResponse: Response
    try {
      polarResponse = await fetch(
        `https://api.polar.sh/v1/subscriptions/${subscription.polar_subscription_id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${polarToken}`
          },
          body: JSON.stringify({ cancel_at_period_end: true }),
          signal: controller.signal
        }
      )
    } catch (err: unknown) {
      const fetchErr = err instanceof Error ? err : new Error(String(err))
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Cancellation service timed out. Please try again.' },
          { status: 504 }
        )
      }
      throw fetchErr
    } finally {
      clearTimeout(timeoutId)
    }

    const data = await polarResponse.json()

    if (!polarResponse.ok) {
      logger.error('[cancel-subscription] Polar API error', {
        status: polarResponse.status,
        detail: data.detail
      })
      return NextResponse.json(
        { error: data.detail || 'Failed to cancel subscription' },
        { status: polarResponse.status }
      )
    }

    logger.info('[cancel-subscription] Success', { userId: user.id })
    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the period'
    })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[cancel-subscription] Server error', { error: err.message, stack: err.stack })
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
