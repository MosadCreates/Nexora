import React from 'react'
import ExamplesContent from '@/components/examples/ExamplesContent'
import { NavbarDemo } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const revalidate = 86400 // Cache for 24 hours

export default function ExamplesPage() {
  return (
    <main className="relative min-h-screen">
      <NavbarDemo />
      <ExamplesContent />
      <Footer />
    </main>
  )
}
