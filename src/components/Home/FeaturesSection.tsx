'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CardSpotlight } from '@/components/ui/aceternity/card-spotlight'
import { EncryptedText } from '@/components/ui/aceternity/encrypted-text'
import {
  Brain,
  Target,
  BarChart,
  Activity,
  FileText,
  Layers
} from 'lucide-react'

const features = [
  {
    title: 'AI-Powered Deep Research',
    description:
      "Analyze thousands of data points to uncover your competitors' hidden weaknesses and untapped opportunities — instantly.",
    icon: Brain,
    accentColor: 'blue'
  },
  {
    title: 'Competitive Gap Analysis',
    description:
      'Identify market gaps your competitors have overlooked, with prioritized opportunity scoring backed by real user feedback.',
    icon: Target,
    accentColor: 'cyan'
  },
  {
    title: 'Sentiment Intelligence',
    description:
      'Decode what users truly think about competing products through AI-driven sentiment analysis across reviews, forums, and social.',
    icon: BarChart,
    accentColor: 'indigo'
  },
  {
    title: 'Real-time Monitoring',
    description:
      'Stay ahead with live tracking of competitor launches, pricing shifts, and market movements as they happen.',
    icon: Activity,
    accentColor: 'emerald'
  },
  {
    title: 'Visual Report Generation',
    description:
      'Transform complex data into compelling visual reports and opportunity matrices you can share with stakeholders.',
    icon: FileText,
    accentColor: 'violet'
  },
  {
    title: 'Multi-Source Data Fusion',
    description:
      'Aggregate intelligence from social platforms, review sites, news feeds, and public filings into one unified view.',
    icon: Layers,
    accentColor: 'sky'
  }
]

const accentMap: Record<
  string,
  { ring: string; glow: string; dot: string; iconText: string }
> = {
  blue: {
    ring: 'border-blue-500/30 group-hover/card:border-blue-500/60',
    glow: 'bg-blue-500/10 group-hover/card:bg-blue-500/20',
    dot: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]',
    iconText: 'text-blue-400'
  },
  cyan: {
    ring: 'border-cyan-500/30 group-hover/card:border-cyan-500/60',
    glow: 'bg-cyan-500/10 group-hover/card:bg-cyan-500/20',
    dot: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    iconText: 'text-cyan-400'
  },
  indigo: {
    ring: 'border-indigo-500/30 group-hover/card:border-indigo-500/60',
    glow: 'bg-indigo-500/10 group-hover/card:bg-indigo-500/20',
    dot: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]',
    iconText: 'text-indigo-400'
  },
  emerald: {
    ring: 'border-emerald-500/30 group-hover/card:border-emerald-500/60',
    glow: 'bg-emerald-500/10 group-hover/card:bg-emerald-500/20',
    dot: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    iconText: 'text-emerald-400'
  },
  violet: {
    ring: 'border-violet-500/30 group-hover/card:border-violet-500/60',
    glow: 'bg-violet-500/10 group-hover/card:bg-violet-500/20',
    dot: 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]',
    iconText: 'text-violet-400'
  },
  sky: {
    ring: 'border-sky-500/30 group-hover/card:border-sky-500/60',
    glow: 'bg-sky-500/10 group-hover/card:bg-sky-500/20',
    dot: 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.6)]',
    iconText: 'text-sky-400'
  }
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.21, 0.45, 0.32, 0.9] as [number, number, number, number]
    }
  }
}

export function FeaturesSection () {
  return (
    <div className='relative bg-white dark:bg-black py-28 overflow-hidden'>
      {/* Dot-grid background */}
      <div
        className='absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]'
        style={{
          backgroundImage:
            'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Radial blue glow at center */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none'>
        <div className='w-full h-full rounded-full bg-blue-500/[0.04] dark:bg-blue-500/[0.07] blur-[120px]' />
      </div>

      {/* Content */}
      <div className='relative z-10 max-w-7xl mx-auto px-4'>
        {/* Section header */}
        <div className='text-center space-y-6 mb-20'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium'
          >
            <div className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
            Powered by AI
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-black to-neutral-600 dark:from-white dark:to-neutral-500'
          >
            Elite Market Intelligence
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className='text-lg md:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed'
          >
            Uncover what your competitors are missing. Nexora uses advanced AI
            to turn raw market noise into actionable business advantages.
          </motion.p>
        </div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true, amount: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
        >
          {features.map((feature) => {
            const accent = accentMap[feature.accentColor] || accentMap.blue!
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={cardVariants}>
                <CardSpotlight
                  className={cn(
                    'relative rounded-2xl border border-neutral-200/60 dark:border-white/[0.06]',
                    'bg-neutral-50/80 dark:bg-[#0a0a0a]/60 backdrop-blur-xl',
                    'p-0 h-full',
                    'hover:border-neutral-300/80 dark:hover:border-white/[0.12]',
                    'transition-all duration-500',
                    'group/card'
                  )}
                  color='rgba(59, 130, 246, 0.08)'
                  radius={250}
                >
                  <div className='p-8 flex flex-col h-full relative z-10'>
                    {/* Icon */}
                    <div className='mb-6'>
                      <div
                        className={cn(
                          'relative h-12 w-12 rounded-xl border flex items-center justify-center',
                          'transition-all duration-500',
                          accent.ring,
                          accent.glow
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-5 h-5 transition-colors duration-500',
                            accent.iconText
                          )}
                          strokeWidth={1.8}
                        />
                        {/* Tiny dot indicator */}
                        <div
                          className={cn(
                            'absolute -top-1 -right-1 w-2 h-2 rounded-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500',
                            accent.dot
                          )}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className='text-lg font-bold text-black dark:text-white mb-3 tracking-tight font-outfit'>
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className='text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed flex-1'>
                      {feature.description}
                    </p>

                    {/* Bottom accent line - subtle */}
                    <div className='mt-6 pt-4 border-t border-neutral-200/50 dark:border-white/[0.04]'>
                      <div className='flex items-center gap-2'>
                        <div
                          className={cn(
                            'w-6 h-[2px] rounded-full transition-all duration-500 opacity-40 group-hover/card:opacity-100 group-hover/card:w-10',
                            accent.dot
                          )}
                        />
                        <span className='text-[10px] text-neutral-400 dark:text-neutral-600 uppercase tracking-[0.2em] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 font-sans'>
                          System Active
                        </span>
                      </div>
                    </div>
                  </div>
                </CardSpotlight>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
