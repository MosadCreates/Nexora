import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'

export const Noise = ({
  className
}: {
  className?: string
}) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full transform-gpu pointer-events-none opacity-[0.03] dark:opacity-[0.05]",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}
    ></div>
  );
};

export const NoiseBackground = ({
  children,
  className,
  containerClassName,
  gradientColors = [
    'rgb(255, 100, 150)',
    'rgb(100, 150, 255)',
    'rgb(255, 200, 100)'
  ]
}: {
  children?: ReactNode
  className?: string
  containerClassName?: string
  gradientColors?: string[]
}) => {
  return (
    <div className={cn('relative group', containerClassName)}>
      <div className='absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500' />
      <div className={cn('relative rounded-full', className)}>{children}</div>
    </div>
  )
}
