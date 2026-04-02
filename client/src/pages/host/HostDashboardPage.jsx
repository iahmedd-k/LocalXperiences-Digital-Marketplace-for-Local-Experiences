import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { getHostExperiences, deleteExperience } from '../../services/experienceService.js'
import { cancelHostBooking, completeHostBooking, getAllHostBookings } from '../../services/bookingService.js'
import { getHostReviews } from '../../services/reviewService.js'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner.jsx'
import { formatDate, formatPrice } from '../../utils/formatters.js'

// ─── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Grid: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/>
    </svg>
  ),
  Experience: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M2 12V5l6-3 6 3v7l-6 3-6-3z"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="1" y="2" width="14" height="13" rx="2"/><path d="M5 2V1M11 2V1M1 6h14"/>
    </svg>
  ),
  Star: ({ filled = false, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16"
      fill={filled ? '#d97706' : 'none'}
      stroke={filled ? 'none' : '#d97706'}
      strokeWidth="1.4">
      <path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.3l-3.7 2 .7-4.1-3-2.9 4.2-.7L8 1z"/>
    </svg>
  ),
  Map: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="7" r="3"/><path d="M8 1C4.1 1 1 4.1 1 8c0 4.4 7 9 7 9s7-4.6 7-9c0-3.9-3.1-7-7-7z"/>
    </svg>
  ),
  Settings: () => (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="8" cy="8" r="2.5"/>
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.2 3.2l1.4 1.4M11.4 11.4l1.4 1.4M3.2 12.8l1.4-1.4M11.4 4.6l1.4-1.4"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2v12M2 8h12"/>
    </svg>
  ),
  Dollar: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6"/><path d="M8 4v8M6 6h3a1.5 1.5 0 010 3H6v1h3"/>
    </svg>
  ),
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
const BADGE = {
  green:  'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  blue:   'bg-blue-100 text-blue-800',
  red:    'bg-red-100 text-red-800',
  gray:   'bg-slate-100 text-slate-600',
}
const badgeVariant = (s) => ({ confirmed:'green', pending:'yellow', completed:'blue', cancelled:'red' }[s] ?? 'gray')

