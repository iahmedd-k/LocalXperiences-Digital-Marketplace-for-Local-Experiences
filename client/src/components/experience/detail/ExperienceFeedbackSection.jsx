import useTranslation from '../../../hooks/useTranslation.js';
import { ChevronDown, CircleHelp, Filter, Search, ThumbsUp, X } from 'lucide-react'
import Avatar from '../../common/Avatar.jsx'
import Button from '../../common/Button.jsx'

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'all', 'also', 'amazing', 'and', 'around', 'been', 'because', 'before', 'being',
  'best', 'booked', 'could', 'crew', 'during', 'even', 'from', 'great', 'guide', 'have', 'here', 'into', 'just',
  'like', 'lots', 'made', 'more', 'much', 'nice', 'only', 'other', 'our', 'really', 'super', 'that', 'their',
  'them', 'there', 'they', 'this', 'tour', 'trip', 'very', 'was', 'were', 'what', 'with', 'would', 'your',
])

const getPopularMentions = (reviews) => {
  const counts = new Map()

  reviews.forEach((review) => {
    const words = String(review.comment || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word))

    words.forEach((word) => {
      counts.set(word, (counts.get(word) || 0) + 1)
    })
  })

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([word]) => word)
}

const tabClassName = (isActive) => (
  isActive
    ? 'border-b-2 border-slate-900 px-0 pb-4 text-[15px] font-semibold text-slate-900'
    : 'px-0 pb-4 text-[15px] font-semibold text-slate-700 transition hover:text-slate-900'
)

const filterPillClassName = 'appearance-none rounded-full border border-slate-400 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500'

