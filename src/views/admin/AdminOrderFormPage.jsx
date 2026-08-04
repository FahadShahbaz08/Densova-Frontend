import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from '../../router'
import { adminAPI } from '../../services/api'
import { resolveImageUrl } from '../../utils/resolveImageUrl'
import { useAdminUI } from '../../components/admin/AdminContext'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

const STATUS_OPTIONS = [
  'pending', 'awaiting_payment', 'confirmed', 'shipped', 'delivered', 'cancelled',
]
const PAY_STATUS_OPTIONS = ['unpaid', 'pending_verification', 'paid', 'refunded']

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Bahawalpur', 'Hyderabad',
  'Sargodha', 'Mardan', 'Sheikhupura', 'Sahiwal',
]

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>
    {d}
  </svg>
)
const IconArrowL = <Icon d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />
const IconPlus   = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconTrash  = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconSearch = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconSave   = <Icon d={<><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>} />

// ── Product picker (searchable) ────────────────────────────────────────────────
function ProductPicker({ products, onAdd }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = query
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(query.toLowerCase())
      )
    : products

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)',
        border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px',
      }}>
        <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search products to add…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '10px 0', fontSize: 13 }}
        />
      </div>
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
            background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8,
            maxHeight: 280, overflowY: 'auto',
            boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: 14, fontSize: 12, color: 'var(--muted)' }}>No products match "{query}"</div>
          ) : (
            filtered.slice(0, 20).map(p => (
              <div
                key={p.id}
                onClick={() => { onAdd(p); setQuery(''); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  cursor: 'pointer', borderBottom: '1px solid var(--line-2)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {p.image_url ? (
                  <img src={resolveImageUrl(p.image_url)} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--cream-2)', border: '1px solid var(--line-2)' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {p.category} · Stock {p.stock}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{fmt(p.price)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Form section helper ────────────────────────────────────────────────────────
function Section({ title, children, sub }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ marginBottom: 14, borderBottom: '1px solid var(--line-2)', paddingBottom: 10 }}>
        <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 16, fontWeight: 500, margin: 0 }}>{title}</h3>
        {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid var(--line)', background: 'var(--cream)', borderRadius: 6, fontSize: 13, outline: 'none', boxSizing: 'border-box' }

function Field({ label, value, onChange, type = 'text', placeholder, required, error }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: 'var(--err)', marginLeft: 3 }}>*</span>}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, borderColor: error ? '#d63031' : 'var(--line)' }}
      />
      {error && <div style={{ fontSize: 11, color: '#d63031', marginTop: 3 }}>{error}</div>}
    </div>
  )
}

