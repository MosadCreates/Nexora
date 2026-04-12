import React from 'react'
import { cn } from '../../lib/utils'
import {
  IconTarget,
  IconMessageChatbot,
  IconActivity,
  IconCurrencyDollar,
  IconSearch,
  IconChartBar,
  IconSwords,
  IconFileReport
} from '@tabler/icons-react'

export function ExampleBentoGrid () {
  const features = [
    {
      title: 'Market Gaps',
      description:
        'Identify systematic product weaknesses that represent genuine business opportunities.',
      icon: <IconTarget className='h-8 w-8 text-blue-500' />
    },
    {
      title: 'Real User Feedback',
      description:
        'Analyze complaints from G2, Capterra, and more to find real pain points.',
      icon: <IconMessageChatbot className='h-8 w-8 text-purple-500' />
    },
    {
      title: 'Pain Intensity Scoring',
      description:
        'Quantify how severe each weakness is for users to prioritize high-impact gaps.',
      icon: <IconActivity className='h-8 w-8 text-amber-500' />
    },
    {
      title: 'Monetization Signals',
      description:
        'Discover which weaknesses users are actually willing to pay to solve.',
      icon: <IconCurrencyDollar className='h-8 w-8 text-green-500' />
    },
    {
      title: 'Web-Wide Search',
      description:
        'Google Search grounding ensures all data is backed by real-world sources.',
      icon: <IconSearch className='h-8 w-8 text-indigo-500' />
    },
    {
      title: 'Actionable Insights',
      description:
        'Get strategic recommendations and concrete validation steps for your next move.',
      icon: <IconChartBar className='h-8 w-8 text-rose-500' />
    },
    {
      title: 'Competitive Benchmarking',
      description:
        'Compare products side-by-side to find the ultimate competitive advantage.',
      icon: <IconSwords className='h-8 w-8 text-cyan-500' />
    },
    {
      title: 'Automated Reports',
      description:
        'Generate comprehensive analysis reports in seconds with a single click.',
      icon: <IconFileReport className='h-8 w-8 text-orange-500' />
    }
  ]

  return (
    <div className='py-20 px-4 bg-white dark:bg-black'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center space-y-4 mb-16'>
          <h2 className='text-3xl md:text-5xl font-bold text-black dark:text-white tracking-tight'>
            How It Works
          </h2>
          <p className='text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto'>
            Discover genuine business opportunities by analyzing what existing
            products get wrong with our advanced AI intelligence.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 border border-neutral-100 dark:border-neutral-900 rounded-3xl overflow-hidden'>
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

const Feature = ({
  title,
  description,
  icon,
  index
}: {
  title: string
  description: string
  icon: React.ReactNode
  index: number
}) => {
  return (
    <div
      className={cn(
        'flex flex-col lg:border-r py-10 relative group/feature dark:border-neutral-800',
        (index === 0 || index === 4) && 'lg:border-l dark:border-neutral-800',
        index < 4 && 'lg:border-b dark:border-neutral-800'
      )}
    >
      {index < 4 && (
        <div className='opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 to-transparent pointer-events-none' />
      )}
      {index >= 4 && (
        <div className='opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-50 dark:from-neutral-900 to-transparent pointer-events-none' />
      )}
      <div className='mb-4 relative z-10 px-10 text-neutral-600 dark:text-neutral-400'>
        {icon}
      </div>
      <div className='text-lg font-bold mb-2 relative z-10 px-10'>
        <div className='absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-200 dark:bg-neutral-800 group-hover/feature:bg-blue-500 transition-all duration-200 origin-center' />
        <span className='group-hover/feature:translate-x-2 transition duration-200 inline-block text-black dark:text-white'>
          {title}
        </span>
      </div>
      <p className='text-sm text-neutral-600 dark:text-neutral-400 max-w-xs relative z-10 px-10 leading-relaxed'>
        {description}
      </p>
    </div>
  )
}
