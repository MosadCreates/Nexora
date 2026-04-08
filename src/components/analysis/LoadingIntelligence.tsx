'use client'

import React from 'react'
import { MultiStepLoader as Loader } from '../ui/multi-step-loader'
import { AnalysisStep } from '@/types'

const loadingStates = [
  { text: "Initializing neural swarms" },
  { text: "Tracing competitor footprints" },
  { text: "Vectorizing market data" },
  { text: "Detecting strategic gaps" },
  { text: "Synthesizing sentiment analysis" },
  { text: "Assessing threat models" },
  { text: "Predicting opportunity scores" },
  { text: "Structuring intelligence report" },
  { text: "Finalizing autonomous analysis" },
]

interface LoadingIntelligenceProps {
  step: AnalysisStep
  query: string
}

export const LoadingIntelligence: React.FC<LoadingIntelligenceProps> = ({ step, query }) => {
  return (
    <div className="relative min-h-[500px] w-full flex items-center justify-center">
        <Loader loadingStates={loadingStates} loading={true} duration={2500} />
    </div>
  )
}
