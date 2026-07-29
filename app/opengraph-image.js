import { ImageResponse } from 'next/og'

export const alt = 'Densova — Advanced Herbal Hair Infusion'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', background: '#faf6ec', color: '#1f2814',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: 999, top: -260, right: -100, background: '#ede1cc' }} />
      <div style={{ position: 'absolute', width: 440, height: 440, borderRadius: 999, bottom: -250, left: -90, background: '#e8cb8a', opacity: 0.45 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 70 }}>
        <div style={{ fontSize: 25, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#8a6526', marginBottom: 32 }}>Botanical Hair Rituals</div>
        <div style={{ fontSize: 108, lineHeight: 1, letterSpacing: '-0.04em' }}>Densova</div>
        <div style={{ width: 150, height: 2, background: '#c9a24e', margin: '34px 0' }} />
        <div style={{ fontSize: 38, fontStyle: 'italic', color: '#3b4a28' }}>Advanced Herbal Hair Infusion</div>
      </div>
    </div>,
    size,
  )
}
