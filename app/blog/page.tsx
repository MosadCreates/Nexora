'use client'

import { NavbarDemo } from '@/components/Navbar'
import { Blog } from '@/components/Blog'
import { Footer } from '@/components/Footer'

export default function BlogPage () {
  return (
    <main className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo />
      <Blog />
      <Footer />
    </main>
  )
}
