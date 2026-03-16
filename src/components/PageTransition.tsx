'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { LoaderTwo } from './ui/loader'

function TransitionHandler() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  // List of paths that SHOULD show the transition loader
  const HEAVY_ROUTES = ['/analysis', '/report', '/profile']

  useEffect(() => {
    // Check if current route needs a transition loader
    const isHeavyRoute = HEAVY_ROUTES.some(route => pathname.startsWith(route))
    
    if (!isHeavyRoute) {
      setIsLoading(false)
      return
    }

    // Trigger loader ONLY for heavy routes
    setIsLoading(true)
    
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600) // Slightly faster duration for better feel

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return (
    <AnimatePresence mode="wait">
      {isLoading && <LoaderTwo key="global-transition-loader" />}
    </AnimatePresence>
  )
}

export function PageTransition() {
  return (
    <Suspense fallback={null}>
      <TransitionHandler />
    </Suspense>
  )
}
