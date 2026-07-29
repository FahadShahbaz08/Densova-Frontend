import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from '../../router'
import {
  fetchProducts,
  selectProducts,
  selectProductsLoading,
} from '../../store/slices/productsSlice'
import { addItem } from '../../store/slices/cartSlice'
import { openCartDrawer } from '../../store/slices/uiSlice'
import { showToast } from '../../store/slices/uiSlice'
import { useContent } from '../../hooks/useContent'
import { resolveImageUrl } from '../../utils/resolveImageUrl'

const DEFAULT_HEAD = {
  eyebrow: 'The Collection',
  headline_a: 'A small atelier of',
  headline_em: 'essential rituals.',
  sub: 'We make one thing at a time, and we make it slowly. Begin with our hero â€” and save with the ritual duo.',
}

// Different bottle finishes for visual variety between the two cards.
const BOTTLE_TONES = ['cream', 'amber']

// API categories are slugs ("hair-care", "bundle"). Display them as proper
// editorial labels matching the reference design's voice.
const CATEGORY_LABEL = {
  'hair-care': 'Hair Ritual',
  'scalp':     'Scalp Ritual',
  'bundle':    'Hair Ritual',
}

const rs = (n) => 'Rs ' + Number(n).toLocaleString('en-PK')

export function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch()
  const tone = BOTTLE_TONES[index % BOTTLE_TONES.length]
  const categoryLabel = CATEGORY_LABEL[product.category] || product.category

  const hasDiscount =
    product.compare_price && Number(product.compare_price) > Number(product.price)

  // Subtitle: pillars from benefits + size string.
  const benefits = Array.isArray(product.benefits) && product.benefits.length
    ? product.benefits.join(' Â· ')
    : null
  const sizeLabel = product.category === 'bundle' ? '2 Ã— 250 ml' : '250 ml'
  const subtitle = benefits ? `${benefits} Â· ${sizeLabel}` : sizeLabel

  // Tag in the upper-left corner of the image.
  const tag = hasDiscount
    ? `Save ${rs(Number(product.compare_price) - Number(product.price))}`
    : (product.is_featured ? 'Bestseller' : null)

  const handleAdd = (e) => {
    e.stopPropagation()
    dispatch(addItem(product))
    dispatch(showToast({ type: 'success', message: 'Added to cart' }))
    dispatch(openCartDrawer())
  }

  return (
    <article className="product-card reveal" data-id={product.id}>
      <span className="sheen" aria-hidden="true" />

      <Link to={`/shop/${product.slug}`} className="product-img" aria-label={`View ${product.name}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
        {tag && <span className="product-tag">{tag}</span>}

        {product.image_url ? (
          <img
            src={resolveImageUrl(product.image_url)}
            alt={product.name}
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="product-img-inner">
            <div className={`product-bottle ${tone}`}>
              <div className="mb">Densova</div>
              <div className="ml">{categoryLabel}</div>
            </div>
          </div>
        )}

        {/* Floating "+" button revealed on hover */}
        <button
          className="product-quick"
          onClick={handleAdd}
          aria-label={`Quick add ${product.name}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </Link>

      <div className="product-body">
        <span className="product-cat">{categoryLabel}</span>
        <Link to={`/shop/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        <p className="product-sub">{subtitle}</p>

        <div className="product-foot">
          <span className="product-price">
            {hasDiscount && <s>{rs(product.compare_price)}</s>}
            {rs(product.price)}
          </span>
          <button className="product-add" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </article>
  )
}

export default function Collection() {
  const dispatch = useDispatch()
  const products = useSelector(selectProducts)
  const loading = useSelector(selectProductsLoading)
  const gridRef = useRef(null)
  const head = useContent('content_collection', DEFAULT_HEAD)

  useEffect(() => {
    dispatch(fetchProducts({ per_page: 12 }))
  }, [dispatch])

  // Cards are hidden by .reveal until we add .in. Stagger so they cascade in.
  useEffect(() => {
    if (!products.length || !gridRef.current) return
    const cards = gridRef.current.querySelectorAll('.product-card.reveal:not(.in)')
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('in'), i * 120)
    })
  }, [products])

  return (
    <section className="section section-cream" id="shop">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">
            <span className="line" />
            {head.eyebrow || DEFAULT_HEAD.eyebrow}
            <span className="line" />
          </div>
          <h2 className="section-title anim-title">
            {head.headline_a || DEFAULT_HEAD.headline_a} <em>{head.headline_em || DEFAULT_HEAD.headline_em}</em>
          </h2>
          <p className="section-sub">{head.sub || DEFAULT_HEAD.sub}</p>
        </div>

        <div
          ref={gridRef}
          className={products.length === 2 ? 'collection-grid collection-grid-two' : 'collection-grid'}
          id="collectionGrid"
        >
          {loading
            ? Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="product-card"
                  style={{ minHeight: 460, background: 'var(--beige)', opacity: 0.5 }}
                  aria-hidden="true"
                />
              ))
            : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}
