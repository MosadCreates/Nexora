import React from 'react'
import { AnimatedTooltip } from '@/components/ui/aceternity/animated-tooltip'
import {
  HelpCircle,
  TrendingUp,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricTooltipProps {}

const metrics = [
  {
    id: 1,
    name: 'Frequency',
    designation: 'How often users mention this',
    image: 'https://api.iconify.design/lucide:activity.svg?color=%23000000'
  },
  {
    id: 2,
    name: 'Pain Intensity',
    designation: 'Severity of the problem',
    image: 'https://api.iconify.design/lucide:zap.svg?color=%23000000'
  },
  {
    id: 3,
    name: 'Monetization',
    designation: 'Willingness to pay',
    image: 'https://api.iconify.design/lucide:dollar-sign.svg?color=%23000000'
  },
  {
    id: 4,
    name: 'Competitive Moat',
    designation: 'Defensibility potential',
    image: 'https://api.iconify.design/lucide:shield-check.svg?color=%23000000'
  }
]

export function MetricTooltip () {
  return (
    <div className='flex items-center justify-center space-x-2'>
      <span className='text-sm text-neutral-600 dark:text-neutral-400 mr-2'>
        Scoring metrics:
      </span>
      <AnimatedTooltip items={metrics} />
    </div>
  )
}
