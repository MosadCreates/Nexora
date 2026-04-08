import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes requiring cookie-based session (pages):
const PROTECTED_PAGE_ROUTES = [
  '/analysis',
  '/profile',
  '/report',
  '/dashboard',
]

// API routes that need auth (return 401 at Edge for no token):
const PROTECTED_API_ROUTES = [
  '/api/analyze',
  '/api/checkout',
  '/api/cancel-subscription',
  '/api/account/delete',
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
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflareinsights.com",
  "script-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://www.every-ai.com https://assets.aceternity.com https://github.com https://avatars.githubusercontent.com https://api.iconify.design",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io https://o4509996976242688.ingest.de.sentry.io https://challenges.cloudflare.com https://static.cloudflareinsights.com https://cloudflareinsights.com https://api.iconify.design",
  "font-src 'self'",
  "frame-src https://challenges.cloudflare.com",
].join('; '),
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // ── FIX #21: Absolute immediate bypass for webhooks ────────────────
  // This is the first thing that happens. No headers, no supabase, no redirects.
  if (pathname.startsWith('/api/webhooks')) {
    return NextResponse.next()
  }

  // Create a response that we'll modify
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // At the TOP of the middleware function, before all other checks:
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  const isMaintenancePage = pathname === '/status' || pathname === '/api/health'

  if (maintenanceMode) {
    // Allow homepage, status page, health check, and critical webhooks
    const allowedInMaintenance = [
      '/', 
      '/status', 
      '/api/health', 
      '/api/webhooks/polar'
    ]
    const isAllowed = allowedInMaintenance.some(
      path => pathname === path || pathname.startsWith(path + '/')
    )
    
    if (!isAllowed) {
      // Redirect to homepage with maintenance message
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('maintenance', 'true')
      return NextResponse.redirect(url)
    }
  }

  // ── Create Supabase client in middleware ───────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
  cookiesToSet.forEach(({ name, value }: { name: string; value: string }) =>
    request.cookies.set(name, value)
  )
  response = NextResponse.next({
    request: { headers: request.headers },
  })
  cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
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

  // Check API routes first — fast path
  const isProtectedApi = PROTECTED_API_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedApi) {
    // Check for Bearer token OR cookie session
    const authHeader = request.headers.get('authorization')
    const hasBearerToken = authHeader?.startsWith('Bearer ')
    
    if (!hasBearerToken && !user) {
      // No auth at all — reject at Edge immediately
      // This prevents spinning up the full serverless function
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
    // Has token or session — let it through to the route handler
  }

  // Check page routes:
  const isProtectedPage = PROTECTED_PAGE_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  )

  if (isProtectedPage && !user) {
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
    // Exclude static assets and the webhook endpoint from middleware
    '/((?!api/webhooks|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
