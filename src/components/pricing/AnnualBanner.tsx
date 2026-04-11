'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X } from 'lucide-react'

export function AnnualBanner() {
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const dismissed = localStorage.getItem('nexora-annual-banner-dismissed')
    if (!dismissed) setVisible(true)
  }, [])
  
  const dismiss = () => {
    localStorage.setItem('nexora-annual-banner-dismissed', 'true')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="max-w-fit mx-auto mb-8 bg-gradient-to-r from-black via-neutral-900 
                     to-black dark:from-white dark:via-neutral-100 
                     dark:to-white text-white dark:text-black 
                     py-2 px-4 pr-10 rounded-full relative shadow-2xl border border-white/20 dark:border-black/10"
        >
          {/* Content */}
          <div className="flex items-center 
                         justify-center gap-2.5 text-sm font-medium">
            <span className="text-base">🎉</span>
            <span>
              Annual plans now available —{' '}
              <span className="font-bold">get 2 months free</span>
            </span>
            <span className="hidden sm:inline">
              (save up to{' '}
              <span className="font-bold text-green-400 
                               dark:text-green-600">
                $99/year
              </span>
              )
            </span>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={dismiss}
            className="absolute right-3 top-1/2 -translate-y-1/2 
                       text-white/60 dark:text-black/60 
                       hover:text-white dark:hover:text-black 
                       transition bg-white/10 dark:bg-black/5 hover:bg-white/20 dark:hover:bg-black/10 p-1 rounded-full"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
