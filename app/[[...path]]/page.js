import ClientApp from '../client-app'
import { notFound } from 'next/navigation'

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://densova.shop').replace(/\/$/, '')
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://densova.shop/backend/api/v1').replace(/\/$/, '')
const DEFAULT_DESCRIPTION = 'Densova botanical hair rituals are slow-infused in small batches for strength, growth, and repair.'

const PUBLIC_PAGES = {
  '/': {
    title: 'Densova — Advanced Herbal Hair Infusion',
    description: 'Discover Densova Advanced Herbal Hair Infusion: eight botanicals, slow-pressed in small batches for stronger, healthier-looking hair.',
  },
  '/contact': {
    title: 'Contact',
    description: 'Contact the Densova Apothecary with questions about products, orders, collaborations, or press.',
  },
  '/returns': {
    title: 'Return & Exchange Policy',
    description: "Read Densova's return and exchange policy, including hygiene rules and support for damaged, defective, or incorrect items.",
  },
}

const NOINDEX_PAGES = {
  '/track-order': { title: 'Track Your Order', description: 'Track the current status of your Densova order.' },
  '/checkout': { title: 'Checkout', description: 'Complete your Densova order securely.' },
  '/login': { title: 'Sign In', description: 'Sign in to your Densova account.' },
  '/register': { title: 'Create Account', description: 'Create your Densova account.' },
}

const STATIC_ROUTES = new Set([
  '/', '/checkout', '/track-order', '/contact', '/returns', '/login', '/register',
  '/admin', '/admin/login', '/admin/orders', '/admin/orders/new', '/admin/products',
  '/admin/categories', '/admin/customers', '/admin/reviews', '/admin/discounts',
  '/admin/campaigns', '/admin/newsletter', '/admin/contact', '/admin/content',
  '/admin/appearance', '/admin/reports', '/admin/settings',
])

function isKnownPath(pathname) {
  return STATIC_ROUTES.has(pathname)
    || /^\/shop\/[^/]+(\/reviews)?$/.test(pathname)
    || /^\/order-confirmation\/[^/]+$/.test(pathname)
    || /^\/admin\/orders\/[^/]+\/(view|edit)$/.test(pathname)
    || /^\/admin\/reviews\/[^/]+\/view$/.test(pathname)
}

function pathFromParams(params) {
  const parts = params?.path || []
  return parts.length ? `/${parts.map(decodeURIComponent).join('/')}` : '/'
}

async function apiJson(path, revalidate = 300) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    return response.json()
  } catch {
    return null
  }
}

async function getProduct(slug) {
  const payload = await apiJson(`/products/${encodeURIComponent(slug)}`)
  return payload?.data || payload
}

async function getProductReviews(slug) {
  return apiJson(`/products/${encodeURIComponent(slug)}/reviews?page=1&per_page=10&sort=newest`)
}

function absoluteImage(url) {
  if (!url) return `${SITE_URL}/opengraph-image`
  if (/^https?:\/\//i.test(url)) return url
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

function pageMetadata(page, canonical, absoluteTitle = false) {
  const title = absoluteTitle ? { absolute: page.title } : page.title
  return {
    title,
    description: page.description,
    alternates: { canonical },
    openGraph: { title: page.title, description: page.description, url: canonical, type: 'website' },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description },
  }
}

export async function generateMetadata({ params }) {
  const pathname = pathFromParams(await params)
  const canonical = `${SITE_URL}${pathname === '/' ? '' : pathname}`
  const productMatch = pathname.match(/^\/shop\/([^/]+)(\/reviews)?$/)

  if (productMatch) {
    const product = await getProduct(productMatch[1])
    if (product) {
      const reviewsPage = Boolean(productMatch[2])
      const title = reviewsPage ? `Reviews · ${product.name}` : product.name
      const description = reviewsPage
        ? `Read verified customer reviews and ratings for ${product.name} by Densova.`
        : product.tagline || product.description?.slice(0, 160) || DEFAULT_DESCRIPTION
      const image = absoluteImage(product.image_url || product.gallery?.[0])
      return {
        title,
        description,
        alternates: { canonical },
        openGraph: { title, description, url: canonical, type: 'website', images: [{ url: image, alt: product.name }] },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
      }
    }
  }

  const publicPage = PUBLIC_PAGES[pathname]
  if (publicPage) return pageMetadata(publicPage, canonical, pathname === '/')

  const noindexPage = NOINDEX_PAGES[pathname]
  const privateRoute = pathname.startsWith('/admin') || pathname.startsWith('/order-confirmation/')
  if (noindexPage || privateRoute) {
    const page = noindexPage || { title: 'Densova', description: DEFAULT_DESCRIPTION }
    return {
      ...pageMetadata(page, canonical),
      robots: { index: false, follow: false, noarchive: true },
    }
  }

  return {
    title: 'Page Not Found',
    description: DEFAULT_DESCRIPTION,
    robots: { index: false, follow: false },
  }
}

function productStructuredData(product, pathname) {
  const canonical = `${SITE_URL}${pathname}`
  const productUrl = `${SITE_URL}/shop/${product.slug}`
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${productUrl}#product`,
      url: productUrl,
      name: product.name,
      description: product.tagline || product.description,
      image: (product.gallery?.length ? product.gallery : [product.image_url]).filter(Boolean).map(absoluteImage),
      sku: `DNV-${product.id}`,
      category: product.category,
      brand: { '@type': 'Brand', name: 'Densova' },
      offers: {
        '@type': 'Offer',
        url: productUrl,
        price: product.price,
        priceCurrency: 'PKR',
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'Densova' },
      },
      ...(product.reviews_count > 0 ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.average_rating,
          reviewCount: product.reviews_count,
          bestRating: 5,
          worstRating: 1,
        },
      } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/#shop` },
        { '@type': 'ListItem', position: 3, name: product.name, item: productUrl },
        ...(pathname.endsWith('/reviews')
          ? [{ '@type': 'ListItem', position: 4, name: 'Reviews', item: canonical }]
          : []),
      ],
    },
  ]
}

function homeStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: 'Densova',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.jpg` },
        description: DEFAULT_DESCRIPTION,
        sameAs: ['https://instagram.com/densova'],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'Densova',
        description: DEFAULT_DESCRIPTION,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-PK',
      },
    ],
  }
}

export default async function CatchAllPage({ params }) {
  const pathname = pathFromParams(await params)
  if (!isKnownPath(pathname)) notFound()

  const shopMatch = pathname.match(/^\/shop\/([^/]+)(\/reviews)?$/)
  const isReviewsPage = Boolean(shopMatch?.[2])
  const [productPayload, initialReviewsData] = shopMatch
    ? await Promise.all([
        getProduct(shopMatch[1]),
        isReviewsPage ? getProductReviews(shopMatch[1]) : Promise.resolve(null),
      ])
    : [null, null]
  const product = productPayload || initialReviewsData?.product || null
  const jsonLd = product
    ? productStructuredData(product, pathname)
    : pathname === '/'
      ? homeStructuredData()
      : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <ClientApp initialProduct={product} initialReviewsData={initialReviewsData} />
    </>
  )
}
