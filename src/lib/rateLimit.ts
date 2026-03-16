/**
 * Rate Limiting — Fix #3
 *
 * Uses Upstash Redis + @upstash/ratelimit for Vercel-compatible rate limiting.
 * Three tiers: analyze (per-user), checkout (per-user), general (per-IP/user).
 *
 * Environment variables required:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error('Upstash Redis credentials not configured')
  }
  return new Redis({ url, token })
}

/** 10 requests per 60 seconds per user (for AI analysis) */
export const analyzeLimiter = new Ratelimit({
  redis: (() => {
    try { return getRedis() } catch { return Redis.fromEnv() }
  })(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'ratelimit:analyze',
  analytics: true,
})

/** 5 requests per 60 minutes per user (for checkout) */
export const checkoutLimiter = new Ratelimit({
  redis: (() => {
    try { return getRedis() } catch { return Redis.fromEnv() }
  })(),
  limiter: Ratelimit.slidingWindow(5, '60 m'),
  prefix: 'ratelimit:checkout',
  analytics: true,
})

/** 30 requests per 60 seconds per identifier (general fallback) */
export const generalLimiter = new Ratelimit({
  redis: (() => {
    try { return getRedis() } catch { return Redis.fromEnv() }
  })(),
  limiter: Ratelimit.slidingWindow(30, '60 s'),
  prefix: 'ratelimit:general',
  analytics: true,
})

/**
 * Apply a rate limiter to an identifier.
 * Returns a NextResponse with 429 status and Retry-After header if rate limited.
 * Returns null if the request is allowed.
 */
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<Response | null> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier)
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': String(remaining),
          },
        }
      )
    }
    return null
  } catch (err) {
    // If Redis is unavailable, allow the request (fail-open)
    console.warn('[rateLimit] Redis unavailable, failing open:', (err as Error).message)
    return null
  }
}
