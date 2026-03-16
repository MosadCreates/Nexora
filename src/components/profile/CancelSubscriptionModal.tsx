import React, { useState } from 'react'
import { X, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

import { SubscriptionPlan } from '../../types'

interface CancelSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionId: string
  currentPlan: SubscriptionPlan
  endDate?: string
  userId: string
  onCancelSuccess: () => void
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  subscriptionId,
  currentPlan,
  endDate,
  userId,
  onCancelSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleCancel = async () => {
    setIsProcessing(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      // Get the current session token for auth
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('You must be logged in to cancel your subscription.')
      }

      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        }
      })

      let data: any
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.error('Non-JSON response received during cancellation:', text)
        throw new Error(
          `Server Error (${response.status}): Failed to process cancellation. Please contact support if the issue persists.`
        )
      }

      if (!response.ok) {
        const errorMsg =
          typeof data.error === 'object'
            ? data.error.message || JSON.stringify(data.error)
            : data.error || 'Failed to cancel subscription'
        throw new Error(errorMsg)
      }

      // Success! Webhook will update the database automatically.
      // The UI will refresh via Realtime subscription listener.
      setStatus('success')
      setIsProcessing(false)

      // Auto-close and refresh parent after showing success message
      setTimeout(() => {
        onCancelSuccess()
        onClose()
      }, 2000)
    } catch (error: any) {
      console.error('Cancellation error:', error)
      setStatus('error')
      setErrorMessage(
        error.message || 'Failed to cancel subscription. Please try again.'
      )
      setIsProcessing(false)
    }
  }

  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : 'the end of your billing period'

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200'>
      <div className='bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 duration-200'>
        {/* Header */}
        <div className='relative p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800'>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className='absolute right-4 top-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50'
          >
            <X className='w-5 h-5 text-neutral-500' />
          </button>

          <div className='flex items-start gap-4'>
            <div className='p-3 rounded-full bg-amber-100 dark:bg-amber-900/20'>
              <AlertTriangle className='w-6 h-6 text-amber-600 dark:text-amber-400' />
            </div>
            <div>
              <h2 className='text-xl font-bold text-neutral-900 dark:text-white'>
                Cancel Subscription?
              </h2>
              <p className='text-sm text-neutral-600 dark:text-neutral-400 mt-1'>
                You're about to cancel your{' '}
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}{' '}
                plan
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className='p-6 space-y-4'>
          {status === 'idle' && (
            <>
              <div className='space-y-3'>
                <div className='flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50'>
                  <div className='mt-0.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500'></div>
                  </div>
                  <p className='text-sm text-neutral-700 dark:text-neutral-300'>
                    You'll keep full access until{' '}
                    <strong>{formattedEndDate}</strong>
                  </p>
                </div>

                <div className='flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50'>
                  <div className='mt-0.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500'></div>
                  </div>
                  <p className='text-sm text-neutral-700 dark:text-neutral-300'>
                    After that, you'll be moved to the{' '}
                    <strong>Free plan</strong> (3 analyses/month)
                  </p>
                </div>

                <div className='flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50'>
                  <div className='mt-0.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500'></div>
                  </div>
                  <p className='text-sm text-neutral-700 dark:text-neutral-300'>
                    You can reactivate your subscription anytime from the
                    Pricing page
                  </p>
                </div>
              </div>

              <div className='mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800'>
                <p className='text-xs text-blue-700 dark:text-blue-300'>
                  <strong>No charges will be applied</strong> after your current
                  period ends. Your saved analyses will remain accessible.
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className='py-8 text-center space-y-3'>
              <div className='inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/20'>
                <CheckCircle2 className='w-8 h-8 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-neutral-900 dark:text-white'>
                  Subscription Canceled
                </h3>
                <p className='text-sm text-neutral-600 dark:text-neutral-400 mt-1'>
                  You'll keep access until {formattedEndDate}
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className='py-6 space-y-4'>
              <div className='flex items-start gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'>
                <XCircle className='w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5' />
                <div>
                  <h3 className='text-sm font-semibold text-red-900 dark:text-red-100'>
                    Cancellation Failed
                  </h3>
                  <p className='text-xs text-red-700 dark:text-red-300 mt-1'>
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 pt-0 flex gap-3'>
          {status === 'idle' && (
            <>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className='flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50'
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className='flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {isProcessing ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <button
                onClick={onClose}
                className='flex-1 px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors'
              >
                Close
              </button>
              <button
                onClick={handleCancel}
                disabled={isProcessing}
                className='flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors disabled:opacity-50'
              >
                Try Again
              </button>
            </>
          )}

          {status === 'success' && (
            <button
              onClick={() => {
                onCancelSuccess()
                onClose()
              }}
              className='w-full px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium text-sm hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors'
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CancelSubscriptionModal
