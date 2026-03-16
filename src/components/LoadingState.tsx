'use client'
import React from 'react'
import { LoaderTwo } from './ui/loader'

interface LoadingStateProps {
  message?: string
  step?: any // For compatibility with analysis LoadingState if needed
}

export function LoadingState({ message = 'Loading...', step }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full bg-black">
      <LoaderTwo size="lg" text={message} />
    </div>
  )
}

export default LoadingState
