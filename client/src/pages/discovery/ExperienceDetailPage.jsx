import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bookmark, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleX, Clock3, Heart, MapPin, Share2, ShieldCheck, Users, WalletCards,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { getExperienceById, getExperiences } from '../../services/experienceService.js'
import { getMyBookings } from '../../services/bookingService.js'
import { answerQuestion, askQuestion, getQnA } from '../../services/qnaService.js'
import { createComment, deleteComment, getComments } from '../../services/commentService.js'
import { createReview, getReviews } from '../../services/reviewService.js'
import { useCurrency } from '../../components/Currencycontext';

import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import Modal from '../../components/common/Modal.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Badge from '../../components/common/Badge.jsx'
import Button from '../../components/common/Button.jsx'
import ExperienceGallery from '../../components/experience/ExperienceGallery.jsx'
import DetailSection from '../../components/experience/detail/DetailSection.jsx'
import ExperienceFeedbackSection from '../../components/experience/detail/ExperienceFeedbackSection.jsx'
import DetailTabs from '../../components/experience/detail/DetailTabs.jsx'
import ItinerarySection from '../../components/experience/detail/ItinerarySection.jsx'
import OverviewSection, { overviewFactIcons } from '../../components/experience/detail/OverviewSection.jsx'

import { CITY_COORDS } from '../../components/map/cityCoords.js'
import { CATEGORIES } from '../../config/constants.js'
import { formatDate, formatDuration, formatPrice } from '../../utils/formatters.js'
import useWishlist from '../../hooks/useWishlist.js'

/* ─── Constants ────────────────────────────────────────────────── */

const DEFAULT_CENTER = [30.3753, 69.3451]

const SECTION_TABS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'details',   label: 'Details'   },
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'operator',  label: 'Operator'  },
  { id: 'reviews',   label: 'Reviews'   },
]

/* ─── Stars ─────────────────────────────────────────────────────── */

const Stars = ({ value = 0 }) => {
  const count = Math.round(Number(value) || 0)
  return (
    <span className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className="h-3 w-3" viewBox="0 0 24 24"
          fill={i < count ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth="1.8">
          <polygon points="12 2.5 15.1 8.8 22 9.8 17 14.7 18.2 21.5 12 18.1 5.8 21.5 7 14.7 2 9.8 8.9 8.8" />
        </svg>
      ))}
    </span>
  )
}

/* ─── Pure helpers ───────────────────────────────────────────────── */

const toLatLng = (coordinates) => {
  const raw = coordinates?.coordinates || coordinates
  if (!Array.isArray(raw) || raw.length !== 2) return null
  const [lng, lat] = raw
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (lat === 0 && lng === 0) return null
  return [lat, lng]
}

const haversineKm = (from, to) => {
  if (!Array.isArray(from) || !Array.isArray(to)) return Number.POSITIVE_INFINITY
  const [fromLat, fromLng] = from
  const [toLat, toLng] = to
  if (![fromLat, fromLng, toLat, toLng].every(Number.isFinite)) return Number.POSITIVE_INFINITY

  const toRad = (value) => (value * Math.PI) / 180
  const earthRadiusKm = 6371
  const dLat = toRad(toLat - fromLat)
  const dLng = toRad(toLng - fromLng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLng / 2) ** 2

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const resolveBestLatLng = (coordinates, fallbackCenter) => {
  const raw = coordinates?.coordinates || coordinates
  if (!Array.isArray(raw) || raw.length !== 2) return null

  const [first, second] = raw
  if (![first, second].every(Number.isFinite)) return null

  const geoJsonOrder = [second, first]
  const swappedOrder = [first, second]

  const isValid = ([lat, lng]) =>
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)

  const geoValid = isValid(geoJsonOrder)
  const swappedValid = isValid(swappedOrder)

  if (!geoValid && !swappedValid) return null
  if (geoValid && !swappedValid) return geoJsonOrder
  if (!geoValid && swappedValid) return swappedOrder

  if (Array.isArray(fallbackCenter) && fallbackCenter.length === 2) {
    const geoDistance = haversineKm(geoJsonOrder, fallbackCenter)
    const swappedDistance = haversineKm(swappedOrder, fallbackCenter)
    return swappedDistance + 5 < geoDistance ? swappedOrder : geoJsonOrder
  }

  return geoJsonOrder
}

const buildStepDescription = ({ name, city, categoryLabel, isTerminal, isStart, durationLabel }) => {
  if (isStart)    return city ? `Meet your host and begin the experience in ${city}.` : 'Meet your host and get ready for the experience.'
  if (isTerminal) return city ? `The experience wraps up here in ${city}.` : 'This is the final stop before the experience ends.'
  const parts = [categoryLabel, durationLabel].filter(Boolean)
  return parts.length
    ? `${name} is one of the main planned stops. ${parts.join(' · ')}.`
    : `${name} is one of the main planned stops on this route.`
}

const startOfMonth  = (date) => new Date(date.getFullYear(), date.getMonth(), 1)
const addMonths     = (date, n) => new Date(date.getFullYear(), date.getMonth() + n, 1)
const sameDay       = (l, r)   =>
  l.getFullYear() === r.getFullYear() && l.getMonth() === r.getMonth() && l.getDate() === r.getDate()

