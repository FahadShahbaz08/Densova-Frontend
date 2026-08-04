import { useState } from 'react'
import { Link } from '../router'

import SEOHead from '../components/common/SEOHead'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'

import { ordersAPI } from '../services/api'

const rs = (n) => 'Rs ' + Number(n).toLocaleString('en-PK')

const STATUS_FLOW = ['pending', 'confirmed', 'shipped', 'delivered']
const STATUS_LABEL = {
  pending:          'Pending',
  awaiting_payment: 'Awaiting Payment',
  confirmed:        'Confirmed',
  shipped:          'Shipped',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
}

export default function OrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)

  const lookup = async (e) => {
    e.preventDefault()
    setError(null)
    setOrder(null)
    setLoading(true)
    try {
      const { data } = await ordersAPI.track({
        order_number: orderNumber.trim(),
        phone: phone.replace(/[^\d]/g, ''),
      })
      setOrder(data.data || data)
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Check the details and try again.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order
    ? STATUS_FLOW.indexOf(order.status === 'awaiting_payment' ? 'pending' : order.status)
    : -1

  return (
    <>
      <SEOHead title="Track Your Order" />
      <AnnouncementBar />
      <Navbar />

      <section className="track-section">
        <div className="container">
          <div className="track-card">
            <div className="eyebrow" style={{ marginBottom: 14, justifyContent: 'flex-start' }}>
              <span className="line" />Order Tracking
            </div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontWeight: 300, fontSize: 32, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
              Where is my <em style={{ background: 'var(--gold-grad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', fontStyle: 'italic' }}>ritual?</em>
            </h1>

            <form onSubmit={lookup}>
              <label className="co-field">
                <span>Order ID</span>
                <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="ORD-20260518-0001" required />
              </label>
              <label className="co-field">
                <span>Phone Number (last 4 digits enough)</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0312 3456789" required />
              </label>
              {error && (
                <p role="alert" style={{ color: '#b14a3c', fontSize: 13, marginBottom: 14 }}>{error}</p>
              )}
              <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Looking up…' : 'Track Order'}
                {!loading && (
                  <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                )}
              </button>
            </form>

            {order && (
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                <p style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--muted)', margin: '0 0 4px' }}>
                  Order
                </p>
                <p style={{ fontFamily: 'var(--f-mono)', fontSize: 16, margin: '0 0 4px' }}>
                  {order.order_number}
                </p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>

                {/* Status progress */}
                <div className="track-status-bar" aria-label="Order progress">
                  {STATUS_FLOW.map((s, i) => (
                    <div
                      key={s}
                      className={`track-step${i < currentStep ? ' done' : ''}${i === currentStep ? ' current' : ''}`}
                      title={STATUS_LABEL[s]}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginTop: 6 }}>
                  {STATUS_FLOW.map((s) => <span key={s}>{STATUS_LABEL[s]}</span>)}
                </div>

                <p style={{ marginTop: 16, fontSize: 14, color: 'var(--ink)' }}>
                  <strong>Current status:</strong> {STATUS_LABEL[order.status] || order.status}
                </p>

                <div className="track-meta-grid">
                  <div><span>Payment</span><strong>{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Advance Payment'}</strong></div>
                  <div><span>Total</span><strong>{rs(order.total)}</strong></div>
                  {order.tracking_number && (
                    <>
                      <div><span>Courier</span><strong>{order.courier || '—'}</strong></div>
                      <div><span>Tracking #</span><strong>{order.tracking_number}</strong></div>
                    </>
                  )}
                </div>

                {order.status === 'cancelled' && (
                  <p style={{ marginTop: 14, color: '#b14a3c', fontSize: 13 }}>
                    This order was cancelled. Please contact us if you have questions.
                  </p>
                )}
              </div>
            )}

            <p style={{ marginTop: 22, textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
              Lost your Order ID? <Link to="/">Browse the collection</Link> or message us on WhatsApp.
            </p>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppFloat />
    </>
  )
}
