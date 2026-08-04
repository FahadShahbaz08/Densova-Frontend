import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '../router'
import { useDispatch, useSelector } from 'react-redux'

import SEOHead from '../components/common/SEOHead'
import ScrollProgress from '../components/sections/ScrollProgress'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import Toast from '../components/sections/Toast'
import WhatsAppFloat from '../components/sections/WhatsAppFloat'

import { resolveImageUrl } from '../utils/resolveImageUrl'
import { useCart } from '../hooks/useCart'
import { clearCart } from '../store/slices/cartSlice'
import { showToast } from '../store/slices/uiSlice'
import {
  selectSettings,
  selectDeliveryCharges,
  selectAdvanceDiscountPct,
} from '../store/slices/settingsSlice'
import { ordersAPI } from '../services/api'

const rs = (n) => 'Rs ' + Number(n).toLocaleString('en-PK')

const PROVINCES = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
  'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir',
]

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Bahawalpur', 'Hyderabad',
  'Sargodha', 'Sukkur', 'Larkana', 'Mardan', 'Sheikhupura', 'Jhang',
  'Sahiwal', 'Kasur', 'Okara', 'Rahim Yar Khan', 'Chiniot', 'Mianwali',
  'Khanewal', 'Dera Ghazi Khan', 'Vehari', 'Mingora', 'Wah Cantonment',
  'Hafizabad', 'Gujrat', 'Jhelum', 'Attock', 'Abbottabad', 'Mansehra',
  'Mirpur', 'Other',
]

const initialForm = {
  customer_name:    '',
  customer_phone:   '',
  whatsapp_same:    true,
  whatsapp_number:  '',
  customer_email:   '',
  line1:            '',
  line2:            '',
  city:             '',
  province:         '',
  postal:           '',
  notes:            '',
}

// Pakistan mobile pattern e.g. 03101234567 or +923101234567
const PK_PHONE_RE = /^(\+92|0092|92|0)?3\d{9}$/

