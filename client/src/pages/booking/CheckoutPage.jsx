import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { getExperienceById } from '../../services/experienceService.js'
import {
  createPaymentIntent,
  confirmBooking,
  getGroupBooking,
  getBookingById,
  createGroupSharePaymentIntent,
  confirmGroupSharePayment,
} from '../../services/bookingService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import { formatPrice, formatDuration } from '../../utils/formatters.js'
import Navbar from '../../components/common/Navbar.jsx'
import Spinner from '../../components/common/Spinner.jsx'

/* ─── Stripe ─────────────────────────────────────────────── */
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripeCacheKey = '__localXperiencesStripePromise__'
const stripePromise = (() => {
  if (!globalThis[stripeCacheKey]) {
    globalThis[stripeCacheKey] = STRIPE_KEY
      ? loadStripe(STRIPE_KEY).catch(() => null)
      : Promise.resolve(null)
  }
  return globalThis[stripeCacheKey]
})()

/* ─── Helpers ────────────────────────────────────────────── */
const formatSlotDate = (d) =>
  new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

const normalizeSlotDate = (d) => {
  const p = new Date(d)
  return Number.isFinite(p.getTime()) ? p.toISOString() : d
}

const parseEmails = (raw = '', leaderEmail = '') =>
  Array.from(new Set(
    String(raw).split(/[\n,]+/)
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
      .filter((e) => e !== leaderEmail.trim().toLowerCase()),
  ))

const getCheckoutAmounts = ({
  experience,
  guests,
  pricing,
  bookingOptions,
  contact,
  groupShareMode = false,
}) => {
  const friendEmails = parseEmails(bookingOptions?.collaboration?.invitedEmails, contact?.email)
  const allEmails = [contact?.email?.trim().toLowerCase(), ...friendEmails].filter(Boolean)
  const isCollab = bookingOptions?.collaboration?.joinMode !== 'solo' || groupShareMode
  const memberCount = isCollab && allEmails.length > 1 ? allEmails.length : Math.max(1, Number(guests || 1))

  const bookingTotal = pricing?.totalAfterDiscount != null
    ? pricing.totalAfterDiscount / 100
    : Number(experience?.price || 0) * Number(guests || 1)
  const bookingDeposit = pricing?.amountDueNow != null
    ? pricing.amountDueNow / 100
    : bookingTotal
  const bookingRemaining = pricing?.remainingAmount != null
    ? pricing.remainingAmount / 100
    : Math.max(0, bookingTotal - bookingDeposit)

  const shareTotal = isCollab
    ? Math.round((bookingTotal / memberCount) * 100) / 100
    : bookingTotal
  const shareDeposit = isCollab
    ? Math.round((bookingDeposit / memberCount) * 100) / 100
    : bookingDeposit
  const shareRemaining = isCollab
    ? Math.round((bookingRemaining / memberCount) * 100) / 100
    : bookingRemaining

  return {
    friendEmails,
    allEmails,
    isCollab,
    memberCount,
    bookingTotal,
    bookingDeposit,
    bookingRemaining,
    shareTotal,
    shareDeposit,
    shareRemaining,
  }
}

