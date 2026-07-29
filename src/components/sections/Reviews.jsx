import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { reviewsAPI } from '../../services/api'
import { useContent } from '../../hooks/useContent'

const DEFAULT_HEAD = {
  eyebrow: 'The Quiet Praise',
  headline_a: 'What our ritualists',
  headline_em: 'are saying.',
}

const FALLBACK_REVIEWS = [
  { author: 'Amaira K.', rating: 5, body: 'After eight weeks of consistent use, my edges have come back. I never thought I’d say that about a hair oil — it’s quietly remarkable.', verified: true },
  { author: 'Sara M.',   rating: 5, body: 'The scent alone has become my favourite part of Sundays. My hair is shinier, but more than that — my scalp feels calmer than it has in years.', verified: true },
  { author: 'Hina R.',   rating: 4, body: 'I bought this for my mother and ended up keeping one for myself. It absorbs cleanly, doesn’t feel heavy, and the bottle itself feels like a small ceremony.', verified: true },
]

const MAX_REVIEWS = 5
const AUTO_INTERVAL = 5000           // 5s between slides
const TRANSITION_MS = 700            // must match CSS transition below

const getVisibleCount = () => {
  if (typeof window === 'undefined') return 3
  if (window.matchMedia('(max-width: 720px)').matches) return 1
  if (window.matchMedia('(max-width: 1024px)').matches) return 2
  return 3
}

const stars = (n) => '★ ★ ★ ★ ★'.split(' ').map((s, i) => (i < n ? '★' : '☆')).join(' ')

// Single review card. Owns its own expand/collapse state and measures whether
// the (line-clamped) quote actually overflows so the "View more" button only
// appears when the text is genuinely too long.
function ReviewCard({ review }) {
  const [expanded, setExpanded]       = useState(false)
  const [truncatable, setTruncatable] = useState(false)
  const quoteRef = useRef(null)

  useLayoutEffect(() => {
    const el = quoteRef.current
    if (!el || expanded) return            // can't measure overflow while expanded
    const measure = () => setTruncatable(el.scrollHeight > el.clientHeight + 1)
    measure()
    // Re-measure when the card width changes (column count / viewport resize).
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [review.body, expanded])

  return (
    <div className="review-card reveal in">
      <div className="review-stars">{stars(review.rating)}</div>
      <blockquote ref={quoteRef} className={`review-quote${expanded ? '' : ' clamp'}`}>
        &ldquo;{review.body}&rdquo;
      </blockquote>
      {truncatable && (
        <button
          type="button"
          className="review-more"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'View less' : 'View more'}
        </button>
      )}
      <div className="review-meta">
        <div className="review-avatar">{(review.author || '?')[0]}</div>
        <div>
          <strong>{review.author}</strong>
        </div>
        {review.verified && <span className="verified">Verified</span>}
      </div>
    </div>
  )
}

