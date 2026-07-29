import { useState, useEffect } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const COLOR_LABELS = {
  forest: 'Forest (primary)',
  cream:  'Cream (background)',
  gold:   'Gold (accent)',
  beige:  'Beige (secondary)',
  moss:   'Moss (success)',
  ink:    'Ink (text)',
}

const DISPLAY_FONTS = ['Fraunces', 'Cormorant Garamond', 'Playfair Display', 'EB Garamond', 'Libre Baskerville']
const BODY_FONTS    = ['Inter', 'DM Sans', 'Plus Jakarta Sans', 'Lato', 'Source Sans 3']

const DEFAULT_COLORS = { forest: '#2E3A1F', cream: '#FAF6EC', gold: '#C9A24E', beige: '#E8D5BB', moss: '#3E8B5E', ink: '#1B1A15' }
const DEFAULT_FONTS  = { display: 'Fraunces', body: 'Inter' }

function parseSetting(val, def) {
  if (!val) return def
  try { return JSON.parse(val) } catch { return def }
}

export default function AdminAppearancePage() {
  const { showToast, confirmAction } = useAdminUI()

  const [loaded, setLoaded]             = useState(false)
  const [saving, setSaving]             = useState(false)
  const [colors, setColors]             = useState(DEFAULT_COLORS)
  const [fonts, setFonts]               = useState(DEFAULT_FONTS)
  const [announceBg, setAnnounceBg]     = useState('#2E3A1F')
  const [announceColor, setAnnounceColor] = useState('#FAF6EC')

  useEffect(() => {
    adminAPI.settings.list().then(res => {
      const all = res.data || []
      const get = (key, def) => parseSetting(all.find(s => s.key === key)?.value, def)
      const str = (key, def = '') => all.find(s => s.key === key)?.value ?? def
      setColors(get('appearance_colors', DEFAULT_COLORS))
      setFonts(get('appearance_fonts', DEFAULT_FONTS))
      setAnnounceBg(str('content_announce_bg', '#2E3A1F'))
      setAnnounceColor(str('content_announce_color', '#FAF6EC'))
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        adminAPI.settings.save('appearance_colors', JSON.stringify(colors), 'appearance'),
        adminAPI.settings.save('appearance_fonts',  JSON.stringify(fonts),  'appearance'),
        adminAPI.settings.save('content_announce_bg',    announceBg,    'content'),
        adminAPI.settings.save('content_announce_color', announceColor, 'content'),
      ])
      showToast('Appearance saved')
    } catch {
      showToast('Failed to save appearance')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    confirmAction('Reset Appearance', 'Reset all appearance settings to defaults?', () => {
      setColors(DEFAULT_COLORS)
      setFonts(DEFAULT_FONTS)
      showToast('Appearance reset to defaults')
    })
  }

  if (!loaded) return <div className="view" style={{ padding: 40, color: 'var(--muted)' }}>Loading…</div>

  return (
    <div className="view">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 4px' }}>Appearance</h2>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Brand colors, fonts, and announcement bar</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleReset}>Reset</button>
          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-head"><h3>Brand Colors</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(colors).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: val, border: '1px solid var(--line)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{COLOR_LABELS[key] || key}</div>
                    <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--muted)' }}>{val}</div>
                  </div>
                </div>
                <input type="color" value={val}
                  onChange={e => setColors(c => ({ ...c, [key]: e.target.value }))}
                  style={{ width: 40, height: 36, border: '1px solid var(--line)', borderRadius: 6, padding: 3, cursor: 'pointer' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-head"><h3>Typography</h3></div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Display / Headings</label>
              <select value={fonts.display} onChange={e => setFonts(f => ({ ...f, display: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}>
                {DISPLAY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div style={{ marginTop: 8, fontFamily: fonts.display, fontSize: 22, color: 'var(--ink)', lineHeight: 1.3 }}>
                Slow rituals, returned.
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Body / UI Text</label>
              <select value={fonts.body} onChange={e => setFonts(f => ({ ...f, body: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13 }}>
                {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <div style={{ marginTop: 8, fontFamily: fonts.body, fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
                Botanicals, bottled in quiet ritual.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Announcement Bar</h3></div>
            <div style={{ padding: 16, borderRadius: 8, background: announceBg, color: announceColor, textAlign: 'center', fontSize: 13, marginBottom: 16 }}>
              Preview announcement text
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Background</label>
                <input type="color" value={announceBg} onChange={e => setAnnounceBg(e.target.value)}
                  style={{ width: '100%', height: 40, border: '1px solid var(--line)', borderRadius: 6, padding: 4, cursor: 'pointer' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Text Color</label>
                <input type="color" value={announceColor} onChange={e => setAnnounceColor(e.target.value)}
                  style={{ width: '100%', height: 40, border: '1px solid var(--line)', borderRadius: 6, padding: 4, cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
