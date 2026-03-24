import React, { useState, useEffect } from 'react'
import { UserProfile, SubscriptionPlan } from '../../types'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  CreditCard,
  ShieldCheck,
  Calendar,
  Zap,
  Activity,
  ExternalLink,
  BookOpen,
  LifeBuoy,
  PlusCircle
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/aceternity/moving-border'
import { BackgroundBeams } from '../ui/aceternity/background-beams'
import { GridBackground } from '../ui/aceternity/background-grid'
import { PlanFeatureList } from '../ui/PlanFeatureList'
import { getPlanConfig } from '../../lib/planFeatures'
import CancelSubscriptionModal from './CancelSubscriptionModal'
import { DeleteAccountModal } from './DeleteAccountModal'

import { useSubscription } from '../../hooks/useSubscription'
import { resolveEffectivePlan } from '../../lib/accessControl'
import { useTour } from '../../hooks/useTour'

const Profile: React.FC = () => {
  const { session, profile, fetchProfile } = useAuth()
  const { subscription, effectivePlan, loading: subLoading } = useSubscription()
  const router = useRouter()
  const { startTour } = useTour()

  const currentPlan = effectivePlan
  const planConfig = getPlanConfig(currentPlan)
  const maxCredits = planConfig.credits

  const remainingCredits = profile
    ? maxCredits === Infinity
      ? 'Unlimited'
      : Math.max(0, maxCredits - profile.credits_used)
    : 0

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
      'Anonymous Analyst'
    : 'Anonymous Analyst'

  const stats = [
    {
      label: 'Credits Used',
      value: profile?.credits_used || 0,
      icon: <Activity className='w-4 h-4' />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Credits Remaining',
      value: remainingCredits,
      icon: <Zap className='w-4 h-4' />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    {
      label: 'Plan Status',
      value: <span className='capitalize'>{currentPlan} Plan</span>,
      icon: <ShieldCheck className='w-4 h-4' />,
      color: currentPlan !== 'hobby' ? 'text-green-500' : 'text-neutral-400',
      bg: currentPlan !== 'hobby' ? 'bg-green-500/10' : 'bg-neutral-500/10'
    }
  ]

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleManageSubscription = () => {
    window.open('https://polar.sh/settings/subscriptions', '_blank')
  }

  const handleCancelClick = async () => {
    // The cancel API route fetches the subscriptionId from DB server-side,
    // so we just need to validate locally that the user has something to cancel.
    if (currentPlan === 'hobby') {
      alert('You are on the hobby plan. There is no subscription to cancel.')
      return
    }

    if (!subscription?.polar_subscription_id) {
      // If no subscription row found locally, direct to Polar management
      const confirmManage = confirm(
        'Could not find your subscription details.\n\n' +
          'Would you like to manage your subscription directly in Polar?'
      )
      if (confirmManage) {
        window.open('https://polar.sh/settings/subscriptions', '_blank')
      }
      return
    }

    setShowCancelModal(true)
  }

  const handleCancelSuccess = async () => {
    // Fix #9: Refresh profile through context instead of full page reload
    if (session) {
      await fetchProfile(session as { user: { id: string; email?: string; user_metadata?: Record<string, string> } })
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  return (
    <div className='min-h-screen bg-white dark:bg-black w-full relative overflow-hidden'>
      {/* Subtle Background Beams */}
      <div className='absolute inset-0 z-0'>
        <BackgroundBeams />
      </div>

      <div className='max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10'>
        {/* Centered Identity Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='flex flex-col items-center text-center space-y-6 mb-20'
        >
          <div className='relative group'>
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000'></div>
            <div className='w-24 h-24 rounded-full bg-black border border-neutral-200 dark:border-white/10 flex items-center justify-center text-blue-400 font-bold text-3xl shadow-xl relative z-10 overflow-hidden'>
              {profile?.first_name?.[0] || session?.user?.email?.[0]?.toUpperCase()}
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-center gap-3'>
              <h1 className='text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white'>
                {fullName}
              </h1>
              <span className='px-3 py-1 rounded-md bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-neutral-500'>
                {currentPlan} Plan
              </span>
            </div>
            <p className='text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed'>
              Intelligence Analyst specializing in market intelligence synthesis and neural-driven data extraction. 
              Allocating bandwidth for next-generation insights.
            </p>
          </div>
        </motion.section>

        {/* Portfolio-Style Project Grid */}
        <div className='space-y-16'>
          <section>
            <h2 className='text-sm font-bold uppercase tracking-[0.2em] text-neutral-400 mb-8 px-2 inline-block bg-neutral-100 dark:bg-white/5 py-1 rounded'>
              Active Modules
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
              
              {/* Project Card: Usage Monitor */}
              <motion.div 
                whileHover={{ y: -5 }}
                className='group'
              >
                <div className='rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-blue-500/10'>
                  {/* Card Header (Illustration Area) */}
                  <div className='aspect-[16/9] bg-white dark:bg-black/40 flex items-center justify-center p-10 relative overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent'></div>
                    <div className='w-full space-y-4 relative z-10'>
                      <div className='flex justify-between items-end'>
                        <span className='text-[10px] font-bold text-blue-500 uppercase tracking-widest'>Neural Capacity</span>
                        <span className='text-xs font-mono text-neutral-500'>{profile?.credits_used || 0} / {maxCredits === Infinity ? '∞' : maxCredits}</span>
                      </div>
                      <div className='h-3 w-full bg-neutral-200 dark:bg-white/5 rounded-full overflow-hidden'>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: maxCredits === Infinity ? '15%' : `${Math.min(100, ((profile?.credits_used || 0) / (maxCredits || 1)) * 100)}%` }}
                          className='h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                        />
                      </div>
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className='p-8 space-y-4'>
                    <h3 className='text-xl font-bold text-black dark:text-white group-hover:text-blue-500 transition-colors'>Neural Engine Capacity</h3>
                    <p className='text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal'>
                      Real-time tracking of your AI intelligence allocation and neural engine bandwidth for deep-scan synthesis.
                    </p>
                    <div className='pt-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400'>
                      <span className='px-2 py-1 rounded-md border border-neutral-200 dark:border-white/5'>Tokens</span>
                      <span className='px-2 py-1 rounded-md border border-neutral-200 dark:border-white/5'>Real-time</span>
                      <span className='px-2 py-1 rounded-md border border-neutral-200 dark:border-white/5 text-blue-500 border-blue-500/20'>Analytics</span>
                    </div>
                    <div className='pt-4'>
                      <a href='/analysis' className='text-xs font-bold text-blue-500 flex items-center gap-2 hover:gap-3 transition-all'>
                        INITIALIZE SCAN <PlusCircle className='w-3.5 h-3.5' />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Project Card: Access Protocol */}
              <motion.div 
                whileHover={{ y: -5 }}
                className='group'
              >
                <div className='rounded-3xl overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/10'>
                  {/* Card Header (Illustration Area) */}
                  <div className='aspect-[16/9] bg-white dark:bg-black/40 flex items-center justify-center p-10 relative overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent'></div>
                    <div className='text-center space-y-2 relative z-10'>
                      <div className='w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mx-auto border border-purple-500/20'>
                        <CreditCard className='w-8 h-8' />
                      </div>
                      <div className='text-[10px] font-bold text-neutral-400 uppercase tracking-widest pt-2'>Protocol Status</div>
                      <div className='text-xl font-bold text-black dark:text-white uppercase tracking-[0.2em]'>
                        {subscription?.status || 'Active'}
                      </div>
                    </div>
                  </div>
                  {/* Card Body */}
                  <div className='p-8 space-y-4'>
                    <h3 className='text-xl font-bold text-black dark:text-white group-hover:text-purple-500 transition-colors'>Access Protocol</h3>
                    <p className='text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal text-balance'>
                      Your current module level and synchronization periods for premium strategic intelligence features.
                    </p>
                    <div className='pt-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400'>
                      <span className={cn('px-2 py-1 rounded-md border', currentPlan === 'hobby' ? 'text-blue-500 border-blue-500/10 bg-blue-500/5' : 'border-neutral-200 dark:border-white/5')}>Hobby</span>
                      <span className={cn('px-2 py-1 rounded-md border', currentPlan === 'starter' ? 'text-purple-500 border-purple-500/10 bg-purple-500/5' : 'border-neutral-200 dark:border-white/5')}>Starter</span>
                      <span className={cn('px-2 py-1 rounded-md border', (currentPlan === 'professional' || currentPlan === 'enterprise') ? 'text-purple-500 border-purple-500/10 bg-purple-500/5' : 'border-neutral-200 dark:border-white/5')}>Professional</span>
                    </div>

                    {/* Fix #8: Next billing date */}
                    {subscription?.current_period_end && subscription.status === 'active' && !subscription.cancel_at_period_end && (
                      <div className='flex items-center justify-between py-2 border-t border-neutral-200/50 dark:border-white/5 mt-3'>
                        <span className='text-[10px] font-bold uppercase tracking-widest text-neutral-400'>Next billing</span>
                        <span className='text-xs font-medium text-neutral-600 dark:text-neutral-300'>
                          {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Fix #8: Canceled grace period notice */}
                    {subscription?.status === 'canceled' && subscription?.current_period_end && (
                      <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3'>
                        <p className='text-[11px] text-amber-700 dark:text-amber-300'>
                          Your subscription is canceled. Access continues until{' '}
                          <strong>
                            {new Date(subscription.current_period_end).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </strong>
                        </p>
                      </div>
                    )}
                    <div className='pt-4 grid grid-cols-2 gap-3'>
                      {subscription?.status === 'active' && !subscription?.cancel_at_period_end ? (
                        <button 
                          onClick={handleCancelClick}
                          className='py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-[10px] uppercase tracking-widest transition-all'
                        >
                          CANCEL
                        </button>
                      ) : null}
                      <button 
                        onClick={handleUpgrade}
                        className={cn(
                          'py-2 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all',
                          subscription?.status === 'active' && !subscription?.cancel_at_period_end
                            ? 'border border-neutral-200 dark:border-white/10 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10'
                            : 'bg-black dark:bg-white text-white dark:text-black hover:scale-[1.05] col-span-2'
                        )}
                      >
                        {currentPlan === 'hobby' ? 'UPGRADE' : 'MANAGE'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </section>

          {/* Strategic Resources Section */}
          <section>
            <h2 className='text-sm font-bold uppercase tracking-[0.2em] text-neutral-400 mb-8 px-2 inline-block bg-neutral-100 dark:bg-white/5 py-1 rounded'>
              Strategic Support
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {[
                { title: 'Strategic Playbook', desc: 'Detailed documentation for intelligence flows.', icon: <BookOpen className='w-5 h-5' />, tag: 'DOCS' },
                { title: 'Analyst Concierge', desc: 'Direct uplink for priority support requests.', icon: <LifeBuoy className='w-5 h-5' />, tag: 'SUPPORT' },
                { title: 'Nexus Portal', desc: 'Manage your global intelligence infrastructure.', icon: <Activity className='w-5 h-5' />, tag: 'SYSTEM' }
              ].map((item, i) => (
                <motion.a 
                  key={i}
                  href='#'
                  whileHover={{ y: -5 }}
                  className='p-6 rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-zinc-900/50 flex flex-col gap-4 group transition-all duration-300 hover:shadow-xl hover:shadow-neutral-500/5'
                >
                  <div className='p-3 w-max rounded-xl bg-white dark:bg-black border border-neutral-200 dark:border-white/10 text-neutral-500 transition-colors group-hover:text-blue-500'>
                    {item.icon}
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-bold text-sm text-black dark:text-white'>{item.title}</h4>
                    <p className='text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal'>{item.desc}</p>
                  </div>
                  <div className='mt-auto pt-4 border-t border-neutral-200 dark:border-white/5'>
                    <span className='text-[8px] font-bold text-neutral-400 tracking-widest'>{item.tag}</span>
                  </div>
                </motion.a>
              ))}
            </div>
          </section>

          <section className='pt-12 border-t border-neutral-200 dark:border-white/5 text-center px-4'>
            <p className='text-[11px] text-neutral-400 italic font-medium leading-relaxed max-w-sm mx-auto'>
              "Information is the currency of the modern analyst. Strategy is the pattern in a stream of decisions."
            </p>
          </section>

          <div className='flex justify-center'>
            <button
              onClick={() => startTour()}
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition flex items-center gap-2"
            >
              <span>↺</span> Restart product tour
            </button>
          </div>

          {/* Danger Zone */}
          <div className='mt-8 border border-red-200 dark:border-red-800 rounded-2xl p-6'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-red-500 mb-2'>
              Danger Zone
            </h3>
            <p className='text-sm text-neutral-600 dark:text-neutral-400 mb-4'>
              Permanently delete your account and all associated data. 
              This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className='px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition'
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal onClose={() => setShowDeleteModal(false)} />
      )}

      {/* Cancellation Modal */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        subscriptionId={subscription?.polar_subscription_id || ''}
        currentPlan={currentPlan}
        endDate={subscription?.current_period_end}
        userId={profile?.id || ''}
        onCancelSuccess={handleCancelSuccess}
      />
    </div>
  )
}

export default Profile
