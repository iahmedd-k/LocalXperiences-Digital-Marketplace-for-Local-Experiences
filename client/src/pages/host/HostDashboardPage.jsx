import { useQuery }        from '@tanstack/react-query'
import { Link }            from 'react-router-dom'
import { useSelector }     from 'react-redux'
import { getHostExperiences }  from '../../services/experienceService.js'
import { getHostBookings }     from '../../services/bookingService.js'
import { getHostReviews }      from '../../services/reviewService.js'
import Navbar              from '../../components/common/Navbar.jsx'
import Footer              from '../../components/common/Footer.jsx'
import Spinner             from '../../components/common/Spinner.jsx'
import Avatar              from '../../components/common/Avatar.jsx'
import Badge               from '../../components/common/Badge.jsx'
import { formatPrice, formatDate } from '../../utils/formatters.js'

const StatCard = ({ icon, label, value, sub, color = 'orange' }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-500',
    green:  'bg-green-50  text-green-500',
    blue:   'bg-blue-50   text-blue-500',
    purple: 'bg-purple-50 text-purple-500',
  }
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="font-clash text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

const HostDashboardPage = () => {
  const { user } = useSelector((s) => s.auth)

  const { data: experiences = [], isLoading: expLoading } = useQuery({
    queryKey: ['hostExperiences'],
    queryFn:  () => getHostExperiences().then((r) => r.data.data),
  })

  const { data: bookingsData, isLoading: bookLoading } = useQuery({
    queryKey: ['hostBookings'],
    queryFn:  () => getHostBookings().then((r) => r.data),
  })

  const { data: reviews = [], isLoading: revLoading } = useQuery({
    queryKey: ['hostReviews'],
    queryFn:  () => getHostReviews().then((r) => r.data.data),
  })

  const bookings     = bookingsData?.data || []
  const totalRevenue = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed')
                                .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  const avgRating    = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const pendingBookings   = bookings.filter((b) => b.status === 'pending')
  const recentBookings    = bookings.slice(0, 5)
  const activeExperiences = experiences.filter((e) => e.isActive)

  const isLoading = expLoading || bookLoading || revLoading

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} src={user?.profilePic} size="lg" />
            <div>
              <h1 className="font-clash text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
              <p className="text-gray-500 text-sm">Here's what's happening with your experiences</p>
            </div>
          </div>
          <Link
            to="/host/experiences/create"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition hidden sm:block"
          >
            + New Experience
          </Link>
        </div>

        {isLoading ? <Spinner size="lg" className="py-20" /> : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon="🏠" label="Active Listings"  value={activeExperiences.length} sub={`${experiences.length} total`} color="orange" />
              <StatCard icon="💰" label="Total Revenue"    value={formatPrice(totalRevenue)} sub="Confirmed bookings" color="green" />
              <StatCard icon="📅" label="Total Bookings"   value={bookings.length} sub={`${pendingBookings.length} pending`} color="blue" />
              <StatCard icon="⭐" label="Average Rating"   value={avgRating} sub={`${reviews.length} reviews`} color="purple" />
            </div>

            {/* Pending bookings alert */}
            {pendingBookings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className="font-semibold text-yellow-800">
                      {pendingBookings.length} pending booking{pendingBookings.length > 1 ? 's' : ''} awaiting your attention
                    </p>
                    <p className="text-sm text-yellow-600">Respond promptly to keep your response rate high</p>
                  </div>
                </div>
                <Link to="/host/bookings" className="text-sm font-semibold text-yellow-700 hover:underline flex-shrink-0">View All →</Link>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent bookings */}
              <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-clash text-lg font-bold text-gray-900">Recent Bookings</h2>
                  <Link to="/host/bookings" className="text-sm text-orange-500 font-semibold hover:underline">View all →</Link>
                </div>

                {recentBookings.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">📅</div>
                    <p className="text-gray-400 text-sm">No bookings yet</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-gray-50">
                    {recentBookings.map((b) => (
                      <div key={b._id} className="flex items-center gap-4 py-3">
                        <Avatar name={b.userId?.name} src={b.userId?.profilePic} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{b.userId?.name}</p>
                          <p className="text-xs text-gray-400 truncate">{b.experienceId?.title}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-orange-500">{formatPrice(b.totalPrice)}</p>
                          <Badge variant={b.status === 'confirmed' ? 'green' : b.status === 'pending' ? 'yellow' : b.status === 'cancelled' ? 'red' : 'blue'} className="capitalize text-xs">{b.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My listings */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-clash text-lg font-bold text-gray-900">My Listings</h2>
                  <Link to="/host/experiences/create" className="text-sm text-orange-500 font-semibold hover:underline">+ Add</Link>
                </div>

                {experiences.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">🏠</div>
                    <p className="text-gray-400 text-sm mb-3">No listings yet</p>
                    <Link to="/host/experiences/create" className="text-sm font-semibold text-orange-500 hover:underline">Create your first →</Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {experiences.slice(0, 5).map((exp) => (
                      <div key={exp._id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                          {exp.photos?.[0] ? <img src={exp.photos[0]} alt="" className="w-full h-full object-cover rounded-xl"/> : '🌍'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{exp.title}</p>
                          <p className="text-xs text-gray-400">{formatPrice(exp.price)} · ⭐ {exp.rating?.average?.toFixed(1) || '—'}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Link to={`/host/experiences/${exp._id}/edit`}
                            className="text-xs text-gray-400 hover:text-orange-500 transition p-1">✏️</Link>
                          <Link to={`/experiences/${exp._id}`}
                            className="text-xs text-gray-400 hover:text-orange-500 transition p-1">👁️</Link>
                        </div>
                      </div>
                    ))}
                    {experiences.length > 5 && (
                      <p className="text-xs text-center text-gray-400 mt-1">+{experiences.length - 5} more listings</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {[
                { to: '/host/experiences/create', icon: '➕', label: 'New Experience' },
                { to: '/host/bookings',           icon: '📅', label: 'Manage Bookings' },
                { to: '/host/reviews',            icon: '⭐', label: 'View Reviews' },
                { to: '/profile',                 icon: '👤', label: 'Edit Profile' },
              ].map((l) => (
                <Link key={l.to} to={l.to}
                  className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-orange-200 hover:shadow-md transition group">
                  <div className="text-2xl mb-2">{l.icon}</div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-orange-500 transition">{l.label}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default HostDashboardPage