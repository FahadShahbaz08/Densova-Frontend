const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://densova.shop').replace(/\/$/, '')
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://densova.shop/backend/api/v1').replace(/\/$/, '')

function validDate(value) {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default async function sitemap() {
  const staticPages = ['', '/contact', '/returns'].map((path) => ({
    url: `${SITE_URL}${path}`,
  }))

  try {
    const response = await fetch(`${API_URL}/products?per_page=100`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return staticPages

    const payload = await response.json()
    const records = payload?.data?.data || payload?.data || payload || []
    const products = (Array.isArray(records) ? records : []).flatMap((product) => {
      if (!product?.slug) return []
      const lastModified = validDate(product.updated_at)
      return [
        {
          url: `${SITE_URL}/shop/${encodeURIComponent(product.slug)}`,
          ...(lastModified ? { lastModified } : {}),
        },
        {
          url: `${SITE_URL}/shop/${encodeURIComponent(product.slug)}/reviews`,
          ...(lastModified ? { lastModified } : {}),
        },
      ]
    })
    return [...staticPages, ...products]
  } catch {
    return staticPages
  }
}
