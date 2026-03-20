import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PageTransition } from "@/components/PageTransition";
import { CookieConsentBanner } from '@/components/CookieConsent'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: {
    default: "Nexora | AI Competitor Analysis & Market Intelligence",
    template: "%s | Nexora",
  },
  description: "Nexora uses advanced artificial intelligence to analyze market shifts, competitor movements, and emerging trends.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://nexoraintel.com'),
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://nexoraintel.com',
  },
  verification: {
    google: 'pCeGa4cdenAr1X3NoeHCMP_xrC_73lkISmpcoWhDWA4', // just the content value, not the full tag
  },
  openGraph: {
    title: "Nexora | See what's next in your market",
    description: "AI-powered competitor analysis that uncovers weaknesses and market opportunities.",
    url: '/',
    siteName: 'Nexora',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nexora — AI Competitor Intelligence',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Nexora | See what's next in your market",
    description: "AI-powered competitor analysis that uncovers weaknesses and market opportunities.",
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nexora.app'

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Nexora',
    url: baseUrl,
    logo: `${baseUrl}/og-image.png`,
    sameAs: [
      // Add social URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: `${baseUrl}/contact`,
    },
  }

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Nexora',
    applicationCategory: 'BusinessApplication',
    description: 'AI-powered competitor analysis and market intelligence platform',
    url: baseUrl,
    offers: [
      {
        '@type': 'Offer',
        name: 'Hobby',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Starter',
        price: '49',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
      {
        '@type': 'Offer',
        name: 'Professional',
        price: '199',
        priceCurrency: 'USD',
        billingIncrement: 'P1M',
      },
    ],
    operatingSystem: 'Web Browser',
    applicationSuite: 'Nexora Intelligence Suite',
  }

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(organizationSchema) 
        }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify(softwareSchema) 
        }}
      />
    </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased font-inter`}>
        <ThemeProvider>
          <AuthProvider>
            <PageTransition />
            {children}
          </AuthProvider>
        </ThemeProvider>
        <CookieConsentBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
