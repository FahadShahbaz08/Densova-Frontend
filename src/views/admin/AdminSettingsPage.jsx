import { useState, useEffect } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const TABS = ['General', 'Shipping', 'Payment', 'Notifications', 'Team']

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--line-2)', cursor: 'pointer' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <div onClick={() => onChange(!checked)}
        style={{ width: 44, height: 24, borderRadius: 12, background: checked ? 'var(--forest)' : 'var(--beige-2,#d4c9a6)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: 9, background: '#fff', position: 'absolute', top: 3, left: checked ? 23 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
      </div>
    </label>
  )
}

function Field({ label, value, onChange, type = 'text', rows }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea rows={rows || 3} value={value || ''} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--f-sans)', resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
      )}
    </div>
  )
}

function parseSetting(val, def) {
  if (val == null) return def
  if (typeof val === 'object') return val // already decoded by the model's array cast
  try { return JSON.parse(val) } catch { return def }
}

const DEFAULT_BRAND    = { name: 'Densova', tagline: 'Botanical Apothecary', email: '', phone: '', currency: 'PKR', timezone: 'Asia/Karachi', story: '', live: true }
const DEFAULT_PAYMENT  = { cod: true, stripe: false, easypaisa: false, paypal: false }
const DEFAULT_NOTIFS   = { emailOnOrder: true, daily: false, lowStock: true, sms: false, push: false }
const DEFAULT_DELIVERY = {
  free_shipping: false,
  default: 350,
  free_over: 5000,
  cities: {
    karachi: 250, lahore: 250, islamabad: 300, rawalpindi: 300,
    faisalabad: 300, multan: 300, peshawar: 350, quetta: 400,
  },
}
const DEFAULT_TEAM     = []
const DEFAULT_PAY_ACCT = {
  jazzcash_number: '',  jazzcash_title: '',  jazzcash_enabled: true,
  easypaisa_number: '', easypaisa_title: '', easypaisa_enabled: true,
  bank_name: '', bank_account: '', bank_title: '', bank_enabled: true,
  bank_iban: '', iban_enabled: true,
  advance_discount_pct: 5, whatsapp_number: '',
}

