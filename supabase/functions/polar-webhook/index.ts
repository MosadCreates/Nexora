import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3"
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0"

// =============================================
// PRODUCT ID → PLAN SLUG MAPPING (primary — new Polar API)
// These are Product IDs from the Polar dashboard
// =============================================
const PRODUCT_TO_PLAN: Record<string, string> = {
  // Starter Monthly
  "764931a3-d475-4cdc-af6a-9e07392dd6f1": "starter",
  // Starter Yearly
  "42d90518-8900-47ef-9e0a-e3ec318814a9": "starter",
  // Professional Monthly
  "dbe9f58f-fca2-4926-b1b9-1572f268ff04": "professional",
  // Professional Yearly
  "bddc5277-1bec-4f9d-8024-0c3b2837a2ac": "professional",
}

// =============================================
// PRICE ID → PLAN SLUG MAPPING (legacy fallback)
// These are Price IDs (not Product IDs) from Polar
// =============================================
const PRICE_TO_PLAN: Record<string, string> = {
  // Starter Monthly
  "70158c7f-6a04-4711-9bb6-09b3fb1c6d89": "starter",
  // Starter Yearly
  "adbf97fe-3c39-4427-b0a5-489b3a075672": "starter",
  // Pro Monthly
  "1182dd74-82b1-4afa-9ec2-03059937e716": "pro",
  // Pro Yearly
  "9f3db653-84be-45d0-ac01-7c40cee29ae7": "pro",
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const body = await req.text()
    const headers = Object.fromEntries(req.headers.entries())

    // 1. Verify webhook signature
    const webhookSecret = Deno.env.get('POLAR_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('[webhook] Critical: POLAR_WEBHOOK_SECRET is not set in Supabase secrets')
      return new Response('Server configuration error: Missing webhook secret', { status: 500 })
    }

    // Standard Webhooks library attempts to base64-decode the secret string.
    // To use a raw string secret, we must base64-encode it first.
    const wh = new Webhook(btoa(webhookSecret))
    
    let event: any
    try {
      // Increase tolerance to 24 hours (86400s) to allow for retries of older events
      event = wh.verify(body, headers, 86400)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Signature verification failed:', msg)
      return new Response(`Invalid signature: ${msg}`, { status: 401 })
    }

    console.log(`[webhook] Received: ${event.type} | event_id: ${event.id}`)

    const eventId = event.id || headers['webhook-id'] || `manual-${Date.now()}`

    // 2. Idempotency — skip already-processed events
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .single()

    if (existingEvent) {
      console.log(`[webhook] Event ${event.id} already processed — skipping`)
      return jsonOk({ message: 'Already processed' })
    }

    // 3. Route by event type
    const payload = event.data

    switch (event.type) {
      // --------------------------------------------------
      // CHECKOUT — log only, never create subscription here
      // --------------------------------------------------
      case 'checkout.created':
      case 'checkout.updated': {
        console.log(`[webhook] Checkout event logged: ${event.type}`)
        break
      }

      // --------------------------------------------------
      // SUBSCRIPTION CREATED — first time upsert
      // --------------------------------------------------
      case 'subscription.created': {
        // CRITICAL: The user_id in metadata might not match the actual Supabase auth.users ID
        // We must look up the real authenticated user by email to avoid foreign key violations
        
        const customerEmail = payload.customer?.email
        if (!customerEmail) {
          console.error('[webhook] subscription.created: No customer email in payload')
          return jsonOk({ message: 'No customer email' })
        }

        // Look up the REAL Supabase auth user by email
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers()
        
        if (authError) {
          console.error('[webhook] Error listing auth users:', authError)
          return new Response(JSON.stringify({ error: 'Auth lookup failed', details: authError.message }), { status: 500 })
        }

        const matchedUser = authUser.users.find(u => u.email?.toLowerCase() === customerEmail.toLowerCase())
        
        if (!matchedUser) {
          console.error(`[webhook] No authenticated user found for email: ${customerEmail}`)
          return jsonOk({ message: `No authenticated user found for ${customerEmail}` })
        }

        const userId = matchedUser.id
        console.log(`[webhook] Matched email ${customerEmail} to auth user ${userId}`)

        const planSlug = resolvePlanSlug(payload)
        const sourceUpdatedAt = payload.modified_at || payload.created_at || new Date().toISOString()

        // Defensive: Ensure profile exists before trying to create subscription
        try {
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

          if (profileCheckError) {
            console.error('[webhook] Error checking profile existence:', profileCheckError)
            return new Response(JSON.stringify({ error: 'Profile check failed', details: profileCheckError.message }), { status: 500 })
          }

          if (!existingProfile) {
            console.error(`[webhook] Profile not found for user ${userId}. Creating profile first...`)
            // Try to create profile if it doesn't exist
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                email: payload.customer?.email || '',
                credits_used: 0
              })
            
            if (createProfileError) {
              console.error('[webhook] Failed to create profile:', createProfileError)
              // Continue anyway - the subscription insert might still work
            } else {
              console.log(`[webhook] Created profile for user ${userId}`)
            }
          }
        } catch (profileError) {
          console.error('[webhook] Unexpected error during profile check:', profileError)
          // Continue anyway - try the subscription upsert
        }

        const subData = {
          user_id: userId,
          polar_subscription_id: payload.id,
          polar_customer_id: payload.customer_id,
          plan_slug: planSlug,
          status: payload.status || 'active',
          current_period_start: payload.current_period_start,
          current_period_end: payload.current_period_end,
          cancel_at_period_end: payload.cancel_at_period_end || false,
          updated_at: new Date().toISOString(),
        }

        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(subData, { onConflict: 'user_id' })

        if (upsertError) {
          console.error('[webhook] Upsert failed on subscription.created:', upsertError)
          console.error('[webhook] Attempted data:', JSON.stringify(subData, null, 2))
          return new Response(JSON.stringify({ error: 'Database error', details: upsertError.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        console.log(`[webhook] Subscription created for user ${userId} → ${planSlug}`)

        // --------------------------------------------------
        // GLOBAL FIX: Sync to profiles table and reset credits
        // --------------------------------------------------
        if (planSlug !== 'free') {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ 
                credits_used: 0
              })
              .eq('id', userId)
            
            if (profileError) {
              console.error('[webhook] Profile update failed on subscription.created:', profileError)
              // Don't fail the webhook - subscription was created successfully
            } else {
              console.log(`[webhook] Profile credits reset for user ${userId}`)
            }
          } catch (err) {
            console.error('[webhook] Unexpected error updating profile:', err)
            // Don't fail the webhook
          }
        }
        break
      }

      // --------------------------------------------------
      // SUBSCRIPTION UPDATED — update fields, ordering protection
      // --------------------------------------------------
      case 'subscription.updated': {
        const subId = payload.id
        const sourceUpdatedAt = payload.modified_at || payload.created_at || new Date().toISOString()

        // Find the subscription row by polar_subscription_id
        const { data: currentSub } = await supabase
          .from('subscriptions')
          .select('user_id') // Removed source_updated_at (column missing)
          .eq('polar_subscription_id', subId)
          .single()

        if (!currentSub) {
          // Might arrive before subscription.created — try metadata or email fallback
          let userId = payload.metadata?.user_id
          
          if (!userId && payload.customer?.email) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', payload.customer.email)
              .maybeSingle()
            if (profile) userId = profile.id
          }

          if (userId) {
            const planSlug = resolvePlanSlug(payload)
            await supabase.from('subscriptions').upsert({
              user_id: userId,
              polar_subscription_id: subId,
              polar_customer_id: payload.customer_id,
              plan_slug: planSlug,
              status: payload.status || 'active',
              current_period_start: payload.current_period_start,
              current_period_end: payload.current_period_end,
              cancel_at_period_end: payload.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' })
            console.log(`[webhook] subscription.updated upserted for user ${userId} (no prior row)`)
          } else {
            console.error(`[webhook] subscription.updated: no row found for polar_sub ${subId} and could not identify user by metadata or email`)
          }
          break
        }

        // Ordering protection — disabled for now (missing source_updated_at column)
        /*
        if (currentSub.source_updated_at && new Date(currentSub.source_updated_at) > new Date(sourceUpdatedAt)) {
          console.log(`[webhook] Skipping out-of-order subscription.updated for polar_sub ${subId}`)
          break
        }
        */

        const planSlug = resolvePlanSlug(payload)

        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_slug: planSlug,
            status: payload.status,
            current_period_start: payload.current_period_start,
            current_period_end: payload.current_period_end,
            cancel_at_period_end: payload.cancel_at_period_end || false,
            // source_updated_at: sourceUpdatedAt, // Table missing this column
            updated_at: new Date().toISOString(),
          })
          .eq('polar_subscription_id', subId)

        if (updateError) {
          console.error('[webhook] Update failed on subscription.updated:', updateError)
          return new Response('Database error', { status: 500 })
        }

        console.log(`[webhook] Subscription updated for polar_sub ${subId} → status: ${payload.status}`)

        // --------------------------------------------------
        // GLOBAL FIX: Sync to profiles table and reset credits if status is active
        // --------------------------------------------------
        if (payload.status === 'active' && planSlug !== 'free') {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
               credits_used: 0,
               // updated_at: new Date().toISOString() // Table missing this column
            })
            .eq('id', currentSub.user_id)
          
          if (profileError) {
            console.error('[webhook] Profile update failed on subscription.updated:', profileError)
          } else {
            console.log(`[webhook] Profile credits reset for user ${currentSub.user_id}`)
          }
        }
        break
      }

      // --------------------------------------------------
      // SUBSCRIPTION CANCELED — mark cancel_at_period_end
      // --------------------------------------------------
      case 'subscription.canceled': {
        const subId = payload.id

        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({
            cancel_at_period_end: true,
            status: payload.status || 'canceled',
            // source_updated_at: payload.modified_at || new Date().toISOString(), // Table missing this column
            updated_at: new Date().toISOString(),
          })
          .eq('polar_subscription_id', subId)

        if (cancelError) {
          console.error('[webhook] Update failed on subscription.canceled:', cancelError)
        }

        console.log(`[webhook] Subscription canceled (at period end) for polar_sub ${subId}`)
        break
      }

      // --------------------------------------------------
      // SUBSCRIPTION REVOKED — immediate loss of access
      // Keep plan_slug intact for historical accuracy
      // --------------------------------------------------
      case 'subscription.revoked': {
        const subId = payload.id

        const { error: revokeError } = await supabase
          .from('subscriptions')
          .update({
            status: 'revoked',
            cancel_at_period_end: false,
            // source_updated_at: payload.modified_at || new Date().toISOString(), // Table missing this column
            updated_at: new Date().toISOString(),
          })
          .eq('polar_subscription_id', subId)

        if (revokeError) {
          console.error('[webhook] Update failed on subscription.revoked:', revokeError)
        }

        console.log(`[webhook] Subscription revoked for polar_sub ${subId} — plan_slug preserved`)
        break
      }

      // --------------------------------------------------
      // SUBSCRIPTION ACTIVE — treat like subscription.updated
      // Polar sends this when a subscription becomes active
      // --------------------------------------------------
      case 'subscription.active': {
        const subId = payload.id
        const planSlug = resolvePlanSlug(payload)

        // Try to find existing row by polar_subscription_id
        const { data: activeSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('polar_subscription_id', subId)
          .single()

        if (activeSub) {
          const { error: activeError } = await supabase
            .from('subscriptions')
            .update({
              plan_slug: planSlug,
              status: 'active',
              current_period_start: payload.current_period_start,
              current_period_end: payload.current_period_end,
              cancel_at_period_end: payload.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('polar_subscription_id', subId)

          if (activeError) {
            console.error('[webhook] Update failed on subscription.active:', activeError)
          } else {
            console.log(`[webhook] Subscription activated for polar_sub ${subId} → ${planSlug}`)
          }

          // Reset credits on activation
          if (planSlug !== 'free') {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({ credits_used: 0 })
              .eq('id', activeSub.user_id)

            if (profileError) {
              console.error('[webhook] Profile update failed on subscription.active:', profileError)
            } else {
              console.log(`[webhook] Profile credits reset for user ${activeSub.user_id}`)
            }
          }
        } else {
          console.log(`[webhook] subscription.active: no existing row for polar_sub ${subId} — skipping (subscription.created should handle it)`)
        }
        break
      }

      // --------------------------------------------------
      // ORDER events — log only
      // --------------------------------------------------
      case 'order.created':
      case 'order.paid': {
        console.log(`[webhook] Order event logged: ${event.type}`)
        break
      }

      // --------------------------------------------------
      // CUSTOMER events — log only
      // --------------------------------------------------
      case 'customer.created':
      case 'customer.state_changed':
      case 'customer.updated': {
        console.log(`[webhook] Customer event logged: ${event.type}`)
        break
      }

      default: {
        console.log(`[webhook] Unhandled event type: ${event.type}`)
      }
    }

    // 4. Log event for auditability + idempotency
    try {
      const { error: logError } = await supabase.from('webhook_events').insert({
        event_id: eventId,
        event_type: event.type,
        payload: event,
      })
      if (logError) console.error('[webhook] Event logging failed:', logError)
    } catch (e) {
      console.error('[webhook] Critical error logging event:', e)
    }

    return jsonOk({ message: 'Success' })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : ''
    console.error(`[webhook] Unhandled error: ${errorMsg}`, errorStack)
    return new Response(`Internal error: ${errorMsg}`, { status: 500 })
  }
})