export default function Reviews() {
  const head = useContent('content_reviews_head', DEFAULT_HEAD)

  const [reviews, setReviews]   = useState(FALLBACK_REVIEWS)
  const [stats, setStats]       = useState({ average: 4.9, total: 0 })
  const [visible, setVisible]   = useState(getVisibleCount())
  const [index, setIndex]       = useState(0)         // virtual index into the cloned track
  const [skipTrans, setSkipTrans] = useState(false)   // true when we silently snap back to start
  const [paused, setPaused]     = useState(false)
  const snapTimer = useRef(null)

  // Fetch reviews + stats
  useEffect(() => {
    Promise.all([
      reviewsAPI.getAll({ per_page: MAX_REVIEWS }),
      reviewsAPI.stats(),
    ]).then(([revRes, statsRes]) => {
      const list = revRes?.data?.data
      if (Array.isArray(list) && list.length) {
        const ranked = [...list]
          .sort((a, b) => (b.rating - a.rating) || (new Date(b.created_at) - new Date(a.created_at)))
          .slice(0, MAX_REVIEWS)
        setReviews(ranked.map(r => ({
          author: r.author, rating: r.rating, body: r.body, verified: r.verified,
        })))
      }
      if (statsRes?.data) {
        setStats({
          average: Number(statsRes.data.average) || 0,
          total:   Number(statsRes.data.total)   || 0,
        })
      }
    }).catch(() => { /* keep fallback */ })
  }, [])

  // Reset index when reviews or visible count change
  useEffect(() => { setIndex(0); setSkipTrans(false) }, [reviews.length, visible])

  useEffect(() => {
    const updateCount = () => {
      const next = getVisibleCount()
      setVisible(prev => prev === next ? prev : next)
    }

    updateCount()
    window.addEventListener('resize', updateCount)
    return () => window.removeEventListener('resize', updateCount)
  }, [])

  const carouselActive = reviews.length > visible

  // Track = original reviews + clones of first visible items at the end.
  // Letting `index` slide past `reviews.length` visually displays the clones
  // (which look identical to the start). Then we silently snap back to 0.
  const trackItems = carouselActive
    ? [...reviews, ...reviews.slice(0, visible)]
    : reviews

  // Auto-advance
  useEffect(() => {
    if (!carouselActive || paused) return
    const t = setInterval(() => {
      setIndex(i => i + 1)
    }, AUTO_INTERVAL)
    return () => clearInterval(t)
  }, [carouselActive, paused])

  // When index reaches reviews.length, wait for the slide animation to
  // complete, then snap back to 0 WITHOUT a transition (invisible reset).
  useEffect(() => {
    if (!carouselActive) return
    if (index === reviews.length) {
      snapTimer.current = setTimeout(() => {
        setSkipTrans(true)
        setIndex(0)
      }, TRANSITION_MS)
      return () => clearTimeout(snapTimer.current)
    }
  }, [index, reviews.length, carouselActive])

  // Re-enable transitions on the next paint after the silent snap
  useEffect(() => {
    if (skipTrans) {
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => setSkipTrans(false))
        snapTimer.current = raf2
      })
      return () => cancelAnimationFrame(raf1)
    }
  }, [skipTrans])

  // Dot represents "leftmost real review currently visible"
  const activeDot = index === reviews.length ? 0 : (index % reviews.length)

  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow"><span className="line" />{head.eyebrow || DEFAULT_HEAD.eyebrow}<span className="line" /></div>
          <h2 className="section-title">
            {head.headline_a || DEFAULT_HEAD.headline_a} <em>{head.headline_em || DEFAULT_HEAD.headline_em}</em>
          </h2>
        </div>

        <div className="reviews-summary">
          <div className="reviews-score">{stats.average ? stats.average.toFixed(1) : '—'}</div>
          <div className="reviews-meta">
            <div className="stars">★ ★ ★ ★ ★</div>
            <div className="count">
              {stats.total > 0
                ? `Based on ${stats.total.toLocaleString('en-PK')} verified review${stats.total !== 1 ? 's' : ''}`
                : 'Be the first to share your ritual'}
            </div>
          </div>
        </div>

        <div
          className="reviews-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="reviews-track"
            style={{
              display: 'flex',
              transform: carouselActive ? `translateX(-${index * (100 / visible)}%)` : 'none',
              transition: (skipTrans || !carouselActive)
                ? 'none'
                : `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          >
            {trackItems.map((r, i) => (
              <div
                key={`${r.author || 'r'}-${i}`}
                style={{
                  flex: carouselActive ? `0 0 ${100 / visible}%` : '1 1 0',
                  padding: '0 12px',
                  boxSizing: 'border-box',
                  display: 'flex',
                }}
              >
                <ReviewCard review={r} />
              </div>
            ))}
          </div>
        </div>

        {carouselActive && (
          <div className="reviews-dots" role="tablist" aria-label="Reviews pagination">
            {reviews.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={activeDot === i}
                onClick={() => setIndex(i)}
                className={`reviews-dot${activeDot === i ? ' active' : ''}`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
