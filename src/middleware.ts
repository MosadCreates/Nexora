import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ── Routes that require authentication ──────────────────────────────
const PROTECTED_ROUTES = [
  '/analysis',
  '/profile',
  '/report',
  '/dashboard',
  '/api/analyze',
  '/api/checkout',
  '/api/cancel-subscription',
]

// ── Routes that should redirect to /analysis if already logged in ──
const AUTH_ROUTES = ['/login', '/signup']

// ── Security headers applied to every response ─────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://images.unsplash.com https://www.every-ai.com https://assets.aceternity.com https://github.com https://www.google.com https://avatars.githubusercontent.com",
    "connect-src 'self' https://*.supabase.co https://*.upstash.io https://o4509996976242688.ingest.de.sentry.io https://challenges.cloudflare.com",
    "font-src 'self'",
    "frame-src https://challenges.cloudflare.com",
  ].join('; '),
}

export async function middleware(request: NextRequest) {
  // Create a response that we'll modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── Create Supabase client in middleware ───────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on the request for subsequent middleware/routes
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Also set on the response so they reach the browser
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── Refresh the session (prevents token expiry issues) ────────────
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // ── Protect authenticated routes ──────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtected && !user) {
    // API routes get 401, pages get redirected
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect logged-in users away from auth pages ─────────────────
  const isAuthRoute = AUTH_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  if (isAuthRoute && user) {
    const analysisUrl = request.nextUrl.clone()
    analysisUrl.pathname = '/analysis'
    return NextResponse.redirect(analysisUrl)
  }

  // ── Apply security headers to ALL responses ───────────────────────
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
}

// ── Matcher: exclude static files and images ────────────────────────
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
