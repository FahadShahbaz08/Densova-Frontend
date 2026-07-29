import { useState, useEffect, useRef } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

// ── Image upload field (uses adminAPI.upload.image) ──────────────────────────
function ImageField({ label, value, onChange, hint }) {
  const [uploading, setUploading] = useState(false)
  const ref = useRef()

  const pick = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await adminAPI.upload.image(file)
      onChange(res.data.url)
    } catch { /* fail silently — admin will see no change */ }
    finally { setUploading(false); e.target.value = '' }
  }

  return (
    <div style={{ marginBottom: 14, marginTop: 14 }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 12, background: 'var(--cream-2)', border: '1px solid var(--line-2)', borderRadius: 8 }}>
        {value ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={value} alt="" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 6, background: '#fff', border: '1px solid var(--line-2)' }} />
            <button type="button" onClick={() => onChange('')} title="Remove"
              style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#d63031', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, lineHeight: '20px', textAlign: 'center', padding: 0 }}>×</button>
          </div>
        ) : (
          <div onClick={() => ref.current?.click()}
            style={{ width: 80, height: 80, borderRadius: 6, border: '2px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', flexShrink: 0, background: '#fff' }}>+</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => ref.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
          </button>
          {hint && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{hint}</div>}
          {value && (
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {value.split('/').pop()}
            </div>
          )}
        </div>
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={pick} />
    </div>
  )
}

// ── Re-usable bits ───────────────────────────────────────────────────────────
function Section({ title, sub, open, onToggle, children }) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 12 }}>
      <button onClick={onToggle}
        style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span>
          <span style={{ fontFamily: 'var(--f-serif)', fontSize: 16, fontWeight: 500, display: 'block' }}>{title}</span>
          {sub && <span style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 2 }}>{sub}</span>}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ width: 18, height: 18, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0, color: 'var(--muted)' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--line-2)' }}>{children}</div>}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', rows = 3, placeholder }) {
  return (
    <div style={{ marginBottom: 14, marginTop: 14 }}>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, fontWeight: 600 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea rows={rows} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--f-sans)', resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <input type={type} value={value || ''} placeholder={placeholder} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }} />
      )}
    </div>
  )
}

