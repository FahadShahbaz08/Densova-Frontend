import { useContent } from '../../hooks/useContent'

const DEFAULT_ITEMS = ['Strength', 'Growth', 'Repair', 'Inspired by Nature']

export default function MarqueeBand() {
  const items = useContent('content_marquee', DEFAULT_ITEMS)
  const list = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS

  const Track = () => (
    <span>
      {Array.from({ length: 2 }).map((_, dup) =>
        list.map((item, i) => (
          <span key={`${dup}-${i}`}>
            {' '}
            <span className={i % 2 === 1 ? 'gold' : undefined}>{item}</span>{' '}
            <span className="star">✦</span>
          </span>
        ))
      )}
    </span>
  )

  return (
    <section className="marquee-band" aria-hidden="true">
      <div className="marquee-track">
        <Track />
        <Track />
      </div>
    </section>
  )
}
