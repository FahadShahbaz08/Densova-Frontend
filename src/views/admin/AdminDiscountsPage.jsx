import { useState, useEffect, useCallback } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')
const fmtDate = (d) => {
  if (!d) return null
  const date = new Date(d)
  if (isNaN(date)) return d
  return date.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })
}
const daysUntil = (d) => {
  if (!d) return null
  const ms = new Date(d).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

const STATUS_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'active',    label: 'Active'    },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'disabled',  label: 'Disabled'  },
  { key: 'expired',   label: 'Expired'   },
]

const STATUS_STYLE = {
  active:    { bg: 'rgba(124,154,100,0.14)', fg: '#5a7c44', dot: '#7c9a64' },
  scheduled: { bg: 'rgba(80,130,170,0.14)',  fg: '#3d6e95', dot: '#5082aa' },
  disabled:  { bg: 'var(--cream-2)',          fg: 'var(--muted)', dot: '#b8a890' },
  expired:   { bg: 'rgba(214,48,49,0.10)',   fg: '#a8302f', dot: '#d63031' },
}

const TYPE_LABEL = {
  percent:  'Percentage',
  amount:   'Fixed amount',
  shipping: 'Free shipping',
}

// ── Form spec ─────────────────────────────────────────────────────────────────
const DISCOUNT_SPEC = [
  { group: 'Code', cols: 2, fields: [
    { key: 'code',   label: 'Discount Code', type: 'text', required: true, placeholder: 'e.g. WELCOME20', hint: 'Auto-uppercased' },
    { key: 'status', label: 'Status', type: 'select', options: [
      { value: 'active',    label: 'Active' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'disabled',  label: 'Disabled' },
      { value: 'expired',   label: 'Expired' },
    ]},
  ]},
  { group: 'Discount', cols: 2, fields: [
    { key: 'type',  label: 'Type', type: 'select', options: [
      { value: 'percent',  label: 'Percentage (%)' },
      { value: 'amount',   label: 'Fixed Amount (Rs)' },
      { value: 'shipping', label: 'Free Shipping' },
    ]},
    { key: 'value',     label: 'Value', type: 'number', placeholder: '20', hint: 'Percent or amount based on type' },
    { key: 'min_order', label: 'Minimum Order (Rs)', type: 'number', hint: 'Leave 0 for none' },
    { key: 'scope',     label: 'Applies to', type: 'select', options: [
      { value: 'all', label: 'All Products' },
    ]},
  ]},
  { group: 'Limits', cols: 2, fields: [
    { key: 'usage_limit', label: 'Usage Limit', type: 'number', hint: '0 = unlimited' },
    { key: 'expires_at',  label: 'Expires On',  type: 'date', hint: 'Leave empty for no expiry' },
    { key: 'description', label: 'Internal Description', type: 'textarea', span: 2 },
  ]},
]

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconSearch = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPlus   = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconEdit   = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconTrash  = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconCopy   = <Icon d={<><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>} />
const IconChevL  = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR  = <Icon d={<polyline points="9 18 15 12 9 6"/>} />

