'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'

interface DeleteAccountModalProps {
  onClose: () => void
}

export function DeleteAccountModal({ onClose }: DeleteAccountModalProps) {
  const [confirmation, setConfirmation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmation !== 'DELETE') return
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || 'Failed to delete account.')
        return
      }
      
      // Redirect to home after deletion
      router.push('/?deleted=true')
    } catch (err) {
      Sentry.captureException(err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 
                    flex items-center justify-center p-4'>
      <div className='bg-white dark:bg-neutral-900 rounded-2xl p-6 
                      max-w-md w-full shadow-2xl'>
        <h2 className='text-xl font-bold text-neutral-900 
                       dark:text-white mb-2'>
          Delete Account
        </h2>
        <p className='text-sm text-neutral-600 dark:text-neutral-400 mb-4'>
          This action is <strong>permanent and irreversible</strong>. 
          All your data including analysis history, reports, and 
          subscription will be permanently deleted.
        </p>
        
        <div className='bg-red-50 dark:bg-red-950/30 border border-red-200 
                        dark:border-red-800 rounded-xl p-4 mb-4'>
          <p className='text-sm text-red-700 dark:text-red-300'>
            ⚠️ What will be deleted:
          </p>
          <ul className='text-sm text-red-600 dark:text-red-400 mt-2 
                         space-y-1 list-disc list-inside'>
            <li>Your account and profile</li>
            <li>All analysis history and reports</li>
            <li>Your active subscription (canceled immediately)</li>
            <li>All personal data we hold about you</li>
          </ul>
        </div>

        <div className='mb-4'>
          <label className='text-sm font-medium text-neutral-700 
                             dark:text-neutral-300 block mb-2'>
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            type='text'
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder='DELETE'
            className='w-full px-3 py-2 rounded-lg border border-neutral-300 
                       dark:border-neutral-700 bg-white dark:bg-neutral-800 
                       text-neutral-900 dark:text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-red-500'
          />
        </div>

        {error && (
          <p className='text-sm text-red-600 dark:text-red-400 mb-4'>
            {error}
          </p>
        )}

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={loading}
            className='flex-1 px-4 py-2 rounded-lg border border-neutral-300 
                       dark:border-neutral-700 text-sm font-medium 
                       text-neutral-700 dark:text-neutral-300
                       hover:bg-neutral-50 dark:hover:bg-neutral-800 
                       transition disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmation !== 'DELETE' || loading}
            className='flex-1 px-4 py-2 rounded-lg bg-red-600 
                       hover:bg-red-700 text-white text-sm font-medium 
                       transition disabled:opacity-50 
                       disabled:cursor-not-allowed'
          >
            {loading ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
