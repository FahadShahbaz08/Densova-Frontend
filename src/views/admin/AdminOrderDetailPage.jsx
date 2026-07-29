import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from '../../router'
import { adminAPI } from '../../services/api'
import { useAdminUI } from '../../components/admin/AdminContext'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')
const fmtDate = (d) => d ? new Date(d).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ã¢â‚¬â€'
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ã¢â‚¬â€'

const STATUS_STYLE = {
  pending:          { bg: 'rgba(212,160,78,0.14)',  fg: '#a47718', dot: '#d4a04e' },
  awaiting_payment: { bg: 'rgba(212,160,78,0.14)',  fg: '#a47718', dot: '#d4a04e' },
  confirmed:        { bg: 'rgba(80,130,170,0.14)',  fg: '#3d6e95', dot: '#5082aa' },
  shipped:          { bg: 'rgba(80,130,170,0.14)',  fg: '#3d6e95', dot: '#5082aa' },
  delivered:        { bg: 'rgba(124,154,100,0.14)', fg: '#5a7c44', dot: '#7c9a64' },
  cancelled:        { bg: 'rgba(214,48,49,0.10)',   fg: '#a8302f', dot: '#d63031' },
  refunded:         { bg: 'var(--cream-2)',          fg: 'var(--muted)', dot: '#b8a890' },
}

const STATUS_OPTIONS = ['pending','awaiting_payment','confirmed','shipped','delivered','cancelled']
const PAY_STATUS_OPTIONS = ['unpaid','pending_verification','paid','refunded']

// Icons
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconBack   = <Icon d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />
const IconEdit   = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconPrint  = <Icon d={<><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>} />
const IconPdf    = <Icon d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></>} />

