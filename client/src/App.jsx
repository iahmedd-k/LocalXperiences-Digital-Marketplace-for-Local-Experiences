import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from './slices/authSlice.js'
import AppRouter from './routes/AppRouter.jsx'

const App = () => {
  const dispatch = useDispatch()

  // Rehydrate auth from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user  = localStorage.getItem('user')
    if (token && user) {
      dispatch(setCredentials({ token, user: JSON.parse(user) }))
    }
  }, [])

  return <AppRouter />
}

export default App