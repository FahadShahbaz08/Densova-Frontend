import { useContent } from '../../hooks/useContent'
import { resolveImageUrl } from '../../utils/resolveImageUrl'

const DEFAULT_HEAD = {
  eyebrow: 'The Eight Botanicals',
  headline_a: 'Each leaf, root and seed —',
  headline_em: 'chosen for a reason.',
  sub: 'Sourced from heritage growers across the subcontinent and gently infused into our cold-pressed base.',
}

const DEFAULT_LIST = [
  { name: 'Amla',          latin: 'Phyllanthus emblica',       desc: 'Tannin-rich keeper of pigment. Deepens colour and fortifies the strand.' },
  { name: 'Reetha',        latin: 'Sapindus mukorossi',        desc: 'The gentle cleanser. Lifts impurity without stripping natural oils.' },
  { name: 'Shikakai',      latin: 'Acacia concinna',           desc: '“Fruit for the hair.” Softens, untangles, slowly brings lustre.' },
  { name: 'Rosemary',      latin: 'Salvia rosmarinus',         desc: 'Stimulates circulation. The most studied botanical for hair growth.' },
  { name: 'Aloe Vera',     latin: 'Aloe barbadensis',          desc: 'A cooling balm. Calms scalp, hydrates deeply, prepares for absorption.' },
  { name: 'Hibiscus',      latin: 'Hibiscus rosa-sinensis',    desc: 'A flower revered for thickness. Encourages density and softens cuticle.' },
  { name: 'Fenugreek',     latin: 'Trigonella foenum-graecum', desc: 'Protein-rich seed. Fortifies thinning strands, quiets shedding.' },
  { name: 'Nigella Sativa', latin: 'Black seed',                desc: 'The seed of blessing. A revered tonic for resilience and density.' },
]

// ── Unique SVG icon for each herb (keyed by lowercased name) ──────────────────
// Picked to evoke each plant's character: fruit, seed pod, leaf, flower, etc.
const ICONS = {
  // Amla — round fruit with small stem + leaf
  amla: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="20" cy="23" r="10" />
      <path d="M20 13c-2-5 0-7 3-7M20 13v3" />
      <path d="M14 21q6 4 12 0" />
    </svg>
  ),

  // Reetha — soapberry (concentric circles + arched leaf)
  reetha: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="20" cy="22" r="9" />
      <circle cx="20" cy="22" r="3.5" />
      <path d="M11 22c4-6 14-6 18 0" />
      <path d="M20 13c-1-3 1-4 3-3" />
    </svg>
  ),

  // Shikakai — curled pods
  shikakai: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M8 28c6-14 18-14 24 0" />
      <path d="M14 27v-6M20 29V17M26 27v-6" />
    </svg>
  ),

  // Rosemary — branch with paired needle leaves
  rosemary: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 6v28" />
      <path d="M20 12l-6-3M20 12l6-3M20 18l-7-4M20 18l7-4M20 24l-7-4M20 24l7-4M20 30l-6-3M20 30l6-3" />
    </svg>
  ),

  // Aloe Vera — succulent pointed leaf
  'aloe vera': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 34c-7-4-9-15-6-26 4 7 8 7 12 0 3 11 1 22-6 26z" />
      <path d="M20 34V14" />
    </svg>
  ),

  // Hibiscus — 5-petal flower with center
  hibiscus: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 8L20 20M20 20L29 14M20 20L29 28M20 20L11 28M20 20L11 14" />
      <circle cx="20" cy="20" r="2.5" />
      <path d="M20 20l0 12" />
    </svg>
  ),

  // Fenugreek — cluster of three ovate seeds
  fenugreek: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="14" cy="17" rx="5" ry="3" transform="rotate(-25 14 17)" />
      <ellipse cx="26" cy="17" rx="5" ry="3" transform="rotate(25 26 17)" />
      <ellipse cx="20" cy="26" rx="5.5" ry="3.2" />
    </svg>
  ),

  // Nigella Sativa — almond-shaped seed with center mark
  'nigella sativa': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 6c-7 7-7 21 0 28 7-7 7-21 0-28z" />
      <path d="M20 11v18" />
      <circle cx="20" cy="20" r="1.5" />
    </svg>
  ),

  // Fallback (small leaf with seed)
  default: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M20 6c-8 8-8 20 0 28 8-8 8-20 0-28z" />
      <circle cx="20" cy="20" r="2" />
    </svg>
  ),
}

function pickIcon(name) {
  if (!name) return ICONS.default
  const key = name.trim().toLowerCase()
  return ICONS[key] || ICONS.default
}

export default function Ingredients() {
  const head = useContent('content_ingredients_head', DEFAULT_HEAD)
  const list = useContent('content_ingredients', DEFAULT_LIST)
  const ingredients = Array.isArray(list) && list.length ? list : DEFAULT_LIST

  return (
    <section className="section ingredients" id="ingredients">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">
            <span className="line" />
            {head.eyebrow || DEFAULT_HEAD.eyebrow}
            <span className="line" />
          </div>
          <h2 className="section-title">
            {head.headline_a || DEFAULT_HEAD.headline_a} <em>{head.headline_em || DEFAULT_HEAD.headline_em}</em>
          </h2>
          <p className="section-sub">{head.sub || DEFAULT_HEAD.sub}</p>
        </div>

        <div className="ing-grid">
          {ingredients.map((ing, i) => (
            <div className="ing-card reveal" key={ing.name || i}>
              <div className="ing-icon">
                {ing.image_url ? (
                  <img
                    src={resolveImageUrl(ing.image_url)}
                    alt={ing.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  pickIcon(ing.name)
                )}
              </div>
              <h3 className="ing-name">{ing.name}</h3>
              <p className="ing-latin">{ing.latin}</p>
              <p className="ing-desc">{ing.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
