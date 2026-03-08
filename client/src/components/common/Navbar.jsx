import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../slices/authSlice.js'
import Avatar from './Avatar.jsx'
import Button from './Button.jsx'

const Navbar = () => {
  const dispatch    = useDispatch()
  const navigate    = useNavigate()
  const { user, isAuthenticated } = useSelector((s) => s.auth)
  const [menuOpen, setMenuOpen]   = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-clash text-xl font-bold text-gray-900">
          Local<span className="text-orange-500">X</span>periences
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Home</Link>
          <Link to="/search"   className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Find Experiences</Link>
          <a
            href="/#how-it-works"
            className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors"
            onClick={(e) => {
              if (window.location.pathname !== '/') {
                e.preventDefault();
                window.location.href = '/#how-it-works';
              }
            }}
          >How It Works</a>
          {isAuthenticated && user?.role === 'host' && (
            <Link to="/host/dashboard" className="text-sm font-semibold text-gray-600 hover:text-orange-500 transition-colors">Host Dashboard</Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition"
              >
                <Avatar name={user?.name} src={user?.profilePic} size="sm" />
                <span className="hidden md:block text-sm font-semibold text-gray-700">{user?.name?.split(' ')[0]}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                  <Link to="/profile"       onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">👤 My Profile</Link>
                  <Link to="/my-bookings"   onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📅 My Bookings</Link>
                  <Link to="/my-itineraries" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">🗺️ Itineraries</Link>
                  {user?.role === 'host' && <>
                    <div className="border-t border-gray-100 my-1"/>
                    <Link to="/host/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">🏠 Host Dashboard</Link>
                  </>}
                  <div className="border-t border-gray-100 my-1"/>
                  <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Click outside closes menu */}
      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />}
    </nav>
  )
}

export default Navbar