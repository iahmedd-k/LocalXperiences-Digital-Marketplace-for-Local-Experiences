import { formatPrice, formatDate, formatDuration } from '../../utils/formatters.js'
const BookingSummary = ({ experience, guests, slot }) => (
  <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
    <h3 className="font-clash font-bold text-gray-900 mb-3">Booking Summary</h3>
    <p className="font-semibold text-gray-800 mb-2">{experience?.title}</p>
    <div className="flex flex-col gap-1 text-sm text-gray-600">
      <div className="flex justify-between"><span>Duration</span><span>{formatDuration(experience?.duration)}</span></div>
      {slot?.date && <div className="flex justify-between"><span>Date</span><span>{formatDate(slot.date)}</span></div>}
      <div className="flex justify-between"><span>Guests</span><span>{guests}</span></div>
      <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
        <span>Total</span><span className="text-orange-500">{formatPrice((experience?.price || 0) * guests)}</span>
      </div>
    </div>
  </div>
)
export default BookingSummary