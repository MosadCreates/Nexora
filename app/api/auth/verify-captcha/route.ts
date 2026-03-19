import { NextRequest, NextResponse } from 'next/server'

/**
 * Turnstile CAPTCHA Verification — Fix #10 (Audit 2)
 *
 * Verifies Cloudflare Turnstile tokens server-side before
 * allowing sensitive actions (login, signup).
 */
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Turnstile token is required' },
        { status: 400 }
      )
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
      // If Turnstile is not configured, allow the request (non-blocking)
      return NextResponse.json({ success: true })
    }

    const verifyResponse = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    )

    const result = await verifyResponse.json()

    if (!result.success) {
      return NextResponse.json(
        { error: 'CAPTCHA verification failed. Please try again.' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Verification service error' },
      { status: 500 }
    )
  }
}
