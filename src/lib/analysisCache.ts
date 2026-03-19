/**
 * Analysis Result Cache — Fix #9 + Fix #7 (Audit 2)
 *
 * SHA-256 hash of normalized query → cached JSON result in Upstash Redis.
 * TTL: 24 hours (86 400 seconds).
 *
 * Fix #7 (Audit 2): Cache keys are now namespaced by userId to prevent
 * cross-user data leakage.
 */

import { Redis } from '@upstash/redis'
import crypto from 'crypto'

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

function hashQuery(query: string): string {
  return crypto.createHash('sha256').update(normalizeQuery(query)).digest('hex')
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
    const key = KEY_PREFIX + userId + ':' + hashQuery(query)
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
    const key = KEY_PREFIX + userId + ':' + hashQuery(query)
    await r.set(key, JSON.stringify(result), { ex: CACHE_TTL })
  } catch {
    // Silently fail — cache is an optimisation, not critical path
  }
}