export default function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, subtotal, clear } = useCart()
  const settings = useSelector(selectSettings)
  const delivery = useSelector(selectDeliveryCharges)
  const advancePct = useSelector(selectAdvanceDiscountPct)

  const [form, setForm]           = useState(initialForm)
  const [payment, setPayment]     = useState('cod') // 'cod' | 'advance'
  const [confirmedPaid, setPaid]  = useState(false)
  const [submitting, setSubmit]   = useState(false)
  const [errors, setErrors]       = useState({})
  const [serverError, setServerError] = useState(null)

  // Derived totals
  const cityLower = form.city.trim().toLowerCase()
  const cityCharge = delivery?.cities?.[cityLower] ?? delivery?.default ?? 350
  const freeShipping = !!delivery?.free_shipping
  const freeOver = delivery?.free_over ?? 5000
  const shipping = (freeShipping || (freeOver > 0 && subtotal >= freeOver)) ? 0 : cityCharge
  const discount = payment === 'advance' ? Math.round((subtotal * advancePct) / 100) : 0
  const total = subtotal + shipping - discount

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((errs) => ({ ...errs, [field]: undefined }))
  }

  // Empty cart → bounce to shop
  useEffect(() => {
    if (items.length === 0 && !submitting) {
      // Don't redirect on submitting (cart cleared after successful order)
    }
  }, [items, submitting])

  const validate = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'Required'
    if (!form.customer_phone.trim()) e.customer_phone = 'Required'
    else if (!PK_PHONE_RE.test(form.customer_phone.replace(/[\s-]/g, '')))
      e.customer_phone = 'Enter a valid Pakistan mobile number'

    if (!form.whatsapp_same) {
      if (!form.whatsapp_number.trim()) e.whatsapp_number = 'Required'
      else if (!PK_PHONE_RE.test(form.whatsapp_number.replace(/[\s-]/g, '')))
        e.whatsapp_number = 'Enter a valid Pakistan WhatsApp number'
    }

    if (form.customer_email && !/^[^@]+@[^@]+\.[^@]+$/.test(form.customer_email))
      e.customer_email = 'Enter a valid email'

    if (!form.line1.trim()) e.line1 = 'Required'
    if (!form.city.trim()) e.city = 'Select a city'
    if (!form.province.trim()) e.province = 'Select a province'

    if (payment === 'advance' && !confirmedPaid)
      e.confirmedPaid = 'Confirm you will share the payment screenshot'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return

    setSubmit(true)
    try {
      const payload = {
        customer_name:   form.customer_name.trim(),
        customer_phone:  form.customer_phone.replace(/[\s-]/g, ''),
        customer_email:  form.customer_email.trim() || null,
        whatsapp_number: (form.whatsapp_same ? form.customer_phone : form.whatsapp_number).replace(/[\s-]/g, ''),
        shipping_address: {
          line1:    form.line1.trim(),
          line2:    form.line2.trim() || null,
          city:     form.city.trim(),
          province: form.province,
          postal:   form.postal.trim() || null,
          country:  'PK',
        },
        items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
        payment_method: payment,
        notes: form.notes.trim() || null,
      }

      const { data } = await ordersAPI.create(payload)
      const order = data.data

      dispatch(showToast({ type: 'success', message: 'Order placed!' }))
      dispatch(clearCart())

      navigate(`/order-confirmation/${order.order_number}`, {
        state: { order, payment },
        replace: true,
      })
    } catch (err) {
      const msg =
        err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' · ')
          : err.response?.data?.message || 'Could not place the order. Please try again.'
      setServerError(msg)
      setSubmit(false)
    }
  }

  if (items.length === 0 && !submitting) {
    return (
      <>
        <AnnouncementBar />
        <Navbar />
        <section className="checkout">
          <div className="container">
            <div className="oc-card" style={{ marginTop: 60 }}>
              <SEOHead title="Checkout" noIndex />
              <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 36, margin: '0 0 18px' }}>
                Your cart is empty
              </h2>
              <p style={{ color: 'var(--muted)', marginBottom: 32 }}>
                Add a ritual to your cart before checking out.
              </p>
              <Link to="/" className="btn btn-gold">
                Browse Collection
                <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
        <WhatsAppFloat />
      </>
    )
  }

  return (
    <>
      <SEOHead title="Checkout" noIndex />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <section className="checkout">
        <div className="container">
          <h1>Checkout</h1>

          <form onSubmit={handleSubmit} className="checkout-grid">
            {/* LEFT: forms */}
            <div>
              {/* Contact */}
              <div className="co-card">
                <h2>Contact</h2>
                <Field label="Full Name *" value={form.customer_name} onChange={update('customer_name')} error={errors.customer_name} />
                <div className="co-field-row">
                  <Field label="Phone Number *" placeholder="0312 3456789" value={form.customer_phone} onChange={update('customer_phone')} error={errors.customer_phone} />
                  <Field label="Email (optional)" type="email" value={form.customer_email} onChange={update('customer_email')} error={errors.customer_email} />
                </div>
                <label className="co-checkbox-row">
                  <input type="checkbox" checked={form.whatsapp_same} onChange={update('whatsapp_same')} />
                  WhatsApp same as phone number
                </label>
                {!form.whatsapp_same && (
                  <div style={{ marginTop: 12 }}>
                    <Field label="WhatsApp Number *" placeholder="0312 3456789" value={form.whatsapp_number} onChange={update('whatsapp_number')} error={errors.whatsapp_number} />
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="co-card">
                <h2>Delivery Address</h2>
                <Field label="Address Line 1 *" value={form.line1} onChange={update('line1')} error={errors.line1} />
                <Field label="Address Line 2 (optional)" value={form.line2} onChange={update('line2')} />
                <div className="co-field-row">
                  <SearchableSelect label="City *" value={form.city} onChange={update('city')} error={errors.city} options={CITIES} placeholder="Select your city" />
                  <SearchableSelect label="Province *" value={form.province} onChange={update('province')} error={errors.province} options={PROVINCES} placeholder="Select province" />
                </div>
                <div className="co-field-row">
                  <Field label="Postal Code (optional)" value={form.postal} onChange={update('postal')} />
                  <div />
                </div>
                <label className="co-field">
                  <span>Order Notes (optional)</span>
                  <textarea rows={3} value={form.notes} onChange={update('notes')} placeholder="Anything we should know about your delivery..." />
                </label>
              </div>

              {/* Payment */}
              <div className="co-card">
                <h2>Payment Method</h2>

                <div className="co-pay-options">
                  <label className={`co-pay${payment === 'cod' ? ' active' : ''}`}>
                    <div className="co-pay-head">
                      <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={() => setPayment('cod')} style={{ display: 'none' }} />
                      <span className="radio" />
                      <span className="co-pay-title">Cash on Delivery</span>
                    </div>
                    <p className="co-pay-help">Pay in cash when your order arrives at your doorstep.</p>
                  </label>

                  <label className={`co-pay${payment === 'advance' ? ' active' : ''}`}>
                    <div className="co-pay-head">
                      <input type="radio" name="payment" value="advance" checked={payment === 'advance'} onChange={() => setPayment('advance')} style={{ display: 'none' }} />
                      <span className="radio" />
                      <span className="co-pay-title">Advance Half Payment</span>
                      <span className="co-pay-badge">{advancePct}% off</span>
                    </div>
                    <p className="co-pay-help">JazzCash · Easypaisa · Bank Transfer — and save {advancePct}% on this order.</p>

                    {payment === 'advance' && (
                      <div className="co-pay-details">
                        {settings.jazzcash_enabled !== false && <PayAccount label="JazzCash"  value={settings.jazzcash_number}  sub={settings.jazzcash_title} />}
                        {settings.easypaisa_enabled !== false && <PayAccount label="Easypaisa" value={settings.easypaisa_number} sub={settings.easypaisa_title} />}
                        {settings.bank_enabled !== false && <PayAccount label="Bank"      value={`${settings.bank_name} — ${settings.bank_account}`} sub={`Title: ${settings.bank_title}`} copyValue={settings.bank_account} />}
                        {settings.iban_enabled !== false && <PayAccount label="IBAN"      value={settings.bank_iban} />}

                        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '12px 0', lineHeight: 1.7 }}>
                          Please transfer <strong>{rs(total)}</strong> to any of the above accounts and send the
                          payment screenshot on our WhatsApp to confirm your order.
                        </p>

                        <label className="co-checkbox-row" style={{ marginTop: 4 }}>
                          <input type="checkbox" checked={confirmedPaid} onChange={(e) => setPaid(e.target.checked)} />
                          I have made the payment and will send the screenshot on WhatsApp
                        </label>
                        {errors.confirmedPaid && <span className="co-field-error">{errors.confirmedPaid}</span>}
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {serverError && (
                <div className="co-card" role="alert" style={{ borderColor: '#b14a3c', color: '#b14a3c' }}>
                  <strong>Order failed:</strong> {serverError}
                </div>
              )}
            </div>

            {/* RIGHT: order summary */}
            <aside>
              <div className="co-card co-summary">
                <h2>Order Summary</h2>
                <ul className="co-summary-items">
                  {items.map((i) => (
                    <li key={i.id}>
                      <span className={`co-summary-thumb${i.category === 'bundle' ? ' amber' : ''}`}>
                        {i.image_url && (
                          <img src={resolveImageUrl(i.image_url)} alt={i.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit', display: 'block' }} />
                        )}
                      </span>
                      <div className="co-summary-name">
                        <strong>{i.name}</strong>
                        <span>Qty {i.qty} · {rs(i.price)}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--f-display)', fontSize: 16 }}>{rs(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>

                <div className="co-summary-row">
                  <span>Subtotal</span>
                  <span>{rs(subtotal)}</span>
                </div>
                <div className="co-summary-row">
                  <span>Shipping{form.city ? ` to ${form.city}` : ''}</span>
                  <span>{shipping === 0 ? 'Free' : rs(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="co-summary-row" style={{ color: 'var(--moss)' }}>
                    <span>Advance Half Payment Discount ({advancePct}%)</span>
                    <span>- {rs(discount)}</span>
                  </div>
                )}
                <div className="co-summary-row total">
                  <span>Total</span>
                  <span>{rs(total)}</span>
                </div>

                <ul className="co-trust" style={{ padding: 0, margin: '14px 0 0' }}>
                  <li>Secure Checkout</li>
                  <li>100% Botanical</li>
                  <li>Easy Returns</li>
                </ul>

                <button type="submit" className="btn btn-gold" disabled={submitting}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 18, padding: 18, opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Placing order…' : `Place Order · ${rs(total)}`}
                  {!submitting && (
                    <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  )}
                </button>

                <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 14, letterSpacing: '0.06em' }}>
                  By placing this order you agree to our Terms &amp; Returns policy.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </section>

      <Footer />
      <Toast />
      <WhatsAppFloat />
    </>
  )
}

function Field({ label, value, onChange, error, type = 'text', placeholder }) {
  return (
    <label className="co-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={error ? { borderColor: '#b14a3c' } : undefined} />
      {error && <span className="co-field-error">{error}</span>}
    </label>
  )
}

function SearchableSelect({ label, value, onChange, error, options, placeholder = 'Select…' }) {
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [highlight, setHighlight] = useState(0)
  const wrapRef  = useRef(null)
  const inputRef = useRef(null)
  const listRef  = useRef(null)

  const q = query.trim().toLowerCase()
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // On open: reset search, highlight the current value, focus the search box
  useEffect(() => {
    if (!open) return
    setQuery('')
    setHighlight(Math.max(0, options.indexOf(value)))
    const t = setTimeout(() => inputRef.current?.focus(), 10)
    return () => clearTimeout(t)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the highlighted option scrolled into view
  useEffect(() => {
    if (open) listRef.current?.children[highlight]?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  const choose = (val) => {
    onChange({ target: { value: val } }) // mimic native event for the form's update()
    setOpen(false)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown')      { e.preventDefault(); setHighlight((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter')     { e.preventDefault(); if (filtered[highlight]) choose(filtered[highlight]) }
    else if (e.key === 'Escape')    { setOpen(false) }
  }

  return (
    <div className="co-field ss" ref={wrapRef}>
      <span>{label}</span>
      <button
        type="button"
        className={`ss-trigger${open ? ' open' : ''}${error ? ' err' : ''}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); setOpen(true) } }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? 'ss-val' : 'ss-ph'}>{value || placeholder}</span>
        <svg className="ss-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="ss-pop">
          <div className="ss-search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              className="ss-search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlight(0) }}
              onKeyDown={onKeyDown}
              placeholder={`Search ${label.replace(' *', '').toLowerCase()}…`}
              aria-label={`Search ${label.replace(' *', '')}`}
            />
          </div>
          <ul className="ss-list" role="listbox" ref={listRef}>
            {filtered.length === 0 ? (
              <li className="ss-empty">No matches</li>
            ) : (
              filtered.map((o, i) => (
                <li
                  key={o}
                  role="option"
                  aria-selected={o === value}
                  className={`ss-opt${i === highlight ? ' active' : ''}${o === value ? ' sel' : ''}`}
                  onMouseEnter={() => setHighlight(i)}
                  onMouseDown={(e) => { e.preventDefault(); choose(o) }}
                >
                  {o}
                  {o === value && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {error && <span className="co-field-error">{error}</span>}
    </div>
  )
}

function PayAccount({ label, value, sub, copyValue }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(copyValue ?? value))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }
  return (
    <div className="co-pay-account">
      <span className="label">{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <span className="val">{value}</span>
          {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
        </div>
        <button
          type="button"
          onClick={copy}
          title={copied ? 'Copied' : 'Copy'}
          aria-label={`Copy ${label}`}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
            color: copied ? 'var(--forest)' : 'var(--muted)', flexShrink: 0,
            display: 'inline-flex', alignItems: 'center', transition: 'color .2s',
          }}
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
