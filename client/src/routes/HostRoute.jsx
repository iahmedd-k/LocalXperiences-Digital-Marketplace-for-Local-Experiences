import useTranslation from '../hooks/useTranslation.js';
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const HostRoute = () => {
  const { t } = useTranslation();

  const { isAuthenticated, user, isInitializing } = useSelector((s) => s.auth)
  const location = useLocation()
  const hasHostProfile = Boolean(user?.bio?.trim() && user?.phone?.trim())
  const isProfileRoute = location.pathname === '/host/profile' || location.pathname === '/host/setup-profile'

  if (isInitializing) return <div className="flex items-center justify-center h-screen">{t("browse_loading")}</div>
  if (!isAuthenticated)      return <Navigate to="/login" replace state={{ from: location }} />
  if (user?.role !== 'host') return <Navigate to="/become-host" replace />
  if (!hasHostProfile && !isProfileRoute) {
    return (
      <Navigate
        to="/host/profile"
        replace
        state={{
          profileRequired: true,
          blockedPath: location.pathname,
        }}
      />
    )
  }
  return <Outlet />
}

export default HostRoute
