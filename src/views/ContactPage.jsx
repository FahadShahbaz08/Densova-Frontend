import { useState } from 'react'
import { useSelector } from 'react-redux'

import SEOHead from '../components/common/SEOHead'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'
import ScrollProgress from '../components/sections/ScrollProgress'

import { useContent } from '../hooks/useContent'
import { selectSettings } from '../store/slices/settingsSlice'
import { contactAPI } from '../services/api'

const DEFAULT = {
  brand: 'Densova',
  philosophy: 'We believe in old hands and good plants — in formulas earned through patience.',
  care_email: 'care@densova.com',
  care_phone: '+92 310 3789079',
  care_hours: 'Mon — Sat, 10am–6pm PKT',
  whatsapp:  '+923103789079',
}

const SUBJECTS = [
  'General inquiry',
  'Order question',
  'Product advice',
  'Returns & refunds',
  'Wholesale / collaboration',
  'Other',
]

const initialForm = {
  name: '', email: '', phone: '', subject: 'General inquiry', message: '',
}

export default function ContactPage() {
  const settings = useSelector(selectSettings)
  const footer   = useContent('content_footer', {})

  const brandName   = footer.brand        || DEFAULT.brand
  const careEmail   = footer.care_email   || settings.business_email || DEFAULT.care_email
  const carePhone   = footer.care_phone   || settings.business_phone || DEFAULT.care_phone
  const careHours   = footer.care_hours   || DEFAULT.care_hours
  const whatsappRaw = settings.whatsapp_number || DEFAULT.whatsapp
  const whatsappLink = whatsappRaw
    ? `https://wa.me/${whatsappRaw.replace(/[^\d]/g, '')}`
    : null

  const [form, setForm]       = useState(initialForm)
  const [errors, setErrors]   = useState({})
  const [status, setStatus]   = useState('idle')   // 'idle' | 'sending' | 'success' | 'error'
  const [serverMsg, setServerMsg] = useState('')

  const update = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErrors(errs => ({ ...errs, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name = 'Required'
    if (!form.email.trim())   e.email = 'Required'
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.message.trim()) e.message = 'Please share a few lines'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setStatus('sending')
    setServerMsg('')
    try {
      const { data } = await contactAPI.send({
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim() || null,
        subject: form.subject || null,
        message: form.message.trim(),
      })
      setStatus('success')
      setServerMsg(data?.message || 'Thank you. We will get back to you shortly.')
      setForm(initialForm)
    } catch (err) {
      setStatus('error')
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' · ')
        : err.response?.data?.message || 'Could not send. Please try again.'
      setServerMsg(msg)
    }
  }

  return (
    <>
      <SEOHead title={`Contact · ${brandName}`} description="Get in touch with the Densova Apothecary — questions, orders, collaboration, press." />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <section className="contact-hero">
        <div className="container">
          <div className="eyebrow"><span className="line" />We&apos;d love to hear<span className="line" /></div>
          <h1 className="contact-title">Write to the <em>Apothecary.</em></h1>
          <p className="contact-sub">
            Whether it&apos;s a question about your ritual, your order, or a brand we should know about — share a few lines and we&apos;ll write back.
            We answer every message personally, usually within one business day.
          </p>
        </div>
      </section>

      <section className="contact-body">
        <div className="container">
          <div className="contact-grid">
            {/* LEFT — info / contact ways */}
            <aside className="contact-info">
              <div className="ci-card">
                <div className="ci-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div className="ci-label">Email</div>
                <a className="ci-value" href={`mailto:${careEmail}`}>{careEmail}</a>
                <div className="ci-hint">Best for detailed questions</div>
              </div>

              <div className="ci-card">
                <div className="ci-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div className="ci-label">Phone</div>
                <a className="ci-value" href={`tel:${carePhone.replace(/[^\d+]/g, '')}`}>{carePhone}</a>
                <div className="ci-hint">{careHours}</div>
              </div>

              {whatsappLink && (
                <div className="ci-card">
                  <div className="ci-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 21l1.5-4A8 8 0 1 1 7 19.5L3 21z"/><path d="M9 9c.5 1 1.5 2 3 3s2.5 2 3.5 1.5L17 13"/></svg>
                  </div>
                  <div className="ci-label">WhatsApp</div>
                  <a className="ci-value" href={whatsappLink} target="_blank" rel="noopener noreferrer">{carePhone}</a>
                  <div className="ci-hint">Fastest response</div>
                </div>
              )}

              <div className="ci-card subtle">
                <div className="ci-label">Atelier</div>
                <p className="ci-value-static">Hand-blended in small batches in Pakistan</p>
                <div className="ci-hint">{careHours}</div>
              </div>
            </aside>

            {/* RIGHT — the form */}
            <div className="contact-card">
              {status === 'success' ? (
                <div className="contact-success">
                  <div className="cs-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3>Message received.</h3>
                  <p>{serverMsg}</p>
                  <button className="btn btn-ghost" onClick={() => { setStatus('idle'); setServerMsg('') }}>
                    Send another
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="contact-form">
                  <div className="cf-head">
                    <h2>Send us a note</h2>
                    <p>We&apos;ll write back to the email you provide. No mailing lists, no marketing.</p>
                  </div>

                  <div className="cf-grid">
                    <CField label="Name *" name="name" value={form.name} onChange={update('name')} error={errors.name} />
                    <CField label="Email *" name="email" type="email" value={form.email} onChange={update('email')} error={errors.email} />
                    <CField label="Phone (optional)" name="phone" placeholder="03XX-XXXXXXX" value={form.phone} onChange={update('phone')} error={errors.phone} />
                    <div className="cf-field">
                      <label>Subject</label>
                      <select value={form.subject} onChange={update('subject')}>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="cf-field cf-full">
                    <label>Message *</label>
                    <textarea rows={6} value={form.message} onChange={update('message')} placeholder="Share a few lines about your question or feedback…"
                      style={errors.message ? { borderColor: '#b14a3c' } : undefined} />
                    {errors.message && <span className="cf-error">{errors.message}</span>}
                  </div>

                  {status === 'error' && serverMsg && (
                    <div className="cf-server-error">{serverMsg}</div>
                  )}

                  <button type="submit" className="btn btn-gold cf-submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending…' : 'Send Message'}
                    {status !== 'sending' && (
                      <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>

                  <p className="cf-tiny">
                    By submitting you agree to be contacted regarding your inquiry. We never share your details.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}

function CField({ label, name, type = 'text', value, onChange, error, placeholder }) {
  return (
    <div className="cf-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={error ? { borderColor: '#b14a3c' } : undefined} />
      {error && <span className="cf-error">{error}</span>}
    </div>
  )
}
