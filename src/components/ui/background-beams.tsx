'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const rows = 12
  const cols = 15
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className={cn('absolute inset-0 h-full w-full bg-white dark:bg-black', className)} />

  return (
    <div
      className={cn(
        'absolute inset-0 h-full w-full pointer-events-none z-0 overflow-hidden',
        className
      )}
    >
      <div className='absolute inset-0 h-full w-full bg-white dark:bg-black pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent,white)]' />

      <div className='relative flex flex-col items-center justify-center h-full'>
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className='flex'>
            {[...Array(cols)].map((_, colIndex) => (
              <div
                key={colIndex}
                className='flex flex-col items-start justify-center w-60 h-40 relative'
              >
                <div className='flex items-center justify-center'>
                  {/* The Dot */}
                  <div className='h-6 w-6 bg-white dark:bg-black flex items-center justify-center rounded-full z-10'>
                    <div className='h-2 w-2 bg-neutral-100 dark:bg-neutral-800 rounded-full opacity-30' />
                  </div>

                  {/* Horizontal Line */}
                  <svg
                    width='300'
                    height='1'
                    viewBox='0 0 300 1'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                    className='text-neutral-50/20 dark:text-neutral-900/10 -ml-[1px]'
                  >
                    <path d='M0.5 0.5H479' stroke='currentColor' />
                    <motion.path
                      d='M0.5 0.5H479'
                      stroke={`url(#gradient-h-${rowIndex}-${colIndex})`}
                      strokeWidth='1'
                    />
                    <defs>
                      <motion.linearGradient
                        id={`gradient-h-${rowIndex}-${colIndex}`}
                        gradientUnits='userSpaceOnUse'
                        initial={{ x1: -500, x2: -300 }}
                        animate={{ x1: 1000, x2: 1200 }}
                        transition={{
                          duration: Math.random() * 2 + 2,
                          repeat: Infinity,
                          ease: 'linear',
                          delay: Math.random() * 2
                        }}
                      >
                        <stop offset='0%' stopColor='transparent' />
                        <stop
                          offset='50%'
                          stopColor='#3B82F6'
                          stopOpacity='0.3'
                        />
                        <stop offset='100%' stopColor='transparent' />
                      </motion.linearGradient>
                    </defs>
                  </svg>
                </div>

                {/* Vertical Line */}
                <svg
                  width='1'
                  height='140'
                  viewBox='0 0 1 140'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                  className='text-neutral-50/20 dark:text-neutral-900/10 ml-3'
                >
                  <path
                    d='M0.5 0.5V479'
                    stroke='currentColor'
                    strokeWidth='0.5'
                  />
                  <motion.path
                    d='M0.5 0.5V479'
                    stroke={`url(#gradient-v-${rowIndex}-${colIndex})`}
                    strokeWidth='1'
                  />
                  <defs>
                    <motion.linearGradient
                      id={`gradient-v-${rowIndex}-${colIndex}`}
                      gradientUnits='userSpaceOnUse'
                      initial={{ y1: -500, y2: -300 }}
                      animate={{ y1: 500, y2: 700 }}
                      transition={{
                        duration: Math.random() * 2 + 2,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 2
                      }}
                    >
                      <stop offset='0%' stopColor='transparent' />
                      <stop
                        offset='50%'
                        stopColor='#3B82F6'
                        stopOpacity='0.3'
                      />
                      <stop offset='100%' stopColor='transparent' />
                    </motion.linearGradient>
                  </defs>
                </svg>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