function Pill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.refunded
  const label = (status || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }} />
      {label}
    </span>
  )
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, confirmAction, openFlyer } = useAdminUI()
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [notes, setNotes]     = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminAPI.orders.show(id)
      // Laravel JsonResource wraps single resources in { data: {...} } Ã¢â‚¬â€ unwrap it
      const orderData = res.data?.data || res.data
      setOrder(orderData)
      setNotes(orderData?.admin_notes || '')
    } catch (err) {
      console.error('Order load failed:', err.response?.status, err.response?.data || err.message)
      showToast(err.response?.status === 404 ? 'Order not found' : 'Failed to load order')
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => { load() }, [load])

  const updateField = async (field, value) => {
    setSaving(true)
    try {
      const res = await adminAPI.orders.update(id, { [field]: value })
      const orderData = res.data?.data || res.data
      setOrder(orderData)
      showToast(`${field.replace('_', ' ')} updated`)
    } catch (err) {
      console.error('Update failed:', err.response?.data || err.message)
      showToast('Update failed', true)
    } finally {
      setSaving(false)
    }
  }

  const saveNotes = () => updateField('admin_notes', notes)

  const handleDelete = () => {
    confirmAction('Delete Order', `Delete order ${order?.order_number}? This cannot be undone.`,
      async () => {
        try {
          await adminAPI.orders.destroy(id)
          showToast('Order deleted')
          navigate('/admin/orders')
        } catch { showToast('Failed to delete', true) }
      },
      'Yes, delete')
  }

  const handlePrintFull = () => {
    document.body.classList.add('printing-order')
    window.print()
    setTimeout(() => document.body.classList.remove('printing-order'), 500)
  }

  const handleDownloadPdf = () => {
    // Same as print Ã¢â‚¬â€ user picks "Save as PDF" in the browser print dialog
    handlePrintFull()
  }

  if (loading) {
    return <div className="view"><div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Loading orderÃ¢â‚¬Â¦</div></div>
  }
  if (!order) {
    return <div className="view"><div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Order not found.</div></div>
  }

  const items = order.items || []
  const addr  = order.shipping_address || {}
  const itemsQty = items.reduce((s, i) => s + (i.quantity || 0), 0)

  return (
    <div className="view">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Header (hidden in print) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/orders" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6, border: '1px solid var(--line-2)',
            color: 'var(--ink-2)', textDecoration: 'none',
          }}>{IconBack}</Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>
                Order {order.order_number}
              </h2>
              <Pill status={order.status} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Placed {fmtDate(order.created_at)}
            </div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button onClick={() => openFlyer(order.id)} className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconPrint} Courier Slip
          </button>
          <button onClick={handlePrintFull} className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconPrint} Print Invoice
          </button>
          <button onClick={handleDownloadPdf} className="btn btn-ghost"
            style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconPdf} Save PDF
          </button>
          <button onClick={() => navigate(`/admin/orders/${order.id}/edit`)} className="btn btn-gold"
            style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconEdit} Edit Order
          </button>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PRINTABLE INVOICE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <div className="order-printable" id="order-printable">
        {/* Print header Ã¢â‚¬â€ only shown in print */}
        <div className="print-only print-header">
          <div>
            <div className="brand">Densova</div>
            <div className="tagline">Botanical Apothecary</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="invoice-label">Invoice</div>
            <div className="invoice-no">{order.order_number}</div>
            <div className="invoice-date">{fmtDateShort(order.created_at)}</div>
          </div>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }} className="order-grid">
          {/* LEFT */}
          <div>
            {/* Customer + Address */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <SectionLabel>Customer</SectionLabel>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{order.customer_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                    {order.customer_phone && <div>Ã°Å¸â€œÅ¾ {order.customer_phone}</div>}
                    {order.customer_email && <div>Ã¢Å“â€°Ã¯Â¸Â {order.customer_email}</div>}
                    {order.whatsapp_number && order.whatsapp_number !== order.customer_phone && (
                      <div>WhatsApp: {order.whatsapp_number}</div>
                    )}
                  </div>
                </div>
                <div>
                  <SectionLabel>Shipping Address</SectionLabel>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                    {addr.line1 && <div>{addr.line1}</div>}
                    {addr.line2 && <div>{addr.line2}</div>}
                    <div>
                      {[addr.city, addr.province, addr.postal].filter(Boolean).join(', ')}
                    </div>
                    <div>{addr.country || 'Pakistan'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--line-2)' }}>
                <SectionLabel>Items ({items.length} unique Ã‚Â· {itemsQty} total)</SectionLabel>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--cream-2)' }}>
                    <th style={th}>Product</th>
                    <th style={{ ...th, textAlign: 'right', width: 100 }}>Unit</th>
                    <th style={{ ...th, textAlign: 'center', width: 80 }}>Qty</th>
                    <th style={{ ...th, textAlign: 'right', width: 110 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid var(--line-2)' }}>
                      <td style={td}><span style={{ fontWeight: 500 }}>{it.product_name}</span></td>
                      <td style={{ ...td, textAlign: 'right' }}>{fmt(it.unit_price)}</td>
                      <td style={{ ...td, textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>{fmt(it.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Customer notes (if any) */}
            {order.notes && (
              <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <SectionLabel>Customer Note</SectionLabel>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7, marginTop: 4 }}>
                  {order.notes}
                </div>
              </div>
            )}

            {/* Admin Notes (hidden in print) */}
            <div className="card no-print" style={{ padding: 20, marginBottom: 16 }}>
              <SectionLabel>Admin / Internal Note</SectionLabel>
              <textarea
                value={notes} onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--f-sans)', marginTop: 6, resize: 'vertical', boxSizing: 'border-box' }}
                placeholder="Only visible to adminÃ¢â‚¬Â¦"
              />
              <button onClick={saveNotes} disabled={saving} className="btn btn-ghost"
                style={{ padding: '6px 12px', fontSize: 12, marginTop: 8 }}>
                {saving ? 'SavingÃ¢â‚¬Â¦' : 'Save note'}
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* Status controls (hidden in print) */}
            <div className="card no-print" style={{ padding: 20, marginBottom: 16 }}>
              <SectionLabel>Manage</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <SelectRow
                  label="Order status" value={order.status} options={STATUS_OPTIONS}
                  onChange={(v) => updateField('status', v)} saving={saving}
                />
                <SelectRow
                  label="Payment status" value={order.payment_status} options={PAY_STATUS_OPTIONS}
                  onChange={(v) => updateField('payment_status', v)} saving={saving}
                />
                <button onClick={handleDelete} style={{
                  padding: '8px 12px', fontSize: 12, border: '1px solid rgba(214,48,49,0.3)',
                  background: 'transparent', color: '#d63031', borderRadius: 6, cursor: 'pointer',
                  marginTop: 6,
                }}>Delete order</button>
              </div>
            </div>

            {/* Totals */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <SectionLabel>Payment Summary</SectionLabel>
              <div style={{ marginTop: 10 }}>
                <SumRow label="Subtotal" value={fmt(order.subtotal)} />
                <SumRow label="Shipping" value={Number(order.shipping) > 0 ? fmt(order.shipping) : 'Free'} />
                {Number(order.discount_amount) > 0 && (
                  <SumRow label={`Discount${order.discount_code ? ` (${order.discount_code})` : ''}`}
                    value={'Ã¢Ë†â€™' + fmt(order.discount_amount)} color="#5a7c44" />
                )}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                  paddingTop: 12, marginTop: 8, borderTop: '1px solid var(--line-2)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>Total</span>
                  <span style={{ fontFamily: 'var(--f-serif)', fontSize: 26, fontWeight: 500 }}>{fmt(order.total)}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>
                  Payment: <span style={{ fontWeight: 600, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {(order.payment_method || '').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card" style={{ padding: 20 }}>
              <SectionLabel>Timeline</SectionLabel>
              <div style={{ marginTop: 14 }}>
                <Tl on={true} title="Order placed" date={fmtDate(order.created_at)} />
                <Tl on={!!order.confirmed_at} title="Confirmed" date={fmtDate(order.confirmed_at)} />
                <Tl on={!!order.shipped_at} title="Shipped" date={fmtDate(order.shipped_at)}
                  extra={order.tracking_number ? `Tracking ${order.tracking_number}` : null} />
                <Tl on={!!order.delivered_at} title="Delivered" date={fmtDate(order.delivered_at)} last />
              </div>
            </div>
          </div>
        </div>

        {/* Print footer */}
        <div className="print-only print-footer">
          <div>Thank you for choosing Densova Ã‚Â· densova.com</div>
          <div>This is a computer-generated invoice and does not require a signature.</div>
        </div>
      </div>
    </div>
  )
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
const th = { padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }
const td = { padding: '12px 16px', verticalAlign: 'middle' }

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>{children}</div>
}

function SumRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', color: color || 'var(--ink-2)' }}>
      <span>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}

function SelectRow({ label, value, options, onChange, saving }) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>{label}</label>
      <select disabled={saving} value={value} onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--cream)', fontSize: 13 }}>
        {options.map(o => <option key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
      </select>
    </div>
  )
}

function Tl({ on, title, date, extra, last }) {
  return (
    <div style={{ display: 'flex', gap: 12, paddingBottom: last ? 0 : 14, position: 'relative' }}>
      <div style={{
        width: 12, height: 12, borderRadius: '50%', marginTop: 4, flexShrink: 0,
        background: on ? 'var(--forest)' : 'transparent',
        border: `2px solid ${on ? 'var(--forest)' : 'var(--line)'}`,
      }} />
      {!last && (
        <div style={{
          position: 'absolute', left: 5, top: 18, bottom: -2, width: 2,
          background: on ? 'var(--forest)' : 'var(--line)',
          opacity: on ? 0.3 : 1,
        }} />
      )}
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: on ? 'var(--ink)' : 'var(--muted)' }}>{title}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{date}</div>
        {extra && <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2 }}>{extra}</div>}
      </div>
    </div>
  )
}
