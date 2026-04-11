'use client'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'

export function AnnualDealSpotlight() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="max-w-3xl mx-auto mt-12 mb-8 px-4"
    >
      <div className="relative overflow-hidden rounded-2xl border 
                      border-neutral-200 dark:border-neutral-800 
                      bg-gradient-to-br from-neutral-50 to-white 
                      dark:from-neutral-900 dark:to-neutral-950 p-8">
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 
                        bg-green-500/5 rounded-full 
                        -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-black dark:bg-white 
                           rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white dark:text-black" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 
                             dark:text-white">
                Annual Plan — Best Value
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Commit yearly, save 2 months of cost
              </p>
            </div>
          </div>
          
          {/* Plans comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Starter Annual */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl 
                           border border-neutral-200 dark:border-neutral-700 
                           p-5">
              <p className="text-xs font-bold uppercase tracking-widest 
                            text-neutral-400 mb-3">
                Starter
              </p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-bold text-neutral-900 
                                 dark:text-white">
                  $189
                </span>
                <span className="text-sm text-neutral-500 mb-1">/year</span>
              </div>
              <p className="text-sm text-neutral-500 mb-1">
                $15.75/mo · billed annually
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-xs font-bold text-green-600 
                                 dark:text-green-400 bg-green-50 
                                 dark:bg-green-900/30 px-2 py-1 
                                 rounded-full">
                  Save $39/year
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  $228/yr
                </span>
              </div>
            </div>
            
            {/* Professional Annual */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 
                           dark:from-white dark:to-neutral-100
                           rounded-xl border border-neutral-700 
                           dark:border-neutral-300 p-5 relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="text-xs font-bold bg-green-500 
                                 text-white px-2 py-0.5 rounded-full">
                  Best Value
                </span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest 
                            text-neutral-400 dark:text-neutral-500 mb-3">
                Professional
              </p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-bold text-white 
                                 dark:text-neutral-900">
                  $489
                </span>
                <span className="text-sm text-neutral-400 
                                 dark:text-neutral-500 mb-1">
                  /year
                </span>
              </div>
              <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-1">
                $40.75/mo · billed annually
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="text-xs font-bold text-green-400 
                                 dark:text-green-600 bg-green-500/20 
                                 dark:bg-green-100 px-2 py-1 rounded-full">
                  Save $99/year
                </span>
                <span className="text-xs text-neutral-500 line-through">
                  $588/yr
                </span>
              </div>
            </div>
          </div>
          
          {/* What's included */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'Cancel anytime',
              'All features included',
              'Priority support',
              'Lock in current price',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                <span className="text-xs text-neutral-600 
                                 dark:text-neutral-400">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
