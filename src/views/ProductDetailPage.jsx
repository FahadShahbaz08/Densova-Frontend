import { useEffect, useState } from 'react'
import { Link, useParams } from '../router'
import { useDispatch, useSelector } from 'react-redux'

import SEOHead from '../components/common/SEOHead'
import { resolveImageUrl } from '../utils/resolveImageUrl'
import ScrollProgress from '../components/sections/ScrollProgress'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import CartDrawer from '../components/sections/CartDrawer'
import Toast from '../components/sections/Toast'
import BackToTop from '../components/sections/BackToTop'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'
import ReviewForm from '../components/sections/ReviewForm'
import RatingBreakdown from '../components/sections/RatingBreakdown'

import {
  fetchProductBySlug,
  selectSelectedProduct,
  selectProductsLoading,
  clearSelected,
} from '../store/slices/productsSlice'
import { addItem } from '../store/slices/cartSlice'
import { openCartDrawer, showToast } from '../store/slices/uiSlice'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5173'
const rs = (n) => 'Rs ' + Number(n).toLocaleString('en-PK')

function Stars({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (i < rating ? '★' : '☆')).join(' ')}
    </span>
  )
}

function Carousel({ images, name }) {
  const [active, setActive] = useState(0)
  if (!images || !images.length) {
    return (
      <div className="pdp-main-img">
        <div className="pdp-bottle-placeholder">
          <div className="mb">Densova</div>
          <div className="ml">Hair Ritual</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pdp-gallery">
      <div className="pdp-main-img">
        <img src={resolveImageUrl(images[active])} alt={`${name} — view ${active + 1}`} />
      </div>
      <div className="pdp-thumbs">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`pdp-thumb${i === active ? ' active' : ''}`}
            aria-label={`Show image ${i + 1}`}
          >
            <img src={resolveImageUrl(src)} alt="" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}

const TABS = [
  { key: 'description', label: 'Description' },
  { key: 'how',         label: 'How to Use' },
  { key: 'reviews',     label: 'Reviews' },
]

export default function ProductDetailPage({ initialProduct = null }) {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const selectedProduct = useSelector(selectSelectedProduct)
  const product = selectedProduct || initialProduct
  const loading = useSelector(selectProductsLoading)

  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')

  useEffect(() => {
    dispatch(fetchProductBySlug(slug))
    setQty(1)
    setTab('description')
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => dispatch(clearSelected())
  }, [dispatch, slug])

  const onAdd = () => {
    if (!product) return
    dispatch(addItem({ ...product, qty }))
    dispatch(showToast({ type: 'success', message: 'Added to cart' }))
    dispatch(openCartDrawer())
  }

  if ((loading && !product) || !product) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <div className="container" style={{ padding: '120px 32px', minHeight: '50vh' }}>
          <div style={{ height: 400, background: 'var(--beige)', borderRadius: 18, animation: 'pulse 1.6s infinite' }} />
        </div>
        <Footer />
      </>
    )
  }

  const hasDiscount = product.compare_price && product.compare_price > product.price
  const saving = hasDiscount ? Number(product.compare_price) - Number(product.price) : 0

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type':    'Product',
    name:        product.name,
    description: product.tagline || product.description,
    image:       product.gallery?.length ? product.gallery.map(resolveImageUrl) : [product.image_url].filter(Boolean).map(resolveImageUrl),
    sku:         `DNV-${product.id}`,
    offers: {
      '@type':         'Offer',
      price:           product.price,
      priceCurrency:   'PKR',
      availability:    product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/shop/${product.slug}`,
    },
    aggregateRating: product.reviews_count > 0
      ? { '@type': 'AggregateRating', ratingValue: product.average_rating, reviewCount: product.reviews_count }
      : undefined,
  }

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.tagline || product.description?.slice(0, 160)}
        url={`${SITE_URL}/shop/${product.slug}`}
        image={resolveImageUrl(product.image_url || product.gallery?.[0])}
        type="product"
        jsonLd={productJsonLd}
      />

      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <main className="pdp">
        {/* Breadcrumb */}
        <div className="container" style={{ paddingTop: 28 }}>
          <nav aria-label="Breadcrumb" style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            <Link to="/" style={{ color: 'inherit' }}>Home</Link>
            {' · '}
            <Link to="/#shop" style={{ color: 'inherit' }}>Shop</Link>
            {' · '}
            <span style={{ color: 'var(--ink)' }}>{product.name}</span>
          </nav>
        </div>

        {/* Hero: gallery + info */}
        <section className="pdp-top">
          <div className="container">
            <div className="pdp-grid">
              <Carousel
                images={product.gallery?.length ? product.gallery : [product.image_url].filter(Boolean)}
                name={product.name}
              />

              <div className="pdp-info">
                <p className="pdp-cat">
                  {product.category === 'bundle' ? 'Hair Ritual · Bundle' : 'Hair Ritual'}
                </p>
                <h1 className="pdp-title">{product.name}</h1>
                {product.tagline && <p className="pdp-tagline">{product.tagline}</p>}

                {product.reviews_count > 0 && (
                  <div className="pdp-rating">
                    <Stars rating={Math.round(product.average_rating)} />
                    <span>{product.average_rating} · {product.reviews_count} reviews</span>
                  </div>
                )}

                <div className="pdp-price-row">
                  <span className="pdp-price">{rs(product.price)}</span>
                  {hasDiscount && (
                    <>
                      <s className="pdp-compare">{rs(product.compare_price)}</s>
                      <span className="pdp-save">Save {rs(saving)}</span>
                    </>
                  )}
                </div>

                {product.benefits?.length > 0 && (
                  <ul className="pdp-pillars">
                    {product.benefits.map((b) => (
                      <li key={b}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="pdp-buy-row">
                  <div className="pdp-qty">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
                    <span>{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase">+</button>
                  </div>
                  <button className="btn btn-gold" onClick={onAdd} disabled={product.stock <= 0}>
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                    <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <ul className="pdp-trust">
                  <li>Free shipping over Rs 5,000</li>
                  <li>30-day Ritual Promise</li>
                  <li>Hand-blended in small batches</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <section className="pdp-tabs-section">
          <div className="container">
            <div className="pdp-tabs" role="tablist">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={`pdp-tab${tab === t.key ? ' active' : ''}`}
                >
                  {t.label}
                  {t.key === 'reviews' && product.reviews_count > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>({product.reviews_count})</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pdp-tab-body">
              {tab === 'description' && (
                <div className="pdp-prose">
                  <p>{product.description}</p>
                </div>
              )}

              {tab === 'ingredients' && (
                <ul className="pdp-ingredients">
                  {(product.ingredients || []).map((ing) => (
                    <li key={ing}>{ing}</li>
                  ))}
                </ul>
              )}

              {tab === 'how' && (
                <ol className="pdp-how">
                  {(product.how_to_use || []).map((step, i) => (
                    <li key={i}>
                      <span className="pdp-how-num">{String(i + 1).padStart(2, '0')}</span>
                      <div>
                        {step.title && <h4>{step.title}</h4>}
                        <p>{step.body || step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {tab === 'reviews' && (
                <div className="pdp-reviews">
                  {/* Summary breakdown */}
                  {product.reviews_count > 0 && (
                    <RatingBreakdown
                      average={product.average_rating}
                      total={product.reviews_count}
                      distribution={product.rating_distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }}
                    />
                  )}

                  {/* Latest 6 reviews (limited from backend) */}
                  {(product.reviews || []).length === 0 ? (
                    <p style={{ color: 'var(--muted)', marginBottom: 28 }}>No reviews yet — be the first to share your ritual.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: 20 }}>
                      {product.reviews.map((r) => (
                        <li key={r.id} className="review-card in">
                          <div className="review-stars">{Array.from({ length: r.rating }).map(() => '★').join(' ')}</div>
                          {r.title && <h4 style={{ fontFamily: 'var(--f-display)', fontSize: 18, margin: '8px 0' }}>{r.title}</h4>}
                          <blockquote>&ldquo;{r.body}&rdquo;</blockquote>
                          {Array.isArray(r.images) && r.images.length > 0 && (
                            <div className="review-photos">
                              {r.images.map((url, i) => (
                                <a key={i} href={resolveImageUrl(url)} target="_blank" rel="noopener noreferrer" className="review-photo">
                                  <img src={resolveImageUrl(url)} alt={`Photo ${i + 1} from ${r.author}`} loading="lazy" />
                                </a>
                              ))}
                            </div>
                          )}
                          <div className="review-meta">
                            <div className="review-avatar">{(r.author || '?')[0]}</div>
                            <div><strong>{r.author}</strong><span>{r.created_at}</span></div>
                            {r.verified && <span className="verified">Verified</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Link to all reviews when there are more than what's shown */}
                  {product.reviews_count > (product.reviews?.length || 0) && (
                    <div className="pdp-reviews-more">
                      <Link to={`/shop/${product.slug}/reviews`} className="btn-link">
                        View all {product.reviews_count.toLocaleString('en-PK')} reviews →
                      </Link>
                    </div>
                  )}

                  {/* Review submission form */}
                  <ReviewForm
                    product={product}
                    onSubmitted={() => dispatch(fetchProductBySlug(slug))}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <CartDrawer />
      <Toast />
      <BackToTop />
      <WhatsAppFloat />
    </>
  )
}
