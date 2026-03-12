import { useState }       from 'react'
import { Link }           from 'react-router-dom'
import { useSelector }    from 'react-redux'
import toast              from 'react-hot-toast'
import { formatPrice }    from '../../utils/formatters.js'
import StarRating         from '../common/StarRating.jsx'
import AvailabilityPicker from './AvailabilityPicker.jsx'
import Button             from '../common/Button.jsx'
import AddToItinerary     from '../itinerary/AddToItinerary.jsx'

const PriceBox = ({ experience, alreadyBooked = false }) => {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [guests,   setGuests]   = useState(1)
  const [selected, setSelected] = useState(null)

  const total = experience.price * guests

  return (
    <div className="sticky top-24 bg-white border border-[#E8F5EE] rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,40,20,0.06)]">
      {/* Price */}
      <div className="flex items-end justify-between mb-1" style={{ fontFamily: "'Poppins',sans-serif" }}>
        <div>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "2.2rem", color: "#0f2d1a", lineHeight: 1 }}>{formatPrice(experience.price)}</span>
          <span className="text-gray-400 text-sm ml-1 mt-1 inline-block">/ person</span>
        </div>
        <StarRating rating={experience.rating?.average} count={experience.rating?.count} />
      </div>

      <div className="border-t border-gray-100 my-4"/>

      {/* Availability picker */}
      <AvailabilityPicker
        availability={experience.availability}
        selected={selected}
        onSelect={setSelected}
      />

      <div className="border-t border-gray-100 my-4"/>

      {/* Guests */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-gray-700">Guests</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">−</button>
          <span className="font-bold text-gray-900 w-4 text-center">{guests}</span>
          <button onClick={() => setGuests(Math.min(experience.groupSize?.max || 10, guests + 1))}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">+</button>
        </div>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between mb-4 bg-[#f0faf5] rounded-xl p-3" style={{ fontFamily: "'Poppins',sans-serif" }}>
        <span className="text-sm font-semibold text-[#0f2d1a]">Total</span>
        <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.4rem", color: "#00AA6C" }}>{formatPrice(total)}</span>
      </div>

      {/* Save to itinerary (only when logged in; component handles auth) */}
      <div className="mb-3">
        <AddToItinerary experienceId={experience._id} />
      </div>

      {/* Book button */}
      {isAuthenticated ? (
        alreadyBooked ? (
          <button
            type="button"
            onClick={() => toast.error('You already booked this experience.')}
            className="block w-full"
          >
            <Button fullWidth size="lg" variant="secondary" disabled>
              Already Booked
            </Button>
          </button>
        ) : (
          <Link
            to={`/checkout/${experience._id}?slot=${selected?._id || ''}&guests=${guests}`}
            className={`block ${!selected ? 'pointer-events-none opacity-50' : ''}`}
          >
            <Button fullWidth size="lg">
              {selected ? 'Reserve Now' : 'Select a Date First'}
            </Button>
          </Link>
        )
      ) : (
        <Link to="/login">
          <Button fullWidth size="lg">Sign In to Book</Button>
        </Link>
      )}

      <p className="text-center text-xs text-gray-400 mt-3">No charge until confirmation</p>
    </div>
  )
}

export default PriceBox