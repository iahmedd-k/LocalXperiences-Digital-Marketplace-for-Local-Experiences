import useTranslation from '../../hooks/useTranslation.js';
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getAllMyBookings, cancelBooking, checkInBooking } from '../../services/bookingService.js'
import { getUserRewards } from '../../services/rewardsService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import { formatDate, formatPrice } from '../../utils/formatters.js'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Modal from '../../components/common/Modal.jsx'
import Button from '../../components/common/Button.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { useSelector } from 'react-redux'

const PENDING_STATUSES = ['pending', 'pending_payment', 'partially_paid']
const ACTIVE_BOOKING_STATUSES = ['confirmed', 'upcoming', ...PENDING_STATUSES]
const STATUS_TABS = ['all', 'confirmed', 'pending', 'completed', 'cancelled']

const BADGE = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  upcoming:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
  partially_paid: 'bg-violet-50 text-violet-700 border-violet-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
}

const getBookingFullTotal = (booking) => {
  if (typeof booking?.pricing?.totalAfterDiscount === 'number') return booking.pricing.totalAfterDiscount / 100
  if (typeof booking?.totalPrice === 'number') return booking.totalPrice
  const fallback = Number(booking?.experienceId?.price || 0) * Number(booking?.guestCount || 1)
  return Number.isFinite(fallback) ? fallback : 0
}

const getBookingDisplayAmount = (booking, userEmail = '') => {
  const normalizedUserEmail = String(userEmail || '').trim().toLowerCase()
  const splitPayments = Array.isArray(booking?.splitPayments) ? booking.splitPayments : []
  if (normalizedUserEmail && splitPayments.length > 0) {
    const myShare = splitPayments.find((share) => String(share?.email || '').trim().toLowerCase() === normalizedUserEmail)
    if (typeof myShare?.amount === 'number') return myShare.amount / 100
  }
  if (typeof booking?.amount === 'number') return booking.amount / 100
  return getBookingFullTotal(booking)
}

const getBookingAmount = (booking) => {
  return getBookingFullTotal(booking)
}

const getSlotLabel = (booking) => {
  const date = booking?.slot?.date ? formatDate(booking.slot.date) : 'Date not set'
  const time = booking?.slot?.startTime || 'Time not set'
  return `${date} · ${time}`
}

const isHistory = (status) => ['completed', 'cancelled'].includes(status)
const isActive  = (status) => ACTIVE_BOOKING_STATUSES.includes(status)

