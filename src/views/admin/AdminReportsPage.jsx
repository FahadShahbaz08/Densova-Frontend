import { useRef, useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

function LineChart({ data, labels, height = 140 }) {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !data?.length) return
    const ctx = canvas.getContext('2d')
    const W = canvas.offsetWidth * window.devicePixelRatio
    const H = height * window.devicePixelRatio
    canvas.width = W; canvas.height = H
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    const w = canvas.offsetWidth, h = height
    const max = Math.max(...data, 1)
    const pad = { t: 16, b: 28, l: 10, r: 10 }
    const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b
    const step = cw / (data.length - 1)
    ctx.clearRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(46,58,31,0.06)'; ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ch - (i / 4) * ch
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke()
    }
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = pad.l + i * step, y = pad.t + ch - (v / max) * ch
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    const lx = pad.l + (data.length - 1) * step
    ctx.lineTo(lx, pad.t + ch); ctx.lineTo(pad.l, pad.t + ch); ctx.closePath()
    const grad = ctx.createLinearGradient(0, pad.t, 0, pad.t + ch)
    grad.addColorStop(0, 'rgba(201,162,78,0.16)'); grad.addColorStop(1, 'rgba(201,162,78,0)')
    ctx.fillStyle = grad; ctx.fill()
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = pad.l + i * step, y = pad.t + ch - (v / max) * ch
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#C9A24E'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke()
    if (labels?.length) {
      ctx.fillStyle = 'rgba(110,106,93,0.7)'
      ctx.font = `${10 * window.devicePixelRatio}px Inter`
      const every = Math.ceil(data.length / 6)
      labels.forEach((lbl, i) => {
        if (i % every !== 0 && i !== labels.length - 1) return
        const x = pad.l + i * step
        ctx.textAlign = i === 0 ? 'left' : i === labels.length - 1 ? 'right' : 'center'
        ctx.fillText(lbl.slice(5), x, h - 4)
      })
    }
  }, [data, labels, height])
  return <canvas ref={ref} style={{ width: '100%', height }} />
}

function DonutChart({ data, colors }) {
  const ref = useRef()
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const S = 180; canvas.width = S; canvas.height = S
    const cx = S / 2, cy = S / 2, r = 70, ir = 46
    const total = data.reduce((a, b) => a + b, 0) || 1
    ctx.clearRect(0, 0, S, S)
    let start = -Math.PI / 2
    data.forEach((v, i) => {
      const angle = (v / total) * 2 * Math.PI
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, start + angle); ctx.closePath()
      ctx.fillStyle = colors[i]; ctx.fill()
      start += angle
    })
    ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2)
    ctx.fillStyle = '#FAF6EC'; ctx.fill()
  }, [data, colors])
  return <canvas ref={ref} style={{ width: 120, height: 120 }} />
}

export default function AdminReportsPage() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView]     = useState('chart')

  useEffect(() => {
    adminAPI.dashboard.stats().then(res => {
      setStats(res.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="view" style={{ padding: 40, color: 'var(--muted)' }}>Loading…</div>
  if (!stats)  return <div className="view" style={{ padding: 40, color: 'var(--muted)' }}>Could not load reports.</div>

  const trend = stats.revenue_trend || []
  const labels = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i))
    return d.toISOString().slice(0, 10)
  })

  const donutData   = [
    stats.orders?.delivered || 0, stats.orders?.shipped || 0,
    stats.orders?.pending || 0,   stats.orders?.cancelled || 0,
  ]
  const donutColors = ['#3E8B5E', '#3B6F90', '#C68A2B', '#B14A3C']
  const donutLabels = ['Delivered', 'Shipped', 'Pending', 'Cancelled']

  return (
    <div className="view">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 4px' }}>Reports</h2>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Sales performance and analytics</div>
        </div>
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
          {['chart', 'table'].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding: '8px 16px', border: 'none', background: view === v ? 'var(--forest)' : 'transparent', color: view === v ? 'var(--cream)' : 'var(--muted)', fontSize: 12, cursor: 'pointer', textTransform: 'capitalize' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Revenue',   value: fmt(stats.orders?.revenue || 0)  },
          { label: 'Total Orders',    value: stats.orders?.total || 0          },
          { label: 'Active Products', value: stats.products?.active || 0       },
          { label: 'Total Customers', value: stats.customers || 0              },
        ].map(({ label, value }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: 'var(--f-serif)', fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em' }}>{value}</div>
          </div>
        ))}
      </div>

      {view === 'chart' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div className="card">
            <div className="card-head"><h3>Revenue (last 30 days)</h3></div>
            <LineChart data={trend} labels={labels} height={160} />
          </div>
          <div className="card">
            <div className="card-head"><h3>Order Status</h3></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
              <DonutChart data={donutData} colors={donutColors} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {donutLabels.map((lbl, i) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: donutColors[i], flexShrink: 0 }} />
                    <span style={{ color: 'var(--muted)' }}>{lbl}</span>
                    <span style={{ fontWeight: 600, marginLeft: 'auto' }}>{donutData[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card" style={{ gridColumn: '1/-1' }}>
            <div className="card-head"><h3>Quick stats</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { label: 'Low stock products',  value: stats.products?.low_stock || 0, warn: (stats.products?.low_stock || 0) > 0 },
                { label: 'Pending reviews',      value: stats.reviews?.pending || 0,    warn: (stats.reviews?.pending || 0) > 0   },
                { label: 'Newsletter subs',      value: stats.subscribers || 0,         warn: false                                },
              ].map(({ label, value, warn }) => (
                <div key={label} style={{ padding: '16px', background: 'var(--cream-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--f-serif)', fontSize: 28, fontWeight: 400, color: warn ? 'var(--warn)' : 'var(--forest)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="tbl-wrap card" style={{ padding: 0 }}>
          <table className="tbl">
            <thead>
              <tr><th>Date</th><th>Revenue</th></tr>
            </thead>
            <tbody>
              {trend.map((rev, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{labels[i]}</td>
                  <td style={{ fontWeight: 500 }}>{fmt(rev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
