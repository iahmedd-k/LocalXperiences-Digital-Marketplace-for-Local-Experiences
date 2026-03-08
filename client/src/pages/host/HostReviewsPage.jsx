import { useState }        from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link }            from 'react-router-dom'
import toast               from 'react-hot-toast'
import { getHostReviews, replyToReview } from '../../services/reviewService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import Navbar              from '../../components/common/Navbar.jsx'
import Footer              from '../../components/common/Footer.jsx'
import Spinner             from '../../components/common/Spinner.jsx'
import EmptyState          from '../../components/common/EmptyState.jsx'
import Avatar              from '../../components/common/Avatar.jsx'
import StarRating          from '../../components/common/StarRating.jsx'
import Button              from '../../components/common/Button.jsx'
import { formatDate }      from '../../utils/formatters.js'

const HostReviewsPage = () => {
  const queryClient = useQueryClient()
  const [replyOpen,  setReplyOpen]  = useState(null)  // review _id
  const [replyText,  setReplyText]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter,     setFilter]     = useState('all')

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['hostReviews'],
    queryFn:  () => getHostReviews().then((r) => r.data.data),
  })

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const ratingCounts = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:   reviews.length ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100) : 0,
  }))

  const filtered = reviews.filter((r) => {
    if (filter === 'all')       return true
    if (filter === 'replied')   return r.hostReply?.text
    if (filter === 'unreplied') return !r.hostReply?.text
    return r.rating === Number(filter)
  })

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) return toast.error('Please write a reply')
    try {
      setSubmitting(true)
      await replyToReview(reviewId, { reply: replyText })
      toast.success('Reply posted!')
      queryClient.invalidateQueries({ queryKey: ['hostReviews'] })
      setReplyOpen(null)
      setReplyText('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="mb-6">
          <Link to="/host/dashboard" className="text-sm text-orange-500 hover:underline">← Dashboard</Link>
          <h1 className="font-clash text-3xl font-bold text-gray-900 mt-1">Reviews</h1>
        </div>

        {isLoading ? <Spinner size="lg" className="py-16"/> : reviews.length === 0 ? (
          <EmptyState icon="⭐" title="No reviews yet" description="Reviews from guests will appear here after their experience." />
        ) : (
          <>
            {/* Rating summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="text-center">
                <p className="font-clash text-6xl font-bold text-gray-900">{avgRating}</p>
                <StarRating rating={Number(avgRating)} size="md" />
                <p className="text-sm text-gray-400 mt-1">{reviews.length} reviews</p>
              </div>
              <div className="flex-1 flex flex-col gap-2 w-full">
                {ratingCounts.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-3">{star}</span>
                    <svg className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-orange-400 h-2 rounded-full transition-all" style={{ width: `${pct}%` }}/>
                    </div>
                    <span className="text-xs text-gray-400 w-6">{count}</span>
                  </div>
                ))}
              </div>
              {/* Stats */}
              <div className="flex flex-col gap-3 text-center sm:border-l sm:border-gray-100 sm:pl-6">
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    {reviews.filter((r) => r.hostReply?.text).length}
                  </p>
                  <p className="text-xs text-gray-400">Replied</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {reviews.filter((r) => !r.hostReply?.text).length}
                  </p>
                  <p className="text-xs text-gray-400">Awaiting reply</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-5">
              {[
                { value: 'all',       label: `All (${reviews.length})` },
                { value: 'unreplied', label: `Unreplied (${reviews.filter(r => !r.hostReply?.text).length})` },
                { value: 'replied',   label: `Replied (${reviews.filter(r => r.hostReply?.text).length})` },
                { value: '5', label: '⭐⭐⭐⭐⭐' },
                { value: '4', label: '⭐⭐⭐⭐' },
                { value: '3', label: '⭐⭐⭐' },
              ].map((f) => (
                <button key={f.value} onClick={() => setFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition
                    ${filter === f.value ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Review cards */}
            <div className="flex flex-col gap-4">
              {filtered.map((review) => (
                <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-5">
                  {/* Reviewer + experience */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={review.userId?.name} src={review.userId?.profilePic} size="md" />
                      <div>
                        <p className="font-semibold text-gray-900">{review.userId?.name}</p>
                        <p className="text-xs text-gray-400">{review.experienceId?.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    {!review.hostReply?.text && (
                      <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">Needs reply</span>
                    )}
                  </div>

                  {/* Review text */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                  {/* Host reply */}
                  {review.hostReply?.text ? (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-orange-600 mb-1">Your Response</p>
                      <p className="text-sm text-gray-700">{review.hostReply.text}</p>
                      <button
                        onClick={() => { setReplyOpen(review._id); setReplyText(review.hostReply.text) }}
                        className="text-xs text-orange-500 hover:underline mt-2 font-medium"
                      >
                        Edit reply
                      </button>
                    </div>
                  ) : replyOpen === review._id ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank the guest and share any additional info..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" loading={submitting} onClick={() => handleReply(review._id)}>Post Reply</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setReplyOpen(null); setReplyText('') }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setReplyOpen(review._id); setReplyText('') }}
                      className="text-sm font-semibold text-orange-500 hover:underline"
                    >
                      + Reply to this review
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default HostReviewsPage