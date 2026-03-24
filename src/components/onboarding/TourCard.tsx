import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { TourStep } from '@/lib/tourSteps'

interface TourCardProps {
  step: TourStep
  currentStep: number
  totalSteps: number
  nextStep: () => void
  skipTour: () => void
  cardX: number
  cardY: number
}

export const TourCard: React.FC<TourCardProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  skipTour,
  cardX,
  cardY
}) => {
  const isLastStep = currentStep === totalSteps - 1

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed z-[10000] bg-white dark:bg-neutral-900 
                   rounded-2xl shadow-2xl border border-neutral-200 
                   dark:border-neutral-800 p-6 w-80 pointer-events-auto"
        style={{ top: cardY, left: cardX }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-neutral-400 
                           uppercase tracking-widest">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <button 
            onClick={skipTour}
            className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200
                       transition"
          >
            Skip tour
          </button>
        </div>

        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{step.icon}</span>
          <h3 className="text-lg font-bold text-neutral-900 
                         dark:text-white">
            {step.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-600 dark:text-neutral-400 
                      leading-relaxed mb-6">
          {step.description}
        </p>

        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === currentStep 
                    ? 'w-4 bg-black dark:bg-white' 
                    : 'w-1.5 bg-neutral-300 dark:bg-neutral-700'
                )}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-black dark:bg-white 
                       text-white dark:text-black px-4 py-2 rounded-xl 
                       text-sm font-semibold hover:opacity-80 transition"
          >
            {isLastStep ? "Let's Go! 🎉" : "Next →"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