// ── Tiny icon button ──────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title, tone = 'default' }) {
  const colors = {
    default: { color: 'var(--ink-2)', hover: 'var(--forest)' },
    danger:  { color: 'var(--muted)', hover: 'var(--err)' },
    accent:  { color: 'var(--muted)', hover: 'var(--gold)' },
  }[tone]
  const [hover, setHover] = useState(false)
  return (
    <button
      type="button" title={title}
      onClick={(e) => { e.stopPropagation(); onClick(e) }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
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
  add(1); for (let i = page - 1; i <= page + 1; i++) add(i); add(lastPage)
  pages.sort((a, b) => a - b)
  const items = []
  pages.forEach((p, i) => { if (i > 0 && p - pages[i - 1] > 1) items.push('…'); items.push(p) })
  const baseBtn = { minWidth: 30, height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid var(--line-2)', background: 'transparent', fontSize: 12, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', transition: 'all .15s ease' }
  const activeBtn = { ...baseBtn, background: 'var(--forest)', color: 'var(--cream)', borderColor: 'var(--forest)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <button style={baseBtn} disabled={page === 1} onClick={() => onChange(page - 1)}>{IconChevL}</button>
      {items.map((it, i) => it === '…'
        ? <span key={`e${i}`} style={{ color: 'var(--muted)', fontSize: 12, padding: '0 4px' }}>…</span>
        : <button key={it} style={it === page ? activeBtn : baseBtn} onClick={() => onChange(it)}>{it}</button>)}
      <button style={baseBtn} disabled={page === lastPage} onClick={() => onChange(page + 1)}>{IconChevR}</button>
    </div>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.disabled
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
      {status}
    </span>
  )
}

// ── Discount code badge (mono with dashed border) ─────────────────────────────
function CodeBadge({ code }) {
  return (
    <span style={{
      fontFamily: 'var(--f-mono)', fontWeight: 700, fontSize: 12,
      background: 'var(--cream-2)', padding: '4px 10px', borderRadius: 4,
      border: '1px dashed var(--gold)',
      color: 'var(--ink)',
      letterSpacing: '0.04em',
    }}>{code}</span>
  )
}

// ── Inline status quick-changer (cycles or opens dropdown) ────────────────────
function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    setTimeout(() => document.addEventListener('click', close, { once: true }), 0)
    return () => document.removeEventListener('click', close)
  }, [open])
  return (
    <div style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
        title="Change status"
      >
        <StatusPill status={value} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: 'var(--cream)', border: '1px solid var(--line)',
          borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          zIndex: 100, minWidth: 140, padding: 4,
        }}>
          {['active', 'scheduled', 'disabled', 'expired'].map(s => (
            <div
              key={s}
              onClick={() => { onChange(s); setOpen(false) }}
              style={{
                padding: '6px 10px', cursor: 'pointer', borderRadius: 4,
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: STATUS_STYLE[s]?.fg, display: 'flex', alignItems: 'center', gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: STATUS_STYLE[s]?.dot }} />
              {s}
              {s === value && <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 10 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminDiscountsPage() {
  const { openCrud, confirmAction, showToast } = useAdminUI()

  const [discounts, setDiscounts]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [perPage, setPerPage]       = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchInput, setInput]     = useState('')
  const [search, setSearch]         = useState('')

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [statusFilter, search, perPage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: perPage, page }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      const res = await adminAPI.discounts.list(params)
      setDiscounts(res.data?.data || [])
      setTotal(res.data?.total ?? res.data?.meta?.total ?? 0)
      setLastPage(res.data?.last_page ?? res.data?.meta?.last_page ?? 1)
    } catch (e) {
      console.error('Discounts load failed:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page, perPage])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    openCrud({
      title: 'Add Discount Code',
      spec: DISCOUNT_SPEC,
      data: { type: 'percent', value: 10, min_order: 0, usage_limit: 0, status: 'active', scope: 'all' },
      onSave: (data) => {
        if (!data.code) {
          showToast('Code is required')
          return false
        }
        adminAPI.discounts.create({ ...data, code: (data.code || '').toUpperCase() })
          .then(() => { showToast('Discount created'); load() })
          .catch(e => {
            const msg = e.response?.data?.errors
              ? Object.values(e.response.data.errors).flat().join(' · ')
              : e.response?.data?.message || 'Failed to create discount'
            showToast(msg, true)
          })
      },
    })
  }

  const openEdit = (d) => {
    // Normalize date for the form (date input expects yyyy-mm-dd)
    const formattedDate = d.expires_at ? d.expires_at.substring(0, 10) : ''
    openCrud({
      title: 'Edit Discount',
      sub: d.code,
      spec: DISCOUNT_SPEC,
      data: { ...d, expires_at: formattedDate },
      onSave: (data) => {
        adminAPI.discounts.update(d.id, { ...data, code: (data.code || '').toUpperCase() })
          .then(() => { showToast('Discount updated'); load() })
          .catch(e => {
            const msg = e.response?.data?.errors
              ? Object.values(e.response.data.errors).flat().join(' · ')
              : e.response?.data?.message || 'Failed to update'
            showToast(msg, true)
          })
      },
    })
  }

  const changeStatus = async (d, newStatus) => {
    if (d.status === newStatus) return
    try {
      await adminAPI.discounts.changeStatus(d.id, newStatus)
      showToast(`Status set to ${newStatus}`)
      load()
    } catch {
      showToast('Failed to change status', true)
    }
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      showToast(`Copied "${code}"`)
    } catch {
      showToast('Copy failed', true)
    }
  }

  const handleDelete = (d) => {
    confirmAction('Delete Discount', `Delete code "${d.code}"? This cannot be undone.`,
      async () => {
        try {
          await adminAPI.discounts.destroy(d.id)
          showToast('Discount deleted')
          load()
        } catch { showToast('Failed to delete', true) }
      },
      'Yes, delete')
  }

  const formatValue = (d) => {
    if (d.type === 'percent')  return `${parseFloat(d.value)}% off`
    if (d.type === 'amount')   return `${fmt(d.value)} off`
    return 'Free shipping'
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo   = Math.min(page * perPage, total)

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Discount Codes
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {total === 0 ? 'No codes yet' : `${total} total code${total !== 1 ? 's' : ''}`}
          </div>
        </div>
        <button onClick={openAdd} className="btn btn-gold" style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
          {IconPlus} Add Code
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'inline-flex', background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f.key
            return (
              <button
                key={f.key} onClick={() => setStatusFilter(f.key)}
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
          border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', width: 260,
        }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
          <input
            value={searchInput}
            onChange={e => setInput(e.target.value)}
            placeholder="Search code…"
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
        ) : discounts.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No discount codes</div>
            <div style={{ fontSize: 12 }}>
              {search || statusFilter !== 'all' ? 'Try adjusting filters.' : 'Click "+ Add Code" to create your first discount.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={thStyle}>Code</th>
                <th style={thStyle}>Discount</th>
                <th style={thStyle}>Conditions</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Usage</th>
                <th style={thStyle}>Expires</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, width: 110, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((d, idx) => {
                const used  = Number(d.used_count || 0)
                const limit = Number(d.usage_limit || 0)
                const usagePct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0
                const daysLeft = daysUntil(d.expires_at)

                return (
                  <tr
                    key={d.id}
                    style={{
                      borderBottom: idx === discounts.length - 1 ? 'none' : '1px solid var(--line-2)',
                      transition: 'background .12s ease', cursor: 'pointer',
                    }}
                    onClick={() => openEdit(d)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CodeBadge code={d.code} />
                      </div>
                      {d.description && (
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.description}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{formatValue(d)}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {TYPE_LABEL[d.type] || d.type}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      <div>Min: <strong style={{ color: 'var(--ink-2)' }}>{Number(d.min_order) > 0 ? fmt(d.min_order) : 'None'}</strong></div>
                      <div style={{ color: 'var(--muted)', marginTop: 2 }}>
                        Scope: {d.scope || 'all'}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {used} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>/ {limit > 0 ? limit : '∞'}</span>
                      </div>
                      {limit > 0 && (
                        <div style={{
                          marginTop: 4, height: 4, width: 70, margin: '4px auto 0',
                          background: 'var(--line-2)', borderRadius: 100, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${usagePct}%`, height: '100%',
                            background: usagePct >= 100 ? '#d63031' : usagePct >= 80 ? '#d4a04e' : '#7c9a64',
                          }} />
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      {d.expires_at ? (
                        <div>
                          <div style={{ color: 'var(--ink-2)' }}>{fmtDate(d.expires_at)}</div>
                          {daysLeft !== null && (
                            <div style={{
                              fontSize: 10, marginTop: 2,
                              color: daysLeft < 0 ? '#d63031' : daysLeft <= 7 ? '#a47718' : 'var(--muted)',
                              fontWeight: daysLeft <= 7 && daysLeft >= 0 ? 600 : 400,
                            }}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'Today' : `in ${daysLeft}d`}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>Never</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <StatusDropdown value={d.status} onChange={(s) => changeStatus(d, s)} />
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <IconBtn onClick={() => copyCode(d.code)} title="Copy code" tone="accent">{IconCopy}</IconBtn>
                        <IconBtn onClick={() => openEdit(d)} title="Edit">{IconEdit}</IconBtn>
                        <IconBtn onClick={() => handleDelete(d)} title="Delete" tone="danger">{IconTrash}</IconBtn>
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
      {!loading && discounts.length > 0 && (
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
  padding: '10px 14px', textAlign: 'left',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: 'var(--muted)',
}
const tdStyle = { padding: '12px 14px', verticalAlign: 'middle' }