export default function AdminSettingsPage() {
  const { showToast, confirmAction } = useAdminUI()

  const [tab, setTab]         = useState('General')
  const [loaded, setLoaded]   = useState(false)
  const [saving, setSaving]   = useState(false)

  const [brand, setBrand]     = useState(DEFAULT_BRAND)
  const [live, setLive]       = useState(true)
  const [payment, setPayment] = useState(DEFAULT_PAYMENT)
  const [notifs, setNotifs]   = useState(DEFAULT_NOTIFS)
  const [delivery, setDelivery] = useState(DEFAULT_DELIVERY)
  const [team, setTeam]         = useState(DEFAULT_TEAM)
  const [payAccounts, setPayAccounts] = useState(DEFAULT_PAY_ACCT)

  useEffect(() => {
    adminAPI.settings.list().then(res => {
      const all = res.data || []
      const get = (key, def) => parseSetting(all.find(s => s.key === key)?.value, def)
      const brandVal = get('brand', DEFAULT_BRAND)
      setBrand(brandVal)
      setLive(brandVal.live ?? true)
      setPayment(get('payment_methods', DEFAULT_PAYMENT))
      setNotifs(get('notification_settings', DEFAULT_NOTIFS))
      setDelivery(get('delivery_charges', DEFAULT_DELIVERY))
      setTeam(get('team_members', DEFAULT_TEAM))
      // Scalar settings (plain strings/numbers/bools) — read raw, NOT via parseSetting
      // which JSON.parses and would fail on a bare string like "0310 3789079".
      const getRaw = (key, def) => {
        const row = all.find(s => s.key === key)
        return row && row.value != null ? row.value : def
      }
      setPayAccounts({
        jazzcash_number:   getRaw('jazzcash_number', ''),
        jazzcash_title:    getRaw('jazzcash_title', ''),
        jazzcash_enabled:  getRaw('jazzcash_enabled', true),
        easypaisa_number:  getRaw('easypaisa_number', ''),
        easypaisa_title:   getRaw('easypaisa_title', ''),
        easypaisa_enabled: getRaw('easypaisa_enabled', true),
        bank_name:         getRaw('bank_name', ''),
        bank_account:      getRaw('bank_account', ''),
        bank_title:        getRaw('bank_title', ''),
        bank_enabled:      getRaw('bank_enabled', true),
        bank_iban:         getRaw('bank_iban', ''),
        iban_enabled:      getRaw('iban_enabled', true),
        advance_discount_pct: getRaw('advance_discount_pct', 5),
        whatsapp_number:   getRaw('whatsapp_number', ''),
      })
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const saveSettings = async (key, value, label, opts = {}) => {
    setSaving(true)
    try {
      await adminAPI.settings.save(key, JSON.stringify(value), opts.group || 'admin', opts.isPublic || false)
      showToast(`${label} saved`)
    } catch {
      showToast(`Failed to save ${label}`)
    } finally {
      setSaving(false)
    }
  }

  // Payment account details are scalar settings — save each key raw (no
  // JSON.stringify) so the model's array cast encodes them once, matching how
  // the seeder + checkout read them. All public so the storefront can read them.
  const savePayAccounts = async () => {
    setSaving(true)
    try {
      const entries = [
        ['jazzcash_number',   payAccounts.jazzcash_number],
        ['jazzcash_title',    payAccounts.jazzcash_title],
        ['jazzcash_enabled',  payAccounts.jazzcash_enabled],
        ['easypaisa_number',  payAccounts.easypaisa_number],
        ['easypaisa_title',   payAccounts.easypaisa_title],
        ['easypaisa_enabled', payAccounts.easypaisa_enabled],
        ['bank_name',         payAccounts.bank_name],
        ['bank_account',      payAccounts.bank_account],
        ['bank_title',        payAccounts.bank_title],
        ['bank_enabled',      payAccounts.bank_enabled],
        ['bank_iban',         payAccounts.bank_iban],
        ['iban_enabled',      payAccounts.iban_enabled],
        ['advance_discount_pct', Number(payAccounts.advance_discount_pct) || 0],
        ['whatsapp_number',   payAccounts.whatsapp_number],
      ]
      await Promise.all(entries.map(([k, v]) =>
        adminAPI.settings.save(k, v, k === 'whatsapp_number' ? 'contact' : 'payment', true)
      ))
      showToast('Payment account details saved')
    } catch {
      showToast('Failed to save account details')
    } finally {
      setSaving(false)
    }
  }

  // ── City rate helpers (Shipping tab) ──
  const cityEntries = Object.entries(delivery.cities || {})
  const setCityRate = (city, rate) =>
    setDelivery(d => ({ ...d, cities: { ...d.cities, [city]: rate } }))
  const removeCity = (city) =>
    setDelivery(d => {
      const next = { ...d.cities }
      delete next[city]
      return { ...d, cities: next }
    })
  const addCity = () => {
    const name = window.prompt('City name (e.g. Sialkot):')
    if (!name || !name.trim()) return
    const key = name.trim().toLowerCase()
    setDelivery(d => ({ ...d, cities: { ...d.cities, [key]: d.default || 350 } }))
  }

  if (!loaded) return <div className="view" style={{ padding: 40, color: 'var(--muted)' }}>Loading…</div>

  return (
    <div className="view">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 4px' }}>Settings</h2>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Store configuration and preferences</div>
      </div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--line-2)', marginBottom: 28 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              color: tab === t ? 'var(--forest)' : 'var(--muted)',
              borderBottom: tab === t ? '2px solid var(--forest)' : '2px solid transparent', marginBottom: -2 }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'General' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-head"><h3>Brand & Store</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <Field label="Brand Name"  value={brand.name}     onChange={v => setBrand(b => ({ ...b, name: v }))} />
            <Field label="Tagline"     value={brand.tagline}  onChange={v => setBrand(b => ({ ...b, tagline: v }))} />
            <Field label="Email"       value={brand.email}    onChange={v => setBrand(b => ({ ...b, email: v }))} type="email" />
            <Field label="Phone"       value={brand.phone}    onChange={v => setBrand(b => ({ ...b, phone: v }))} type="tel" />
            <Field label="Currency"    value={brand.currency} onChange={v => setBrand(b => ({ ...b, currency: v }))} />
            <Field label="Timezone"    value={brand.timezone} onChange={v => setBrand(b => ({ ...b, timezone: v }))} />
          </div>
          <Field label="Brand Story" value={brand.story} onChange={v => setBrand(b => ({ ...b, story: v }))} type="textarea" rows={4} />
          <Toggle label="Store Live" checked={live} onChange={v => { setLive(v); setBrand(b => ({ ...b, live: v })) }} />
          <button className="btn btn-gold" style={{ marginTop: 20 }} disabled={saving}
            onClick={() => saveSettings('brand', { ...brand, live }, 'General Settings')}>
            {saving ? 'Saving…' : 'Save General Settings'}
          </button>
        </div>
      )}

      {tab === 'Shipping' && (
        <div style={{ display: 'grid', gap: 24, maxWidth: 720 }}>
          {/* Free shipping + thresholds */}
          <div className="card">
            <div className="card-head"><h3>Leopard Courier — Delivery</h3></div>

            <Toggle
              label="Enable Free Shipping (no delivery charge on any order)"
              checked={!!delivery.free_shipping}
              onChange={v => setDelivery(d => ({ ...d, free_shipping: v }))}
            />
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '10px 0 18px', lineHeight: 1.6 }}>
              When <strong>ON</strong>, customers pay no shipping regardless of city. When <strong>OFF</strong>,
              the city-wise Leopard rates below apply — with free shipping once the order crosses the threshold.
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px',
              opacity: delivery.free_shipping ? 0.4 : 1,
              pointerEvents: delivery.free_shipping ? 'none' : 'auto',
            }}>
              <Field label="Free Shipping Above (Rs)" type="number" value={delivery.free_over}
                onChange={v => setDelivery(d => ({ ...d, free_over: Number(v) || 0 }))} />
              <Field label="Default Rate — other cities (Rs)" type="number" value={delivery.default}
                onChange={v => setDelivery(d => ({ ...d, default: Number(v) || 0 }))} />
            </div>
          </div>

          {/* City-wise rates */}
          <div className="card" style={{
            padding: 0,
            opacity: delivery.free_shipping ? 0.4 : 1,
            pointerEvents: delivery.free_shipping ? 'none' : 'auto',
          }}>
            <div className="card-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
              <h3>City-wise Rates (Leopard)</h3>
              <button className="btn btn-ghost btn-sm" onClick={addCity}>+ Add City</button>
            </div>
            <table className="tbl">
              <thead>
                <tr><th>City</th><th>Rate (Rs)</th><th></th></tr>
              </thead>
              <tbody>
                {cityEntries.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>
                    No city rates — the default rate applies everywhere.
                  </td></tr>
                ) : cityEntries.map(([city, rate]) => (
                  <tr key={city}>
                    <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>{city}</td>
                    <td>
                      <input type="number" value={rate}
                        onChange={e => setCityRate(city, Number(e.target.value) || 0)}
                        style={{ width: 110, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 4, fontSize: 13 }} />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-danger"
                        onClick={() => confirmAction('Remove City', `Remove the ${city} rate?`, () => removeCity(city))}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <button className="btn btn-gold" disabled={saving}
              onClick={() => saveSettings('delivery_charges', delivery, 'Shipping Settings', { group: 'shipping', isPublic: true })}>
              {saving ? 'Saving…' : 'Save Shipping Settings'}
            </button>
          </div>
        </div>
      )}

      {tab === 'Payment' && (
        <div style={{ display: 'grid', gap: 24, maxWidth: 640 }}>
          <div className="card" style={{ maxWidth: 480 }}>
            <div className="card-head"><h3>Payment Methods</h3></div>
            {[['cod','Cash on Delivery'], ['stripe','Stripe (Card)'], ['easypaisa','EasyPaisa'], ['paypal','PayPal']].map(([key, label]) => (
              <Toggle key={key} label={label} checked={!!payment[key]} onChange={v => setPayment(p => ({ ...p, [key]: v }))} />
            ))}
            <button className="btn btn-gold" style={{ marginTop: 20 }} disabled={saving}
              onClick={() => saveSettings('payment_methods', payment, 'Payment Settings')}>
              {saving ? 'Saving…' : 'Save Payment Settings'}
            </button>
          </div>

          <div className="card">
            <div className="card-head"><h3>Advance Payment — Account Details</h3></div>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 18px', lineHeight: 1.6 }}>
              These appear in the checkout “Advance Payment” section. Turn a toggle off to hide that account from checkout.
            </p>

            <Toggle label="Show JazzCash" checked={payAccounts.jazzcash_enabled}
              onChange={v => setPayAccounts(p => ({ ...p, jazzcash_enabled: v }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', margin: '12px 0 8px' }}>
              <Field label="JazzCash Number" value={payAccounts.jazzcash_number} onChange={v => setPayAccounts(p => ({ ...p, jazzcash_number: v }))} />
              <Field label="JazzCash Title"  value={payAccounts.jazzcash_title}  onChange={v => setPayAccounts(p => ({ ...p, jazzcash_title: v }))} />
            </div>

            <Toggle label="Show Easypaisa" checked={payAccounts.easypaisa_enabled}
              onChange={v => setPayAccounts(p => ({ ...p, easypaisa_enabled: v }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', margin: '12px 0 8px' }}>
              <Field label="Easypaisa Number" value={payAccounts.easypaisa_number} onChange={v => setPayAccounts(p => ({ ...p, easypaisa_number: v }))} />
              <Field label="Easypaisa Title"  value={payAccounts.easypaisa_title}  onChange={v => setPayAccounts(p => ({ ...p, easypaisa_title: v }))} />
            </div>

            <Toggle label="Show Bank Transfer" checked={payAccounts.bank_enabled}
              onChange={v => setPayAccounts(p => ({ ...p, bank_enabled: v }))} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', margin: '12px 0 8px' }}>
              <Field label="Bank Name"      value={payAccounts.bank_name}    onChange={v => setPayAccounts(p => ({ ...p, bank_name: v }))} />
              <Field label="Account Number" value={payAccounts.bank_account} onChange={v => setPayAccounts(p => ({ ...p, bank_account: v }))} />
              <Field label="Account Title"  value={payAccounts.bank_title}   onChange={v => setPayAccounts(p => ({ ...p, bank_title: v }))} />
            </div>

            <Toggle label="Show IBAN" checked={payAccounts.iban_enabled}
              onChange={v => setPayAccounts(p => ({ ...p, iban_enabled: v }))} />
            <div style={{ margin: '12px 0 8px' }}>
              <Field label="IBAN" value={payAccounts.bank_iban} onChange={v => setPayAccounts(p => ({ ...p, bank_iban: v }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginTop: 4, paddingTop: 16, borderTop: '1px solid var(--line-2)' }}>
              <Field label="Advance Discount (%)" type="number" value={payAccounts.advance_discount_pct} onChange={v => setPayAccounts(p => ({ ...p, advance_discount_pct: v }))} />
              <Field label="WhatsApp Number" value={payAccounts.whatsapp_number} onChange={v => setPayAccounts(p => ({ ...p, whatsapp_number: v }))} />
            </div>

            <button className="btn btn-gold" style={{ marginTop: 12 }} disabled={saving} onClick={savePayAccounts}>
              {saving ? 'Saving…' : 'Save Account Details'}
            </button>
          </div>
        </div>
      )}

      {tab === 'Notifications' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div className="card-head"><h3>Notifications</h3></div>
          {[['emailOnOrder','Email on new order'], ['daily','Daily digest email'], ['lowStock','Low stock alerts'], ['sms','SMS alerts'], ['push','Push notifications']].map(([key, label]) => (
            <Toggle key={key} label={label} checked={!!notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
          ))}
          <button className="btn btn-gold" style={{ marginTop: 20 }} disabled={saving}
            onClick={() => saveSettings('notification_settings', notifs, 'Notification Settings')}>
            {saving ? 'Saving…' : 'Save Notification Settings'}
          </button>
        </div>
      )}

      {tab === 'Team' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-gold btn-sm" onClick={() => {
              const name  = window.prompt('Name:')
              const email = window.prompt('Email:')
              const role  = window.prompt('Role (Owner/Manager/Staff):') || 'Staff'
              if (!name || !email) return
              const member = { id: Date.now(), name, email, role, lastActive: 'Today' }
              const updated = [...team, member]
              setTeam(updated)
              saveSettings('team_members', updated, 'Team')
            }}>+ Invite Member</button>
          </div>
          <div className="tbl-wrap card" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Last Active</th><th></th></tr>
              </thead>
              <tbody>
                {team.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No team members</td></tr>
                ) : team.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{m.email}</td>
                    <td><span className={`pill ${m.role === 'Owner' ? 'gold' : m.role === 'Manager' ? 'info' : 'neutral'}`}>{m.role}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{m.lastActive}</td>
                    <td>
                      {m.role !== 'Owner' && (
                        <button className="btn btn-sm btn-danger" onClick={() => confirmAction('Remove Member', `Remove ${m.name}?`, () => {
                          const updated = team.filter(t => t.id !== m.id)
                          setTeam(updated)
                          saveSettings('team_members', updated, 'Team')
                        })}>Remove</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
