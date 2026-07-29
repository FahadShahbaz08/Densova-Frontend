import { useState, useEffect, useCallback } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' }) : '—'

const STATUS_FILTERS = [
  { key: 'all',     label: 'All'      },
  { key: 'unread',  label: 'Unread'   },
  { key: 'pending', label: 'Pending'  },
  { key: 'replied', label: 'Replied'  },
]

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconSearch = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconMail   = <Icon d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>} />
const IconCheck  = <Icon d={<polyline points="20 6 9 17 4 12"/>} />
const IconTrash  = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconChevL  = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR  = <Icon d={<polyline points="9 18 15 12 9 6"/>} />
const IconReply  = <Icon d={<polyline points="9 17 4 12 9 7"/>} />
const IconClose  = <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />

function IconBtn({ children, onClick, title, tone = 'default' }) {
  const colors = {
    default: { color: 'var(--ink-2)', hover: 'var(--forest)' },
    danger:  { color: 'var(--muted)', hover: 'var(--err)' },
    success: { color: 'var(--muted)', hover: '#5a7c44' },
  }[tone]
  const [hover, setHover] = useState(false)
  return (
    <button type="button" title={title}
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
      }}>{children}</button>
  )
}

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

// ── Detail drawer ─────────────────────────────────────────────────────────────
function MessageDrawer({ msg, onClose, onUpdated, showToast }) {
  const [notes, setNotes] = useState(msg.admin_notes || '')
  const [saving, setSaving] = useState(false)

  const toggleReplied = async () => {
    setSaving(true)
    try {
      const res = await adminAPI.contact.update(msg.id, { is_replied: !msg.is_replied })
      onUpdated(res.data?.data || res.data)
      showToast(msg.is_replied ? 'Marked as pending' : 'Marked as replied')
    } catch { showToast('Action failed', true) }
    finally { setSaving(false) }
  }

  const saveNotes = async () => {
    setSaving(true)
    try {
      const res = await adminAPI.contact.update(msg.id, { admin_notes: notes })
      onUpdated(res.data?.data || res.data)
      showToast('Notes saved')
    } catch { showToast('Save failed', true) }
    finally { setSaving(false) }
  }

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(20,18,14,0.4)',
        zIndex: 90, backdropFilter: 'blur(2px)',
      }} />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(520px, 92vw)',
        background: 'var(--cream)', zIndex: 100,
        boxShadow: '-12px 0 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>Message from</div>
            <h3 style={{ fontFamily: 'var(--f-serif)', fontSize: 20, fontWeight: 500, margin: '4px 0 0' }}>{msg.name}</h3>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
              <a href={`mailto:${msg.email}`} style={{ color: 'var(--forest)', textDecoration: 'none' }}>{msg.email}</a>
              {msg.phone && <span> · <a href={`tel:${msg.phone.replace(/[^\d+]/g, '')}`} style={{ color: 'var(--forest)', textDecoration: 'none' }}>{msg.phone}</a></span>}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{fmtDateTime(msg.created_at)}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--line-2)', background: 'transparent', cursor: 'pointer', color: 'var(--ink-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{IconClose}</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {msg.subject && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Subject</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>{msg.subject}</div>
            </div>
          )}

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Message</div>
            <div style={{
              fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)',
              background: 'var(--cream-2)', padding: '16px 18px', borderRadius: 8,
              whiteSpace: 'pre-wrap', fontFamily: 'var(--f-serif)',
            }}>
              {msg.message}
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Admin Notes</div>
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              placeholder="Private notes…"
              style={{ width: '100%', padding: 10, border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--f-sans)', resize: 'vertical', boxSizing: 'border-box' }}
            />
            <button onClick={saveNotes} disabled={saving}
              className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12, marginTop: 8 }}>
              {saving ? 'Saving…' : 'Save notes'}
            </button>
          </div>

          {msg.replied_at && (
            <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic', marginTop: 12 }}>
              Marked replied on {fmtDateTime(msg.replied_at)}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line-2)', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
          <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your message')}`}
            className="btn btn-gold" style={{ padding: '9px 16px', fontSize: 12, gap: 6, textDecoration: 'none' }}>
            {IconReply} Reply via Email
          </a>
          <button onClick={toggleReplied} disabled={saving}
            style={{
              padding: '9px 16px', fontSize: 12, fontWeight: 500,
              border: `1px solid ${msg.is_replied ? 'var(--line-2)' : 'rgba(124,154,100,0.3)'}`,
              borderRadius: 8,
              background: msg.is_replied ? 'transparent' : 'rgba(124,154,100,0.1)',
              color: msg.is_replied ? 'var(--ink-2)' : '#5a7c44',
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            {IconCheck} {msg.is_replied ? 'Mark as Pending' : 'Mark as Replied'}
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, tone }) {
  const colors = { warn: '#a47718', danger: '#a8302f', success: '#5a7c44' }
  return (
    <div className="card" style={{ padding: '16px 18px', flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, fontWeight: 500, color: colors[tone] || 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminContactPage() {
  const { confirmAction, showToast } = useAdminUI()

  const [messages, setMessages] = useState([])
  const [stats, setStats]       = useState({ total: 0, unread: 0, pending: 0 })
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal]       = useState(0)
  const [perPage, setPerPage]   = useState(25)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchInput, setInput] = useState('')
  const [search, setSearch]     = useState('')
  const [openMsg, setOpenMsg]   = useState(null)

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
      const [listRes, statsRes] = await Promise.all([
        adminAPI.contact.list(params),
        adminAPI.contact.stats(),
      ])
      setMessages(listRes.data?.data || [])
      setTotal(listRes.data?.total ?? 0)
      setLastPage(listRes.data?.last_page ?? 1)
      if (statsRes.data) setStats(statsRes.data)
    } catch (e) {
      console.error('Contact load failed:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page, perPage])

  useEffect(() => { load() }, [load])

  const handleOpen = async (m) => {
    try {
      const res = await adminAPI.contact.show(m.id)
      setOpenMsg(res.data?.data || res.data)
      // Refresh list so unread badge updates
      load()
    } catch { showToast('Failed to open message', true) }
  }

  const handleDelete = (m) => {
    confirmAction('Delete Message', `Delete message from "${m.name}"? This cannot be undone.`,
      async () => {
        try {
          await adminAPI.contact.destroy(m.id)
          showToast('Message deleted')
          load()
        } catch { showToast('Failed to delete', true) }
      },
      'Yes, delete')
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo   = Math.min(page * perPage, total)

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Contact Inbox
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Messages submitted via the storefront Contact Us page
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <StatCard label="Total Messages" value={stats.total} sub="All time" />
        <StatCard label="Unread"  value={stats.unread}  tone={stats.unread > 0 ? 'warn' : null} sub="Not yet opened" />
        <StatCard label="Pending Reply" value={stats.pending} tone={stats.pending > 0 ? 'danger' : null} sub="Need follow-up" />
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'inline-flex', background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: 3 }}>
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f.key
            return (
              <button key={f.key} onClick={() => setStatusFilter(f.key)}
                style={{
                  padding: '5px 12px', fontSize: 12, fontWeight: 500,
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  background: active ? 'var(--cream)' : 'transparent',
                  color: active ? 'var(--forest)' : 'var(--muted)',
                  boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all .15s ease',
                }}>{f.label}</button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', width: 260 }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
          <input value={searchInput} onChange={e => setInput(e.target.value)}
            placeholder="Name, email, subject, message…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px 0', fontSize: 13 }} />
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
        ) : messages.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No messages</div>
            <div style={{ fontSize: 12 }}>
              {search || statusFilter !== 'all' ? 'Try adjusting filters.' : 'Submissions from the Contact page appear here.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={{ ...thStyle, width: 30 }}></th>
                <th style={thStyle}>From</th>
                <th style={thStyle}>Subject & Preview</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, width: 90 }}>Received</th>
                <th style={{ ...thStyle, width: 80, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m, idx) => (
                <tr key={m.id}
                  style={{
                    borderBottom: idx === messages.length - 1 ? 'none' : '1px solid var(--line-2)',
                    transition: 'background .12s ease', cursor: 'pointer',
                    background: !m.is_read ? 'rgba(212,160,78,0.04)' : 'transparent',
                  }}
                  onClick={() => handleOpen(m)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = !m.is_read ? 'rgba(212,160,78,0.04)' : 'transparent'}>
                  <td style={tdStyle}>
                    {!m.is_read && (
                      <span title="Unread" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#d4a04e', boxShadow: '0 0 0 3px rgba(212,160,78,0.18)' }} />
                    )}
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: !m.is_read ? 600 : 500, color: 'var(--ink)' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{m.email}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconMail}</span>
                      <div style={{ minWidth: 0, maxWidth: 380 }}>
                        {m.subject && <div style={{ fontWeight: !m.is_read ? 600 : 500, fontSize: 13, color: 'var(--ink-2)' }}>{m.subject}</div>}
                        <div style={{ fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.message}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {m.is_replied ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(124,154,100,0.14)', color: '#5a7c44' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7c9a64' }} />Replied
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 100, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(212,160,78,0.14)', color: '#a47718' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#d4a04e' }} />Pending
                      </span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, color: 'var(--muted)' }}>{fmtDate(m.created_at)}</td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <IconBtn onClick={() => handleOpen(m)} title="Open">{IconMail}</IconBtn>
                      <IconBtn onClick={() => handleDelete(m)} title="Delete" tone="danger">{IconTrash}</IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && messages.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
            <span>Showing {showingFrom}–{showingTo} of {total}</span>
            <span style={{ width: 1, height: 14, background: 'var(--line-2)' }} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Rows
              <select value={perPage} onChange={e => setPerPage(Number(e.target.value))}
                style={{ border: '1px solid var(--line-2)', borderRadius: 6, padding: '3px 6px', background: 'var(--cream)', fontSize: 12, cursor: 'pointer' }}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
          <Pagination page={page} lastPage={lastPage} onChange={setPage} />
        </div>
      )}

      {openMsg && (
        <MessageDrawer
          msg={openMsg}
          onClose={() => setOpenMsg(null)}
          onUpdated={(updated) => { setOpenMsg(updated); load() }}
          showToast={showToast}
        />
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
