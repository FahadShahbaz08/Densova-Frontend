import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from '../router'

import SEOHead from '../components/common/SEOHead'
import AnnouncementBar from '../components/sections/AnnouncementBar'
import Navbar from '../components/sections/Navbar'
import Footer from '../components/sections/Footer'
import ScrollProgress from '../components/sections/ScrollProgress'

import { login, register, selectAuth, clearError } from '../store/slices/authSlice'

export default function LoginPage({ mode = 'login' }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error, token } = useSelector(selectAuth)

  const isRegister = mode === 'register'

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [localErrors, setLocalErrors] = useState({})

  // If already logged in, bounce away
  if (token) {
    const back = location.state?.from || '/'
    navigate(back, { replace: true })
  }

  const update = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setLocalErrors(errs => ({ ...errs, [k]: undefined }))
    if (error) dispatch(clearError())
  }

  const validate = () => {
    const e = {}
    if (isRegister && !form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Required'
    else if (isRegister && form.password.length < 8) e.password = 'At least 8 characters'
    setLocalErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    const action = isRegister
      ? register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      : login({ email: form.email.trim(), password: form.password })
    const result = await dispatch(action)
    if (result.meta.requestStatus === 'fulfilled') {
      const back = location.state?.from || '/'
      navigate(back, { replace: true })
    }
  }

  return (
    <>
      <SEOHead title={isRegister ? 'Create Account' : 'Sign in'} noIndex />
      <ScrollProgress />
      <AnnouncementBar />
      <Navbar />

      <section className="auth-page">
        <div className="container-sm">
          <div className="auth-card">
            <div className="auth-head">
              <div className="eyebrow"><span className="line" />{isRegister ? 'Join the Apothecary' : 'Welcome back'}<span className="line" /></div>
              <h1>{isRegister ? <>Create your <em>account.</em></> : <>Sign into your <em>ritual.</em></>}</h1>
              <p>
                {isRegister
                  ? 'A Densova account lets you submit reviews, track orders, and save your shipping details for next time.'
                  : 'Sign in to write reviews, track orders, and access your ritual history.'}
              </p>
            </div>

            <form onSubmit={onSubmit} className="auth-form">
              {isRegister && (
                <label className="auth-field">
                  <span>Full Name</span>
                  <input type="text" value={form.name} onChange={update('name')}
                    placeholder="Sara Khan"
                    style={localErrors.name ? { borderColor: '#b14a3c' } : undefined} />
                  {localErrors.name && <em className="auth-err">{localErrors.name}</em>}
                </label>
              )}

              <label className="auth-field">
                <span>Email</span>
                <input type="email" value={form.email} onChange={update('email')}
                  placeholder="you@example.com" autoComplete="email"
                  style={localErrors.email ? { borderColor: '#b14a3c' } : undefined} />
                {localErrors.email && <em className="auth-err">{localErrors.email}</em>}
              </label>

              <label className="auth-field">
                <span>Password</span>
                <input type="password" value={form.password} onChange={update('password')}
                  placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  style={localErrors.password ? { borderColor: '#b14a3c' } : undefined} />
                {localErrors.password && <em className="auth-err">{localErrors.password}</em>}
              </label>

              {error && <div className="auth-server-err">{error}</div>}

              <button type="submit" className="btn btn-gold auth-submit" disabled={status === 'loading'}>
                {status === 'loading'
                  ? (isRegister ? 'CreatingÃ¢â‚¬Â¦' : 'Signing inÃ¢â‚¬Â¦')
                  : (isRegister ? 'Create Account' : 'Sign in')}
                {status !== 'loading' && (
                  <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              <div className="auth-switch">
                {isRegister ? (
                  <>Already have an account? <Link to="/login" state={location.state}>Sign in</Link></>
                ) : (
                  <>New to Densova? <Link to="/register" state={location.state}>Create an account</Link></>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
