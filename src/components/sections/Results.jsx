import { useContent } from '../../hooks/useContent'
import { resolveImageUrl } from '../../utils/resolveImageUrl'

const DEFAULT = {
  eyebrow: 'Quiet Transformation',
  headline_a: 'Before &',
  headline_em: 'After',
  sub: 'A glimpse from our 90-day ritual study. The change is gradual — the way good things in nature tend to be.',

  // Collage cards (one image per card showing the full transformation)
  card1_tag:    'Day 01 → Day 90',
  card1_title:  'For Women',
  card1_desc:   'Dandruff cleared. Density restored. Calm scalp, mirror shine.',
  card1_image:  '',

  card2_tag:    'Day 01 → Day 90',
  card2_title:  'For Men',
  card2_desc:   'Hairline recovered. Thicker crown. A confident, healthy mane.',
  card2_image:  '',

  disclaimer: 'Photography from internal trial. Results may vary with consistency of ritual and lifestyle.',
}

function ResultCollageCard({ tag, title, desc, image, hasReverse }) {
  return (
    <article className={`result-card collage${hasReverse ? ' after' : ''} reveal`}>
      <div
        className="result-img collage"
        style={image ? { backgroundImage: `url(${resolveImageUrl(image)})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'none' } : undefined}
      >
        <span className="result-tag">{tag}</span>
      </div>
      <div className="result-meta">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </article>
  )
}

export default function Results() {
  const c = useContent('content_results', DEFAULT)

  // Backward-compat shim: if admin still has old before_image/after_image set
  // and no new collage images, use the legacy values so nothing breaks.
  const card1Image = c.card1_image || c.before_image || ''
  const card2Image = c.card2_image || c.after_image  || ''

  return (
    <section className="section results">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">
            <span className="line" />{c.eyebrow || DEFAULT.eyebrow}<span className="line" />
          </div>
          <h2 className="section-title">{c.headline_a || DEFAULT.headline_a} <em>{c.headline_em || DEFAULT.headline_em}</em></h2>
          <p className="section-sub">{c.sub || DEFAULT.sub}</p>
        </div>

        <div className="results-grid">
          <ResultCollageCard
            tag={c.card1_tag || DEFAULT.card1_tag}
            title={c.card1_title || DEFAULT.card1_title}
            desc={c.card1_desc || DEFAULT.card1_desc}
            image={card1Image}
          />
          <ResultCollageCard
            tag={c.card2_tag || DEFAULT.card2_tag}
            title={c.card2_title || DEFAULT.card2_title}
            desc={c.card2_desc || DEFAULT.card2_desc}
            image={card2Image}
            hasReverse
          />
        </div>

        <p className="results-disclaimer">{c.disclaimer || DEFAULT.disclaimer}</p>
      </div>
    </section>
  )
}
