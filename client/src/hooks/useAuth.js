import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../slices/authSlice.js'
import { useNavigate } from 'react-router-dom'

const useAuth = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const auth      = useSelector((s) => s.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return { ...auth, handleLogout }
}

export default useAuth