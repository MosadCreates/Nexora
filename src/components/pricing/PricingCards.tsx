'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { BackgroundBeams } from '@/components/ui/aceternity/background-beams'
import { GridBackground } from '../ui/aceternity/background-grid'
import { useRouter } from 'next/navigation'
import { SubscriptionPlan } from '@/types'
import * as Sentry from '@sentry/nextjs'
import { createBrowserClient } from '@supabase/ssr'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, X } from 'lucide-react'
import { AnnualBanner } from '@/components/pricing/AnnualBanner'

interface PricingCardsProps {
  currentPlan?: SubscriptionPlan
  onUpgrade?: (plan: SubscriptionPlan) => void
  userEmail?: string
  userId?: string
  accessToken?: string
}

const PricingCards: React.FC<PricingCardsProps> = ({
  currentPlan,
  onUpgrade,
  userEmail,
  userId,
  accessToken: accessTokenProp
}) => {
  const [billPlan, setBillPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [sessionToken, setSessionToken] = useState<string | undefined>(accessTokenProp)
  const [sessionEmail, setSessionEmail] = useState<string | undefined>(userEmail)
  const [sessionUserId, setSessionUserId] = useState<string | undefined>(userId)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const router = useRouter()

  // Self-fetch session so this component works even when the parent
  // page is statically rendered and passes no auth props.
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionToken(session.access_token)
        setSessionEmail(session.user.email ?? undefined)
        setSessionUserId(session.user.id)
      }
    })

    // Clear loading state when navigating back from external checkout (bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(null)
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const handleUpgrade = async (
    planId: SubscriptionPlan
  ) => {
    // Handle free tier
    if (planId === 'hobby') {
      router.push('/signup')
      return
    }

    // Handle enterprise (contact sales)
    if (planId === 'enterprise') {
      router.push('/contact')
      return
    }

    // Check if user is logged in
    if (!sessionEmail || !sessionUserId) {
      router.push('/login')
      return
    }

    // Handle paid tiers (starter, pro)
    try {
      setLoading(planId)
      
      // Determine the correct Product ID based on the billing cycle
      let targetProductId = ''
      if (planId === 'starter') {
        targetProductId = billPlan === 'monthly' 
          ? process.env.NEXT_PUBLIC_POLAR_STARTER_MONTHLY_ID || ''
          : process.env.NEXT_PUBLIC_POLAR_STARTER_YEARLY_ID || ''
      } else if (planId === 'professional') {
        targetProductId = billPlan === 'monthly'
          ? process.env.NEXT_PUBLIC_POLAR_PROFESSIONAL_MONTHLY_ID || ''
          : process.env.NEXT_PUBLIC_POLAR_PROFESSIONAL_YEARLY_ID || ''
      }

      if (!targetProductId) {
        throw new Error('Product not configured for this billing cycle')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {})
        },
        body: JSON.stringify({
          productId: targetProductId,
          successUrl: `${window.location.origin}/analysis?checkout=success`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout')
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error))
      Sentry.captureException(err)
      setCheckoutError(`Failed to start checkout: ${err.message}`)
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'hobby',
      name: 'Hobby',
      monthlyPrice: '$0',
      yearlyPrice: '$0',
      yearlyMonthlyEquivalent: '$0',
      yearlySavings: 0,
      yearlyTotal: '$0',
      description: 'Perfect for exploring competitor intelligence.',
      features: [
        '3 analyses per month',
        'Full AI intelligence reports',
        'Export as PDF, JSON, CSV',
        'Analysis history saved',
        'Email support',
      ],
      buttonText: 'Get Started Free',
      highlight: false,
      badge: null,
    },
    {
      id: 'starter',
      name: 'Starter',
      monthlyPrice: '$19',      // ← Early bird price
      yearlyPrice: '$189',       // ← Annual total
      yearlyMonthlyEquivalent: '$15.75', // ← Per month
      yearlySavings: 39,         // ← Annual savings vs monthly
      yearlyTotal: '$189',
      description: 'For founders and small teams.',
      features: [
        'Everything in Hobby, plus',
        '20 analyses per month',
        'Competitor weakness matrix',
        'Market gap analysis',
        'Strategic recommendations',
        'Priority email support',
      ],
      buttonText: 'Start Free Trial',
      highlight: false,
      badge: '🔥 Early Bird',
    },
    {
      id: 'professional',
      name: 'Professional',
      monthlyPrice: '$49',
      yearlyPrice: '$489',
      yearlyMonthlyEquivalent: '$40.75',
      yearlySavings: 99,
      yearlyTotal: '$489',
      description: 'For serious competitive advantage.',
      features: [
        'Everything in Starter, plus',
        '60 analyses per month',
        'Advanced strategic mapping',
        'Custom dashboard views',
        'Priority 24/7 support',
        'Team sharing (coming soon)',
      ],
      buttonText: 'Go Professional',
      highlight: true,
      badge: '⭐ Most Popular',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      yearlyMonthlyEquivalent: 'Custom',
      yearlySavings: 0,
      yearlyTotal: 'Custom',
      description: 'For large organizations and agencies.',
      features: [
        'Everything in Professional, plus',
        'Unlimited analyses',
        'Custom AI training',
        'SLA guarantee',
        'Dedicated account manager',
        'Custom integrations',
      ],
      buttonText: 'Contact Sales',
      highlight: false,
      badge: null,
      priceCustom: true,
    },
  ]

  return (
    <div className='w-full flex flex-col items-center justify-center bg-white dark:bg-black relative'>
      <AnimatePresence>
        {checkoutError && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-24 right-4 z-[100] md:right-8 lg:right-12 w-[calc(100vw-2rem)] sm:w-[380px]"
          >
            <div className="flex items-start gap-4 bg-white dark:bg-[#0F172A] border border-red-200 dark:border-red-900/50 shadow-2xl rounded-xl p-4 w-full dark:shadow-red-900/10 backdrop-blur-xl">
              <div className="flex-shrink-0 mt-0.5">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="flex-1 w-0">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Checkout Error
                </p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {checkoutError}
                </p>
              </div>
              <div className="flex-shrink-0 flex ml-4">
                <button
                  type="button"
                  className="inline-flex rounded-md bg-transparent text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 transition-colors"
                  onClick={() => setCheckoutError(null)}
                >
                  <span className="sr-only">Close</span>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GridBackground
        className='w-full'
        containerClassName='h-auto min-h-fit py-10 flex flex-col items-center justify-start overflow-hidden'
      >
        {/* Background Beams for Header and Cards only */}
        <BackgroundBeams className='absolute inset-0 w-full h-full z-0' />

        {/* Header Section */}
        <div className='relative w-full flex flex-col items-center justify-center py-10 pt-24 md:pt-40 pb-10 z-20'>
          <div className="w-full max-w-5xl mx-auto px-4 z-50">
            <AnnualBanner />
          </div>
          <div className='px-4 text-center'>
            <h1 className='max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight'>
              Simple pricing for your ease
            </h1>
            <h2 className='text-sm md:text-base max-w-4xl my-4 mx-auto text-muted font-normal dark:text-muted-dark text-center'>
              <span
                style={{
                  display: 'inline-block',
                  verticalAlign: 'top',
                  textDecoration: 'inherit',
                  textWrap: 'balance'
                }}
              >
                Nexora offers a wide range of services. You can choose the one
                that suits your needs. Select from your favourite plan and get
                started instantly.
              </span>
            </h2>
          </div>

          {/* Billing Toggle */}
          <div className="flex flex-col items-center gap-3 mt-14 mb-8">
            <div className="flex items-center gap-3 bg-neutral-100 
                            dark:bg-neutral-800 p-1 rounded-xl">
              <button
                onClick={() => setBillPlan('monthly')}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  billPlan === 'monthly'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
                )}
              >
                Monthly
              </button>
              
              <button
                onClick={() => setBillPlan('yearly')}
                className={cn(
                  'px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  billPlan === 'yearly'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700'
                )}
              >
                Annual
                <span className={cn(
                  'text-xs font-bold px-2 py-0.5 rounded-full transition-all',
                  billPlan === 'yearly'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                )}>
                  2 months free
                </span>
              </button>
            </div>
            
            {/* Savings callout — only shows when annual is selected */}
            <AnimatePresence>
              {billPlan === 'yearly' && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-green-600 dark:text-green-400 
                             font-medium"
                >
                  🎉 You save up to $99/year on the Professional plan
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className='mx-auto mt-4 md:mt-8 grid relative z-20 grid-cols-1 gap-4 items-center sm:grid-cols-2 xl:grid-cols-4 max-w-[1400px] px-4 pb-20'>
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={cn(
                'rounded-lg px-6 py-8 mx-0 h-full flex flex-col justify-between',
                plan.highlight
                  ? 'relative bg-[radial-gradient(164.75%_100%_at_50%_0%,#334155_0%,#0F172A_48.73%)] shadow-2xl'
                  : 'bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800'
              )}
            >
              <div className=''>
                <div className="flex items-center justify-between">
                  <h3
                    id={`tier-${plan.id}`}
                    className={cn(
                      'text-base font-semibold leading-7',
                      plan.highlight
                        ? 'text-white'
                        : 'text-muted dark:text-muted-dark'
                    )}
                  >
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className={cn(
                      "text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center",
                      plan.highlight 
                        ? "bg-white text-black" 
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700"
                    )}>
                      {plan.badge}
                    </span>
                  )}
                </div>
                
                <div className="mt-4">
                  {billPlan === 'yearly' && plan.yearlySavings > 0 ? (
                    <div>
                      {/* Annual savings badge */}
                      <div className="inline-flex items-center gap-1.5 
                                      bg-green-100 dark:bg-green-900/30 
                                      text-green-700 dark:text-green-400 
                                      text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                        <span>✓</span>
                        <span>Save ${plan.yearlySavings}/year</span>
                      </div>
                      
                      {/* Main price - annual total */}
                      <div className="flex items-end gap-1">
                        <span className={cn(
                          'text-4xl font-bold tracking-tight inline-block',
                          plan.highlight
                            ? 'text-white'
                            : 'text-neutral-900 dark:text-neutral-200'
                        )}>
                          {plan.yearlyPrice}
                        </span>
                        <span className="text-sm font-normal mb-1.5 opacity-70">/year</span>
                      </div>
                      
                      {/* Per month breakdown */}
                      <p className={cn("text-sm mt-1", plan.highlight ? "text-neutral-300" : "text-neutral-500 dark:text-neutral-400")}>
                        {plan.yearlyMonthlyEquivalent}/mo · billed annually
                      </p>
                      
                      {/* Original price strikethrough */}
                      <p className={cn("text-xs mt-0.5 line-through", plan.highlight ? "text-neutral-400" : "text-neutral-400")}>
                        {plan.monthlyPrice}/mo if billed monthly
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 pt-10">
                      <span
                        className={cn(
                          'text-4xl font-bold tracking-tight inline-block',
                          plan.highlight
                            ? 'text-white'
                            : 'text-neutral-900 dark:text-neutral-200'
                        )}
                      >
                        {plan.monthlyPrice}
                        {!plan.priceCustom && (
                          <span className='text-sm font-normal opacity-70'>/mo</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <p
                  className={cn(
                    'mt-6 text-sm leading-7 h-12 md:h-12 xl:h-12',
                    plan.highlight
                      ? 'text-neutral-300'
                      : 'text-neutral-600 dark:text-neutral-300'
                  )}
                >
                  {plan.description}
                </p>
                <ul
                  role='list'
                  className={cn(
                    'mt-8 space-y-3 text-sm leading-6 sm:mt-10',
                    plan.highlight
                      ? 'text-neutral-300'
                      : 'text-neutral-600 dark:text-neutral-300'
                  )}
                >
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className='flex gap-x-3'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='currentColor'
                        stroke='none'
                        className={cn(
                          'tabler-icon tabler-icon-circle-check-filled h-6 w-5 flex-none',
                          plan.highlight
                            ? 'text-white'
                            : 'text-muted dark:text-muted-dark'
                        )}
                        aria-hidden='true'
                      >
                        <path d='M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z'></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <button
                  onClick={() => handleUpgrade(plan.id as SubscriptionPlan)}
                  disabled={loading === plan.id}
                  className={cn(
                    'relative z-10 border border-transparent md:text-sm transition duration-200 items-center justify-center mt-8 rounded-full py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10 block w-full disabled:opacity-50 disabled:cursor-not-allowed',
                    plan.highlight
                      ? 'bg-white text-black shadow-sm hover:bg-white/90 focus-visible:outline-white'
                      : 'bg-neutral-900 text-white hover:bg-black/90 shadow-[0px_-1px_0px_0px_#FFFFFF40_inset,_0px_1px_0px_0px_#FFFFFF40_inset]'
                  )}
                  aria-describedby={`tier-${plan.id}`}
                >
                  {loading === plan.id ? 'Loading...' : plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </GridBackground>

      {/* Feature Comparison Table */}
      <div className='max-w-[1400px] mx-auto px-4 mt-20 mb-20 relative z-20 w-full overflow-x-auto hidden md:block'>
        <div className='inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8'>
          <table className='min-w-full divide-y divide-neutral-200 dark:divide-neutral-800'>
            <thead>
              <tr>
                <th
                  scope='col'
                  className='max-w-xs py-3.5 pl-4 pr-3 text-left text-3xl font-extrabold text-neutral-900 dark:text-white sm:pl-0'
                ></th>
                <th
                  scope='col'
                  className='px-3 py-3.5 text-center text-lg font-semibold text-neutral-900 dark:text-white'
                >
                  Hobby
                </th>
                <th
                  scope='col'
                  className='px-3 py-3.5 text-center text-lg font-semibold text-neutral-900 dark:text-white'
                >
                  Starter
                </th>
                <th
                  scope='col'
                  className='px-3 py-3.5 text-center text-lg font-semibold text-neutral-900 dark:text-white'
                >
                  Professional
                </th>
                <th
                  scope='col'
                  className='px-3 py-3.5 text-center text-lg font-semibold text-neutral-900 dark:text-white'
                >
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-neutral-800'>
              {[
                'Competitive Scans',
                'Market Drift Monitoring',
                'Sentiment Synthesis',
                'Strategic Mapping',
                'Weekly Newsletters',
                'Custom API Access',
                'Exportable Reports'
              ].map(feature => (
                <tr key={feature}>
                  <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-900 dark:text-white sm:pl-0'>
                    {feature}
                  </td>
                  {[1, 2, 3, 4].map(col => (
                    <td
                      key={col}
                      className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                      >
                        <path d='M5 12l5 5l10 -10'></path>
                      </svg>
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-900 dark:text-white sm:pl-0'>
                  Foresight Engine
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  Limited
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  Essential
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                  >
                    <path d='M5 12l5 5l10 -10'></path>
                  </svg>
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                  >
                    <path d='M5 12l5 5l10 -10'></path>
                  </svg>
                </td>
              </tr>
              <tr>
                <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-900 dark:text-white sm:pl-0'>
                  Custom Data Ingestion
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  Manual
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  Semi-Auto
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                  >
                    <path d='M5 12l5 5l10 -10'></path>
                  </svg>
                </td>
                <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                  >
                    <path d='M5 12l5 5l10 -10'></path>
                  </svg>
                </td>
              </tr>
              {[
                'Self-Hosting Support',
                'Analyst Consultations',
                'Custom White-labeling',
                'SLA Guarantee',
                'On-prem Deployment',
                'Priority Data Access'
              ].map(feature => (
                <tr key={feature}>
                  <td className='whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-neutral-900 dark:text-white sm:pl-0'>
                    {feature}
                  </td>
                  <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'></td>
                  <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'></td>
                  <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                    {feature === 'Self-Hosting Support' ||
                    feature === 'Priority Data Access' ? (
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                      >
                        <path d='M5 12l5 5l10 -10'></path>
                      </svg>
                    ) : null}
                  </td>
                  <td className='whitespace-nowrap px-3 py-4 text-sm text-muted dark:text-muted-dark text-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='tabler-icon tabler-icon-check mx-auto h-4 w-4 flex-shrink-0 text-black dark:text-white'
                    >
                      <path d='M5 12l5 5l10 -10'></path>
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default PricingCards
