// Fix #13 (Audit 2): Sentry Client Configuration
//
// IMPORTANT: Configure allowed origins in Sentry dashboard:
// Settings → Projects → nexora → Security Headers →
// Add your domain to "Allowed Domains" to prevent
// unauthorized error submissions from other origins.

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  debug: false,

  // Only send errors in production
  enabled: process.env.NODE_ENV === 'production',

  // Filter out non-app errors to reduce noise
  beforeSend(event) {
    // Ignore errors from browser extensions
    if (
      event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('extension://')
      )
    ) {
      return null
    }
    return event
  },
})
