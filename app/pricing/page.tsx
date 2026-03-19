'use client'

import { NavbarDemo } from '@/components/Navbar'
import PricingCards from '@/components/pricing/PricingCards'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'

export default function PricingPage () {
  const { session } = useAuth()
  const { effectivePlan } = useSubscription()

  return (
    <main className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo session={session} />
      <PricingCards
        currentPlan={effectivePlan}
        userEmail={session?.user?.email}
        userId={session?.user?.id}
        accessToken={session?.access_token ?? null}
      />
      <Footer />
    </main>
  )
}
