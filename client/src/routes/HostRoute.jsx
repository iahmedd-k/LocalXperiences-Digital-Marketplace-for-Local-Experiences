import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const HostRoute = () => {
  const { isAuthenticated, user, isInitializing } = useSelector((s) => s.auth)
  const location = useLocation()
  const hasHostProfile = Boolean(user?.bio?.trim() && user?.phone?.trim())

  if (isInitializing) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!isAuthenticated)      return <Navigate to="/login" replace state={{ from: location }} />
  if (user?.role !== 'host') return <Navigate to="/become-host" replace />
  if (!hasHostProfile)       return <Navigate to="/host/setup-profile" replace />
  return <Outlet />
}

export default HostRoute