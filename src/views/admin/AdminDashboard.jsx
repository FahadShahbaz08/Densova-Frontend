import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from '../../router'
import { adminAPI } from '../../services/api'
import { useAdminUI } from '../../components/admin/AdminContext'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

function KpiCard({ label, value, sub, warn }) {
  return (
    <div className="card">
      <div style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: 'var(--f-serif)', fontSize: 34, fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: warn ? 'var(--warn)' : 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

function MiniChart({ data = [], color = '#C9A24E', height = 70 }) {
  const ref = useRef()

  const draw = useCallback(() => {
    const canvas = ref.current
    if (!canvas || data.length < 2) return
    const w = canvas.offsetWidth
    if (!w) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr; canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    const max = Math.max(...data, 1)
    const step = w / (data.length - 1)
    ctx.clearRect(0, 0, w, height)
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * step, y = height - (v / max) * (height - 6) - 3
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke()
    ctx.lineTo((data.length - 1) * step, height); ctx.lineTo(0, height); ctx.closePath()
    const grad = ctx.createLinearGradient(0, 0, 0, height)
    grad.addColorStop(0, color + '28'); grad.addColorStop(1, color + '00')
    ctx.fillStyle = grad; ctx.fill()
  }, [data, color, height])

  useEffect(() => {
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [draw])

  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null)
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  // eslint-disable-next-line no-unused-vars
  const { openDetail } = useAdminUI()

  useEffect(() => {
    const load = async () => {
      try {
        const s = await adminAPI.dashboard.stats()
        setStats(s.data)
      } catch (e) { console.error('Dashboard stats error:', e) }

      try {
        const o = await adminAPI.orders.list({ per_page: 8 })
        setOrders(o.data?.data || [])
      } catch { /* orders fail silently, table shows empty */ }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="view">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[0,1,2,3].map(i => <div key={i} className="card" style={{ height: 100, background: 'var(--cream-2)', animation: 'pulse 1.5s infinite' }} />)}
      </div>
    </div>
  )

  if (!stats) return (
    <div className="view">
      <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 15, marginBottom: 8 }}>Could not load dashboard statistics.</div>
        <div style={{ fontSize: 12 }}>Check that the backend is running and you are logged in as admin.</div>
      </div>
    </div>
  )

  const STATUS_PILL = {
    pending:   { cls: 'warn',    label: 'Unfulfilled'  },
    awaiting_payment: { cls: 'warn', label: 'Awaiting Pay' },
    confirmed: { cls: 'info',    label: 'Confirmed'    },
    shipped:   { cls: 'info',    label: 'Shipped'      },
    delivered: { cls: 'ok',      label: 'Delivered'    },
    cancelled: { cls: 'err',     label: 'Cancelled'    },
    refunded:  { cls: 'neutral', label: 'Refunded'     },
  }

  return (
    <div className="view">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard label="Total Revenue"    value={fmt(stats.orders?.revenue)}    sub="Lifetime (paid orders)" />
        <KpiCard label="Total Orders"     value={stats.orders?.total}            sub={`${stats.orders?.pending || 0} pending`} warn={stats.orders?.pending > 0} />
        <KpiCard label="Active Products"  value={stats.products?.active}         sub={`${stats.products?.low_stock || 0} low stock`} warn={stats.products?.low_stock > 0} />
        <KpiCard label="Reviews Pending"  value={stats.reviews?.pending || 0}    sub={`${stats.reviews?.total || 0} total reviews`} warn={stats.reviews?.pending > 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="card-head"><h3>Revenue trend</h3></div>
          <MiniChart data={stats.revenue_trend || []} color="#C9A24E" height={80} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            <span>30 days ago</span><span>Today</span>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>This month</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, marginTop: 4 }}>
            {[
              { label: 'New orders',         value: stats.orders?.this_month,  warn: false },
              { label: 'Products low stock',  value: stats.products?.low_stock, warn: stats.products?.low_stock > 0 },
              { label: 'Reviews awaiting',    value: stats.reviews?.pending,    warn: stats.reviews?.pending > 0 },
              { label: 'Newsletter subs',     value: stats.subscribers,         warn: false },
            ].map(({ label, value, warn }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line-2)' }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--f-serif)', fontSize: 20, fontWeight: 400, color: warn ? 'var(--warn)' : 'var(--forest)' }}>{value ?? 'Ã¢â‚¬â€'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Recent Orders</h3>
          {stats.orders?.pending > 0 && <span className="pill warn">{stats.orders.pending} pending</span>}
        </div>
        <div className="tbl-wrap" style={{ border: 'none', borderRadius: 0, background: 'transparent', marginTop: 4 }}>
          <table className="tbl">
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.length === 0
                ? <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>No orders yet</td></tr>
                : orders.map(o => {
                    const pill = STATUS_PILL[o.status] || { cls: 'neutral', label: o.status }
                    return (
                      <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${o.id}/view`)}>
                        <td style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>{o.order_number}</td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{o.customer_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.customer_phone || o.customer_email}</div>
                        </td>
                        <td style={{ fontWeight: 500 }}>{fmt(o.total)}</td>
                        <td style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{o.payment_method}</td>
                        <td><span className={`pill ${pill.cls}`}>{pill.label}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(o.created_at).toLocaleDateString('en-PK', { day:'2-digit', month:'short' })}</td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
