'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AnalysisStep } from '@/types'
import { EncryptedText } from '@/components/ui/aceternity/encrypted-text'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { Fingerprint, Cpu, Search, Activity, Zap, Layers, Terminal, Database, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingIntelligenceProps {
  step: AnalysisStep
  query: string
}

export const LoadingIntelligence: React.FC<LoadingIntelligenceProps> = ({ step, query }) => {
  const analysisId = useMemo(() => `AX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, [])

  const steps = [
    { key: AnalysisStep.RESEARCHING, label: 'Neural Research', icon: Search, color: 'text-blue-500' },
    { key: AnalysisStep.CLUSTERING, label: 'Pattern Detection', icon: Layers, color: 'text-purple-500' },
    { key: AnalysisStep.SCORING, label: 'Predictive Scoring', icon: Activity, color: 'text-emerald-500' }
  ]

  const activeStepIndex = steps.findIndex(s => s.key === step)

  // Simulation of "Inference Fragments"
  const fragments = [
    "TRACING_SIGNALS...", "EXTRACTING_GAPS...", "VECTORIZING_MARKET...",
    "NEURAL_EMBEDDING...", "PATTERN_LOCKED", "SCORING_OPPORTUNITY",
    "SOURCE_VERIFIED", "GROUNDING_ACTIVE"
  ]

  return (
    <div className="relative min-h-[700px] w-full flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-2xl px-6">
      {/* Dynamic Background Elements */}
      <BackgroundBeams className="opacity-20 dark:opacity-40" />
      
      {/* Intelligent Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #3b82f6 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      {/* Scanning Line Effect */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-10 pointer-events-none"
      />

      {/* Inference Fragments - Left */}
      <div className="absolute top-10 left-10 hidden lg:flex flex-col gap-2 pointer-events-none opacity-20 dark:opacity-40">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-2 font-mono text-[9px] text-blue-600 dark:text-blue-400">
             <Terminal className="w-3 h-3" />
             <EncryptedText text={fragments[i] || ""} interval={100} />
          </div>
        ))}
      </div>

      {/* Inference Fragments - Right */}
      <div className="absolute top-40 right-10 hidden lg:flex flex-col gap-2 pointer-events-none opacity-20 dark:opacity-40 text-right">
        {[3, 4, 5].map(i => (
          <div key={i} className="flex items-center justify-end gap-2 font-mono text-[9px] text-purple-600 dark:text-purple-400">
             <EncryptedText text={fragments[i] || ""} interval={100} />
             <Database className="w-3 h-3" />
          </div>
        ))}
      </div>

      {/* Intelligence ID Badge */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute top-6 flex items-center gap-2 px-4 py-1.5 bg-neutral-100 dark:bg-white/5 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-full z-20"
      >
        <Fingerprint className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-white/40 uppercase tracking-widest">
          Autonomous ID: <span className="text-neutral-900 dark:text-white/80">{analysisId}</span>
        </span>
      </motion.div>

      <div className="relative z-20 w-full max-w-2xl flex flex-col items-center">
        {/* Triple-Layer Neural Core */}
        <div className="relative mb-20 scale-110 md:scale-125">
          {/* Outer Layer */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="w-40 h-40 rounded-full border-2 border-dashed border-blue-500/10 flex items-center justify-center"
          />
          {/* Middle Layer */}
          <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-32 h-32 rounded-full border border-blue-500/20 flex items-center justify-center"
            >
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border border-purple-500/30 flex items-center justify-center p-4"
              >
                <div className="w-full h-full rounded-full bg-blue-500/10 dark:bg-blue-400/5 blur-2xl animate-pulse" />
              </motion.div>
            </motion.div>
          </div>
          {/* Core Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <motion.div
               animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
               transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             >
               <Cpu className="w-10 h-10 text-blue-600 dark:text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
             </motion.div>
          </div>
        </div>

        {/* Dynamic Text Section - Modernized */}
        <div className="text-center space-y-6 mb-20 w-full">
          <div className="flex flex-col items-center gap-3">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-900/50"
            >
              <span className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.4em]">Processing Engine Active</span>
            </motion.div>
            <div className="text-4xl md:text-6xl font-black text-black dark:text-white max-w-xl tracking-tighter leading-none">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-500 dark:from-blue-400 dark:via-blue-300 dark:to-cyan-200">
                <EncryptedText text={query} interval={40} />
              </span>
            </div>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-base font-medium max-w-md mx-auto leading-relaxed">
            Architecting strategic intelligence through autonomous data synthesis.
          </p>
        </div>

        {/* Glassmorphism Progressive Steps */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const isActive = idx === activeStepIndex
            const isCompleted = idx < activeStepIndex
            const Icon = s.icon

            return (
              <div key={s.key} className="relative group">
                <motion.div 
                  initial={false}
                  animate={isActive ? { scale: 1.02, y: -5 } : { scale: 1, y: 0 }}
                  className={cn(
                    "p-6 rounded-3xl border transition-all duration-500 flex flex-col items-center gap-4 relative overflow-hidden backdrop-blur-2xl",
                    isActive 
                      ? "bg-white/80 dark:bg-neutral-800/80 border-blue-400 dark:border-blue-700 shadow-2xl z-10" 
                      : isCompleted
                      ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20 opacity-80"
                      : "bg-neutral-50/50 dark:bg-white/5 border-neutral-100 dark:border-neutral-800 opacity-30"
                  )}
                >
                  {/* Step Active Glow */}
                  {isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl opacity-50" />
                  )}

                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 relative z-10",
                    isActive 
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10" 
                      : isCompleted
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600"
                  )}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] relative z-10 text-center",
                    isActive ? "text-neutral-900 dark:text-white" : "text-neutral-500 dark:text-neutral-600"
                  )}>{s.label}</span>

                  {isCompleted && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3"
                    >
                      <Zap className="w-3 h-3 text-blue-500" />
                    </motion.div>
                  )}
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
