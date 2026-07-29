import { useContent } from '../../hooks/useContent'

const DEFAULT = {
  eyebrow: 'The Densova Standard',
  headline_a: 'What we leave out matters as much as',
  headline_em: 'what we leave in.',
  badges: ['Paraben Free', 'Sulfate Free', 'Silicone Free', 'Herbal Extracts', '100% Natural'],
}

// ── Unique icons per badge (keyed by lowercased title) ────────────────────────
const ICONS = {
  // Paraben Free — chemical flask crossed out
  'paraben free': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 7h8M18 7v8l-6 14a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-14V7" />
      <line x1="8" y1="32" x2="32" y2="8" />
    </svg>
  ),

  // Sulfate Free — foam bubbles crossed out
  'sulfate free': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="22" r="6" />
      <circle cx="25" cy="16" r="4" />
      <circle cx="27" cy="26" r="3.5" />
      <line x1="8" y1="32" x2="32" y2="8" />
    </svg>
  ),

  // Silicone Free — oil droplet crossed out
  'silicone free': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7c-6 8-9 14-9 18a9 9 0 0 0 18 0c0-4-3-10-9-18z" />
      <line x1="8" y1="32" x2="32" y2="8" />
    </svg>
  ),

  // Herbal Extracts — leaf sprig (positive, no strike)
  'herbal extracts': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 8c-12 0-20 6-20 18 0 0 12-2 20-18z" />
      <path d="M10 34L26 16" />
    </svg>
  ),

  // 100% Natural — broad leaf with veins
  '100% natural': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6c-8 0-12 6-12 14s4 14 12 14 12-6 12-14-4-14-12-14z" />
      <path d="M20 8v24" />
      <path d="M20 14L12 18M20 14L28 18M20 22L12 26M20 22L28 26" />
    </svg>
  ),

  // Cruelty Free — heart
  'cruelty free': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 33s-13-7-13-16a6 6 0 0 1 13 0 6 6 0 0 1 13 0c0 9-13 16-13 16z" />
    </svg>
  ),

  // Vegan — V with sprouting leaf
  vegan: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 9L20 32 30 9" />
      <path d="M23 17c2-4 6-4 8-2-1 3-4 5-8 5z" />
    </svg>
  ),

  // Gluten Free — wheat with strike
  'gluten free': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 8v24" />
      <path d="M20 14l-5-3M20 14l5-3M20 20l-5-3M20 20l5-3M20 26l-5-3M20 26l5-3" />
      <line x1="8" y1="32" x2="32" y2="8" />
    </svg>
  ),

  // Cold Pressed — droplet with snowflake-ish base
  'cold pressed': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6c-5 8-8 13-8 17a8 8 0 0 0 16 0c0-4-3-9-8-17z" />
      <path d="M16 26h8" />
    </svg>
  ),

  // Dermatologist Tested — checklist
  'dermatologist tested': (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="10" y="7" width="20" height="26" rx="2" />
      <path d="M14 14l2 2 4-4M14 22l2 2 4-4M22 14h6M22 22h6M14 28h12" />
    </svg>
  ),

  // Default — original "no" / prohibition mark
  default: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="14" />
      <line x1="10" y1="30" x2="30" y2="10" />
    </svg>
  ),
}

function pickIcon(title) {
  if (!title) return ICONS.default
  const key = title.trim().toLowerCase()
  if (ICONS[key]) return ICONS[key]
  // Fuzzy fallback: if title contains "free" and isn't matched explicitly, use default prohibition
  return ICONS.default
}

export default function Purity() {
  const c = useContent('content_purity', DEFAULT)
  const badges = Array.isArray(c.badges) && c.badges.length ? c.badges : DEFAULT.badges

  return (
    <section className="section purity">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow">
            <span className="line" style={{ background: 'var(--gold-2)' }} />
            {c.eyebrow || DEFAULT.eyebrow}
            <span className="line" style={{ background: 'var(--gold-2)' }} />
          </div>
          <h2 className="section-title">
            {c.headline_a || DEFAULT.headline_a} <em>{c.headline_em || DEFAULT.headline_em}</em>
          </h2>
        </div>

        <div className="badge-grid">
          {badges.map((title) => (
            <div className="badge" key={title}>
              <div className="badge-circle">
                {pickIcon(title)}
              </div>
              <p className="badge-title">{title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
