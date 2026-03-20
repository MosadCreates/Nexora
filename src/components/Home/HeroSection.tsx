'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { TextGenerateEffect } from '@/components/ui/aceternity/text-generate-effect'
import Link from 'next/link'
import Image from 'next/image'

interface HeroSectionProps {
  onGetStarted?: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const words = `Analyze any product and discover untapped business opportunities backed by real user feedback from across the web.`

  return (
    <div className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <BackgroundBeams className="opacity-40" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 w-full">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Competitive Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-black dark:text-white mb-8 tracking-tighter leading-tight"
          >
            The Market Has Already Told You <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
              What to Build Next.
            </span>
          </motion.h1>

          <div className="max-w-3xl mx-auto mb-6">
            <TextGenerateEffect words={words} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={onGetStarted}
              className="h-12 px-8 text-lg font-semibold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full"
            >
              Start Researching
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="/examples">
              <Button variant="outline" className="h-12 px-8 text-lg font-semibold border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-full bg-transparent">
                View Examples
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="p-4 border border-neutral-200 bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 rounded-[32px] mt-16 relative w-full max-w-screen-2xl mx-auto"
          >
            <div className="absolute inset-x-0 bottom-0 h-40 w-full bg-gradient-to-b from-transparent via-white to-white dark:via-black/50 dark:to-black scale-[1.1] pointer-events-none"></div>
            <div className="p-2 bg-white dark:bg-black dark:border-neutral-700 border border-neutral-200 rounded-[24px] overflow-hidden">
              <Image 
                src="/header.webp"
                alt="Market Intelligence Dashboard" 
                priority
                width={1920} 
                height={1080} 
                className="rounded-[20px] w-full h-auto object-cover" 
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
