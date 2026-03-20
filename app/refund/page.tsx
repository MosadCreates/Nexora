import { Metadata } from 'next'
import { Refund } from '@/components/Refund'
import { NavbarDemo } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Refund Policy | Nexora',
  description: 'Nexora refund and cancellation policy for all subscription plans.',
}

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <NavbarDemo />
      <Refund />
      <Footer />
    </main>
  )
}
