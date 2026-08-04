import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '../../router'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_FILTERS = [
  { key: 'all',      label: 'All'      },
  { key: 'pending',  label: 'Pending'  },
  { key: 'approved', label: 'Approved' },
]

const RATING_FILTERS = [
  { key: '',  label: 'Any rating' },
  { key: '5', label: '5 stars'    },
  { key: '4', label: '4 stars'    },
  { key: '3', label: '3 stars'    },
  { key: '2', label: '2 stars'    },
  { key: '1', label: '1 star'     },
]

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconSearch = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPlus   = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconEye    = <Icon d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} />
const IconEdit   = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconCheck  = <Icon d={<polyline points="20 6 9 17 4 12"/>} />
const IconX      = <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />
const IconTrash  = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconChevL  = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR  = <Icon d={<polyline points="9 18 15 12 9 6"/>} />
const IconCamera = <Icon d={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>} w={11} />

// ── Tiny icon button ──────────────────────────────────────────────────────────
function IconBtn({ children, onClick, title, tone = 'default' }) {
  const colors = {
    default: { color: 'var(--ink-2)', hover: 'var(--forest)' },
    danger:  { color: 'var(--muted)', hover: 'var(--err)' },
    success: { color: 'var(--muted)', hover: '#5a7c44' },
    warn:    { color: 'var(--muted)', hover: '#a47718' },
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

// ── Stars display ─────────────────────────────────────────────────────────────
function Stars({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#c9a24e', fontSize: 13, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= value ? '#c9a24e' : 'var(--line)' }}>★</span>
      ))}
    </span>
  )
}

