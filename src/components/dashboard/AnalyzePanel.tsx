import React, { useState } from 'react'
import { PlaceholdersAndVanishInput } from '../ui/aceternity/placeholders-and-vanish-input'
import { motion } from 'framer-motion'
import { Sparkles, Activity } from 'lucide-react'

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className='max-w-5xl w-full mx-auto px-4 relative z-20 flex flex-col items-center'
      >
        <div className="w-full relative">
          <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 dark:from-blue-500/20 dark:to-teal-500/20 transform scale-[0.80] blur-3xl rounded-full" />
          <div className="relative shadow-2xl bg-white dark:bg-black border border-neutral-100 dark:border-neutral-800 rounded-[2.5rem] px-6 py-12 md:px-12 md:py-20 overflow-hidden text-center backdrop-blur-sm">
            
            <div className="mx-auto mb-6 flex items-center justify-center space-x-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 w-max rounded-full border border-blue-100 dark:border-blue-800/50">
               <Activity className="w-4 h-4" />
               <span className="text-sm font-semibold tracking-wide uppercase">AI-Powered Intelligence</span>
            </div>

            <div className='text-center space-y-6 mb-12'>
              <h2 className='text-4xl md:text-6xl font-bold text-black dark:text-white tracking-tight'>
                Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 dark:from-blue-400 dark:to-teal-400">Analysis</span>
              </h2>
              <p className='text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto'>
                Enter any product name to discover competitive opportunities and generate an actionable intelligence report instantly.
              </p>
            </div>

            <div className='w-full max-w-2xl mx-auto relative' data-tour="search-input">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-full blur-xl opacity-50" />
              <div className="relative">
                <PlaceholdersAndVanishInput
                  placeholders={placeholders}
                  onChange={e => setQuery(e.target.value)}
                  onSubmit={handleSubmit}
                  value={query}
                />
              </div>
            </div>

            <div className='mt-10 flex flex-col items-center space-y-4'>
              <div className='inline-flex items-center space-x-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-4 py-2 rounded-full text-sm text-neutral-600 dark:text-neutral-400 font-medium'>
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  {typeof remainingCredits === 'number'
                    ? `${remainingCredits} credits remaining`
                    : `${remainingCredits} credits`}
                </span>
              </div>

              {disabled && (
                <p className='text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-md'>
                  You've used all your credits. Upgrade your plan for more analyses.
                </p>
              )}
            </div>
            
          </div>
        </div>
      </motion.div>
    </div>
  )
}
