import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Get in Touch',
  description: 'Have a question about Nexora? Contact our team for support, partnerships, or enterprise inquiries.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
