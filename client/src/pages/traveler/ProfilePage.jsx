import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { updateProfile, changePassword } from '../../services/authService.js'
import { getMyBookings } from '../../services/bookingService.js'
import { getUserRewards } from '../../services/rewardsService.js'
import RewardsSummaryCard from '../../components/rewards/RewardsSummaryCard.jsx'
import MilestoneList from '../../components/rewards/MilestoneList.jsx'
import { getMyReviews } from '../../services/reviewService.js'
import { updateUser } from '../../slices/authSlice.js'
import { getErrorMessage } from '../../utils/helpers.js'
import { formatDate, formatPrice } from '../../utils/formatters.js'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import Spinner from '../../components/common/Spinner.jsx'

// ─── Tiny inline icons ────────────────────────────────────────────────────────
const Ico = {
  User: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  Lock: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 016 0v2"/></svg>,
  Calendar: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="13" rx="2"/><path d="M5 2V1M11 2V1M1 6h14"/></svg>,
  Clock: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/></svg>,
  Star: () => <svg width="12" height="12" viewBox="0 0 16 16" fill="#d97706"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 2 .7-4.1-3-2.9 4.2-.7L8 1z"/></svg>,
  Gift: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="6" width="14" height="9" rx="1"/><path d="M8 6v9M1 10h14M8 6a2 2 0 01-2-2 2 2 0 014 0 2 2 0 01-2 2z"/></svg>,
  Camera: () => <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 5h14v9H1zM6 3l1-2h2l1 2M8 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"/></svg>,
  ChevronRight: () => <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4l4 4-4 4"/></svg>,
  Eye: () => <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>,
}

// ─── Avatar initials ──────────────────────────────────────────────────────────
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
const AvatarEl = ({ name = '', src, size = 40 }) => (
  src
    ? <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: '#1a6b4a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.32, fontWeight: 600, color: 'white', flexShrink: 0, letterSpacing: '0.5px' }}>
        {initials(name)}
      </div>
)

// ─── Form primitives ──────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <label style={{ fontSize: 11, fontWeight: 500, color: '#6b7280', letterSpacing: '0.2px' }}>{label}</label>
    {children}
  </div>
)

const inputStyle = {
  border: '0.5px solid #e5e7eb', borderRadius: 8,
  padding: '8px 12px', fontSize: 13, color: '#111827',
  outline: 'none', background: 'white', width: '100%',
  fontFamily: 'inherit', transition: 'border-color 0.15s',
}

