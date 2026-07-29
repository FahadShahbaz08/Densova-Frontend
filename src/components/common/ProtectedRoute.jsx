import { Navigate, useLocation } from '../../router'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin } from '../../store/slices/authSlice'

/**
 * Guards admin routes. Redirects to /admin/login if not authenticated
 * or if the user is authenticated but not an admin.
 */
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const isAdmin = useSelector(selectIsAdmin)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }
  return children
}
