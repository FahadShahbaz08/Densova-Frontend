import { useState, useEffect, useCallback } from 'react'
import { useAdminUI } from '../../components/admin/AdminContext'
import { adminAPI } from '../../services/api'

const fmt = (n) => 'Rs ' + Number(n || 0).toLocaleString('en-PK')

const CAMPAIGN_SPEC = [
  { group: 'Campaign Details', cols: 1, fields: [
    { key: 'name',    label: 'Campaign Name', type: 'text', required: true },
    { key: 'subject', label: 'Email Subject', type: 'text' },
  ]},
  { group: 'Targeting', cols: 2, fields: [
    { key: 'audience',     label: 'Audience',       type: 'select', options: [{ value: 'subscribers', label: 'Subscribers' }, { value: 'all', label: 'All Customers' }, { value: 'vip', label: 'VIP Only' }] },
    { key: 'scheduled_at', label: 'Scheduled Date',  type: 'date'   },
    { key: 'status',       label: 'Status',          type: 'select', options: [{ value: 'draft', label: 'Draft' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'sent', label: 'Sent' }] },
  ]},
  { group: 'Content', cols: 1, fields: [
    { key: 'content', label: 'Email Body', type: 'textarea' },
  ]},
]

export default function AdminCampaignsPage() {
  const { openCrud, confirmAction, showToast } = useAdminUI()

  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminAPI.campaigns.list()
      setCampaigns(res.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => {
    openCrud({
      title: 'New Campaign',
      spec: CAMPAIGN_SPEC,
      data: { audience: 'subscribers', status: 'draft' },
      onSave: (data) => {
        if (!data.name) return false
        adminAPI.campaigns.create(data)
          .then(() => { showToast('Campaign created'); load() })
          .catch(e => showToast(e.response?.data?.message || 'Failed to create campaign'))
      },
    })
  }

  const openEdit = (c) => {
    openCrud({
      title: 'Edit Campaign',
      sub: c.name,
      spec: CAMPAIGN_SPEC,
      data: c,
      onSave: (data) => {
        adminAPI.campaigns.update(c.id, data)
          .then(() => { showToast('Campaign updated'); load() })
          .catch(e => showToast(e.response?.data?.message || 'Failed to update'))
      },
      onDelete: () => {
        confirmAction('Delete Campaign', `Delete "${c.name}"?`, async () => {
          try {
            await adminAPI.campaigns.destroy(c.id)
            showToast('Campaign deleted')
            load()
          } catch {
            showToast('Failed to delete campaign')
          }
        })
      },
      deleteLabel: 'Delete',
    })
  }

  return (
    <div className="view">
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 28, margin: '0 0 4px' }}>Campaigns</h2>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{campaigns.length} campaigns</div>
        </div>
        <button className="btn btn-gold" onClick={openAdd}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Campaign
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>No campaigns yet</div>
          ) : campaigns.map((c) => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{c.name}</span>
                    <span className={`pill ${c.status === 'sent' ? 'ok' : c.status === 'scheduled' ? 'info' : 'neutral'}`}>{c.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.scheduled_at}</span>
                  </div>
                  {c.subject && <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>"{c.subject}"</div>}
                  {c.status === 'sent' && (
                    <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
                      <span><strong style={{ fontFamily: 'var(--f-serif)', fontSize: 18 }}>{(c.sent_count || 0).toLocaleString()}</strong> sent</span>
                      <span><strong style={{ fontFamily: 'var(--f-serif)', fontSize: 18 }}>{c.open_rate || 0}%</strong> opens</span>
                      <span><strong style={{ fontFamily: 'var(--f-serif)', fontSize: 18 }}>{c.click_rate || 0}%</strong> clicks</span>
                      <span><strong style={{ fontFamily: 'var(--f-serif)', fontSize: 18 }}>{fmt(c.revenue || 0)}</strong> revenue</span>
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                    Audience: {c.audience}
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => openEdit(c)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
