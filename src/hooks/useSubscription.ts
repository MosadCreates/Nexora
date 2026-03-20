import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { resolveEffectivePlan, EffectivePlan } from '@/lib/accessControl'
import * as Sentry from '@sentry/nextjs'

export interface Subscription {
  id: string
  user_id: string
  polar_subscription_id: string
  polar_customer_id?: string
  plan_slug: string
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

const AUTH_TIMEOUT_MS = 15_000

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan>('hobby')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function fetchSubscription() {
      try {
        // Use a timeout for getUser()
        const getUserPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Auth user fetch timeout (15s)')), AUTH_TIMEOUT_MS)
        );

        const result = await Promise.race([getUserPromise, timeoutPromise]);
        const { data: { user } } = result;
        
        if (!user) {
          if (mounted) setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('id, user_id, polar_subscription_id, polar_customer_id, plan_slug, status, current_period_start, current_period_end, cancel_at_period_end')
          .eq('user_id', user.id)
          .maybeSingle()

        // Fix #5: Actually handle the error
        if (error) {
          Sentry.captureException(error)
          if (mounted) setLoading(false)
          return
        }

        if (mounted && data) {
          setSubscription(data as Subscription)
          setEffectivePlan(resolveEffectivePlan(data))
        }
        if (mounted) setLoading(false)

        // Set up Realtime listener
        channel = supabase
          .channel(`sub_updates_${user.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'subscriptions',
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!mounted) return
              const newSub = payload.new as Subscription
              setSubscription(newSub)
              setEffectivePlan(resolveEffectivePlan(newSub))
            }
          )
          .subscribe()
      } catch (err) {
        Sentry.captureException(err)
        if (mounted) setLoading(false)
      }
    }

    fetchSubscription()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { subscription, effectivePlan, loading }
}
