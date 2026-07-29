import { useSelector } from 'react-redux'

import SEOHead from '../components/common/SEOHead'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'
import ScrollProgress from '../components/sections/ScrollProgress'

import { useContent } from '../hooks/useContent'
import { selectSettings } from '../store/slices/settingsSlice'

// Content-editable via the `content_returns` setting; these are the defaults.
const DEFAULT = {
  eyebrow: 'Policies',
  headline_a: 'Return &',
  headline_em: 'Exchange Policy.',
  intro: 'A short note on how we handle returns, exchanges, and anything that arrives less than perfect.',
  points: [
    {
      title: 'Opened or used products',
      body: 'Due to hygiene and safety reasons, opened or used products cannot be returned or exchanged.',
    },
    {
      title: 'Damaged, defective, or incorrect items',
      body: 'If you receive a damaged, defective, or incorrect item, please contact us within 24–48 hours of delivery with photos/videos for a replacement or resolution.',
    },
  ],
}

export default function ReturnPolicyPage() {
  const c = useContent('content_returns', DEFAULT)
  const settings = useSelector(selectSettings)
  const points = Array.isArray(c.points) && c.points.length ? c.points : DEFAULT.points

  const email = settings.business_email || 'care@densova.com'
  const waRaw = settings.whatsapp_number || '+923103789079'
  const waLink = `https://wa.me/${waRaw.replace(/[^\d]/g, '')}`

  return (
    <>
      <SEOHead
        title="Return & Exchange Policy · Densova"
        description="Densova's return and exchange policy — hygiene rules, and how we handle damaged, defective, or incorrect items."
      />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <section className="contact-hero">
        <div className="container">
          <div className="eyebrow"><span className="line" />{c.eyebrow || DEFAULT.eyebrow}<span className="line" /></div>
          <h1 className="contact-title">
            {c.headline_a || DEFAULT.headline_a} <em>{c.headline_em || DEFAULT.headline_em}</em>
          </h1>
          {(c.intro || DEFAULT.intro) && <p className="contact-sub">{c.intro || DEFAULT.intro}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <div style={{ display: 'grid', gap: 20 }}>
            {points.map((p, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--cream-2)',
                  border: '1px solid var(--line-2)',
                  borderRadius: 'var(--r-md)',
                  padding: '24px 26px',
                }}
              >
                {p.title && (
                  <h3 style={{
                    fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 20,
                    color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-0.01em',
                  }}>
                    {p.title}
                  </h3>
                )}
                <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>

          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8, marginTop: 28 }}>
            Questions about a return or a damaged order? Email{' '}
            <a href={`mailto:${email}`} style={{ color: 'var(--forest)', fontWeight: 600 }}>{email}</a>{' '}
            or message us on{' '}
            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest)', fontWeight: 600 }}>WhatsApp</a>.
          </p>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
