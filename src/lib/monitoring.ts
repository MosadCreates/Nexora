import * as Sentry from '@sentry/nextjs'

export const SLOW_THRESHOLD_MS = 25000 // 25s for AI analysis is "slow" but acceptable, >30s is a warning

export function reportPerformance(name: string, duration: number, metadata: Record<string, any> = {}) {
  console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`, metadata)

  // Report to Sentry as a breadcrumb or event if it exceeds thresholds
  if (duration > SLOW_THRESHOLD_MS) {
    Sentry.captureMessage(`Slow Performance Detect: ${name}`, {
      level: 'warning',
      extra: {
        duration_ms: duration,
        ...metadata
      },
      tags: {
        performance_issue: 'true',
        endpoint: name
      }
    })
  }

  // Also record as a transaction measurement if possible
  const span = Sentry.getActiveSpan()
  if (span) {
    span.setAttribute(`perf.${name}`, duration)
    // Sentry 8.x span measurements
    // @ts-ignore
    if (span.setMeasurement) {
       // @ts-ignore
       span.setMeasurement(name, duration, 'millisecond')
    }
  }
}

export class PerformanceTimer {
  private start: number
  private name: string

  constructor(name: string) {
    this.name = name
    this.start = performance.now()
  }

  stop(metadata: Record<string, any> = {}) {
    const duration = performance.now() - this.start
    reportPerformance(this.name, duration, metadata)
    return duration
  }
}
