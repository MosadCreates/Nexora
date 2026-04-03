import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { analyzeLimiter, applyRateLimit, redis } from '@/lib/rateLimit'
import { MAX_CREDITS } from '@/lib/planUtils'

/**
 * Pre-flight endpoint for client-side Puter.js analysis.
 * Checks auth, rate limits, credits, and acquires in-flight lock.
 * Returns { ok: true } or { error: "..." }
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

    // ── Rate limiting ───────────────────────────────────────────────
    const rateLimitResponse = await applyRateLimit(analyzeLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse query ─────────────────────────────────────────────────
    const { query } = await req.json()
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const trimmedQuery = query.trim()

    // ── Query length validation ─────────────────────────────────────
    const MAX_QUERY_LENGTH = 500
    if (trimmedQuery.length > MAX_QUERY_LENGTH) {
      return NextResponse.json(
        { error: `Query must be ${MAX_QUERY_LENGTH} characters or less` },
        { status: 400 }
      )
    }

    // ── Character validation ────────────────────────────────────────
    const ALLOWED_QUERY_PATTERN = /^[a-zA-Z0-9\s\-_.,!?'"()&@#%+\/:]+$/
    if (!ALLOWED_QUERY_PATTERN.test(trimmedQuery)) {
      return NextResponse.json(
        { error: 'Query contains invalid characters' },
        { status: 400 }
      )
    }

    // ── Credit check (read-only, no decrement yet) ──────────────────
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('credits_used, subscription_plan')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Unable to verify account status.' },
        { status: 500 }
      )
    }

    const plan = profile.subscription_plan || 'hobby'
    const maxCredits = MAX_CREDITS[plan] ?? MAX_CREDITS.hobby ?? 3
    const creditsUsed = profile.credits_used || 0

    if (creditsUsed >= maxCredits) {
      return NextResponse.json(
        { error: 'No credits remaining. Please upgrade your plan.' },
        { status: 403 }
      )
    }

    // ── In-flight lock ──────────────────────────────────────────────
    const lockKey = `analyze:lock:${user.id}`
    let lockAcquired = false

    try {
      const r = redis()
      const result = await r.set(lockKey, '1', { nx: true, ex: 120 })
      lockAcquired = result === 'OK'
    } catch (lockErr) {
      logger.warn('[preflight] Lock acquisition failed — proceeding without lock', {
        error: (lockErr as Error).message,
      })
      lockAcquired = true
    }

    if (!lockAcquired) {
      return NextResponse.json(
        { error: 'An analysis is already in progress. Please wait.' },
        { status: 429 }
      )
    }

    logger.info('[preflight] Approved', {
      userId: user.id,
      queryLength: trimmedQuery.length,
    })

    return NextResponse.json({ ok: true, lockKey })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[preflight] Server error', { error: err.message })
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
