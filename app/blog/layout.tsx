import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Market Intelligence Insights',
  description: 'Competitor analysis strategies, market intelligence tips, and product updates from the Nexora team.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
