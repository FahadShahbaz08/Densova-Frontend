import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

// ── Icon set ───────────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>
    {d}
  </svg>
)
const IconSearch   = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPlus     = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconEdit     = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconTrash    = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></>} />
const IconChevD    = <Icon d={<polyline points="6 9 12 15 18 9"/>} w={12} />
const IconFolder   = <Icon d={<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>} />
const IconCorner   = <Icon d={<polyline points="9 4 9 18 18 18"/>} w={14} />

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
      type="button"
      title={title}
      onClick={onClick}
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

// ── Form spec ─────────────────────────────────────────────────────────────────
const CAT_SPEC = [
  { group: 'Category', cols: 2, fields: [
    { key: 'name',        label: 'Name',        type: 'text',     required: true },
    { key: 'slug',        label: 'Slug',        type: 'text',     placeholder: 'auto-generated' },
    { key: 'parent_id',   label: 'Parent',      type: 'select',   options: [] },
    { key: 'sort_order',  label: 'Sort Order',  type: 'number'    },
    { key: 'description', label: 'Description', type: 'textarea', span: 2 },
  ]},
]

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminCategoriesPage() {
  const { openCrud, confirmAction, showToast } = useAdminUI()

  const [roots, setRoots]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchInput, setInput]   = useState('')
  const [search, setSearch]       = useState('')
  const [expanded, setExpanded]   = useState(new Set())

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200)
    return () => clearTimeout(t)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminAPI.categories.list()
      const data = res.data || []
      setRoots(data)
      // Auto-expand all on first load
      setExpanded(new Set(data.map(r => r.id)))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const allFlat   = useMemo(() => roots.flatMap(r => [r, ...(r.children || [])]), [roots])
  const total     = allFlat.length
  const totalSubs = useMemo(() => roots.reduce((s, r) => s + (r.children?.length || 0), 0), [roots])

  // Filtered tree (keep root if it or any child matches)
  const visible = useMemo(() => {
    if (!search) return roots
    return roots
      .map(r => {
        const rootMatch = r.name.toLowerCase().includes(search) || (r.slug || '').toLowerCase().includes(search)
        const matchedChildren = (r.children || []).filter(c =>
          c.name.toLowerCase().includes(search) || (c.slug || '').toLowerCase().includes(search))
        if (rootMatch) return r
        if (matchedChildren.length) return { ...r, children: matchedChildren }
        return null
      })
      .filter(Boolean)
  }, [roots, search])

  const parentOptions = [
    { value: '', label: '— Top level —' },
    ...roots.map(r => ({ value: r.id, label: r.name })),
  ]
  const specWithParents = CAT_SPEC.map(g => ({
    ...g,
    fields: g.fields.map(f => f.key === 'parent_id' ? { ...f, options: parentOptions } : f),
  }))

  const openAdd = (parent_id = null) => {
    openCrud({
      title: parent_id ? 'Add Sub-Category' : 'Add Category',
      spec: specWithParents,
      data: { parent_id: parent_id || '', sort_order: 1 },
      onSave: (data) => {
        if (!data.name) return false
        adminAPI.categories.create({ ...data, parent_id: data.parent_id || null })
          .then(() => { showToast('Category added'); load() })
          .catch(e => showToast(e.response?.data?.message || 'Failed to add category'))
      },
    })
  }

  const openEdit = (c) => {
    openCrud({
      title: 'Edit Category',
      spec: specWithParents,
      data: { ...c, parent_id: c.parent_id || '' },
      onSave: (data) => {
        adminAPI.categories.update(c.id, { ...data, parent_id: data.parent_id || null })
          .then(() => { showToast('Category updated'); load() })
          .catch(e => showToast(e.response?.data?.message || 'Failed to update'))
      },
    })
  }

  const handleDelete = (c) => {
    confirmAction(
      'Delete Category',
      c.children?.length
        ? `Delete "${c.name}"? Its ${c.children.length} sub-categories will move to top level.`
        : `Delete "${c.name}"?`,
      async () => {
        try {
          await adminAPI.categories.destroy(c.id)
          showToast('Category deleted')
          load()
        } catch { showToast('Failed to delete category') }
      }
    )
  }

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Categories
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {total === 0
              ? 'No categories'
              : `${roots.length} root${roots.length !== 1 ? 's' : ''} · ${totalSubs} sub-categor${totalSubs === 1 ? 'y' : 'ies'}`}
          </div>
        </div>
        <button className="btn btn-gold" onClick={() => openAdd()} style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
          {IconPlus} Add Category
        </button>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      {!loading && roots.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 14 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--cream)',
            border: '1px solid var(--line)', borderRadius: 8, padding: '0 12px',
            width: 260,
          }}>
            <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconSearch}</span>
            <input
              value={searchInput}
              onChange={e => setInput(e.target.value)}
              placeholder="Search categories…"
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px 0', fontSize: 13 }}
            />
            {searchInput && (
              <button onClick={() => setInput('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', padding: 0 }} title="Clear">
                <Icon d={<><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>} w={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Categories list ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
      ) : roots.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--cream-2)', border: '1px solid var(--line-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', marginBottom: 12 }}>
            {IconFolder}
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink)', marginBottom: 4, fontWeight: 500 }}>No categories yet</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
            Start by adding your first category. You can nest sub-categories beneath it.
          </div>
          <button className="btn btn-gold" onClick={() => openAdd()} style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
            {IconPlus} Add your first category
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 14, marginBottom: 4 }}>No matches for "{searchInput}"</div>
          <div style={{ fontSize: 12 }}>Try a different search term.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((root) => {
            const isOpen = expanded.has(root.id) || !!search
            const childCount = root.children?.length || 0
            return (
              <div key={root.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Root row */}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12,
                    transition: 'background .12s ease',
                    cursor: childCount ? 'pointer' : 'default',
                  }}
                  onClick={() => childCount && toggleExpand(root.id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Chevron (only if has children) */}
                  <div style={{
                    width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--muted)', flexShrink: 0,
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform .15s ease',
                    visibility: childCount ? 'visible' : 'hidden',
                  }}>
                    {IconChevD}
                  </div>

                  {/* Folder icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(201,162,78,0.12)',
                    color: 'var(--gold)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {IconFolder}
                  </div>

                  {/* Name + slug */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--ink)' }}>{root.name}</span>
                      <span style={{
                        fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)',
                        background: 'var(--cream-2)', padding: '2px 6px', borderRadius: 4,
                        border: '1px solid var(--line-2)',
                      }}>{root.slug}</span>
                      {childCount > 0 && (
                        <span style={{
                          fontSize: 10, fontWeight: 600, color: 'var(--forest)',
                          background: 'rgba(46,58,31,0.08)', padding: '2px 7px',
                          borderRadius: 100, letterSpacing: '0.04em',
                        }}>
                          {childCount} sub
                        </span>
                      )}
                    </div>
                    {root.description && (
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {root.description}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <IconBtn onClick={() => openAdd(root.id)} title="Add sub-category" tone="accent">{IconPlus}</IconBtn>
                    <IconBtn onClick={() => openEdit(root)} title="Edit">{IconEdit}</IconBtn>
                    <IconBtn onClick={() => handleDelete(root)} title="Delete" tone="danger">{IconTrash}</IconBtn>
                  </div>
                </div>

                {/* Children */}
                {isOpen && childCount > 0 && (
                  <div style={{ background: 'var(--cream-2)', borderTop: '1px solid var(--line-2)' }}>
                    {root.children.map((sub, idx) => (
                      <div
                        key={sub.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 16px 10px 64px',
                          borderBottom: idx === root.children.length - 1 ? 'none' : '1px solid var(--line-2)',
                          transition: 'background .12s ease',
                          position: 'relative',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--cream-2)'}
                      >
                        {/* Tree connector line */}
                        <span style={{
                          position: 'absolute', left: 33, top: 0, bottom: 0,
                          width: 1, background: 'var(--line)',
                        }} />
                        <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{IconCorner}</span>

                        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{sub.name}</span>
                        <span style={{
                          fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--muted)',
                          background: 'var(--cream)', padding: '2px 6px', borderRadius: 4,
                          border: '1px solid var(--line-2)',
                        }}>{sub.slug}</span>

                        <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 4 }}>
                          <IconBtn onClick={() => openEdit(sub)} title="Edit">{IconEdit}</IconBtn>
                          <IconBtn onClick={() => handleDelete(sub)} title="Delete" tone="danger">{IconTrash}</IconBtn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
