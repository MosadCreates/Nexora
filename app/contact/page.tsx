'use client'

import { NavbarDemo } from '@/components/Navbar'
import { Contact } from '@/components/Contact'
import { Footer } from '@/components/Footer'

export default function ContactPage () {
  return (
    <main className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo />
      <Contact />
      <Footer />
    </main>
  )
}
