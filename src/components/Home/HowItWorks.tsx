'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Zap, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    title: 'Input Your Target',
    description: 'Simply enter the URL or name of any product, service, or competitor you want to analyze. Our AI competitor analysis tool immediately begins scanning the digital landscape.',
    icon: Search,
    color: 'blue'
  },
  {
    title: 'AI Data Synthesis',
    description: 'Nexora aggregates thousands of data points from user reviews, forums, social media, and market reports to perform a deep-dive AI competitor analysis.',
    icon: Zap,
    color: 'cyan'
  },
  {
    title: 'Get Actionable Insights',
    description: 'Receive a comprehensive report highlighting competitive gaps, sentiment trends, and prioritized opportunities to improve your product market fit.',
    icon: CheckCircle2,
    color: 'indigo'
  }
]

export function HowItWorks() {
  return (
    <section className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
            How Our <span className="text-blue-600 dark:text-blue-400">AI Competitor Analysis</span> Works
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Nexora streamlines the process of market intelligence, allowing you to focus on building features that matter most to your customers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 rounded-2xl bg-${step.color}-500/10 flex items-center justify-center mb-6`}>
                <step.icon className={`w-6 h-6 text-${step.color}-600 dark:text-${step.color}-400`} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-black dark:text-white">{step.title}</h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-8 md:p-12 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center">
          <h3 className="text-2xl md:text-4xl font-bold mb-6">Ready to outsmart your competition?</h3>
          <p className="text-blue-50 text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of data-driven teams using Nexora for real-time market intelligence and advanced AI competitor analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-black">
            <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30 text-white">
              No credit card required
            </div>
            <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30 text-white">
              Instant analysis results
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
