/**
 * LoaderTwo components
 * 
 * WHAT IT DOES:
 * This component acts as the global page transition overlay for the application.
 * It provides a premium, AI-themed full-screen loading state when users navigate between routes.
 * 
 * WHAT IT DOES NOT AFFECT:
 * - This does NOT affect the multi-step AI processing loader used during API calls.
 * - This is strictly for route/page transitions.
 * 
 * CUSTOMIZATION:
 * - Animation Speed: Adjust the `duration` values in the motion configs below.
 * - Accent Color: Change the pulse ring and orb colors (currently using Tailwind primary tokens).
 */

'use client'

import React from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface LoaderTwoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export function LoaderTwo({ size = 'md', className, text }: LoaderTwoProps) {
  const shouldReduceMotion = useReducedMotion()

  // Full-screen overlay config
  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Animation Core Content
  const renderContent = () => (
    <div className="flex flex-col items-center justify-center gap-10">
      {/* Brand Mark (Subtle) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.4, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex items-center gap-2"
      >
        <div className="h-4 w-5 bg-foreground rounded-br-md rounded-tr-xs rounded-tl-md rounded-bl-xs opacity-50" />
        <span className="text-xs font-medium text-foreground tracking-widest uppercase opacity-50">Nexora</span>
      </motion.div>

      {/* AI Animation Core */}
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* SCANNING LINE (Point 2.c) */}
        {!shouldReduceMotion && (
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent z-10"
            animate={{ top: ['20%', '80%', '20%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* NEURAL PULSE CORE (Point 2.a) */}
        <div className="relative">
          {/* Central Orb */}
          <motion.div
            className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            animate={shouldReduceMotion ? {} : { scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          
          {/* Pulse Rings */}
          {!shouldReduceMotion && [0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-blue-500/30"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* ORBITING NODES (Point 2.b) */}
        {!shouldReduceMotion && [0, 1, 2].map((i) => {
          const orbitRadius = 40 + i * 15
          const duration = 3 + i * 1
          return (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
              style={{
                width: 6 - i,
                height: 6 - i,
                offsetPath: `circle(${orbitRadius}px at center)`,
                offsetRotate: "0deg",
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.3, 1],
              }}
              transition={{
                rotate: {
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }
              }}
              custom={orbitRadius}
            />
          )
        })}

        {/* Static centered fallback for Reduced Motion */}
        {shouldReduceMotion && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500/20" />
          </div>
        )}
      </div>

      {/* BRANDING LABEL (Point 3) */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          {text || "Loading Intelligence..."}
        </p>
        <div className="flex gap-1">
           {[0, 1, 2].map(i => (
             <motion.div 
              key={i}
              className="w-1 h-1 rounded-full bg-blue-500/40"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
             />
           ))}
        </div>
      </motion.div>
    </div>
  )

  return (
    <motion.div
      role="status"
      aria-label="Loading page"
      aria-live="polite"
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden",
        "bg-background/80 backdrop-blur-sm dark:bg-background/90 dark:backdrop-blur-md",
        className
      )}
    >
      {renderContent()}
    </motion.div>
  )
}
