const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://densova.shop').replace(/\/$/, '')

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
