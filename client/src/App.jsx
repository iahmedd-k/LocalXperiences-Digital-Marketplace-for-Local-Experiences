import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setCredentials } from './slices/authSlice.js'
import AppRouter from './routes/AppRouter.jsx'
import GlobalStyles from './components/common/GlobalStyles.jsx'

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

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: "#f0faf5", minHeight: "100vh", color: "#0f2d1a" }}>
      <GlobalStyles />
      <AppRouter />
    </div>
  )
}

export default App