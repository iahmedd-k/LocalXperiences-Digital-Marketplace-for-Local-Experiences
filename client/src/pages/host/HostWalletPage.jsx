import useTranslation from '../../hooks/useTranslation.js';
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getAllHostBookings } from '../../services/bookingService.js'
import { formatDate, formatPrice } from '../../utils/formatters.js'
import Spinner from '../../components/common/Spinner.jsx'

const PLATFORM_FEE_RATE = 0.1
const EARNING_STATUSES = ['confirmed', 'completed', 'upcoming']

const getBookingAmount = (booking) => {
  if (typeof booking?.pricing?.totalAfterDiscount === 'number') return booking.pricing.totalAfterDiscount / 100
  if (typeof booking?.totalPrice === 'number') return booking.totalPrice
  return Number(booking?.experienceId?.price || 0) * Number(booking?.guestCount || 1)
}

const StatCard = ({ label, value, helper, tone = 'slate' }) => {
  const { t } = useTranslation();

  const tones = {
    slate: 'border-slate-200 bg-white text-slate-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  }

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  )
}

export default function HostWalletPage() {
  const { t } = useTranslation();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['hostBookings'],
    queryFn: () => getAllHostBookings(),
  })

  const payoutBookings = useMemo(
    () => bookings.filter((booking) => EARNING_STATUSES.includes(booking.status)),
    [bookings]
  )

  const grossEarnings = useMemo(
    () => payoutBookings.reduce((sum, booking) => sum + getBookingAmount(booking), 0),
    [payoutBookings]
  )

  const platformFee = grossEarnings * PLATFORM_FEE_RATE
  const hostNet = grossEarnings - platformFee
  const completedCount = payoutBookings.length

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700">Wallet</p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Host payouts overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              This page helps explain how host payouts will look once Stripe payouts are integrated. For now, it is an informational preview for booking earnings, platform fee, and host net amount.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Stripe payout automation is not active yet.
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center rounded-[24px] border border-slate-200 bg-white px-6 py-16 shadow-sm">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Full booking totals"
              value={formatPrice(grossEarnings)}
              helper={`${completedCount} confirmed/completed booking${completedCount === 1 ? '' : 's'} based on full booking value`}
              tone="slate"
            />
            <StatCard
              label="Platform fee"
              value={formatPrice(platformFee)}
              helper="10% marketplace cut"
              tone="amber"
            />
            <StatCard
              label="Host payout preview"
              value={formatPrice(hostNet)}
              helper="Estimated amount remaining for host"
              tone="emerald"
            />
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Payout breakdown</h2>
                <p className="text-sm text-slate-500">Bookings that count toward future host payouts</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Preview only
              </div>
            </div>

            {payoutBookings.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <p className="text-sm font-semibold text-slate-700">No payout bookings yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Confirmed bookings will appear here once guests start booking your experiences.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      <th className="px-5 py-3 font-semibold">{t("card_experience")}</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                      <th className="px-5 py-3 font-semibold">Guests</th>
                      <th className="px-5 py-3 font-semibold">Full total</th>
                      <th className="px-5 py-3 font-semibold">10% cut</th>
                      <th className="px-5 py-3 font-semibold">Host net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutBookings.map((booking) => {
                      const gross = getBookingAmount(booking)
                      const cut = gross * PLATFORM_FEE_RATE
                      const net = gross - cut

                      return (
                        <tr key={booking._id} className="border-t border-slate-100 text-sm text-slate-700">
                          <td className="px-5 py-4">
                            <div className="font-semibold text-slate-900">{booking.experienceId?.title || 'Experience'}</div>
                            <div className="mt-1 text-xs text-slate-500">{booking.status}</div>
                          </td>
                          <td className="px-5 py-4">{booking.slot?.date ? formatDate(booking.slot.date) : 'Date pending'}</td>
                          <td className="px-5 py-4">{booking.guestCount || 1}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">{formatPrice(gross)}</td>
                          <td className="px-5 py-4 text-amber-700">{formatPrice(cut)}</td>
                          <td className="px-5 py-4 font-semibold text-emerald-700">{formatPrice(net)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">How this will work later</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Traveler pays through the platform checkout.</li>
                <li>The platform keeps a 10% marketplace fee.</li>
                <li>The remaining amount becomes the host payout balance.</li>
                <li>After Stripe Connect or payout automation is integrated, this balance can be sent to the host bank account.</li>
              </ul>
            </div>

            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
              <h2 className="text-base font-semibold text-emerald-950">Payout processing</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-900/80">
                The platform fee across these payout bookings is currently {formatPrice(platformFee)}, based on a 10% fee applied to each experience booking. To support secure host payouts and complete payment handling, Stripe integration should be used for the next stage of payout processing.
              </p>
              <div className="mt-4">
                <Link
                  to="/host/bookings"
                  className="inline-flex rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-emerald-800"
                >
                  View bookings
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
