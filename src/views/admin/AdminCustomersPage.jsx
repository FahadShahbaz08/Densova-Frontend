import { useState, useEffect, useCallback } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmt      = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')
const initials = (name) => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const TIER_FILTERS = [
  { key: 'all',    label: 'All'    },
  { key: 'VIP',    label: 'VIP'    },
  { key: 'Repeat', label: 'Repeat' },
  { key: 'New',    label: 'New'    },
]

const TIER_STYLE = {
  VIP:    { bg: 'rgba(201,162,78,0.16)',  fg: '#8b6a26',     dot: '#c9a24e' },
  Repeat: { bg: 'rgba(80,130,170,0.14)',  fg: '#3d6e95',     dot: '#5082aa' },
  New:    { bg: 'var(--cream-2)',         fg: 'var(--muted)', dot: '#b8a890' },
}

const COUNTRIES = ['Pakistan', 'India', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Canada', 'Other']

// Form spec for CrudModal
const buildSpec = ({ isEdit }) => ([
  { group: 'Contact', cols: 2, fields: [
    { key: 'name',    label: 'Full Name', type: 'text',  required: true },
    { key: 'email',   label: 'Email',     type: 'email', required: !isEdit, hint: isEdit ? 'Email cannot be changed' : 'Used as the customer login' },
    { key: 'phone',   label: 'Phone',     type: 'text',  placeholder: '03XX-XXXXXXX' },
    { key: 'tier',    label: 'Tier',      type: 'select', options: [
      { value: 'New',    label: 'New' },
      { value: 'Repeat', label: 'Repeat' },
      { value: 'VIP',    label: 'VIP' },
    ]},
  ]},
  { group: 'Address', cols: 2, fields: [
    { key: 'address', label: 'Address', type: 'text', span: 2 },
    { key: 'city',    label: 'City',    type: 'text' },
    { key: 'country', label: 'Country', type: 'select', options: COUNTRIES.map(c => ({ value: c, label: c })) },
  ]},
  { group: 'Notes', cols: 1, fields: [
    { key: 'notes', label: 'Internal Notes (admin only)', type: 'textarea' },
  ]},
])

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconSearch = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPlus   = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconEye    = <Icon d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />
const IconEdit   = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconTrash  = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconExport = <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />
const IconChevL  = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR  = <Icon d={<polyline points="9 18 15 12 9 6"/>} />

// ── Tiny icon button ──────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title, tone = 'default' }) {
  const colors = {
    default: { color: 'var(--ink-2)', hover: 'var(--forest)' },
    danger:  { color: 'var(--muted)', hover: 'var(--err)' },
  }[tone]
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(e) }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28, borderRadius: 6,
        border: '1px solid var(--line-2)',
        background: hover ? 'var(--cream-2)' : 'transparent',
        color: hover ? colors.hover : colors.color,
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .15s ease', padding: 0,
      }}
    >{children}</button>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null
  const pages = []
  const add = (p) => { if (!pages.includes(p) && p >= 1 && p <= lastPage) pages.push(p) }
  add(1)
  for (let i = page - 1; i <= page + 1; i++) add(i)
  add(lastPage)
  pages.sort((a, b) => a - b)
  const items = []
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) items.push('…')
    items.push(p)
  })
  const baseBtn = {
    minWidth: 30, height: 30, padding: '0 8px', borderRadius: 6,
    border: '1px solid var(--line-2)', background: 'transparent',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--ink-2)', transition: 'all .15s ease',
  }
  const activeBtn = { ...baseBtn, background: 'var(--forest)', color: 'var(--cream)', borderColor: 'var(--forest)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button style={baseBtn} disabled={page === 1} onClick={() => onChange(page - 1)}>{IconChevL}</button>
      {items.map((it, i) =>
        it === '…'
          ? <span key={`e${i}`} style={{ color: 'var(--muted)', fontSize: 12, padding: '0 4px' }}>…</span>
          : <button key={it} style={it === page ? activeBtn : baseBtn} onClick={() => onChange(it)}>{it}</button>
      )}
      <button style={baseBtn} disabled={page === lastPage} onClick={() => onChange(page + 1)}>{IconChevR}</button>
    </div>
  )
}

