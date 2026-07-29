import { useState, useEffect } from 'react'
import { useAdminUI } from './AdminContext'
import { adminAPI } from '../../services/api'

const fmt      = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')
const initials = (name) => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'

const STATUS_OPTIONS = ['pending','awaiting_payment','confirmed','shipped','delivered','cancelled']

const PILL_MAP = {
  pending:          { cls: 'warn',    label: 'Pending'      },
  awaiting_payment: { cls: 'warn',    label: 'Awaiting Pay' },
  confirmed:        { cls: 'info',    label: 'Confirmed'    },
  shipped:          { cls: 'info',    label: 'Shipped'      },
  delivered:        { cls: 'ok',      label: 'Delivered'    },
  cancelled:        { cls: 'err',     label: 'Cancelled'    },
  refunded:         { cls: 'neutral', label: 'Refunded'     },
}

function OrderDetail({ orderId }) {
  const { showToast, openFlyer } = useAdminUI()
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [statusVal, setStatusVal] = useState('')
  const [notes, setNotes]       = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    setLoading(true)
    adminAPI.orders.show(orderId).then(res => {
      // Laravel JsonResource wraps single resources in { data: {...} }
      const o = res.data?.data || res.data
      setOrder(o)
      setStatusVal(o?.status || '')
      setNotes(o?.admin_notes || o?.notes || '')
    }).catch(console.error).finally(() => setLoading(false))
  }, [orderId])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
  if (!order)  return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Order not found.</div>

  const handleUpdateStatus = async () => {
    setSaving(true)
    try {
      await adminAPI.orders.update(order.id, { status: statusVal })
      setOrder(o => ({ ...o, status: statusVal }))
      showToast('Status updated to ' + statusVal)
    } catch {
      showToast('Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotes = async () => {
    setSaving(true)
    try {
      await adminAPI.orders.update(order.id, { admin_notes: notes })
      showToast('Notes saved')
    } catch {
      showToast('Failed to save notes')
    } finally {
      setSaving(false)
    }
  }

  const items = order.items || []
  const subtotal = items.reduce((s, i) => s + (i.line_total || i.unit_price * i.quantity || 0), 0)

  return (
    <>
      <div className="dp-status-bar">
        <span className="label">Status</span>
        <select value={statusVal} onChange={e => setStatusVal(e.target.value)}>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
          ))}
        </select>
        <button className="btn btn-sm" onClick={handleUpdateStatus} disabled={saving}>Update</button>
      </div>

      <div className="dp-section">
        <h4>Customer</h4>
        <div className="dp-grid">
          <div className="item"><div className="lbl">Name</div><div className="val">{order.customer_name}</div></div>
          <div className="item"><div className="lbl">Email</div><div className="val">{order.customer_email || '—'}</div></div>
          <div className="item"><div className="lbl">Phone</div><div className="val">{order.customer_phone || '—'}</div></div>
          <div className="item"><div className="lbl">Payment</div><div className="val"><span style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: 12 }}>{order.payment_method}</span></div></div>
        </div>
      </div>

      <div className="dp-section">
        <h4>Shipping Address</h4>
        <div style={{ padding: 14, background: 'var(--cream-2)', borderRadius: 6, fontSize: 13, lineHeight: 1.7 }}>
          <strong style={{ fontFamily: 'var(--f-serif)', fontWeight: 500, fontSize: 15, display: 'block' }}>{order.customer_name}</strong>
          {order.shipping_address || '—'}
        </div>
      </div>

      {items.length > 0 && (
        <div className="dp-section">
          <h4>Items ({items.length})</h4>
          <div className="dp-items">
            {items.map((item, idx) => (
              <div className="dp-item" key={idx}>
                <div className="ico">
                  <div className="mini-bottle" style={{ background: '#E8D5BB' }} />
                </div>
                <div className="info">
                  <strong>{item.product_name}</strong>
                  <span>Qty {item.quantity}</span>
                </div>
                <div className="price">
                  {fmt(item.line_total || item.unit_price * item.quantity)}
                  <small style={{ display: 'block', fontSize: 11, color: 'var(--muted)' }}>{fmt(item.unit_price)} each</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dp-section">
        <div className="dp-summary">
          <div className="row"><span>Subtotal</span><span>{fmt(order.subtotal || subtotal)}</span></div>
          <div className="row"><span>Shipping</span><span>{order.shipping > 0 ? fmt(order.shipping) : 'Free'}</span></div>
          {order.discount_amount > 0 && (
            <div className="row"><span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span><span>−{fmt(order.discount_amount)}</span></div>
          )}
          <div className="row total"><span>Total</span><span>{fmt(order.total)}</span></div>
        </div>
      </div>

      <div className="dp-section">
        <h4>Timeline</h4>
        <div className="timeline">
          <div className={`tl-item${order.status === 'delivered' ? ' done' : ''}`}><strong>Delivered</strong><span>{order.delivered_at ? new Date(order.delivered_at).toLocaleDateString('en-PK') : 'Pending'}</span></div>
          <div className={`tl-item${['shipped','delivered'].includes(order.status) ? ' done' : ''}`}><strong>Shipped</strong><span>{order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('en-PK') : 'Pending'}</span></div>
          <div className={`tl-item${['confirmed','shipped','delivered'].includes(order.status) ? ' done' : ''}`}><strong>Confirmed</strong><span>{order.confirmed_at ? new Date(order.confirmed_at).toLocaleDateString('en-PK') : order.payment_method}</span></div>
          <div className="tl-item done"><strong>Order placed</strong><span>{new Date(order.created_at).toLocaleDateString('en-PK')}</span></div>
        </div>
      </div>

      <div className="dp-section">
        <h4>Admin Notes</h4>
        <textarea
          style={{ width: '100%', padding: 12, border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--f-sans)', minHeight: 80, boxSizing: 'border-box' }}
          placeholder="Add internal note…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button className="btn btn-sm btn-ghost" style={{ marginTop: 8 }} disabled={saving} onClick={handleSaveNotes}>
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </>
  )
}

function CustomerDetail({ customerId }) {
  const { openDetail } = useAdminUI()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    adminAPI.customers.show(customerId).then(res => {
      setCustomer(res.data?.data || res.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [customerId])

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
  if (!customer) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Customer not found.</div>

  const c = customer
  const orders = c.orders || []
  const ltv = orders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0)

  return (
    <>
      <div className="dp-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--f-serif)', fontSize: 18, flexShrink: 0 }}>
            {initials(c.name)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 16 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.email}</div>
          </div>
        </div>
        <div className="dp-grid">
          <div className="item"><div className="lbl">Phone</div><div className="val">{c.phone || '—'}</div></div>
          <div className="item"><div className="lbl">Tier</div><div className="val"><span className={`pill ${c.tier === 'VIP' ? 'gold' : c.tier === 'Repeat' ? 'info' : 'neutral'}`}>{c.tier || 'New'}</span></div></div>
          <div className="item"><div className="lbl">Total Orders</div><div className="val">{orders.length}</div></div>
          <div className="item"><div className="lbl">Lifetime Value</div><div className="val">{fmt(ltv)}</div></div>
        </div>
      </div>

      {(c.address || c.city) && (
        <div className="dp-section">
          <h4>Address</h4>
          <div style={{ padding: 14, background: 'var(--cream-2)', borderRadius: 6, fontSize: 13, lineHeight: 1.7 }}>
            {c.address && <>{c.address}<br /></>}
            {c.city}{c.city && c.country ? ', ' : ''}{c.country}
          </div>
        </div>
      )}

      <div className="dp-section">
        <h4>Order History ({orders.length})</h4>
        {orders.length > 0 ? orders.slice(0, 5).map(o => (
          <div key={o.id} className="dp-item" style={{ cursor: 'pointer', marginBottom: 8 }}
            onClick={() => openDetail('order', o.id)}>
            <div className="ico"><div className="mini-bottle" /></div>
            <div className="info">
              <strong>{o.order_number}</strong>
              <span>{new Date(o.created_at).toLocaleDateString('en-PK')} · {(o.items || []).length} items</span>
            </div>
            <div className="price">{fmt(o.total)}</div>
          </div>
        )) : <div style={{ color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>No orders yet</div>}
      </div>
    </>
  )
}

export default function DetailPanel() {
  const { detailPanel, closeDetail, openFlyer } = useAdminUI()

  const show = !!detailPanel
  let title = '', sub = '', footContent = null, bodyContent = null

  if (detailPanel?.mode === 'order') {
    title = `Order #${detailPanel.id}`
    bodyContent = <OrderDetail orderId={detailPanel.id} />
    footContent = (
      <>
        <button className="btn btn-ghost" onClick={closeDetail}>Close</button>
        <button className="btn btn-gold" onClick={() => openFlyer(detailPanel.id)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
          Print Flyer
        </button>
      </>
    )
  } else if (detailPanel?.mode === 'customer') {
    title = 'Customer Profile'
    bodyContent = <CustomerDetail customerId={detailPanel.id} />
    footContent = <button className="btn btn-ghost" onClick={closeDetail}>Close</button>
  }

  return (
    <>
      <div className={`detail-overlay${show ? ' show' : ''}`} onClick={closeDetail} />
      <aside className={`detail-panel${show ? ' show' : ''}`}>
        {show && (
          <>
            <div className="dp-head">
              <div>
                <h2>{title}</h2>
                {sub && <span className="sub">{sub}</span>}
              </div>
              <button className="dp-close" onClick={closeDetail}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>
            </div>
            <div className="dp-body">{bodyContent}</div>
            {footContent && <div className="dp-foot">{footContent}</div>}
          </>
        )}
      </aside>
    </>
  )
}
