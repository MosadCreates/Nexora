import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/logger'

export async function DELETE(req: NextRequest) {
  try {
    // 1. Verify the user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Cancel any active Polar subscription first
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('polar_subscription_id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (subscription?.polar_subscription_id) {
      try {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 15_000)
        
        await fetch(
          `https://api.polar.sh/v1/subscriptions/${subscription.polar_subscription_id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${process.env.POLAR_ORGANIZATION_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cancel_at_period_end: true }),
            signal: controller.signal,
          }
        )
      } catch (err) {
        // Log but don't block deletion
        logger.warn('[account/delete] Could not cancel Polar subscription', {
          subscriptionId: subscription.polar_subscription_id
        })
      }
    }

    // 3. Delete the user from Supabase Auth
    // This CASCADE deletes: profiles, subscriptions, analysis_history
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (deleteError) {
      Sentry.captureException(deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
        { status: 500 }
      )
    }

    logger.info('[account/delete] Account deleted', { userId: user.id })
    return NextResponse.json({ success: true })

  } catch (err) {
    Sentry.captureException(err)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}
