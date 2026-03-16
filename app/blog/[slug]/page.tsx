'use client'

import { NavbarDemo } from '@/components/Navbar'
import BlogPost from '@/components/BlogPost'
import { Footer } from '@/components/Footer'

export default function BlogPostPage () {
  return (
    <main className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo />
      <BlogPost />
      <Footer />
    </main>
  )
}
