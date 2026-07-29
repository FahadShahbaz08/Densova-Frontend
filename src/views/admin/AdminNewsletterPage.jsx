import { useState, useEffect, useCallback } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

// ── Icons ──────────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconSearch = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPlus   = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconExport = <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} />
const IconCopy   = <Icon d={<><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>} />
const IconTrash  = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconChevL  = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR  = <Icon d={<polyline points="9 18 15 12 9 6"/>} />
const IconMail   = <Icon d={<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>} w={22} />

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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '16px 18px', flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, fontWeight: 500, color: 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminNewsletterPage() {
  const { confirmAction, showToast } = useAdminUI()

  const [subs, setSubs]           = useState([])
  const [stats, setStats]         = useState({ total: 0, last_30_days: 0, last_7_days: 0 })
  const [loading, setLoading]     = useState(true)
  const [page, setPage]           = useState(1)
  const [lastPage, setLastPage]   = useState(1)
  const [perPage, setPerPage]     = useState(25)
  const [searchInput, setInput]   = useState('')
  const [search, setSearch]       = useState('')
  const [addEmail, setAddEmail]   = useState('')
  const [adding, setAdding]       = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [search, perPage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: perPage, page }
      if (search) params.search = search
      const [listRes, statsRes] = await Promise.all([
        adminAPI.newsletter.list(params),
        adminAPI.newsletter.stats(),
      ])
      setSubs(listRes.data?.data || [])
      setLastPage(listRes.data?.last_page ?? listRes.data?.meta?.last_page ?? 1)
      if (statsRes.data) setStats(statsRes.data)
    } catch (e) {
      console.error('Newsletter load failed:', e.response?.data || e.message)
    } finally {
      setLoading(false)
    }
  }, [search, page, perPage])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    const email = addEmail.trim().toLowerCase()
    if (!email) return
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      showToast('Enter a valid email', true)
      return
    }
    setAdding(true)
    try {
      await adminAPI.newsletter.create({ email })
      setAddEmail('')
      showToast('Subscriber added')
      load()
    } catch (e) {
      const msg = e.response?.data?.errors?.email?.[0]
        || e.response?.data?.message
        || 'Failed to add'
      showToast(msg, true)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = (s) => {
    confirmAction(
      'Remove Subscriber',
      `Remove "${s.email}" from the newsletter list? They will need to subscribe again to receive emails.`,
      async () => {
        try {
          await adminAPI.newsletter.destroy(s.id)
          showToast('Subscriber removed')
          load()
        } catch { showToast('Failed to remove', true) }
      },
      'Yes, remove',
    )
  }

  const copyEmail = async (email) => {
    try {
      await navigator.clipboard.writeText(email)
      showToast(`Copied ${email}`)
    } catch { showToast('Copy failed', true) }
  }

  const exportCsv = async () => {
    try {
      // Fetch ALL subscribers for export (not just current page)
      const res = await adminAPI.newsletter.list({ per_page: 10000 })
      const all = res.data?.data || []
      const rows = [['Email', 'Subscribed At']]
      all.forEach(s => rows.push([s.email, fmtDateTime(s.subscribed_at || s.created_at)]))
      const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      showToast(`Exported ${all.length} subscribers`)
    } catch {
      showToast('Export failed', true)
    }
  }

  const copyAllEmails = async () => {
    try {
      const res = await adminAPI.newsletter.list({ per_page: 10000 })
      const all = res.data?.data || []
      const text = all.map(s => s.email).join(', ')
      await navigator.clipboard.writeText(text)
      showToast(`Copied ${all.length} emails to clipboard`)
    } catch { showToast('Copy failed', true) }
  }

  const showingFrom = stats.total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo   = Math.min(page * perPage, stats.total)

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Newsletter Subscribers
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            Email list collected from the storefront "Letters from the Apothecary" block
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button onClick={copyAllEmails} disabled={stats.total === 0}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)', borderRadius: 8,
              background: 'var(--cream)', color: 'var(--ink-2)',
              cursor: stats.total === 0 ? 'not-allowed' : 'pointer',
              opacity: stats.total === 0 ? 0.5 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            {IconCopy} Copy All
          </button>
          <button onClick={exportCsv} disabled={stats.total === 0}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)', borderRadius: 8,
              background: 'var(--cream)', color: 'var(--ink-2)',
              cursor: stats.total === 0 ? 'not-allowed' : 'pointer',
              opacity: stats.total === 0 ? 0.5 : 1,
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
            {IconExport} Export CSV
          </button>
        </div>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <StatCard label="Total Subscribers" value={stats.total} sub="All time" />
        <StatCard label="Last 30 Days"      value={stats.last_30_days} sub="New signups" />
        <StatCard label="Last 7 Days"       value={stats.last_7_days}  sub="This week" />
      </div>

      {/* ── Add subscriber card ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)' }}>
            {IconMail}
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Add Subscriber Manually
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8, minWidth: 280 }}>
            <input
              type="email"
              value={addEmail}
              onChange={e => setAddEmail(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              placeholder="customer@example.com"
              style={{
                flex: 1, padding: '9px 14px',
                border: '1px solid var(--line)', borderRadius: 8,
                background: 'var(--cream)', fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={handleAdd} disabled={adding || !addEmail.trim()}
              className="btn btn-gold"
              style={{ padding: '9px 16px', fontSize: 12, gap: 6, opacity: (adding || !addEmail.trim()) ? 0.6 : 1 }}>
              {IconPlus} {adding ? 'Adding…' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Toolbar (search + rows selector) ────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)',
          border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px', width: 280,
        }}>
          <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
          <input
            value={searchInput}
            onChange={e => setInput(e.target.value)}
            placeholder="Search email…"
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
        ) : subs.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No subscribers yet</div>
            <div style={{ fontSize: 12 }}>
              {search ? 'Try a different search.' : 'When visitors subscribe via the storefront, their emails appear here.'}
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Subscribed</th>
                <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s, idx) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: idx === subs.length - 1 ? 'none' : '1px solid var(--line-2)',
                    transition: 'background .12s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--cream-2)', border: '1px solid var(--line-2)',
                        color: 'var(--ink-2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600,
                        flexShrink: 0,
                      }}>
                        {(s.email || '?')[0].toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{s.email}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>
                    <div style={{ color: 'var(--ink-2)' }}>{fmtDate(s.subscribed_at || s.created_at)}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                      {(() => {
                        const ms = Date.now() - new Date(s.subscribed_at || s.created_at).getTime()
                        const days = Math.floor(ms / (1000 * 60 * 60 * 24))
                        if (days === 0) return 'Today'
                        if (days === 1) return 'Yesterday'
                        if (days < 30) return `${days} days ago`
                        if (days < 365) return `${Math.floor(days / 30)} mo ago`
                        return `${Math.floor(days / 365)} yr ago`
                      })()}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 4 }}>
                      <IconBtn onClick={() => copyEmail(s.email)} title="Copy email" tone="accent">{IconCopy}</IconBtn>
                      <IconBtn onClick={() => handleDelete(s)} title="Remove" tone="danger">{IconTrash}</IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination footer ────────────────────────────────────────────── */}
      {!loading && subs.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 14, gap: 12, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--muted)' }}>
            <span>Showing {showingFrom}–{showingTo} of {stats.total}</span>
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
