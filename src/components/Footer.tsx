'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, ShieldCheck, Linkedin } from 'lucide-react'

export function Footer () {
  return (
    <footer className='relative bg-white dark:bg-black overflow-hidden'>
      <div className='border-t border-neutral-100 dark:border-neutral-800 px-4 md:px-8 pt-10 pb-16 relative z-10'>
        <div className='max-w-7xl mx-auto text-sm text-neutral-500 dark:text-neutral-400 flex sm:flex-row flex-col justify-between items-start'>
          <div className='flex flex-col'>
            <div className='mr-4 md:flex mb-4'>
              <Link
                href='/'
                className='font-normal flex space-x-2 items-center text-sm text-black px-2 py-1 relative z-20 group'
              >
                <div className='h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-shadow duration-300'></div>
                <span className='font-medium text-black dark:text-white text-lg flex items-center gap-2'>
                  Nexora
                  <Sparkles className='w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity' />
                </span>
              </Link>
            </div>
            <div className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <ShieldCheck className='w-4 h-4 text-blue-500' />
                <span className='font-medium text-black dark:text-white'>
                  Built with Privacy by Design
                </span>
              </div>
              <div className='pl-6'>Copyright © 2026 Nexora Intelligence</div>
              <div className='pl-6 mt-1 text-xs opacity-50 uppercase tracking-widest'>
                Autonomous Market Foresight Engine
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 items-start mt-10 md:mt-0 w-full md:w-auto'>
            <div className='flex flex-col space-y-4'>
              <p className='font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2'>
                Product
              </p>
              <Link
                href='/pricing'
                prefetch={true}
                className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
              >
                Pricing
              </Link>

              <Link
                href='/contact'
                prefetch={true}
                className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
              >
                Contact
              </Link>
            </div>
            <div className='flex flex-col space-y-4'>
              <p className='font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2'>
                Legal
              </p>
              <Link
                href='/privacy'
                prefetch={true}
                className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
              >
                Privacy
              </Link>
              <Link
                href='/terms'
                prefetch={true}
                className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
              >
                Terms
              </Link>
              <Link
                href='/refund'
                prefetch={true}
                className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
              >
                Refund Policy
              </Link>
            </div>
            <div className='flex flex-col space-y-4 col-span-2 md:col-span-1'>
              <p className='font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2'>
                Social
              </p>
              <div className='flex gap-4 items-center'>
                <Link
                  href='https://x.com/NexoraI19729'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Follow Nexora on X (Twitter)'
                  className='text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition'
                >
                  <svg
                    viewBox='0 0 24 24'
                    className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors fill-current'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.31 17.41z' />
                  </svg>
                </Link>


                <Link
                  href='https://linkedin.com/company/nexoraintel'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Nexora on LinkedIn'
                >
                  <Linkedin className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors' />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Text - Intelligent Appearance */}
      <div className='relative w-full overflow-hidden pb-10 select-none'>
        <p className='text-center text-5xl md:text-9xl lg:text-[15rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950/20 to-neutral-200 dark:to-neutral-900/50 pointer-events-none'>
          COMPETE
        </p>
      </div>
    </footer>
  )
}
