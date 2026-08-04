import { Link, useLocation, useNavigate } from '../../router'
import { useContent } from '../../hooks/useContent'

// ── Smart link defaults ───────────────────────────────────────────────────────
// Hash anchors (#shop, #ingredients) scroll to homepage sections.
// /shop/{slug} navigates to product detail pages.
// mailto: and tel: open the user's mail / dialer app.
// External URLs open in a new tab via target="_blank".
const DEFAULT = {
  brand: 'Densova',
  philosophy: 'We believe in old hands and good plants — in formulas earned through patience, and rituals returned, untouched, to a faster world.',
  social: {
    instagram: 'https://www.instagram.com/densova.official?igsh=MXQzdHQ0d3ozcXdqag%3D%3D',
    tiktok:    'https://www.tiktok.com/@densova.official?_r=1&_t=ZS-96XsqN8v2HN',
    facebook:  '',   // empty = hidden
    whatsapp:  'https://wa.me/923103789079',
  },
  columns: [
    { title: 'Shop', links: [
      { label: 'All Products',     url: '#shop' },
      { label: 'Hair Infusion',    url: '/shop/advanced-herbal-hair-infusion-250ml' },
      { label: 'Gift Sets',        url: '#shop' },
      { label: 'New Arrivals',     url: '#shop' },
      { label: 'Subscribe & Save', url: '#newsletter' },
    ]},
    { title: 'Atelier', links: [
      { label: 'Our Story',   url: '#feature' },
      { label: 'Ingredients', url: '#ingredients' },
      { label: 'Reviews',     url: '#reviews' },
      { label: 'The Journal', url: '#faq' },
      { label: 'Contact Us',  url: '/contact' },
      // { label: 'Press',       url: 'mailto:press@densova.com' },
    ]},
  ],
  care_title: 'Care',
  care_email: 'care@densova.com',
  care_phone: '+92 310 3789079',
  care_hours: 'Mon — Sat, 10am–6pm PKT',
  copyright: '© 2026 Densova Apothecary. All rights reserved.',
  made: 'Made with care in Pakistan',
  legal: 'Privacy · Terms · Returns',
}

// ── Detect link type and produce proper href ──────────────────────────────────
function linkProps(url) {
  if (!url) return { href: '#', onClick: (e) => e.preventDefault() }
  const isExternal = /^https?:\/\//i.test(url)
  if (isExternal) return { href: url, target: '_blank', rel: 'noopener noreferrer' }
  // mailto: / tel: / hash anchors / internal routes — all use default href behaviour
  return { href: url }
}

// Strip everything except + and digits, so "tel:+92 310 3789079" works on all devices.
function telHref(raw) {
  if (!raw) return null
  return 'tel:' + raw.replace(/[^\d+]/g, '')
}

export default function Footer() {
  const c = useContent('content_footer', DEFAULT)
  const social = c.social || DEFAULT.social
  const columns = Array.isArray(c.columns) && c.columns.length ? c.columns : DEFAULT.columns
  const location = useLocation()
  const navigate = useNavigate()

  // If a hash link is clicked while user is NOT on the homepage,
  // navigate to / with the hash so HomePage can scroll to that section.
  const handleHashNav = (e, url) => {
    if (!url || !url.startsWith('#')) return
    if (location.pathname === '/') return
    e.preventDefault()
    navigate('/' + url)
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          {/* ── Brand + philosophy + social ─────────────────────────── */}
          <div className="footer-brand">
            <a href="#top" className="brand" onClick={(e) => handleHashNav(e, '#top')}>{c.brand || DEFAULT.brand}</a>
            <p className="footer-philosophy">&ldquo;{c.philosophy || DEFAULT.philosophy}&rdquo;</p>
            <div className="social-row">
              {social.instagram && (
                <a {...linkProps(social.instagram)} className="social-btn" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                </a>
              )}
              {social.tiktok && (
                <a {...linkProps(social.tiktok)} className="social-btn" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 3v3.5a3.5 3.5 0 0 0 3.5 3.5V13a6.5 6.5 0 0 1-3.5-1V16a5 5 0 1 1-5-5v3a2 2 0 1 0 2 2V3h3z" />
                  </svg>
                </a>
              )}
              {social.facebook && (
                <a {...linkProps(social.facebook)} className="social-btn" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9c0-.9.3-1.5 1.5-1.5h1.4V4.8c-.3 0-1.3-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3V11H7v3h2.7v7h3.8z" />
                  </svg>
                </a>
              )}
              {social.whatsapp && (
                <a {...linkProps(social.whatsapp)} className="social-btn" aria-label="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 21l1.5-4A8 8 0 1 1 7 19.5L3 21z" />
                    <path d="M9 9c.5 1 1.5 2 3 3s2.5 2 3.5 1.5L17 13" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* ── Link columns ────────────────────────────────────────── */}
          {columns.map((col, idx) => {
            let links = col.links
            if (typeof links === 'string') {
              try { links = JSON.parse(links) } catch { links = [] }
            }
            if (!Array.isArray(links)) links = []
            return (
              <div className="footer-col" key={idx}>
                <h4>{col.title}</h4>
                <ul>
                  {links.map((link, j) => (
                    <li key={j}>
                      <a {...linkProps(link.url)} onClick={(e) => handleHashNav(e, link.url)}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}

          {/* ── Care contact column ─────────────────────────────────── */}
          <div className="footer-col">
            <h4>{c.care_title || DEFAULT.care_title}</h4>
            {(c.care_email || DEFAULT.care_email) && (
              <p>
                <a href={`mailto:${c.care_email || DEFAULT.care_email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {c.care_email || DEFAULT.care_email}
                </a>
              </p>
            )}
            {(c.care_phone || DEFAULT.care_phone) && (
              <p>
                <a href={telHref(c.care_phone || DEFAULT.care_phone)} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {c.care_phone || DEFAULT.care_phone}
                </a>
              </p>
            )}
            <p style={{ marginTop: 14, fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--gold-2)' }}>
              {c.care_hours || DEFAULT.care_hours}
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>{c.copyright || DEFAULT.copyright}</div>
          <div className="made">{c.made || DEFAULT.made}</div>
          <div>
            {(c.legal || DEFAULT.legal).split('·').map((part, i, arr) => {
              const text = part.trim()
              return (
                <span key={i}>
                  {/returns?/i.test(text)
                    ? <Link to="/returns" style={{ color: 'inherit' }}>{text}</Link>
                    : text}
                  {i < arr.length - 1 && ' · '}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
