import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from '../router'
import { useSelector } from 'react-redux'

import SEOHead from '../components/common/SEOHead'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'

import { selectSettings } from '../store/slices/settingsSlice'
import { ordersAPI } from '../services/api'

const rs = (n) => 'Rs ' + Number(n).toLocaleString('en-PK')

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams()
  const location = useLocation()
  const settings = useSelector(selectSettings)
  const [order, setOrder]   = useState(location.state?.order || null)
  const [error, setError]   = useState(null)
  const [loading, setLoading] = useState(!order)

  // If we landed here via direct URL (no state), fetch by email if provided.
  // For privacy, we cannot fetch without verification. So we just show a soft
  // fallback message if state is missing.
  useEffect(() => {
    if (order) return
    setLoading(false)
  }, [order])

  const isAdvance = (location.state?.payment === 'advance') ||
                    (order?.payment_method === 'advance')

  const waNumber = (settings.whatsapp_number || '+923103789079').replace(/[^\d]/g, '')
  const waMessage = encodeURIComponent(
`Assalam-o-Alaikum! I have placed an order on your website.
Order ID: ${orderNumber}
Name: ${order?.customer_name || ''}
Total Amount: ${order ? rs(order.total) : ''}
Payment Method: ${isAdvance ? 'Advance Payment' : 'Cash on Delivery'}
${isAdvance ? 'I will share the payment screenshot shortly.' : ''}
Thank you!`
  )
  const waHref = `https://wa.me/${waNumber}?text=${waMessage}`

  return (
    <>
      <SEOHead title="Order Confirmed" noIndex />
      <AnnouncementBar />
      <Navbar />

      <section className="oc">
        <div className="container">
          {!loading && !order ? (
            <div className="oc-card">
              <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 300, fontSize: 36, margin: '0 0 12px' }}>
                Your order is in.
              </h1>
              <div className="oc-id">{orderNumber}</div>
              <p style={{ color: 'var(--muted)', maxWidth: 480, margin: '0 auto 24px' }}>
                Thank you. Keep this order ID safe — you can use it any time to track your order.
              </p>
              <Link to="/track-order" className="btn btn-gold">
                Track this order
                <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
            </div>
          ) : (
            <div className="oc-card">
              <div className="oc-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </div>

              <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 300, fontSize: 42, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Thank you{order?.customer_name ? `, ${order.customer_name.split(' ')[0]}` : ''} —
                <br /><em style={{ background: 'var(--gold-grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontStyle: 'italic' }}>your ritual is on its way.</em>
              </h1>

              <p style={{ color: 'var(--muted)', maxWidth: 520, margin: '8px auto 4px' }}>
                Your order is reserved. Keep this Order ID — you can track your order anytime.
              </p>
              <div className="oc-id">{orderNumber}</div>

              {/* Next steps */}
              {isAdvance ? (
                <div className="oc-steps">
                  <h3>Two small steps to complete your order</h3>
                  <ol>
                    <li>
                      Transfer <strong>{rs(order?.total ?? 0)}</strong> to any of the accounts below:
                      <div style={{ marginTop: 10, padding: 14, background: 'var(--cream-2)', borderRadius: 10, fontSize: 13 }}>
                        {settings.jazzcash_enabled !== false && settings.jazzcash_number && <div>📱 <strong>JazzCash:</strong> {settings.jazzcash_number} · {settings.jazzcash_title}</div>}
                        {settings.easypaisa_enabled !== false && settings.easypaisa_number && <div>📱 <strong>Easypaisa:</strong> {settings.easypaisa_number} · {settings.easypaisa_title}</div>}
                        {settings.bank_enabled !== false && settings.bank_name && <div>🏦 <strong>{settings.bank_name}:</strong> {settings.bank_account} ({settings.bank_title})</div>}
                        {settings.iban_enabled !== false && settings.bank_iban && <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, marginTop: 4 }}>IBAN: {settings.bank_iban}</div>}
                      </div>
                    </li>
                    <li>
                      Send the payment screenshot to our WhatsApp business number using the button below —
                      include your Order ID so we can confirm quickly.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="oc-steps">
                  <h3>What happens next</h3>
                  <ol>
                    <li>We&apos;ll call you shortly on <strong>{order?.customer_phone || 'your number'}</strong> to confirm your order.</li>
                    <li>Your order will be hand-packed and dispatched within 24 hours.</li>
                    <li>Delivery typically arrives in <strong>3–5 business days</strong>. Pay in cash on delivery.</li>
                  </ol>
                </div>
              )}

              {/* WhatsApp CTA */}
              <a className="oc-wa-btn" href={waHref} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                  <path d="M27 4.6A14.9 14.9 0 0 0 16 0 15 15 0 0 0 3.1 22.6L1 32l9.7-2.5A14.9 14.9 0 0 0 16 31a15 15 0 0 0 11-26.4zM16 28a12 12 0 0 1-6.2-1.7l-.4-.3-5.7 1.5 1.5-5.6-.3-.5A12 12 0 1 1 16 28zm6.8-9c-.4-.2-2.2-1.1-2.5-1.2-.3-.1-.6-.2-.8.2-.3.4-.9 1.2-1.1 1.4-.2.2-.4.3-.7.1-2-.9-3.3-1.6-4.5-3.7-.4-.6.4-.6 1-1.9.1-.3 0-.5 0-.7-.1-.2-.8-1.8-1.1-2.5-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.4-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.6 5.7 5 .8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 2.2-.9 2.5-1.8.3-.9.3-1.6.2-1.8 0-.2-.3-.3-.6-.5z" />
                </svg>
                Send Order Details on WhatsApp
              </a>

              {/* Summary recap */}
              {order && (
                <div style={{ marginTop: 36, textAlign: 'left', maxWidth: 580, marginInline: 'auto' }}>
                  <h3 style={{ fontFamily: 'var(--f-display)', fontWeight: 400, fontSize: 20, margin: '0 0 14px' }}>
                    Order Summary
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14 }}>
                    {(order.items || []).map((i) => (
                      <li key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--line-2)' }}>
                        <span>{i.product_name} × {i.quantity}</span>
                        <span>{rs(i.line_total)}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 14 }}>
                    <Row label="Subtotal" value={rs(order.subtotal)} />
                    <Row label="Shipping" value={order.shipping === 0 ? 'Free' : rs(order.shipping)} />
                    {order.discount_amount > 0 && <Row label={`Discount (${order.discount_code})`} value={`- ${rs(order.discount_amount)}`} />}
                    <Row label="Total" value={rs(order.total)} bold />
                  </div>
                </div>
              )}

              <div style={{ marginTop: 32, display: 'inline-flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link to="/" className="btn-link">← Continue Shopping</Link>
                <Link to="/track-order" className="btn-link">Track this Order →</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, color: bold ? 'var(--ink)' : 'var(--muted)', fontWeight: bold ? 500 : 400 }}>
      <span>{label}</span>
      <span style={bold ? { fontFamily: 'var(--f-display)', color: 'var(--forest)', fontSize: 18 } : undefined}>{value}</span>
    </div>
  )
}
