'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if not already accepted
    const consent = localStorage.getItem('nexora-cookie-consent')
    if (!consent) {
      // Small delay to prevent layout shift
      setTimeout(() => setVisible(true), 1000)
    }
  }, [])

  const accept = () => {
    localStorage.setItem('nexora-cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('nexora-cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 p-4 
                    md:bottom-4 md:left-4 md:right-auto md:max-w-md'>
      <div className='bg-white dark:bg-neutral-900 rounded-2xl 
                      border border-neutral-200 dark:border-neutral-800 
                      shadow-2xl p-5'>
        <p className='text-sm font-semibold text-neutral-900 
                      dark:text-white mb-2'>
          🍪 Cookie Notice
        </p>
        <p className='text-xs text-neutral-600 dark:text-neutral-400 mb-4 
                      leading-relaxed'>
          We use essential cookies to keep you logged in and make the 
          app work. We don&apos;t use tracking or advertising cookies.{' '}
          <Link 
            href='/privacy' 
            className='underline hover:text-neutral-900 
                       dark:hover:text-white transition'
          >
            Learn more
          </Link>
        </p>
        <div className='flex gap-2'>
          <button
            onClick={accept}
            className='flex-1 px-3 py-2 bg-black dark:bg-white 
                       text-white dark:text-black rounded-lg text-xs 
                       font-medium hover:opacity-80 transition'
          >
            Accept
          </button>
          <button
            onClick={decline}
            className='flex-1 px-3 py-2 border border-neutral-300 
                       dark:border-neutral-700 text-neutral-700 
                       dark:text-neutral-300 rounded-lg text-xs 
                       font-medium hover:bg-neutral-50 
                       dark:hover:bg-neutral-800 transition'
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