// ── Tier pill ─────────────────────────────────────────────────────────────────
function TierPill({ tier }) {
  const t = TIER_STYLE[tier] || TIER_STYLE.New
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: t.bg, color: t.fg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: t.dot }} />
      {tier || 'New'}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCustomersPage() {
  const { openDetail, openCrud, confirmAction, showToast } = useAdminUI()

  const [customers, setCustomers]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [perPage, setPerPage]       = useState(10)
  const [tierFilter, setTierFilter] = useState('all')
  const [searchInput, setInput]     = useState('')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [tierFilter, search, perPage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: perPage, page }
      if (tierFilter !== 'all') params.tier = tierFilter
      if (search) params.search = search
      const res = await adminAPI.customers.list(params)
      // Backend returns Laravel paginator JSON directly (data + meta in body)
      setCustomers(res.data?.data || [])
      setTotal(res.data?.total ?? res.data?.meta?.total ?? 0)
      setLastPage(res.data?.last_page ?? res.data?.meta?.last_page ?? 1)
    } catch (e) {
      console.error('Customers load failed:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }, [tierFilter, search, page, perPage])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    openCrud({
      title: 'Add Customer',
      spec: buildSpec({ isEdit: false }),
      data: { tier: 'New', country: 'Pakistan' },
      onSave: (data) => {
        if (!data.name || !data.email) {
          showToast('Name and email are required')
          return false
        }
        adminAPI.customers.create(data)
          .then(() => { showToast('Customer added'); load() })
          .catch(e => {
            const msg = e.response?.data?.errors
              ? Object.values(e.response.data.errors).flat().join(' · ')
              : e.response?.data?.message || 'Failed to add customer'
            showToast(msg, true)
          })
      },
    })
  }

  const openEdit = (c) => {
    openCrud({
      title: 'Edit Customer',
      sub: c.email,
      spec: buildSpec({ isEdit: true }),
      data: c,
      onSave: (data) => {
        // Drop email from update payload (backend doesn't accept it)
        const { email, ...rest } = data  // eslint-disable-line no-unused-vars
        adminAPI.customers.update(c.id, rest)
          .then(() => { showToast('Customer updated'); load() })
          .catch(e => {
            const msg = e.response?.data?.errors
              ? Object.values(e.response.data.errors).flat().join(' · ')
              : e.response?.data?.message || 'Failed to update'
            showToast(msg, true)
          })
      },
    })
  }

  const handleDelete = (c) => {
    confirmAction(
      'Delete Customer',
      `Delete "${c.name}"? Their order history will remain but the customer account will be removed.`,
      async () => {
        try {
          await adminAPI.customers.destroy(c.id)
          showToast('Customer deleted')
          load()
        } catch (e) {
          showToast(e.response?.data?.message || 'Failed to delete', true)
        }
      },
      'Yes, delete',
    )
  }

  const exportCsv = () => {
    const rows = [['Name', 'Email', 'Phone', 'City', 'Country', 'Tier', 'Orders', 'LTV', 'Joined']]
    customers.forEach(c => rows.push([
      c.name, c.email, c.phone || '', c.city || '', c.country || '', c.tier || 'New',
      c.orders_count || 0, c.orders_sum_total || 0,
      new Date(c.created_at).toLocaleDateString('en-PK'),
    ]))
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'customers.csv'
    a.click()
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo   = Math.min(page * perPage, total)

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Customers
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {total === 0 ? 'No customers' : `${total} total customer${total !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button
            onClick={exportCsv}
            disabled={customers.length === 0}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)', borderRadius: 8,
              background: 'var(--cream)', color: 'var(--ink-2)',
              cursor: customers.length === 0 ? 'not-allowed' : 'pointer',
              opacity: customers.length === 0 ? 0.5 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}
          >
            {IconExport} Export CSV
          </button>
          <button onClick={openAdd} className="btn btn-gold"
            style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconPlus} Add Customer
          </button>
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'inline-flex', background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: 3 }}>
          {TIER_FILTERS.map(f => {
            const active = tierFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setTierFilter(f.key)}
                style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 500,
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: active ? 'var(--cream)' : 'transparent',
                  color: active ? 'var(--forest)' : 'var(--muted)',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all .15s ease',
                }}
              >{f.label}</button>
            )
          })}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)',
          border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px',
          width: 260,
        }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
          <input
            value={searchInput}
            onChange={e => setInput(e.target.value)}
            placeholder="Name, email, phone…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px 0', fontSize: 13 }}
          />
          {searchInput && (
            <button onClick={() => setInput('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', padding: 0 }} title="Clear">
              <Icon d={<><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>} w={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No customers found</div>
            <div style={{ fontSize: 12 }}>
              {search || tierFilter !== 'all' ? 'Try adjusting filters.' : 'Click "+ Add Customer" to create your first one.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Tier</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Orders</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Lifetime Value</th>
                <th style={thStyle}>Joined</th>
                <th style={{ ...thStyle, width: 130, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => {
                const orderCount = c.orders_count || 0
                const ltv = c.orders_sum_total || 0
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx === customers.length - 1 ? 'none' : '1px solid var(--line-2)',
                      transition: 'background .12s ease', cursor: 'pointer',
                    }}
                    onClick={() => openDetail('customer', c.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--gold-grad, linear-gradient(135deg,#c9a24e,#9c7d3a))',
                          color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--f-serif)', fontSize: 12, fontWeight: 600,
                          flexShrink: 0, letterSpacing: '0.02em',
                        }}>
                          {initials(c.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                            {c.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--ink-2)' }}>
                      {c.city || c.country ? (
                        <div>
                          <div style={{ fontSize: 13 }}>{c.city || '—'}</div>
                          {c.country && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{c.country}</div>}
                        </div>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <TierPill tier={c.tier} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 500 }}>
                      {orderCount}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, color: ltv > 0 ? 'var(--ink)' : 'var(--muted)' }}>
                      {fmt(ltv)}
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--muted)', fontSize: 12 }}>
                      {fmtDate(c.created_at)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <IconBtn onClick={() => openDetail('customer', c.id)} title="View profile">{IconEye}</IconBtn>
                        <IconBtn onClick={() => openEdit(c)} title="Edit">{IconEdit}</IconBtn>
                        <IconBtn onClick={() => handleDelete(c)} title="Delete" tone="danger">{IconTrash}</IconBtn>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination footer ────────────────────────────────────────────── */}
      {!loading && customers.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
            <span>Showing {showingFrom}–{showingTo} of {total}</span>
            <span style={{ width: 1, height: 14, background: 'var(--line-2)' }} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Rows
              <select
                value={perPage}
                onChange={e => setPerPage(Number(e.target.value))}
                style={{ border: '1px solid var(--line-2)', borderRadius: 6, padding: '3px 6px', background: 'var(--cream)', fontSize: 12, cursor: 'pointer' }}
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <Pagination page={page} lastPage={lastPage} onChange={setPage} />
        </div>
      )}
    </div>
  )
}

const thStyle = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: 'var(--muted)',
}
const tdStyle = {
  padding: '12px 14px',
  verticalAlign: 'middle',
}
