import { useEffect }        from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch }      from 'react-redux'
import { setCredentials }   from '../../slices/authSlice.js'
import { getMe }            from '../../services/authService.js'
import Spinner              from '../../components/common/Spinner.jsx'

const GoogleCallback = () => {
  const [params]  = useSearchParams()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (!token) { navigate('/login'); return }

    localStorage.setItem('token', token)

    getMe()
      .then(({ data }) => {
        dispatch(setCredentials({ user: data.data, token }))
        navigate('/')
      })
      .catch(() => navigate('/login'))
  }, [dispatch, navigate, params])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-600 font-satoshi">Signing you in...</p>
      </div>
    </div>
  )
}

export default GoogleCallback