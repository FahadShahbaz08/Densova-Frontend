'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { usePathname } from 'next/navigation'

import HomePage from './views/HomePage'
import ProductDetailPage from './views/ProductDetailPage'
import ProductReviewsPage from './views/ProductReviewsPage'
import CheckoutPage from './views/CheckoutPage'
import OrderConfirmationPage from './views/OrderConfirmationPage'
import OrderTrackingPage from './views/OrderTrackingPage'
import ContactPage from './views/ContactPage'
import ReturnPolicyPage from './views/ReturnPolicyPage'
import LoginPage from './views/LoginPage'
import NotFoundPage from './views/NotFoundPage'
import ProtectedRoute from './components/common/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminLoginPage from './views/admin/AdminLoginPage'
import AdminDashboard from './views/admin/AdminDashboard'
import AdminOrdersPage from './views/admin/AdminOrdersPage'
import AdminOrderFormPage from './views/admin/AdminOrderFormPage'
import AdminOrderDetailPage from './views/admin/AdminOrderDetailPage'
import AdminProductsPage from './views/admin/AdminProductsPage'
import AdminCategoriesPage from './views/admin/AdminCategoriesPage'
import AdminCustomersPage from './views/admin/AdminCustomersPage'
import AdminReviewsPage from './views/admin/AdminReviewsPage'
import AdminReviewDetailPage from './views/admin/AdminReviewDetailPage'
import AdminNewsletterPage from './views/admin/AdminNewsletterPage'
import AdminContactPage from './views/admin/AdminContactPage'
import AdminDiscountsPage from './views/admin/AdminDiscountsPage'
import AdminCampaignsPage from './views/admin/AdminCampaignsPage'
import AdminContentPage from './views/admin/AdminContentPage'
import AdminAppearancePage from './views/admin/AdminAppearancePage'
import AdminReportsPage from './views/admin/AdminReportsPage'
import AdminSettingsPage from './views/admin/AdminSettingsPage'
import { RouterProvider } from './router'
import { fetchCurrentUser, selectIsAuthenticated } from './store/slices/authSlice'
import { fetchSettings } from './store/slices/settingsSlice'

const EXACT_ROUTES = {
  '/': <HomePage />,
  '/checkout': <CheckoutPage />,
  '/track-order': <OrderTrackingPage />,
  '/contact': <ContactPage />,
  '/returns': <ReturnPolicyPage />,
  '/login': <LoginPage mode="login" />,
  '/register': <LoginPage mode="register" />,
  '/admin/login': <AdminLoginPage />,
  '/admin': <AdminDashboard />,
  '/admin/orders': <AdminOrdersPage />,
  '/admin/orders/new': <AdminOrderFormPage />,
  '/admin/products': <AdminProductsPage />,
  '/admin/categories': <AdminCategoriesPage />,
  '/admin/customers': <AdminCustomersPage />,
  '/admin/reviews': <AdminReviewsPage />,
  '/admin/discounts': <AdminDiscountsPage />,
  '/admin/campaigns': <AdminCampaignsPage />,
  '/admin/newsletter': <AdminNewsletterPage />,
  '/admin/contact': <AdminContactPage />,
  '/admin/content': <AdminContentPage />,
  '/admin/appearance': <AdminAppearancePage />,
  '/admin/reports': <AdminReportsPage />,
  '/admin/settings': <AdminSettingsPage />,
}

function resolveRoute(pathname, initialProduct, initialReviewsData) {
  if (EXACT_ROUTES[pathname]) return { page: EXACT_ROUTES[pathname], params: {} }

  let match = pathname.match(/^\/shop\/([^/]+)\/reviews\/?$/)
  if (match) return { page: <ProductReviewsPage initialData={initialReviewsData} />, params: { slug: decodeURIComponent(match[1]) } }
  match = pathname.match(/^\/shop\/([^/]+)\/?$/)
  if (match) return { page: <ProductDetailPage initialProduct={initialProduct} />, params: { slug: decodeURIComponent(match[1]) } }
  match = pathname.match(/^\/order-confirmation\/([^/]+)\/?$/)
  if (match) return { page: <OrderConfirmationPage />, params: { orderNumber: decodeURIComponent(match[1]) } }
  match = pathname.match(/^\/admin\/orders\/([^/]+)\/(view|edit)\/?$/)
  if (match) return {
    page: match[2] === 'view' ? <AdminOrderDetailPage /> : <AdminOrderFormPage />,
    params: { id: decodeURIComponent(match[1]) },
  }
  match = pathname.match(/^\/admin\/reviews\/([^/]+)\/view\/?$/)
  if (match) return { page: <AdminReviewDetailPage />, params: { id: decodeURIComponent(match[1]) } }
  return { page: <NotFoundPage />, params: {} }
}

export default function App({ initialProduct = null, initialReviewsData = null }) {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const pathname = usePathname() || '/'
  const { page, params } = resolveRoute(pathname, initialProduct, initialReviewsData)
  const isProtectedAdmin = pathname.startsWith('/admin') && pathname !== '/admin/login'

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchCurrentUser())
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    dispatch(fetchSettings())
  }, [dispatch])

  const content = isProtectedAdmin ? (
    <ProtectedRoute requireAdmin>
      <AdminLayout />
    </ProtectedRoute>
  ) : page

  return <RouterProvider params={params} outlet={isProtectedAdmin ? page : null}>{content}</RouterProvider>
}
