'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const logos = [
  {
    name: 'netflix',
    src: '/netflix-1-logo-svgrepo-com.svg'
  },
  {
    name: 'google',
    src: '/google-icon-logo-svgrepo-com.svg'
  },
  {
    name: 'meta',
    src: '/facebook-meta-logo_svgstack_com_28791771875574.svg'
  },
  {
    name: 'docker',
    src: '/docker-svgrepo-com.svg'
  }
]



export function TrustedBy () {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, filter: 'blur(10px)', y: 80 },
    visible: { 
      opacity: 1, 
      filter: 'blur(0px)', 
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.21, 0.45, 0.32, 0.9] as [number, number, number, number]
      }
    }
  }

  const floatVariants = {
    visible: {
      y: [0, -12, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as any
      }
    }
  }

  return (
    <div className='relative z-20 py-24 bg-white dark:bg-black overflow-hidden'>
      <div className='max-w-7xl mx-auto px-4 mb-16 text-center'>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className='tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight'
        >
          Trusted by the best companies
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className='text-sm md:text-base max-w-2xl mt-4 mx-auto text-neutral-500 dark:text-neutral-400 font-normal'
        >
          Nexora powers competitive intelligence for the world&apos;s most innovative teams.
        </motion.p>
      </div>

      <div className='max-w-7xl mx-auto px-4'>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="flex gap-10 flex-wrap justify-center md:gap-40 relative h-full w-full mt-20"
        >
          {logos.map((logo) => (
            <motion.div
              key={logo.name}
              variants={itemVariants}
              className="relative flex items-center justify-center"
            >
              <motion.div
                variants={floatVariants}
                animate="visible"
                className="flex items-center justify-center"
              >
                <img
                  alt={`${logo.name} logo`}
                  loading='lazy'
                  width='160'
                  height='80'
                  decoding='async'
                  className='h-12 w-28 md:h-20 md:w-44 object-contain transition-all duration-300'
                  src={logo.src}
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
