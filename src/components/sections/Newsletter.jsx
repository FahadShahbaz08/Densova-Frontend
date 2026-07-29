import { useState } from 'react'
import { newsletterAPI } from '../../services/api'
import { useContent } from '../../hooks/useContent'

const DEFAULT = {
  headline_a: 'Letters from the',
  headline_em: 'Apothecary.',
  description: 'Subscribe for slow notes on rituals, ingredients, and early access to small-batch releases. No noise.',
  placeholder: 'Your email address',
  cta_text: 'Subscribe',
  note: 'No spam. Unsubscribe anytime.',
  success_msg: 'Subscribed — letters from the apothecary will arrive slowly.',
}

export default function Newsletter() {
  const c = useContent('content_newsletter', DEFAULT)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      await newsletterAPI.subscribe(email)
      setStatus('success')
      setMessage(c.success_msg || DEFAULT.success_msg)
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err.response?.data?.errors?.email?.[0] || 'Subscription failed. Try again.')
    }
  }

  return (
    <section className="newsletter" id="newsletter">
      <div className="container">
        <div className="newsletter-inner">
          <h2>{c.headline_a || DEFAULT.headline_a} <em>{c.headline_em || DEFAULT.headline_em}</em></h2>
          <p>{c.description || DEFAULT.description}</p>
          <form className="newsletter-form" onSubmit={onSubmit}>
            <input
              type="email" required
              placeholder={c.placeholder || DEFAULT.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing…' : (c.cta_text || DEFAULT.cta_text)}
            </button>
          </form>
          {message && (
            <p role="status" className="newsletter-tiny"
              style={{ color: status === 'success' ? 'var(--gold-2)' : '#FFB1A8' }}>
              {message}
            </p>
          )}
          {!message && <p className="newsletter-tiny">{c.note || DEFAULT.note}</p>}
        </div>
      </div>
    </section>
  )
}
