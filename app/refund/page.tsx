import { Metadata } from 'next'
import { Refund } from '@/components/Refund'

export const metadata: Metadata = {
  title: 'Refund Policy | Nexora',
  description: 'Nexora refund and cancellation policy for all subscription plans.',
}

export default function RefundPage() {
  return <Refund />
}
