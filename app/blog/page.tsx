import { NavbarDemo } from '@/components/Navbar'
import { Blog } from '@/components/Blog'
import { Footer } from '@/components/Footer'

export const revalidate = 86400 // Cache for 24 hours

export default function BlogPage () {
  return (
    <main className='min-h-screen bg-white dark:bg-black'>
      <NavbarDemo />
      <Blog />
      <Footer />
    </main>
  )
}
