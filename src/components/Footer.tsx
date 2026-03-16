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
                  <Sparkles className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-black dark:text-white">Built with Privacy by Design</span>
              </div>
              <div className="pl-6">Copyright © 2026 Nexora Intelligence</div>
              <div className='pl-6 mt-1 text-xs opacity-50 uppercase tracking-widest'>Autonomous Market Foresight Engine</div>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-10 items-start mt-10 md:mt-0 w-full md:w-auto'>
            <div className='flex flex-col space-y-4'>
              <p className="font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2">Product</p>
              <Link href='/pricing' className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>Pricing</Link>
              <Link href='/blog' className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>Blog</Link>
              <Link href='/contact' className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>Contact</Link>
            </div>
            <div className='flex flex-col space-y-4'>
              <p className="font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2">Legal</p>
              <Link href='/privacy' className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>Privacy</Link>
              <Link href='/terms' className='hover:text-blue-500 dark:hover:text-blue-400 transition-colors'>Terms</Link>
            </div>
            <div className='flex flex-col space-y-4'>
              <p className="font-bold text-black dark:text-white text-xs uppercase tracking-widest mb-2">Social</p>
              <div className='flex gap-4 items-center'>
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298l13.31 17.41z" />
                </svg>
                <svg 
                  viewBox="-25.65 -42.75 222.3 256.5" 
                  className="w-[30px] h-[30px] grayscale opacity-70 hover:grayscale-0 hover:opacity-100 cursor-pointer transition-all"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="translate(-85.4 -85.4)">
                    <circle r="85.5" cy="170.9" cx="170.9" fill="#ff4500"/>
                    <path d="M227.9 170.9c0-6.9-5.6-12.5-12.5-12.5-3.4 0-6.4 1.3-8.6 3.5-8.5-6.1-20.3-10.1-33.3-10.6l5.7-26.7 18.5 3.9c.2 4.7 4.1 8.5 8.9 8.5 4.9 0 8.9-4 8.9-8.9s-4-8.9-8.9-8.9c-3.5 0-6.5 2-7.9 5l-20.7-4.4c-.6-.1-1.2 0-1.7.3s-.8.8-1 1.4l-6.3 29.8c-13.3.4-25.2 4.3-33.8 10.6-2.2-2.1-5.3-3.5-8.6-3.5-6.9 0-12.5 5.6-12.5 12.5 0 5.1 3 9.4 7.4 11.4-.2 1.2-.3 2.5-.3 3.8 0 19.2 22.3 34.7 49.9 34.7 27.6 0 49.9-15.5 49.9-34.7 0-1.3-.1-2.5-.3-3.7 4.1-2 7.2-6.4 7.2-11.5zm-85.5 8.9c0-4.9 4-8.9 8.9-8.9s8.9 4 8.9 8.9-4 8.9-8.9 8.9-8.9-4-8.9-8.9zm49.7 23.5c-6.1 6.1-17.7 6.5-21.1 6.5-3.4 0-15.1-.5-21.1-6.5-.9-.9-.9-2.4 0-3.3.9-.9 2.4-.9 3.3 0 3.8 3.8 12 5.2 17.9 5.2 5.9 0 14-1.4 17.9-5.2.9-.9 2.4-.9 3.3 0 .7 1 .7 2.4-.2 3.3zm-1.6-14.6c-4.9 0-8.9-4-8.9-8.9s4-8.9 8.9-8.9 8.9 4 8.9 8.9-4 8.9-8.9 8.9z" fill="#fff"/>
                  </g>
                </svg>
                <Linkedin className='w-5 h-5 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors' />
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 cursor-pointer transition-all"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="#E64A19" d="M13.546,9H10.8v3h2.746C14.349,12,15,11.328,15,10.5S14.349,9,13.546,9z"></path>
                  <path fill="#E64A19" d="M12,0C5.372,0,0,5.372,0,12s5.372,12,12,12s12-5.372,12-12S18.628,0,12,0z M13.524,13.8H10.8v3H9V7.2h4.524c1.809,0,3.276,1.467,3.276,3.3C16.8,12.285,15.333,13.752,13.524,13.8z"></path>
                </svg>
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