// =============================================
// HELPERS
// =============================================

function resolvePlanSlug(payload: any): string {
  // 1. Try product_id directly (new Polar API — most reliable)
  if (payload.product_id && PRODUCT_TO_PLAN[payload.product_id]) {
    console.log(`[webhook] Plan resolved from product_id: ${payload.product_id} → ${PRODUCT_TO_PLAN[payload.product_id]}`)
    return PRODUCT_TO_PLAN[payload.product_id]
  }

  // 2. Try product.id (nested product object)
  if (payload.product?.id && PRODUCT_TO_PLAN[payload.product.id]) {
    console.log(`[webhook] Plan resolved from product.id: ${payload.product.id} → ${PRODUCT_TO_PLAN[payload.product.id]}`)
    return PRODUCT_TO_PLAN[payload.product.id]
  }

  // 3. Try legacy price_id (deprecated but might still be present)
  if (payload.price_id && PRICE_TO_PLAN[payload.price_id]) {
    console.log(`[webhook] Plan resolved from legacy price_id: ${payload.price_id} → ${PRICE_TO_PLAN[payload.price_id]}`)
    return PRICE_TO_PLAN[payload.price_id]
  }

  // 4. Try prices array
  if (payload.prices && Array.isArray(payload.prices)) {
    for (const price of payload.prices) {
      const id = price.id || price.price_id
      if (id && PRICE_TO_PLAN[id]) {
        console.log(`[webhook] Plan resolved from prices array: ${id} → ${PRICE_TO_PLAN[id]}`)
        return PRICE_TO_PLAN[id]
      }
      // Also check product_id inside each price item
      if (price.product_id && PRODUCT_TO_PLAN[price.product_id]) {
        console.log(`[webhook] Plan resolved from prices[].product_id: ${price.product_id} → ${PRODUCT_TO_PLAN[price.product_id]}`)
        return PRODUCT_TO_PLAN[price.product_id]
      }
    }
  }

  // 5. Try product.prices
  if (payload.product?.prices && Array.isArray(payload.product.prices)) {
    for (const price of payload.product.prices) {
      const id = price.id || price.price_id
      if (id && PRICE_TO_PLAN[id]) {
        console.log(`[webhook] Plan resolved from product.prices: ${id} → ${PRICE_TO_PLAN[id]}`)
        return PRICE_TO_PLAN[id]
      }
    }
  }

  // 6. Last resort: try product name matching
  const productName = (payload.product?.name || '').toLowerCase()
  if (productName.includes('starter')) {
    console.log(`[webhook] Plan resolved from product name: "${payload.product.name}" → starter`)
    return 'starter'
  }
  if (productName.includes('pro') || productName.includes('professional')) {
    console.log(`[webhook] Plan resolved from product name: "${payload.product.name}" → professional`)
    return 'professional'
  }
  if (productName.includes('enterprise')) {
    console.log(`[webhook] Plan resolved from product name: "${payload.product.name}" → enterprise`)
    return 'enterprise'
  }

  // Log everything we can to debug
  console.warn(`[webhook] Could not resolve plan_slug! Payload keys: ${Object.keys(payload).join(', ')}`)
  console.warn(`[webhook] product_id: ${payload.product_id}, product.id: ${payload.product?.id}, price_id: ${payload.price_id}`)
  console.warn(`[webhook] product.name: ${payload.product?.name}`)
  if (payload.prices) console.warn(`[webhook] prices: ${JSON.stringify(payload.prices.map((p: any) => ({ id: p.id, product_id: p.product_id })))}`)
  return 'free'
}

function jsonOk(data: Record<string, any>) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
