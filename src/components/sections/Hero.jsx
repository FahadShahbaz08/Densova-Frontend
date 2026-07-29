import { useRef, useState } from 'react'
import { useContent } from '../../hooks/useContent'

const DEFAULT = {
  eyebrow: 'Densova Apothecary · Est. 2024',
  headline_a: 'Botanicals,',
  headline_b: 'bottled in',
  headline_em: 'quiet ritual.',
  pillars: ['Strength', 'Growth', 'Repair'],
  description: 'Slow-pressed in small batches with eight time-honoured herbs. Densova is a modern apothecary built around one belief — that nature, given time, knows what it\'s doing.',
  cta_text: 'Shop the Collection',
  cta_link: '#shop',
  secondary_text: 'Discover the Ritual',
  secondary_link: '#feature',
  trust: [
    { value: '4.9 / 5', label: 'From 2,400+ reviews', stars: true },
    { value: '100%', label: 'Botanical formula' },
    { value: '250 ml', label: 'Hand-filled flacons' },
  ],
  video_tag: 'Live · The Densova Reel',
  video_title: 'Advanced Herbal Infusion',
  video_sub: '250 ml · Bestseller',
}

export default function Hero() {
  const c = useContent('content_hero', DEFAULT)
  const videoRef = useRef(null)
  const [muted, setMuted] = useState(true)

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m
      if (videoRef.current) videoRef.current.muted = next
      return next
    })
  }

  const pillars = Array.isArray(c.pillars) ? c.pillars : DEFAULT.pillars
  const trust   = Array.isArray(c.trust)   ? c.trust   : DEFAULT.trust

  return (
    <section className="hero" id="top">
      <svg className="hero-leaf l1" viewBox="0 0 200 320" fill="currentColor" aria-hidden="true">
        <path d="M100 10 C 40 90, 30 220, 100 310 C 170 220, 160 90, 100 10 Z" opacity=".6" />
        <path d="M100 30 L 100 290" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      <svg className="hero-leaf l2" viewBox="0 0 200 320" fill="currentColor" aria-hidden="true">
        <path d="M100 10 C 40 90, 30 220, 100 310 C 170 220, 160 90, 100 10 Z" opacity=".6" />
      </svg>
      <svg className="hero-leaf l3" viewBox="0 0 200 320" fill="currentColor" aria-hidden="true">
        <path d="M100 10 C 40 90, 30 220, 100 310 C 170 220, 160 90, 100 10 Z" opacity=".6" />
      </svg>

      <div className="container hero-grid">
        <div className="hero-content reveal">
          <div className="hero-eyebrow">
            <span className="dot" />
            {c.eyebrow || DEFAULT.eyebrow}
          </div>

          <h1 className="hero-title">
            {c.headline_a || DEFAULT.headline_a}<br />
            {c.headline_b || DEFAULT.headline_b} <em>{c.headline_em || DEFAULT.headline_em}</em>
          </h1>

          <div className="hero-pillars">
            {pillars.map((p, i) => (
              <span key={i}>
                {p}{i < pillars.length - 1 && <span className="sep" />}
              </span>
            ))}
          </div>

          <p className="hero-desc">{c.description || DEFAULT.description}</p>

          <div className="hero-cta-row">
            <a href={c.cta_link || DEFAULT.cta_link} className="btn btn-gold">
              {c.cta_text || DEFAULT.cta_text}
              <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </a>
            <a href={c.secondary_link || DEFAULT.secondary_link} className="btn-link">
              {c.secondary_text || DEFAULT.secondary_text} <span>→</span>
            </a>
          </div>

          <div className="hero-trust">
            {trust.map((t, i) => (
              <div key={i} className="trust-item">
                {t.stars && <span className="stars">★★★★★</span>}
                <strong>{t.value}</strong>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual reveal">
          <video ref={videoRef} autoPlay muted={muted} loop playsInline id="heroVideo">
            <source src="/densova-reel.mp4" type="video/mp4" />
          </video>
          <div className="hero-visual-tag">{c.video_tag || DEFAULT.video_tag}</div>
          <div className="hero-visual-meta">
            <div>
              <h4>{c.video_title || DEFAULT.video_title}</h4>
              <p>{c.video_sub || DEFAULT.video_sub}</p>
            </div>
            <button className="video-mute" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M5 9v6h4l5 4V5L9 9H5z" />
                {muted ? <path d="M16 9l5 6M21 9l-5 6" /> : <path d="M16 9c2 2 2 4 0 6" />}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
