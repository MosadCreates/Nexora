/**
 * Rate Limiting — Fix #3 + Fix #6 (Audit 2)
 *
 * Uses Upstash Redis + @upstash/ratelimit for Vercel-compatible rate limiting.
 * Three tiers: analyze (per-user), checkout (per-user), general (per-IP/user).
 * + IP-based limiter as secondary protection layer.
 *
 * FIX #6 (Audit 2): Changed from fail-open to fail-closed. If Redis is
 * unavailable, requests are DENIED (503) to prevent abuse.
 *
 * Environment variables required:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { logger } from '@/lib/logger'

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error('Upstash Redis credentials not configured')
  }
  return new Redis({ url, token })
}

let redisInstance: Redis | null = null

function redis(): Redis {
  if (!redisInstance) {
    redisInstance = getRedis()
  }
  return redisInstance
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

/** IP-based limiter as secondary protection (Fix #6 Audit 2) */
export const ipLimiter = new Ratelimit({
  redis: (() => {
    try { return getRedis() } catch { return Redis.fromEnv() }
  })(),
  limiter: Ratelimit.slidingWindow(50, '60 s'),
  prefix: 'ratelimit:ip',
  analytics: true,
})

/**
 * Internal: check a single limiter against an identifier.
 * Returns a 429 Response if rate limited, null if allowed.
 */
async function checkLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<Response | null> {
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
}

/**
 * Apply a rate limiter to an identifier.
 * Returns a Response with 429 status if rate limited, or 503 if Redis unavailable.
 * Returns null if the request is allowed.
 *
 * Fix #6 (Audit 2): Fails CLOSED — if Redis is unavailable, returns 503.
 * Also applies IP-based rate limiting if request is provided.
 */
export async function applyRateLimit(
  limiter: Ratelimit,
  identifier: string,
  request?: Request
): Promise<Response | null> {
  try {
    // Apply user/endpoint specific limit
    const userResult = await checkLimit(limiter, identifier)
    if (userResult) return userResult

    // Also apply IP limit if request provided (Fix #6 Audit 2)
    if (request) {
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
      const ipResult = await checkLimit(ipLimiter, ip)
      if (ipResult) return ipResult
    }

    return null
  } catch (err) {
    // Fix #6 (Audit 2): FAIL CLOSED — if Redis is unavailable, deny the request
    logger.error('[rateLimit] Redis unavailable — failing closed', {
      error: (err as Error).message,
    })
    return new Response(
      JSON.stringify({
        error: 'Service temporarily unavailable. Please try again.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
