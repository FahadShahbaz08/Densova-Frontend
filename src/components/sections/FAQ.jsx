import { useState } from 'react'
import { useContent } from '../../hooks/useContent'

const DEFAULT_HEAD = {
  eyebrow: 'The Journal',
  headline_a: 'Quiet answers to',
  headline_em: 'thoughtful questions.',
}

const DEFAULT_LIST = [
  { q: 'How long before I see results?', a: 'Botanicals work in seasons, not days. Most notice a calmer scalp within two weeks, visibly stronger strands by week six, and a meaningful difference in density and shine at the 90-day mark. Consistency is the active ingredient.' },
  { q: 'Is it suitable for coloured or chemically-treated hair?', a: 'Yes. The infusion is free of sulfates, silicones and parabens, so it doesn\'t strip pigment or interact with most treatments. It often helps restore the integrity processing tends to borrow.' },
  { q: 'Will it leave my hair greasy?', a: 'No. The cold-pressed base is unusually light — it absorbs into the scalp rather than sitting on it. For finer hair types, the Daily Boost method is the most graceful way to begin.' },
  { q: 'Where is Densova made?', a: 'Densova is hand-blended in small batches in Pakistan, drawing on the herbal heritage of the region and the standards of a modern apothecary. Each bottle is sealed and numbered.' },
  { q: 'Do you ship internationally?', a: 'We ship across Pakistan with free delivery on orders above Rs 5,000. International shipping is coming soon — subscribe to be notified when your country is added.' },
  { q: 'What is your return policy?', a: 'Our 30-day Ritual Promise: if you don\'t see or feel a difference, return your bottle — even half-used — for a full refund. We\'d rather make it right than make a sale.' },
]

export default function FAQ() {
  const head = useContent('content_faq_head', DEFAULT_HEAD)
  const list = useContent('content_faq', DEFAULT_LIST)
  const faqs = Array.isArray(list) && list.length ? list : DEFAULT_LIST
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="section-head">
          <div className="eyebrow"><span className="line" />{head.eyebrow || DEFAULT_HEAD.eyebrow}<span className="line" /></div>
          <h2 className="section-title">
            {head.headline_a || DEFAULT_HEAD.headline_a} <em>{head.headline_em || DEFAULT_HEAD.headline_em}</em>
          </h2>
        </div>

        <div className="faq-list">
          {faqs.map(({ q, a }, i) => {
            const isOpen = openIndex === i
            return (
              <div className={`faq-item${isOpen ? ' open' : ''}`} key={i}>
                <div
                  className="faq-q" role="button" tabIndex={0} aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault(); setOpenIndex(isOpen ? null : i)
                    }
                  }}
                >
                  {q}
                  <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                </div>
                <div className="faq-a">{a}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
