import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Health Check Endpoint — Fix #12 (Audit 2)
 *
 * GET /api/health
 * Public: Returns minimal status info (status + timestamp only).
 * With x-health-key header: Returns full diagnostics.
 */
export async function GET(request: NextRequest) {
  const start = Date.now()
  let dbStatus: 'ok' | 'error' = 'error'

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Simple connectivity check with 5-second timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal)

      dbStatus = error ? 'error' : 'ok'
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    dbStatus = 'error'
  }

  const overallStatus = dbStatus === 'ok' ? 'ok' : 'degraded'

  // Fix #12 (Audit 2): Only return detailed info with the correct admin key
  const adminKey = request.headers.get('x-health-key')
  const isAdmin = adminKey && adminKey === process.env.HEALTH_CHECK_SECRET

  if (isAdmin) {
    // Full diagnostics for admin/monitoring
    const body = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
      responseTimeMs: Date.now() - start,
      services: {
        database: dbStatus,
        uptime: process.uptime(),
      },
    }

    return NextResponse.json(body, {
      status: overallStatus === 'ok' ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  // Public: minimal info only
  const body = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(body, {
    status: overallStatus === 'ok' ? 200 : 503,
    headers: { 'Cache-Control': 'no-store' },
  })
}
