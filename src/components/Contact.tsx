'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BackgroundBeams } from './ui/aceternity/background-beams'
import { Linkedin, CheckCircle } from 'lucide-react'
import { AnimatedTooltip } from '@/components/ui/aceternity/animated-tooltip'
import * as Sentry from '@sentry/nextjs'

const people = [
  {
    id: 1,
    name: 'John Doe',
    designation: 'Software Engineer',
    image:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80'
  },
  {
    id: 2,
    name: 'Robert Johnson',
    designation: 'Product Manager',
    image:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 3,
    name: 'Jane Smith',
    designation: 'Data Scientist',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
  },
  {
    id: 4,
    name: 'Emily Davis',
    designation: 'UX Designer',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
  }
]

export const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(
        'https://formsubmit.co/ajax/mosad.mohamed.ai@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            _subject: `New Contact Form Submission from ${formData.name}`
          })
        }
      )

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({ name: '', email: '', company: '', message: '' })
      }
    } catch (error) {
      Sentry.captureException(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-white dark:bg-black pt-20'>
      {/* Left Column */}
      <div className='w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden md:h-full'>
        <BackgroundBeams className='absolute inset-0' />
        <div className='max-w-md mx-auto w-full relative z-10'>
          <AnimatePresence mode='wait'>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className='text-center py-12'
              >
                <div className='w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <CheckCircle className='w-10 h-10 text-green-600 dark:text-green-400' />
                </div>
                <h2 className='text-3xl font-bold mb-4 text-black dark:text-white'>
                  Message Sent!
                </h2>
                <p className='text-neutral-500 dark:text-neutral-400 mb-8'>
                  Thank you for reaching out. We&apos;ve received your message and
                  will get back to you shortly.
                </p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className='text-sm font-semibold text-black dark:text-white hover:underline transition-all'
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className='text-4xl font-bold mb-4 text-black dark:text-white'>
                  Contact Us
                </h1>
                <p className='text-neutral-500 dark:text-neutral-400 mb-8'>
                  Please reach out to us and we will get back to you at the
                  speed of light.
                </p>

                <form className='space-y-4' onSubmit={handleSubmit}>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2'>
                      Full Name
                    </label>
                    <input
                      required
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      placeholder='Your name'
                      className='w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white placeholder:text-neutral-400'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2'>
                      Email address
                    </label>
                    <input
                      required
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      placeholder='hello@example.com'
                      className='w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white placeholder:text-neutral-400'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2'>
                      Company
                    </label>
                    <input
                      type='text'
                      name='company'
                      value={formData.company}
                      onChange={handleChange}
                      placeholder='Your company name'
                      className='w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white placeholder:text-neutral-400'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2'>
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      name='message'
                      value={formData.message}
                      onChange={handleChange}
                      placeholder='Enter your message here'
                      className='w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-black dark:focus:ring-white transition-all outline-none text-black dark:text-white placeholder:text-neutral-400 resize-none'
                    />
                  </div>
                  <button
                    disabled={isSubmitting}
                    className='w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-full shadow-xl hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 transition-all duration-200 mt-4'
                  >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>

                <div className='flex gap-6 mt-12 items-center justify-center md:justify-start'>
                  <a 
                    href="https://x.com/NexoraI19729"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Nexora on X (Twitter)"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.31 17.41z" />
                    </svg>
                  </a>
                  <a 
                    href="https://reddit.com/r/nexoraintel"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Join Nexora on Reddit"
                  >
                    <svg
                      viewBox='0 0 24 24'
                      className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors fill-current'
                      xmlns='http://www.w3.org/2000/svg'
                    >
                      <path d='M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z' />
                    </svg>
                  </a>
                  <a 
                    href="https://linkedin.com/company/nexoraintel"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Nexora on LinkedIn"
                  >
                    <Linkedin className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors' />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Column */}
      <div className='relative flex-1 hidden lg:flex border-l border-neutral-100 dark:border-neutral-900 overflow-hidden bg-gray-50 dark:bg-black items-center justify-center md:h-full'>
        <div className='max-w-sm mx-auto relative z-10'>
          <div className='flex flex-row items-center justify-center mb-10 w-full'>
            <AnimatedTooltip items={people} isLogo={false} />
          </div>
          <p className='font-semibold text-xl text-center dark:text-neutral-400 text-neutral-600'>
            Nexora is used by thousands of users
          </p>
          <p className='font-normal text-base text-center text-neutral-500 dark:text-neutral-200 mt-8'>
            With lots of AI applications around, Nexora stands out with
            its state of the art competitive intelligence capabilities.
          </p>
        </div>

        {/* Dashed Line SVGs */}
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none top-20'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-contact-top)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-contact-top'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none bottom-20'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-contact-bottom)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-contact-bottom'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none -right-80 transform rotate-90 inset-y-0 h-full scale-x-150'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-contact-right)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-contact-right'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width='1595'
          height='2'
          viewBox='0 0 1595 2'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='absolute w-full object-contain pointer-events-none -left-80 transform rotate-90 inset-y-0 h-full scale-x-150'
        >
          <path
            d='M0 1H1594.5'
            stroke='url(#line-path-gradient-contact-left)'
            strokeDasharray='8 8'
          ></path>
          <defs>
            <linearGradient
              id='line-path-gradient-contact-left'
              x1='0'
              y1='1.5'
              x2='1594.5'
              y2='1.5'
              gradientUnits='userSpaceOnUse'
            >
              <stop stopColor='white' stopOpacity='0'></stop>
              <stop offset='0.2' stopColor='var(--neutral-400)'></stop>
              <stop offset='0.8' stopColor='var(--neutral-400)'></stop>
              <stop offset='1' stopColor='white' stopOpacity='0'></stop>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}
