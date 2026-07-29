import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from '../../router'
import { useSelector } from 'react-redux'

import { selectAuth } from '../../store/slices/authSlice'
import { reviewsAPI, uploadsAPI } from '../../services/api'

const MAX_IMAGES = 5

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const active = hover || value
  return (
    <div onMouseLeave={() => setHover(0)} className="star-picker" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n} type="button"
          role="radio" aria-checked={value === n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          className={`star-picker-btn${n <= active ? ' on' : ''}`}
          aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
        >â˜…</button>
      ))}
      <span className="star-picker-label">
        {value ? `${value} of 5` : 'Tap a star'}
      </span>
    </div>
  )
}

export default function ReviewForm({ product, onSubmitted }) {
  const { token, user } = useSelector(selectAuth)
  const location = useLocation()
  const [rating, setRating] = useState(0)
  const [title, setTitle]   = useState('')
  const [body, setBody]     = useState('')
  const [status, setStatus] = useState('idle')
  const [serverMsg, setServerMsg] = useState('')
  const [eligibility, setEligibility] = useState(null)
  const [checkingEligibility, setChecking] = useState(false)
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!token || !product?.id) return
    setChecking(true)
    setEligibility(null)
    reviewsAPI.canReview(product.id)
      .then(r => setEligibility(r.data))
      .catch(() => setEligibility({ can_review: true }))
      .finally(() => setChecking(false))
  }, [token, product?.id])

  if (!token) {
    return (
      <div className="pdp-review-prompt">
        <h4>Share your experience.</h4>
        <p>Sign in to write a review. We only show reviews from authenticated users to keep the wall honest.</p>
        <div className="pdp-review-prompt-actions">
          <Link to="/login" state={{ from: location.pathname }} className="btn btn-gold">
            Sign in to review
            <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
          <Link to="/register" state={{ from: location.pathname }} className="btn-link">
            Create an account â†’
          </Link>
        </div>
      </div>
    )
  }

  if (checkingEligibility || eligibility === null) {
    return (
      <div className="pdp-review-loading" aria-busy="true" aria-live="polite">
        <div className="pdp-review-loading-row" />
        <div className="pdp-review-loading-row short" />
        <div className="pdp-review-loading-row" />
      </div>
    )
  }

  if (!eligibility.can_review && eligibility.reason === 'already_reviewed') {
    const r = eligibility.review
    return (
      <div className="pdp-review-already">
        <div className="pdp-review-already-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 6L9 17l-5-5" /></svg>
          <div>
            <strong>You&apos;ve already reviewed this product.</strong>
            <p>
              {r.is_approved
                ? 'Your review is live below. Thanks for sharing!'
                : 'Your review is pending moderation and will appear here shortly.'}
            </p>
          </div>
        </div>
        <blockquote className="pdp-review-already-body">
          <div className="review-stars">{'â˜…'.repeat(r.rating)}{'â˜†'.repeat(5 - r.rating)}</div>
          {r.title && <strong>{r.title}</strong>}
          <p>&ldquo;{r.body}&rdquo;</p>
        </blockquote>
      </div>
    )
  }

  const handlePickFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const remaining = MAX_IMAGES - images.length
    const toUpload = files.slice(0, remaining)
    if (files.length > remaining) {
      setServerMsg(`Only ${MAX_IMAGES} photos allowed â€” first ${remaining} uploaded.`)
      setStatus('error')
    }
    setUploading(true)
    try {
      const urls = await Promise.all(toUpload.map(f => uploadsAPI.reviewImage(f).then(r => r.data.url)))
      setImages(prev => [...prev, ...urls].slice(0, MAX_IMAGES))
      if (status !== 'error' || !serverMsg.startsWith('Only')) { setStatus('idle'); setServerMsg('') }
    } catch (err) {
      setStatus('error')
      setServerMsg(err.response?.data?.message || 'Photo upload failed. Try a smaller file.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { setServerMsg('Please pick a rating'); setStatus('error'); return }
    if (body.trim().length < 10) { setServerMsg('Please write at least 10 characters'); setStatus('error'); return }
    setStatus('sending'); setServerMsg('')
    try {
      const { data } = await reviewsAPI.create({
        product_id: product.id,
        rating,
        title: title.trim() || null,
        body:  body.trim(),
        images: images.length ? images : undefined,
      })
      setStatus('success')
      setServerMsg(data?.message || 'Thank you. Your review will appear after moderation.')
      setRating(0); setTitle(''); setBody(''); setImages([])
      onSubmitted?.()
    } catch (err) {
      setStatus('error')
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' Â· ')
        : err.response?.data?.message || 'Could not submit. Please try again.'
      setServerMsg(msg)
    }
  }

  if (status === 'success') {
    return (
      <div className="pdp-review-success">
        <div className="pdp-review-success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20 6L9 17l-5-5" /></svg>
        </div>
        <h4>Review received.</h4>
        <p>{serverMsg}</p>
      </div>
    )
  }

  return (
    <form className="pdp-review-form" onSubmit={onSubmit}>
      <div className="pdp-review-form-head">
        <h4>Share your experience</h4>
        <span className="pdp-review-form-as">Posting as <strong>{user?.name || 'You'}</strong></span>
      </div>

      <div className="pdp-rf-field">
        <label>Your rating *</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="pdp-rf-field">
        <label htmlFor="rev-title">Headline (optional)</label>
        <input id="rev-title" type="text" value={title} onChange={e => setTitle(e.target.value)}
          maxLength={200} placeholder="Sum it up in a few words" />
      </div>

      <div className="pdp-rf-field">
        <label htmlFor="rev-body">Your review *</label>
        <textarea id="rev-body" rows={5} value={body} onChange={e => setBody(e.target.value)}
          maxLength={5000} minLength={10}
          placeholder="What did you notice? How long did you use it? Anything others should know?" />
        <div className="pdp-rf-counter">{body.length} / 5000</div>
      </div>

      <div className="pdp-rf-field">
        <label>
          Photos (optional)
          <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--muted)', fontWeight: 400, letterSpacing: 0, textTransform: 'none' }}>
            up to {MAX_IMAGES}
          </span>
        </label>
        <div className="pdp-rf-photos">
          {images.map((url, idx) => (
            <div key={idx} className="pdp-rf-photo">
              <img src={url} alt={`Review photo ${idx + 1}`} />
              <button type="button" onClick={() => removeImage(idx)} title="Remove" aria-label="Remove photo">Ã—</button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button type="button" className="pdp-rf-photo-add" onClick={() => fileInputRef.current?.click()} disabled={uploading} aria-label="Add photo">
              {uploading ? <span className="pdp-rf-photo-spinner" /> : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span>Add photo</span>
                </>
              )}
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePickFiles} />
        </div>
      </div>

      {status === 'error' && serverMsg && <div className="pdp-rf-error">{serverMsg}</div>}

      <button type="submit" className="btn btn-gold" disabled={status === 'sending'}>
        {status === 'sending' ? 'Submittingâ€¦' : 'Submit review'}
        {status !== 'sending' && (
          <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        )}
      </button>

      <p className="pdp-rf-note">
        Reviews are moderated before publishing. Verified-buyer badges appear automatically if you&apos;ve ordered this product.
      </p>
    </form>
  )
}
