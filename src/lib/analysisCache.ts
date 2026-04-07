/**
 * Analysis Result Cache — Edge-compatible
 *
 * Uses Web Crypto API (works in both Node.js 20+ and Edge Runtime).
 * SHA-256 hash of normalized query → cached JSON result in Upstash Redis.
 * TTL: 24 hours (86 400 seconds).
 * Cache keys namespaced by userId to prevent cross-user data leakage.
 */

import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ')
}

async function hashQuery(query: string): Promise<string> {
  const normalized = normalizeQuery(query)
  const msgBuffer = new TextEncoder().encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const CACHE_TTL = 86_400 // 24 hours in seconds
const KEY_PREFIX = 'analysis_cache:'

export async function getCachedAnalysis(
  query: string,
  userId: string
): Promise<unknown | null> {
  try {
    const r = getRedis()
    if (!r) return null
    const hash = await hashQuery(query)
    const key = KEY_PREFIX + userId + ':' + hash
    const cached = await r.get(key)
    return cached ?? null
  } catch {
    return null
  }
}

export async function setCachedAnalysis(
  query: string,
  userId: string,
  result: unknown
): Promise<void> {
  try {
    const r = getRedis()
    if (!r) return
    const hash = await hashQuery(query)
    const key = KEY_PREFIX + userId + ':' + hash
    await r.set(key, JSON.stringify(result), { ex: CACHE_TTL })
  } catch {
    // Silently fail — cache is an optimisation, not critical path
  }
}
