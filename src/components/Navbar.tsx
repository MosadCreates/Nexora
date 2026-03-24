'use client'

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/context/ThemeContext'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Sparkles, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function NavbarDemo ({
  session,
  profile,
  hideDashboard,
  credits
}: {
  session?: any
  profile?: any
  hideDashboard?: boolean
  credits?: string | number
}) {
  return (
    <Navbar
      session={session}
      profile={profile}
      hideDashboard={hideDashboard}
      credits={credits}
    />
  )
}

const UserMenu = ({
  session,
  profile,
  isActive
}: {
  session: any
  profile: any
  isActive: (path: string) => boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    window.location.href = '/'
  }

  const initial =
    profile?.full_name?.[0]?.toUpperCase() ||
    session?.user?.email?.[0]?.toUpperCase() ||
    '?'

  return (
    <div className='relative' ref={menuRef}>
      <button
        data-tour="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center p-0.5 rounded-full border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 group relative z-10'
      >
        <div className='w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-blue-500/30 flex items-center justify-center text-neutral-700 dark:text-blue-400 font-bold text-xs relative overflow-hidden shadow-inner'>
          {initial}
          <div className='absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity' />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className='absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl backdrop-blur-xl z-50 overflow-hidden'
          >
            <div className='p-4 border-b border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/50'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-neutral-100 dark:bg-black border border-neutral-200 dark:border-blue-500/30 flex items-center justify-center text-neutral-700 dark:text-blue-400 font-bold text-sm shadow-inner'>
                  {initial}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-bold text-black dark:text-white truncate'>
                    {profile?.full_name || 'Anonymous User'}
                  </p>
                  <p className='text-xs text-neutral-500 truncate'>
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className='p-2'>
              <Link
                href='/profile'
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                  isActive('/profile')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                <User className='w-4 h-4' />
                <span>Profile</span>
              </Link>
              <Link
                href='/pricing'
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                  isActive('/pricing')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
              >
                <Sparkles className='w-4 h-4 text-neutral-900 dark:text-white' />
                <span>Upgrade Plan</span>
              </Link>
            </div>

            <div className='p-2 border-t border-neutral-200 dark:border-neutral-800'>
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors'
              >
                <LogOut className='w-4 h-4' />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Navbar ({
  className,
  session,
  profile,
  hideDashboard,
  credits
}: {
  className?: string
  session?: any
  profile?: any
  hideDashboard?: boolean
  credits?: string | number
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const { session: authSession, profile: authProfile } = useAuth()

  const currentSession = session || authSession
  const currentProfile = profile || authProfile

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => pathname === path

  return (
    <nav
      className={cn(
        'max-w-7xl fixed top-4 mx-auto inset-x-0 z-50 w-[95%] lg:w-full transition-all duration-300',
        className
      )}
      style={{ transform: 'none' }}
    >
      {/* Desktop Navbar */}
      <div className='hidden lg:block w-full'>
        <div
          className={cn(
            'w-full flex relative justify-between px-4 py-2 rounded-full transition duration-200',
            scrolled
              ? 'bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--neutral-100),0px_2px_0px_0px_var(--neutral-100)] dark:shadow-[0px_-2px_0px_0px_var(--neutral-800),0px_2px_0px_0px_var(--neutral-800)]'
              : 'bg-transparent'
          )}
        >
          {scrolled && (
            <div
              className='absolute inset-0 h-full w-full bg-neutral-100 dark:bg-neutral-800 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent,white)] rounded-full'
              style={{ opacity: 1 }}
            />
          )}
          <div className='flex flex-row gap-2 items-center'>
            <Link
              className='font-normal flex space-x-2 items-center text-sm mr-4 text-black px-2 py-1 relative z-20'
              href='/'
            >
              <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm'></div>
              <span className='font-medium text-black dark:text-white'>
                Nexora
              </span>
            </Link>

            <div className='flex items-center gap-1.5'>
              <Link
                className={cn(
                  'flex items-center justify-center text-sm leading-[110%] px-4 py-2 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-neutral-800 hover:text-black transition-colors',
                  isActive('/pricing')
                    ? 'bg-[#F5F5F5] dark:bg-neutral-800 text-black dark:text-white font-medium'
                    : 'text-muted dark:text-muted-dark'
                )}
                href='/pricing'
                prefetch={true}
              >
                Pricing
              </Link>
              <Link
                className={cn(
                  'flex items-center justify-center text-sm leading-[110%] px-4 py-2 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-neutral-800 hover:text-black transition-colors',
                  isActive('/blog')
                    ? 'bg-[#F5F5F5] dark:bg-neutral-800 text-black dark:text-white font-medium'
                    : 'text-muted dark:text-muted-dark'
                )}
                href='/blog'
                prefetch={true}
              >
                Blog
              </Link>

              <Link
                className={cn(
                  'flex items-center justify-center text-sm leading-[110%] px-4 py-2 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-neutral-800 hover:text-black transition-colors',
                  isActive('/contact')
                    ? 'bg-[#F5F5F5] dark:bg-neutral-800 text-black dark:text-white font-medium'
                    : 'text-muted dark:text-muted-dark'
                )}
                href='/contact'
                prefetch={true}
              >
                Contact
              </Link>
            </div>
          </div>

          <div className='flex space-x-2 items-center'>
            <button
              onClick={toggleTheme}
              className='w-10 h-10 flex hover:bg-gray-50 dark:hover:bg-white/[0.1] rounded-lg items-center justify-center outline-none focus:ring-0 focus:outline-none active:ring-0 active:outline-none overflow-hidden'
            >
              <div style={{ opacity: 1, transform: 'none' }}>
                {theme === 'light' ? (
                  <Sun className='h-4 w-4 flex-shrink-0 dark:text-neutral-500 text-neutral-700' />
                ) : (
                  <Moon className='h-4 w-4 flex-shrink-0 dark:text-neutral-500 text-neutral-700' />
                )}
              </div>
              <span className='sr-only'>Toggle theme</span>
            </button>

            {currentSession ? (
              <div className='flex items-center gap-3'>
                {!hideDashboard && (
                  <Link
                    className={cn(
                      'bg-neutral-900 relative z-10 hover:bg-black/90 border border-transparent text-white text-sm md:text-sm transition font-medium duration-200 rounded-full px-4 py-2 flex items-center justify-center shadow-[0px_-1px_0px_0px_#FFFFFF40_inset,_0px_1px_0px_0px_#FFFFFF40_inset]'
                    )}
                    href={pathname === '/analysis' ? '/' : '/analysis'}
                  >
                    {pathname === '/analysis' ? 'Home' : 'Dashboard'}
                  </Link>
                )}
                {credits !== undefined && (
                  <div data-tour="credits-counter" className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold whitespace-nowrap'>
                    <Sparkles className='w-3 h-3' />
                    <span>{credits} Credits</span>
                  </div>
                )}
                <UserMenu
                  session={currentSession}
                  profile={currentProfile}
                  isActive={isActive}
                />
              </div>
            ) : (
              <>
                <Link
                  className={cn(
                    'relative z-10 bg-transparent hover:bg-gray-100 border border-transparent text-black text-sm md:text-sm transition font-medium duration-200 rounded-full px-4 py-2 flex items-center justify-center dark:text-white dark:hover:bg-neutral-800 dark:hover:shadow-xl',
                    isActive('/login') &&
                      'bg-gray-100 dark:bg-neutral-800 font-bold'
                  )}
                  href='/login'
                  prefetch={true}
                >
                  Login
                </Link>
                <Link
                  className={cn(
                    'bg-neutral-900 relative z-10 hover:bg-black/90 border border-transparent text-white text-sm md:text-sm transition font-medium duration-200 rounded-full px-4 py-2 flex items-center justify-center shadow-[0px_-1px_0px_0px_#FFFFFF40_inset,_0px_1px_0px_0px_#FFFFFF40_inset]',
                    isActive('/signup') &&
                      'ring-2 ring-neutral-400 dark:ring-neutral-600'
                  )}
                  href='/signup'
                  prefetch={true}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className='flex h-full w-full items-center lg:hidden'>
        <div
          className={cn(
            'flex justify-between items-center w-full rounded-full px-2.5 py-1.5 transition duration-200',
            scrolled
              ? 'bg-neutral-100 dark:bg-neutral-900 shadow-lg'
              : 'bg-transparent'
          )}
        >
          <Link
            className='font-normal flex space-x-2 items-center text-sm mr-4 text-black px-2 py-1 relative z-20'
            href='/'
          >
            <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm'></div>
            <span className='font-medium text-black dark:text-white'>
              Nexora
            </span>
          </Link>

          <div className='flex items-center gap-2 relative z-20'>
            {currentSession && (
              <>
                {!hideDashboard && (
                  <Link
                    className={cn(
                      'bg-neutral-900 relative z-10 hover:bg-black/90 border border-transparent text-white text-[10px] md:text-xs transition font-medium duration-200 rounded-full px-3 py-1.5 flex items-center justify-center shadow-lg'
                    )}
                    href={pathname === '/analysis' ? '/' : '/analysis'}
                  >
                    {pathname === '/analysis' ? 'Home' : 'Dashboard'}
                  </Link>
                )}
                <UserMenu
                  session={currentSession}
                  profile={currentProfile}
                  isActive={isActive}
                />
              </>
            )}
            <button
              className='text-black dark:text-white p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors'
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                stroke='currentColor'
                fill='currentColor'
                strokeWidth='0'
                viewBox='0 0 512 512'
                className='h-6 w-6'
                height='1em'
                width='1em'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path d='M432 176H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h352c8.8 0 16 7.2 16 16s-7.2 16-16 16zM432 272H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h352c8.8 0 16 7.2 16 16s-7.2 16-16 16zM432 368H80c-8.8 0-16-7.2-16-16s7.2-16 16-16h352c8.8 0 16 7.2 16 16s-7.2 16-16 16z'></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='lg:hidden absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden'
          >
            <div className='flex flex-col gap-2'>
              <Link
                className={cn(
                  'text-sm font-medium p-3 rounded-xl transition-colors',
                  isActive('/pricing')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
                href='/pricing'
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                className={cn(
                  'text-sm font-medium p-3 rounded-xl transition-colors',
                  isActive('/blog')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
                href='/blog'
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>

              <Link
                className={cn(
                  'text-sm font-medium p-3 rounded-xl transition-colors',
                  isActive('/contact')
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                )}
                href='/contact'
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>

              <hr className='my-2 border-neutral-100 dark:border-neutral-800' />

              {!currentSession && (
                <div className='grid grid-cols-2 gap-3 mt-2'>
                  <Link
                    className='text-sm font-medium p-3 rounded-xl text-center border border-neutral-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors dark:text-white'
                    href='/login'
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    className='bg-neutral-900 text-white text-sm font-medium p-3 rounded-xl text-center shadow-lg active:scale-95 transition-transform'
                    href='/signup'
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
