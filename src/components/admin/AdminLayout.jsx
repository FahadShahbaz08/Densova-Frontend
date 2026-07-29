import { Outlet, useLocation } from '../../router'
import { AdminUIProvider } from './AdminContext'
import AdminSidebar from './AdminSidebar'
import CrudModal from './CrudModal'
import ConfirmModal from './ConfirmModal'
import FlyerModal from './FlyerModal'
import DetailPanel from './DetailPanel'
import AdminToast from './AdminToast'
import '../../styles/admin.css'

const PAGE_TITLES = {
  '/admin':            { crumb: 'Overview',   title: 'Dashboard'   },
  '/admin/orders':     { crumb: 'Sales',      title: 'Orders'      },
  '/admin/products':   { crumb: 'Catalog',    title: 'Products'    },
  '/admin/categories': { crumb: 'Catalog',    title: 'Categories'  },
  '/admin/customers':  { crumb: 'Sales',      title: 'Customers'   },
  '/admin/contact':    { crumb: 'Sales',      title: 'Contact Inbox' },
  '/admin/reviews':    { crumb: 'Marketing',  title: 'Reviews'     },
  '/admin/discounts':  { crumb: 'Marketing',  title: 'Discounts'   },
  '/admin/campaigns':  { crumb: 'Marketing',  title: 'Campaigns'   },
  '/admin/newsletter': { crumb: 'Marketing',  title: 'Newsletter'  },
  '/admin/content':    { crumb: 'Storefront', title: 'Content'     },
  '/admin/appearance': { crumb: 'Storefront', title: 'Appearance'  },
  '/admin/reports':    { crumb: 'Insights',   title: 'Reports'     },
  '/admin/settings':   { crumb: 'System',     title: 'Settings'    },
}

function resolveMeta(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname === '/admin/orders/new')         return { crumb: 'Sales', title: 'New Order' }
  if (/^\/admin\/orders\/[^/]+\/view$/.test(pathname)) return { crumb: 'Sales', title: 'Order Detail' }
  if (/^\/admin\/orders\/[^/]+\/edit$/.test(pathname)) return { crumb: 'Sales', title: 'Edit Order' }
  if (/^\/admin\/reviews\/[^/]+\/view$/.test(pathname)) return { crumb: 'Marketing', title: 'Review Detail' }
  return { crumb: 'Admin', title: 'Dashboard' }
}

function Topbar() {
  const { pathname } = useLocation()
  const meta = resolveMeta(pathname)

  return (
    <div className="topbar">
      <h1>
        <span className="crumb">{meta.crumb}</span>
        {meta.title}
      </h1>
      <div className="top-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Quick searchâ€¦" />
        <kbd>âŒ˜K</kbd>
      </div>
      <button className="icon-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </button>
    </div>
  )
}

export default function AdminLayout() {
  return (
    <AdminUIProvider>
      <div className="admin-app">
        <AdminSidebar />
        <div className="admin-main">
          <Topbar />
          <Outlet />
        </div>
        <CrudModal />
        <ConfirmModal />
        <FlyerModal />
        <DetailPanel />
        <AdminToast />
      </div>
    </AdminUIProvider>
  )
}
