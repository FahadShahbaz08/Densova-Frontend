import { useContent } from '../../hooks/useContent'

const DEFAULT = {
  text: 'Old hands. Good plants. Slow rituals returned, untouched, to a faster world.',
  signed: '— The Densova Apothecary',
}

export default function QuoteBand() {
  const q = useContent('content_quote', DEFAULT)
  return (
    <section className="quote-band">
      <div className="container-sm">
        <p>&ldquo;{q.text || DEFAULT.text}&rdquo;</p>
        <div className="signed">{q.signed || DEFAULT.signed}</div>
      </div>
    </section>
  )
}
