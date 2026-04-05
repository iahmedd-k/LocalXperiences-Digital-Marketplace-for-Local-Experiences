import useTranslation from '../../hooks/useTranslation.js';
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  cancelHostBooking,
  completeHostBooking,
  getAllHostBookings,
  overrideBookingStatus
} from '../../services/bookingService.js'
import toast from 'react-hot-toast'

import Spinner from '../../components/common/Spinner.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import Badge from '../../components/common/Badge.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import Button from '../../components/common/Button.jsx'

import { formatDate, formatPrice } from '../../utils/formatters.js'

const statusVariant = {
  pending: 'yellow',
  pending_payment: 'yellow',
  partially_paid: 'yellow',
  confirmed: 'green',
  upcoming: 'green',
  cancelled: 'red',
  completed: 'blue'
}

const STATUS_TABS = ['all', 'upcoming', 'confirmed', 'pending_payment', 'partially_paid', 'completed', 'cancelled']

const HostBookingsPage = () => {
  const { t } = useTranslation();

  const queryClient = useQueryClient()

  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [actionState, setActionState] = useState({ id: null, type: null })

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: getAllHostBookings
  })

  const getBookingTotal = (b) => {
    if (typeof b?.pricing?.totalAfterDiscount === 'number') return b.pricing.totalAfterDiscount / 100
    if (typeof b?.totalPrice === 'number') return b.totalPrice
    return Number(b?.experienceId?.price || 0) * Number(b?.guestCount || 1)
  }

  const normalizedSearch = search.trim().toLowerCase()

  const counts = useMemo(() => ({
    all: bookings.length,
    upcoming: bookings.filter(b => b.status === 'upcoming').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending_payment: bookings.filter(b => b.status === 'pending_payment').length,
    partially_paid: bookings.filter(b => b.status === 'partially_paid').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }), [bookings])

  const filtered = useMemo(() => {
    return bookings
      .filter(b => tab === 'all' || b.status === tab)
      .filter(b => {
        if (!normalizedSearch) return true
        const guest = b.userId?.name?.toLowerCase() || ''
        const exp = b.experienceId?.title?.toLowerCase() || ''
        return guest.includes(normalizedSearch) || exp.includes(normalizedSearch)
      })
  }, [bookings, tab, normalizedSearch])

  const refreshBookings = async () => {
    await queryClient.invalidateQueries({ queryKey: ['hostBookings'] })
    await queryClient.invalidateQueries({ queryKey: ['myBookings'] })
  }

  const completeMutation = useMutation({
    mutationFn: completeHostBooking,
    onSuccess: async () => {
      toast.success('Booking completed')
      await refreshBookings()
    },
    onError: () => toast.error('Failed to complete'),
    onSettled: () => setActionState({ id: null, type: null })
  })

  const cancelMutation = useMutation({
    mutationFn: cancelHostBooking,
    onSuccess: async () => {
      toast.success('Booking cancelled')
      await refreshBookings()
    },
    onError: () => toast.error('Failed to cancel'),
    onSettled: () => setActionState({ id: null, type: null })
  })

  const overrideMutation = useMutation({
    mutationFn: ({ id, status }) => overrideBookingStatus(id, status),
    onSuccess: async () => {
      toast.success('Status updated')
      await refreshBookings()
    },
    onError: () => toast.error('Update failed'),
    onSettled: () => setActionState({ id: null, type: null })
  })

  const handleAction = (id, type, fn) => {
    setActionState({ id, type })
    fn()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <Link to="/host/dashboard" className="text-xs text-emerald-600">
              ← Dashboard
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 mt-1">{t("dashboard_bookings")}</h1>
          </div>

          {(counts.pending_payment > 0 || counts.partially_paid > 0) && (
            <div className="text-xs sm:text-sm bg-amber-50 px-3 py-1.5 rounded-full text-amber-700 font-semibold">
              {counts.pending_payment + counts.partially_paid} waiting for payment
            </div>
          )}
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guests or experiences..."
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-200"
          />

          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map(s => (
              <button
                key={s}
                onClick={() => setTab(s)}
                className={`text-xs px-3 py-2 rounded-full capitalize font-semibold transition ${
                  tab === s
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s} ({counts[s]})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <Spinner className="py-10" />
        ) : filtered.length === 0 ? (
          <EmptyState title="No bookings" />
        ) : (
          <div className="space-y-3">
            {filtered.map(b => {
              const isBusy = actionState.id === b._id
              const guests = b.guestCount ?? b.guests ?? 0
              const groupMembers = Array.isArray(b.splitPayments) ? b.splitPayments : []
              const allPaid = groupMembers.length > 0 && groupMembers.every(member => member.status === 'paid')
              const canComplete = ['confirmed', 'upcoming'].includes(b.status) || (groupMembers.length > 0 && allPaid)
              const amountLabel = b.pricing?.splitPayment
                ? 'Full booking total'
                : groupMembers.length > 0
                  ? 'Full booking total'
                  : 'Booking total'

              return (
                <div key={b._id} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

                  <div className="flex gap-3">
                    <Avatar name={b.userId?.name} size="sm" />

                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {b.userId?.name || 'Guest'}
                        </p>
                        <Badge variant={statusVariant[b.status]}>
                          {String(b.status).replace(/_/g, ' ')}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 truncate">
                        {b.experienceId?.title}
                      </p>

                      <div className="text-xs text-slate-500 mt-2 space-y-1">
                        <p>Date: {b.slot?.date ? formatDate(b.slot.date) : '—'}</p>
                        <p>Guests: {guests}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{amountLabel}</p>
                        <p className="text-emerald-600 font-semibold">
                          {formatPrice(getBookingTotal(b))}
                        </p>
                        {b.collaboration?.groupCode && (
                          <p className="text-violet-600 font-semibold">Group: {b.collaboration.groupCode}</p>
                        )}
                        {groupMembers.length > 0 && (
                          <div className="pt-1 space-y-1">
                            <p className="text-[11px] font-semibold text-slate-600">
                              {groupMembers.filter(member => member.status === 'paid').length}/{groupMembers.length} paid
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {groupMembers.map(member => (
                                <span key={member.email} className={`rounded-full px-2 py-1 text-[10px] font-medium ${member.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                  {member.email} · {member.status === 'paid' ? 'Paid' : 'Pending'}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          size="sm"
                          disabled={isBusy || !canComplete}
                          onClick={() =>
                            handleAction(b._id, 'complete', () =>
                              completeMutation.mutate(b._id)
                            )
                          }
                        >
                          Done
                        </Button>
                        {groupMembers.length > 0 && !allPaid && (
                          <span className="self-center text-[11px] text-amber-600">
                            Wait until all group members have paid
                          </span>
                        )}

                        <Button
                          size="sm"
                          variant="danger"
                          disabled={isBusy}
                          onClick={() =>
                            handleAction(b._id, 'cancel', () =>
                              cancelMutation.mutate(b._id)
                            )
                          }
                        >
                          Cancel
                        </Button>

                        <select
                          className="text-xs rounded-full bg-slate-100 px-3 py-2 text-slate-700 outline-none transition hover:bg-slate-200"
                          onChange={(e) =>
                            overrideMutation.mutate({
                              id: b._id,
                              status: e.target.value
                            })
                          }
                          defaultValue=""
                        >
                          <option value="" disabled>Set</option>
                          <option value="confirmed">{t("checkout_confirmed")}</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer Summary */}
        {!isLoading && filtered.length > 0 && (
          <div className="mt-4 text-xs sm:text-sm flex justify-between text-gray-600">
            <span>{filtered.length} bookings</span>
            <span className="font-semibold">
              {formatPrice(
                filtered
                  .filter(b => ['confirmed', 'completed'].includes(b.status))
                  .reduce((s, b) => s + getBookingTotal(b), 0)
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default HostBookingsPage
