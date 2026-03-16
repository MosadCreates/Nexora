'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, TrendingUp, Zap, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import { MetricTooltip } from '@/components/dashboard/MetricTooltip'

export const DashboardHero: React.FC = () => {
  const words = `Harness autonomous intelligence to decode complex market dynamics and architect your next competitive advantage with data-driven precision.`

  return (
    <div className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <BackgroundBeams className="opacity-40" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-8 tracking-tight pt-8"
          >
            Strategic Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">Synthesis</span>
          </motion.h1>

          <div className="max-w-3xl mx-auto mb-10">
            <TextGenerateEffect words={words} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400" />
            <div className='flex justify-center mt-16 mb-8'>
              <MetricTooltip />
            </div>
          </div>

          {/* Stats / Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-neutral-200 dark:border-neutral-800 pt-12"
          >
            <div>
              <div className="text-3xl font-bold text-black dark:text-white mb-1">10M+</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Reviews Analyzed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black dark:text-white mb-1">50k+</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Gaps Identified</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black dark:text-white mb-1">99.9%</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Data Accuracy</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-black dark:text-white mb-1">24/7</div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Live Monitoring</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
