import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '../../router'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')
const fmtDate = (d) => new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: '2-digit' })

const STATUS_FILTERS = [
  { key: 'all',               label: 'All'         },
  { key: 'pending',           label: 'Pending'     },
  { key: 'awaiting_payment',  label: 'Awaiting'    },
  { key: 'confirmed',         label: 'Confirmed'   },
  { key: 'shipped',           label: 'Shipped'     },
  { key: 'delivered',         label: 'Delivered'   },
  { key: 'cancelled',         label: 'Cancelled'   },
]

const STATUS_STYLE = {
  pending:          { bg: 'rgba(212,160,78,0.14)',  fg: '#a47718', dot: '#d4a04e', label: 'Pending'  },
  awaiting_payment: { bg: 'rgba(212,160,78,0.14)',  fg: '#a47718', dot: '#d4a04e', label: 'Awaiting' },
  confirmed:        { bg: 'rgba(80,130,170,0.14)',  fg: '#3d6e95', dot: '#5082aa', label: 'Confirmed'},
  shipped:          { bg: 'rgba(80,130,170,0.14)',  fg: '#3d6e95', dot: '#5082aa', label: 'Shipped'  },
  delivered:        { bg: 'rgba(124,154,100,0.14)', fg: '#5a7c44', dot: '#7c9a64', label: 'Delivered'},
  cancelled:        { bg: 'rgba(214,48,49,0.10)',   fg: '#a8302f', dot: '#d63031', label: 'Cancelled'},
  refunded:         { bg: 'var(--cream-2)',          fg: 'var(--muted)', dot: '#b8a890', label: 'Refunded' },
}

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>
    {d}
  </svg>
)
const IconSearch  = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPrint   = <Icon d={<><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>} />
const IconEye     = <Icon d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />
const IconEdit    = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconTrash   = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconExport  = <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />
const IconPlus    = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconChevL   = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR   = <Icon d={<polyline points="9 18 15 12 9 6"/>} />

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
        transition: 'all .15s ease',
        padding: 0,
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

// ── Status pill ────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.refunded
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot }} />
      {s.label}
    </span>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const navigate = useNavigate()
  const { openFlyer, showToast, confirmAction } = useAdminUI()

  const [orders, setOrders]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [total, setTotal]               = useState(0)
  const [page, setPage]                 = useState(1)
  const [lastPage, setLastPage]         = useState(1)
  const [perPage, setPerPage]           = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchInput, setSearchInput]   = useState('')
  const [search, setSearch]             = useState('')

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
      const res = await adminAPI.orders.list(params)
      setOrders(res.data?.data || [])
      const meta = res.data?.meta || res.data
      setTotal(meta?.total ?? 0)
      setLastPage(meta?.last_page ?? 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page, perPage])

  useEffect(() => { load() }, [load])

  const handleDelete = (o) => {
    confirmAction(
      'Delete Order',
      `Delete order ${o.order_number}? This cannot be undone.`,
      async () => {
        try {
          await adminAPI.orders.destroy(o.id)
          showToast('Order deleted')
          load()
        } catch { showToast('Failed to delete order') }
      },
      'Yes, delete',
    )
  }

  const exportCsv = () => {
    const rows = [['Order #', 'Customer', 'Phone', 'Total', 'Payment', 'Status', 'Date']]
    orders.forEach(o => {
      rows.push([
        o.order_number, o.customer_name, o.customer_phone || '',
        o.total, o.payment_method, o.status,
        new Date(o.created_at).toLocaleDateString('en-PK'),
      ])
    })
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'orders.csv'
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
            All Orders
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {total === 0 ? 'No orders' : `${total} total order${total !== 1 ? 's' : ''}`}
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button
            onClick={exportCsv}
            disabled={orders.length === 0}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)', borderRadius: 8,
              background: 'var(--cream)', color: 'var(--ink-2)',
              cursor: orders.length === 0 ? 'not-allowed' : 'pointer',
              opacity: orders.length === 0 ? 0.5 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              transition: 'all .15s ease',
            }}
          >
            {IconExport} Export CSV
          </button>
          <button onClick={() => navigate('/admin/orders/new')} className="btn btn-gold"
            style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconPlus} New Order
          </button>
        </div>
      </div>

      {/* ── Toolbar (filters + search) ──────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'inline-flex', background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: 3, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f.key
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
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
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Order #, name, email…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px 0', fontSize: 13 }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', padding: 0 }} title="Clear">
              <Icon d={<><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>} w={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No orders found</div>
            <div style={{ fontSize: 12 }}>
              {search || statusFilter !== 'all' ? 'Try adjusting filters.' : 'Orders will appear here once customers place them.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Customer</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Items</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
                <th style={{ ...thStyle, width: 160, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => {
                const qty = Array.isArray(o.items) ? o.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0
                const itemCount = Array.isArray(o.items) ? o.items.length : 0
                const isPaid = o.payment_status === 'paid'
                return (
                  <tr
                    key={o.id}
                    style={{
                      borderBottom: idx === orders.length - 1 ? 'none' : '1px solid var(--line-2)',
                      transition: 'background .12s ease', cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/admin/orders/${o.id}/view`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--forest)', fontWeight: 500 }}>
                        {o.order_number}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                        {o.customer_phone || o.customer_email}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ fontWeight: 500 }}>{qty}</span>
                      {itemCount > 1 && (
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 1 }}>
                          {itemCount} unique
                        </div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>
                      {fmt(o.total)}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
                          textTransform: 'uppercase', color: 'var(--ink-2)',
                          background: 'var(--cream-2)', padding: '3px 7px', borderRadius: 4,
                          border: '1px solid var(--line-2)',
                        }}>
                          {(o.payment_method || '—').toUpperCase()}
                        </span>
                        {isPaid && (
                          <span title="Paid" style={{
                            width: 6, height: 6, borderRadius: '50%', background: '#7c9a64',
                            boxShadow: '0 0 0 2px rgba(124,154,100,0.18)',
                          }} />
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <StatusPill status={o.status} />
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--muted)', fontSize: 12 }}>
                      {fmtDate(o.created_at)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <IconBtn onClick={() => navigate(`/admin/orders/${o.id}/view`)} title="View">{IconEye}</IconBtn>
                        <IconBtn onClick={() => navigate(`/admin/orders/${o.id}/edit`)} title="Edit">{IconEdit}</IconBtn>
                        <IconBtn onClick={() => openFlyer(o.id)} title="Courier slip">{IconPrint}</IconBtn>
                        <IconBtn onClick={() => handleDelete(o)} title="Delete" tone="danger">{IconTrash}</IconBtn>
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
      {!loading && orders.length > 0 && (
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

// ── Inline style helpers ─────────────────────────────────────────────────────
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
