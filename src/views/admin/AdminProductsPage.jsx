import { useState, useEffect, useCallback } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'
import { resolveImageUrl } from '../../utils/resolveImageUrl'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

const flattenCategoryTree = (nodes, prefix = '') => {
  const out = []
  for (const n of nodes || []) {
    const label = prefix ? `${prefix} › ${n.name}` : n.name
    out.push({ value: n.slug || n.name, label })
    if (n.children?.length) out.push(...flattenCategoryTree(n.children, label))
  }
  return out
}

const loadCategoryOptions = async () => {
  const res = await adminAPI.categories.list()
  const roots = Array.isArray(res.data) ? res.data : (res.data?.roots || res.data?.data || [])
  return flattenCategoryTree(roots)
}

const PRODUCT_SPEC = [
  { group: 'Basic Info', cols: 2, fields: [
    { key: 'name',          label: 'Product Name',  type: 'text',              required: true },
    { key: 'tagline',       label: 'Tagline',       type: 'text'    },
    { key: 'category',      label: 'Category',      type: 'searchable-select', required: true, placeholder: 'Select a category…', loadOptions: loadCategoryOptions },
    { key: 'price',         label: 'Price (Rs)',    type: 'number',            required: true },
    { key: 'compare_price', label: 'Compare Price', type: 'number'  },
    { key: 'stock',         label: 'Stock',         type: 'number',            required: true },
  ]},
  { group: 'Status', cols: 2, fields: [
    { key: 'is_active',   label: 'Active',   type: 'toggle' },
    { key: 'is_featured', label: 'Featured', type: 'toggle' },
  ]},
  { group: 'Media', cols: 1, fields: [
    { key: 'image_url', label: 'Main Image',     type: 'image'  },
    { key: 'gallery',   label: 'Gallery Images', type: 'images' },
  ]},
  { group: 'Description', cols: 1, fields: [
    { key: 'description', label: '', type: 'textarea' },
  ]},
  { group: 'Ingredients & Usage', cols: 1, fields: [
    { key: 'ingredients', label: 'Ingredients', type: 'list', default: [],
      placeholder: 'e.g. Amla — type and press Enter', hint: 'Shown as cards on the product page.' },
    { key: 'benefits', label: 'Benefits (pillars)', type: 'list', default: [],
      placeholder: 'e.g. Strength — type and press Enter' },
    { key: 'how_to_use', label: 'How to Use (steps)', type: 'repeater', default: [], addLabel: 'Add step',
      hint: 'Each step shows as a numbered row on the product page.',
      itemFields: [
        { key: 'title', label: 'Step title (e.g. Warm)', type: 'text' },
        { key: 'body',  label: 'Step description', type: 'textarea' },
      ] },
  ]},
]

// Trim entries and drop fully-empty ones so the DB / product page stay clean.
const cleanList = (arr) =>
  Array.isArray(arr) ? arr.map((s) => (typeof s === 'string' ? s.trim() : s)).filter(Boolean) : []
const cleanSteps = (arr) =>
  Array.isArray(arr)
    ? arr
        .map((s) => (typeof s === 'string'
          ? { title: '', body: s.trim() }
          : { title: (s?.title || '').trim(), body: (s?.body || '').trim() }))
        .filter((s) => s.title || s.body)
    : []
const cleanProductPayload = (data) => ({
  ...data,
  ingredients: cleanList(data.ingredients),
  benefits:    cleanList(data.benefits),
  how_to_use:  cleanSteps(data.how_to_use),
})

// ── Inline icon set ────────────────────────────────────────────────────────────
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>
    {d}
  </svg>
)
const IconSearch  = <Icon d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />
const IconPlus    = <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} />
const IconEdit    = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconTrash   = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>} />
const IconChevL   = <Icon d={<polyline points="15 18 9 12 15 6"/>} />
const IconChevR   = <Icon d={<polyline points="9 18 15 12 9 6"/>} />

// ── Tiny action button ─────────────────────────────────────────────────────────
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

