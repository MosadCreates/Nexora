import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Simple Plans for Every Team',
  description: 'Start free with 3 competitor analyses. Upgrade to Starter ($49/mo) or Professional ($199/mo) for unlimited market intelligence.',
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
