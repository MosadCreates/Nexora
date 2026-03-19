import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase' // Adjust path if needed
import { resolveEffectivePlan, EffectivePlan } from '@/lib/accessControl'

export interface Subscription {
  id: string
  user_id: string
  polar_subscription_id: string
  polar_customer_id?: string
  plan_slug: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [effectivePlan, setEffectivePlan] = useState<EffectivePlan>('hobby')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let channel: any = null

    async function fetchSubscription() {
      try {
        // Use a timeout for getUser() - increased to 15s for better resilience
        const getUserPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth user fetch timeout (15s)')), 15000)
        );

        const result = await Promise.race([getUserPromise, timeoutPromise]);
        const { data: { user } } = result as any;
        
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (data) {
          setSubscription(data)
          setEffectivePlan(resolveEffectivePlan(data))
        }
        setLoading(false)

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
        console.error('Subscription fetch error:', err)
        setLoading(false)
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
