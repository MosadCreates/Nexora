'use client'

import React from 'react'
import { BackgroundBeams } from '../ui/aceternity/background-beams'
import { Noise } from '../ui/noise-background'

interface CTASectionProps {
  onAction?: () => void
  authenticated?: boolean
}

export function CTASection ({
  onAction,
  authenticated = false
}: CTASectionProps) {
  return (
    <div className='py-20 w-full relative group overflow-hidden bg-white dark:bg-black'>
      <BackgroundBeams className='absolute inset-0 w-full h-full z-0' />
      <div className='max-w-7xl mx-auto px-4 w-full relative z-20'>
        <div className='relative w-full h-auto min-h-[20rem] md:h-96 rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center p-6 md:p-8 z-30 border border-white/5'>
          <Noise />

          <div className='relative z-20 flex flex-col items-center justify-center text-center max-w-2xl mx-auto'>
            <h2 className='text-2xl md:text-6xl font-bold text-white mb-6 tracking-tighter'>
              Ready to find the next big gap?
            </h2>
            <p className='text-neutral-400 text-base md:text-xl mb-8 md:mb-10 max-w-lg mx-auto font-medium'>
              Join hundreds of founders using Nexora to outsmart the competition with AI intelligence.
            </p>
            <button
              onClick={onAction}
              className='bg-white hover:bg-neutral-200 text-black font-bold py-4 px-10 rounded-full transition-all duration-300 z-30 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95'
            >
              {authenticated ? 'Open Dashboard' : 'Get Started Now'}
            </button>
          </div>

          {/* Subtle grid pattern for extra texture */}
          <div className='absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-10' />
        </div>
      </div>
    </div>
  )
}
