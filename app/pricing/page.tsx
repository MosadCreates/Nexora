import { NavbarDemo } from '@/components/Navbar'
import PricingCards from '@/components/pricing/PricingCards'
import { Footer } from '@/components/Footer'

export const revalidate = 86400 // Cache for 24 hours

export default function PricingPage () {
  return (
    <main className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo />
      <PricingCards />
      <Footer />
    </main>
  )
}
