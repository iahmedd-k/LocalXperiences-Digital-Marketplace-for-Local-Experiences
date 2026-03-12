import { useParams, Link } from 'react-router-dom'
import { useQuery }        from '@tanstack/react-query'
import { getBookingById }  from '../../services/bookingService.js'
import Navbar              from '../../components/common/Navbar.jsx'
import Spinner             from '../../components/common/Spinner.jsx'
import Button              from '../../components/common/Button.jsx'
import { formatDate, formatPrice } from '../../utils/formatters.js'

const BookingConfirmPage = () => {
  const { id } = useParams()
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn:  () => getBookingById(id).then((r) => r.data.data),
  })

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1"/></div>

  return (
    <div className="min-h-screen flex flex-col bg-[#f0faf5]">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-[#E8F8F2] rounded-full flex items-center justify-center text-4xl mx-auto mb-5">🎉</div>
          <h1 className="font-clash text-3xl font-bold text-gray-900 mb-2">You're Confirmed!</h1>
          <p className="text-gray-500 mb-7">Your booking is confirmed. Check your email for details.</p>

          {booking && (
            <div className="bg-[#f8fdf9] border border-[#E8F5EE] rounded-2xl p-5 text-left mb-7">
              <h3 className="font-bold text-gray-900 mb-3">{booking.experienceId?.title}</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-semibold">
                    {booking.slot?.date ? formatDate(booking.slot.date) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Guests</span>
                  <span className="font-semibold">
                    {booking.guestCount ?? booking.guests}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid</span>
                  <span className="font-bold text-[#00AA6C]">
                    {formatPrice(
                      typeof booking.amount === 'number'
                        ? booking.amount / 100
                        : booking.totalPrice ?? 0
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-semibold capitalize text-[#00AA6C]">
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link to="/my-bookings"><Button fullWidth>View My Bookings</Button></Link>
            <Link to="/search"><Button fullWidth variant="secondary">Explore More Experiences</Button></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingConfirmPage