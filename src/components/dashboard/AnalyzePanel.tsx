import React, { useState } from 'react'
import { PlaceholdersAndVanishInput } from '../ui/aceternity/placeholders-and-vanish-input'
import { motion } from 'framer-motion'
import { BackgroundBeams } from '../ui/aceternity/background-beams'
import { Sparkles } from 'lucide-react'

interface AnalyzePanelProps {
  onAnalyze: (query: string) => void
  disabled: boolean
  remainingCredits: number | string
}

export function AnalyzePanel ({
  onAnalyze,
  disabled,
  remainingCredits
}: AnalyzePanelProps) {
  const [query, setQuery] = useState('')

  const placeholders = [
    "Analyze Notion's weaknesses",
    "What are Slack's biggest problems?",
    "Find gaps in Figma's offering",
    "Discover Trello's pain points",
    "Analyze Monday.com's user complaints",
    'What frustrates Asana users?'
  ]

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      onAnalyze(query)
    }
  }

  return (
    <div className='w-full flex flex-col items-center justify-center relative'>
      <BackgroundBeams className='absolute inset-0 w-full h-full z-0 opacity-40' />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='max-w-4xl w-full mx-auto px-4 relative z-20 flex flex-col items-center'
      >
        <div className='text-center space-y-4 mb-10'>
          <h2 className='text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight'>
            Start Your Analysis
          </h2>
          <p className='text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto'>
            Enter any product name to discover competitive opportunities
          </p>
        </div>

        <div className='w-full max-w-2xl'>
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={e => setQuery(e.target.value)}
            onSubmit={handleSubmit}
            value={query}
          />
        </div>

        <div className='mt-6 flex flex-col items-center space-y-4'>
          <div className='text-sm text-neutral-500 dark:text-neutral-500 font-mono'>
            {typeof remainingCredits === 'number'
              ? `${remainingCredits} credits remaining`
              : `${remainingCredits} credits`}
          </div>

          {disabled && (
            <p className='text-sm text-red-500 font-medium'>
              You've used all your credits. Upgrade your plan for more
              analyses.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
