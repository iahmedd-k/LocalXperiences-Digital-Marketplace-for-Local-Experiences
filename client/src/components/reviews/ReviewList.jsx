import { useQuery }   from '@tanstack/react-query'
import { getReviews } from '../../services/reviewService.js'
import ReviewCard     from './ReviewCard.jsx'
import Spinner        from '../common/Spinner.jsx'
import StarRating     from '../common/StarRating.jsx'

const ReviewList = ({ experienceId, rating }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', experienceId],
    queryFn:  () => getReviews(experienceId).then((r) => r.data.data),
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="font-clash text-xl font-bold text-gray-900">Reviews</h3>
        {rating?.count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={rating.average} size="sm" />
            <span className="text-sm font-semibold text-gray-700">{rating.average} · {rating.count} reviews</span>
          </div>
        )}
      </div>

      {isLoading ? <Spinner className="py-8" /> : (
        <div className="flex flex-col gap-4">
          {data?.length ? data.map((r) => <ReviewCard key={r._id} review={r} />) : (
            <p className="text-gray-400 text-sm py-4">No reviews yet — be the first!</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ReviewList