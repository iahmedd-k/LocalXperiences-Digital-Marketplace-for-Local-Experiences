import { useState }   from 'react'
import { useSelector } from 'react-redux'
import toast          from 'react-hot-toast'
import { createReview } from '../../services/reviewService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import StarRating     from '../common/StarRating.jsx'
import Button         from '../common/Button.jsx'

const ReviewForm = ({ bookingId, experienceId, onSuccess }) => {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthenticated) return null

  const handleSubmit = async () => {
    if (!rating)  return toast.error('Please select a rating')
    if (!comment) return toast.error('Please write a comment')
    try {
      setLoading(true)
      console.log('Submitting review for bookingId:', bookingId)
      await createReview({ bookingId, rating, comment })
      toast.success('Review submitted!')
      onSuccess?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
      <h4 className="font-bold text-gray-900 mb-3">Leave a Review</h4>
      <div className="mb-3">
        <StarRating rating={rating} size="lg" interactive onRate={setRating} />
      </div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none mb-3"
      />
      <Button onClick={handleSubmit} loading={loading} size="sm">Submit Review</Button>
    </div>
  )
}

export default ReviewForm