// ============================================================
// IMPORTANT: Configure these alerts in Sentry Dashboard
// sentry.io → Your Project → Alerts → Create Alert
//
// Alert 1: Claude API Down
// Condition: Message contains "claude_stream" AND level = error
// Action: Email immediately
// Threshold: 1 occurrence
//
// Alert 2: High Error Rate  
// Condition: Error count > 10 in 5 minutes
// Action: Email immediately
//
// Alert 3: Credit Refund Spike
// Condition: Message contains "Credit refund" > 5 in 10 min
// Action: Email immediately (users are losing credits)
//
// Alert 4: Webhook Processing Failed
// Condition: Message contains "webhook" AND level = error
// Action: Email immediately (payment not processed)
// ============================================================

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
})
