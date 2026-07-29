import { useContent } from '../../hooks/useContent'

const DEFAULT_ITEMS = [
  'Free Shipping over Rs 5,000',
  '30-Day Ritual Promise',
  'Hand-blended in small batches',
]

export default function AnnouncementBar() {
  // Either a JSON array (multi-item marquee) OR a single string
  const raw   = useContent('content_announce', DEFAULT_ITEMS)
  const bg    = useContent('content_announce_bg', '#2E3A1F')
  const color = useContent('content_announce_color', '#FAF6EC')
  const items = Array.isArray(raw)
    ? raw
    : (typeof raw === 'string' && raw.trim() ? raw.split('·').map(s => s.trim()).filter(Boolean) : DEFAULT_ITEMS)

  return (
    <div className="announce" id="announceBar" style={{ background: bg, color }}>
      <div className="announce-track">
        {items.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  )
}
