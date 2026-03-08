import { Link }        from 'react-router-dom'
import { formatPrice, formatDuration, getInitials } from '../../utils/formatters.js'
import { getAvatarColor } from '../../utils/helpers.js'
import StarRating      from '../common/StarRating.jsx'
import Badge           from '../common/Badge.jsx'

const ExperienceCard = ({ experience, aiReason }) => {
  const { _id, title, category, location, price, duration, rating, photos, hostId } = experience

  return (
    <Link to={`/experiences/${_id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
          {photos?.[0] ? (
            <img src={photos[0]} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {category === 'food' ? '🍕' : category === 'adventure' ? '🧗' : category === 'art' ? '🎨' :
               category === 'music' ? '🎵' : category === 'wellness' ? '🧘' : category === 'tour' ? '🗺️' :
               category === 'workshop' ? '🛠️' : category === 'culture' ? '🏛️' : '✨'}
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="gray" className="capitalize">{category}</Badge>
          </div>

          {/* Save button */}
          <button
            onClick={(e) => e.preventDefault()}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {/* Host */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: getAvatarColor(hostId?.name || '') }}
            >
              {getInitials(hostId?.name || '?')}
            </div>
            <span className="text-xs text-gray-500 font-medium">Hosted by {hostId?.name || 'Local Host'}</span>
          </div>

          {/* Title */}
          <h3 className="font-clash font-semibold text-gray-900 text-sm leading-snug line-clamp-2 mb-2">{title}</h3>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {formatDuration(duration)}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {location?.city}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <StarRating rating={rating?.average || 0} count={rating?.count} />
            <div className="text-right">
              <span className="font-clash font-bold text-orange-500">{formatPrice(price)}</span>
              <span className="text-xs text-gray-400"> / person</span>
            </div>
          </div>

          {/* AI reason tag */}
          {aiReason && (
            <div className="mt-3 flex items-start gap-1.5 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
              <span className="text-purple-500 text-xs mt-0.5">✨</span>
              <span className="text-xs text-purple-700 leading-relaxed">{aiReason}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ExperienceCard