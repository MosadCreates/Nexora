import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexora.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/', '/analysis', '/profile', '/dashboard'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
