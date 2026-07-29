import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addItem } from '../../store/slices/cartSlice'
import { openCartDrawer } from '../../store/slices/uiSlice'
import { selectProducts } from '../../store/slices/productsSlice'
import { productsAPI } from '../../services/api'
import { useContent } from '../../hooks/useContent'
import { resolveImageUrl } from '../../utils/resolveImageUrl'

const FEATURED_PRODUCT = {
  id: 'hair-infusion-250',
  slug: 'advanced-herbal-hair-infusion',
  name: 'Advanced Herbal Hair Infusion',
  price: 4950,
  image_url: null,
}

const DEFAULT = {
  eyebrow: 'The Hero Ritual',
  headline_a: 'A botanical concentrate,',
  headline_em: 'built to reach the root.',
  body: 'Densova Advanced Herbal Hair Infusion is a rare-grade botanical concentrate, slow-pressed and matured under low heat — the way oils were prepared long before laboratories. Eight herbs, no fillers, no noise.',
  points: [
    { title: 'Root-level nourishment',  sub: 'Penetrates the scalp to feed the follicle directly.' },
    { title: 'Anti-fungal botanicals',  sub: 'Soothes irritation and rebalances scalp microbiome.' },
    { title: 'Awakens scalp circulation', sub: 'Encourages dormant follicles to reactivate over time.' },
    { title: 'Restores natural vitality', sub: 'Returns density, shine and resilience the way nature intended.' },
  ],
  cta_text: 'Add to Cart · Rs 4,950',
  bottle_image: '',
  bottle_brand: 'Densova',
  bottle_tag: 'Herbal Apothecary',
  bottle_title_a: 'Advanced',
  bottle_title_em: 'Herbal',
  bottle_title_b: 'Hair Infusion',
  bottle_pillars: 'Strength · Growth · Repair',
  bottle_foot: '250 ML · 8.45 FL OZ',
}

const ICONS = [
  <path d="M12 3c-3 3-5 6-5 9a5 5 0 0 0 10 0c0-3-2-6-5-9z" />,
  <path d="M4 18c4-2 8-2 16-12M4 18c0-4 2-8 16-12" />,
  <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2" /></>,
  <path d="M20 12c-4-1-7-4-8-8-1 4-4 7-8 8 4 1 7 4 8 8 1-4 4-7 8-8z" />,
]

export default function Feature() {
  const dispatch = useDispatch()
  const c = useContent('content_feature', DEFAULT)
  const points = Array.isArray(c.points) ? c.points : DEFAULT.points

  // Resolve the real, dynamic product (live id, price, image, category) so the
  // cart line matches the one added from the Collection grid / product page.
  // Prefer the already-loaded store list; otherwise fetch it by slug once.
  // FEATURED_PRODUCT is only a fallback if the live product can't be loaded.
  const products = useSelector(selectProducts)
  const [fetched, setFetched] = useState(null)
  const featured = products.find((p) => p.slug === FEATURED_PRODUCT.slug) || fetched

  useEffect(() => {
    if (products.some((p) => p.slug === FEATURED_PRODUCT.slug)) return
    let alive = true
    productsAPI.getBySlug(FEATURED_PRODUCT.slug)
      .then((res) => { if (alive) setFetched(res.data?.data || null) })
      .catch(() => { /* keep static fallback */ })
    return () => { alive = false }
  }, [products])

  const handleAdd = () => {
    dispatch(addItem(featured || FEATURED_PRODUCT))
    dispatch(openCartDrawer())
  }

  return (
    <section className="feature" id="feature">
      <div className="container">
        <div className="feature-grid">
          <div className="feature-visual reveal" aria-hidden="true">
            {c.bottle_image ? (
              <img
                className="feature-bottle-img"
                src={resolveImageUrl(c.bottle_image)}
                alt={c.bottle_title_a || 'Densova product'}
              />
            ) : (
              <div className="feature-bottle-lg">
                <div>
                  <div className="fb-brand">{c.bottle_brand || DEFAULT.bottle_brand}</div>
                  <div className="fb-tag">{c.bottle_tag || DEFAULT.bottle_tag}</div>
                </div>
                <div className="fb-mid">
                  <h5>
                    {c.bottle_title_a || DEFAULT.bottle_title_a}<br />
                    <em>{c.bottle_title_em || DEFAULT.bottle_title_em}</em>{c.bottle_title_b || DEFAULT.bottle_title_b}
                  </h5>
                  <div className="fb-pillars">{c.bottle_pillars || DEFAULT.bottle_pillars}</div>
                </div>
                <div className="fb-foot">{c.bottle_foot || DEFAULT.bottle_foot}</div>
              </div>
            )}
          </div>

          <div className="feature-content reveal">
            <div className="eyebrow"><span className="line" />{c.eyebrow || DEFAULT.eyebrow}</div>
            <h2 className="section-title">
              {c.headline_a || DEFAULT.headline_a} <em>{c.headline_em || DEFAULT.headline_em}</em>
            </h2>
            <p>{c.body || DEFAULT.body}</p>

            <ul className="feature-list">
              {points.map((p, i) => (
                <li key={i}>
                  <span className="icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      {ICONS[i % ICONS.length]}
                    </svg>
                  </span>
                  <span className="text">
                    <strong>{p.title}</strong>
                    <span>{p.sub}</span>
                  </span>
                </li>
              ))}
            </ul>

            <button className="btn btn-gold" onClick={handleAdd}>
              {c.cta_text || DEFAULT.cta_text}
              <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
