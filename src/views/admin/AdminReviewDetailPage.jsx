import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from '../../router'
import { adminAPI } from '../../services/api'
import { useAdminUI } from '../../components/admin/AdminContext'

const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Ã¢â‚¬â€'

// Icons
const Icon = ({ d, w = 14 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: w, height: w }}>{d}</svg>
)
const IconBack  = <Icon d={<><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></>} />
const IconEdit  = <Icon d={<><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>} />
const IconCheck = <Icon d={<polyline points="20 6 9 17 4 12"/>} />
const IconX     = <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} />
const IconTrash = <Icon d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></>} />
const IconChevL = <Icon d={<polyline points="15 18 9 12 15 6"/>} w={22} />
const IconChevR = <Icon d={<polyline points="9 18 15 12 9 6"/>} w={22} />
const IconClose = <Icon d={<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>} w={20} />

// Ã¢â€â‚¬Ã¢â€â‚¬ Stars display Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function StarsBig({ value }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, fontSize: 22, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= value ? '#c9a24e' : 'var(--line)' }}>Ã¢Ëœâ€¦</span>
      ))}
    </span>
  )
}

function StatusPill({ approved }) {
  return approved ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(124,154,100,0.14)', color: '#5a7c44' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c9a64' }} />
      Approved
    </span>
  ) : (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', background: 'rgba(212,160,78,0.14)', color: '#a47718' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a04e' }} />
      Pending
    </span>
  )
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Lightbox Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
function Lightbox({ images, startIndex, onClose }) {
  const [i, setI] = useState(startIndex)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setI((p) => (p + 1) % images.length)
      if (e.key === 'ArrowLeft')  setI((p) => (p - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose() }}
        style={iconBtnStyle({ pos: 'topright' })}
        title="Close (Esc)"
      >{IconClose}</button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setI((p) => (p - 1 + images.length) % images.length) }}
            style={iconBtnStyle({ pos: 'left' })}
            title="Previous (Ã¢â€ Â)"
          >{IconChevL}</button>
          <button
            onClick={(e) => { e.stopPropagation(); setI((p) => (p + 1) % images.length) }}
            style={iconBtnStyle({ pos: 'right' })}
            title="Next (Ã¢â€ â€™)"
          >{IconChevR}</button>
        </>
      )}

      <img
        src={images[i]} alt="Review attachment"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 4 }}
      />

      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        color: '#fff', fontSize: 12, opacity: 0.7, letterSpacing: '0.06em',
      }}>
        {i + 1} / {images.length}
      </div>
    </div>
  )
}