const buildMonthGrid = (monthDate) => {
  const first    = startOfMonth(monthDate)
  const weekday  = first.getDay()
  const days     = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells    = []
  for (let i = 0; i < weekday; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(first.getFullYear(), first.getMonth(), d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

const toLocalDateKey = (dateValue) => {
  const date = new Date(dateValue)
  if (!Number.isFinite(date.getTime())) return ''
  const y  = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const d  = String(date.getDate()).padStart(2, '0')
  return `${y}-${mo}-${d}`
}

const toSlotDateTime = (dateValue, startTime) => {
  const date = new Date(dateValue)
  if (!Number.isFinite(date.getTime())) return null
  const [hours = '0', minutes = '0'] = String(startTime || '').split(':')
  date.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0)
  return date
}

/* ─── CheckInButton ──────────────────────────────────────────── */

const CheckInButton = ({ experienceId, isAuthenticated }) => {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')
  const { user } = useSelector((s) => s.auth)

  const handleCheckIn = async () => {
    if (!isAuthenticated) { toast.error('Sign in to check in'); return }
    setStatus('loading')
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/checkins/experience/${experienceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.success) { setStatus('error'); setMessage(data.message); toast.error(data.message); return }
      setStatus('success')
      setMessage(`Checked in! Total: ${data.data.checkInCount}`)
      toast.success(`🎉 Check-in #${data.data.checkInCount} recorded!`)
      if (data.data.newBadge) {
        setTimeout(() => toast.success(`🏆 New badge unlocked: ${data.data.newBadge}!`, { duration: 5000 }), 1000)
      }
    } catch (err) {
      setStatus('error')
      setMessage('Check-in failed. Try again.')
      toast.error('Check-in failed')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50 px-3 py-2.5 text-xs text-emerald-800 flex items-center gap-2">
        <span className="text-base">✅</span>
        <span className="font-semibold">{message}</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleCheckIn}
      disabled={status === 'loading'}
      className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
    >
      {status === 'loading' ? (
        <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Checking in…</>
      ) : (
        <><span className="text-base">📍</span> Check In Now</>
      )}
    </button>
  )
}

/* ─── ReserveCard ───────────────────────────────────────────────── */

const ReserveCard = ({
  exp, availableSlots, dateOptions, effectiveDateKey,
  selectedSlot, maxSelectableGuests, hasBooking, isAuthenticated, location,
  averageBookAheadDays, requireAuth,
  setShowCancellationModal, setShowReserveLaterModal,
  refreshAvailability, isRefreshingAvailability,
}) => {
  const { currency } = useCurrency()
  const navigate = useNavigate()

  /* local UI state */
  const [showGroupOptions, setShowGroupOptions] = useState(false)
  const [groupCode, setGroupCode] = useState('')
  const [groupStatus,      setGroupStatus]      = useState(null)
  const [joiningGroup,     setJoiningGroup]     = useState(false)

  /* date / slot picker state */
  const initialDateKey = effectiveDateKey || dateOptions[0]?.key || ''
  const initialMonth   = initialDateKey ? new Date(`${initialDateKey}T00:00:00`) : new Date()

  const [flowState,        setFlowState]        = useState(() => (dateOptions.length ? 'idle' : 'unavailable'))
  const [pickerOpen,       setPickerOpen]       = useState(false)
  const [calMonth,         setCalMonth]         = useState(() => startOfMonth(initialMonth))
  const [localDate,        setLocalDate]        = useState(initialDateKey)
  const [localSlotId,      setLocalSlotId]      = useState(() => String(selectedSlot?._id || ''))
  const [travelers,        setTravelers]        = useState({ adults: 1, seniors: 0, children: 0, infants: 0 })
  const [groupSize,        setGroupSize]        = useState(2)
  const [isGroupBooking,   setIsGroupBooking]   = useState(false)

  /* group booking query */
  const { data: groupBooking, refetch: refetchGroupBooking } = useQuery({
    queryKey: ['groupBooking', exp?._id, selectedSlot?._id],
    queryFn: async () => {
      if (!exp?.bookingSettings?.allowCollaborativeBookings || !selectedSlot?._id) return null
      const res = await fetch(`/api/bookings/group/${exp._id}-${selectedSlot._id}`)
      if (!res.ok) return null
      return res.json().then((r) => r.data)
    },
    enabled: Boolean(exp?.bookingSettings?.allowCollaborativeBookings && selectedSlot?._id),
  })

  /* derived values */
  const PRICE_ADULT  = Number(exp?.price || 0)
  const PRICE_CHILD  = Math.round(PRICE_ADULT * 0.55)
  const weekdayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  const slotCapacityFallback = Math.max(1, Number(exp?.groupSize?.max || maxSelectableGuests || 10))

  const availDateMap = useMemo(
    () => new Map(dateOptions.map((o) => [o.key, o])),
    [dateOptions],
  )

  const calCells          = buildMonthGrid(calMonth)
  const localSlotsForDate = availableSlots.filter((s) => s.dateKey === localDate)
  const activeSlot        = localSlotsForDate.find((s) => String(s._id) === localSlotId) || localSlotsForDate[0] || null
  const activeMaxGuests   = Math.max(1, Math.min(slotCapacityFallback, Number(activeSlot?.remaining || slotCapacityFallback)))

  const totalTravelerCount = isGroupBooking
    ? groupSize
    : travelers.adults + travelers.seniors + travelers.children + travelers.infants

  const computedTotal = isGroupBooking
    ? groupSize * PRICE_ADULT
    : (travelers.adults + travelers.seniors) * PRICE_ADULT + travelers.children * PRICE_CHILD

  const selectedDateLabel = localDate ? formatDate(localDate) : 'Choose a date'
  const travelerSummary   = [
    travelers.adults   ? `${travelers.adults} adult${travelers.adults > 1 ? 's' : ''}`         : null,
    travelers.seniors  ? `${travelers.seniors} senior${travelers.seniors > 1 ? 's' : ''}`      : null,
    travelers.children ? `${travelers.children} ${travelers.children > 1 ? 'children' : 'child'}` : null,
    travelers.infants  ? `${travelers.infants} infant${travelers.infants > 1 ? 's' : ''}`      : null,
  ].filter(Boolean).join(' · ')

  /* sync slot selection when availability changes */
  useEffect(() => {
    if (dateOptions.length === 0) {
      setFlowState('unavailable'); setPickerOpen(false); setLocalDate(''); setLocalSlotId('')
      return
    }
    setFlowState((c) => (c === 'unavailable' ? 'idle' : c))
    if (!localDate || !availDateMap.has(localDate)) { setLocalDate(initialDateKey); return }
    const nextSlots = availableSlots.filter((s) => s.dateKey === localDate)
    if (!nextSlots.length) { setFlowState('unavailable'); setPickerOpen(false); setLocalSlotId(''); return }
    if (!nextSlots.some((s) => String(s._id) === localSlotId)) setLocalSlotId(String(nextSlots[0]._id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableSlots, availDateMap, dateOptions.length, initialDateKey, localDate, localSlotId])

  /* handlers */
  const updateTravelers = (type, delta) => {
    setTravelers((prev) => {
      const next = { ...prev, [type]: prev[type] + delta }
      if (type === 'adults' && next.adults < 1) return prev
      if (next[type] < 0) return prev
      if (next.adults + next.seniors + next.children + next.infants > activeMaxGuests) return prev
      return next
    })
  }

  const handleOpenAvailability = async () => {
    try { await refreshAvailability?.() } catch { /* ignore */ }
    if (!dateOptions.length) { setFlowState('unavailable'); return }
    setPickerOpen(true)
  }

  const handleProceedToCheckout = () => {
    if (!activeSlot?._id) { toast.error('Select an available date and time first'); return }
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search || ''}#overview` } })
      return
    }
    const guests = isGroupBooking ? groupSize : travelers.adults + travelers.seniors + travelers.children
    const params = new URLSearchParams({ slot: activeSlot._id, guests })
    if (isGroupBooking) params.append('group', '1')
    navigate(`/checkout/${exp._id}?${params.toString()}`)
  }

  const handleSelectDate = (key) => {
    const nextSlots = availableSlots.filter((s) => s.dateKey === key)
    setLocalDate(key)
    if (!nextSlots.length) { setLocalSlotId(''); setFlowState('unavailable'); return }
    setLocalSlotId(String(nextSlots[0]._id))
    setFlowState('idle')
  }

  const handleApplySelection = () => {
    if (!activeSlot) { setFlowState('unavailable'); return }
    setFlowState('confirmed')
    setPickerOpen(false)
  }

  const handleJoinGroup = async () => {
    setJoiningGroup(true)
    try {
      const res  = await fetch(`/api/bookings/group/${groupCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      setGroupStatus(data.success ? 'Joined!' : data.message)
      if (data.success) refetchGroupBooking()
    } catch {
      setGroupStatus('Error joining')
    }
    setJoiningGroup(false)
  }

  const infoCards = [
    { key: 'cancellation', icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />, title: 'Free cancellation',   text: 'Up to 24 hrs before start',     onClick: () => setShowCancellationModal(true) },
    { key: 'later',        icon: <WalletCards  className="h-3.5 w-3.5 text-amber-600"  />, title: 'Reserve now, pay later', text: 'No upfront charge',            onClick: () => setShowReserveLaterModal(true) },
    { key: 'availability', icon: <CalendarDays className="h-3.5 w-3.5 text-sky-600"    />, title: `Book ${averageBookAheadDays} days ahead on average`, text: 'Secure your spot early' },
    ...(exp?.bookingSettings?.allowCollaborativeBookings
      ? [{ key: 'group', icon: <Users className="h-3.5 w-3.5 text-violet-600" />, title: 'Group booking available', text: 'Friends can split costs' }]
      : []),
  ]

  /* ── render ── */
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg lg:sticky lg:top-20">
        {/* Price header */}
        <div className="border-t-2 border-t-emerald-500 px-4 py-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-slate-900">{formatPrice(exp?.price || 0, currency?.code)}</span>
            <span className="text-xs text-slate-400">/ person</span>
          </div>
          {Number(exp?.rating?.average || 0) > 0 && (
            <div className="mt-1.5 flex items-center gap-1">
              <Stars value={exp.rating.average} />
              <span className="text-xs font-medium text-slate-700">{Number(exp.rating.average).toFixed(1)}</span>
              <span className="text-xs text-slate-400">({Number(exp.rating?.count || 0)})</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-4 pb-3 pt-1">
          {/* Collaborative group booking UI */}
          {exp?.bookingSettings?.allowCollaborativeBookings && !hasBooking && (
            <div className="mb-2.5 flex flex-col gap-1.5">
              <button
                type="button"
                className="w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 hover:bg-violet-100 transition"
                onClick={() => setShowGroupOptions((v) => !v)}
              >
                Book as Group
              </button>

              {groupBooking && (
                <button
                  type="button"
                  className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                  onClick={() => navigate(`/group/invite/${groupBooking.collaboration.groupCode}`)}
                >
                  Join Group Booking
                </button>
              )}

              {showGroupOptions && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs">
                  <p className="text-slate-600 mb-2">Enter a group code to join friends:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Group code"
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value)}
                      className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-emerald-400"
                    />
                    <button
                      type="button"
                      className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-50"
                      disabled={joiningGroup || !groupCode}
                      onClick={handleJoinGroup}
                    >
                      Join
                    </button>
                  </div>
                  {groupStatus && <p className="mt-1 text-emerald-700">{groupStatus}</p>}
                </div>
              )}
            </div>
          )}

          {/* Booking state + Check-In */}
          {hasBooking ? (
            <div className="space-y-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
                You already have a booking for this experience.
              </div>
              <CheckInButton experienceId={exp?._id} isAuthenticated={isAuthenticated} />
            </div>
          ) : flowState === 'confirmed' && activeSlot ? (
            <>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
                  <div>
                    <p className="text-xs font-medium text-slate-900">{selectedDateLabel} · {activeSlot.startTime}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{travelerSummary || '1 adult'}</p>
                  </div>
                  <button type="button" onClick={handleOpenAvailability}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50 transition">
                    Edit
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between px-0.5">
                  <span className="text-xs text-slate-500">Total · {totalTravelerCount || 1} guests</span>
                  <span className="text-lg font-semibold text-slate-900">{formatPrice(computedTotal, currency?.code)}</span>
                </div>
              </div>
              <button type="button" onClick={handleProceedToCheckout}
                className="mt-2.5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]">
                {isAuthenticated ? 'Reserve now' : 'Sign in to reserve'}
              </button>
            </>
          ) : flowState === 'unavailable' ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5">
              <p className="text-xs font-medium text-rose-800">Not available right now</p>
              <p className="mt-0.5 text-[11px] text-rose-600">No open slots for the selected date.</p>
              {dateOptions.length > 0 && (
                <button type="button" onClick={handleOpenAvailability}
                  className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition">
                  Try another date
                </button>
              )}
            </div>
          ) : (
            <>
              <button type="button" onClick={handleOpenAvailability}
                className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]">
                Check availability
              </button>
              <p className="mt-1.5 text-center text-[11px] text-slate-400">No charge until confirmation</p>
            </>
          )}
        </div>

        {/* Info cards */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
          <div className="space-y-1.5">
            {infoCards.map((item) => (
              <article
                key={item.key}
                className={`flex items-start gap-2.5 rounded-lg px-1 py-1 ${item.onClick ? 'cursor-pointer hover:bg-white transition' : ''}`}
                onClick={item.onClick}
                role={item.onClick ? 'button' : undefined}
                tabIndex={item.onClick ? 0 : undefined}
                onKeyDown={(e) => { if (item.onClick && (e.key === 'Enter' || e.key === ' ')) item.onClick() }}
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white ring-1 ring-slate-200">
                  {item.icon}
                </span>
                <div>
                  <p className="text-xs font-medium text-slate-800">{item.title}</p>
                  <p className="text-[11px] text-slate-400">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Availability picker modal */}
      {pickerOpen && dateOptions.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
          onClick={(e) => { if (e.target === e.currentTarget) setPickerOpen(false) }}
        >
          <div className="w-full max-w-[760px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">Select date &amp; guests</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isRefreshingAvailability ? 'Refreshing availability…' : 'Availability is verified before confirming.'}
                </p>
              </div>
              <button type="button" onClick={() => setPickerOpen(false)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition">
                <CircleX className="h-4 w-4" />
              </button>
            </div>

            {/* Two-column body */}
            <div className="grid md:grid-cols-[1fr_288px] divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* LEFT — Calendar */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <button type="button" onClick={() => setCalMonth((m) => addMonths(m, -1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-medium text-slate-800">
                    {calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button type="button" onClick={() => setCalMonth((m) => addMonths(m, 1))}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {weekdayLabels.map((l) => (
                    <span key={l} className="py-1 text-center text-[10px] font-medium uppercase tracking-wider text-slate-400">{l}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calCells.map((cell, i) => {
                    if (!cell) return <span key={`e-${i}`} />
                    const key       = cell.toISOString().slice(0, 10)
                    const option    = availDateMap.get(key)
                    const isAvailable = Boolean(option)
                    const isSelected  = localDate === key
                    const isToday     = sameDay(cell, new Date())
                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleSelectDate(key)}
                        className={[
                          'relative flex flex-col items-center justify-center rounded-lg py-1.5 transition',
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : isAvailable
                              ? 'hover:bg-emerald-50 border border-transparent hover:border-emerald-200'
                              : '', // No blur or cursor change for unavailable
                        ].join(' ')}
                      >
                        {isToday && !isSelected && (
                          <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-emerald-500" />
                        )}
                        <span className={`text-[13px] font-medium ${isSelected ? 'text-white' : isAvailable ? 'text-slate-800' : 'text-slate-300'}`}>
                          {cell.getDate()}
                        </span>
                        {isAvailable && (
                          <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-emerald-600'}`}>
                            {option.priceLabel || '✓'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Available</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-200" />Unavailable</span>
                </div>
              </div>

              {/* RIGHT — Slot & guests */}
              <div className="p-4 flex flex-col gap-3">
                {activeSlot ? (
                  <>
                    <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-600 mb-0.5">Selected</p>
                      <p className="text-sm font-medium text-slate-900">{selectedDateLabel}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{activeSlot.remaining} spots remaining</p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-1.5">Start time</p>
                      <div className="flex flex-wrap gap-1.5">
                        {localSlotsForDate.map((slot) => {
                          const sel = String(slot._id) === String(activeSlot._id)
                          return (
                            <button key={slot._id} type="button" onClick={() => setLocalSlotId(String(slot._id))}
                              className={`rounded-full px-3 py-1 text-xs transition ${sel ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                              {slot.startTime}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-1.5">Guests</p>
                      <div className="flex items-center gap-1.5 cursor-pointer text-xs text-violet-700">
                        <input type="checkbox" checked={isGroupBooking}
                          onChange={(e) => setIsGroupBooking(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-violet-600" />
                        Group booking
                      </div>
                    </div>

                    {isGroupBooking ? (
                      <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2.5">
                        <p className="text-[11px] text-violet-700 mb-2">Set total group size — friends pay at checkout</p>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => setGroupSize((s) => Math.max(2, s - 1))}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 hover:bg-violet-100">−</button>
                          <span className="w-8 text-center text-sm font-medium text-violet-900">{groupSize}</span>
                          <button type="button" onClick={() => setGroupSize((s) => Math.min(activeMaxGuests, s + 1))}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700 hover:bg-violet-100">+</button>
                          <span className="text-[11px] text-violet-500">max {activeMaxGuests}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {[
                          { type: 'adults',   label: 'Adults',   sub: formatPrice(PRICE_ADULT, currency?.code),                   min: 1 },
                          { type: 'children', label: 'Children', sub: `${formatPrice(PRICE_CHILD, currency?.code)} · Under 12`,   min: 0 },
                          { type: 'infants',  label: 'Infants',  sub: 'Free · Under 2',                           min: 0 },
                        ].map(({ type, label, sub, min }) => (
                          <div key={type} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                            <div>
                              <p className="text-xs font-medium text-slate-800">{label}</p>
                              <p className="text-[11px] text-slate-400">{sub}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => updateTravelers(type, -1)}
                                disabled={travelers[type] <= min}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">−</button>
                              <span className="w-5 text-center text-xs font-medium text-slate-900">{travelers[type]}</span>
                              <button type="button" onClick={() => updateTravelers(type, 1)}
                                disabled={totalTravelerCount >= activeMaxGuests}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition">+</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 min-h-[200px]">
                    <div className="text-center">
                      <CalendarDays className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-600">Pick a date first</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Guest options appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3 bg-slate-50">
              <button type="button" onClick={() => setPickerOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="button" onClick={handleApplySelection} disabled={!activeSlot}
                className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
                Confirm selection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── Main Page ──────────────────────────────────────────────────── */

const ExperienceDetailPage = () => {
  const { id }         = useParams()
  const navigate       = useNavigate()
  const location       = useLocation()
  const queryClient    = useQueryClient()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { isSaved, toggleWishlist, isPendingFor } = useWishlist()
  const { currency } = useCurrency()
  const similarExperiences = [] // Fallback array in absence of API fetch

  /* ── UI state ── */
  const [activeSection,            setActiveSection]            = useState('overview')
  const [reviewText,               setReviewText]               = useState('')
  const [reviewSearch,             setReviewSearch]             = useState('')
  const [reviewSort,               setReviewSort]               = useState('insightful')
  const [reviewRatingFilter,       setReviewRatingFilter]       = useState('all')
  const [reviewLanguageFilter,     setReviewLanguageFilter]     = useState('english')
  const [reviewMonthFilter,        setReviewMonthFilter]        = useState('all')
  const [reviewVisitTypeFilter,    setReviewVisitTypeFilter]    = useState('all')
  const [showHostRepliesOnly,      setShowHostRepliesOnly]      = useState(false)
  const [showReviewFilters,        setShowReviewFilters]        = useState(false)
  const [draftReviewRatingFilter,  setDraftReviewRatingFilter]  = useState('all')
  const [draftReviewMonthFilter,   setDraftReviewMonthFilter]   = useState('all')
  const [draftReviewVisitTypeFilter, setDraftReviewVisitTypeFilter] = useState('all')
  const [draftShowHostRepliesOnly, setDraftShowHostRepliesOnly] = useState(false)
  const [reviewRating,             setReviewRating]             = useState(5)
  const [hoverRating,              setHoverRating]              = useState(0)
  const [question,                 setQuestion]                 = useState('')
  const [answerDrafts,             setAnswerDrafts]             = useState({})
  const [openReplyComposer,        setOpenReplyComposer]        = useState({})
  const [showSaveModal,            setShowSaveModal]            = useState(false)
  const [savingItinerary,          setSavingItinerary]          = useState(false)
  const [guestFeedbackTab,         setGuestFeedbackTab]         = useState('reviews')
  const [openDetailFaq,            setOpenDetailFaq]            = useState('included')
  const [showReviewComposer,       setShowReviewComposer]       = useState(false)
  const [reviewPhotoFiles,         setReviewPhotoFiles]         = useState([])
  const [reviewPhotoPreviews,      setReviewPhotoPreviews]      = useState([])
  const [likedReviews,             setLikedReviews]             = useState({})
  const [communityComment,         setCommunityComment]         = useState('')
  const [selectedLanguage,         setSelectedLanguage]         = useState('default')
  const [showCancellationModal,    setShowCancellationModal]    = useState(false)
  const [showReserveLaterModal,    setShowReserveLaterModal]    = useState(false)
  const [guests]                                                = useState(1)

  /* ── Queries ── */
  const {
    data: exp,
    isLoading,
    refetch: refetchExperience,
    isFetching: isFetchingExperience,
  } = useQuery({
    queryKey: ['experience', id],
    queryFn:  () => getExperienceById(id).then((r) => r.data.data),
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn:  () => getReviews(id).then((r) => r.data.data),
    enabled:  Boolean(id),
  })

  const { data: questions = [] } = useQuery({
    queryKey: ['qna', id],
    queryFn:  () => getQnA(id).then((r) => r.data.data),
    enabled:  Boolean(id),
  })

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', id],
    queryFn:  () => getComments(id).then((r) => r.data.data),
    enabled:  Boolean(id),
  })

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn:  () => getMyBookings().then((r) => r.data.data),
    enabled:  isAuthenticated,
  })


  /* ── Section observer ── */
  useEffect(() => {
    if (!exp || typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return
    const sections = SECTION_TABS.map(({ id: sid }) => document.getElementById(sid)).filter(Boolean)
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) =>
            b.intersectionRatio !== a.intersectionRatio
              ? b.intersectionRatio - a.intersectionRatio
              : a.boundingClientRect.top - b.boundingClientRect.top,
          )
        if (visible[0]) setActiveSection(visible[0].target.id)
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: [0.2, 0.35, 0.5, 0.7] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [exp])

  useEffect(() => {
    if (!exp || typeof window === 'undefined') return
    const hash = window.location.hash?.replace('#', '')
    if (!hash || !SECTION_TABS.some((t) => t.id === hash)) return
    const timer = window.setTimeout(() => scrollToSection(hash), 120)
    return () => window.clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exp, location.hash])

  /* ── Mutations ── */
  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: async () => {
      setReviewText(''); setReviewRating(5); setReviewPhotoFiles([]); setReviewPhotoPreviews([]); setShowReviewComposer(false)
      toast.success('Review submitted')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews', id] }),
        queryClient.invalidateQueries({ queryKey: ['experience', id] }),
        queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
      ])
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to submit review'),
  })

  const questionMutation = useMutation({
    mutationFn: askQuestion,
    onSuccess: async () => {
      setQuestion('')
      toast.success('Question posted')
      await queryClient.invalidateQueries({ queryKey: ['qna', id] })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to post question'),
  })

  const answerMutation = useMutation({
    mutationFn: ({ qnaId, answer }) => answerQuestion(qnaId, { answer }),
    onSuccess: async (_, vars) => {
      setAnswerDrafts((p) => ({ ...p, [vars.qnaId]: '' }))
      setOpenReplyComposer((p) => ({ ...p, [vars.qnaId]: false }))
      toast.success('Answer posted')
      await queryClient.invalidateQueries({ queryKey: ['qna', id] })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to post answer'),
  })

  const commentMutation = useMutation({
    mutationFn: createComment,
    onSuccess: async () => {
      setCommunityComment('')
      toast.success('Comment posted')
      await queryClient.invalidateQueries({ queryKey: ['comments', id] })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to post comment'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: async () => {
      toast.success('Comment deleted')
      await queryClient.invalidateQueries({ queryKey: ['comments', id] })
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Unable to delete comment'),
  })

  /* ── Helpers ── */
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (!section) return
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' })
    setActiveSection(sectionId)
  }

  const sendToLogin = (sectionId) =>
    navigate('/login', { state: { from: `${location.pathname}${location.search || ''}#${sectionId}` } })

  const requireAuth = (sectionId) => {
    if (isAuthenticated) return true
    sendToLogin(sectionId)
    return false
  }

  const handleShare = async () => {
    const shareUrl   = `${window.location.origin}/experiences/${id}`
    const shareTitle = resolvedTitle || exp?.title || 'LocalXperiences'
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: `Check this experience: ${shareTitle}`, url: shareUrl })
        return
      }
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Unable to share right now')
    }
  }

  const handleSaveExperience = () => {
    if (!isAuthenticated) { sendToLogin('overview'); return }
    toggleWishlist(id)
  }

  /* ── Early returns (all hooks declared above) ── */
  if (isLoading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar /><Spinner size="lg" className="flex-1" />
    </div>
  )

  if (!exp) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center p-8">
          <p className="mb-3 text-3xl">Not found</p>
          <h2 className="mb-1.5 text-sm font-medium text-slate-900">Experience not found</h2>
          <Link to="/search" className="text-xs text-emerald-600 hover:underline">Browse experiences</Link>
        </div>
      </div>
      <Footer />
    </div>
  )

  /* ── Derived data (after early returns, no hooks below this line) ── */
  const matchingBookings      = myBookings.filter((b) => String(b.experienceId?._id || b.experienceId) === String(exp?._id || ''))
  const activeBooking         = matchingBookings.find((b) => ['pending', 'confirmed'].includes(b.status)) || null
  const eligibleReviewBooking = matchingBookings.find((b) => b.status === 'completed' && !b.reviewLeft) || null
  const reviewedBooking       = matchingBookings.find((b) => b.status === 'completed' && b.reviewLeft) || null
  const hasBooking            = Boolean(exp?.myBookingId || activeBooking?._id)
  const canReview             = isAuthenticated
  const bookingId             = exp?.myBookingId || eligibleReviewBooking?._id
  const catLabel              = CATEGORIES.find((c) => c.value === exp?.category)?.label || exp?.category || 'Experience'
  const cityKey               = exp?.location?.city?.toLowerCase().trim()
  const areaCenter            = CITY_COORDS[cityKey] || DEFAULT_CENTER
  const locationLabel         = exp?.location?.address || exp?.location?.city || 'Location not specified'
  const host                  = exp?.hostId || {}
  const rating                = Number(exp?.rating?.average || exp?.rating || 0)
  const ratingCount           = Number(exp?.rating?.count || reviews.length || 0)

  const operatorJoinedAt    = host?.createdAt ? new Date(host.createdAt) : null
  const operatorJoinedLabel = operatorJoinedAt && !Number.isNaN(operatorJoinedAt.getTime())
    ? operatorJoinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  const translations      = Array.isArray(exp?.translations) ? exp.translations : []
  const languagesSupported = Array.isArray(exp?.languagesSupported) ? exp.languagesSupported : []
  const activeTranslation = selectedLanguage === 'default' ? null : translations.find((t) => t.languageCode === selectedLanguage)
  const resolvedTitle       = activeTranslation?.title       || exp?.title
  const resolvedDescription = activeTranslation?.description || exp?.description
  const detailsSections = {
    ...(exp?.detailsSections || {}),
    whatToExpect:      activeTranslation?.whatToExpect      || exp?.detailsSections?.whatToExpect      || '',
    meetingAndPickup:  activeTranslation?.meetingAndPickup  || exp?.detailsSections?.meetingAndPickup  || '',
  }

  const reviewCallout = !isAuthenticated
    ? 'Sign in to leave a review.'
    : reviewedBooking
      ? 'You have already reviewed one of your completed bookings, but you can still share another signed-in review here.'
      : 'You are signed in and can leave a review now.'

  /* ── Availability ── */
  const availableSlots = (Array.isArray(exp?.availability) ? exp.availability : [])
    .map((slot, index) => {
      const totalSlots  = Number(slot.slots) || 0
      const bookedSlots = Number(slot.booked) || 0
      const remaining   = Math.max(0, totalSlots - bookedSlots)
      const dateObj     = new Date(slot.date)
      const slotDateTime = toSlotDateTime(slot.date, slot.startTime)
      return {
        ...slot,
        _id: slot._id || `${dateObj.toISOString()}-${slot.startTime || index}`,
        remaining, dateObj, slotDateTime,
        dateKey: toLocalDateKey(slot.date),
      }
    })
    .filter((s) =>
      s.remaining > 0 &&
      Number.isFinite(s.dateObj.getTime()) &&
      s.slotDateTime &&
      Number.isFinite(s.slotDateTime.getTime()) &&
      s.slotDateTime.getTime() > Date.now(),
    )
    .sort((a, b) => {
      const byDate = a.slotDateTime.getTime() - b.slotDateTime.getTime()
      return byDate !== 0 ? byDate : String(a.startTime || '').localeCompare(String(b.startTime || ''))
    })

  const dateOptions = []
  const seenDate    = new Set()
  availableSlots.forEach((slot) => {
    if (!seenDate.has(slot.dateKey)) {
      seenDate.add(slot.dateKey)
      dateOptions.push({
        key:   slot.dateKey,
        label: slot.dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      })
    }
  })

  const effectiveDateKey   = dateOptions[0]?.key || ''
  const slotsForDate       = availableSlots.filter((s) => s.dateKey === effectiveDateKey)
  const selectedSlot       = slotsForDate[0] || null
  const maxSelectableGuests = Math.max(1, Math.min(exp?.groupSize?.max || 10, selectedSlot?.remaining || 1))
  const safeGuests         = Math.min(guests, maxSelectableGuests)

  const averageBookAheadDays = availableSlots.length
    ? Math.max(1, Math.round(
        availableSlots.reduce((sum, slot) => {
          const diff = slot.dateObj.getTime() - Date.now()
          return sum + Math.max(0, diff / (1000 * 60 * 60 * 24))
        }, 0) / availableSlots.length,
      ))
    : 21

  const subtotal     = Number(exp?.price || 0) * safeGuests
  const total        = subtotal
  const checkoutPath = selectedSlot?._id && exp?._id
    ? `/checkout/${exp._id}?slot=${encodeURIComponent(selectedSlot._id)}&guests=${safeGuests}`
    : null

  /* ── Feature highlights ── */
  const featureHighlights = [
    exp?.storytellingProfile?.hostStory
      ? { title: 'Local storytelling', description: 'Host story, insider tips, and local perspective included.' }
      : null,
    exp?.experiencePathways?.length
      ? { title: 'Experience pathways', description: `${exp.experiencePathways.length} suggested journey${exp.experiencePathways.length === 1 ? '' : 's'} to plan a bigger day.` }
      : null,
    exp?.bookingSettings?.allowCollaborativeBookings
      ? { title: 'Collaborative groups', description: 'Friends can create or join a shared booking from checkout.' }
      : null,
    exp?.microExperience?.isEnabled
      ? { title: 'Micro-experience', description: exp.microExperience.label || 'Short-format experience for lighter schedules.' }
      : null,
    languagesSupported.length || translations.length
      ? { title: 'Language support', description: languagesSupported.length ? languagesSupported.join(', ') : 'Translated descriptions available.' }
      : null,
  ].filter(Boolean)

  /* ── Detail FAQ ── */
  const detailFaqItems = [
    {
      id: 'included', label: "What's included",
      hasContent: (exp?.includes?.length || 0) > 0 || (exp?.notIncluded?.length || 0) > 0,
      content: (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h4 className="text-xs font-medium text-slate-800 mb-2">What's included</h4>
            {exp?.includes?.length ? (
              <ul className="space-y-2">
                {exp.includes.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><ShieldCheck className="h-2.5 w-2.5" /></span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-slate-400">No included items listed.</p>}
          </div>
          <div>
            <h4 className="text-xs font-medium text-slate-800 mb-2">What's not included</h4>
            {exp?.notIncluded?.length ? (
              <ul className="space-y-2">
                {exp.notIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500"><CircleX className="h-2.5 w-2.5" /></span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : <p className="text-xs text-slate-400">No exclusions listed.</p>}
          </div>
        </div>
      ),
    },
    { id: 'whatToExpect',          label: 'What to expect',          hasContent: Boolean(detailsSections.whatToExpect),          content: <p className="text-xs leading-6 text-slate-600">{detailsSections.whatToExpect}</p> },
    { id: 'meetingAndPickup',      label: 'Meeting and pickup',      hasContent: Boolean(detailsSections.meetingAndPickup),      content: <p className="text-xs leading-6 text-slate-600">{detailsSections.meetingAndPickup}</p> },
    { id: 'accessibility',         label: 'Accessibility',           hasContent: Boolean(detailsSections.accessibility),         content: <p className="text-xs leading-6 text-slate-600">{detailsSections.accessibility}</p> },
    { id: 'additionalInformation', label: 'Additional information',  hasContent: Boolean(detailsSections.additionalInformation), content: <p className="text-xs leading-6 text-slate-600">{detailsSections.additionalInformation}</p> },
    { id: 'cancellationPolicy',    label: 'Cancellation policy',     hasContent: Boolean(detailsSections.cancellationPolicy),    content: <p className="text-xs leading-6 text-slate-600">{detailsSections.cancellationPolicy}</p> },
    { id: 'help',                  label: 'Help',                    hasContent: Boolean(detailsSections.help),                  content: <p className="text-xs leading-6 text-slate-600">{detailsSections.help}</p> },
  ].filter((item) => item.hasContent)

  /* ── Itinerary ── */
  const hostItinerary        = Array.isArray(exp.itinerary) ? exp.itinerary : []
  const hasHostItinerary     = hostItinerary.length > 0
  const geocodedExperiencePoint = resolveBestLatLng(exp.location?.coordinates, areaCenter) || toLatLng(exp.location?.coordinates)
  const experiencePoint      = areaCenter || geocodedExperiencePoint

  const fallbackRouteStops = [{
    key: 'this', name: resolvedTitle,
    meta: `${locationLabel} · ${formatDuration(exp.duration)}`,
    link: null, city: exp.location?.city, address: exp.location?.address,
    coordinates: experiencePoint, durationMinutes: Number(exp.duration) || 0, categoryLabel: catLabel,
  }]

  const routeStops = hasHostItinerary
    ? hostItinerary.map((item, i) => ({
        key: `host-step-${i + 1}`, name: item?.title || `Step ${i + 1}`,
        meta: item?.locationName || `${exp.location?.city || 'City not specified'} · ${formatDuration(item?.durationMinutes)}`,
        link: null, city: exp.location?.city, address: item?.locationName,
        coordinates: i === 0 ? experiencePoint : null,
        durationMinutes: Number(item?.durationMinutes) || 0,
        categoryLabel: catLabel, startTime: item?.startTime,
        transitionNote: item?.transitionNote, stepDescription: item?.description,
      }))
    : fallbackRouteStops

  const itinerarySteps = (hasHostItinerary) && routeStops.length > 0
    ? routeStops.map((stop, i, arr) => {
        const isStart = i === 0, isEnd = i === arr.length - 1
        const durationLabel = stop.durationMinutes > 0 ? formatDuration(stop.durationMinutes) : 'Flexible'
        return {
          key: stop.key,
          badge: isStart ? 'S' : isEnd ? 'E' : `${i + 1}`,
          label: isStart ? 'Start' : isEnd ? 'End' : `Stop ${i + 1}`,
          variant: isStart || isEnd ? 'terminal' : 'regular',
          name: stop.name,
          meta: [stop.startTime, stop.address || stop.meta].filter(Boolean).join(' · '),
          durationLabel,
          description: stop.stepDescription || buildStepDescription({ name: stop.name, city: stop.city, categoryLabel: stop.categoryLabel, isTerminal: isEnd, isStart, durationLabel }),
          transitionNote: stop.transitionNote,
          link: stop.link,
        }
      })
    : [
        { key: 'meet', badge: 'S', label: 'Start',  variant: 'terminal', name: exp.location?.address || 'Meeting point',          meta: exp.location?.city || 'Location details shared after booking', durationLabel: '10m',    description: 'Meet your host, check in, and get a quick introduction before the activity begins.',            link: null },
        { key: 'main', badge: '1', label: 'Main experience', variant: 'regular', name: resolvedTitle,                             meta: `${catLabel} · ${locationLabel}`,                               durationLabel: formatDuration(exp.duration), description: resolvedDescription || 'This is the main guided portion of the experience.', link: null },
        { key: 'end',  badge: 'E', label: 'End',    variant: 'terminal', name: exp.location?.city ? `Finish in ${exp.location.city}` : 'Experience ends here', meta: locationLabel,                  durationLabel: 'Wrap up', description: 'The host wraps up the activity here and shares final tips before you continue your day.', link: null },
      ]

  const itinerarySummary = {
    stepCount:     itinerarySteps.length,
    totalDuration: (hasHostItinerary)
      ? formatDuration(routeStops.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0) || Number(exp.duration) || 0)
      : formatDuration((Number(exp.duration) || 0) + 10),
  }

  const coordinateStops  = routeStops.filter((s) => Array.isArray(s.coordinates))
  const itineraryMarkers = coordinateStops.map((stop, i, arr) => ({
    key:      stop.key,
    label:    arr.length === 1 ? exp.location?.city || 'Location' : i === 0 ? 'Start' : i === arr.length - 1 ? 'End' : `${i}`,
    position: stop.coordinates,
  }))
  const itineraryPath   = itineraryMarkers.map((m) => m.position)
  const mapCityKey      = coordinateStops.find((s) => s.city)?.city?.toLowerCase().trim() || routeStops.find((s) => s.city)?.city?.toLowerCase().trim()
  const itineraryCenter = CITY_COORDS[mapCityKey] || areaCenter || itineraryMarkers[0]?.position

  /* ── Overview facts ── */
  const overviewFacts = [
    { label: 'Group size', value: `All ages, max ${exp.groupSize?.max || 10} per group`, icon: overviewFactIcons.group },
    { label: 'Duration',   value: `Duration: ${formatDuration(exp.duration)}`,           icon: overviewFactIcons.duration },
    { label: 'Start time', value: `Start time: ${selectedSlot ? `${selectedSlot.startTime} on ${formatDate(selectedSlot.date)}` : 'Check availability'}`, icon: overviewFactIcons.start },
    { label: 'Ticket',     value: 'Mobile ticket',                                       icon: overviewFactIcons.ticket },
    { label: 'Language',   value: `Live guide: ${host.languages?.[0] || 'English'}`,    icon: overviewFactIcons.language },
  ]

  /* ── Similar experiences ── */
  const similarCards = Array.from(
    new Map(
      similarExperiences
        .filter((item) => String(item._id) !== String(exp._id))
        .map((item) => [String(item._id), {
          _id:      item._id,
          title:    item.title,
          city:     item.location?.city || 'Pakistan',
          category: CATEGORIES.find((c) => c.value === item.category)?.label || item.category || 'Experience',
          duration: formatDuration(item.duration),
          rating:   Number(item.rating?.average || 0),
          reviews:  Number(item.rating?.count || 0),
          price:    Number(item.price || 0),
          img:      item.photos?.[0] || 'https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=900&q=80',
        }]),
    ).values(),
  ).slice(0, 4)

  /* ── Review helpers ── */
  const openReviewComposerModal = (withPhotoPicker = false) => {
    if (!requireAuth('reviews')) return
    setGuestFeedbackTab('reviews')
    setShowReviewComposer(true)
    if (withPhotoPicker) {
      window.setTimeout(() => { document.getElementById('review-photo-input')?.click() }, 80)
    }
  }

  const handleReviewPhotoChange = (event) => {
    const nextFiles = Array.from(event.target.files || []).slice(0, 5)
    reviewPhotoPreviews.forEach((url) => URL.revokeObjectURL(url))
    setReviewPhotoFiles(nextFiles)
    setReviewPhotoPreviews(nextFiles.map((f) => URL.createObjectURL(f)))
  }

  const toggleReviewLike = (reviewId) => {
    setLikedReviews((current) => {
      const next = {
        ...current,
        [reviewId]: current[reviewId]
          ? { liked: false, count: Math.max(0, (current[reviewId]?.count || 1) - 1) }
          : { liked: true,  count: (current[reviewId]?.count || 0) + 1 },
      }
      if (typeof window !== 'undefined') window.localStorage.setItem(`experience-review-likes:${id}`, JSON.stringify(next))
      return next
    })
  }

  /* ── Review filters ── */
  const isLikelyEnglishReview = (review) => {
    const text = String(review.comment || '').trim()
    if (!text) return true
    const hints = [' the ', ' and ', ' was ', ' were ', ' with ', ' great ', ' very ', ' tour ', ' trip ']
    const norm  = ` ${text.toLowerCase()} `
    return hints.some((h) => norm.includes(h)) || /^[\x00-\x7F\s.,!?'"():;\-]+$/.test(text)
  }

  const getReviewVisitType = (review) => {
    const text = String(review.comment || '').toLowerCase()
    if (/\b(family|kids|children|parents)\b/.test(text))          return 'family'
    if (/\b(couple|wife|husband|partner|honeymoon)\b/.test(text)) return 'couples'
    if (/\b(friend|friends|group|crew|bro)\b/.test(text))         return 'friends'
    if (/\bsolo|alone|myself\b/.test(text))                        return 'solo'
    return 'business'
  }

  const reviewMonthOptions     = ['january','february','march','april','may','june','july','august','september','october','november','december']
  const normalizedReviewSearch = reviewSearch.trim().toLowerCase()

  const visibleReviews = (() => {
    const ratingFilterValue = reviewRatingFilter === 'all' ? null : Number(reviewRatingFilter)
    const filtered = reviews.filter((review) => {
      const author       = String(review.userId?.name || review.guestName || '').toLowerCase()
      const comment      = String(review.comment || '').toLowerCase()
      const searchMatch  = !normalizedReviewSearch || author.includes(normalizedReviewSearch) || comment.includes(normalizedReviewSearch)
      const ratingMatch  = ratingFilterValue === null || Math.round(Number(review.rating) || 0) === ratingFilterValue
      const langMatch    = reviewLanguageFilter === 'all' || isLikelyEnglishReview(review)
      const monthMatch   = reviewMonthFilter === 'all' || reviewMonthOptions[new Date(review.createdAt).getMonth()] === reviewMonthFilter
      const visitMatch   = reviewVisitTypeFilter === 'all' || getReviewVisitType(review) === reviewVisitTypeFilter
      const replyMatch   = !showHostRepliesOnly || Boolean(review.hostReply?.text)
      return searchMatch && ratingMatch && langMatch && monthMatch && visitMatch && replyMatch
    })

    const sorted = [...filtered]
    if      (reviewSort === 'newest')  sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    else if (reviewSort === 'highest') sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))
    else if (reviewSort === 'lowest')  sorted.sort((a, b) => (Number(a.rating) || 0) - (Number(b.rating) || 0))
    else sorted.sort((a, b) => {
      const sA = (Number(a.rating) || 0) * 10 + (a.hostReply?.text ? 2 : 0) + Math.min(5, String(a.comment || '').length / 80)
      const sB = (Number(b.rating) || 0) * 10 + (b.hostReply?.text ? 2 : 0) + Math.min(5, String(b.comment || '').length / 80)
      return sB - sA
    })
    return sorted
  })()

  const appliedReviewFilterCount = [
    reviewRatingFilter !== 'all',
    reviewMonthFilter !== 'all',
    reviewVisitTypeFilter !== 'all',
    showHostRepliesOnly,
    reviewLanguageFilter !== 'english',
  ].filter(Boolean).length

  const reviewDistribution = [
    { label: 'Excellent', stars: 5 },
    { label: 'Very good', stars: 4 },
    { label: 'Average',   stars: 3 },
    { label: 'Poor',      stars: 2 },
    { label: 'Terrible',  stars: 1 },
  ].map((item) => {
    const count = reviews.filter((r) => Math.round(Number(r.rating) || 0) === item.stars).length
    const width = ratingCount > 0 ? `${Math.max(2, (count / ratingCount) * 100)}%` : '0%'
    return { ...item, count, width }
  })

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />

      <div className="mx-auto max-w-screen-xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <Link to="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-emerald-600">Experiences</Link>
          <span>/</span>
          <span className="max-w-xs truncate text-slate-600">{resolvedTitle}</span>
        </nav>

        {/* Title bar */}
        <div className="mb-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:flex-nowrap">
            <h1 className="min-w-0 shrink truncate text-lg font-semibold leading-tight text-slate-900 sm:text-xl">
              {resolvedTitle}
            </h1>

            {rating > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs">
                <strong className="font-medium text-slate-700">{rating.toFixed(1)}</strong>
                <Stars value={rating} />
                <a href="#reviews" className="text-emerald-700 underline-offset-2 hover:underline">({ratingCount})</a>
              </span>
            )}

            <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">{locationLabel}</span>
            </span>

            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
              <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
              {formatDuration(exp.duration)}
            </span>

            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              Up to {exp.groupSize?.max || 10}
            </span>

            {exp?.microExperience?.isEnabled && (
              <span className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                {exp.microExperience.label || 'Micro-experience'}
              </span>
            )}

            {translations.length > 0 && (
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600 outline-none focus:border-emerald-400"
              >
                <option value="default">Default language</option>
                {translations.map((t) => (
                  <option key={t.languageCode} value={t.languageCode}>{t.languageLabel}</option>
                ))}
              </select>
            )}

            <div className="ml-auto inline-flex shrink-0 items-center gap-1.5">
              <button type="button" onClick={handleShare}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700">
                <Share2 className="h-3 w-3" /> Share
              </button>
              <button type="button" onClick={handleSaveExperience} disabled={isPendingFor(id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition ${isSaved(id) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700'} disabled:opacity-60`}>
                <Heart className={`h-3 w-3 ${isSaved(id) ? 'fill-current' : ''}`} />
                {isSaved(id) ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-4">
          <ExperienceGallery photos={exp.photos} title={resolvedTitle} />
        </div>

        {/* Feature highlights */}
        {featureHighlights.length > 0 && (
          <section className="mb-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {featureHighlights.map((item) => (
              <article key={item.title} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-700">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.description}</p>
              </article>
            ))}
          </section>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_292px] lg:items-start xl:gap-5">
          {/* Sidebar */}
          <aside className="order-1 lg:order-2">
            <ReserveCard
              exp={exp}
              availableSlots={availableSlots}
              dateOptions={dateOptions}
              effectiveDateKey={effectiveDateKey}
              selectedSlot={selectedSlot}
              maxSelectableGuests={maxSelectableGuests}
              hasBooking={hasBooking}
              isAuthenticated={isAuthenticated}
              location={location}
              averageBookAheadDays={averageBookAheadDays}
              requireAuth={requireAuth}
              setShowCancellationModal={setShowCancellationModal}
              setShowReserveLaterModal={setShowReserveLaterModal}
              refreshAvailability={refetchExperience}
              isRefreshingAvailability={isFetchingExperience}
            />
          </aside>

          {/* Main content */}
          <div className="order-2 space-y-4 lg:order-1">
            <DetailTabs tabs={SECTION_TABS} activeSection={activeSection} onTabClick={scrollToSection} />

            <OverviewSection
              description={resolvedDescription}
              rating={rating}
              ratingCount={ratingCount}
              reviews={reviews}
              facts={overviewFacts}
              renderStars={(value) => <Stars value={value} />}
            />

            {/* Details */}
            <DetailSection id="details" eyebrow="Details" title="Trip details">
              {detailFaqItems.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {detailFaqItems.map((item, index) => {
                    const isOpen = openDetailFaq === item.id
                    return (
                      <div key={item.id} className={index === 0 ? '' : 'border-t border-slate-100'}>
                        <button type="button"
                          onClick={() => setOpenDetailFaq((p) => p === item.id ? '' : item.id)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left">
                          <span className="text-xs font-medium text-slate-800">{item.label}</span>
                          <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && <div className="border-t border-slate-50 px-4 py-3">{item.content}</div>}
                      </div>
                    )
                  })}
                </div>
              )}

              {exp.tags?.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-medium text-slate-800 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map((tag) => <Badge key={tag} variant="gray">#{tag}</Badge>)}
                  </div>
                </div>
              )}

              {(exp.storytellingProfile?.hostStory || exp.storytellingProfile?.insiderTips?.length || exp.storytellingProfile?.photoMoments?.length || exp?.microExperience?.teaser) && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-medium text-slate-800 mb-2">Host stories &amp; insider context</h3>
                  {exp.storytellingProfile?.hostStory && <p className="text-xs leading-6 text-slate-600">{exp.storytellingProfile.hostStory}</p>}
                  {exp?.microExperience?.teaser && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">{exp.microExperience.teaser}</p>}
                  {exp.storytellingProfile?.insiderTips?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-700 mb-1.5">Insider tips</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {exp.storytellingProfile.insiderTips.map((tip) => <li key={tip}>· {tip}</li>)}
                      </ul>
                    </div>
                  )}
                  {exp.storytellingProfile?.photoMoments?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-slate-700 mb-1.5">Best photo moments</p>
                      <div className="flex flex-wrap gap-1.5">
                        {exp.storytellingProfile.photoMoments.map((m) => <Badge key={m} variant="gray">{m}</Badge>)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(languagesSupported.length > 0 || translations.length > 0) && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-medium text-slate-800 mb-2">Language support</h3>
                  {languagesSupported.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {languagesSupported.map((lang) => <Badge key={lang} variant="gray">{lang}</Badge>)}
                    </div>
                  )}
                  {translations.length > 0 && (
                    <p className="mt-1.5 text-xs leading-6 text-slate-600">
                      Translated descriptions available for {translations.map((t) => t.languageLabel).join(', ')}.
                    </p>
                  )}
                </div>
              )}
            </DetailSection>

            <ItinerarySection
              title={hasHostItinerary ? 'Experience itinerary' : 'How the experience flows'}
              steps={itinerarySteps}
              center={itineraryCenter}
              markers={itineraryMarkers}
              polyline={itineraryPath}
              hasRealItinerary={Boolean(hasHostItinerary)}
              summary={itinerarySummary}
            />

            {/* Operator */}
            <DetailSection id="operator" eyebrow="Operator" title="About the operator">
              <div className="grid gap-3 lg:grid-cols-[240px_minmax(0,1fr)]">
                <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="h-28 overflow-hidden bg-slate-100">
                    <img src={exp.photos?.[0] || host.profilePic} alt={host.name || 'Operator'} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium text-slate-900">{host.name || 'Professional Trip Services'}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="font-medium">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                      {rating > 0 && <Stars value={rating} />}
                      {ratingCount > 0 && <span className="text-slate-400">({ratingCount.toLocaleString()})</span>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{exp.location?.city || 'Destination details shared after booking'}</p>
                    {operatorJoinedLabel && <p className="mt-0.5 text-[11px] text-slate-400">Joined {operatorJoinedLabel}</p>}
                    {host.languages?.length > 0 && <p className="mt-0.5 text-[11px] text-slate-400">Speaks {host.languages.join(', ')}</p>}
                  </div>
                </article>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <h3 className="text-xs font-medium text-slate-800 mb-2">Operator details</h3>
                  <div className="space-y-2 text-xs text-slate-600 leading-5">
                    {host.bio && <p>{host.bio}</p>}
                    {exp.storytellingProfile?.localConnection && <p>Local connection: {exp.storytellingProfile.localConnection}</p>}
                    <p>{host.name || 'This operator'} leads experiences in {exp.location?.city || 'this destination'} and can help with planning, meeting details, and trip questions.</p>
                  </div>
                  {ratingCount > 0 && (
                    <div className="mt-3">
                      <a href="#reviews" className="text-xs text-emerald-700 underline underline-offset-2">See guest reviews</a>
                    </div>
                  )}
                  {host?._id && (
                    <div className="mt-2">
                      <Link to={`/hosts/${host._id}`} className="text-xs text-slate-600 underline underline-offset-2">View host details, stories, pathways, and reviews</Link>
                    </div>
                  )}
                </div>
              </div>
            </DetailSection>

            {/* Reviews / Q&A / Comments */}
            <ExperienceFeedbackSection
              guestFeedbackTab={guestFeedbackTab}
              setGuestFeedbackTab={setGuestFeedbackTab}
              reviews={reviews}
              rating={rating}
              ratingCount={ratingCount}
              reviewDistribution={reviewDistribution}
              reviewLanguageFilter={reviewLanguageFilter}
              setReviewLanguageFilter={setReviewLanguageFilter}
              reviewRatingFilter={reviewRatingFilter}
              setReviewRatingFilter={setReviewRatingFilter}
              reviewMonthFilter={reviewMonthFilter}
              reviewVisitTypeFilter={reviewVisitTypeFilter}
              reviewSort={reviewSort}
              setReviewSort={setReviewSort}
              showHostRepliesOnly={showHostRepliesOnly}
              setShowHostRepliesOnly={setShowHostRepliesOnly}
              showReviewFilters={showReviewFilters}
              setShowReviewFilters={setShowReviewFilters}
              draftReviewRatingFilter={draftReviewRatingFilter}
              setDraftReviewRatingFilter={setDraftReviewRatingFilter}
              draftReviewMonthFilter={draftReviewMonthFilter}
              setDraftReviewMonthFilter={setDraftReviewMonthFilter}
              draftReviewVisitTypeFilter={draftReviewVisitTypeFilter}
              setDraftReviewVisitTypeFilter={setDraftReviewVisitTypeFilter}
              draftShowHostRepliesOnly={draftShowHostRepliesOnly}
              setDraftShowHostRepliesOnly={setDraftShowHostRepliesOnly}
              appliedReviewFilterCount={appliedReviewFilterCount}
              reviewSearch={reviewSearch}
              setReviewSearch={setReviewSearch}
              visibleReviews={visibleReviews}
              likedReviews={likedReviews}
              onToggleReviewLike={toggleReviewLike}
              renderStars={(value) => <Stars value={value} />}
              formatDate={formatDate}
              isAuthenticated={isAuthenticated}
              reviewCallout={reviewCallout}
              canReview={canReview}
              showReviewComposer={showReviewComposer}
              setShowReviewComposer={setShowReviewComposer}
              reviewText={reviewText}
              setReviewText={setReviewText}
              reviewRating={reviewRating}
              setReviewRating={setReviewRating}
              hoverRating={hoverRating}
              setHoverRating={setHoverRating}
              reviewPhotoFiles={reviewPhotoFiles}
              reviewPhotoPreviews={reviewPhotoPreviews}
              onReviewPhotoChange={handleReviewPhotoChange}
              onOpenReviewComposer={openReviewComposerModal}
              reviewMutation={reviewMutation}
              onSubmitReview={() => {
                const payload = new FormData()
                if (bookingId) payload.append('bookingId', bookingId)
                payload.append('experienceId', exp._id)
                payload.append('rating', String(reviewRating))
                payload.append('comment', reviewText.trim())
                reviewPhotoFiles.forEach((file) => payload.append('photos', file))
                reviewMutation.mutate(payload)
              }}
              questions={questions}
              question={question}
              setQuestion={setQuestion}
              questionMutation={questionMutation}
              onSubmitQuestion={() => { if (!requireAuth('qna')) return; questionMutation.mutate({ experienceId: id, question: question.trim() }) }}
              answerMutation={answerMutation}
              answerDrafts={answerDrafts}
              setAnswerDrafts={setAnswerDrafts}
              openReplyComposer={openReplyComposer}
              setOpenReplyComposer={setOpenReplyComposer}
              onSubmitAnswer={(qnaId) => answerMutation.mutate({ qnaId, answer: (answerDrafts[qnaId] || '').trim() })}
              sendToLogin={sendToLogin}
              requireAuth={requireAuth}
              onOpenReviewFilters={() => {
                setDraftReviewRatingFilter(reviewRatingFilter)
                setDraftReviewMonthFilter(reviewMonthFilter)
                setDraftReviewVisitTypeFilter(reviewVisitTypeFilter)
                setDraftShowHostRepliesOnly(showHostRepliesOnly)
                setShowReviewFilters(true)
              }}
              onApplyReviewFilters={() => {
                setReviewRatingFilter(draftReviewRatingFilter)
                setReviewMonthFilter(draftReviewMonthFilter)
                setReviewVisitTypeFilter(draftReviewVisitTypeFilter)
                setShowHostRepliesOnly(draftShowHostRepliesOnly)
                setShowReviewFilters(false)
              }}
              onResetReviewFilters={() => {
                setDraftReviewRatingFilter('all'); setDraftReviewMonthFilter('all')
                setDraftReviewVisitTypeFilter('all'); setDraftShowHostRepliesOnly(false)
                setReviewRatingFilter('all'); setReviewMonthFilter('all')
                setReviewVisitTypeFilter('all'); setShowHostRepliesOnly(false)
                setReviewLanguageFilter('english'); setShowReviewFilters(false)
              }}
            />

            {/* Experience pathways */}
            {exp?.experiencePathways?.length > 0 && (
              <DetailSection eyebrow="Pathways" title="Suggested journeys">
                <div className="grid gap-2 md:grid-cols-2">
                  {exp.experiencePathways.map((pathway, index) => (
                    <article key={`${pathway.title}-${index}`} className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-rose-500">{pathway.highlight || 'Suggested route'}</p>
                      <h3 className="mt-1 text-xs font-medium text-slate-900">{pathway.title}</h3>
                      {pathway.durationLabel && <p className="mt-0.5 text-[11px] text-slate-400">{pathway.durationLabel}</p>}
                      {pathway.summary && <p className="mt-1.5 text-xs leading-5 text-slate-600">{pathway.summary}</p>}
                    </article>
                  ))}
                </div>
              </DetailSection>
            )}

          </div>
        </div>

        {/* Similar experiences */}
        <section className="mt-6 border-t border-slate-200 pt-5">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-600">More to explore</p>
              <h2 className="text-base font-semibold text-slate-900">Similar experiences</h2>
            </div>
            <Link to="/search" className="text-xs text-emerald-600 hover:underline">View all</Link>
          </div>

          {similarCards.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {similarCards.map((item) => (
                <Link key={item._id} to={`/experiences/${item._id}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white no-underline shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative h-32 overflow-hidden">
                    <img src={item.img} alt={item.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-xs font-medium leading-5 text-slate-900">{item.title}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-400">{item.city} · {item.duration}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                        <svg className="h-3 w-3 text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <polygon points="12 2.5 15.1 8.8 22 9.8 17 14.7 18.2 21.5 12 18.1 5.8 21.5 7 14.7 2 9.8 8.9 8.8" />
                        </svg>
                        {item.rating ? item.rating.toFixed(1) : 'New'} ({item.reviews})
                      </span>
                      <span className="text-xs font-medium text-emerald-700">{formatPrice(item.price, currency?.code)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-400">
              Similar experiences will appear here soon.
            </p>
          )}
        </section>
      </div>

      {/* Mobile persistent booking bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-5 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900">{formatPrice(exp?.price || 0, currency?.code)}</span>
              <span className="text-[10px] text-slate-400">/ person</span>
            </div>
            {Number(exp?.rating?.average || 0) > 0 && (
              <div className="flex items-center gap-1">
                <Stars value={exp.rating.average} />
                <span className="text-[10px] font-bold text-slate-700">{Number(exp.rating.average).toFixed(1)}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => scrollToSection('overview')}
            className="flex-1 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition active:scale-95 hover:bg-emerald-700"
          >
            Check availability
          </button>
        </div>
      </div>

      <Footer />

      {/* Reserve now / pay later modal */}
      <Modal isOpen={showReserveLaterModal} onClose={() => setShowReserveLaterModal(false)} title="Reserve now & pay later" maxWidth="max-w-lg">
        <div className="space-y-3 text-xs leading-6 text-slate-600">
          <p>We'll reserve your spot today. Cancel up to 24 hours before your experience without making a payment immediately.</p>
          <div className="space-y-3">
            {[
              ['Find your experience',   'Choose the experience you want knowing you can secure your spot without being locked in.'],
              ['Make a reservation',     'Reserve now and pay later — commitment-free.'],
              ['Choose when to pay',     'Complete payment later once your plans are set.'],
              ['Enjoy your experience',  'Show up confident knowing your place was held.'],
            ].map(([heading, description], index) => (
              <div key={heading} className="flex gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-800 text-xs font-medium text-emerald-800">{index + 1}</span>
                <div>
                  <p className="font-medium text-slate-800">{heading}</p>
                  <p className="text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Cancellation modal */}
      <Modal isOpen={showCancellationModal} onClose={() => setShowCancellationModal(false)} title="Cancellation policy" maxWidth="max-w-lg">
        <div className="space-y-3 text-xs leading-6 text-slate-600">
          <p>For a full refund, cancel at least 24 hours before the experience's start time.</p>
          <ul className="list-disc space-y-1.5 pl-4">
            <li>Cancellations less than 24 hours before start time are non-refundable.</li>
            <li>Changes less than 24 hours before start will not be accepted.</li>
            <li>Cut-off times are based on the experience's local time.</li>
            <li>If the host cancels due to weather or operational issues, you'll receive a different date or full refund.</li>
          </ul>
        </div>
      </Modal>
    </div>
  )
}

export default ExperienceDetailPage
