import { Link }        from 'react-router-dom'
import { formatDate, formatPrice } from '../../utils/formatters.js'
import { BOOKING_STATUS_COLORS }   from '../../config/constants.js'
import Badge           from '../common/Badge.jsx'

const statusVariant = { pending:'yellow', confirmed:'green', cancelled:'red', completed:'blue' }

const BookingCard = ({ booking, onCancel }) => {
  const exp    = booking.experienceId
  const guests = booking.guestCount ?? booking.guests ?? 0
  // amount is stored in cents in backend; fall back to legacy totalPrice
  const totalCents = typeof booking.amount === 'number'
    ? booking.amount
    : typeof booking.totalPrice === 'number'
      ? Math.round(booking.totalPrice * 100)
      : 0

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-4">
      {/* Thumbnail */}
      <div className="w-full sm:w-28 h-28 bg-orange-100 rounded-xl flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
        {exp?.photos?.[0]
          ? <img src={exp.photos[0]} alt={exp.title} className="w-full h-full object-cover rounded-xl"/>
          : '🌍'}
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/experiences/${exp?._id}`} className="font-clash font-bold text-gray-900 hover:text-orange-500 transition leading-snug">
              {exp?.title}
            </Link>
            <Badge variant={statusVariant[booking.status] || 'gray'} className="capitalize flex-shrink-0">
              {booking.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{exp?.location?.city}</p>
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {booking.slot?.date && <span>📅 {formatDate(booking.slot.date)}</span>}
            <span>👥 {guests} guest{guests > 1 ? 's' : ''}</span>
            <span className="font-semibold text-orange-500">
              {formatPrice(totalCents / 100)}
            </span>
          </div>
        </div>

        {booking.status === 'confirmed' && (
          <div className="mt-3">
            <button onClick={() => onCancel?.(booking._id)} className="text-sm text-red-500 hover:underline font-medium">
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingCard