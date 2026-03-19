import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'
import { checkoutLimiter, applyRateLimit } from '@/lib/rateLimit'
import { getProductPlanSlug, PLAN_RANK } from '@/lib/planUtils'

// ── Fix #2: Whitelist of valid Polar product IDs ───────────────────
const VALID_PRODUCT_IDS = new Set(
  [
    process.env.NEXT_PUBLIC_POLAR_STARTER_MONTHLY_ID,
    process.env.NEXT_PUBLIC_POLAR_STARTER_YEARLY_ID,
    process.env.NEXT_PUBLIC_POLAR_PROFESSIONAL_MONTHLY_ID,
    process.env.NEXT_PUBLIC_POLAR_PROFESSIONAL_YEARLY_ID,
  ].filter(Boolean)
)

// ── Fix #3 (Audit 2): Validate redirect URLs ──────────────────────
function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean)
    return allowedOrigins.some(origin => parsed.origin === origin)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Authentication ─────────────────────────────────────────────
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

    // ── Rate Limiting ──────────────────────────────────────────────
    const rateLimitResponse = await applyRateLimit(checkoutLimiter, user.id, req)
    if (rateLimitResponse) return rateLimitResponse

    // ── Parse & validate request body ──────────────────────────────
    const { productId, successUrl, cancelUrl } = await req.json()

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // ── Fix #3 (Audit 2): Validate redirect URLs ──────────────────
    if (successUrl && !isValidRedirectUrl(successUrl)) {
      logger.warn('[checkout] Invalid successUrl rejected', {
        userId: user.id,
        url: successUrl,
      })
      return NextResponse.json(
        { error: 'Invalid redirect URL' },
        { status: 400 }
      )
    }
    if (cancelUrl && !isValidRedirectUrl(cancelUrl)) {
      logger.warn('[checkout] Invalid cancelUrl rejected', {
        userId: user.id,
        url: cancelUrl,
      })
      return NextResponse.json(
        { error: 'Invalid redirect URL' },
        { status: 400 }
      )
    }

    // ── Whitelist check — reject unknown product IDs ───────────────
    if (VALID_PRODUCT_IDS.size > 0 && !VALID_PRODUCT_IDS.has(productId)) {
      logger.warn('[checkout] Invalid product ID attempted', {
        userId: user.id,
        productId
      })
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      )
    }

    // ── Fix #4: Pre-checkout subscription check ────────────────────
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      logger.error('[checkout] SUPABASE_SERVICE_ROLE_KEY not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_slug, status, current_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (existingSub) {
      const requestedPlan = getProductPlanSlug(productId)
      const currentRank = PLAN_RANK[existingSub.plan_slug] ?? 0
      const requestedRank = PLAN_RANK[requestedPlan ?? 'hobby'] ?? 0

      if (requestedRank <= currentRank) {
        logger.warn('[checkout] Downgrade/same-plan checkout blocked', {
          userId: user.id,
          currentPlan: existingSub.plan_slug,
          requestedPlan,
        })
        return NextResponse.json(
          {
            error: 'You already have an equal or higher plan active.',
            currentPlan: existingSub.plan_slug,
            currentPeriodEnd: existingSub.current_period_end,
          },
          { status: 409 }
        )
      }
      // Allow upgrade (higher plan) to proceed
    }

    const polarToken = process.env.POLAR_ORGANIZATION_TOKEN
    if (!polarToken) {
      logger.error('[checkout] POLAR_ORGANIZATION_TOKEN not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    logger.info('[checkout] Creating checkout session', {
      userId: user.id,
      productId
    })

    // ── 15-second timeout for Polar API ────────────────────────────
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15_000)

    let polarResponse: Response
    try {
      polarResponse = await fetch('https://api.polar.sh/v1/checkouts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${polarToken}`
        },
        body: JSON.stringify({
          product_id: productId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: user.email,
          metadata: {
            user_id: user.id
          }
        }),
        signal: controller.signal
      })
    } catch (err: unknown) {
      const fetchErr = err instanceof Error ? err : new Error(String(err))
      if (fetchErr.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Checkout service timed out. Please try again.' },
          { status: 504 }
        )
      }
      throw fetchErr
    } finally {
      clearTimeout(timeoutId)
    }

    const data = await polarResponse.json()

    if (!polarResponse.ok) {
      logger.error('[checkout] Polar API error', {
        status: polarResponse.status,
        detail: data.detail
      })
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: polarResponse.status }
      )
    }

    logger.info('[checkout] Session created', { userId: user.id })
    return NextResponse.json({ url: data.url })
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[checkout] Server error', { error: err.message, stack: err.stack })
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'An internal error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