export default function ExperienceFeedbackSection({
  guestFeedbackTab,
  setGuestFeedbackTab,
  reviews,
  rating,
  ratingCount,
  reviewDistribution,
  reviewLanguageFilter,
  setReviewLanguageFilter,
  reviewRatingFilter,
  setReviewRatingFilter,
  reviewMonthFilter,
  reviewVisitTypeFilter,
  reviewSort,
  setReviewSort,
  showHostRepliesOnly,
  setShowHostRepliesOnly,
  showReviewFilters,
  setShowReviewFilters,
  draftReviewRatingFilter,
  setDraftReviewRatingFilter,
  draftReviewMonthFilter,
  setDraftReviewMonthFilter,
  draftReviewVisitTypeFilter,
  setDraftReviewVisitTypeFilter,
  draftShowHostRepliesOnly,
  setDraftShowHostRepliesOnly,
  appliedReviewFilterCount,
  reviewSearch,
  setReviewSearch,
  visibleReviews,
  likedReviews,
  onToggleReviewLike,
  renderStars,
  formatDate,
  isAuthenticated,
  reviewCallout,
  canReview,
  showReviewComposer,
  setShowReviewComposer,
  reviewText,
  setReviewText,
  reviewRating,
  setReviewRating,
  hoverRating,
  setHoverRating,
  reviewPhotoFiles,
  reviewPhotoPreviews,
  onReviewPhotoChange,
  onOpenReviewComposer,
  reviewMutation,
  onSubmitReview,
  questions,
  question,
  setQuestion,
  questionMutation,
  onSubmitQuestion,
  answerMutation,
  answerDrafts,
  setAnswerDrafts,
  openReplyComposer,
  setOpenReplyComposer,
  onSubmitAnswer,
  sendToLogin,
  requireAuth,
  onOpenReviewFilters,
  onApplyReviewFilters,
  onResetReviewFilters,
}) {
  const { t } = useTranslation();
  const popularMentions = getPopularMentions(reviews)
  const ratingFilterOptions = reviewDistribution
    .filter((item) => item.stars >= 1)
    .sort((a, b) => a.stars - b.stars)
  const monthOptions = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const visitTypeOptions = ['Business', 'Couples', 'Family', 'Friends', 'Solo']
  const selectedReviewCountLabel = appliedReviewFilterCount > 0 ? ` (${appliedReviewFilterCount})` : ''
  const getLikeMeta = (reviewId) => likedReviews?.[reviewId] || { liked: false, count: 0 }

  return (
    <section id="reviews" className="scroll-mt-36 px-1 pt-2 sm:px-2 lg:px-0">
      <div className="mb-10">
        <p className="text-sm font-semibold text-slate-900">{t("feedback_contribute")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onOpenReviewComposer(false)}
            className="rounded-full border border-emerald-900 px-4 py-2.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-50"
          >{t("feedback_write_review")}</button>
          <button
            type="button"
            onClick={() => onOpenReviewComposer(true)}
            className="rounded-full border border-emerald-900 px-4 py-2.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-50"
          >{t("feedback_upload_photo")}</button>
        </div>
      </div>

      <div className="mb-10 border-b border-slate-200">
        <div className="flex items-center gap-9">
        <button type="button" onClick={() => setGuestFeedbackTab('reviews')} className={tabClassName(guestFeedbackTab === 'reviews')}>{t("dashboard_reviews")}</button>
        <button type="button" onClick={() => setGuestFeedbackTab('qna')} className={tabClassName(guestFeedbackTab === 'qna')}>
          Q&amp;A
        </button>
        </div>
      </div>

      {guestFeedbackTab === 'reviews' ? (
        <>
          {reviews.length ? (
            <div className="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
                  <span className="text-emerald-700">{renderStars(rating || 5)}</span>
                  <span className="font-normal text-slate-600">({ratingCount.toLocaleString()})</span>
                </div>

                {reviewDistribution.map((item) => (
                  <div key={item.stars} className="grid grid-cols-[68px_minmax(0,1fr)_44px] items-center gap-3 text-[13px] text-slate-700">
                    <span>{item.label}</span>
                    <span className="h-2.5 rounded-full bg-slate-200">
                      <span className="block h-2.5 rounded-full bg-emerald-700" style={{ width: item.width }} />
                    </span>
                    <span className="text-right text-[12px] text-slate-500">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-md bg-[#27d84d] px-3.5 py-2 text-[19px] font-black leading-none text-slate-950">
                          {rating > 0 ? rating.toFixed(1) : 'New'}
                        </span>
                        <span className="inline-flex items-center gap-2 text-[15px] text-slate-800">
                          <span className="text-emerald-700">{renderStars(rating || 5)}</span>
                          <span>({ratingCount.toLocaleString()})</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 xl:justify-end">
                      <button
                        type="button"
                        onClick={onOpenReviewFilters}
                        className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
                          appliedReviewFilterCount > 0 ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-400 text-slate-700'
                        }`}
                      >
                        <Filter className="h-4 w-4" />
                        Filters{selectedReviewCountLabel}
                      </button>

                      <div className="relative">
                        <select
                          value={reviewLanguageFilter}
                          onChange={(event) => setReviewLanguageFilter(event.target.value)}
                          className={`${filterPillClassName} h-11 min-w-[114px]`}
                        >
                          <option value="english">English</option>
                          <option value="all">All languages</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>

                      <div className="relative">
                        <select
                          value={reviewSort}
                          onChange={(event) => setReviewSort(event.target.value)}
                          className={`${filterPillClassName} h-11 min-w-[160px]`}
                        >
                          <option value="insightful">Most insightful</option>
                          <option value="newest">Newest</option>
                          <option value="highest">Highest rated</option>
                          <option value="lowest">Lowest rated</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      </div>

                      <CircleHelp className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <p className="max-w-2xl text-[13px] leading-6 text-slate-500">
                      Reviews and management responses are the subjective opinions of guests and do not represent the platform.
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={reviewSearch}
                      onChange={(event) => setReviewSearch(event.target.value)}
                      placeholder="Search reviews..."
                      className="w-full rounded-full border border-slate-400 bg-white py-3 pl-14 pr-5 text-[15px] text-slate-700 outline-none transition focus:border-emerald-500"
                    />
                  </div>

                  {popularMentions.length ? (
                    <div>
                      <p className="mb-3 text-[15px] font-semibold text-slate-900">Popular mentions</p>
                      <div className="flex flex-wrap gap-2.5">
                        {popularMentions.map((mention) => (
                          <button
                            key={mention}
                            type="button"
                            onClick={() => setReviewSearch(mention)}
                            className="rounded-full border border-slate-400 px-4 py-2 text-sm leading-none text-slate-700 transition hover:border-emerald-500 hover:text-emerald-800"
                          >
                            {mention}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {!reviews.length ? null : (
                  <div className="hidden border-t border-slate-200 pt-7 lg:block">
                    <p className="text-sm text-slate-500">
                      {isAuthenticated ? 'Signed in users can post reviews and replies.' : 'Sign in to post a review or reply.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          <div className="mt-8 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
            <div className="hidden lg:block" />

            {visibleReviews.length ? (
              <div className="border-t border-slate-200 pt-7">
              <div className="space-y-8">
                {visibleReviews.map((review) => (
                  <article key={review._id} className="border-b border-slate-200 pb-8 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar name={review.userId?.name || 'Traveler'} src={review.userId?.profilePic} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[15px] font-semibold text-slate-900">{review.userId?.name || review.guestName || 'Traveler'}</p>
                          <p className="text-[12px] text-slate-500">Traveler review</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-slate-500">
                        <button
                          type="button"
                          onClick={() => onToggleReviewLike(review._id)}
                          className={`inline-flex items-center gap-1 text-sm transition ${
                            getLikeMeta(review._id).liked ? 'text-emerald-700' : 'hover:text-slate-700'
                          }`}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{getLikeMeta(review._id).count}</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 text-emerald-700">{renderStars(review.rating)}</div>
                    <p className="mt-3 text-[16px] font-semibold leading-7 text-slate-900">
                      {String(review.comment || '').slice(0, 72) || 'Great experience'}
                    </p>
                    <p className="mt-1 text-[14px] text-slate-600">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} · Traveler
                    </p>
                    <p className="mt-3 max-w-4xl text-[15px] leading-7 text-slate-700">{review.comment}</p>
                    <p className="mt-3 text-[13px] text-slate-500">Written {formatDate(review.createdAt)}</p>

                    {review.photos?.length ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {review.photos.map((photo, index) => (
                          <div key={`${review._id}-photo-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            <img src={photo} alt={`Review upload ${index + 1}`} className="h-44 w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {review.hostReply?.text ? (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Management response</p>
                        <p className="mt-2 text-sm leading-7 text-slate-700">{review.hostReply.text}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
              </div>
            ) : null}

            {!visibleReviews.length ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                {reviews.length ? 'No reviews matched your search.' : 'No reviews yet.'}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="pt-2">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h3 className="text-[24px] font-semibold text-slate-900">Q&amp;A</h3>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">Ask about timing, meeting point, accessibility, or anything else before booking.</p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!requireAuth('qna')) return
                const qnaComposer = document.getElementById('qna-composer')
                if (qnaComposer) qnaComposer.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
              className="rounded-full border border-emerald-900 px-5 py-2.5 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-50"
            >
              Ask a question
            </button>
          </div>

          {questions.length ? (
            <div className="space-y-5">
              {questions.map((item) => (
                <article key={item._id} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar name={item.askedBy?.name || item.guestName || 'Traveler'} src={item.askedBy?.profilePic} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.askedBy?.name || item.guestName || 'Traveler'}</p>
                          <p className="text-xs text-slate-500">{formatDate(item.createdAt)}</p>
                        </div>
                        <span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600">
                          {(item.replies || []).length} repl{(item.replies || []).length === 1 ? 'y' : 'ies'}
                        </span>
                      </div>

                      <p className="mt-4 text-[17px] font-semibold leading-7 text-slate-900">{item.question}</p>

                      {(item.replies || []).length ? (
                        <div className="mt-4 space-y-3">
                          {item.replies.map((reply, replyIndex) => (
                            <div key={`${item._id}-reply-${replyIndex}`} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                              <p className="text-sm leading-7 text-slate-700">{reply.text}</p>
                              <p className="mt-2 text-xs font-semibold text-emerald-700">Answered by {reply.repliedBy?.name || 'Host'}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {isAuthenticated ? (
                        <div className="mt-4">
                          {openReplyComposer[item._id] ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                              <textarea
                                value={answerDrafts[item._id] || ''}
                                onChange={(event) => setAnswerDrafts((prev) => ({ ...prev, [item._id]: event.target.value }))}
                                rows={3}
                                placeholder="Write your reply..."
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                              />
                              <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setOpenReplyComposer((prev) => ({ ...prev, [item._id]: false }))}
                                  className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
                                >
                                  Cancel
                                </button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  loading={answerMutation.isPending}
                                  disabled={!(answerDrafts[item._id] || '').trim()}
                                  onClick={() => onSubmitAnswer(item._id)}
                                >
                                  Post reply
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setOpenReplyComposer((prev) => ({ ...prev, [item._id]: true }))}
                              className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-800"
                            >
                              {(item.replies || []).length ? 'Add reply' : 'Reply'}
                            </button>
                          )}
                        </div>
                      ) : (
                        <button type="button" onClick={() => sendToLogin('qna')} className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800">
                          Sign in to reply
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">No questions yet.</p>
          )}

          <div id="qna-composer" className="mt-8 border-t border-slate-200 pt-6">
            {isAuthenticated ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={4}
                  placeholder="Ask a question about this experience..."
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                />
                <div className="mt-3 flex justify-end">
                  <Button variant="secondary" size="sm" loading={questionMutation.isPending} disabled={!question.trim()} onClick={onSubmitQuestion}>
                    Post question
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <button type="button" onClick={() => sendToLogin('qna')} className="font-semibold text-emerald-700 underline">
                  Sign in to ask a question or post an answer.
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showReviewFilters ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h3 className="text-[18px] font-semibold text-slate-900">Filter reviews</h3>
              <button
                type="button"
                onClick={() => setShowReviewFilters(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close filter reviews"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Traveler rating</p>
                <div className="flex flex-wrap gap-3">
                  {ratingFilterOptions.map((item) => {
                    const isSelected = draftReviewRatingFilter === String(item.stars)

                    return (
                      <button
                        key={item.stars}
                        type="button"
                        onClick={() => setDraftReviewRatingFilter((current) => current === String(item.stars) ? 'all' : String(item.stars))}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                          isSelected ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-400 text-slate-700'
                        }`}
                      >
                        <span className="text-emerald-700">{renderStars(item.stars)}</span>
                        <span className="text-slate-500">({item.count.toLocaleString()})</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Time of year</p>
                <div className="flex flex-wrap gap-3">
                  {monthOptions.map((month) => {
                    const value = month.toLowerCase()
                    const isSelected = draftReviewMonthFilter === value

                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => setDraftReviewMonthFilter((current) => current === value ? 'all' : value)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          isSelected ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-400 text-slate-700'
                        }`}
                      >
                        {month}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Type of visit</p>
                <div className="flex flex-wrap gap-3">
                  {visitTypeOptions.map((type) => {
                    const value = type.toLowerCase()
                    const isSelected = draftReviewVisitTypeFilter === value

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setDraftReviewVisitTypeFilter((current) => current === value ? 'all' : value)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          isSelected ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-400 text-slate-700'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-900">Other</p>
                <button
                  type="button"
                  onClick={() => setDraftShowHostRepliesOnly((current) => !current)}
                  className={`rounded-full border px-3 py-2 text-sm transition ${
                    draftShowHostRepliesOnly ? 'border-emerald-700 bg-emerald-50 text-emerald-800' : 'border-slate-400 text-slate-700'
                  }`}
                >
                  Host replies only
                </button>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-5">
              <button type="button" onClick={onResetReviewFilters} className="text-sm font-medium text-slate-700 underline underline-offset-2">
                Reset
              </button>
              <button
                type="button"
                onClick={onApplyReviewFilters}
                className="rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showReviewComposer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[22px] font-semibold text-slate-900">{t("feedback_write_review")}</h3>
                <p className="mt-1 text-sm text-slate-500">{reviewCallout}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewComposer(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close review composer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <button type="button" onClick={() => sendToLogin('reviews')} className="font-semibold text-emerald-700 underline">
                  Sign in to write a review.
                </button>
              </div>
            ) : canReview ? (
              <>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className={`p-0.5 transition ${star <= (hoverRating || reviewRating) ? 'text-emerald-700' : 'text-slate-300 hover:text-emerald-500'}`}
                    >
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2.5 15.1 8.8 22 9.8 17 14.7 18.2 21.5 12 18.1 5.8 21.5 7 14.7 2 9.8 8.9 8.8" />
                      </svg>
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={5}
                  placeholder="Share what stood out about this experience..."
                  className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none focus:border-emerald-400"
                />

                <div className="mt-4">
                  <input id="review-photo-input" type="file" accept="image/*" multiple onChange={onReviewPhotoChange} className="hidden" />
                  <button
                    type="button"
                    onClick={() => document.getElementById('review-photo-input')?.click()}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-800"
                  >
                    Upload photos
                  </button>
                  <p className="mt-2 text-xs text-slate-500">You can upload up to 5 photos. Uploading photos will post them with your review.</p>
                </div>

                {reviewPhotoPreviews.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {reviewPhotoPreviews.map((photo, index) => (
                      <div key={`preview-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                        <img src={photo} alt={`Selected review upload ${index + 1}`} className="h-36 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewComposer(false)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <Button
                    size="sm"
                    loading={reviewMutation.isPending}
                    disabled={!reviewText.trim() && reviewPhotoFiles.length === 0}
                    onClick={onSubmitReview}
                  >
                    Submit review
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
