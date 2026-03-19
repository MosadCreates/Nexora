import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { logger } from '@/lib/logger'
import { getProductPlanSlug } from '@/lib/planUtils'

// ── Supabase admin client (service role) ────────────────────────────
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase admin credentials')
  return createClient(url, key)
}

// ── Idempotency: check + insert event ───────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminClient = ReturnType<typeof createClient>

async function isDuplicate(
  admin: AdminClient,
  eventId: string
): Promise<boolean> {
  const { data } = await admin
    .from('webhook_events' as any)
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle()

  return !!data
}

async function recordEvent(
  admin: AdminClient,
  eventId: string,
  eventType: string,
  payload: unknown,
  status: string,
  errorMsg?: string
) {
  await (admin.from('webhook_events' as any) as any).upsert(
    {
      event_id: eventId,
      event_type: eventType,
      payload,
      status,
      error_message: errorMsg ?? null,
      created_at: new Date().toISOString(),
    },
    { onConflict: 'event_id' }
  )
}

// ── Subscription helpers ────────────────────────────────────────────
async function upsertSubscription(
  admin: AdminClient,
  data: {
    userId: string
    polarSubscriptionId: string
    polarCustomerId: string
    planSlug: string
    status: string
    currentPeriodStart?: string
    currentPeriodEnd?: string
    cancelAtPeriodEnd?: boolean
    startedAt?: string
  }
) {
  const { error } = await (admin.from('subscriptions' as any) as any).upsert(
    {
      user_id: data.userId,
      polar_subscription_id: data.polarSubscriptionId,
      polar_customer_id: data.polarCustomerId,
      plan_slug: data.planSlug,
      status: data.status,
      current_period_start: data.currentPeriodStart ?? null,
      current_period_end: data.currentPeriodEnd ?? null,
      cancel_at_period_end: data.cancelAtPeriodEnd ?? false,
      started_at: data.startedAt ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    logger.error('[webhook] Subscription upsert failed', { error: error.message })
    throw error
  }
}

async function resetCredits(
  admin: AdminClient,
  userId: string
) {
  await (admin
    .from('profiles' as any) as any)
    .update({ credits_used: 0, updated_at: new Date().toISOString() })
    .eq('id', userId)
}

// ── Extract user ID from webhook metadata ───────────────────────────
function extractUserId(payload: Record<string, unknown>): string | null {
  // Polar sends metadata.user_id that we set during checkout
  const data = payload.data as Record<string, unknown> | undefined
  const metadata = data?.metadata as Record<string, string> | undefined
  if (metadata?.user_id) return metadata.user_id

  // Fallback: look for customer email and match in profiles
  return null
}

function extractSubscriptionFields(data: Record<string, unknown>) {
  return {
    polarSubscriptionId: (data.id as string) || '',
    polarCustomerId: (data.customer_id as string) || '',
    productId: (data.product_id as string) || '',
    currentPeriodStart: (data.current_period_start as string) || undefined,
    currentPeriodEnd: (data.current_period_end as string) || undefined,
    startedAt: (data.started_at as string) || undefined,
  }
}

// ── POST /api/webhooks/polar ────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Read raw body BEFORE parsing — required for signature verification
  const rawBody = await req.text()

  // 2. Verify webhook signature
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.error('[webhook] POLAR_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  let event: { type: string; data: Record<string, unknown>; [key: string]: unknown }
  try {
    const headers: Record<string, string> = {}
    req.headers.forEach((value, key) => {
      headers[key] = value
    })
    event = validateEvent(rawBody, headers, webhookSecret) as typeof event
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      logger.warn('[webhook] Signature verification failed', {
        error: err.message,
      })
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    throw err
  }

  // 3. Get admin client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin: any = getAdminClient()

  // 4. Extract event ID for idempotency
  const eventId =
    (event as Record<string, unknown>).id as string ??
    (event.data?.id as string) ??
    `${event.type}-${Date.now()}`

  // 5. Duplicate check
  const duplicate = await isDuplicate(admin, eventId)
  if (duplicate) {
    logger.info('[webhook] Duplicate event skipped', { eventId })
    return NextResponse.json({ received: true, duplicate: true })
  }

  // 6. Record event as processing
  await recordEvent(admin, eventId, event.type, event, 'processing')

  try {
    const data = event.data
    const userId = extractUserId(event as Record<string, unknown>)

    switch (event.type) {
      // ── Subscription Created ─────────────────────────────────────
      case 'subscription.created': {
        if (!userId) {
          throw new Error('No user_id in webhook metadata')
        }
        const fields = extractSubscriptionFields(data)
        const planSlug = getProductPlanSlug(fields.productId)

        // Fix #3: Reject unknown product IDs
        if (!planSlug) {
          logger.warn('[webhook] subscription.created — unknown product ID', {
            productId: fields.productId,
          })
          await recordEvent(admin, eventId, event.type, event, 'ignored', 'Unknown product ID')
          return NextResponse.json(
            { received: true, warning: 'Unknown product ID — ignored' },
            { status: 200 }
          )
        }

        await upsertSubscription(admin, {
          userId,
          polarSubscriptionId: fields.polarSubscriptionId,
          polarCustomerId: fields.polarCustomerId,
          planSlug,
          status: 'active',
          currentPeriodStart: fields.currentPeriodStart,
          currentPeriodEnd: fields.currentPeriodEnd,
          startedAt: fields.startedAt,
        })

        // Reset credits for new subscription period
        await resetCredits(admin, userId)

        logger.info('[webhook] Subscription created', { userId, planSlug })
        break
      }

      // ── Subscription Updated (includes renewals) ─────────────────
      case 'subscription.updated': {
        if (!userId) {
          throw new Error('No user_id in webhook metadata')
        }
        const fields = extractSubscriptionFields(data)
        const planSlug = getProductPlanSlug(fields.productId)

        // Fix #3: Reject unknown product IDs
        if (!planSlug) {
          logger.warn('[webhook] subscription.updated — unknown product ID', {
            productId: fields.productId,
          })
          await recordEvent(admin, eventId, event.type, event, 'ignored', 'Unknown product ID')
          return NextResponse.json(
            { received: true, warning: 'Unknown product ID — ignored' },
            { status: 200 }
          )
        }

        const status = (data.status as string) || 'active'

        // Fix #1: Get existing subscription to detect period renewal
        const { data: existingSub } = await admin
          .from('subscriptions')
          .select('current_period_start')
          .eq('user_id', userId)
          .maybeSingle()

        await upsertSubscription(admin, {
          userId,
          polarSubscriptionId: fields.polarSubscriptionId,
          polarCustomerId: fields.polarCustomerId,
          planSlug,
          status,
          currentPeriodStart: fields.currentPeriodStart,
          currentPeriodEnd: fields.currentPeriodEnd,
          cancelAtPeriodEnd: (data.cancel_at_period_end as boolean) ?? false,
        })

        // Fix #1: Reset credits if billing period has changed (renewal)
        const isRenewal =
          existingSub?.current_period_start &&
          fields.currentPeriodStart &&
          existingSub.current_period_start !== fields.currentPeriodStart

        if (isRenewal) {
          await resetCredits(admin, userId)
          logger.info('[webhook] Credits reset on renewal', { userId, planSlug })
        }

        logger.info('[webhook] Subscription updated', { userId, planSlug, status, isRenewal: !!isRenewal })
        break
      }

      // ── Subscription Active (renewal confirmation from Polar) ────
      case 'subscription.active': {
        if (!userId) {
          logger.warn('[webhook] subscription.active missing user_id')
          break
        }
        const fields = extractSubscriptionFields(data)
        const planSlug = getProductPlanSlug(fields.productId)

        if (!planSlug) {
          logger.warn('[webhook] subscription.active — unknown product ID', {
            productId: fields.productId,
          })
          break
        }

        await upsertSubscription(admin, {
          userId,
          polarSubscriptionId: fields.polarSubscriptionId,
          polarCustomerId: fields.polarCustomerId,
          planSlug,
          status: 'active',
          currentPeriodStart: fields.currentPeriodStart,
          currentPeriodEnd: fields.currentPeriodEnd,
          startedAt: fields.startedAt,
        })

        await resetCredits(admin, userId)

        logger.info('[webhook] subscription.active — credits reset', { userId, planSlug })
        break
      }

      // ── Subscription Uncanceled (user reactivates) ───────────────
      case 'subscription.uncanceled': {
        if (!userId) {
          logger.warn('[webhook] subscription.uncanceled missing user_id')
          break
        }
        const fields = extractSubscriptionFields(data)
        const planSlug = getProductPlanSlug(fields.productId) || undefined

        await (admin
          .from('subscriptions' as any) as any)
          .update({
            status: 'active',
            cancel_at_period_end: false,
            ...(planSlug ? { plan_slug: planSlug } : {}),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        logger.info('[webhook] Subscription uncanceled', { userId })
        break
      }

      // ── Subscription Canceled ────────────────────────────────────
      case 'subscription.canceled': {
        if (!userId) {
          throw new Error('No user_id in webhook metadata')
        }
        const fields = extractSubscriptionFields(data)

        await (admin
          .from('subscriptions' as any) as any)
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        logger.info('[webhook] Subscription canceled', {
          userId,
          polarSubId: fields.polarSubscriptionId,
        })
        break
      }

      // ── Subscription Revoked (immediate loss of access) ──────────
      case 'subscription.revoked': {
        if (!userId) {
          throw new Error('No user_id in webhook metadata')
        }

        await (admin
          .from('subscriptions' as any) as any)
          .update({
            status: 'revoked',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)

        logger.info('[webhook] Subscription revoked', { userId })
        break
      }

      // ── Order Created (log only) ─────────────────────────────────
      case 'order.created': {
        logger.info('[webhook] Order created', {
          orderId: data.id,
          userId,
        })
        break
      }

      // ── Checkout Updated ─────────────────────────────────────────
      case 'checkout.updated': {
        const checkoutStatus = data.status as string
        if (checkoutStatus === 'confirmed' && userId) {
          const fields = extractSubscriptionFields(data)
          const planSlug = getProductPlanSlug(fields.productId)

          if (!planSlug) {
            logger.warn('[webhook] checkout.updated — unknown product ID', {
              productId: fields.productId,
            })
            break
          }

          await upsertSubscription(admin, {
            userId,
            polarSubscriptionId: fields.polarSubscriptionId || `checkout-${eventId}`,
            polarCustomerId: fields.polarCustomerId || '',
            planSlug,
            status: 'active',
          })

          await resetCredits(admin, userId)

          logger.info('[webhook] Checkout confirmed → subscription activated', {
            userId,
            planSlug,
          })
        }
        break
      }

      default:
        logger.info('[webhook] Unhandled event type', { type: event.type })
    }

    // 7. Mark event as processed
    await recordEvent(admin, eventId, event.type, event, 'processed')

    return NextResponse.json({ received: true })
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[webhook] Processing failed', {
      eventId,
      type: event.type,
      error: err.message,
    })

    // Mark event as failed
    await recordEvent(admin, eventId, event.type, event, 'failed', err.message)

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