const Inp = ({ label, type = 'text', value, onChange, placeholder }) => (
  <Field label={label}>
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={inputStyle}
      onFocus={e => e.target.style.borderColor = '#1a6b4a'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    />
  </Field>
)

const Sel = ({ label, value, onChange, options }) => (
  <Field label={label}>
    <select
      value={value} onChange={onChange}
      style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
      onFocus={e => e.target.style.borderColor = '#1a6b4a'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
)

// ─── Badge ────────────────────────────────────────────────────────────────────
const statusStyle = {
  confirmed: { background: '#dcfce7', color: '#166534' },
  pending:   { background: '#fef9c3', color: '#854d0e' },
  completed: { background: '#dbeafe', color: '#1e40af' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
}
const StatusBadge = ({ status }) => (
  <span style={{ ...( statusStyle[status] || { background: '#f3f4f6', color: '#6b7280' }), fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 4, textTransform: 'capitalize' }}>
    {status}
  </span>
)

// ─── Submit button ────────────────────────────────────────────────────────────
const SubmitBtn = ({ loading, children }) => (
  <button
    type="submit" disabled={loading}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: loading ? '#9ca3af' : '#1a6b4a', color: 'white', fontSize: 12, fontWeight: 500, padding: '8px 18px', borderRadius: 8, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', alignSelf: 'flex-start' }}
  >
    {loading ? 'Saving…' : children}
  </button>
)

// ─── Section heading ──────────────────────────────────────────────────────────
const SectionHead = ({ children }) => (
  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 14, paddingBottom: 10, borderBottom: '0.5px solid #f3f4f6' }}>
    {children}
  </div>
)

// ─── Booking row ──────────────────────────────────────────────────────────────
const BookingRow = ({ booking }) => {
  const amount = typeof booking.amount === 'number' ? booking.amount / 100 : (booking.totalPrice || 0)
  return (
    <div style={{ padding: '12px 0', borderBottom: '0.5px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
          {booking.experienceId?.title || 'Experience'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#6b7280' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Ico.Calendar />
            {booking.slot?.date ? formatDate(booking.slot.date) : 'Date pending'}
          </span>
          {booking.slot?.startTime && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Ico.Clock /> {booking.slot.startTime}
            </span>
          )}
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
          <StatusBadge status={booking.status} />
          {booking.collaboration?.groupCode && (
            <span style={{ fontSize: 10, color: '#1a6b4a', background: '#e8f5f0', padding: '2px 7px', borderRadius: 4 }}>
              Group: {booking.collaboration.groupCode}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', flexShrink: 0 }}>
        {formatPrice(amount)}
      </div>
    </div>
  )
}

// ─── Review row ───────────────────────────────────────────────────────────────
const ReviewRow = ({ review }) => (
  <div style={{ padding: '12px 0', borderBottom: '0.5px solid #f3f4f6' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{review.experienceId?.title || 'Experience'}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <Ico.Star />
        <span style={{ fontSize: 12, fontWeight: 600, color: '#d97706' }}>{Number(review.rating || 0).toFixed(1)}</span>
      </div>
    </div>
    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55, margin: 0 }}>{review.comment}</p>
    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>{formatDate(review.createdAt)}</div>
  </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const ProfilePage = ({ hideLayout = false }) => {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profileFile, setProfileFile] = useState(null)
  const [profilePreview, setProfilePreview] = useState(user?.profilePic || '')

  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    languages: Array.isArray(user?.languages) ? user.languages.join(', ') : '',
    travelerPreferences: {
      categories:        Array.isArray(user?.travelerPreferences?.categories) ? user.travelerPreferences.categories.join(', ') : '',
      interests:         Array.isArray(user?.travelerPreferences?.interests)  ? user.travelerPreferences.interests.join(', ')  : '',
      cities:            Array.isArray(user?.travelerPreferences?.cities)     ? user.travelerPreferences.cities.join(', ')     : '',
      preferredLanguage: user?.travelerPreferences?.preferredLanguage || 'en',
    },
  })

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => getMyBookings().then((r) => r.data.data),
  })

  const { data: reviewsRes, isLoading: reviewsLoading } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () => getMyReviews().then((r) => r.data),
  })
  const reviews = reviewsRes?.data || []

  const { data: rewardsRes, isLoading: rewardsLoading } = useQuery({
    queryKey: ['userRewards', user?._id],
    queryFn: () => getUserRewards(user._id).then((r) => r.data.data),
    enabled: !!user?._id,
  })
  const rewards = rewardsRes || {}

  const currentBookings = useMemo(() => bookings.filter(b => ['pending', 'confirmed'].includes(b.status)), [bookings])
  const tripsHistory    = useMemo(() => bookings.filter(b => ['completed', 'cancelled'].includes(b.status)), [bookings])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleProfile = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const payload = new FormData()
      payload.append('name', profile.name)
      payload.append('bio', profile.bio)
      payload.append('languages', profile.languages)
      payload.append('travelerPreferences', JSON.stringify({
        categories:        profile.travelerPreferences.categories.split(',').map(s => s.trim()).filter(Boolean),
        interests:         profile.travelerPreferences.interests.split(',').map(s => s.trim()).filter(Boolean),
        cities:            profile.travelerPreferences.cities.split(',').map(s => s.trim()).filter(Boolean),
        preferredLanguage: profile.travelerPreferences.preferredLanguage,
        // removed preferredDuration and budget
      }))
      if (profileFile) payload.append('profilePic', profileFile)
      const { data } = await updateProfile(payload)
      dispatch(updateUser(data.data))
      toast.success('Profile updated')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match')
    if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters')
    try {
      setLoading(true)
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword })
      toast.success('Password changed')
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const onImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setProfileFile(file)
    setProfilePreview(URL.createObjectURL(file))
  }

  // ── Tab config ─────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'profile',  label: 'Profile',         icon: Ico.User },
    { id: 'password', label: 'Password',         icon: Ico.Lock },
    { id: 'bookings', label: 'Current bookings', icon: Ico.Calendar },
    { id: 'history',  label: 'Trip history',     icon: Ico.Eye },
    { id: 'reviews',  label: 'Reviews',          icon: Ico.Star },
    { id: 'rewards',  label: 'Rewards',          icon: Ico.Gift },
  ]

  const isTabLoading =
    (tab === 'bookings' || tab === 'history') ? bookingsLoading
    : tab === 'reviews' ? reviewsLoading
    : tab === 'rewards' ? rewardsLoading
    : false

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {!hideLayout && <Navbar />}

      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', padding: '28px 20px', flex: 1 }}>

        {/* ── Profile header ─────────────────────────────────────────────── */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <AvatarEl name={user?.name} src={profilePreview || user?.profilePic} size={52} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', letterSpacing: '-0.2px' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{user?.email}</div>
              <span style={{
                display: 'inline-block', marginTop: 5, fontSize: 10, fontWeight: 500,
                padding: '2px 8px', borderRadius: 4, textTransform: 'capitalize',
                ...(user?.role === 'host'
                  ? { background: '#e8f5f0', color: '#1a6b4a' }
                  : { background: '#dbeafe', color: '#1e40af' }),
              }}>
                {user?.role}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: 'Trips',    value: tripsHistory.length },
              { label: 'Upcoming', value: currentBookings.length },
              { label: 'Reviews',  value: reviews.length },
              { label: 'Points',   value: rewards?.checkInCount || 0 },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', textAlign: 'center', minWidth: 60 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 3, letterSpacing: '0.2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
          {tabs.map(t => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 7, fontSize: 12,
                  fontWeight: active ? 500 : 400, border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  background: active ? '#1a6b4a' : 'white',
                  color: active ? 'white' : '#6b7280',
                  boxShadow: active ? 'none' : '0 0 0 0.5px #e5e7eb',
                }}
              >
                <span style={{ color: active ? 'rgba(255,255,255,0.8)' : '#9ca3af', display: 'flex' }}><t.icon /></span>
                {t.label}
              </button>
            )
          })}
        </div>

        {/* ── Content panel ──────────────────────────────────────────────── */}
        <div style={{ background: 'white', border: '0.5px solid #e5e7eb', borderRadius: 12, padding: '20px 24px' }}>

          {isTabLoading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <Spinner size="md" />
            </div>
          )}

          {/* Profile edit */}
          {!isTabLoading && tab === 'profile' && (
            <form onSubmit={handleProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <SectionHead>Edit profile</SectionHead>

              {/* Photo upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f9fafb', border: '0.5px solid #e5e7eb', borderRadius: 10, padding: '14px 16px' }}>
                <AvatarEl name={profile.name || user?.name} src={profilePreview || user?.profilePic} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Profile photo</div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: '#1a6b4a', background: '#e8f5f0', padding: '5px 10px', borderRadius: 6, cursor: 'pointer' }}>
                    <Ico.Camera /> Choose photo
                    <input type="file" accept="image/*" onChange={onImageChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label="Full name"  value={profile.name}      onChange={e => setProfile({...profile, name: e.target.value})} />
                <Inp label="Languages" value={profile.languages}  onChange={e => setProfile({...profile, languages: e.target.value})} placeholder="English, Urdu" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Inp label="Preferred categories" value={profile.travelerPreferences.categories} onChange={e => setProfile({...profile, travelerPreferences: {...profile.travelerPreferences, categories: e.target.value}})} placeholder="food, culture" />
                <Inp label="Top interests"        value={profile.travelerPreferences.interests}  onChange={e => setProfile({...profile, travelerPreferences: {...profile.travelerPreferences, interests: e.target.value}})}  placeholder="street food, art" />
              </div>

              <Inp label="Preferred cities" value={profile.travelerPreferences.cities} onChange={e => setProfile({...profile, travelerPreferences: {...profile.travelerPreferences, cities: e.target.value}})} placeholder="Lahore, Karachi" />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <Sel
                  label="Language"
                  value={profile.travelerPreferences.preferredLanguage}
                  onChange={e => setProfile({...profile, travelerPreferences: {...profile.travelerPreferences, preferredLanguage: e.target.value}})}
                  options={[{ value: 'en', label: 'English' }, { value: 'ur', label: 'Urdu' }, { value: 'fr', label: 'French' }, { value: 'es', label: 'Spanish' }]}
                />
                {/* Removed Duration and Budget selectors */}
              </div>

              <Field label="Bio">
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={e => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell others about yourself…"
                  style={{ ...inputStyle, resize: 'none', lineHeight: 1.55 }}
                  onFocus={e => e.target.style.borderColor = '#1a6b4a'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </Field>

              <SubmitBtn loading={loading}>Save changes</SubmitBtn>
            </form>
          )}

          {/* Password */}
          {!isTabLoading && tab === 'password' && (
            <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
              <SectionHead>Change password</SectionHead>
              <Inp label="Current password" type="password" value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
              <Inp label="New password"     type="password" value={passwords.newPassword}     onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
              <Inp label="Confirm password" type="password" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
              <SubmitBtn loading={loading}>Update password</SubmitBtn>
            </form>
          )}

          {/* Current bookings */}
          {!isTabLoading && tab === 'bookings' && (
            <>
              <SectionHead>Current bookings · {currentBookings.length}</SectionHead>
              {currentBookings.length
                ? currentBookings.map(b => <BookingRow key={b._id} booking={b} />)
                : <p style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>No upcoming bookings.</p>
              }
            </>
          )}

          {/* Trip history */}
          {!isTabLoading && tab === 'history' && (
            <>
              <SectionHead>Trip history · {tripsHistory.length}</SectionHead>
              {tripsHistory.length
                ? tripsHistory.map(b => <BookingRow key={b._id} booking={b} />)
                : <p style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>No trip history yet.</p>
              }
            </>
          )}

          {/* Reviews */}
          {!isTabLoading && tab === 'reviews' && (
            <>
              <SectionHead>My reviews · {reviews.length}</SectionHead>
              {reviews.length
                ? reviews.map(r => <ReviewRow key={r._id} review={r} />)
                : <p style={{ fontSize: 13, color: '#9ca3af', padding: '20px 0' }}>No reviews posted yet.</p>
              }
            </>
          )}

          {/* Rewards */}
          {!isTabLoading && tab === 'rewards' && (
            <>
              <SectionHead>Rewards & milestones</SectionHead>
              {rewards && (
                <>
                  <RewardsSummaryCard checkInCount={rewards.checkInCount} badges={rewards.earnedBadges} />
                  <div style={{ marginTop: 16 }}>
                    <MilestoneList />
                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>

      {!hideLayout && <Footer />}
    </div>
  )
}

export default ProfilePage