// ── Pagination component ───────────────────────────────────────────────────────
function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null

  // Build a compact page list: 1 … current-1, current, current+1 … last
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

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const { openCrud, confirmAction, showToast } = useAdminUI()

  const [products, setProducts]         = useState([])
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

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [statusFilter, search, perPage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { per_page: perPage, page }
      if (statusFilter === 'active')   params.active = 1
      if (statusFilter === 'inactive') params.active = 0
      if (search) params.search = search
      const res = await adminAPI.products.list(params)
      setProducts(res.data?.data || [])
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

  const openAdd = () => {
    openCrud({
      title: 'Add Product',
      spec: PRODUCT_SPEC,
      data: { is_active: true, is_featured: false, stock: 0, gallery: [] },
      onSave: (data) => {
        if (!data.name || !data.price || !data.category) return false
        return adminAPI.products.create(cleanProductPayload(data))
          .then(() => { showToast('Product added'); load() })
          .catch(e => { showToast(e.response?.data?.message || 'Failed to add product'); return false })
      },
    })
  }

  const openEdit = (p) => {
    openCrud({
      title: 'Edit Product',
      sub: p.slug,
      spec: PRODUCT_SPEC,
      data: p,
      onSave: (data) => {
        return adminAPI.products.update(p.slug, cleanProductPayload(data))
          .then(() => { showToast('Product updated'); load() })
          .catch(e => { showToast(e.response?.data?.message || 'Failed to update'); return false })
      },
    })
  }

  const handleDelete = (p) => {
    confirmAction('Delete Product', `Delete "${p.name}"?`, async () => {
      try {
        await adminAPI.products.destroy(p.slug)
        showToast('Product deleted')
        load()
      } catch {
        showToast('Failed to delete product')
      }
    })
  }

  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo   = Math.min(page * perPage, total)

  return (
    <div className="view">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 2px', letterSpacing: '-0.01em' }}>
            Products
          </h2>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {total === 0 ? 'No products' : `${total} total`}
          </div>
        </div>
        <button className="btn btn-gold" onClick={openAdd} style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
          {IconPlus} Add Product
        </button>
      </div>

      {/* ── Toolbar (filters + search) ──────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'inline-flex', background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8, padding: 3 }}>
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
            placeholder="Search products…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', padding: '8px 0', fontSize: 13 }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', padding: 0 }} title="Clear">
              <Icon d={<><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></>} w={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>Loading…</div>
        ) : products.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 14, marginBottom: 4 }}>No products found</div>
            <div style={{ fontSize: 12 }}>Try adjusting your filters or add a new product.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--cream-2)', borderBottom: '1px solid var(--line-2)' }}>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Price</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Stock</th>
                <th style={thStyle}>Status</th>
                <th style={{ ...thStyle, width: 100, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => {
                const stockTone = p.stock === 0 ? 'err' : p.stock < 10 ? 'warn' : 'ok'
                const stockColor = { err: 'var(--err)', warn: 'var(--warn)', ok: 'var(--ink)' }[stockTone]
                const stockDotColor = { err: '#d63031', warn: '#d4a04e', ok: '#7c9a64' }[stockTone]
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom: idx === products.length - 1 ? 'none' : '1px solid var(--line-2)',
                      transition: 'background .12s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {p.image_url ? (
                          <img src={resolveImageUrl(p.image_url)} alt={p.name}
                            style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line-2)' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--cream-2)', border: '1px solid var(--line-2)', flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}>{p.name}</div>
                          {p.tagline && (
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                              {p.tagline}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, color: 'var(--ink-2)' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--cream-2)', borderRadius: 4, border: '1px solid var(--line-2)' }}>
                        {p.category || '—'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ fontWeight: 500 }}>{fmt(p.price)}</div>
                      {p.compare_price > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>{fmt(p.compare_price)}</div>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500, color: stockColor }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: stockDotColor }} />
                        {p.stock}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <span style={p.is_active ? pillOk : pillNeutral}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: p.is_active ? '#7c9a64' : '#b8a890' }} />
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {p.is_featured && (
                          <span style={pillGold}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9a24e' }} />
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <IconBtn onClick={() => openEdit(p)} title="Edit">{IconEdit}</IconBtn>
                        <IconBtn onClick={() => handleDelete(p)} title="Delete" tone="danger">{IconTrash}</IconBtn>
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
      {!loading && products.length > 0 && (
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
const pillBase = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.06em',
}
const pillOk      = { ...pillBase, background: 'rgba(124,154,100,0.14)', color: '#5a7c44' }
const pillNeutral = { ...pillBase, background: 'var(--cream-2)',         color: 'var(--muted)' }
const pillGold    = { ...pillBase, background: 'rgba(201,162,78,0.16)',  color: '#8b6a26' }
