import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const HostRoute = () => {
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const location = useLocation()
  if (!isAuthenticated)      return <Navigate to="/login" replace state={{ from: location }} />
  if (user?.role !== 'host') return <Navigate to="/" replace />
  return <Outlet />
}

export default HostRoute