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
  // Fix #10: Security headers are set in middleware.ts (single source of truth).
  // Removed duplicate headers() config that was here previously.
  // Fix #4: TypeScript errors must now be fixed before deploy.
  // ignoreBuildErrors has been REMOVED intentionally.
};

export default withSentryConfig(nextConfig, {
  // Sentry build-time options (Fix #10)
  org: process.env.SENTRY_ORG || 'nexora',
  project: process.env.SENTRY_PROJECT || 'nexora-web',
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
