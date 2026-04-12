'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  {
    question: 'What is AI competitor analysis?',
    answer: 'AI competitor analysis uses artificial intelligence to automatically gather, process, and interpret data about your competitors. Instead of manual research, our platform identifies market gaps, sentiment shifts, and feature releases in real-time, providing you with actionable strategic advantages.'
  },
  {
    question: 'How does Nexora track competitor movements?',
    answer: 'Nexora monitors thousands of public data sources including social media, product review sites, job boards, and news outlets. Our AI models synthesize this "noise" into clear signals, notifying you of pricing changes, marketing shifts, or new product launches as they happen.'
  },
  {
    question: 'Can I generate professional reports for my team?',
    answer: 'Yes! Nexora allows you to transform complex AI competitor analysis data into high-quality visual reports and PDF exports. These reports are designed to be shared with stakeholders, helping you justify product roadmap decisions with real-world data.'
  },
  {
    question: 'How accurate is the sentiment intelligence?',
    answer: 'Our sentiment intelligence engine uses state-of-the-art Natural Language Processing (NLP) to understand the nuance in user feedback. We go beyond "positive vs negative" to identify specific pain points and feature requests that your competitors are failing to address.'
  },
  {
    question: 'Is my search data private?',
    answer: 'Absolutely. We prioritize your privacy. All your research queries and generated reports are encrypted and strictly confidential. We never share your strategic focus or analysis data with third parties.'
  }
]

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-semibold text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {question}
        </span>
        {isOpen ? <Minus className="w-5 h-5 text-blue-500" /> : <Plus className="w-5 h-5 text-neutral-400" />}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-6 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  )
}

export function FAQSection() {
  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Everything you need to know about Nexora and AI competitor analysis.
          </p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq) => (
            <FAQItem key={faq.question} {...faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
