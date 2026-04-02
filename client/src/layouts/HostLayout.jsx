import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { getAllHostBookings } from '../services/bookingService.js'
import Navbar from '../components/Navbar.jsx'
import Avatar from '../components/common/Avatar.jsx'

// Icons
const Icon = {
  Grid: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  Experience: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 12V5l6-3 6 3v7l-6 3-6-3z"/></svg>,
  User: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  Calendar: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="2" width="14" height="13" rx="2"/><path d="M5 2V1M11 2V1M1 6h14"/></svg>,
  Star: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 2 .7-4.1-3-2.9 4.2-.7L8 1z"/></svg>,
  Map: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="7" r="3"/><path d="M8 1C4.1 1 1 4.1 1 8c0 4.4 7 9 7 9s7-4.6 7-9c0-3.9-3.1-7-7-7z"/></svg>,
  Story: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 2.5h7.5a2 2 0 012 2V13l-2-1-2 1-2-1-2 1V2.5z"/><path d="M5.5 5.5h4M5.5 8h4"/></svg>,
  Wallet: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 4.5A1.5 1.5 0 013.5 3h8A1.5 1.5 0 0113 4.5V5h1a1 1 0 011 1v5a2 2 0 01-2 2H3.5A1.5 1.5 0 012 11.5v-7z"/><path d="M11 9h2.5"/><circle cx="11" cy="9" r=".8" fill="currentColor" stroke="none"/></svg>,
  Settings: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/></svg>,
  LogOut: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 4l4 4-4 4M15 8H5"/></svg>,
}

const NavItem = ({ icon: IconComp, label, to, active, badge, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 10, textDecoration: 'none',
      marginBottom: 2, transition: 'all 0.2s',
      background: active ? '#e8f5f0' : 'transparent',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
  >
    <span style={{ color: active ? '#1a6b4a' : '#9ca3af', display: 'flex' }}>
      <IconComp />
    </span>
    <span style={{ fontSize: 13.5, color: active ? '#1a6b4a' : '#4b5563', fontWeight: active ? 600 : 500, flex: 1 }}>
      {label}
    </span>
    {badge > 0 && (
      <span style={{ background: '#1a6b4a', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
        {badge}
      </span>
    )}
  </Link>
)

const HostLayout = () => {
  const { user } = useSelector((s) => s.auth)
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const { data: bookingsRaw } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: () => getAllHostBookings(),
  })
  const bookings = bookingsRaw || []
  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const path = location.pathname.replace(/\/+$/, '') || '/'
  const isMobile = windowWidth <= 1024

  // Responsive styles
  const sidebarStyle = {
    width: 250,
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 100,
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const mainStyle = {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: isMobile ? 0 : 250
  };

  if (isMobile) {
    sidebarStyle.transform = sidebarOpen ? 'translateX(0)' : 'translateX(-100%)';
    sidebarStyle.boxShadow = sidebarOpen ? '0 0 25px rgba(0,0,0,0.15)' : 'none';
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Poppins', sans-serif" }}>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 90, transition: 'opacity 0.3s' }}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Logo */}
          <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
            <Link to="/host/profile" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar name={user?.name} src={user?.profilePic} size="lg" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Host User'}</span>
                <span style={{ fontSize: 11, color: '#1a6b4a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Host</span>
              </div>
            </Link>
          </div>

        {/* Nav Items */}
        <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem icon={Icon.Grid}       to="/host/dashboard"          label="Dashboard"    active={path === '/host/dashboard'} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.Experience} to="/host/experiences"        label="Experiences" active={path.startsWith('/host/experiences')} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.Calendar} to="/host/bookings"  label="Bookings" badge={pendingCount} active={path.startsWith('/host/bookings')} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.Wallet}   to="/host/wallet"    label="Wallet" active={path.startsWith('/host/wallet')} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.Star}     to="/host/reviews"   label="Reviews" active={path.startsWith('/host/reviews')} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.Map}      to="/host/pathways"  label="Pathways" active={path.startsWith('/host/pathways')} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.Story}    to="/host/stories/create" label="Stories" active={path.startsWith('/host/stories')} onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.User}      to="/host/profile"   label="Profile"  active={path === '/host/profile'} onClick={() => isMobile && setSidebarOpen(false)} />
        </div>

        {/* Nav: Action Bottom */}
        <div style={{ padding: '0 12px', marginTop: 'auto', marginBottom: 16 }}>
          <NavItem icon={Icon.LogOut} to="/logout" label="Sign out" />
        </div>
      </aside>

      <main style={mainStyle}>
        <Navbar isDashboard={true} onMenuToggle={() => setSidebarOpen(true)} />
        <div style={{ 
          padding: windowWidth <= 640 ? '12px 16px 30px' : '20px 32px 40px',
          maxWidth: 1400, 
          margin: '0 auto', 
          width: '100%',
          boxSizing: 'border-box',
          flex: 1
        }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default HostLayout
