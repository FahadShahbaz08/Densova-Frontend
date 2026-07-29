import { useContent } from '../../hooks/useContent'

const DEFAULT_HEAD = {
  eyebrow: 'The Method',
  headline_a: 'Two ways to',
  headline_em: 'begin the ritual.',
  sub: 'Generous enough for a weekly ceremony, gentle enough to use every day.',
}

const DEFAULT_LIST = [
  {
    num: '01', title: 'Intensive Care', sub: 'Direct application · 2–3 times a week',
    steps: [
      'Warm 1–2 teaspoons of the infusion between the palms.',
      'Section the hair and massage gently into scalp for 3–5 minutes.',
      'Smooth the remainder through mid-lengths to ends.',
      'Leave for 45 minutes — ideally overnight — then cleanse as usual.',
    ],
  },
  {
    num: '02', title: 'Daily Boost', sub: 'Mix-in · everyday strengthening',
    steps: [
      'Add a few drops to your shampoo or conditioner in the palm.',
      'Work into wet hair and scalp, letting it settle for 60 seconds.',
      'Rinse thoroughly with cool water to seal the cuticle.',
      'Use consistently — the ritual rewards patience.',
    ],
  },
]

export default function HowToUse() {
  const head = useContent('content_howto_head', DEFAULT_HEAD)
  const raw = useContent('content_howto', DEFAULT_LIST)
  const list = Array.isArray(raw) && raw.length ? raw : DEFAULT_LIST

  return (
    <section className="section how">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow"><span className="line" />{head.eyebrow || DEFAULT_HEAD.eyebrow}<span className="line" /></div>
          <h2 className="section-title">
            {head.headline_a || DEFAULT_HEAD.headline_a} <em>{head.headline_em || DEFAULT_HEAD.headline_em}</em>
          </h2>
          <p className="section-sub">{head.sub || DEFAULT_HEAD.sub}</p>
        </div>

        <div className="how-grid">
          {list.map((card, i) => {
            // Accept steps as array OR as newline-separated string (from admin textarea)
            let steps = card.steps
            if (typeof steps === 'string') steps = steps.split('\n').map(s => s.trim()).filter(Boolean)
            if (!Array.isArray(steps)) steps = []
            return (
              <div className="how-card reveal" key={i}>
                <div className="how-num">{card.num || String(i + 1).padStart(2, '0')}</div>
                <h3 className="how-title">{card.title}</h3>
                <p className="how-sub">{card.sub}</p>
                <ol className="how-steps">
                  {steps.map((s, j) => <li key={j}>{s}</li>)}
                </ol>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
