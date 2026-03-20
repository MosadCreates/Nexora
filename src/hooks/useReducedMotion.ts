import { useState, useEffect } from 'react'

export function useReducedMotion() {
  const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setShouldReduceMotion(mediaQuery.matches)
    
    const handleRecalculate = (event: MediaQueryListEvent) => setShouldReduceMotion(event.matches);
    mediaQuery.addEventListener('change', handleRecalculate)
    return () => mediaQuery.removeEventListener('change', handleRecalculate)
  }, [])
  
  return shouldReduceMotion
}
