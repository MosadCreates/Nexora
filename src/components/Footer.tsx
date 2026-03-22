'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, ShieldCheck, Linkedin } from 'lucide-react'

export function Footer () {
  return (
    <footer className='relative bg-white dark:bg-black overflow-hidden'>
      <div className='border-t border-neutral-100 dark:border-neutral-800 px-8 pt-10 pb-16 relative z-10'>
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

          <div className='grid grid-cols-2 md:grid-cols-3 gap-10 items-start mt-10 md:mt-0 w-full md:w-auto'>
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
                href='/blog'
                prefetch={true}
                className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'
              >
                Blog
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
            <div className='flex flex-col space-y-4'>
              <p className='font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2'>
                Social
              </p>
              <div className='flex gap-4 items-center'>
                <Link
                  href='#'
                  target='_blank'
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
                  href='#'
                  target='_blank'
                  aria-label='Join Nexora on Reddit'
                  className='text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition'
                >
                  <svg
                    viewBox='0 0 24 24'
                    className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors fill-current'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z'/>
                  </svg>
                </Link>
                <Link
                  href='#'
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label='Nexora on Product Hunt'
                  className='text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition'
                >
                  <svg
                    viewBox='0 0 24 24'
                    className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors fill-current'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path d='M13.604 8.4h-3.405V12h3.405c.996 0 1.801-.805 1.801-1.8 0-.995-.805-1.8-1.801-1.8zM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm1.604 14.4h-3.405V18H7.8V6h5.804c2.319 0 4.2 1.881 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z'/>
                  </svg>
                </Link>
                <Link
                  href='#'
                  target='_blank'
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
