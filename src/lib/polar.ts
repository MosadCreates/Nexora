/**
 * Polar Checkout Helper
 *
 * Uses the /api/checkout server-side route to create a Polar checkout session.
 * The server holds the POLAR_ORGANIZATION_TOKEN — never expose it to the client.
 *
 * Fix #2: Auth token is now required and passed in the Authorization header.
 * The server derives the userId from the session — never trust client-provided userId.
 */

export async function redirectToPolarCheckout(
  productId: string,
  accessToken: string,
  email?: string
) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      productId,
      email,
      successUrl: `${window.location.origin}/analysis?checkout=success`,
      cancelUrl: `${window.location.origin}/pricing`,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create checkout session')
  }

  if (data.url) {
    window.location.href = data.url
  } else {
    throw new Error('No checkout URL returned')
  }
}