function Repeater({ items, fields, onChange, addLabel = '+ Add Item' }) {
  const add = () => onChange([...(items || []), Object.fromEntries(fields.map(f => [f.key, '']))])
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))
  const update = (i, key, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [key]: val } : item))
  return (
    <div>
      {(items || []).map((item, i) => (
        <div key={i} style={{ background: 'var(--cream-2)', border: '1px solid var(--line)', borderRadius: 8, padding: '14px 16px', marginBottom: 10, position: 'relative' }}>
          <button onClick={() => remove(i)} title="Remove"
            style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#d63031', fontSize: 16, lineHeight: 1, padding: 4 }}>×</button>
          <div style={{ display: 'grid', gridTemplateColumns: fields.length > 2 ? '1fr 1fr' : '1fr', gap: '0 16px' }}>
            {fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.span === 2 ? '1/-1' : undefined }}>
                {f.type === 'image' ? (
                  <ImageField label={f.label} value={item[f.key]} onChange={v => update(i, f.key, v)} hint={f.hint} />
                ) : (
                  <Field label={f.label} value={item[f.key]} onChange={v => update(i, f.key, v)} type={f.type || 'text'} rows={f.rows || 2} placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={add}>{addLabel}</button>
    </div>
  )
}

function StringListRepeater({ items, onChange, label = 'Item', addLabel = '+ Add Item' }) {
  const arr = Array.isArray(items) ? items : []
  return (
    <div>
      {arr.map((it, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <input value={it || ''} onChange={(e) => onChange(arr.map((v, idx) => idx === i ? e.target.value : v))}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}
            placeholder={`${label} ${i + 1}`} />
          <button onClick={() => onChange(arr.filter((_, idx) => idx !== i))} title="Remove"
            style={{ width: 32, height: 32, border: '1px solid var(--line-2)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}>×</button>
        </div>
      ))}
      <button className="btn btn-sm btn-ghost" onClick={() => onChange([...arr, ''])}>{addLabel}</button>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function parseSetting(val, def) {
  if (val === undefined || val === null || val === '') return def
  if (typeof val !== 'string') return val
  try { return JSON.parse(val) } catch { return def }
}

// ── Defaults (mirror frontend section defaults) ─────────────────────────────
const D = {
  hero: {
    eyebrow: 'Densova Apothecary · Est. 2024',
    headline_a: 'Botanicals,', headline_b: 'bottled in', headline_em: 'quiet ritual.',
    pillars: ['Strength', 'Growth', 'Repair'],
    description: '', cta_text: 'Shop the Collection', cta_link: '#shop',
    secondary_text: 'Discover the Ritual', secondary_link: '#feature',
    trust: [
      { value: '4.9 / 5', label: 'From 2,400+ reviews', stars: true },
      { value: '100%', label: 'Botanical formula' },
      { value: '250 ml', label: 'Hand-filled flacons' },
    ],
    video_tag: 'Live · The Densova Reel',
    video_title: 'Advanced Herbal Infusion',
    video_sub: '250 ml · Bestseller',
  },
  quote: { text: '', signed: '' },
  feature: {
    eyebrow: 'The Hero Ritual', headline_a: '', headline_em: '', body: '',
    points: [], cta_text: '',
    bottle_brand: 'Densova', bottle_tag: 'Herbal Apothecary',
    bottle_title_a: 'Advanced', bottle_title_em: 'Herbal', bottle_title_b: 'Hair Infusion',
    bottle_pillars: 'Strength · Growth · Repair', bottle_foot: '250 ML · 8.45 FL OZ',
  },
  collection: { eyebrow: '', headline_a: '', headline_em: '', sub: '' },
  ingredients_head: { eyebrow: '', headline_a: '', headline_em: '', sub: '' },
  howto_head: { eyebrow: '', headline_a: '', headline_em: '', sub: '' },
  purity: { eyebrow: '', headline_a: '', headline_em: '', badges: [] },
  results: {
    eyebrow: '', headline_a: '', headline_em: '', sub: '',
    card1_tag: 'Day 01 → Day 90', card1_title: 'For Women', card1_desc: '', card1_image: '',
    card2_tag: 'Day 01 → Day 90', card2_title: 'For Men',   card2_desc: '', card2_image: '',
    disclaimer: '',
  },
  newsletter: { headline_a: '', headline_em: '', description: '', placeholder: '', cta_text: '', note: '', success_msg: '' },
  faq_head: { eyebrow: '', headline_a: '', headline_em: '' },
  footer: {
    brand: 'Densova', philosophy: '',
    social: { instagram: '', tiktok: '', facebook: '', whatsapp: '' },
    columns: [],
    care_title: 'Care', care_email: '', care_phone: '', care_hours: '',
    copyright: '', made: '', legal: '',
  },
  navbar: { brand: 'Densova', links: [] },
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function AdminContentPage() {
  const { showToast } = useAdminUI()

  const [open, setOpen]   = useState('announce')
  const toggle = (k) => setOpen(o => o === k ? null : k)
  const [loaded, setLoaded]   = useState(false)
  const [saving, setSaving]   = useState(null)

  // Bar
  const [announce, setAnnounce]         = useState('')
  const [announceBg, setAnnounceBg]     = useState('#2E3A1F')
  const [announceColor, setAnnounceColor] = useState('#FAF6EC')
  // Sections
  const [navbar, setNavbar]       = useState(D.navbar)
  const [hero, setHero]           = useState(D.hero)
  const [marquee, setMarquee]     = useState([])
  const [feature, setFeature]     = useState(D.feature)
  const [collection, setCollection] = useState(D.collection)
  const [ingHead, setIngHead]     = useState(D.ingredients_head)
  const [ingredients, setIngredients] = useState([])
  const [quote, setQuote]         = useState(D.quote)
  const [howtoHead, setHowtoHead] = useState(D.howto_head)
  const [howTo, setHowTo]         = useState([])
  const [purity, setPurity]       = useState(D.purity)
  const [results, setResults]     = useState(D.results)
  const [newsletter, setNewsletter] = useState(D.newsletter)
  const [faqHead, setFaqHead]     = useState(D.faq_head)
  const [faq, setFaq]             = useState([])
  const [footer, setFooter]       = useState(D.footer)

  useEffect(() => {
    adminAPI.settings.list().then(res => {
      const all = res.data || []
      const get = (key, def) => parseSetting(all.find(s => s.key === key)?.value, def)
      const str = (key, def = '') => all.find(s => s.key === key)?.value ?? def
      setAnnounce(str('content_announce'))
      setAnnounceBg(str('content_announce_bg', '#2E3A1F'))
      setAnnounceColor(str('content_announce_color', '#FAF6EC'))
      setNavbar(get('content_navbar', D.navbar))
      setHero(get('content_hero', D.hero))
      setMarquee(get('content_marquee', []))
      setFeature(get('content_feature', D.feature))
      setCollection(get('content_collection', D.collection))
      setIngHead(get('content_ingredients_head', D.ingredients_head))
      setIngredients(get('content_ingredients', []))
      setQuote(get('content_quote', D.quote))
      setHowtoHead(get('content_howto_head', D.howto_head))
      setHowTo(get('content_howto', []))
      setPurity(get('content_purity', D.purity))
      setResults(get('content_results', D.results))
      setNewsletter(get('content_newsletter', D.newsletter))
      setFaqHead(get('content_faq_head', D.faq_head))
      setFaq(get('content_faq', []))
      setFooter(get('content_footer', D.footer))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const save = async (key, value, label) => {
    setSaving(key)
    try {
      const val = typeof value === 'string' ? value : JSON.stringify(value)
      await adminAPI.settings.save(key, val, 'content')
      showToast(`${label} saved`)
    } catch {
      showToast(`Failed to save ${label}`)
    } finally {
      setSaving(null)
    }
  }

  const SaveBtn = ({ k, v, label }) => (
    <button className="btn btn-gold" style={{ marginTop: 14, padding: '8px 14px', fontSize: 12 }}
      disabled={saving === k} onClick={() => save(k, v, label)}>
      {saving === k ? 'Saving…' : `Save ${label}`}
    </button>
  )

  if (!loaded) return <div className="view" style={{ padding: 40, color: 'var(--muted)' }}>Loading…</div>

  return (
    <div className="view">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: '0 0 4px', letterSpacing: '-0.01em' }}>Content Editor</h2>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Edit every section of the storefront. Empty fields fall back to defaults.</div>
      </div>

      {/* ── Announcement Bar ─────────────────────────────────────────────── */}
      <Section title="Announcement Bar" sub="Top marquee strip · use · separator for multiple items, or paste JSON array"
        open={open === 'announce'} onToggle={() => toggle('announce')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: 12 }}>
          <Field label="Announcement Items (use · separator)" value={Array.isArray(announce) ? announce.join(' · ') : announce} onChange={setAnnounce} />
          <div>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Background</label>
            <input type="color" value={announceBg} onChange={e => setAnnounceBg(e.target.value)}
              style={{ width: '100%', height: 40, border: '1px solid var(--line)', borderRadius: 6, padding: 4, cursor: 'pointer' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Text Color</label>
            <input type="color" value={announceColor} onChange={e => setAnnounceColor(e.target.value)}
              style={{ width: '100%', height: 40, border: '1px solid var(--line)', borderRadius: 6, padding: 4, cursor: 'pointer' }} />
          </div>
        </div>
        <button className="btn btn-gold" style={{ marginTop: 14, padding: '8px 14px', fontSize: 12 }} disabled={saving === 'ann'} onClick={async () => {
          setSaving('ann')
          try {
            await Promise.all([
              adminAPI.settings.save('content_announce', typeof announce === 'string' ? announce : JSON.stringify(announce), 'content'),
              adminAPI.settings.save('content_announce_bg', announceBg, 'content'),
              adminAPI.settings.save('content_announce_color', announceColor, 'content'),
            ])
            showToast('Announcement saved')
          } catch { showToast('Failed') } finally { setSaving(null) }
        }}>{saving === 'ann' ? 'Saving…' : 'Save Announcement'}</button>
      </Section>

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <Section title="Navbar" sub="Brand name and top navigation links"
        open={open === 'navbar'} onToggle={() => toggle('navbar')}>
        <Field label="Brand Name" value={navbar.brand} onChange={v => setNavbar(n => ({ ...n, brand: v }))} />
        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Navigation Links</label>
        <Repeater items={navbar.links || []} onChange={v => setNavbar(n => ({ ...n, links: v }))}
          fields={[{ key: 'label', label: 'Label' }, { key: 'url', label: 'URL/Anchor', placeholder: '#shop' }]}
          addLabel="+ Add Link" />
        <SaveBtn k="content_navbar" v={navbar} label="Navbar" />
      </Section>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <Section title="Hero Section" sub="The big landing block — eyebrow, headline, video, trust badges"
        open={open === 'hero'} onToggle={() => toggle('hero')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={hero.eyebrow} onChange={v => setHero(h => ({ ...h, eyebrow: v }))} />
          <Field label="Headline Line 1" value={hero.headline_a} onChange={v => setHero(h => ({ ...h, headline_a: v }))} />
          <Field label="Headline Line 2 (start)" value={hero.headline_b} onChange={v => setHero(h => ({ ...h, headline_b: v }))} />
          <Field label="Headline Line 2 (italic part)" value={hero.headline_em} onChange={v => setHero(h => ({ ...h, headline_em: v }))} />
          <Field label="Description" value={hero.description} onChange={v => setHero(h => ({ ...h, description: v }))} type="textarea" />
          <div />
          <Field label="Primary CTA Text" value={hero.cta_text} onChange={v => setHero(h => ({ ...h, cta_text: v }))} />
          <Field label="Primary CTA Link" value={hero.cta_link} onChange={v => setHero(h => ({ ...h, cta_link: v }))} />
          <Field label="Secondary CTA Text" value={hero.secondary_text} onChange={v => setHero(h => ({ ...h, secondary_text: v }))} />
          <Field label="Secondary CTA Link" value={hero.secondary_link} onChange={v => setHero(h => ({ ...h, secondary_link: v }))} />
        </div>

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Pillars (small badges below headline)</label>
        <StringListRepeater items={hero.pillars} onChange={v => setHero(h => ({ ...h, pillars: v }))} label="Pillar" addLabel="+ Add Pillar" />

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 20, fontWeight: 600 }}>Trust Badges (3 items by default)</label>
        <Repeater items={hero.trust || []} onChange={v => setHero(h => ({ ...h, trust: v }))}
          fields={[{ key: 'value', label: 'Value (e.g. 4.9/5)' }, { key: 'label', label: 'Label (e.g. From 2,400+ reviews)' }, { key: 'stars', label: 'Show stars? (true/false)', span: 2 }]}
          addLabel="+ Add Badge" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', marginTop: 14 }}>
          <Field label="Video Tag (small overlay)" value={hero.video_tag} onChange={v => setHero(h => ({ ...h, video_tag: v }))} />
          <div />
          <Field label="Video Meta Title" value={hero.video_title} onChange={v => setHero(h => ({ ...h, video_title: v }))} />
          <Field label="Video Meta Subtitle" value={hero.video_sub} onChange={v => setHero(h => ({ ...h, video_sub: v }))} />
        </div>
        <SaveBtn k="content_hero" v={hero} label="Hero" />
      </Section>

      {/* ── Marquee Band ────────────────────────────────────────────────── */}
      <Section title="Marquee Band" sub="Scrolling decorative text below the hero"
        open={open === 'marquee'} onToggle={() => toggle('marquee')}>
        <StringListRepeater items={marquee} onChange={setMarquee} label="Word" addLabel="+ Add Word" />
        <SaveBtn k="content_marquee" v={marquee} label="Marquee" />
      </Section>

      {/* ── Feature ─────────────────────────────────────────────────────── */}
      <Section title="Feature Section (The Hero Ritual)" sub="The product feature block with 4 benefit points"
        open={open === 'feature'} onToggle={() => toggle('feature')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={feature.eyebrow} onChange={v => setFeature(f => ({ ...f, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={feature.headline_a} onChange={v => setFeature(f => ({ ...f, headline_a: v }))} />
          <Field label="Headline (italic)" value={feature.headline_em} onChange={v => setFeature(f => ({ ...f, headline_em: v }))} />
        </div>
        <Field label="Body Paragraph" value={feature.body} onChange={v => setFeature(f => ({ ...f, body: v }))} type="textarea" />

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Benefit Points</label>
        <Repeater items={feature.points || []} onChange={v => setFeature(f => ({ ...f, points: v }))}
          fields={[{ key: 'title', label: 'Title' }, { key: 'sub', label: 'Description' }]}
          addLabel="+ Add Point" />

        <Field label="Add to Cart Button Text" value={feature.cta_text} onChange={v => setFeature(f => ({ ...f, cta_text: v }))} />

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Bottle Visual (decorative card next to text)</label>

        <ImageField
          label="Product Image (real photo)"
          value={feature.bottle_image}
          onChange={v => setFeature(f => ({ ...f, bottle_image: v }))}
          hint="Upload an image to replace the CSS bottle. Leave empty to keep the styled CSS bottle. The float animation works in both modes."
        />

        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, marginBottom: 10, padding: '8px 12px', background: 'var(--cream-2)', borderRadius: 6, border: '1px dashed var(--line-2)' }}>
          The fields below are only used when no image is uploaded above (CSS bottle fallback).
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px', opacity: feature.bottle_image ? 0.55 : 1 }}>
          <Field label="Bottle Brand" value={feature.bottle_brand} onChange={v => setFeature(f => ({ ...f, bottle_brand: v }))} />
          <Field label="Bottle Tag Line" value={feature.bottle_tag} onChange={v => setFeature(f => ({ ...f, bottle_tag: v }))} />
          <Field label="Bottle Title (line 1)" value={feature.bottle_title_a} onChange={v => setFeature(f => ({ ...f, bottle_title_a: v }))} />
          <Field label="Bottle Title (italic word)" value={feature.bottle_title_em} onChange={v => setFeature(f => ({ ...f, bottle_title_em: v }))} />
          <Field label="Bottle Title (line 2)" value={feature.bottle_title_b} onChange={v => setFeature(f => ({ ...f, bottle_title_b: v }))} />
          <Field label="Bottle Pillars Line" value={feature.bottle_pillars} onChange={v => setFeature(f => ({ ...f, bottle_pillars: v }))} />
          <Field label="Bottle Footer (size)" value={feature.bottle_foot} onChange={v => setFeature(f => ({ ...f, bottle_foot: v }))} />
        </div>
        <SaveBtn k="content_feature" v={feature} label="Feature" />
      </Section>

      {/* ── Collection Heading ───────────────────────────────────────────── */}
      <Section title="Collection Section" sub="Heading above the products grid (products are managed in Catalog)"
        open={open === 'collection'} onToggle={() => toggle('collection')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={collection.eyebrow} onChange={v => setCollection(c => ({ ...c, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={collection.headline_a} onChange={v => setCollection(c => ({ ...c, headline_a: v }))} />
          <Field label="Headline (italic)" value={collection.headline_em} onChange={v => setCollection(c => ({ ...c, headline_em: v }))} />
        </div>
        <Field label="Subtitle" value={collection.sub} onChange={v => setCollection(c => ({ ...c, sub: v }))} type="textarea" />
        <SaveBtn k="content_collection" v={collection} label="Collection" />
      </Section>

      {/* ── Ingredients ─────────────────────────────────────────────────── */}
      <Section title="Ingredients Section Heading" sub="Heading above the herbs list"
        open={open === 'ingredients_head'} onToggle={() => toggle('ingredients_head')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={ingHead.eyebrow} onChange={v => setIngHead(h => ({ ...h, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={ingHead.headline_a} onChange={v => setIngHead(h => ({ ...h, headline_a: v }))} />
          <Field label="Headline (italic)" value={ingHead.headline_em} onChange={v => setIngHead(h => ({ ...h, headline_em: v }))} />
        </div>
        <Field label="Subtitle" value={ingHead.sub} onChange={v => setIngHead(h => ({ ...h, sub: v }))} type="textarea" />
        <SaveBtn k="content_ingredients_head" v={ingHead} label="Ingredients Heading" />
      </Section>

      <Section title="Ingredients List" sub="The 8 botanicals (or any number) — leave image empty to use the built-in icon matching the herb name"
        open={open === 'ingredients'} onToggle={() => toggle('ingredients')}>
        <Repeater items={ingredients} onChange={setIngredients}
          fields={[
            { key: 'name',      label: 'Herb Name' },
            { key: 'latin',     label: 'Latin Name' },
            { key: 'desc',      label: 'Description', type: 'textarea', span: 2, rows: 2 },
            { key: 'image_url', label: 'Custom Photo (optional)', type: 'image', span: 2, hint: 'Upload a real photo of the herb to replace the built-in icon. Leave empty for the auto-matched icon (Amla/Reetha/Shikakai/Rosemary/Aloe Vera/Hibiscus/Fenugreek/Nigella Sativa).' },
          ]}
          addLabel="+ Add Ingredient" />
        <SaveBtn k="content_ingredients" v={ingredients} label="Ingredients" />
      </Section>

      {/* ── Quote ───────────────────────────────────────────────────────── */}
      <Section title="Quote Band" sub="Italic editorial quote between sections"
        open={open === 'quote'} onToggle={() => toggle('quote')}>
        <Field label="Quote Text" value={quote.text} onChange={v => setQuote(q => ({ ...q, text: v }))} type="textarea" />
        <Field label="Signed" value={quote.signed} onChange={v => setQuote(q => ({ ...q, signed: v }))} />
        <SaveBtn k="content_quote" v={quote} label="Quote" />
      </Section>

      {/* ── How To Use ──────────────────────────────────────────────────── */}
      <Section title="How To Use — Heading" sub="Heading above the method cards"
        open={open === 'howto_head'} onToggle={() => toggle('howto_head')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={howtoHead.eyebrow} onChange={v => setHowtoHead(h => ({ ...h, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={howtoHead.headline_a} onChange={v => setHowtoHead(h => ({ ...h, headline_a: v }))} />
          <Field label="Headline (italic)" value={howtoHead.headline_em} onChange={v => setHowtoHead(h => ({ ...h, headline_em: v }))} />
        </div>
        <Field label="Subtitle" value={howtoHead.sub} onChange={v => setHowtoHead(h => ({ ...h, sub: v }))} type="textarea" />
        <SaveBtn k="content_howto_head" v={howtoHead} label="How-To Heading" />
      </Section>

      <Section title="How To Use — Method Cards" sub="Steps formatted as one per line in the Steps field"
        open={open === 'howto'} onToggle={() => toggle('howto')}>
        <Repeater items={howTo} onChange={setHowTo}
          fields={[
            { key: 'num', label: 'Number (01, 02 etc.)' },
            { key: 'title', label: 'Title' },
            { key: 'sub', label: 'Subtitle' },
            { key: 'steps', label: 'Steps (one per line)', type: 'textarea', span: 2, rows: 4 },
          ]}
          addLabel="+ Add Method Card" />
        <SaveBtn k="content_howto" v={howTo} label="How-To Cards" />
      </Section>

      {/* ── Purity ──────────────────────────────────────────────────────── */}
      <Section title="Purity Section (The Densova Standard)" sub="The 5 'free of' badges"
        open={open === 'purity'} onToggle={() => toggle('purity')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={purity.eyebrow} onChange={v => setPurity(p => ({ ...p, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={purity.headline_a} onChange={v => setPurity(p => ({ ...p, headline_a: v }))} />
          <Field label="Headline (italic)" value={purity.headline_em} onChange={v => setPurity(p => ({ ...p, headline_em: v }))} />
        </div>
        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Badges</label>
        <StringListRepeater items={purity.badges} onChange={v => setPurity(p => ({ ...p, badges: v }))} label="Badge" addLabel="+ Add Badge" />
        <SaveBtn k="content_purity" v={purity} label="Purity" />
      </Section>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <Section title="Results Section (Before & After)" sub="Day 1 / Day 90 study cards"
        open={open === 'results'} onToggle={() => toggle('results')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={results.eyebrow} onChange={v => setResults(r => ({ ...r, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={results.headline_a} onChange={v => setResults(r => ({ ...r, headline_a: v }))} />
          <Field label="Headline (italic)" value={results.headline_em} onChange={v => setResults(r => ({ ...r, headline_em: v }))} />
        </div>
        <Field label="Subtitle" value={results.sub} onChange={v => setResults(r => ({ ...r, sub: v }))} type="textarea" />

        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, marginBottom: 14, padding: '10px 12px', background: 'var(--cream-2)', borderRadius: 6, border: '1px dashed var(--line-2)' }}>
          Each card displays one combined "before & after" transformation image (women + men recommended). Upload one full collage per card.
        </div>

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Card 1 (e.g. Women's transformation)</label>
        <ImageField
          label="Card 1 Photo (full before+after collage)"
          value={results.card1_image}
          onChange={v => setResults(r => ({ ...r, card1_image: v }))}
          hint="Upload one landscape image showing the full transformation side-by-side."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
          <Field label="Tag (e.g. Day 01 → Day 90)" value={results.card1_tag}   onChange={v => setResults(r => ({ ...r, card1_tag: v }))} />
          <Field label="Title (e.g. For Women)"     value={results.card1_title} onChange={v => setResults(r => ({ ...r, card1_title: v }))} />
          <Field label="Description"                value={results.card1_desc}  onChange={v => setResults(r => ({ ...r, card1_desc: v }))} />
        </div>

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 18, fontWeight: 600 }}>Card 2 (e.g. Men's transformation)</label>
        <ImageField
          label="Card 2 Photo (full before+after collage)"
          value={results.card2_image}
          onChange={v => setResults(r => ({ ...r, card2_image: v }))}
          hint="Upload one landscape image showing the full transformation side-by-side."
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
          <Field label="Tag (e.g. Day 01 → Day 90)" value={results.card2_tag}   onChange={v => setResults(r => ({ ...r, card2_tag: v }))} />
          <Field label="Title (e.g. For Men)"       value={results.card2_title} onChange={v => setResults(r => ({ ...r, card2_title: v }))} />
          <Field label="Description"                value={results.card2_desc}  onChange={v => setResults(r => ({ ...r, card2_desc: v }))} />
        </div>

        <Field label="Disclaimer (small text below)" value={results.disclaimer} onChange={v => setResults(r => ({ ...r, disclaimer: v }))} type="textarea" />
        <SaveBtn k="content_results" v={results} label="Results" />
      </Section>

      {/* ── Newsletter ──────────────────────────────────────────────────── */}
      <Section title="Newsletter Block (Letters from the Apothecary)" sub="Email signup section"
        open={open === 'newsletter'} onToggle={() => toggle('newsletter')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Headline (start)" value={newsletter.headline_a} onChange={v => setNewsletter(n => ({ ...n, headline_a: v }))} />
          <Field label="Headline (italic)" value={newsletter.headline_em} onChange={v => setNewsletter(n => ({ ...n, headline_em: v }))} />
        </div>
        <Field label="Description" value={newsletter.description} onChange={v => setNewsletter(n => ({ ...n, description: v }))} type="textarea" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Input Placeholder" value={newsletter.placeholder} onChange={v => setNewsletter(n => ({ ...n, placeholder: v }))} />
          <Field label="Subscribe Button Text" value={newsletter.cta_text} onChange={v => setNewsletter(n => ({ ...n, cta_text: v }))} />
        </div>
        <Field label="Footnote (e.g. 'No spam. Unsubscribe anytime.')" value={newsletter.note} onChange={v => setNewsletter(n => ({ ...n, note: v }))} />
        <Field label="Success Message" value={newsletter.success_msg} onChange={v => setNewsletter(n => ({ ...n, success_msg: v }))} />
        <SaveBtn k="content_newsletter" v={newsletter} label="Newsletter" />
      </Section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <Section title="FAQ — Heading" sub="Heading above the FAQ accordion"
        open={open === 'faq_head'} onToggle={() => toggle('faq_head')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Eyebrow" value={faqHead.eyebrow} onChange={v => setFaqHead(h => ({ ...h, eyebrow: v }))} />
          <div />
          <Field label="Headline (start)" value={faqHead.headline_a} onChange={v => setFaqHead(h => ({ ...h, headline_a: v }))} />
          <Field label="Headline (italic)" value={faqHead.headline_em} onChange={v => setFaqHead(h => ({ ...h, headline_em: v }))} />
        </div>
        <SaveBtn k="content_faq_head" v={faqHead} label="FAQ Heading" />
      </Section>

      <Section title="FAQ — Questions" sub="Accordion items"
        open={open === 'faq'} onToggle={() => toggle('faq')}>
        <Repeater items={faq} onChange={setFaq}
          fields={[{ key: 'q', label: 'Question', span: 2 }, { key: 'a', label: 'Answer', type: 'textarea', span: 2, rows: 3 }]}
          addLabel="+ Add FAQ" />
        <SaveBtn k="content_faq" v={faq} label="FAQ" />
      </Section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Section title="Footer" sub="Brand, philosophy, social, columns, contact, copyright"
        open={open === 'footer'} onToggle={() => toggle('footer')}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Brand" value={footer.brand} onChange={v => setFooter(f => ({ ...f, brand: v }))} />
        </div>
        <Field label="Philosophy Quote" value={footer.philosophy} onChange={v => setFooter(f => ({ ...f, philosophy: v }))} type="textarea" />

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 14, fontWeight: 600 }}>Social URLs</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Instagram" value={footer.social?.instagram} onChange={v => setFooter(f => ({ ...f, social: { ...(f.social || {}), instagram: v } }))} />
          <Field label="TikTok"    value={footer.social?.tiktok}    onChange={v => setFooter(f => ({ ...f, social: { ...(f.social || {}), tiktok: v } }))} />
          <Field label="Facebook"  value={footer.social?.facebook}  onChange={v => setFooter(f => ({ ...f, social: { ...(f.social || {}), facebook: v } }))} />
          <Field label="WhatsApp"  value={footer.social?.whatsapp}  onChange={v => setFooter(f => ({ ...f, social: { ...(f.social || {}), whatsapp: v } }))} />
        </div>

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 18, fontWeight: 600 }}>Footer Columns</label>
        <Repeater items={footer.columns || []} onChange={v => setFooter(f => ({ ...f, columns: v }))}
          fields={[
            { key: 'title', label: 'Column Title' },
            { key: 'links', label: 'Links (JSON: [{"label":"Shop","url":"#shop"}, ...])', type: 'textarea', span: 2, rows: 4 },
          ]}
          addLabel="+ Add Column" />

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 18, fontWeight: 600 }}>Care Column</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <Field label="Care Title" value={footer.care_title} onChange={v => setFooter(f => ({ ...f, care_title: v }))} />
          <Field label="Email"       value={footer.care_email} onChange={v => setFooter(f => ({ ...f, care_email: v }))} />
          <Field label="Phone"       value={footer.care_phone} onChange={v => setFooter(f => ({ ...f, care_phone: v }))} />
          <Field label="Hours"       value={footer.care_hours} onChange={v => setFooter(f => ({ ...f, care_hours: v }))} />
        </div>

        <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6, marginTop: 18, fontWeight: 600 }}>Bottom Bar</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px' }}>
          <Field label="Copyright" value={footer.copyright} onChange={v => setFooter(f => ({ ...f, copyright: v }))} />
          <Field label="Made (center)" value={footer.made} onChange={v => setFooter(f => ({ ...f, made: v }))} />
          <Field label="Legal Links" value={footer.legal} onChange={v => setFooter(f => ({ ...f, legal: v }))} />
        </div>
        <SaveBtn k="content_footer" v={footer} label="Footer" />
      </Section>
    </div>
  )
}