/* ─── Icons ──────────────────────────────────────────────── */
const LockIcon = () => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const CheckIcon = ({ cls = 'h-3.5 w-3.5' }) => (
  <svg className={cls} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const ChevronLeft = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="m15 18-6-6 6-6" />
  </svg>
)
const SpinnerIcon = () => (
  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

/* ─── Shared input styles ────────────────────────────────── */
const iCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition'
const lCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-400'

/* ─── Toggle ─────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ${checked ? 'bg-emerald-500' : 'bg-slate-200'}`}
  >
    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
  </button>
)

/* ─── Step definitions ───────────────────────────────────── */
const SOLO_STEPS = [
  { id: 'contact', label: 'Contact' },
  { id: 'options', label: 'Options' },
  { id: 'payment', label: 'Payment' },
  { id: 'done',    label: 'Confirmed' },
]
const COLLAB_STEPS = [
  { id: 'contact', label: 'Contact' },
  { id: 'options', label: 'Options' },
  { id: 'group',   label: 'Group' },
  { id: 'invite',  label: 'Invite' },
  { id: 'payment', label: 'Payment' },
  { id: 'done',    label: 'Confirmed' },
]
const JOIN_GROUP_STEPS = [
  { id: 'contact', label: 'Contact' },
  { id: 'options', label: 'Options' },
  { id: 'group',   label: 'Group' },
  { id: 'payment', label: 'Payment' },
  { id: 'done',    label: 'Confirmed' },
]

/* ═══════════════════════════════════════════════════════════
   HORIZONTAL STEPPER
══════════════════════════════════════════════════════════════ */
const HorizStepper = ({ steps, currentIdx }) => (
  <div className="mb-6 flex items-center">
    {steps.map((s, i) => {
      const done   = i < currentIdx
      const active = i === currentIdx
      return (
        <div key={s.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all ${
              done   ? 'bg-emerald-500 text-white' :
              active ? 'bg-emerald-700 text-white ring-4 ring-emerald-100' :
                       'bg-slate-100 text-slate-400'
            }`}>
              {done ? <CheckIcon cls="h-3 w-3" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${
              active ? 'text-emerald-700' : done ? 'text-emerald-500' : 'text-slate-400'
            }`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mb-3.5 h-px flex-1 mx-1 transition-colors ${i < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          )}
        </div>
      )
    })}
  </div>
)

/* ─── Back + primary CTA row ─────────────────────────────── */
const NavRow = ({ onBack, showBack, children }) => (
  <div className="mt-6 flex gap-3">
    {showBack && (
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <ChevronLeft /> Back
      </button>
    )}
    <div className="flex-1">{children}</div>
  </div>
)

const Btn = ({ children, onClick, type = 'button', disabled, loading }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
  >
    {loading ? <><SpinnerIcon /> Processing…</> : children}
  </button>
)

/* ═══════════════════════════════════════════════════════════
   PANEL: Contact
══════════════════════════════════════════════════════════════ */
const ContactPanel = ({ contact, setContact, onNext }) => {
  const set = (f, v) => setContact((p) => ({ ...p, [f]: v }))
  const valid = contact.firstName.trim() && contact.lastName.trim() && contact.email.includes('@')
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Contact details</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">We'll send booking updates to these details.</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lCls}>First name *</label>
          <input type="text" value={contact.firstName} onChange={(e) => set('firstName', e.target.value)} className={iCls} placeholder="Sarah" />
        </div>
        <div>
          <label className={lCls}>Last name *</label>
          <input type="text" value={contact.lastName} onChange={(e) => set('lastName', e.target.value)} className={iCls} placeholder="Connor" />
        </div>
        <div className="col-span-2">
          <label className={lCls}>Email *</label>
          <input type="email" value={contact.email} onChange={(e) => set('email', e.target.value)} className={iCls} placeholder="sarah@example.com" />
        </div>
        <div>
          <label className={lCls}>Country code</label>
          <select value={contact.phoneCountry} onChange={(e) => set('phoneCountry', e.target.value)} className={iCls}>
            <option value="+1">United States (+1)</option>
            <option value="+44">United Kingdom (+44)</option>
            <option value="+92">Pakistan (+92)</option>
            <option value="+91">India (+91)</option>
          </select>
        </div>
        <div>
          <label className={lCls}>Phone</label>
          <input type="tel" value={contact.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} className={iCls} placeholder="555 0100" />
        </div>
      </div>
      <NavRow showBack={false}>
        <Btn onClick={onNext} disabled={!valid}>Continue →</Btn>
      </NavRow>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PANEL: Options
══════════════════════════════════════════════════════════════ */
const OptionsPanel = ({ experience, bookingOptions, setBookingOptions, onNext, onBack }) => {
  const splitOn  = bookingOptions.splitPayment
  const collabOn = bookingOptions.collaboration.joinMode !== 'solo'
  const allowSplit  = experience?.bookingSettings?.allowSplitPayments
  const allowCollab = experience?.bookingSettings?.allowCollaborativeBookings

  const toggleSplit  = (v) => setBookingOptions((p) => ({ ...p, splitPayment: v }))
  const toggleCollab = (v) => setBookingOptions((p) => ({
    ...p,
    collaboration: { ...p.collaboration, joinMode: v ? 'create' : 'solo' },
  }))

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Booking options</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">Customize how you'd like to book and pay.</p>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
        {allowSplit && (
          <div className="flex items-center gap-3 bg-white px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base">💳</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">Split payment</p>
              <p className="text-xs text-slate-500">Pay a deposit now, the rest before the experience.</p>
            </div>
            <Toggle checked={splitOn} onChange={toggleSplit} />
          </div>
        )}
        {allowCollab && (
          <div className="flex items-center gap-3 bg-white px-4 py-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-base">👥</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800">Group booking</p>
              <p className="text-xs text-slate-500">Book with friends and split the cost evenly.</p>
            </div>
            <Toggle checked={collabOn} onChange={toggleCollab} />
          </div>
        )}
        {!allowSplit && !allowCollab && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">No additional options for this experience.</div>
        )}
      </div>
      {splitOn && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2.5">
          <span className="mt-0.5 text-sm leading-none">ℹ️</span>
          <p className="text-xs text-blue-700">You can choose deposit or full payment on the payment step.</p>
        </div>
      )}
      {collabOn && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2.5">
          <span className="mt-0.5 text-sm leading-none">👥</span>
          <p className="text-xs text-violet-700">You'll set up your group and invite friends in the next steps.</p>
        </div>
      )}
      <NavRow showBack onBack={onBack}>
        <Btn onClick={onNext}>Continue →</Btn>
      </NavRow>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PANEL: Group Details
