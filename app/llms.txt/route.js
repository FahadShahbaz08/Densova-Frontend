const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://densova.shop').replace(/\/$/, '')
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://densova.shop/backend/api/v1').replace(/\/$/, '')

async function productLines() {
  try {
    const response = await fetch(`${API_URL}/products?per_page=100`, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return []
    const payload = await response.json()
    const records = payload?.data?.data || payload?.data || payload || []
    return (Array.isArray(records) ? records : []).flatMap((product) => {
      if (!product?.slug || !product?.name) return []
      const description = String(product.tagline || product.description || '').replace(/\s+/g, ' ').trim()
      return [`- [${product.name}](${SITE_URL}/shop/${encodeURIComponent(product.slug)}): ${description}`]
    })
  } catch {
    return []
  }
}

export async function GET() {
  const products = await productLines()
  const body = [
    '# Densova',
    '',
    '> Densova creates botanical hair-care rituals and advanced herbal hair infusions in Pakistan.',
    '',
    '## Canonical website',
    '',
    SITE_URL,
    '',
    '## Main pages',
    '',
    `- [Home and collection](${SITE_URL}/)`,
    `- [Contact](${SITE_URL}/contact)`,
    `- [Return and exchange policy](${SITE_URL}/returns)`,
    ...(products.length ? ['', '## Products', '', ...products] : []),
    '',
    'Product claims, prices, availability, ratings, and policies should be taken from the linked canonical pages.',
    '',
  ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
