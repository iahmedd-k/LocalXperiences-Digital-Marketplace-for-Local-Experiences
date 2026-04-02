import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../slices/authSlice.js'
import Spinner from '../../components/common/Spinner.jsx'

export default function LogoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(logout())
    const timer = window.setTimeout(() => navigate('/'), 350)
    return () => window.clearTimeout(timer)
  }, [dispatch, navigate])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <Spinner size="md" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Signing you out</h1>
        <p className="mt-1 text-sm text-slate-500">Please wait a moment...</p>
      </div>
    </div>
  )
}
