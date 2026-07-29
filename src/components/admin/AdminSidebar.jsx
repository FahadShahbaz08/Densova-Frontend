import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from '../../router'
import { useDispatch, useSelector } from 'react-redux'
import { logout, selectAuth } from '../../store/slices/authSlice'
import { adminAPI } from '../../services/api'

const initials = (name) => (name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'

const GROUPS = [
  {
    label: 'Overview',
    links: [
      { to: '/admin', label: 'Dashboard', end: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
    ],
  },
  {
    label: 'Catalog',
    links: [
      { to: '/admin/products',   label: 'Products',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg> },
      { to: '/admin/categories', label: 'Categories', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
    ],
  },
  {
    label: 'Sales',
    links: [
      { to: '/admin/orders',    label: 'Orders',    badgeKey: 'orders',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
      { to: '/admin/customers', label: 'Customers', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
      { to: '/admin/contact',   label: 'Contact Inbox', badgeKey: 'contact', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
    ],
  },
  {
    label: 'Marketing',
    links: [
      { to: '/admin/reviews',   label: 'Reviews',   badgeKey: 'reviews',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
      { to: '/admin/discounts', label: 'Discounts', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> },
      { to: '/admin/campaigns', label: 'Campaigns', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
      { to: '/admin/newsletter', label: 'Newsletter', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
    ],
  },
  {
    label: 'Storefront',
    links: [
      { to: '/admin/content',    label: 'Content',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> },
      { to: '/admin/appearance', label: 'Appearance', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg> },
    ],
  },
  {
    label: 'Insights',
    links: [
      { to: '/admin/reports', label: 'Reports', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/admin/settings', label: 'Settings', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    ],
  },
]

export default function AdminSidebar() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector(selectAuth)

  const [badges, setBadges] = useState({ orders: 0, reviews: 0 })

  useEffect(() => {
    adminAPI.dashboard.stats().then(res => {
      setBadges({
        orders:  res.data?.orders?.pending  || 0,
        reviews: res.data?.reviews?.pending || 0,
      })
    }).catch(() => {})
  }, [])

  const handleLogout = async () => {
    await dispatch(logout())
    navigate('/admin/login')
  }

  return (
    <aside className="sidebar">
      <div className="sb-head">
        <div className="sb-brand">Densova</div>
        <div className="sb-meta">Admin Console</div>
      </div>

      <nav className="sb-nav">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div className="sb-section-title">{g.label}</div>
            {g.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badgeKey && badges[link.badgeKey] > 0 && (
                  <span className="badge-num">{badges[link.badgeKey]}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="sb-avatar">{initials(user?.name || 'Admin')}</div>
        <div className="sb-user">
          <strong>{user?.name || 'Admin'}</strong>
          <span>{user?.email || 'admin@densova.com'}</span>
        </div>
        <button className="sb-out" onClick={handleLogout} title="Sign out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
