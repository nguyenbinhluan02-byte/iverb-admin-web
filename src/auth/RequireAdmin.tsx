import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

export function RequireAdmin() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <div className="min-h-screen" />
  if (status !== 'admin')
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