function SelectField({ label, value, onChange, options, required }) {
  return (
    <div>
      <label style={labelStyle}>{label}{required && <span style={{ color: 'var(--err)', marginLeft: 3 }}>*</span>}</label>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        <option value="">— Select —</option>
        {options.map(o => {
          const v = typeof o === 'object' ? o.value : o
          const l = typeof o === 'object' ? o.label : (o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' '))
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminOrderFormPage() {
  const navigate = useNavigate()
  const { id }   = useParams()
  const isEdit   = !!id
  const { showToast } = useAdminUI()

  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [errors, setErrors]     = useState({})

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    whatsapp_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    province: '',
    postal: '',
    items: [], // [{ product_id, name, unit_price, quantity }]
    payment_method: 'cod',
    payment_status: 'unpaid',
    status: 'pending',
    shipping: 0,
    discount_amount: 0,
    discount_code: '',
    notes: '',
    admin_notes: '',
  })

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Load products + (if edit) existing order
  useEffect(() => {
    const init = async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          adminAPI.products.list({ per_page: 200 }),
          isEdit ? adminAPI.orders.show(id) : Promise.resolve(null),
        ])
        setProducts(pRes.data?.data || [])
        if (isEdit && oRes?.data) {
          // Laravel JsonResource wraps single resources in { data: {...} } — unwrap it
          const o = oRes.data?.data || oRes.data
          const addr = o.shipping_address || {}
          setForm({
            customer_name:   o.customer_name || '',
            customer_phone:  o.customer_phone || '',
            customer_email:  o.customer_email || '',
            whatsapp_number: o.whatsapp_number || '',
            address_line1:   addr.line1 || '',
            address_line2:   addr.line2 || '',
            city:            addr.city || '',
            province:        addr.province || '',
            postal:          addr.postal || '',
            items: (o.items || []).map(i => ({
              product_id: i.product_id,
              name:       i.product_name,
              unit_price: Number(i.unit_price),
              quantity:   i.quantity,
            })),
            payment_method:  o.payment_method || 'cod',
            payment_status:  o.payment_status || 'unpaid',
            status:          o.status || 'pending',
            shipping:        Number(o.shipping || 0),
            discount_amount: Number(o.discount_amount || 0),
            discount_code:   o.discount_code || '',
            notes:           o.notes || '',
            admin_notes:     o.admin_notes || '',
          })
        }
      } catch (e) {
        console.error(e)
        showToast('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [id, isEdit, showToast])

  // ── Item handlers ──────────────────────────────────────────────────────────
  const addItem = (product) => {
    setForm(f => {
      const existing = f.items.find(i => i.product_id === product.id)
      if (existing) {
        return { ...f, items: f.items.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i) }
      }
      return {
        ...f,
        items: [...f.items, {
          product_id: product.id,
          name:       product.name,
          unit_price: Number(product.price),
          quantity:   1,
        }],
      }
    })
  }
  const setQty = (idx, qty) => {
    setForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, qty) } : it) }))
  }
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = useMemo(() => form.items.reduce((s, i) => s + i.unit_price * i.quantity, 0), [form.items])
  const total    = subtotal + Number(form.shipping || 0) - Number(form.discount_amount || 0)

  // Auto-apply advance discount
  const advancePct = 5
  useEffect(() => {
    if (form.payment_method === 'advance') {
      const d = Math.round(subtotal * advancePct / 100)
      setForm(f => ({ ...f, discount_amount: d, discount_code: f.discount_code || 'ADVANCE5' }))
    } else {
      setForm(f => ({ ...f, discount_amount: 0, discount_code: '' }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.payment_method, subtotal])

  // ── Validation + submit ────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'Required'
    if (!form.customer_phone.trim()) e.customer_phone = 'Required'
    if (!form.address_line1.trim()) e.address_line1 = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (form.items.length === 0) e.items = 'Add at least one product'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      showToast('Please fill required fields')
      return
    }
    setSaving(true)
    try {
      const payload = {
        customer_name:   form.customer_name.trim(),
        customer_phone:  form.customer_phone.trim() || null,
        customer_email:  form.customer_email.trim() || null,
        whatsapp_number: (form.whatsapp_number || form.customer_phone).trim() || null,
        shipping_address: {
          line1:    form.address_line1.trim(),
          line2:    form.address_line2.trim() || null,
          city:     form.city.trim(),
          province: form.province.trim() || null,
          postal:   form.postal.trim() || null,
          country:  'Pakistan',
        },
        items: form.items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_method:  form.payment_method,
        payment_status:  form.payment_status,
        status:          form.status,
        shipping:        Number(form.shipping || 0),
        discount_amount: Number(form.discount_amount || 0),
        discount_code:   form.discount_code || null,
        notes:           form.notes || null,
        admin_notes:     form.admin_notes || null,
      }
      let res
      if (isEdit) {
        res = await adminAPI.orders.update(id, payload)
        showToast('Order updated')
      } else {
        res = await adminAPI.orders.create(payload)
        showToast('Order created')
      }
      const orderId = res.data?.data?.id || res.data?.id || id
      navigate(`/admin/orders/${orderId}/view`)
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' · ')
        : err.response?.data?.message || 'Failed to save order'
      showToast(msg, true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="view"><div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div></div>
  }

  return (
    <div className="view">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/orders" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6, border: '1px solid var(--line-2)',
            color: 'var(--ink-2)', textDecoration: 'none',
          }}>{IconArrowL}</Link>
          <div>
            <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>
              {isEdit ? 'Edit Order' : 'New Order'}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {isEdit ? `Editing order details and items` : 'Create an order on behalf of a customer'}
            </div>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={saving} className="btn btn-gold"
          style={{ padding: '10px 18px', fontSize: 13, gap: 6, opacity: saving ? 0.6 : 1 }}>
          {IconSave} {saving ? 'Saving…' : (isEdit ? 'Save changes' : 'Create order')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, alignItems: 'start' }}>
        {/* LEFT — main form */}
        <div>
          <Section title="Customer">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <Field label="Full name" required value={form.customer_name} onChange={v => update('customer_name', v)} error={errors.customer_name} />
              <Field label="Phone" required value={form.customer_phone} onChange={v => update('customer_phone', v)} placeholder="03XX-XXXXXXX" error={errors.customer_phone} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Email" value={form.customer_email} onChange={v => update('customer_email', v)} placeholder="optional" />
              <Field label="WhatsApp" value={form.whatsapp_number} onChange={v => update('whatsapp_number', v)} placeholder="Same as phone if blank" />
            </div>
          </Section>

          <Section title="Shipping Address">
            <div style={{ marginBottom: 12 }}>
              <Field label="Address Line 1" required value={form.address_line1} onChange={v => update('address_line1', v)} error={errors.address_line1} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <Field label="Address Line 2" value={form.address_line2} onChange={v => update('address_line2', v)} placeholder="optional" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <SelectField label="City" required value={form.city} onChange={v => update('city', v)} options={CITIES} />
              <Field label="Province" value={form.province} onChange={v => update('province', v)} />
              <Field label="Postal Code" value={form.postal} onChange={v => update('postal', v)} placeholder="optional" />
            </div>
            {errors.city && <div style={{ fontSize: 11, color: '#d63031', marginTop: 6 }}>{errors.city}</div>}
          </Section>

          <Section title="Items" sub={errors.items}>
            <div style={{ marginBottom: 14 }}>
              <ProductPicker products={products} onAdd={addItem} />
            </div>

            {form.items.length === 0 ? (
              <div style={{
                padding: 32, textAlign: 'center', color: 'var(--muted)', fontSize: 13,
                background: 'var(--cream-2)', border: '1px dashed var(--line)', borderRadius: 8,
              }}>
                No items yet. Search above and click to add products.
              </div>
            ) : (
              <div style={{ border: '1px solid var(--line-2)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 100px 100px 110px 36px',
                  background: 'var(--cream-2)', padding: '8px 12px',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--muted)', borderBottom: '1px solid var(--line-2)', gap: 8,
                }}>
                  <span>Product</span>
                  <span style={{ textAlign: 'right' }}>Price</span>
                  <span style={{ textAlign: 'center' }}>Qty</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                  <span />
                </div>
                {form.items.map((it, idx) => (
                  <div key={idx} style={{
                    display: 'grid', gridTemplateColumns: '1fr 100px 100px 110px 36px',
                    padding: '10px 12px', alignItems: 'center', gap: 8,
                    borderBottom: idx === form.items.length - 1 ? 'none' : '1px solid var(--line-2)',
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{it.name}</span>
                    <span style={{ fontSize: 13, textAlign: 'right' }}>{fmt(it.unit_price)}</span>
                    <input
                      type="number" min="1"
                      value={it.quantity}
                      onChange={(e) => setQty(idx, Number(e.target.value))}
                      style={{ ...inputStyle, padding: '6px 8px', textAlign: 'center', fontSize: 13 }}
                    />
                    <span style={{ fontSize: 13, textAlign: 'right', fontWeight: 600 }}>
                      {fmt(it.unit_price * it.quantity)}
                    </span>
                    <button onClick={() => removeItem(idx)} title="Remove" style={{
                      width: 28, height: 28, borderRadius: 6, border: '1px solid var(--line-2)',
                      background: 'transparent', color: 'var(--muted)', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#d63031'; e.currentTarget.style.background = 'var(--cream-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}>
                      {IconTrash}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Notes">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Customer note</label>
                <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)}
                  rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
                  placeholder="Visible delivery instructions…" />
              </div>
              <div>
                <label style={labelStyle}>Admin / internal note</label>
                <textarea value={form.admin_notes} onChange={(e) => update('admin_notes', e.target.value)}
                  rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: 70 }}
                  placeholder="Only visible to admin…" />
              </div>
            </div>
          </Section>
        </div>

        {/* RIGHT — summary + payment */}
        <div style={{ position: 'sticky', top: 16 }}>
          <Section title="Order Summary">
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Row label="Items" value={form.items.length} />
              <Row label="Subtotal" value={fmt(subtotal)} />

              <div>
                <label style={{ ...labelStyle, marginTop: 6 }}>Shipping</label>
                <input type="number" min="0" value={form.shipping}
                  onChange={(e) => update('shipping', Number(e.target.value || 0))}
                  style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Discount</label>
                <input type="number" min="0" value={form.discount_amount}
                  onChange={(e) => update('discount_amount', Number(e.target.value || 0))}
                  style={inputStyle} />
              </div>

              <div style={{
                borderTop: '1px solid var(--line-2)', marginTop: 8, paddingTop: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 16, fontWeight: 600,
              }}>
                <span>Total</span>
                <span style={{ fontFamily: 'var(--f-serif)', fontSize: 22 }}>{fmt(total)}</span>
              </div>
            </div>
          </Section>

          <Section title="Payment & Status">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <SelectField
                label="Payment method" required
                value={form.payment_method}
                onChange={v => update('payment_method', v)}
                options={[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'advance', label: 'Advance Payment' },
                ]}
              />
              <SelectField
                label="Payment status"
                value={form.payment_status}
                onChange={v => update('payment_status', v)}
                options={PAY_STATUS_OPTIONS}
              />
              <SelectField
                label="Order status"
                value={form.status}
                onChange={v => update('status', v)}
                options={STATUS_OPTIONS}
              />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--ink-2)' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  )
}