// ── Status pill ───────────────────────────────────────────────────────────────
function StatusPill({ approved }) {
  return approved ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(124,154,100,0.14)', color: '#5a7c44' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c9a64' }} />
      Approved
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(212,160,78,0.14)', color: '#a47718' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d4a04e' }} />
      Pending
    </span>
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

// ── Product loader for searchable-select ─────────────────────────────────────
const loadProductOptions = async () => {
  const res = await adminAPI.products.list({ per_page: 200 })
  return (res.data?.data || []).map(p => ({ value: p.id, label: p.name }))
}

const buildSpec = () => ([
  { group: 'Review', cols: 2, fields: [
    { key: 'product_id', label: 'Product', type: 'searchable-select', required: true, placeholder: 'Select a product…', loadOptions: loadProductOptions },
    { key: 'rating',     label: 'Rating',  type: 'rating', required: true },
    { key: 'author',     label: 'Author Name', type: 'text', required: true },
    { key: 'email',      label: 'Author Email', type: 'email', placeholder: 'optional' },
    { key: 'title',      label: 'Headline', type: 'text', placeholder: 'Short summary (optional)', span: 2 },
    { key: 'body',       label: 'Review Body', type: 'textarea', required: true, span: 2 },
  ]},
  { group: 'Photos', cols: 1, fields: [
    { key: 'images', label: 'Customer-uploaded photos', type: 'images' },
  ]},
  { group: 'Status', cols: 2, fields: [
    { key: 'verified',    label: 'Verified Buyer', type: 'toggle' },
    { key: 'is_approved', label: 'Approved (visible on store)', type: 'toggle' },
  ]},
])

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminReviewsPage() {
  const navigate = useNavigate()
  const { openCrud, confirmAction, showToast } = useAdminUI()

  const [reviews, setReviews]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [lastPage, setLastPage]     = useState(1)
  const [perPage, setPerPage]       = useState(10)
  const [statusFilter, setStatusFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('')
  const [searchInput, setInput]     = useState('')
  const [search, setSearch]         = useState('')
  const [pendingCount, setPending]  = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [statusFilter, ratingFilter, search, perPage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: perPage, page }
      if (statusFilter !== 'all') params.status = statusFilter
      if (ratingFilter) params.rating = ratingFilter
      if (search) params.search = search
      const res = await adminAPI.reviews.list(params)
      setReviews(res.data?.data || [])
      setTotal(res.data?.total ?? res.data?.meta?.total ?? 0)
      setLastPage(res.data?.last_page ?? res.data?.meta?.last_page ?? 1)
    } catch (e) {
      console.error('Reviews load failed:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, ratingFilter, search, page, perPage])

  // Separate fetch for pending badge count (uses status filter independent of view filter)
  useEffect(() => {
    adminAPI.reviews.list({ status: 'pending', per_page: 1 })
      .then(r => setPending(r.data?.total ?? r.data?.meta?.total ?? 0))
      .catch(() => {})
  }, [reviews])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    openCrud({
      title: 'Add Review',
      spec: buildSpec(),
      data: { rating: 5, verified: false, is_approved: true, images: [] },
      onSave: (data) => {
        if (!data.product_id || !data.author || !data.body || !data.rating) {
          showToast('Product, author, rating and body are required')
          return false
        }
        adminAPI.reviews.create(data)
          .then(() => { showToast('Review added'); load() })
          .catch(e => {
            const msg = e.response?.data?.errors
              ? Object.values(e.response.data.errors).flat().join(' · ')
              : e.response?.data?.message || 'Failed to add review'
            showToast(msg, true)
          })
      },
    })
  }

  const openEdit = (r) => {
    openCrud({
      title: 'Edit Review',
      sub: r.product_name,
      spec: buildSpec(),
      data: { ...r, images: r.images || [] },
      onSave: (data) => {
        adminAPI.reviews.update(r.id, data)
          .then(() => { showToast('Review updated'); load() })
          .catch(e => {
            const msg = e.response?.data?.errors
              ? Object.values(e.response.data.errors).flat().join(' · ')
              : e.response?.data?.message || 'Failed to update'
            showToast(msg, true)
          })
      },
    })
  }

  const toggleApproval = async (r) => {
    try {
      if (r.is_approved) await adminAPI.reviews.reject(r.id)
      else await adminAPI.reviews.approve(r.id)
      showToast(r.is_approved ? 'Review rejected' : 'Review approved')
      load()
    } catch {
      showToast('Action failed', true)
    }
  }

  const handleDelete = (r) => {
    confirmAction('Delete Review', `Delete review by ${r.author}? This cannot be undone.`,
      async () => {
        try {
          await adminAPI.reviews.destroy(r.id)
          showToast('Review deleted')
          load()
        } catch { showToast('Failed to delete', true) }
      },
      'Yes, delete',
    )
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo   = Math.min(page * perPage, total)

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Reviews
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {total === 0 ? 'No reviews' : `${total} total`}
            {pendingCount > 0 && <span style={{ marginLeft: 8, color: '#a47718', fontWeight: 600 }}>· {pendingCount} pending</span>}
          </div>
        </div>
        <button onClick={openAdd} className="btn btn-gold" style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
          {IconPlus} Add Review
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: 3 }}>
            {STATUS_FILTERS.map(f => {
              const active = statusFilter === f.key
              const showBadge = f.key === 'pending' && pendingCount > 0
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
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    transition: 'all .15s ease',
                  }}
                >
                  {f.label}
                  {showBadge && (
                    <span style={{ background: '#d4a04e', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{pendingCount}</span>
                  )}
                </button>
              )
            })}
          </div>

          <select
            value={ratingFilter}
            onChange={e => setRatingFilter(e.target.value)}
            style={{
              padding: '7px 10px', fontSize: 12, border: '1px solid var(--line)',
              borderRadius: 8, background: 'var(--cream)', cursor: 'pointer',
            }}
          >
            {RATING_FILTERS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)',
          border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', width: 260,
        }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
          <input
            value={searchInput}
            onChange={e => setInput(e.target.value)}
            placeholder="Author, title, body…"
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
        ) : reviews.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No reviews found</div>
            <div style={{ fontSize: 12 }}>
              {search || statusFilter !== 'all' || ratingFilter ? 'Try adjusting filters.' : 'Customer reviews will appear here.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={thStyle}>Review</th>
                <th style={thStyle}>Product</th>
                <th style={{ ...thStyle, width: 110 }}>Rating</th>
                <th style={{ ...thStyle, width: 110 }}>Status</th>
                <th style={{ ...thStyle, width: 100 }}>Date</th>
                <th style={{ ...thStyle, width: 160, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, idx) => {
                const imgCount = (r.images || []).length
                return (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: idx === reviews.length - 1 ? 'none' : '1px solid var(--line-2)',
                      transition: 'background .12s ease', cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/admin/reviews/${r.id}/view`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        {/* Author initials avatar */}
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--cream-2)', border: '1px solid var(--line-2)',
                          color: 'var(--ink-2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--f-serif)', fontSize: 12, fontWeight: 600,
                          flexShrink: 0,
                        }}>
                          {(r.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, maxWidth: 420 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{r.author}</span>
                            {r.verified && (
                              <span title="Verified buyer" style={{
                                fontSize: 9, fontWeight: 700, color: '#5a7c44',
                                background: 'rgba(124,154,100,0.14)', padding: '1px 6px',
                                borderRadius: 4, letterSpacing: '0.06em',
                              }}>✓ VERIFIED</span>
                            )}
                            {imgCount > 0 && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                fontSize: 10, color: 'var(--muted)',
                                background: 'var(--cream-2)', padding: '2px 6px', borderRadius: 4,
                              }}>
                                {IconCamera} {imgCount}
                              </span>
                            )}
                          </div>
                          {r.title && (
                            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2, color: 'var(--ink-2)' }}>{r.title}</div>
                          )}
                          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.5 }}>
                            "{r.body}"
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>
                      <span style={{ color: 'var(--ink-2)' }}>{r.product_name || '—'}</span>
                    </td>
                    <td style={tdStyle}>
                      <Stars value={r.rating} />
                    </td>
                    <td style={tdStyle}>
                      <StatusPill approved={r.is_approved} />
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--muted)', fontSize: 12 }}>
                      {fmtDate(r.created_at)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <IconBtn onClick={() => navigate(`/admin/reviews/${r.id}/view`)} title="View">{IconEye}</IconBtn>
                        <IconBtn onClick={() => openEdit(r)} title="Edit">{IconEdit}</IconBtn>
                        <IconBtn
                          onClick={() => toggleApproval(r)}
                          title={r.is_approved ? 'Reject' : 'Approve'}
                          tone={r.is_approved ? 'warn' : 'success'}>
                          {r.is_approved ? IconX : IconCheck}
                        </IconBtn>
                        <IconBtn onClick={() => handleDelete(r)} title="Delete" tone="danger">{IconTrash}</IconBtn>
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
      {!loading && reviews.length > 0 && (
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
