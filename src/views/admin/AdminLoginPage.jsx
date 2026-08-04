import { useEffect, useState } from 'react'
import { useNavigate, Navigate } from '../../router'
import { useDispatch, useSelector } from 'react-redux'
import {
  login, selectAuth, selectIsAuthenticated, selectIsAdmin, clearError,
} from '../../store/slices/authSlice'
import '../../styles/admin.css'

export default function AdminLoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { status, error } = useSelector(selectAuth)
  const isAuthenticated   = useSelector(selectIsAuthenticated)
  const isAdmin           = useSelector(selectIsAdmin)

  const [email, setEmail]       = useState('admin@densova.com')
  const [password, setPassword] = useState('password')
  const [showPass, setShowPass] = useState(false)

  useEffect(() => () => dispatch(clearError()), [dispatch])

  if (isAuthenticated && isAdmin) return <Navigate to="/admin" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) navigate('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: 'var(--f-sans)',
      background: 'var(--cream)', color: 'var(--ink)',
    }}>

      {/* ── Left panel ── */}
      <div style={{
        width: '45%', background: 'var(--forest-deep)', display: 'flex',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '56px 52px', position: 'relative', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 400, height: 400, borderRadius: '50%', background: 'rgba(201,162,78,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,162,78,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '38%', right: -60, width: 180, height: 180, borderRadius: '50%', border: '1px solid rgba(232,203,138,0.1)', pointerEvents: 'none' }} />

        {/* Brand */}
        <div>
          <div style={{
            fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 38,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            background: 'var(--gold-grad)', backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            lineHeight: 1, marginBottom: 10,
          }}>
            Densova
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(232,203,138,0.65)' }}>
            Admin Console
          </div>
        </div>

        {/* Centre content */}
        <div>
          <div style={{ width: 40, height: 2, background: 'var(--gold)', marginBottom: 28, borderRadius: 1, opacity: 0.6 }} />
          <blockquote style={{
            fontFamily: 'var(--f-serif)', fontStyle: 'italic', fontWeight: 300,
            fontSize: 22, lineHeight: 1.55, color: 'rgba(244,236,221,0.82)',
            margin: 0, maxWidth: 320,
          }}>
            "Old hands. Good plants. Slow rituals returned, untouched, to a faster world."
          </blockquote>
          <div style={{ marginTop: 18, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,203,138,0.5)' }}>
            — The Densova Apothecary
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Tiny botanical leaf SVG */}
          <svg viewBox="0 0 32 32" fill="none" style={{ width: 28, height: 28, opacity: 0.45 }}>
            <path d="M16 28C16 28 4 22 4 12C4 6 10 4 16 4C22 4 28 6 28 12C28 22 16 28 16 28Z" stroke="var(--gold)" strokeWidth="1.2"/>
            <path d="M16 28L16 10" stroke="var(--gold)" strokeWidth="1.2"/>
            <path d="M16 16L10 11" stroke="var(--gold)" strokeWidth="1"/>
            <path d="M16 20L22 15" stroke="var(--gold)" strokeWidth="1"/>
          </svg>
          <div style={{ fontSize: 11, color: 'rgba(244,236,221,0.4)', lineHeight: 1.6 }}>
            Botanical apothecary<br />Est. Pakistan · 2024
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Welcome back</div>
            <h1 style={{ fontFamily: 'var(--f-serif)', fontWeight: 400, fontSize: 34, margin: '0 0 8px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
              Sign in
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
              Enter your credentials to access the admin panel.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '13px 16px',
                  border: '1px solid var(--line)', borderRadius: 10,
                  background: 'var(--cream-2)', fontSize: 14,
                  outline: 'none', fontFamily: 'var(--f-sans)',
                  transition: 'border-color .2s, box-shadow .2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--forest)'; e.target.style.boxShadow = '0 0 0 3px rgba(46,58,31,0.08)' }}
                onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8, fontWeight: 600 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '13px 48px 13px 16px',
                    border: '1px solid var(--line)', borderRadius: 10,
                    background: 'var(--cream-2)', fontSize: 14,
                    outline: 'none', fontFamily: 'var(--f-sans)',
                    transition: 'border-color .2s, box-shadow .2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--forest)'; e.target.style.boxShadow = '0 0 0 3px rgba(46,58,31,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
                >
                  {showPass ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ width: 18, height: 18 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                marginBottom: 16, padding: '11px 14px', borderRadius: 8,
                background: 'var(--err-soft)', color: 'var(--err)',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%', marginTop: 8, padding: '14px 20px',
                background: 'var(--gold-grad)', backgroundSize: '200% auto',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 600,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 10,
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'opacity .2s, background-position .4s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundPosition = '100% 50%'}
              onMouseLeave={e => e.currentTarget.style.backgroundPosition = '0% 50%'}
            >
              {status === 'loading' ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to Console
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider hint */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--line-2)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.06em' }}>
              Densova · Admin v1.0 · Pakistan
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 700px) {
          .login-left { display: none !important; }
        }
      `}</style>
    </div>
  )
}
