import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from '../router'

import SEOHead from '../components/common/SEOHead'
import { resolveImageUrl } from '../utils/resolveImageUrl'
import ScrollProgress from '../components/sections/ScrollProgress'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'
import RatingBreakdown from '../components/sections/RatingBreakdown'
import ReviewForm from '../components/sections/ReviewForm'

import { productsAPI } from '../services/api'

const SORT_OPTIONS = [
  { key: 'newest',  label: 'Newest first' },
  { key: 'oldest',  label: 'Oldest first' },
  { key: 'highest', label: 'Highest rated' },
  { key: 'lowest',  label: 'Lowest rated' },
]

const PER_PAGE = 10

function Stars({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#c9a24e', fontSize: 13, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= value ? '#c9a24e' : 'var(--line)' }}>★</span>
      ))}
    </span>
  )
}

function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null
  const pages = []
  const add = (p) => { if (!pages.includes(p) && p >= 1 && p <= lastPage) pages.push(p) }
  add(1); for (let i = page - 1; i <= page + 1; i++) add(i); add(lastPage)
  pages.sort((a, b) => a - b)
  const items = []
  pages.forEach((p, i) => { if (i > 0 && p - pages[i - 1] > 1) items.push('…'); items.push(p) })
  return (
    <div className="pr-pagination">
      <button disabled={page === 1} onClick={() => onChange(page - 1)}>‹ Prev</button>
      {items.map((it, i) => it === '…'
        ? <span key={`e${i}`} className="pr-dot">…</span>
        : <button key={it} className={it === page ? 'active' : ''} onClick={() => onChange(it)}>{it}</button>)}
      <button disabled={page === lastPage} onClick={() => onChange(page + 1)}>Next ›</button>
    </div>
  )
}

export default function ProductReviewsPage({ initialData = null }) {
  const { slug } = useParams()
  const [data, setData]       = useState(initialData)
  const [loading, setLoading] = useState(!initialData)
  const [page, setPage]       = useState(1)
  const [sort, setSort]       = useState('newest')
  const [ratingFilter, setRating] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: PER_PAGE, sort }
      if (ratingFilter) params.rating = ratingFilter
      const res = await productsAPI.getReviews(slug, params)
      setData(res.data)
    } catch (e) {
      console.error('Reviews load failed:', e?.response?.status)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [slug, page, sort, ratingFilter])

  useEffect(() => { load() }, [load])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [sort, ratingFilter])

  const product  = data?.product
  const stats    = data?.stats || { average: 0, total: 0, distribution: {} }
  const reviews  = data?.data  || []
  const lastPage = data?.meta?.last_page || 1

  if (loading && !data) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <div className="container" style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--muted)' }}>
          Loading reviews…
        </div>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <div className="container" style={{ padding: '80px 32px', textAlign: 'center', color: 'var(--muted)' }}>
          Product not found. <Link to="/" style={{ color: 'var(--forest)' }}>Go home</Link>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <SEOHead title={`Reviews · ${product.name}`} description={`All customer reviews for ${product.name}`} />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <main className="pr-page">
        <div className="container">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="pr-breadcrumb">
            <Link to="/">Home</Link>
            {' · '}
            <Link to={`/shop/${product.slug}`}>{product.name}</Link>
            {' · '}
            <span>Reviews</span>
          </nav>

          {/* Header — product strip */}
          <div className="pr-header">
            {product.image_url ? (
              <img src={resolveImageUrl(product.image_url)} alt={product.name} className="pr-product-img" />
            ) : (
              <div className="pr-product-img placeholder" />
            )}
            <div>
              <div className="pr-product-eyebrow">Customer Reviews</div>
              <h1 className="pr-product-title">{product.name}</h1>
              {product.tagline && <p className="pr-product-tagline">{product.tagline}</p>}
              <Link to={`/shop/${product.slug}`} className="btn-link">← Back to product</Link>
            </div>
          </div>

          {/* Summary breakdown — click stars to filter */}
          {stats.total > 0 && (
            <div className="pr-breakdown-card">
              <RatingBreakdown
                average={stats.average}
                total={stats.total}
                distribution={stats.distribution}
                onFilterRating={setRating}
                activeRating={ratingFilter}
              />
            </div>
          )}

          {/* Toolbar */}
          <div className="pr-toolbar">
            <div className="pr-toolbar-info">
              {ratingFilter ? (
                <>
                  Showing {ratingFilter}★ reviews —{' '}
                  <button onClick={() => setRating(null)} className="btn-link pr-clear">clear filter</button>
                </>
              ) : (
                <>{stats.total.toLocaleString('en-PK')} total review{stats.total !== 1 ? 's' : ''}</>
              )}
            </div>
            <div className="pr-toolbar-sort">
              <label>Sort by:</label>
              <select value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Reviews list */}
          {loading ? (
            <div className="pr-loading">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="pr-empty">
              {ratingFilter ? `No ${ratingFilter}-star reviews yet.` : 'No reviews yet — be the first to share your ritual.'}
            </div>
          ) : (
            <ul className="pr-list">
              {reviews.map(r => (
                <li key={r.id} className="pr-review">
                  <div className="pr-review-head">
                    <div className="pr-review-author">
                      <div className="review-avatar">{(r.author || '?')[0]}</div>
                      <div>
                        <strong>{r.author}</strong>
                        <div className="pr-review-date">{r.created_at}</div>
                      </div>
                    </div>
                    <div className="pr-review-top">
                      <Stars value={r.rating} />
                      {r.verified && <span className="verified">Verified</span>}
                    </div>
                  </div>
                  {r.title && <h4 className="pr-review-title">{r.title}</h4>}
                  <blockquote className="pr-review-body">&ldquo;{r.body}&rdquo;</blockquote>
                  {Array.isArray(r.images) && r.images.length > 0 && (
                    <div className="review-photos">
                      {r.images.map((url, i) => (
                        <a key={i} href={resolveImageUrl(url)} target="_blank" rel="noopener noreferrer" className="review-photo">
                          <img src={resolveImageUrl(url)} alt={`Photo ${i + 1} from ${r.author}`} loading="lazy" />
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Pagination page={page} lastPage={lastPage} onChange={setPage} />

          {/* Submission form at the bottom */}
          <div className="pr-form-block">
            <ReviewForm
              product={product}
              onSubmitted={() => load()}
            />
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
