import useTranslation from '../hooks/useTranslation.js';
import { useQuery } from '@tanstack/react-query'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
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
  Globe: () => <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="7"/><path d="M2 8h12M8 1c2.5 0 4 3 4 7s-1.5 7-4 7-4-3-4-7 1.5-7 4-7z"/></svg>,
}

const NavItem = ({ icon: IconComp, label, to, active, badge, onClick, locked = false }) => {
  const baseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    textDecoration: 'none',
    marginBottom: 2,
    transition: 'all 0.2s',
    background: active ? '#e8f5f0' : 'transparent',
    opacity: locked ? 0.58 : 1,
    cursor: locked ? 'not-allowed' : 'pointer',
  }

  const content = (
    <>
      <span style={{ color: active ? '#1a6b4a' : '#9ca3af', display: 'flex' }}>
        <IconComp />
      </span>
      <span style={{ fontSize: 13.5, color: active ? '#1a6b4a' : '#4b5563', fontWeight: active ? 600 : 500, flex: 1 }}>
        {label}
      </span>
      {locked ? (
        <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>
          Lock
        </span>
      ) : null}
      {!locked && badge > 0 && (
        <span style={{ background: '#1a6b4a', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
          {badge}
        </span>
      )}
    </>
  )

  if (locked) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ ...baseStyle, width: '100%', border: 'none', textAlign: 'left' }}
      >
        {content}
      </button>
    )
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      style={baseStyle}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f3f4f6' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {content}
    </Link>
  )
}

const HostLayout = () => {
  const { t } = useTranslation();

  const { user } = useSelector((s) => s.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [lockNoticeVisible, setLockNoticeVisible] = useState(false)

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
  const hasCompletedHostProfile = Boolean(user?.bio?.trim() && user?.phone?.trim())

  const path = location.pathname.replace(/\/+$/, '') || '/'
  const isMobile = windowWidth <= 1024
  const handleLockedNavigation = () => {
    setLockNoticeVisible(true)
    navigate('/host/profile', {
      state: {
        profileRequired: true,
        blockedPath: path,
      },
    })
    if (isMobile) setSidebarOpen(false)
  }

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
    overflowY: 'auto',
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

      <aside style={sidebarStyle} className="host-sidebar-scroll">
        {/* Logo */}
          <div style={{ padding: '0 24px 24px', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
            <Link to="/host/profile" onClick={() => isMobile && setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Avatar name={user?.name} src={user?.profilePic} size="lg" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Host User'}</span>
                <span style={{ fontSize: 11, color: '#1a6b4a', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Host Mode</span>
              </div>
            </Link>
          </div>

        {/* Nav Items */}
        <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem icon={Icon.Grid}       to="/host/dashboard"          label="Dashboard"    active={path === '/host/dashboard'} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.Experience} to="/host/experiences"        label={t("dashboard_experiences")} active={path.startsWith('/host/experiences')} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.Calendar} to="/host/bookings"  label={t("dashboard_bookings")} badge={pendingCount} active={path.startsWith('/host/bookings')} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.Wallet}   to="/host/wallet"    label="Wallet" active={path.startsWith('/host/wallet')} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.Star}     to="/host/reviews"   label={t("dashboard_reviews")} active={path.startsWith('/host/reviews')} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.Map}      to="/host/pathways"  label={t("nav_pathways")} active={path.startsWith('/host/pathways')} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.Story}    to="/host/stories/create" label={t("nav_stories")} active={path.startsWith('/host/stories')} onClick={hasCompletedHostProfile ? (() => isMobile && setSidebarOpen(false)) : handleLockedNavigation} locked={!hasCompletedHostProfile} />
          <NavItem icon={Icon.User}      to="/host/profile"   label={t("nav_profile")}  active={path === '/host/profile'} onClick={() => isMobile && setSidebarOpen(false)} />
        </div>

        {!hasCompletedHostProfile && (
          <div style={{ margin: '10px 12px 0', padding: '12px 14px', background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 12 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#166534' }}>
              Finish your profile to unlock the rest of the host dashboard.
            </p>
            <p style={{ margin: '6px 0 0', fontSize: 11, lineHeight: 1.5, color: '#166534' }}>
              Add your bio and phone number first, then all host tabs will open normally.
            </p>
            {lockNoticeVisible ? (
              <p style={{ margin: '8px 0 0', fontSize: 11, fontWeight: 600, color: '#15803d' }}>
                You were redirected here because that section is locked until your profile is complete.
              </p>
            ) : null}
          </div>
        )}

        {/* Nav: Action Bottom */}
        <div style={{ padding: '0 12px', marginTop: 'auto', paddingTop: 16, marginBottom: 16 }}>
          <NavItem icon={Icon.Globe} to="/" label="Traveler Mode" onClick={() => isMobile && setSidebarOpen(false)} />
          <NavItem icon={Icon.LogOut} to="/logout" label="Sign out" onClick={() => isMobile && setSidebarOpen(false)} />
        </div>
      </aside>

      <main style={mainStyle}>
        <Navbar isDashboard={true} onMenuToggle={() => setSidebarOpen(true)} />
        <div style={{ 
          padding: windowWidth <= 640 ? '8px 12px 24px' : '12px 24px 32px',
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
