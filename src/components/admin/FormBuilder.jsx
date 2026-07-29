import { useState, useRef, useEffect } from 'react'
import { adminAPI } from '../../services/api'

// ── Searchable select with async option loading ──────────────────────────────
function SearchableSelect({ value, onChange, placeholder, loadOptions, options: staticOptions }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState(staticOptions || [])
  const [loading, setLoading] = useState(!!loadOptions && !staticOptions)
  const wrapRef = useRef()

  useEffect(() => {
    if (!loadOptions) return
    let alive = true
    setLoading(true)
    Promise.resolve(loadOptions())
      .then(opts => { if (alive) setOptions(opts || []) })
      .catch(() => { if (alive) setOptions([]) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false); setQuery('')
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const normalized = options.map(o => typeof o === 'object' ? o : { value: o, label: o })
  const current = normalized.find(o => o.value === value)
  const filtered = query
    ? normalized.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : normalized

  const displayValue = open ? query : (current?.label || value || '')

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={displayValue}
          placeholder={placeholder || 'Search…'}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={(e) => { setQuery(e.target.value); if (!open) setOpen(true) }}
          style={{ width: '100%', paddingRight: 32 }}
          autoComplete="off"
        />
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
          style={{
            position: 'absolute', right: 10, top: '50%',
            width: 14, height: 14, color: 'var(--muted)', pointerEvents: 'none',
            transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            transition: 'transform .15s ease',
          }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--cream)', border: '1px solid var(--line)', borderRadius: 8,
          maxHeight: 260, overflowY: 'auto', zIndex: 1000,
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        }}>
          {loading ? (
            <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--muted)' }}>No matches</div>
          ) : (
            filtered.map(o => {
              const active = o.value === value
              return (
                <div
                  key={o.value}
                  onMouseDown={(e) => { e.preventDefault(); onChange(o.value); setOpen(false); setQuery('') }}
                  style={{
                    padding: '9px 12px', cursor: 'pointer', fontSize: 13,
                    background: active ? 'var(--cream-2)' : 'transparent',
                    color: active ? 'var(--forest)' : 'var(--ink)',
                    fontWeight: active ? 500 : 400,
                    transition: 'background .12s ease',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--cream-2)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {o.label}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function ImageUploadField({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef()

  const pick = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true); setError('')
    try {
      const res = await adminAPI.upload.image(file)
      onChange(res.data.url)
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed — use JPG, PNG, WebP or GIF under 10 MB.')
    }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {value ? (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={value} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
          <button type="button" onClick={() => onChange('')}
            style={{ position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%', background: '#d63031', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: '18px', textAlign: 'center', padding: 0 }}>×</button>
        </div>
      ) : (
        <div onClick={() => ref.current?.click()}
          style={{ width: 64, height: 64, borderRadius: 8, border: '2px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', flexShrink: 0 }}>+</div>
      )}
      <div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={() => ref.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : value ? 'Change' : 'Upload image'}
        </button>
        {value && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value.split('/').pop()}
          </div>
        )}
        {error && (
          <div style={{ fontSize: 11, color: '#d63031', marginTop: 4, maxWidth: 220 }}>{error}</div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
    </div>
  )
}

function ImagesUploadField({ value = [], onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef()

  const pick = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true); setError('')
    try {
      const urls = await Promise.all(files.map(f => adminAPI.upload.image(f).then(r => r.data.url)))
      onChange([...(value || []), ...urls])
    } catch (err) {
      setError(err.response?.data?.message || 'One or more images failed — use JPG, PNG, WebP or GIF under 10 MB.')
    }
    finally { setUploading(false); e.target.value = '' }
  }

  const remove = (idx) => onChange((value || []).filter((_, i) => i !== idx))

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: (value || []).length ? 10 : 0 }}>
        {(value || []).map((url, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <img src={url} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }} />
            <button type="button" onClick={() => remove(idx)}
              style={{ position: 'absolute', top: -5, right: -5, width: 16, height: 16, borderRadius: '50%', background: '#d63031', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, lineHeight: '16px', textAlign: 'center', padding: 0 }}>×</button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-sm btn-ghost" onClick={() => ref.current?.click()} disabled={uploading}>
        {uploading ? 'Uploading…' : '+ Add images'}
      </button>
      {error && <div style={{ fontSize: 11, color: '#d63031', marginTop: 6 }}>{error}</div>}
      <input ref={ref} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={pick} />
    </div>
  )
}

function RatingField({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const active = hover || value || 0
  return (
    <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          style={{
            background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 26, color: n <= active ? '#c9a24e' : 'var(--line)',
            lineHeight: 1, transition: 'color .12s ease',
          }}
        >★</button>
      ))}
      <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>
        {value ? `${value} of 5` : 'Tap a star'}
      </span>
    </div>
  )
}

// ── List of free-text tags (e.g. ingredients, benefits) → string[] ───────────
function ListField({ value = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('')
  const items = Array.isArray(value) ? value : []

  const add = () => {
    const v = draft.trim()
    if (!v) return
    onChange([...items, v])
    setDraft('')
  }
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {items.map((it, idx) => (
            <span key={idx} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--cream-2)', border: '1px solid var(--line-2)',
              borderRadius: 100, padding: '4px 6px 4px 12px', fontSize: 12, color: 'var(--ink)',
            }}>
              {it}
              <button type="button" onClick={() => remove(idx)} aria-label="Remove"
                style={{ width: 16, height: 16, borderRadius: '50%', border: 'none', background: 'var(--line)', color: 'var(--ink)', cursor: 'pointer', fontSize: 11, lineHeight: '16px', textAlign: 'center', padding: 0 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={draft}
          placeholder={placeholder || 'Type and press Enter…'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          style={{ flex: 1, width: 'auto', minWidth: 0 }}
        />
        <button type="button" className="btn btn-sm btn-ghost" onClick={add}>Add</button>
      </div>
    </div>
  )
}

const repeaterMiniBtn = {
  width: 24, height: 24, borderRadius: 6, border: '1px solid var(--line-2)',
  background: 'var(--cream)', color: 'var(--ink-2)', cursor: 'pointer',
  fontSize: 13, lineHeight: 1, padding: 0,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}

// ── Repeating group of structured rows (e.g. how-to-use steps) → object[] ─────
function RepeaterField({ value = [], onChange, itemFields = [], addLabel = 'Add row' }) {
  const rows = Array.isArray(value) ? value : []
  const normalize = (row) => (typeof row === 'string' ? { body: row } : (row || {}))

  const update = (idx, subKey, subVal) =>
    onChange(rows.map((r, i) => (i === idx ? { ...normalize(r), [subKey]: subVal } : normalize(r))))
  const add = () =>
    onChange([...rows.map(normalize), Object.fromEntries(itemFields.map((f) => [f.key, '']))])
  const remove = (idx) => onChange(rows.filter((_, i) => i !== idx))
  const move = (idx, dir) => {
    const j = idx + dir
    if (j < 0 || j >= rows.length) return
    const next = rows.map(normalize)
    const tmp = next[idx]; next[idx] = next[j]; next[j] = tmp
    onChange(next)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((rawRow, idx) => {
        const row = normalize(rawRow)
        return (
          <div key={idx} style={{ border: '1px solid var(--line-2)', borderRadius: 8, padding: 12, background: 'var(--cream-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.08em' }}>#{idx + 1}</span>
              <div style={{ display: 'inline-flex', gap: 4 }}>
                <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up" style={repeaterMiniBtn}>↑</button>
                <button type="button" onClick={() => move(idx, 1)} disabled={idx === rows.length - 1} title="Move down" style={repeaterMiniBtn}>↓</button>
                <button type="button" onClick={() => remove(idx)} title="Remove" style={{ ...repeaterMiniBtn, color: '#d63031' }}>×</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {itemFields.map((sf) => (
                sf.type === 'textarea' ? (
                  <textarea key={sf.key} rows={2} placeholder={sf.label || sf.key}
                    value={row[sf.key] ?? ''} onChange={(e) => update(idx, sf.key, e.target.value)}
                    style={{ minHeight: 60 }} />
                ) : (
                  <input key={sf.key} type="text" placeholder={sf.label || sf.key}
                    value={row[sf.key] ?? ''} onChange={(e) => update(idx, sf.key, e.target.value)} />
                )
              ))}
            </div>
          </div>
        )
      })}
      <button type="button" className="btn btn-sm btn-ghost" onClick={add} style={{ alignSelf: 'flex-start' }}>
        + {addLabel}
      </button>
    </div>
  )
}

function FieldRow({ field, value, onChange }) {
  const { key, label, type, required, hint, placeholder, options, toggleLabel, min, step } = field

  if (type === 'rating') {
    return (
      <div className={`field${required ? ' required' : ''}`}>
        <label>{label}</label>
        <RatingField value={value || 0} onChange={(v) => onChange(key, v)} />
      </div>
    )
  }

  if (type === 'toggle') {
    return (
      <div className="field">
        <label>{label}</label>
        <label
          className={`toggle-field${value ? ' on' : ''}`}
          onClick={() => onChange(key, !value)}
          style={{ userSelect: 'none' }}
        >
          <span className="toggle-slot" />
          <span className="toggle-lbl">{toggleLabel || 'Enabled'}</span>
        </label>
      </div>
    )
  }

  if (type === 'image') {
    return (
      <div className="field">
        {label && <label>{label}</label>}
        <ImageUploadField value={value || ''} onChange={(url) => onChange(key, url)} />
      </div>
    )
  }

  if (type === 'images') {
    return (
      <div className="field">
        {label && <label>{label}</label>}
        <ImagesUploadField value={value || []} onChange={(urls) => onChange(key, urls)} />
      </div>
    )
  }

  if (type === 'select') {
    const opts = typeof options === 'function' ? options() : (options || [])
    return (
      <div className={`field${required ? ' required' : ''}`}>
        <label>{label}</label>
        <select value={value ?? ''} onChange={(e) => onChange(key, e.target.value)}>
          {opts.map((o) => {
            const v = typeof o === 'object' ? o.value : o
            const l = typeof o === 'object' ? o.label : o
            return <option key={v} value={v}>{l}</option>
          })}
        </select>
        {hint && <div className="hint">{hint}</div>}
      </div>
    )
  }

  if (type === 'searchable-select') {
    return (
      <div className={`field${required ? ' required' : ''}`}>
        <label>{label}</label>
        <SearchableSelect
          value={value}
          onChange={(v) => onChange(key, v)}
          placeholder={placeholder}
          loadOptions={field.loadOptions}
          options={field.options}
        />
        {hint && <div className="hint">{hint}</div>}
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div className={`field${required ? ' required' : ''}`}>
        {label && <label>{label}</label>}
        <textarea
          placeholder={placeholder || ''}
          required={required}
          value={value ?? ''}
          onChange={(e) => onChange(key, e.target.value)}
        />
        {hint && <div className="hint">{hint}</div>}
      </div>
    )
  }

  if (type === 'color') {
    return (
      <div className="field">
        <label>{label}</label>
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(key, e.target.value)} style={{ height: 42 }} />
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="field">
        {label && <label>{label}</label>}
        <ListField value={value || []} onChange={(v) => onChange(key, v)} placeholder={placeholder} />
        {hint && <div className="hint">{hint}</div>}
      </div>
    )
  }

  if (type === 'repeater') {
    return (
      <div className="field">
        {label && <label>{label}</label>}
        <RepeaterField
          value={value || []}
          onChange={(v) => onChange(key, v)}
          itemFields={field.itemFields}
          addLabel={field.addLabel}
        />
        {hint && <div className="hint">{hint}</div>}
      </div>
    )
  }

  return (
    <div className={`field${required ? ' required' : ''}`}>
      <label>{label}</label>
      <input
        type={type || 'text'}
        placeholder={placeholder || ''}
        required={required}
        value={value ?? ''}
        min={min}
        step={step}
        onChange={(e) => {
          const v = type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
          onChange(key, v)
        }}
      />
      {hint && <div className="hint">{hint}</div>}
    </div>
  )
}

export default function FormBuilder({ spec, initialData = {}, onChange }) {
  const [data, setData] = useState(() => {
    const d = {}
    const groups = Array.isArray(spec) && spec[0]?.fields ? spec : [{ cols: 2, fields: spec }]
    groups.forEach((g) => g.fields.forEach((f) => {
      d[f.key] = initialData[f.key] !== undefined ? initialData[f.key] : (f.default ?? (f.type === 'number' ? '' : f.type === 'images' ? [] : ''))
    }))
    return d
  })

  function handleChange(key, val) {
    const next = { ...data, [key]: val }
    setData(next)
    onChange?.(next)
  }

  const groups = Array.isArray(spec) && spec[0]?.fields ? spec : [{ columns: 2, fields: spec }]

  return (
    <div>
      {groups.map((g, gi) => {
        const cols = g.cols ?? g.columns ?? 2
        const cls = cols === 3 ? 'row-grid three' : cols === 1 ? '' : 'row-grid'
        const heading = g.group || g.title
        return (
          <div key={gi}>
            {heading && (
              <div style={{
                marginBottom: 10, marginTop: gi === 0 ? 0 : 18, paddingTop: gi === 0 ? 0 : 18,
                borderTop: gi === 0 ? 'none' : '1px solid var(--line-2)',
                fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'var(--muted)', fontWeight: 600
              }}>{heading}</div>
            )}
            <div className={cls}>
              {g.fields.map((f) => (
                <div
                  key={f.key}
                  className={f.span === 2 ? 'span-2' : f.span === 3 ? 'span-3' : ''}
                >
                  <FieldRow field={f} value={data[f.key]} onChange={handleChange} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function useFormData(spec, initialData = {}) {
  const groups = Array.isArray(spec) && spec[0]?.fields ? spec : [{ columns: 2, fields: spec }]
  const [data, setData] = useState(() => {
    const d = {}
    groups.forEach((g) => g.fields.forEach((f) => {
      d[f.key] = initialData[f.key] !== undefined ? initialData[f.key] : (f.default ?? (f.type === 'number' ? '' : ''))
    }))
    return d
  })
  const handleChange = (next) => setData(next)
  return [data, handleChange]
}
