import useTranslation from '../../hooks/useTranslation.js';
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { CircleCheckBig } from 'lucide-react'
import { getBookingById } from '../../services/bookingService.js'
import Navbar from '../../components/common/Navbar.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Button from '../../components/common/Button.jsx'
import { formatDate, formatPrice } from '../../utils/formatters.js'

const parseGroupEmails = (value) => {
  if (Array.isArray(value)) {
    return value.map((email) => String(email || '').trim().toLowerCase()).filter(Boolean)
  }
  return String(value || '')
    .split(/[\n,]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

const BookingConfirmPage = () => {
  const { t } = useTranslation();

  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)

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

  const splitPayments = Array.isArray(booking?.splitPayments) ? booking.splitPayments : []
  const hasSplitFlow = Boolean(booking?.pricing?.splitPayment || splitPayments.length)
  const userEmail = String(user?.email || booking?.contact?.email || booking?.userId?.email || '').trim().toLowerCase()
  const isPendingGroup = booking?.status === 'pending_payment'
  const groupInvites = parseGroupEmails(booking?.collaboration?.invitedEmails)
  const displayMembers = (() => {
    const byEmail = new Map()

    splitPayments.forEach((share) => {
      const email = String(share?.email || '').trim().toLowerCase()
      if (!email) return
      byEmail.set(email, {
        ...share,
        email,
        isLeader: Boolean(share?.isLeader),
      })
    })

    const fallbackEmails = [booking?.contact?.email, booking?.userId?.email, ...groupInvites]
      .map((email) => String(email || '').trim().toLowerCase())
      .filter(Boolean)

    fallbackEmails.forEach((email, index) => {
      if (!byEmail.has(email)) {
        byEmail.set(email, {
          email,
          amount: null,
          status: index === 0 ? 'paid' : 'pending',
          isLeader: index === 0,
        })
      }
    })

    return Array.from(byEmail.values())
  })()
  const shortId = String(booking?._id || '').slice(-8).toUpperCase()

  let amountPaid = 0
  if (hasSplitFlow && splitPayments.length > 0) {
    const myShare = splitPayments.find((share) => String(share?.email || '').trim().toLowerCase() === userEmail) || splitPayments[0]
    amountPaid = myShare && typeof myShare.amount === 'number' ? myShare.amount / 100 : 0
  } else {
    amountPaid = typeof booking?.amount === 'number' ? booking.amount / 100 : (booking?.totalPrice ?? 0)
  }

  const remainingAmount = Number(booking?.pricing?.remainingAmount || 0) / 100
  const pendingCount = displayMembers.filter((share) => share.status !== 'paid').length
  const rewardPts = booking?.checkIn?.rewardPointsGranted || booking?.experienceId?.rewards?.pointsPerCheckIn || 50

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center gap-3 bg-emerald-600 px-6 py-5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                <CircleCheckBig className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">
                  {isPendingGroup ? 'Group booking started' : 'Booking confirmed'}
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-100">
                  {isPendingGroup ? 'Waiting for group members to pay' : 'Check your email for full details'}
                </p>
              </div>
            </div>

            <div className="relative px-6">
              <div className="absolute left-0 right-0 border-t border-dashed border-slate-200" />
              <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
              <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-50" />
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="text-[15px] font-semibold leading-snug text-slate-900">
                  {booking?.experienceId?.title || 'Experience'}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">Booking ID: {shortId}</p>
              </div>

              <div className="space-y-2 text-[12px]">
                <Row label="Date" value={booking?.slot?.date ? formatDate(booking.slot.date) : '-'} />
                <Row label="Time" value={booking?.slot?.startTime || '-'} />
                <Row label="Guests" value={`${booking?.guestCount ?? booking?.guests ?? 1} guest${(booking?.guestCount ?? 1) > 1 ? 's' : ''}`} />
                <Row label="Location" value={booking?.experienceId?.location?.city || '-'} />
                <Row label="Host" value={booking?.hostId?.name || '-'} />
                {booking?.collaboration?.groupCode && <Row label="Group code" value={booking.collaboration.groupCode} mono />}
                {booking?.checkIn?.qrCode && <Row label="Host code" value={booking.checkIn.qrCode} mono />}
              </div>

              <div className="border-t border-slate-100" />

              <div className="space-y-2 text-[12px]">
                <Row
                  label={hasSplitFlow ? 'Your share (paid)' : 'Total paid'}
                  value={formatPrice(amountPaid)}
                  valueClass="font-semibold text-emerald-600"
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
                  value={String(booking?.status || '').replace(/_/g, ' ')}
                  valueClass="capitalize font-semibold text-emerald-600"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <span className="text-[11px] text-slate-500">Reward points on check-in</span>
                <span className="text-[12px] font-semibold text-slate-700">+{rewardPts} pts</span>
              </div>

              {(booking?.collaboration?.groupCode || hasSplitFlow || displayMembers.length > 0) && (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Group payments</p>
                  {displayMembers.map((share) => {
                    const isYou = share.email && userEmail && share.email.toLowerCase() === userEmail.toLowerCase()
                    const amount = typeof share.amount === 'number' ? formatPrice(share.amount / 100) : ''

                    return (
                      <div
                        key={`${share.email}-${share.inviteToken || 'leader'}`}
                        className="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-[11px] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="min-w-0 truncate text-slate-600">
                          {share.email}
                          {isYou && <span className="ml-1 text-emerald-600">{t("footer_subscribed")}</span>}
                          {share.isLeader && <span className="ml-1 text-slate-400">(leader)</span>}
                        </span>
                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span className="flex-shrink-0 font-semibold text-slate-700">{amount}</span>
                          <span className={`flex-shrink-0 font-semibold ${share.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {share.status === 'paid' ? 'Paid' : share.status === 'pending' ? 'Pending' : 'Invited'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {pendingCount > 0 && (
                    <p className="pt-0.5 text-[10px] text-slate-400">
                      {pendingCount} member{pendingCount > 1 ? 's' : ''} yet to pay · 48 hr window
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-100 px-6 pb-5 pt-1">
              <Link to="/my-bookings" className="flex-1">
                <Button fullWidth size="sm">{t("nav_my_bookings")}</Button>
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

const Row = ({ label, value, valueClass = 'font-medium text-slate-800', mono = false }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="flex-shrink-0 text-slate-400">{label}</span>
    <span className={`${valueClass} ${mono ? 'font-mono tracking-wide' : ''} min-w-0 break-words text-right`}>{value}</span>
  </div>
)

export default BookingConfirmPage
