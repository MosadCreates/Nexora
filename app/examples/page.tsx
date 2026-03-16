'use client'

import React from 'react'
import ExamplesContent from '@/components/examples/ExamplesContent'
import { NavbarDemo } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useAuth } from '@/context/AuthContext'

export default function ExamplesPage() {
  const { session, profile } = useAuth()

  return (
    <main className="relative min-h-screen">
      <NavbarDemo 
        session={session}
        profile={profile}
      />
      <ExamplesContent />
      <Footer />
    </main>
  )
}
