import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { TOUR_STEPS } from '@/lib/tourSteps'

export function useTour() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const { profile } = useAuth()

  // Load persisted step if any
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStep = localStorage.getItem('nexora-tour-step')
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10))
      }
    }
  }, [])

  // Check if tour should auto-start for new users
  useEffect(() => {
    if (typeof window === 'undefined') return

    const completed = localStorage.getItem('nexora-tour-completed')
    if (!completed && profile && !profile.tour_completed) {
      // Small delay to let the page render first
      const timer = setTimeout(() => setIsActive(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [profile])

  const completeTour = async () => {
    setIsActive(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexora-tour-completed', 'true')
      localStorage.removeItem('nexora-tour-step')
    }
    
    // Save to Supabase
    if (profile) {
      await supabase
        .from('profiles')
        .update({ tour_completed: true })
        .eq('id', profile.id)
    }
    
    // Trigger confetti
    try {
      const { default: confetti } = await import('canvas-confetti')
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 100000
      })
    } catch (e) {
      console.error('Confetti failed to load', e)
    }
  }

  const skipTour = async () => {
    setIsActive(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexora-tour-completed', 'true')
      localStorage.removeItem('nexora-tour-step')
    }
    if (profile) {
      await supabase
        .from('profiles')
        .update({ tour_completed: true })
        .eq('id', profile.id)
    }
  }

  return {
    currentStep,
    isActive,
    startTour: () => { 
      setCurrentStep(0)
      setIsActive(true) 
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexora-tour-step', '0')
        localStorage.removeItem('nexora-tour-completed')
      }
    },
    nextStep: () => {
      if (currentStep < TOUR_STEPS.length - 1) {
        setCurrentStep(prev => {
          const next = prev + 1
          if (typeof window !== 'undefined') localStorage.setItem('nexora-tour-step', next.toString())
          return next
        })
      } else {
        completeTour()
      }
    },
    skipTour,
    completeTour,
    totalSteps: TOUR_STEPS.length,
  }
}