══════════════════════════════════════════════════════════════ */
const GroupPanel = ({ bookingOptions, setBookingOptions, onNext, onBack }) => {
  const c   = bookingOptions.collaboration
  const upd = (patch) => setBookingOptions((p) => ({ ...p, collaboration: { ...p.collaboration, ...patch } }))
  const isJoin = c.joinMode === 'join'
  const valid  = isJoin ? c.groupCode.trim() : c.groupName.trim()

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Group details</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">Create a new group or join an existing one.</p>
      <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
        {[{ v: 'create', l: 'Create group' }, { v: 'join', l: 'Join existing' }].map(({ v, l }) => (
          <button
            key={v}
            type="button"
            onClick={() => upd({ joinMode: v })}
            className={`rounded-md px-4 py-1.5 text-xs font-medium transition-all ${
              c.joinMode === v ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="space-y-3">
          {isJoin && (
            <>
              <div>
                <label className={lCls}>Group code *</label>
                <input
                  type="text"
                  value={c.groupCode}
                  onChange={(e) => upd({ groupCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HIKE42"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Group name *</label>
                <input
                  type="text"
                  value={c.groupName}
                  onChange={(e) => upd({ groupName: e.target.value })}
                  placeholder="Weekend Hikers"
                  className={iCls}
                />
              </div>
              {/* No invite message for join */}
            </>
          )}
          {!isJoin && (
            <>
              <div>
                <label className={lCls}>Group name *</label>
                <input
                  type="text"
                  value={c.groupName}
                  onChange={(e) => upd({ groupName: e.target.value })}
                  placeholder="Weekend Hikers"
                  className={iCls}
                />
              </div>
              <div>
                <label className={lCls}>Invite message (optional)</label>
                <textarea
                  rows={2}
                  value={c.inviteNote}
                  onChange={(e) => upd({ inviteNote: e.target.value })}
                  placeholder="Hey! Join me for this awesome experience…"
                  className={`${iCls} resize-none`}
                />
              </div>
            </>
          )}
      </div>
      <NavRow showBack onBack={onBack}>
        <Btn onClick={onNext} disabled={!valid}>Continue →</Btn>
      </NavRow>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PANEL: Invite Friends
══════════════════════════════════════════════════════════════ */
const InvitePanel = ({ bookingOptions, setBookingOptions, contact, pricing, experience, guests, onNext, onBack }) => {
  const [inputVal, setInputVal] = useState('')
  const rawEmails    = bookingOptions.collaboration.invitedEmails || ''
  const friendEmails = parseEmails(rawEmails, contact.email)

  const updateEmails = (list) =>
    setBookingOptions((p) => ({
      ...p,
      collaboration: { ...p.collaboration, invitedEmails: list.join('\n') },
    }))

  const addEmail = () => {
    const val = inputVal.trim().toLowerCase().replace(/,/g, '')
    if (!val || !val.includes('@')) return
    if (!friendEmails.includes(val) && val !== contact.email.toLowerCase()) {
      updateEmails([...friendEmails, val])
    }
    setInputVal('')
  }

  const removeEmail = (e) => updateEmails(friendEmails.filter((x) => x !== e))
  const handleKey   = (ev) => { if (ev.key === 'Enter' || ev.key === ',') { ev.preventDefault(); addEmail() } }

  const { allEmails, shareTotal } = getCheckoutAmounts({
    experience,
    guests,
    pricing,
    bookingOptions,
    contact,
  })
  const isJoin    = bookingOptions.collaboration.joinMode === 'join'
  const expectedFriends = Math.max(0, Number(guests || 1) - 1)
  const canNext   = isJoin || friendEmails.length === expectedFriends

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Invite friends</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">Add friend emails. The cost splits evenly across everyone in the group.</p>

      {friendEmails.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {friendEmails.map((email) => (
            <span key={email} className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 pl-3 pr-1.5 py-1 text-xs text-slate-700">
              {email}
              <button type="button" onClick={() => removeEmail(email)} className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 transition-colors">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-2">
        <input
          type="email"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          placeholder="friend@example.com"
          className={`${iCls} flex-1`}
        />
        <button
          type="button"
          onClick={addEmail}
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Add
        </button>
      </div>
      <p className="mb-4 text-[11px] text-slate-400">Press Enter or comma to add. Duplicates are ignored.</p>
      {!isJoin && (
        <p className={`mb-4 text-[11px] ${friendEmails.length === expectedFriends ? 'text-emerald-600' : 'text-amber-600'}`}>
          This booking is for {guests} guests, so add {expectedFriends} friend email{expectedFriends === 1 ? '' : 's'} before continuing.
        </p>
      )}

      {allEmails.length > 1 && (
        <div className="mb-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
            Split preview · {allEmails.length} people
          </p>
          <div className="space-y-1.5">
            {allEmails.map((email, idx) => (
              <div key={email} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0 mr-2">
                  <span className="truncate text-slate-700">{email}</span>
                  {idx === 0 && (
                    <span className="shrink-0 rounded-full bg-emerald-200 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-800">You</span>
                  )}
                </div>
                <span className="shrink-0 font-semibold text-emerald-800">{formatPrice(shareTotal)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <NavRow showBack onBack={onBack}>
        <Btn onClick={onNext} disabled={!canNext}>
          {canNext ? 'Continue to payment →' : `Add ${expectedFriends} friend email${expectedFriends === 1 ? '' : 's'}`}
        </Btn>
      </NavRow>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PANEL: Payment
══════════════════════════════════════════════════════════════ */
const PaymentPanel = ({
  experience, selectedSlot, guests, pricing, contact,
  clientSecret, paymentIntentId, bookingOptions, onBack, onSuccess, groupShareMode = false,
}) => {
  const [payMode, setPayMode] = useState('full')
  const [loading, setLoading] = useState(false)
  const stripe      = useStripe()
  const elements    = useElements()
  const queryClient = useQueryClient()

  const {
    allEmails,
    bookingTotal,
    shareTotal,
    shareDeposit,
    shareRemaining,
  } = getCheckoutAmounts({
    experience,
    guests,
    pricing,
    bookingOptions,
    contact,
    groupShareMode,
  })
  const hasSplit  = pricing?.splitPayment && !groupShareMode
  const dueNow    = payMode === 'partial' && hasSplit ? shareDeposit : shareTotal

  const buildSplitPayments = () => {
    if (bookingOptions?.collaboration?.joinMode !== 'create') return []
    if (!allEmails.length) return []
    const totalCents = Math.round(bookingTotal * 100)
    const base = Math.floor(totalCents / allEmails.length)
    return allEmails.map((email, i) => ({
      email,
      amount: i === allEmails.length - 1 ? totalCents - base * (allEmails.length - 1) : base,
      isLeader: i === 0,
    }))
  }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!selectedSlot) { toast.error('Time slot no longer available'); return }
    setLoading(true)
    try {
      const isProd = import.meta.env.PROD
      let piResult = null
      if (stripe && elements) {
        try {
          piResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement(CardElement) },
          })
        } catch (err) {
          if (isProd) { toast.error(err.message || 'Payment failed'); setLoading(false); return }
          console.warn('Dev: ignoring Stripe error:', err)
        }
      }
      const { error, paymentIntent } = piResult || {}
      if (error && isProd) { toast.error(error.message || 'Payment failed'); setLoading(false); return }
      if (isProd && paymentIntent?.status !== 'succeeded') { toast.error('Payment not completed'); setLoading(false); return }

      const payloadPaymentIntentId = paymentIntentId || paymentIntent?.id
      const response = groupShareMode
        ? await confirmGroupSharePayment(bookingOptions.collaboration.groupCode, {
            paymentIntentId: payloadPaymentIntentId,
          })
        : await confirmBooking({
            experienceId:    experience._id,
            guestCount:      Number(guests),
            slot:            { date: selectedSlot.date, startTime: selectedSlot.startTime },
            splitPayment:    bookingOptions.splitPayment,
            costShare:       bookingOptions.collaboration.joinMode === 'create' && Number(guests) > 1,
            collaboration:   bookingOptions.collaboration,
            splitPayments:   buildSplitPayments(),
            contact:         { ...contact, phone: `${contact.phoneCountry} ${contact.phoneNumber}`.trim() },
            paymentIntentId: payloadPaymentIntentId,
          })

      const { data } = response

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['myBookings'] }),
        queryClient.invalidateQueries({ queryKey: ['pickedForYou'] }),
        queryClient.invalidateQueries({ queryKey: ['groupBooking'] }),
      ])
      toast.success(groupShareMode ? 'Your share is paid!' : 'Booking confirmed!')
      onSuccess(data.data._id)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500">Complete your secure payment to confirm your spot.</p>

      {hasSplit && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-slate-500">How much would you like to pay now?</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { k: 'full',    label: 'Pay in full', amt: shareTotal,   sub: null },
              { k: 'partial', label: 'Pay deposit', amt: shareDeposit, sub: shareRemaining > 0 ? `+${formatPrice(shareRemaining)} due later` : null },
            ].map(({ k, label, amt, sub }) => (
              <button
                key={k}
                type="button"
                onClick={() => setPayMode(k)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  payMode === k
                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className={`text-xs font-medium ${payMode === k ? 'text-emerald-700' : 'text-slate-500'}`}>{label}</p>
                <p className={`text-lg font-bold mt-0.5 ${payMode === k ? 'text-emerald-900' : 'text-slate-800'}`}>{formatPrice(amt)}</p>
                {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handlePay} className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                  color: '#0f172a',
                  '::placeholder': { color: '#94a3b8' },
                },
              },
            }}
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <LockIcon /><span>Secured by Stripe · Card details are never stored</span>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
          <CheckIcon cls="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span className="text-xs text-emerald-700">Free cancellation up to 24 hours before the experience.</span>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft /> Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 transition-colors"
          >
            {loading ? <><SpinnerIcon /> Processing…</> : <>Confirm &amp; pay {formatPrice(dueNow)}</>}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400">No hidden charges · Encrypted payment</p>
      </form>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   PANEL: Confirmed
══════════════════════════════════════════════════════════════ */

const DonePanel = ({ contact, bookingOptions, pricing, experience, guests, bookingId }) => {
	// Fetch the real booking from backend if bookingId is present
	const { data: booking, isLoading: bookingLoading } = useQuery({
		queryKey: ['booking', bookingId],
		queryFn: () => bookingId ? getBookingById(bookingId).then(r => r.data.data) : Promise.resolve(null),
		enabled: !!bookingId,
	})

	const userEmail = contact.email.trim().toLowerCase()
	const isCollab = bookingOptions.collaboration.joinMode !== 'solo'
  const checkoutInvites = parseEmails(bookingOptions?.collaboration?.invitedEmails, contact.email)
  const fallbackMembers = (() => {
    const bookingInvites = Array.isArray(booking?.collaboration?.invitedEmails)
      ? booking.collaboration.invitedEmails
      : []
    const merged = [booking?.contact?.email || contact.email, ...bookingInvites, ...checkoutInvites].filter(Boolean)
    return Array.from(new Set(merged.map((email) => String(email).toLowerCase()))).map((email, index) => ({
      email,
      amount: booking?.splitPayments?.[index]?.amount || null,
      status: index === 0 ? 'paid' : 'pending',
      isLeader: index === 0,
    }))
  })()
  const members = booking && Array.isArray(booking.splitPayments) && booking.splitPayments.length > 0
    ? booking.splitPayments
    : fallbackMembers

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckIcon cls="h-8 w-8 text-emerald-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">You're booked!</h2>
      <p className="mt-2 text-sm text-slate-500">
        Confirmation sent to <span className="font-medium text-slate-700">{contact.email}</span>
      </p>

      {isCollab && (
        <div className="mt-5 text-left rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Group payment status</p>
          <div className="space-y-2">
            {bookingLoading ? (
              <div className="text-center text-xs text-slate-400 py-2">Fetching latest status…</div>
            ) : members.length > 0 ? (
              members.map((share) => {
                const isYou = share.email && userEmail && share.email.toLowerCase() === userEmail;
                const amount = typeof share.amount === 'number' ? formatPrice(share.amount / 100) : '';
                return (
                  <div key={share.email} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0 mr-2">
                      <span className="truncate text-slate-700">{share.email}</span>
                      {isYou && <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">You</span>}
                      {share.isLeader && <span className="ml-1 text-[10px] text-violet-500">(leader)</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-500">{amount}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${share.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {share.status === 'paid' ? 'Paid' : share.status === 'pending' ? 'Pending' : 'Invited'}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center text-xs text-slate-400 py-2">No group payment data available.</div>
            )}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">Friends have 48 hours to complete their payment.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {bookingId && (
          <Link
            to={`/booking/confirm/${bookingId}`}
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-emerald-800 transition-colors"
          >
            View booking details
          </Link>
        )}
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 no-underline hover:bg-slate-50 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   RIGHT COLUMN — Static Summary + Live Group Progress
══════════════════════════════════════════════════════════════ */
const SummaryPanel = ({ experience, selectedSlot, guests, pricing, bookingOptions, contact, confirmed, confirmedBookingId = null, groupShareMode = false }) => {
  const photo        = experience.photos?.[0]
  const discount     = pricing?.discountAmount != null
    ? pricing.discountAmount / 100
    : 0
  const formattedDate = selectedSlot ? formatSlotDate(selectedSlot.date) : ''
  const {
    allEmails,
    isCollab,
    bookingTotal,
    shareTotal,
  } = getCheckoutAmounts({
    experience,
    guests,
    pricing,
    bookingOptions,
    contact,
    groupShareMode,
  })
  const userEmail = contact.email.trim().toLowerCase()
  const { data: summaryBooking } = useQuery({
    queryKey: ['booking-summary', confirmedBookingId],
    queryFn: () => confirmedBookingId ? getBookingById(confirmedBookingId).then((r) => r.data.data) : Promise.resolve(null),
    enabled: Boolean(confirmedBookingId && isCollab),
  })
  const memberStatuses = Array.isArray(summaryBooking?.splitPayments) && summaryBooking.splitPayments.length > 0
    ? summaryBooking.splitPayments.map((share) => ({
        email: String(share.email || '').toLowerCase(),
        status: share.status || 'pending',
      }))
    : allEmails.map((email) => ({
        email,
        status: confirmed && email === userEmail ? 'paid' : 'pending',
      }))
  const paidCount = memberStatuses.filter((member) => member.status === 'paid').length
  const totalMembers = memberStatuses.length || allEmails.length

  if (groupShareMode) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="h-44 w-full bg-emerald-100 overflow-hidden">
            {photo
              ? <img src={photo} alt={experience.title} className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-5xl">ðŸ•</div>
            }
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold text-slate-900 leading-snug">{experience.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[formatDuration(experience.duration), experience.location?.city, formattedDate, selectedSlot?.startTime]
                .filter(Boolean).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-500">{tag}</span>
                ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500">Invited member checkout</p>

            <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Your payment share</span>
                <span>{formatPrice(bookingTotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span className="text-sm font-semibold text-slate-900">Due now</span>
                <span className="text-xl font-bold text-slate-900">{formatPrice(bookingTotal)}</span>
              </div>
              <p className="text-xs font-medium text-emerald-700">
                This checkout only charges your share of the group booking.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
          <div className="space-y-2">
            {[
              { icon: 'Secure', text: 'Secured by Stripe' },
              { icon: 'Flex', text: 'Free cancellation within 24h' },
              { icon: 'Email', text: 'Instant confirmation email' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-xs text-slate-500">
                <span className="w-10 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Experience summary */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="h-44 w-full bg-emerald-100 overflow-hidden">
          {photo
            ? <img src={photo} alt={experience.title} className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center text-5xl">🏕</div>
          }
        </div>
        <div className="p-4">
          <p className="text-sm font-semibold text-slate-900 leading-snug">{experience.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[formatDuration(experience.duration), experience.location?.city, formattedDate, selectedSlot?.startTime]
              .filter(Boolean).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-500">{tag}</span>
              ))}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{guests} adult{guests > 1 ? 's' : ''}</p>

          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            <div className="flex justify-between text-sm text-slate-500">
              <span>{formatPrice(experience.price)} × {guests}</span>
              <span>{formatPrice(experience.price * guests)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-700">
                <span>Group savings{pricing?.pricingLabel ? ` · ${pricing.pricingLabel}` : ''}</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(bookingTotal)}</span>
            </div>
            {isCollab && allEmails.length > 1 && (
              <p className="text-xs font-medium text-emerald-700">
                Your share: {formatPrice(shareTotal)} · {allEmails.length} people
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Live group progress widget — shows as soon as friends are added */}
      {isCollab && totalMembers > 1 && (
        <div className="rounded-2xl border border-violet-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">Group progress</p>
            <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-600">
              {paidCount}/{totalMembers} paid
            </span>
          </div>
          <div className="space-y-2 mb-3">
            {memberStatuses.map((member) => (
              <div key={member.email} className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs">
                <div className={`h-2 w-2 shrink-0 rounded-full ${member.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span className="flex-1 truncate text-violet-800">{member.email}</span>
                {member.email === userEmail && <span className="text-[9px] font-semibold uppercase text-violet-400">you</span>}
                <span className={`font-semibold ${member.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {member.status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-violet-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${totalMembers > 0 ? Math.round((paidCount / totalMembers) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Trust signals */}
      <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
        <div className="space-y-2">
          {[
            { icon: '🔒', text: 'Secured by Stripe' },
            { icon: '✅', text: 'Free cancellation within 24h' },
            { icon: '📧', text: 'Instant confirmation email' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-xs text-slate-500">
              <span className="text-sm leading-none">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   ERROR / LOADING WRAPPER
══════════════════════════════════════════════════════════════ */
const CenteredCard = ({ emoji, title, subtitle, actions }) => (
  <div className="flex min-h-screen flex-col bg-slate-50">
    <Navbar />
    <div className="mx-auto flex w-full max-w-md flex-1 items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="mb-3 text-4xl">{emoji}</p>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
        {actions && <div className="mt-5 flex flex-wrap justify-center gap-3">{actions}</div>}
      </div>
    </div>
  </div>
)

/* ═══════════════════════════════════════════════════════════
   PAGE — CheckoutPage
══════════════════════════════════════════════════════════════ */
const CheckoutPage = () => {
  const { user }         = useSelector((s) => s.auth)
  const { experienceId } = useParams()
  const [urlParams]      = useSearchParams()
  const navigate         = useNavigate()

  const slotId = urlParams.get('slot')
  const slotDateParam = urlParams.get('slotDate')
  const startTimeParam = urlParams.get('startTime')
  const groupCodeParam = urlParams.get('groupCode')
  const guests = Number(urlParams.get('guests') || 1)
  const isGroupJoinFlow = urlParams.get('group') === '1' && Boolean(groupCodeParam)

  /* ── State ── */
  const [stepIdx,            setStepIdx]            = useState(0)
  const [confirmed,          setConfirmed]           = useState(false)
  const [confirmedBookingId, setConfirmedBookingId]  = useState(null)

  const [clientSecret,     setClientSecret]     = useState(null)
  const [paymentIntentId,  setPaymentIntentId]  = useState(null)
  const [paymentInitError, setPaymentInitError] = useState('')
  const [pricing,          setPricing]          = useState(null)

  const [contact, setContact] = useState({
    firstName: '', lastName: '', email: '',
    phoneCountry: '+1', phoneNumber: '', smsOptIn: false,
  })

  const [bookingOptions, setBookingOptions] = useState({
    splitPayment: false,
    collaboration: { joinMode: 'solo', groupCode: '', groupName: '', inviteNote: '', invitedEmails: '' },
  })

  const forceAllow = true // set false in production

  /* ── Data ── */
  const { data: exp, isLoading } = useQuery({
    queryKey: ['experience', experienceId],
    queryFn:  () => getExperienceById(experienceId).then((r) => r.data.data),
  })

  const { data: groupBooking } = useQuery({
    queryKey: ['groupBooking', groupCodeParam],
    queryFn: () => getGroupBooking(groupCodeParam).then((r) => r.data.data),
    enabled: Boolean(groupCodeParam),
  })
  const effectiveGroupCode = groupBooking?.collaboration?.groupCode
    || bookingOptions.collaboration.groupCode
    || groupCodeParam
  const isJoinExistingFlow = bookingOptions.collaboration.joinMode === 'join' && Boolean(effectiveGroupCode)
  const isSharePaymentFlow = isGroupJoinFlow || isJoinExistingFlow

  useEffect(() => {
    if (!user) return
    const parts = String(user.name || '').trim().split(/\s+/)
    setContact((p) => ({
      ...p,
      firstName:   parts[0]                 || p.firstName,
      lastName:    parts.slice(1).join(' ') || p.lastName,
      email:       user.email               || p.email,
      phoneNumber: user.phone               || p.phoneNumber,
    }))
  }, [user])

  // Auto-select join tab and pre-fill group code if present in URL
  useEffect(() => {
    const groupParam = urlParams.get('group');
    if (groupParam === '1') {
      setBookingOptions((p) => ({
        ...p,
        splitPayment: groupCodeParam ? true : p.splitPayment,
        collaboration: {
          ...p.collaboration,
          joinMode: groupCodeParam ? 'join' : 'create',
          groupCode: groupCodeParam || p.collaboration.groupCode,
        },
      }));
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!groupBooking) return
    setBookingOptions((p) => ({
      ...p,
      splitPayment: true,
      collaboration: {
        ...p.collaboration,
        joinMode: 'join',
        groupCode: groupBooking?.collaboration?.groupCode || p.collaboration.groupCode,
        groupName: groupBooking?.collaboration?.groupName || p.collaboration.groupName,
      },
    }))
  }, [groupBooking])

  const selectedSlot = exp?.availability?.find((s) => {
    if (slotId && String(s._id) === String(slotId)) return true
    if (!slotDateParam || !startTimeParam) return false
    return normalizeSlotDate(s.date) === slotDateParam && String(s.startTime) === String(startTimeParam)
  }) || null

  /* ── Payment intent ── */
  const initPayment = useCallback(() => {
    if (!exp || !selectedSlot) return
    if (isSharePaymentFlow && !effectiveGroupCode) return
    setPaymentInitError('')
    const intentRequest = isSharePaymentFlow
      ? createGroupSharePaymentIntent(effectiveGroupCode)
      : createPaymentIntent({
          experienceId,
          guestCount:   guests,
          slot:         { date: normalizeSlotDate(selectedSlot.date), startTime: selectedSlot.startTime },
          splitPayment: bookingOptions.splitPayment,
          costShare:    bookingOptions.collaboration.joinMode === 'create' && Number(guests) > 1,
        })

    intentRequest
      .then(({ data }) => {
        setClientSecret(data.data.clientSecret)
        setPaymentIntentId(data.data.paymentIntentId)
        setPricing(data.data.pricing)
      })
      .catch((err) => {
        const msg = getErrorMessage(err)
        setPaymentInitError(msg)
        toast.error(msg)
      })
  }, [exp, selectedSlot, guests, experienceId, bookingOptions.splitPayment, isSharePaymentFlow, effectiveGroupCode]) // eslint-disable-line

  useEffect(() => {
    if (!exp) return
    if (!selectedSlot) { toast.error('Selected time slot is no longer available'); return }
    initPayment()
  }, [exp, selectedSlot]) // eslint-disable-line

  useEffect(() => {
    if (!exp || !selectedSlot) return
    initPayment()
  }, [bookingOptions.splitPayment]) // eslint-disable-line

  /* ── Enriched experience ── */
  const enrichedExp = exp
    ? {
        ...exp,
        bookingSettings: {
          ...exp.bookingSettings,
          allowCollaborativeBookings: forceAllow || exp.bookingSettings?.allowCollaborativeBookings,
          allowSplitPayments:         forceAllow || exp.bookingSettings?.allowSplitPayments,
        },
      }
    : null

  /* ── Dynamic step list — recomputed when collab toggles ── */
  const isCollabOn = bookingOptions.collaboration.joinMode !== 'solo'
  const steps = isSharePaymentFlow
    ? JOIN_GROUP_STEPS
    : isCollabOn
      ? COLLAB_STEPS
      : SOLO_STEPS

  // If user toggles collab OFF while on group/invite step, snap back to options
  useEffect(() => {
    if (!isCollabOn && (stepIdx === 2 || stepIdx === 3)) {
      setStepIdx(1)
    }
  }, [isCollabOn]) // eslint-disable-line

  /* ── Navigation helpers ── */
  const goNext = () => setStepIdx((i) => Math.min(i + 1, steps.length - 1))
  const goBack = () => setStepIdx((i) => Math.max(i - 1, 0))

  const handleSuccess = (id) => {
    setConfirmedBookingId(id)
    setConfirmed(true)
    setStepIdx(steps.length - 1)
  }

  const currentStepId = steps[stepIdx]?.id

  /* ── Error / loading guards ── */
  if (isLoading)
    return <div className="flex min-h-screen flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>

  if (exp && !selectedSlot)
    return (
      <CenteredCard emoji="📅" title="Time slot unavailable" subtitle="This slot is no longer available. Please choose another time."
        actions={<Link to={`/experiences/${experienceId}`} className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-emerald-800">Back to experience</Link>}
      />
    )

  if (!clientSecret && paymentInitError)
    return (
      <CenteredCard emoji="⚠️" title="Checkout could not start" subtitle={paymentInitError}
        actions={
          <>
            <button type="button" onClick={initPayment} className="inline-flex rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Try again</button>
            <Link to={`/experiences/${experienceId}`} className="inline-flex rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline hover:bg-slate-50">Back to experience</Link>
          </>
        }
      />
    )

  if (!clientSecret)
    return <div className="flex min-h-screen flex-col bg-slate-50"><Navbar /><Spinner size="lg" className="flex-1" /></div>

  /* ─── Main render ──────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Checkout</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Complete your booking</h1>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">

            {/* ── LEFT: single wizard card, content swaps in place ── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
              <HorizStepper steps={steps} currentIdx={stepIdx} />
              <div className="border-t border-slate-100 mb-6" />

              {currentStepId === 'contact' && (
                <ContactPanel contact={contact} setContact={setContact} onNext={goNext} />
              )}
              {currentStepId === 'options' && enrichedExp && (
                <OptionsPanel
                  experience={enrichedExp}
                  bookingOptions={bookingOptions}
                  setBookingOptions={setBookingOptions}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStepId === 'group' && (
                <GroupPanel
                  bookingOptions={bookingOptions}
                  setBookingOptions={setBookingOptions}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStepId === 'invite' && enrichedExp && (
                <InvitePanel
                  bookingOptions={bookingOptions}
                  setBookingOptions={setBookingOptions}
                  contact={contact}
                  pricing={pricing}
                  experience={enrichedExp}
                  guests={guests}
                  onNext={goNext}
                  onBack={goBack}
                />
              )}
              {currentStepId === 'payment' && enrichedExp && (
                <PaymentPanel
                  experience={enrichedExp}
                  selectedSlot={selectedSlot}
                  guests={guests}
                  pricing={pricing}
                  contact={contact}
                  clientSecret={clientSecret}
                  paymentIntentId={paymentIntentId}
                  bookingOptions={bookingOptions}
                  onBack={goBack}
                  onSuccess={handleSuccess}
                  groupShareMode={isSharePaymentFlow}
                />
              )}
              {currentStepId === 'done' && enrichedExp && (
                <DonePanel
                  contact={contact}
                  bookingOptions={bookingOptions}
                  pricing={pricing}
                  experience={enrichedExp}
                  guests={guests}
                  bookingId={confirmedBookingId}
                />
              )}
            </div>

            {/* ── RIGHT: sticky summary + live group progress ── */}
            <div className="lg:sticky lg:top-6">
              {enrichedExp && (
                <SummaryPanel
                  experience={enrichedExp}
                  selectedSlot={selectedSlot}
                  guests={guests}
                  pricing={pricing}
                  bookingOptions={bookingOptions}
                  contact={contact}
                  confirmed={confirmed}
                  confirmedBookingId={confirmedBookingId}
                  groupShareMode={isSharePaymentFlow}
                />
              )}
            </div>
          </div>
        </Elements>
      </div>
    </div>
  )
}

export default CheckoutPage
