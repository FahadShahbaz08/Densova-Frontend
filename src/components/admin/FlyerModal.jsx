import { useState, useEffect } from 'react'
import { useAdminUI } from './AdminContext'
import { adminAPI } from '../../services/api'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

const PAYMENT_LABEL = {
  cod:     { label: 'COD',     full: 'Cash on Delivery' },
  advance: { label: 'PREPAID', full: 'Prepaid' },
}

export default function FlyerModal() {
  const { flyerOrderId, closeFlyer } = useAdminUI()

  const [order, setOrder]     = useState(null)
  const [brand, setBrand]     = useState({})
  const [shipper, setShipper] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!flyerOrderId) return
    setLoading(true)
    setOrder(null)

    Promise.all([
      adminAPI.orders.show(flyerOrderId),
      adminAPI.settings.list(),
    ]).then(([orderRes, settingsRes]) => {
      // Unwrap Laravel JsonResource { data: {...} }
      setOrder(orderRes.data?.data || orderRes.data)
      const all = settingsRes.data || []
      const get = (key) => {
        const s = all.find(x => x.key === key)
        if (!s) return null
        try { return JSON.parse(s.value) } catch { return s.value }
      }
      const brandS = get('brand') || {}
      setBrand({
        name:    brandS.name    || 'Densova',
        tagline: brandS.tagline || 'Botanical Apothecary',
        phone:   brandS.phone   || get('business_phone') || '',
        email:   brandS.email   || get('business_email') || '',
      })
      setShipper({
        line1:   brandS.address_line1 || 'Plot 14, Industrial Area',
        line2:   brandS.address_line2 || 'Phase 3, Sundar Estate',
        city:    brandS.city          || 'Lahore',
        country: brandS.country       || 'Pakistan',
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [flyerOrderId])

  if (!flyerOrderId) return null

  if (loading) {
    return (
      <div className="flyer-overlay">
        <div className="flyer-toolbar">
          <div className="meta">Loading…</div>
          <button className="btn btn-ghost" onClick={closeFlyer}>Close</button>
        </div>
      </div>
    )
  }
  if (!order) return null

  const handlePrint = () => {
    // Inject @page A5 landscape just for this print job
    let styleEl = document.getElementById('flyer-page-style')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'flyer-page-style'
      styleEl.media = 'print'
      styleEl.textContent = '@page{size:A5 landscape;margin:8mm}'
      document.head.appendChild(styleEl)
    }
    document.body.classList.add('printing-flyer')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('printing-flyer')
      const el = document.getElementById('flyer-page-style')
      if (el) el.remove()
    }, 500)
  }

  const addr = order.shipping_address || {}
  const items = order.items || []
  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0)
  const pm = PAYMENT_LABEL[order.payment_method] || { label: (order.payment_method || '—').toUpperCase(), full: order.payment_method }
  const isCod = order.payment_method === 'cod'

  return (
    <>
      {/* ── On-screen modal wrapper (hidden in print) ───────────────────── */}
      <div className="flyer-overlay no-print" onClick={closeFlyer} />
      <div className="flyer-window no-print">
        <div className="flyer-toolbar no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>Courier Slip</span>
            <span style={{ width: 1, height: 14, background: 'var(--line-2)' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{order.order_number}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={closeFlyer} style={tbBtnGhost}>Close</button>
            <button onClick={handlePrint} style={tbBtnGold}>Print Slip</button>
          </div>
        </div>

        {/* ── THE SLIP itself ─────────────────────────────────────────── */}
        <div className="flyer-paper">
          <CourierSlip order={order} brand={brand} shipper={shipper} addr={addr} items={items} totalQty={totalQty} pm={pm} isCod={isCod} />
        </div>
      </div>

      {/* ── Print-only standalone copy (full A5 page) ────────────────────── */}
      <div className="flyer-print-only">
        <CourierSlip order={order} brand={brand} shipper={shipper} addr={addr} items={items} totalQty={totalQty} pm={pm} isCod={isCod} />
      </div>
    </>
  )
}

// ── The actual slip content (Leopards-style half-page) ─────────────────────────
function CourierSlip({ order, brand, shipper, addr, items, totalQty, pm, isCod }) {
  return (
    <div className="slip">
      {/* Top banner */}
      <div className="slip-top">
        <div className="slip-brand">
          <div className="slip-logo">D</div>
          <div>
            <div className="b-name">{brand.name}</div>
            <div className="b-tag">{brand.tagline}</div>
          </div>
        </div>
        <div className="slip-cod-stamp" data-cod={isCod ? '1' : '0'}>
          <div className="lbl">{pm.label}</div>
          {isCod && <div className="amt">{fmt(order.total)}</div>}
        </div>
      </div>

      {/* Order number bar */}
      <div className="slip-orderbar">
        <div>
          <div className="muted">Order No.</div>
          <div className="big">{order.order_number}</div>
        </div>
        <div className="barcode">
          {/* Faux barcode generated from order number */}
          <div className="bc-bars">
            {(order.order_number || '').split('').map((c, i) => (
              <span key={i} style={{ width: (c.charCodeAt(0) % 4) + 1 + 'px' }} />
            ))}
          </div>
          <div className="bc-label">{order.order_number}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="muted">Date</div>
          <div className="big">{new Date(order.created_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Addresses */}
      <div className="slip-addresses">
        <div className="slip-addr">
          <div className="lbl">From (Shipper)</div>
          <div className="name">{brand.name}</div>
          <div className="lines">
            {shipper.line1 && <div>{shipper.line1}</div>}
            {shipper.line2 && <div>{shipper.line2}</div>}
            <div>{shipper.city}, {shipper.country}</div>
            {brand.phone && <div>{brand.phone}</div>}
          </div>
        </div>
        <div className="slip-arrow">→</div>
        <div className="slip-addr to">
          <div className="lbl">To (Consignee)</div>
          <div className="name">{order.customer_name}</div>
          <div className="lines">
            {addr.line1 && <div>{addr.line1}</div>}
            {addr.line2 && <div>{addr.line2}</div>}
            <div>{[addr.city, addr.province, addr.postal].filter(Boolean).join(', ')}</div>
            <div>{addr.country || 'Pakistan'}</div>
            <div className="phone">📞 {order.customer_phone || order.whatsapp_number || '—'}</div>
          </div>
        </div>
      </div>

      {/* Items mini table */}
      <table className="slip-items">
        <thead>
          <tr><th>#</th><th>Item</th><th className="r">Qty</th><th className="r">Price</th><th className="r">Total</th></tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td className="prod-name">{it.product_name}</td>
              <td className="r">{it.quantity}</td>
              <td className="r">{fmt(it.unit_price)}</td>
              <td className="r b">{fmt(it.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom band */}
      <div className="slip-bottom">
        <div className="slip-totals">
          <div className="row"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
          <div className="row"><span>Shipping</span><span>{Number(order.shipping) > 0 ? fmt(order.shipping) : 'Free'}</span></div>
          {Number(order.discount_amount) > 0 && (
            <div className="row d"><span>Discount{order.discount_code ? ` (${order.discount_code})` : ''}</span><span>−{fmt(order.discount_amount)}</span></div>
          )}
          <div className="row total"><span>Total</span><span>{fmt(order.total)}</span></div>
          <div className="pcs">Pieces: <strong>{totalQty}</strong></div>
        </div>

        <div className="slip-instructions">
          <div className="ttl">Delivery Instructions</div>
          <ul>
            <li>Verify the consignee's identity before handing over.</li>
            <li>{isCod ? `Collect ${fmt(order.total)} cash before releasing the parcel.` : 'Prepaid — no cash collection required.'}</li>
            <li>Allow inspection of the sealed pack; do not allow opening.</li>
            <li>For any issue, call {brand.phone || 'sender'}.</li>
          </ul>
          {order.notes && (
            <div className="cust-note"><strong>Customer note:</strong> {order.notes}</div>
          )}
        </div>
      </div>

      {/* Signature row */}
      <div className="slip-signature">
        <div className="sig-box">
          <div className="line" />
          <div className="lbl">Sender Signature & Stamp</div>
        </div>
        <div className="sig-box">
          <div className="line" />
          <div className="lbl">Receiver Signature</div>
        </div>
        <div className="sig-box">
          <div className="line" />
          <div className="lbl">Date</div>
        </div>
      </div>

      <div className="slip-foot">
        <span>{brand.name} · {brand.phone} {brand.email && `· ${brand.email}`}</span>
        <span>Slip ID: {order.order_number}</span>
      </div>
    </div>
  )
}

const tbBtnGhost = {
  padding: '7px 14px', fontSize: 12, fontWeight: 500,
  border: '1px solid var(--line)', background: 'var(--cream)',
  color: 'var(--ink-2)', borderRadius: 6, cursor: 'pointer',
}
const tbBtnGold = {
  padding: '7px 14px', fontSize: 12, fontWeight: 600,
  border: 'none', background: 'var(--gold-grad, linear-gradient(90deg, #c9a24e, #9c7d3a))',
  color: 'var(--ink)', borderRadius: 6, cursor: 'pointer',
}