function iconBtnStyle({ pos }) {
  const base = {
    position: 'absolute', background: 'rgba(255,255,255,0.12)',
    border: 'none', color: '#fff', cursor: 'pointer',
    borderRadius: '50%', width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  if (pos === 'topright') return { ...base, top: 16, right: 16 }
  if (pos === 'left')     return { ...base, top: '50%', left: 16, transform: 'translateY(-50%)' }
  if (pos === 'right')    return { ...base, top: '50%', right: 16, transform: 'translateY(-50%)' }
  return base
}

// Ã¢â€â‚¬Ã¢â€â‚¬ Main page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
export default function AdminReviewDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast, confirmAction } = useAdminUI()

  const [review, setReview]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminAPI.reviews.show(id)
      setReview(res.data?.data || res.data)
    } catch (e) {
      console.error('Review load failed:', e.response?.data || e.message)
      showToast('Failed to load review', true)
    } finally {
      setLoading(false)
    }
  }, [id, showToast])

  useEffect(() => { load() }, [load])

  const toggleApproval = async () => {
    if (!review) return
    setSaving(true)
    try {
      const apiCall = review.is_approved ? adminAPI.reviews.reject : adminAPI.reviews.approve
      const res = await apiCall(review.id)
      setReview(res.data?.data || res.data)
      showToast(review.is_approved ? 'Review rejected' : 'Review approved')
    } catch {
      showToast('Action failed', true)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = () => {
    confirmAction(
      'Delete Review',
      `Delete review by ${review?.author}? This cannot be undone.`,
      async () => {
        try {
          await adminAPI.reviews.destroy(id)
          showToast('Review deleted')
          navigate('/admin/reviews')
        } catch { showToast('Failed to delete', true) }
      },
      'Yes, delete',
    )
  }

  if (loading) {
    return <div className="view"><div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Loading reviewÃ¢â‚¬Â¦</div></div>
  }
  if (!review) {
    return <div className="view"><div className="card" style={{ padding: 60, textAlign: 'center', color: 'var(--muted)' }}>Review not found.</div></div>
  }

  const images = review.images || []

  return (
    <div className="view">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/admin/reviews" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6, border: '1px solid var(--line-2)',
            color: 'var(--ink-2)', textDecoration: 'none',
          }}>{IconBack}</Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 24, margin: 0, letterSpacing: '-0.01em' }}>
                Review by {review.author}
              </h2>
              <StatusPill approved={review.is_approved} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              Posted {fmtDateTime(review.created_at)} on <em>{review.product_name}</em>
            </div>
          </div>
        </div>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button
            onClick={toggleApproval}
            disabled={saving}
            style={{
              padding: '8px 14px', fontSize: 12, fontWeight: 500,
              border: '1px solid var(--line)', borderRadius: 8,
              background: review.is_approved ? 'rgba(212,160,78,0.10)' : 'rgba(124,154,100,0.10)',
              color: review.is_approved ? '#a47718' : '#5a7c44',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {review.is_approved ? IconX : IconCheck}
            {review.is_approved ? 'Reject' : 'Approve'}
          </button>
          <button onClick={handleDelete} style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 500,
            border: '1px solid rgba(214,48,49,0.3)', borderRadius: 8,
            background: 'transparent', color: '#d63031', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            {IconTrash} Delete
          </button>
          <Link to={`/admin/reviews`} onClick={(e) => { e.preventDefault(); /* edit opens via modal in list page; for now, just allow */ }} style={{ textDecoration: 'none' }}>
            <button onClick={() => navigate(`/admin/reviews?edit=${review.id}`)} className="btn btn-gold" style={{ padding: '8px 14px', fontSize: 12, gap: 6 }}>
              {IconEdit} Edit
            </button>
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          {/* Main review card */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--cream-2)', border: '1px solid var(--line-2)',
                  color: 'var(--ink-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--f-serif)', fontSize: 16, fontWeight: 600,
                }}>
                  {(review.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{review.author}</span>
                    {review.verified && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, color: '#5a7c44',
                        background: 'rgba(124,154,100,0.14)', padding: '2px 7px',
                        borderRadius: 4, letterSpacing: '0.08em',
                      }}>Ã¢Å“â€œ VERIFIED</span>
                    )}
                  </div>
                  {review.email && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{review.email}</div>}
                </div>
              </div>
              <StarsBig value={review.rating} />
            </div>

            {review.title && (
              <h3 style={{ fontFamily: 'var(--f-serif)', fontWeight: 500, fontSize: 18, margin: '0 0 10px', color: 'var(--ink)' }}>
                {review.title}
              </h3>
            )}

            <p style={{
              margin: 0, fontFamily: 'var(--f-serif)', fontSize: 15, lineHeight: 1.75,
              color: 'var(--ink-2)', whiteSpace: 'pre-wrap',
            }}>
              "{review.body}"
            </p>
          </div>

          {/* Image gallery */}
          {images.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
                Customer Photos ({images.length})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {images.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxIdx(idx)}
                    style={{
                      position: 'relative', aspectRatio: '1 / 1',
                      borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                      border: '1px solid var(--line-2)',
                      transition: 'transform .15s ease, box-shadow .15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <img src={url} alt={`Review photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>
                Click any photo to view full size Ã‚Â· Arrow keys to navigate
              </div>
            </div>
          )}
        </div>

        {/* RIGHT Ã¢â‚¬â€ sidebar */}
        <div>
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>
              Details
            </div>

            <Row label="Product" value={
              <Link to={`/admin/products`} style={{ color: 'var(--forest)', textDecoration: 'none', fontWeight: 500 }}>
                {review.product_name || 'Ã¢â‚¬â€'}
              </Link>
            } />
            <Row label="Rating" value={`${review.rating} / 5`} />
            <Row label="Status" value={<StatusPill approved={review.is_approved} />} />
            <Row label="Verified" value={review.verified ? 'Yes' : 'No'} />
            <Row label="Posted" value={fmtDateTime(review.created_at)} last />
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
              Quick Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button onClick={toggleApproval} disabled={saving}
                style={{
                  padding: '10px 12px', fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--line-2)', borderRadius: 8,
                  background: 'var(--cream)', color: 'var(--ink-2)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {review.is_approved ? <>{IconX} Mark as Pending</> : <>{IconCheck} Approve & Publish</>}
              </button>
              <button onClick={() => navigate(`/admin/reviews?edit=${review.id}`)}
                style={{
                  padding: '10px 12px', fontSize: 12, fontWeight: 500,
                  border: '1px solid var(--line-2)', borderRadius: 8,
                  background: 'var(--cream)', color: 'var(--ink-2)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {IconEdit} Edit content
              </button>
              <button onClick={handleDelete}
                style={{
                  padding: '10px 12px', fontSize: 12, fontWeight: 500,
                  border: '1px solid rgba(214,48,49,0.3)', borderRadius: 8,
                  background: 'transparent', color: '#d63031', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {IconTrash} Delete review
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox modal */}
      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </div>
  )
}

function Row({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', fontSize: 13,
      borderBottom: last ? 'none' : '1px solid var(--line-2)',
    }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ color: 'var(--ink-2)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
