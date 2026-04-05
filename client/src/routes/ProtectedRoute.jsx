import useTranslation from '../hooks/useTranslation.js';
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const ProtectedRoute = () => {
  const { t } = useTranslation();

  const { isAuthenticated, isInitializing } = useSelector((s) => s.auth)
  const location = useLocation()

  // While app is initializing (rehydrating token from localStorage), don't redirect
  if (isInitializing) {
    return <div className="flex items-center justify-center h-screen">{t("browse_loading")}</div>
  }

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />
}

export default ProtectedRoute