const Badge = ({ variant = 'gray', children }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${BADGE[variant]}`}>
    {children}
  </span>
)

// ─── Avatar ─────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ['#4f46e5','#059669','#d97706','#e11d48','#7c3aed','#0891b2','#65a30d']
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const Avatar = ({ name, size = 40 }) => (
  <div
    className="flex-shrink-0 flex items-center justify-center rounded-full font-semibold text-white"
    style={{ width: size, height: size, background: avatarColor(name), fontSize: size * 0.35 }}
  >
    {initials(name)}
  </div>
)

// ─── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ iconBg, icon: IconComp, label, value, sub, trendUp }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <IconComp />
      </div>
      {trendUp && (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
          {trendUp}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">{sub}</p>
    </div>
  </div>
)

// ─── Action Card ───────────────────────────────────────────────────────────────
const ActionCard = ({ to, iconBg, iconColor, icon: IconComp, label, desc }) => (
  <Link
    to={to}
    className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3 no-underline
               transition-all duration-200 hover:border-emerald-300 hover:-translate-y-0.5 hover:shadow-md group"
  >
    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
         style={{ background: iconBg, color: iconColor }}>
      <IconComp />
    </div>
    <div className="min-w-0">
      <p className="text-[12px] font-bold text-slate-900 leading-snug">{label}</p>
      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
    </div>
  </Link>
)

// ─── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ rating, text, author, experience, date }) => (
  <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => <Icon.Star key={i} filled={i <= rating} size={13} />)}
    </div>
    <p className="text-[13px] text-slate-500 leading-relaxed italic flex-1">"{text}"</p>
    <div className="border-t border-slate-50 pt-3">
      <p className="text-[13px] font-bold text-slate-900">{author}</p>
      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{experience} • {date}</p>
    </div>
  </div>
)

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ icon, text, sub, children }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
      {icon}
    </div>
    <p className="text-[13px] font-bold text-slate-500">{text}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-1.5 max-w-[200px] leading-relaxed">{sub}</p>}
    {children}
  </div>
)

// ─── Panel wrapper ─────────────────────────────────────────────────────────────
const Panel = ({ children }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
    {children}
  </div>
)

const PanelHeader = ({ icon: IconComp, title, count, action, actionTo }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/60">
    <div className="flex items-center gap-2">
      <span className="text-emerald-700"><IconComp /></span>
      <span className="text-[13px] font-bold text-slate-900">{title}</span>
      {count > 0 && (
        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{count}</span>
      )}
    </div>
    {action && (
      <Link to={actionTo} className="text-[12px] font-bold text-emerald-700 no-underline hover:text-emerald-800">
        {action}
      </Link>
    )}
  </div>
)

// ─── Main Component ────────────────────────────────────────────────────────────
const HostDashboardPage = () => {
  const queryClient = useQueryClient()
  const { user } = useSelector((s) => s.auth)
  const [deletingId, setDeletingId] = useState(null)
  const [bookingAction, setBookingAction] = useState({ id: null, type: null })

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: experiences = [], isLoading: expLoading, refetch } = useQuery({
    queryKey: ['hostExperiences'],
    queryFn: () => getHostExperiences().then((r) => r.data.data),
  })

  const { data: bookingsRaw, isLoading: bookLoading } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: () => getAllHostBookings(),
  })

  const { data: reviews = [], isLoading: revLoading } = useQuery({
    queryKey: ['hostReviews'],
    queryFn: () => getHostReviews().then((r) => r.data.data),
  })

  const bookings = bookingsRaw || []
  const isLoading = expLoading || bookLoading || revLoading

  // ── Derived ───────────────────────────────────────────────────────────────
  const getBookingTotal = (b) =>
    typeof b?.pricing?.totalAfterDiscount === 'number' ? b.pricing.totalAfterDiscount / 100
      : typeof b?.totalPrice === 'number' ? b.totalPrice
      : Number(b?.experienceId?.price || 0) * Number(b?.guestCount || 1)

  const now = new Date()
  const thirtyDaysAgo = new Date(now - 30 * 86400000)
  const sixtyDaysAgo  = new Date(now - 60 * 86400000)

  const successfulBookings = bookings.filter(b =>
    ['confirmed','completed','upcoming'].includes(b.status)
  )
  const totalRevenue   = successfulBookings.reduce((s, b) => s + getBookingTotal(b), 0)
  const recentRevenue  = successfulBookings.filter(b => new Date(b.createdAt) > thirtyDaysAgo).reduce((s, b) => s + getBookingTotal(b), 0)
  const previousRevenue = successfulBookings.filter(b => { const d = new Date(b.createdAt); return d > sixtyDaysAgo && d <= thirtyDaysAgo }).reduce((s, b) => s + getBookingTotal(b), 0)
  const potentialRevenue = bookings.filter(b => ['pending','pending_payment','partially_paid'].includes(b.status)).reduce((s, b) => s + getBookingTotal(b), 0)

  let revenueTrend = null
  if (previousRevenue > 0) {
    const change = ((recentRevenue - previousRevenue) / previousRevenue) * 100
    revenueTrend = `${change >= 0 ? '↑' : '↓'} ${Math.abs(change).toFixed(0)}%`
  } else if (recentRevenue > 0) {
    revenueTrend = 'New'
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const pendingBookings  = bookings.filter(b => b.status === 'pending')
  const recentBookings   = bookings.slice(0, 5)
  const activeExperiences = experiences.filter(e => e.isActive)
  const pendingCount = pendingBookings.length

  // ── Mutations ─────────────────────────────────────────────────────────────
  const refreshBookings = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: ['hostBookings'] }),
    queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
  ])

  const cancelMutation = useMutation({
    mutationFn: cancelHostBooking,
    onSuccess: async () => { toast.success('Booking cancelled'); await refreshBookings() },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to cancel'),
    onSettled: () => setBookingAction({ id: null, type: null }),
  })

  const completeMutation = useMutation({
    mutationFn: completeHostBooking,
    onSuccess: async () => { toast.success('Marked as completed'); await refreshBookings() },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to complete'),
    onSettled: () => setBookingAction({ id: null, type: null }),
  })

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience? This cannot be undone.')) return
    setDeletingId(id)
    try { await deleteExperience(id); toast.success('Experience removed'); refetch() }
    catch (e) { toast.error(e?.response?.data?.message || 'Failed to delete') }
    finally { setDeletingId(null) }
  }

  const handleCancel = (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setBookingAction({ id, type: 'cancel' })
    cancelMutation.mutate(id)
  }

  const handleComplete = (id) => {
    if (!window.confirm('Mark as completed?')) return
    setBookingAction({ id, type: 'complete' })
    completeMutation.mutate(id)
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const firstName = user?.name?.split(' ')[0] ?? 'Host'

  return (
    <div className="pb-12">

      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Morning, {firstName}
          </h1>
          <p className="text-[13px] text-slate-400 font-medium mt-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            {today}
          </p>
        </div>
        <Link
          to="/host/experiences/create"
          className="inline-flex items-center gap-2 bg-emerald-900 text-white text-[13px] font-bold
                     px-4 py-2.5 rounded-xl no-underline shadow-md shadow-emerald-900/20
                     hover:bg-emerald-800 transition-colors whitespace-nowrap"
        >
          <Icon.Plus />
          <span>New Experience</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* ── Pending alert ── */}
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <p className="flex-1 text-[13px] text-amber-900 font-semibold">
                <strong>{pendingCount} booking{pendingCount > 1 ? 's' : ''}</strong> pending your confirmation.
              </p>
              <Link to="/host/bookings" className="text-[12px] font-bold text-emerald-700 no-underline hover:text-emerald-800 whitespace-nowrap">
                Manage →
              </Link>
            </div>
          )}

          {/* ── Profile completion alert ── */}
          {!Boolean(user?.bio?.trim() && user?.phone?.trim()) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 mb-6 transition-all hover:bg-emerald-100/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600 shadow-sm">
                  <Icon.Settings />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-emerald-950">Complete your host profile</p>
                  <p className="text-[11px] text-emerald-700/80 font-medium">Add a bio and phone number to increase guest trust.</p>
                </div>
              </div>
              <Link to="/host/profile" className="h-9 inline-flex items-center justify-center bg-emerald-700 text-white text-[12px] font-bold px-5 rounded-lg no-underline hover:bg-emerald-800 transition-colors shadow-sm">
                Finish setup
              </Link>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <StatCard
              iconBg="#ecfdf5" icon={Icon.Dollar}
              label="Full booking revenue" value={formatPrice(totalRevenue)}
              trendUp={revenueTrend}
              sub={potentialRevenue > 0 ? `+${formatPrice(potentialRevenue)} potential from unpaid or pending bookings` : 'Confirmed earnings from full booking totals'}
            />
            <StatCard
              iconBg="#eff6ff" icon={Icon.Experience}
              label="Active listings" value={activeExperiences.length}
              sub={`${experiences.length} total`}
            />
            <StatCard
              iconBg="#f5f3ff" icon={Icon.Calendar}
              label="Bookings" value={bookings.length}
              trendUp={pendingCount > 0 ? `${pendingCount} pending` : null}
              sub={`${bookings.filter(b => b.status === 'confirmed').length} upcoming`}
            />
            <StatCard
              iconBg="#fffbeb" icon={() => <Icon.Star filled size={14} />}
              label="Avg. rating" value={avgRating}
              sub={reviews.length > 0 ? `${reviews.length} reviews` : 'No reviews yet'}
            />
          </div>

          {/* ── Bookings + Listings ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 sm:gap-6 mb-8">

            {/* Recent bookings */}
            <Panel>
              <PanelHeader
                icon={Icon.Calendar} title="Recent Guest Requests"
                count={bookings.length} action="Manage all →" actionTo="/host/bookings"
              />
              <div>
                {recentBookings.length === 0 ? (
                  <EmptyState icon={<Icon.Calendar />} text="No bookings yet"
                    sub="Bookings will appear once guests reserve your experiences" />
                ) : recentBookings.map((b) => {
                  const guests     = (b.guestCount ?? b.guests) || 0
                  const actionable = b.status === 'pending' || b.status === 'confirmed'
                  const busy       = bookingAction.id === b._id

                  return (
                    <div key={b._id} className="flex flex-col gap-3 p-4 border-b border-slate-50 last:border-0">
                      {/* Top row: avatar + name + price */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={b.userId?.name || 'G'} size={40} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <span className="text-[13px] font-bold text-slate-900 truncate">
                              {b.userId?.name || 'Traveler'}
                            </span>
                            <Badge variant={badgeVariant(b.status)}>{b.status}</Badge>
                          </div>
                          <p className="text-[12px] text-slate-500 font-medium truncate">
                            {b.experienceId?.title || 'Experience'}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[14px] font-extrabold text-emerald-700">{formatPrice(getBookingTotal(b))}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {b.slot?.date ? formatDate(b.slot.date) : '—'}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: meta + action buttons */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-[11px] text-slate-400 font-medium">
                          {guests} guest{guests !== 1 ? 's' : ''} • {b.slot?.startTime || '—'}
                        </p>
                        {actionable && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleComplete(b._id)}
                              disabled={busy}
                              className="text-[11px] sm:text-[12px] font-bold px-3 py-1.5 rounded-lg
                                         bg-green-50 text-green-700 border border-green-200
                                         hover:bg-green-100 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {busy && bookingAction.type === 'complete' ? '…' : (b.status === 'pending' ? 'Confirm' : 'Complete')}
                            </button>
                            <button
                              onClick={() => handleCancel(b._id)}
                              disabled={busy}
                              className="text-[11px] sm:text-[12px] font-bold px-3 py-1.5 rounded-lg
                                         bg-red-50 text-red-700 border border-red-200
                                         hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {busy && bookingAction.type === 'cancel' ? '…' : 'Cancel'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </Panel>

            {/* Listings */}
            <Panel>
              <PanelHeader
                icon={Icon.Experience} title="Your Experiences"
                count={experiences.length} action="All →" actionTo="/host/experiences"
              />
              <div>
                {experiences.length === 0 ? (
                  <EmptyState icon={<Icon.Experience />} text="No listings yet">
                    <Link to="/host/experiences/create"
                      className="text-[12px] text-emerald-700 font-bold mt-2 no-underline hover:text-emerald-800">
                      Create your first →
                    </Link>
                  </EmptyState>
                ) : experiences.slice(0, 6).map((exp) => (
                  <div key={exp._id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-0">
                    {/* Thumbnail */}
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {exp.photos?.[0]
                        ? <img src={exp.photos[0]} alt={exp.title} className="w-full h-full object-cover" />
                        : <span className="text-slate-300"><Icon.Experience /></span>
                      }
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-900 truncate">{exp.title}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        <span className="text-emerald-700 font-bold">{formatPrice(exp.price)}</span>
                        {exp.location?.city && ` • ${exp.location.city}`}
                      </p>
                    </div>
                    {/* Edit */}
                    <Link
                      to={`/host/experiences/${exp._id}/edit`}
                      className="text-[11px] font-semibold text-slate-500 px-2.5 py-1.5 rounded-lg
                                 border border-slate-200 bg-slate-50 no-underline
                                 hover:border-emerald-300 hover:text-emerald-700 transition-colors whitespace-nowrap"
                    >
                      Edit
                    </Link>
                  </div>
                ))}
              </div>
              {experiences.length > 6 && (
                <Link to="/host/experiences"
                  className="block text-center text-[12px] text-slate-500 font-bold py-3
                             border-t border-slate-50 no-underline hover:text-emerald-700 transition-colors">
                  View all {experiences.length} →
                </Link>
              )}
            </Panel>
          </div>

          {/* ── Quick actions ── */}
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">
            Management Portal
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-10">
            <ActionCard to="/host/experiences/create" iconBg="#f0fdfa" iconColor="#1a6b4a" icon={Icon.Plus}       label="Start Listing"    desc="Create activity" />
            <ActionCard to="/host/bookings"           iconBg="#eff6ff" iconColor="#2563eb" icon={Icon.Calendar}   label="All Bookings"     desc="Manage guests" />
            <ActionCard to="/host/pathways"           iconBg="#fffbeb" iconColor="#d97706" icon={Icon.Map}        label="Pathways"         desc="Curated routes" />
            <ActionCard to="/host/experiences"        iconBg="#fff1f2" iconColor="#e11d48" icon={Icon.Experience} label="Experience List"  desc="Update listings" />
            <ActionCard to="/host/reviews"            iconBg="#f0fdf4" iconColor="#059669" icon={() => <Icon.Star filled />} label="Guest Reviews" desc="Read feedback" />
            <ActionCard to="/profile"                 iconBg="#f8fafc" iconColor="#64748b" icon={Icon.Settings}   label="Settings"         desc="Host profile" />
          </div>

          {/* ── Recent reviews ── */}
          {reviews.length > 0 && (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">
                Recent Guest Feedback
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.slice(0, 3).map((r) => (
                  <ReviewCard
                    key={r._id}
                    rating={r.rating}
                    text={r.comment || r.text || ''}
                    author={r.userId?.name || 'Guest'}
                    experience={r.experienceId?.title || 'Experience'}
                    date={r.createdAt ? formatDate(r.createdAt) : ''}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default HostDashboardPage