// ── Booking Card ──────────────────────────────────────────────────────────────
const BookingCard = ({ booking, onCancel, onCheckIn }) => {
  const { t } = useTranslation();

  const amount    = getBookingDisplayAmount(booking, booking?.contact?.email)
  const active    = isActive(booking.status)
  const checkedIn = booking.checkIn?.status === 'checked_in'
  const hasShareAmount = Array.isArray(booking?.splitPayments) && booking.splitPayments.length > 0
  const amountLabel = hasShareAmount
    ? 'Your share'
    : booking?.pricing?.splitPayment
      ? 'Deposit paid'
      : 'Full booking total'

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors">
      <div className="flex gap-3 p-3 sm:p-4">

        {/* Thumbnail */}
        <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg bg-slate-100 shrink-0 overflow-hidden flex items-center justify-center text-slate-400 text-xs font-medium">
          {booking.experienceId?.photos?.[0]
            ? <img src={booking.experienceId.photos[0]} alt="" className="w-full h-full object-cover" />
            : 'IMG'
          }
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">

          {/* Title + badge row */}
          <div className="flex items-start gap-2 mb-1">
            <h2 className="text-[13px] font-semibold text-slate-900 leading-snug flex-1 min-w-0">
              {booking.experienceId?.title || 'Experience'}
            </h2>
            <span className={`shrink-0 inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${BADGE[booking.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
              {String(booking.status).replace(/_/g, ' ')}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-0.5 text-[11px] text-slate-500">
            <span>{getSlotLabel(booking)}</span>
            <span>
              {booking.guestCount || 1} guest{(booking.guestCount || 1) > 1 ? 's' : ''}
              {' · '}{booking.experienceId?.location?.city || 'City'}
              {' · '}Host: {booking.hostId?.name || 'Host'}
            </span>
            {booking.collaboration?.groupCode && (
              <span className="text-violet-600 font-medium">Group · {booking.collaboration.groupCode}</span>
            )}
            {checkedIn && (
              <span className="text-emerald-600 font-medium">
                Checked in{booking.checkIn?.rewardPointsGranted ? ` · +${booking.checkIn.rewardPointsGranted} pts` : ''}
              </span>
            )}
            {booking.pricing?.splitPayment && (
              <span className="text-sky-600">
                Remaining: {formatPrice(Number(booking.pricing?.remainingAmount || 0) / 100)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: price + actions — always full-width row on mobile */}
      <div className="flex items-center justify-between gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{amountLabel}</p>
          <p className="text-[15px] font-semibold text-slate-900">{formatPrice(amount)}</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {booking._id && (
            <Link
              to={`/booking/confirm/${booking._id}`}
              className="text-[11px] font-medium text-slate-500 border border-slate-200 px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors"
            >
              View
            </Link>
          )}
          {active && !checkedIn && (
            <button
              onClick={() => onCheckIn(booking._id)}
              className="text-[11px] font-medium text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors"
            >
              Check in
            </button>
          )}
          {active && (
            <button
              onClick={() => onCancel(booking._id)}
              className="text-[11px] font-medium text-rose-600 border border-rose-200 px-2.5 py-1 rounded-md hover:bg-rose-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyBookingsPage = () => {
  const { user } = useSelector((s) => s.auth)
  const queryClient = useQueryClient()
  const [cancelId,       setCancelId]       = useState(null)
  const [cancelling,     setCancelling]     = useState(false)
  const [tab,            setTab]            = useState('all')
  const [historyCleared, setHistoryCleared] = useState(false)

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn:  getAllMyBookings,
  })

  const { data: rewards } = useQuery({
    queryKey: ['userRewards', user?._id],
    queryFn: () => getUserRewards(user._id).then((r) => r.data.data),
    enabled: Boolean(user?._id),
  })

  const activeBookings  = useMemo(() => bookings.filter(b => isActive(b.status)),  [bookings])
  const historyBookings = useMemo(() => bookings.filter(b => isHistory(b.status)), [bookings])

  const counts = useMemo(() => ({
    all:       bookings.length,
    confirmed: bookings.filter(b => ['confirmed', 'upcoming'].includes(b.status)).length,
    pending:   bookings.filter(b => PENDING_STATUSES.includes(b.status)).length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }), [bookings])

  const upcomingCount  = counts.confirmed + counts.pending
  const totalSpent     = useMemo(() =>
    bookings
      .filter(b => ['confirmed', 'upcoming', 'completed'].includes(b.status))
      .reduce((sum, b) => sum + getBookingAmount(b), 0),
    [bookings]
  )
  const totalRewardPts = Number(rewards?.points ?? bookings.reduce((sum, b) => sum + Number(b?.checkIn?.rewardPointsGranted || 0), 0))

  const filteredActive = useMemo(() => {
    if (tab === 'all') return activeBookings
    if (tab === 'pending') return activeBookings.filter(b => PENDING_STATUSES.includes(b.status))
    return activeBookings.filter(b => b.status === tab)
  }, [activeBookings, tab])

  const filteredHistory = useMemo(() => {
    if ((tab === 'all' || tab === 'completed' || tab === 'cancelled') && !historyCleared)
      return tab === 'all' ? historyBookings : historyBookings.filter(b => b.status === tab)
    return []
  }, [historyBookings, tab, historyCleared])

  const groupBookings = useMemo(() => bookings.filter(b => b.collaboration?.groupCode), [bookings])
  const showHistory   = filteredHistory.length > 0
  const isEmpty       = filteredActive.length === 0 && filteredHistory.length === 0

  const checkInMutation = useMutation({
    mutationFn: checkInBooking,
    onSuccess: async () => {
      toast.success('Checked in successfully')
      await queryClient.invalidateQueries({ queryKey: ['myBookings'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleCancel = async () => {
    try {
      setCancelling(true)
      await cancelBooking(cancelId)
      toast.success('Booking cancelled')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
        queryClient.invalidateQueries({ queryKey: ['pickedForYou'] }),
      ])
      setCancelId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">

        {/* Header */}
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{t("footer_my_bookings")}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage all your trips in one place.</p>
        </div>

        {/* Stats — 2 cols on mobile, 4 on sm+ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5 sm:mb-6">
          {[
            { label: 'Upcoming',    value: upcomingCount },
            { label: 'Completed',   value: counts.completed },
            { label: 'Total spent', value: formatPrice(totalSpent) },
            { label: 'Reward pts',  value: `${totalRewardPts} pts` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl px-3 py-3 sm:px-4">
              <p className="text-[10px] sm:text-[11px] text-slate-500 mb-0.5 font-medium">{label}</p>
              <p className="text-base sm:text-[15px] font-bold text-slate-900 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Group bookings */}
        {groupBookings.length > 0 && (
          <section className="mb-5 sm:mb-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
            <h2 className="text-[13px] font-semibold text-violet-900 mb-3">Group bookings</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {groupBookings.map(b => {
                const userEmail    = String(user?.email || b.contact?.email || '').trim().toLowerCase()
                const invitedEmails = Array.isArray(b.collaboration?.invitedEmails)
                  ? b.collaboration.invitedEmails
                  : String(b.collaboration?.invitedEmails || '').split(/[,\n]+/).map(e => e.trim()).filter(Boolean)
                const members = Array.isArray(b.splitPayments) && b.splitPayments.length > 0
                  ? b.splitPayments
                  : [
                      { email: userEmail, amount: b.amount, status: b.status, isLeader: true },
                      ...invitedEmails.filter(e => e && e !== userEmail).map(e => ({ email: e, amount: b.amount, status: 'pending', isLeader: false })),
                    ]
                const otherMembers = members.filter((member) => String(member?.email || '').trim().toLowerCase() !== userEmail)
                const visibleMembers = otherMembers.length > 0 ? otherMembers : members
                return (
                  <div key={b._id} className="rounded-lg border border-violet-200 bg-white p-3">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[13px] font-semibold text-slate-900 truncate flex-1 min-w-0">
                        {b.experienceId?.title || 'Experience'}
                      </span>
                      <span className="shrink-0 text-[10px] bg-violet-100 text-violet-700 border border-violet-200 rounded-full px-1.5 py-0.5 font-semibold">
                        Group
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{getSlotLabel(b)}</p>
                    <p className="text-[11px] text-slate-500 mb-2">Code: {b.collaboration.groupCode}</p>

                    <div className="space-y-1 mb-2">
                      {visibleMembers.map(m => {
                        const isYou = m.email && userEmail && m.email.toLowerCase() === userEmail.toLowerCase()
                        const amt   = typeof m.amount === 'number'
                          ? formatPrice(m.amount / 100)
                          : formatPrice(getBookingAmount(b))
                        return (
                          <div key={m.email} className="flex items-center gap-1 text-[11px] bg-violet-50 rounded px-2 py-1">
                            <span className="flex-1 min-w-0 truncate text-violet-800">
                              {m.email}
                              {isYou  && <span className="ml-1 text-emerald-600">{t("footer_subscribed")}</span>}
                              {m.isLeader && <span className="ml-1 text-[10px] text-violet-400">(leader)</span>}
                            </span>
                            <span className="font-semibold text-slate-700 shrink-0">{amt}</span>
                            <span className={`shrink-0 font-semibold px-1.5 py-0.5 rounded-full text-[10px] ml-1 ${m.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {m.status === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <p className="text-[10px] text-slate-400 mb-2">
                      {otherMembers.length > 0 ? 'Friends have 48 hours to pay.' : 'Your group is set up.'}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      <Link
                        to={`/experiences/${b.experienceId?._id}`}
                        className="text-[11px] font-medium text-violet-700 border border-violet-200 rounded-md px-2.5 py-1 hover:bg-violet-50 transition-colors"
                      >
                        View trip
                      </Link>
                      {b.collaboration?.groupCode && (
                        <Link
                          to={`/group/invite/${b.collaboration.groupCode}`}
                          className="text-[11px] font-medium text-emerald-700 border border-emerald-200 rounded-md px-2.5 py-1 hover:bg-emerald-50 transition-colors"
                        >{t("checkout_group_details")}</Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Tabs — scrollable on mobile */}
        <div className="border-b border-slate-200 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {STATUS_TABS.map(status => (
              <button
                key={status}
                onClick={() => setTab(status)}
                className={`px-3 py-2 text-[12px] font-medium capitalize whitespace-nowrap border-b-2 transition-colors -mb-px ${
                  tab === status
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                {status}
                <span className="ml-1 text-[10px] text-slate-400">({counts[status] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : isEmpty ? (
          <div className="py-12">
            <EmptyState
              icon="Calendar"
              title="No bookings found"
              description="You haven't booked any experiences yet. Start your journey by exploring local favorites."
              action={
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl no-underline transition-colors"
                >
                  Find experiences
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-6">

            {/* Active */}
            {filteredActive.length > 0 && (
              <div className="space-y-2.5">
                {filteredActive.map(b => (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    onCancel={setCancelId}
                    onCheckIn={id => checkInMutation.mutate(id)}
                  />
                ))}
              </div>
            )}

            {/* History */}
            {showHistory && (
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">History</span>
                  <button
                    onClick={() => setHistoryCleared(true)}
                    className="text-[11px] text-slate-400 hover:text-rose-500 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                  >
                    Clear history
                  </button>
                </div>
                <div className="space-y-2.5">
                  {filteredHistory.map(b => (
                    <BookingCard
                      key={b._id}
                      booking={b}
                      onCancel={setCancelId}
                      onCheckIn={id => checkInMutation.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel modal */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel booking?">
        <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
          This may be subject to a cancellation fee depending on the host's policy.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="secondary" fullWidth onClick={() => setCancelId(null)}>Keep booking</Button>
          <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>Yes, cancel</Button>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default MyBookingsPage
