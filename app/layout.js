import '@/src/index.css'
import Providers from './providers'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://densova.shop').replace(/\/$/, '')
const defaultDescription = 'Densova botanical hair rituals are slow-infused in small batches for strength, growth, and repair.'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Densova — Advanced Herbal Hair Infusion',
    template: '%s — Densova',
  },
  description: defaultDescription,
  applicationName: 'Densova',
  authors: [{ name: 'Densova', url: siteUrl }],
  creator: 'Densova',
  publisher: 'Densova',
  category: 'Beauty and personal care',
  keywords: ['Densova', 'herbal hair oil', 'botanical hair care', 'hair growth oil', 'Pakistan hair care'],
  alternates: {
    canonical: '/',
    languages: { 'en-PK': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: '/',
    siteName: 'Densova',
    title: 'Densova — Advanced Herbal Hair Infusion',
    description: defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Densova — Advanced Herbal Hair Infusion',
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
    ...(process.env.BING_SITE_VERIFICATION ? { other: { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } } : {}),
  },
  formatDetection: { email: false, address: false, telephone: false },
  referrer: 'strict-origin-when-cross-origin',
  icons: {
    icon: [{ url: '/logo.jpg', type: 'image/jpeg', sizes: '150x150' }],
    shortcut: ['/logo.jpg'],
    apple: [{ url: '/logo.jpg', type: 'image/jpeg', sizes: '150x150' }],
  },
  manifest: '/manifest.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2E3A1F',
  colorScheme: 'light',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-PK">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
