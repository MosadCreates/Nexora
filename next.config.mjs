/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'www.every-ai.com' },
      { protocol: 'https', hostname: 'assets.aceternity.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
        ],
      },
    ]
  },
  experimental: {
    proxyPrefetch: true,
  },
  // Fix #4: TypeScript errors must now be fixed before deploy.
  // ignoreBuildErrors has been REMOVED intentionally.
};

export default withSentryConfig(nextConfig, {
  // Sentry build-time options (Fix #10)
  org: process.env.SENTRY_ORG || 'nexora',
  project: process.env.SENTRY_PROJECT || 'nexora-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
});
