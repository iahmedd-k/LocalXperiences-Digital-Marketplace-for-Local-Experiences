import Avatar     from '../common/Avatar.jsx'
import StarRating from '../common/StarRating.jsx'
import { formatDate } from '../../utils/formatters.js'

const ReviewCard = ({ review }) => (
  <div className="border border-gray-100 rounded-2xl p-5">
    <div className="flex items-start gap-3 mb-3">
      <Avatar name={review.userId?.name} src={review.userId?.profilePic} size="md" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{review.userId?.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

    {/* Host reply */}
    {review.hostReply?.text && (
      <div className="mt-4 ml-4 pl-4 border-l-2 border-orange-200 bg-orange-50 rounded-r-xl p-3">
        <p className="text-xs font-bold text-orange-600 mb-1">Response from host</p>
        <p className="text-sm text-gray-700">{review.hostReply.text}</p>
      </div>
    )}
  </div>
)

export default ReviewCard