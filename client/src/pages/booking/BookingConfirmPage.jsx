import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CircleCheckBig } from 'lucide-react'
import { getBookingById } from '../../services/bookingService.js'
import Navbar from '../../components/common/Navbar.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Button from '../../components/common/Button.jsx'
import { formatDate, formatPrice } from '../../utils/formatters.js'

const BookingConfirmPage = () => {
  const { id } = useParams()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => getBookingById(id).then((r) => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Spinner size="lg" className="flex-1" />
      </div>
    )
  }

  const splitPayments   = Array.isArray(booking?.splitPayments) ? booking.splitPayments : []
  const hasSplitFlow    = Boolean(booking?.pricing?.splitPayment || splitPayments.length)
  const userEmail       = booking?.contactEmail || booking?.user?.email || ''
  const isPendingGroup  = booking?.status === 'pending_payment'
  const shortId         = String(booking?._id || '').slice(-8).toUpperCase()

  let amountPaid = 0
  if (hasSplitFlow && splitPayments.length > 0) {
    const myShare = splitPayments.find(s => s.email === userEmail) || splitPayments[0]
    amountPaid = myShare && typeof myShare.amount === 'number' ? myShare.amount / 100 : 0
  } else {
    amountPaid = typeof booking?.amount === 'number' ? booking.amount / 100 : (booking?.totalPrice ?? 0)
  }

  const remainingAmount = Number(booking?.pricing?.remainingAmount || 0) / 100
  const pendingCount    = splitPayments.filter(s => s.status !== 'paid').length
  const rewardPts       = booking?.checkIn?.rewardPointsGranted || booking?.experienceId?.rewards?.pointsPerCheckIn || 50

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Receipt card */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            {/* Top strip */}
            <div className="bg-emerald-600 px-6 py-5 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <CircleCheckBig className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">
                  {isPendingGroup ? 'Group booking started' : 'Booking confirmed'}
                </p>
                <p className="text-[11px] text-emerald-100 mt-0.5">
                  {isPendingGroup
                    ? 'Waiting for group members to pay'
                    : 'Check your email for full details'}
                </p>
              </div>
            </div>

            {/* Dashed divider */}
            <div className="relative px-6">
              <div className="absolute left-0 right-0 border-t border-dashed border-slate-200" />
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border border-slate-200" />
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">

              {/* Experience title + ID */}
              <div>
                <p className="text-[15px] font-semibold text-slate-900 leading-snug">
                  {booking?.experienceId?.title || 'Experience'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Booking ID: {shortId}</p>
              </div>

              {/* Detail rows */}
              <div className="space-y-2 text-[12px]">
                <Row label="Date"   value={booking?.slot?.date ? formatDate(booking.slot.date) : '—'} />
                <Row label="Time"   value={booking?.slot?.startTime || '—'} />
                <Row label="Guests" value={`${booking?.guestCount ?? booking?.guests ?? 1} guest${(booking?.guestCount ?? 1) > 1 ? 's' : ''}`} />
                <Row label="Location" value={booking?.experienceId?.location?.city || '—'} />
                <Row label="Host"   value={booking?.hostId?.name || '—'} />
                {booking?.collaboration?.groupCode && (
                  <Row label="Group code" value={booking.collaboration.groupCode} mono />
                )}
                {booking?.checkIn?.qrCode && (
                  <Row label="Host code" value={booking.checkIn.qrCode} mono />
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Payment */}
              <div className="space-y-2 text-[12px]">
                <Row
                  label={hasSplitFlow ? 'Your share (paid)' : 'Total paid'}
                  value={formatPrice(amountPaid)}
                  valueClass="text-emerald-600 font-semibold"
                />
                {remainingAmount > 0 && (
                  <Row
                    label="Remaining balance"
                    value={formatPrice(remainingAmount)}
                    valueClass="text-slate-600"
                  />
                )}
                <Row
                  label="Status"
                  value={String(booking?.status || '').replace('_', ' ')}
                  valueClass="capitalize text-emerald-600 font-semibold"
                />
              </div>

              {/* Reward points pill */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <span className="text-[11px] text-slate-500">Reward points on check-in</span>
                <span className="text-[12px] font-semibold text-slate-700">+{rewardPts} pts</span>
              </div>

              {/* Group payment status */}
              {hasSplitFlow && splitPayments.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Group payments</p>
                  {splitPayments.map(share => {
                    const isYou = share.email && userEmail && share.email.toLowerCase() === userEmail.toLowerCase()
                    const amt   = typeof share.amount === 'number' ? formatPrice(share.amount / 100) : ''
                    return (
                      <div key={`${share.email}-${share.inviteToken || 'leader'}`}
                        className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5">
                        <span className="truncate text-slate-600 mr-2">
                          {share.email}
                          {isYou        && <span className="ml-1 text-emerald-600">You</span>}
                          {share.isLeader && <span className="ml-1 text-slate-400">(leader)</span>}
                        </span>
                        <span className="font-semibold text-slate-700 mr-2 flex-shrink-0">{amt}</span>
                        <span className={`flex-shrink-0 font-semibold ${share.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {share.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    )
                  })}
                  {pendingCount > 0 && (
                    <p className="text-[10px] text-slate-400 pt-0.5">
                      {pendingCount} member{pendingCount > 1 ? 's' : ''} yet to pay · 48 hr window
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div className="px-6 pb-5 pt-1 flex gap-2 border-t border-slate-100">
              <Link to="/my-bookings" className="flex-1">
                <Button fullWidth size="sm">My bookings</Button>
              </Link>
              <Link to="/search" className="flex-1">
                <Button fullWidth size="sm" variant="secondary">Explore more</Button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value, valueClass = 'text-slate-800 font-medium', mono = false }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-slate-400 flex-shrink-0">{label}</span>
    <span className={`${valueClass} ${mono ? 'font-mono tracking-wide' : ''} text-right`}>{value}</span>
  </div>
)

export default BookingConfirmPage