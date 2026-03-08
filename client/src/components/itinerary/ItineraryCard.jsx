import { Link }   from 'react-router-dom'
import { formatDate } from '../../utils/formatters.js'

const ItineraryCard = ({ itinerary, onDelete }) => {
  // Backend returns `experienceIds` (populated); older code expected `experiences`
  const experiences = itinerary.experiences || itinerary.experienceIds || []
  const count       = experiences.length

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <Link to={`/itineraries/${itinerary._id}`} className="font-clash font-bold text-gray-900 hover:text-orange-500 transition text-lg">
            {itinerary.title}
          </Link>
          {itinerary.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{itinerary.description}</p>}
        </div>
        {itinerary.isPublic && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Shared</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span>📍 {count} experience{count !== 1 ? 's' : ''}</span>
        <span>📅 {formatDate(itinerary.createdAt)}</span>
      </div>

      {/* Experience thumbnails */}
      {count > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {experiences.slice(0, 5).map((exp, i) => (
            <div key={i} className="w-14 h-14 rounded-xl bg-orange-100 flex-shrink-0 overflow-hidden flex items-center justify-center text-xl">
              {exp.photos?.[0] ? <img src={exp.photos[0]} alt="" className="w-full h-full object-cover"/> : '🌍'}
            </div>
          ))}
          {count > 5 && (
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
              +{count - 5}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Link to={`/itineraries/${itinerary._id}`} className="text-sm font-semibold text-orange-500 hover:underline">View →</Link>
        <span className="text-gray-200">|</span>
        <button onClick={() => onDelete?.(itinerary._id)} className="text-sm text-red-400 hover:underline font-medium">Delete</button>
      </div>
    </div>
  )
}

export default ItineraryCard