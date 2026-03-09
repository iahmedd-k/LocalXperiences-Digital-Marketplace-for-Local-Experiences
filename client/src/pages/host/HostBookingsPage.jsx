import { useState }      from 'react'
import { useQuery }      from '@tanstack/react-query'
import { Link }          from 'react-router-dom'
import { getHostBookings } from '../../services/bookingService.js'
import Navbar            from '../../components/common/Navbar.jsx'
import Footer            from '../../components/common/Footer.jsx'
import Spinner           from '../../components/common/Spinner.jsx'
import EmptyState        from '../../components/common/EmptyState.jsx'
import Badge             from '../../components/common/Badge.jsx'
import Avatar            from '../../components/common/Avatar.jsx'
import { formatDate, formatPrice } from '../../utils/formatters.js'

const statusVariant = { pending:'yellow', confirmed:'green', cancelled:'red', completed:'blue' }

const HostBookingsPage = () => {
  const [tab,    setTab]    = useState('all')
  const [search, setSearch] = useState('')

  const { data: res, isLoading } = useQuery({
    queryKey: ['hostBookings'],
    queryFn:  () => getHostBookings().then((r) => r.data),
  })

  const bookings = res?.data || []

  const getBookingTotal = (b) =>
    typeof b.amount === 'number'
      ? b.amount / 100
      : typeof b.totalPrice === 'number'
        ? b.totalPrice
        : 0

  const filtered = bookings
    .filter((b) => tab === 'all' || b.status === tab)
    .filter((b) => !search || b.userId?.name?.toLowerCase().includes(search.toLowerCase()) || b.experienceId?.title?.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    all:       bookings.length,
    pending:   bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/host/dashboard" className="text-sm text-orange-500 hover:underline">← Dashboard</Link>
            <h1 className="font-clash text-3xl font-bold text-gray-900 mt-1">Bookings</h1>
          </div>
          {counts.pending > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm text-yellow-700 font-semibold">
              ⏳ {counts.pending} pending
            </div>
          )}
        </div>

        {/* Search + tabs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest or experience..."
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
          />
          <div className="flex gap-2 flex-wrap">
            {Object.entries(counts).map(([status, count]) => (
              <button key={status} onClick={() => setTab(status)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition
                  ${tab === status ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {status} ({count})
              </button>
            ))}
          </div>
        </div>

        {isLoading ? <Spinner size="lg" className="py-16"/> : filtered.length === 0 ? (
          <EmptyState icon="📅" title="No bookings found" description="Bookings from travelers will appear here." />
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Guest & Experience</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Guests</div>
              <div className="col-span-2">Total</div>
              <div className="col-span-2">Status</div>
            </div>

            {/* Rows */}
            {filtered.map((b) => (
              <div key={b._id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition items-center">
                {/* Guest + experience */}
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <Avatar name={b.userId?.name} src={b.userId?.profilePic} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{b.userId?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{b.experienceId?.title}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="col-span-2 text-sm text-gray-600">
                  {b.slot?.date ? formatDate(b.slot.date) : '—'}
                </div>

                {/* Guests */}
                <div className="col-span-2 text-sm text-gray-600">{(b.guestCount ?? b.guests) || 0} guest{((b.guestCount ?? b.guests) || 0) > 1 ? 's' : ''}</div>

                {/* Total */}
                <div className="col-span-2 text-sm font-bold text-orange-500">{formatPrice(getBookingTotal(b))}</div>

                {/* Status */}
                <div className="col-span-2">
                  <Badge variant={statusVariant[b.status] || 'gray'} className="capitalize">{b.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary row */}
        {!isLoading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filtered.length} of {bookings.length} bookings</span>
            <span className="font-semibold text-gray-700">
              Total revenue: {formatPrice(
                filtered
                  .filter((b) => b.status === 'confirmed' || b.status === 'completed')
                  .reduce((s, b) => s + getBookingTotal(b), 0)
              )}
            </span>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default HostBookingsPage