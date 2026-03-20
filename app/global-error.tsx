'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-black flex items-center justify-center font-sans">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
          <p className="text-neutral-400 mb-8 text-sm leading-relaxed">
            An unexpected error occurred. Our team has been notified and is working on a fix.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
