'use client'

import React from 'react'
import { LoaderTwo } from '@/components/ui/loader'

const LoadingState: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center p-12 space-y-4 min-h-[400px]'>
      <LoaderTwo size='lg' />
      <p className='text-sm font-medium text-neutral-500 animate-pulse'>
        Initializing Intelligence Engine...
      </p>
    </div>
  )
}

export default LoadingState
