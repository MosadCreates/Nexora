'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { useTour } from '@/hooks/useTour'
import { TOUR_STEPS } from '@/lib/tourSteps'
import { TourCard } from './TourCard'
import { TourArrow } from './TourArrow'

export function TourOverlay() {
  const { currentStep, isActive, nextStep, skipTour, totalSteps } = useTour()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const hasScrolledForStep = useRef<number>(-1)

  const step = TOUR_STEPS[currentStep]

  // Handle page redirection
  useEffect(() => {
    if (isActive && step) {
      if (step.page !== 'any' && pathname !== step.page) {
        router.push(step.page)
      }
    }
  }, [isActive, step, pathname, router])

  // Track window size and mounting
  useEffect(() => {
    setMounted(true)
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Find target element and track its position
  const updateTargetRect = useCallback(() => {
    if (!step?.targetSelector) {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(step.targetSelector)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
      
      // Auto-scroll to target once per step
      if (hasScrolledForStep.current !== currentStep) {
        hasScrolledForStep.current = currentStep
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
      }
    } else {
      setTargetRect(null)
      // If we are on a step that has a target but we can't find it, we might want to skip this step?
      // Or it might be loading. Let's just set null and wait.
    }
  }, [step, currentStep])

  useEffect(() => {
    if (isActive) {
      updateTargetRect()
      // Setup observers to track movement/scrolling
      window.addEventListener('scroll', updateTargetRect, true)
      
      const observer = new MutationObserver(updateTargetRect)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true })
      
      // Also poll slightly just in case animations are changing layout
      const intervalId = setInterval(updateTargetRect, 500)
      
      return () => {
        window.removeEventListener('scroll', updateTargetRect, true)
        observer.disconnect()
        clearInterval(intervalId)
      }
    }
  }, [isActive, updateTargetRect])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        skipTour()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isActive, skipTour])

  if (!mounted || !isActive || !step) return null

  // Mobile fallback
  if (windowSize.width < 768) {
    return createPortal(
      <div className="fixed bottom-4 left-4 right-4 z-[10000] 
                      bg-black dark:bg-white text-white dark:text-black 
                      rounded-2xl p-4 shadow-2xl">
        <p className="font-semibold text-sm mb-1">
          Welcome to Nexora! 👋
        </p>
        <p className="text-xs opacity-70">
          Type a competitor name on the analysis page to run your first analysis.
        </p>
        <button 
          onClick={skipTour}
          className="text-xs opacity-50 mt-2 underline block cursor-pointer hover:opacity-100 transition-opacity"
        >
          Got it
        </button>
      </div>,
      document.body
    )
  }

  // Calculate Spotlight style
  let spotlightStyle = {}
  let highlightStyle = {}
  
  if (targetRect) {
    const centerX = targetRect.left + targetRect.width / 2
    const centerY = targetRect.top + targetRect.height / 2
    
    spotlightStyle = {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      background: `radial-gradient(
        ellipse ${targetRect.width / 2 + 30}px ${targetRect.height / 2 + 30}px at ${centerX}px ${centerY}px,
        transparent 0%,
        transparent 80%,
        rgba(0,0,0,0.75) 100%
      )`,
      zIndex: 9998,
      pointerEvents: 'none' as const,
      transition: 'background 0.3s ease-in-out'
    }

    highlightStyle = {
      position: 'fixed' as const,
      top: targetRect.top - 8,
      left: targetRect.left - 8,
      width: targetRect.width + 16,
      height: targetRect.height + 16,
      border: '2px solid rgba(255,255,255,0.8)',
      borderRadius: '12px',
      boxShadow: '0 0 0 4px rgba(255,255,255,0.1), 0 0 30px rgba(255,255,255,0.2)',
      zIndex: 9999,
      pointerEvents: 'none' as const,
      transition: 'all 0.3s ease-in-out'
    }
  } else {
    // If no target, just a dark overlay (like step 1)
    spotlightStyle = {
      position: 'fixed' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.75)',
      zIndex: 9998,
      pointerEvents: 'none' as const,
      transition: 'background 0.3s ease-in-out'
    }
  }

  // Calculate Card & Arrow position
  let cardX = windowSize.width / 2 - 160 // Center by default
  let cardY = windowSize.height / 2 - 100
  let arrowDirection = step.arrowDirection
  let arrowX = 0
  let arrowY = 0
  const showArrow = targetRect && arrowDirection

  if (targetRect && arrowDirection) {
    const spaceX = 320 // card width ~320
    const spaceY = 250 // card height roughly
    const offset = 60 // distance from target

    switch (arrowDirection) {
      case 'up':
        cardY = targetRect.bottom + offset
        cardX = targetRect.left + (targetRect.width / 2) - (spaceX / 2)
        arrowY = cardY - 48
        arrowX = targetRect.left + (targetRect.width / 2) - 24
        if (cardY + spaceY > windowSize.height) arrowDirection = 'down'
        break
      case 'down':
        cardY = targetRect.top - spaceY - offset
        cardX = targetRect.left + (targetRect.width / 2) - (spaceX / 2)
        arrowY = targetRect.top - 48
        arrowX = targetRect.left + (targetRect.width / 2) - 24
        if (cardY < 0) arrowDirection = 'up'
        break
      case 'left':
        cardX = targetRect.right + offset
        cardY = targetRect.top + (targetRect.height / 2) - (spaceY / 2)
        arrowX = targetRect.right + 12
        arrowY = targetRect.top + (targetRect.height / 2) - 24
        if (cardX + spaceX > windowSize.width) arrowDirection = 'right'
        break
      case 'right':
        cardX = targetRect.left - spaceX - offset
        cardY = targetRect.top + (targetRect.height / 2) - (spaceY / 2)
        arrowX = targetRect.left - 48 - 12
        arrowY = targetRect.top + (targetRect.height / 2) - 24
        if (cardX < 0) arrowDirection = 'left'
        break
    }

    // Keep card within viewport horizontally
    if (cardX < 20) cardX = 20
    if (cardX + 320 > windowSize.width - 20) cardX = windowSize.width - 340
    
    // Recalculate if we flipped
    if (arrowDirection === 'up' && step.arrowDirection !== 'up') {
      cardY = targetRect.bottom + offset
      arrowY = cardY - 48
    } else if (arrowDirection === 'down' && step.arrowDirection !== 'down') {
      cardY = targetRect.top - spaceY - offset
      arrowY = targetRect.top - 48
    } else if (arrowDirection === 'left' && step.arrowDirection !== 'left') {
      cardX = targetRect.right + offset
      arrowX = targetRect.right + 12
    } else if (arrowDirection === 'right' && step.arrowDirection !== 'right') {
      cardX = targetRect.left - spaceX - offset
      arrowX = targetRect.left - 48 - 12
    }
    
    // Keep card within viewport vertically
    if (cardY < 20) cardY = 20
    if (cardY + spaceY > windowSize.height - 20) cardY = windowSize.height - spaceY - 20
  }

  return createPortal(
    <>
      <div 
        style={spotlightStyle} 
        aria-hidden="true" 
      />
      {targetRect && (
        <div 
          style={highlightStyle}
          aria-hidden="true"
        />
      )}

      {/* Background click to skip outside spotlight (though we'd need to intercept clicks) */}
      <div 
        className="fixed inset-0 z-[9997]" 
        onClick={(e) => {
          // Verify we aren't clicking inside target bounds
          if (targetRect) {
            const isInsideTarget = 
              e.clientX >= targetRect.left &&
              e.clientX <= targetRect.right &&
              e.clientY >= targetRect.top &&
              e.clientY <= targetRect.bottom;
            if (isInsideTarget) return; // allow clicking the actual target
          }
          skipTour()
        }}
        aria-hidden="true"
        style={{ pointerEvents: targetRect ? 'auto' : 'none' }} // Only catch clicks outside target
      />

      <TourCard
        step={step}
        currentStep={currentStep}
        totalSteps={totalSteps}
        nextStep={nextStep}
        skipTour={skipTour}
        cardX={cardX}
        cardY={cardY}
      />

      {showArrow && (
        <div 
          className="fixed z-[10000] pointer-events-none transition-all duration-300"
          style={{ top: arrowY, left: arrowX }}
        >
          <TourArrow direction={arrowDirection!} />
        </div>
      )}
    </>,
    document.body
  )
}
