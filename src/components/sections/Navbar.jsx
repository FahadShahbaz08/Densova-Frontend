import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from '../../router'
import { useCart } from '../../hooks/useCart'
import { openCartDrawer } from '../../store/slices/uiSlice'
import { useContent } from '../../hooks/useContent'
import { logout, selectAuth } from '../../store/slices/authSlice'

const DEFAULT = {
  brand: 'Densova',
  links: [
    { label: 'Shop',        url: '#shop' },
    { label: 'The Ritual',  url: '#feature' },
    { label: 'Ingredients', url: '#ingredients' },
    { label: 'Reviews',     url: '#reviews' },
    { label: 'Journal',     url: '#faq' },
  ],
}

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { count } = useCart()
  const { token, user } = useSelector(selectAuth)
  const [scrolled, setScrolled] = useState(false)
  const [acctOpen, setAcctOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const c = useContent('content_navbar', DEFAULT)
  const links = Array.isArray(c.links) && c.links.length ? c.links : DEFAULT.links

  // Hash links (#shop, #feature, …) only work on the homepage. When the user
  // is on another route (e.g. /shop/slug), intercept the click, navigate to /,
  // and pass the hash. HomePage will scroll to it once mounted.
  const handleNavClick = (e, url) => {
    if (!url || !url.startsWith('#')) return
    if (location.pathname === '/') return // homepage → let browser scroll natively
    e.preventDefault()
    navigate('/' + url) // becomes /#shop, /#feature, etc.
  }

  useEffect(() => {
    if (!acctOpen) return
    const close = (e) => {
      if (!e.target.closest('.acct-menu') && !e.target.closest('.acct-trigger')) setAcctOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [acctOpen])

  useEffect(() => {
    setNavOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    await dispatch(logout())
    setAcctOpen(false)
    navigate('/')
  }

  const handleMobileCart = () => {
    setNavOpen(false)
    dispatch(openCartDrawer())
  }

  const handleMobileAccount = () => {
    setNavOpen(false)
    if (token) {
      navigate('/track-order')
    } else {
      navigate('/login')
    }
  }

  const handleMobileSearch = () => {
    setNavOpen(false)
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="container nav-inner">
        <a href="#top" className="brand"
          onClick={(e) => {
            handleNavClick(e, '#top')
            setNavOpen(false)
          }}>
          {c.brand || DEFAULT.brand}
        </a>
        <nav>
          <ul className={`nav-links${navOpen ? ' mobile-open' : ''}`} id="navLinks">
            {links.map((l, i) => (
              <li key={i}>
                <a
                  href={l.url || '#'}
                  onClick={(e) => {
                    handleNavClick(e, l.url)
                    setNavOpen(false)
                  }}
                >
                  {l.label}
                </a>
              </li>
            ))}
            {navOpen && (
              <li className="mobile-menu-actions">
                <button type="button" className="nav-action-link" onClick={handleMobileSearch}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  Search
                </button>
                <button type="button" className="nav-action-link" onClick={handleMobileAccount}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                  </svg>
                  {token ? 'Track order' : 'Login'}
                </button>
                <button type="button" className="nav-action-link" onClick={handleMobileCart}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 7h12l-1.2 11.4a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
                    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                  </svg>
                  Cart
                  <span className={`cart-badge${count > 0 ? ' active' : ''}`}>{count}</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" id="openSearch" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <div style={{ position: 'relative' }}>
            {token ? (
              <>
                <button
                  className="icon-btn acct-trigger"
                  aria-label={`Account: ${user?.name || ''}`}
                  onClick={() => setAcctOpen(o => !o)}
                  title={user?.name || 'Account'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                  </svg>
                </button>
                {acctOpen && (
                  <div className="acct-menu" style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    background: 'var(--cream)', border: '1px solid var(--line)',
                    borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                    minWidth: 200, padding: 6, zIndex: 200,
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line-2)', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{user?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{user?.email}</div>
                    </div>
                    {user?.is_admin && (
                      <Link to="/admin" onClick={() => setAcctOpen(false)} className="acct-menu-item">Admin Dashboard</Link>
                    )}
                    <Link to="/track-order" onClick={() => setAcctOpen(false)} className="acct-menu-item">Track Order</Link>
                    <button onClick={handleLogout} className="acct-menu-item" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer', color: '#b14a3c' }}>
                      Sign out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="icon-btn" aria-label="Sign in" title="Sign in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                </svg>
              </Link>
            )}
          </div>
          <button className="icon-btn" onClick={() => dispatch(openCartDrawer())} aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 7h12l-1.2 11.4a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 7Z" />
              <path d="M9 7V5a3 3 0 0 1 6 0v2" />
            </svg>
            <span className={`cart-badge${count > 0 ? ' active' : ''}`} id="cartBadge">{count}</span>
          </button>
        </div>
        <button
          className={`nav-toggle${navOpen ? ' open' : ''}`}
          id="navToggle"
          aria-label="Menu"
          onClick={() => setNavOpen((o) => !o)}
          aria-expanded={navOpen}
        >
          <span />
        </button>
      </div>
    </header>
  )
}
