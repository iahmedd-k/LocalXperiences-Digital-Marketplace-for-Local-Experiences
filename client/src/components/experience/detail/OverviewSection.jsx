import { useMemo, useState } from 'react'
import { CircleHelp, Clock3, Languages, MoveRight, Smartphone, Users } from 'lucide-react'
import DetailSection from './DetailSection.jsx'

const clampText = (value, length) => {
  const text = value?.trim() || ''
  if (text.length <= length) return text
  return `${text.slice(0, length).trimEnd()}...`
}

const OverviewSection = ({
  description,
  rating,
  ratingCount,
  reviews = [],
  renderStars,
  facts = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const trimmedDescription = description?.trim() || ''
  const shouldCollapse = trimmedDescription.length > 220
  const visibleDescription = shouldCollapse && !isExpanded
    ? clampText(trimmedDescription, 220)
    : trimmedDescription

  const featuredReviews = useMemo(() => reviews.slice(0, 2), [reviews])

  return (
    <section id="overview" className="scroll-mt-36 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-7">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-6 text-[15px] font-semibold text-slate-900">
          <span className="border-b border-emerald-700 pb-2">Overview</span>
        </div>

        <div className="mt-8">
          <h2 className="font-clash text-2xl font-bold text-slate-900">About</h2>
          <p className="mt-5 max-w-4xl text-[17px] leading-9 text-slate-700 whitespace-pre-line">
            {visibleDescription}
            {shouldCollapse ? (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => setIsExpanded((value) => !value)}
                  className="inline font-semibold text-emerald-800 underline underline-offset-2"
                >
                  {isExpanded ? 'Read less' : 'Read more'}
                </button>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-clash text-xl font-bold text-slate-900">Why travelers love this</h3>
            <CircleHelp className="h-4 w-4 text-slate-400" />
          </div>

          {rating > 0 ? (
            <a href="#reviews" className="flex items-center gap-2 text-sm text-slate-700 hover:text-emerald-800">
              <span className="font-semibold text-slate-900">{rating.toFixed(1)}</span>
              <span className="flex items-center gap-1 text-emerald-700">{renderStars(rating)}</span>
              <span className="underline underline-offset-2">({ratingCount} reviews)</span>
            </a>
          ) : null}
        </div>

        {featuredReviews.length ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_56px] lg:items-center">
            <div className="grid gap-4 md:grid-cols-2 lg:col-span-2">
              {featuredReviews.map((review) => (
                <article key={review._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-emerald-700">{renderStars(review.rating)}</span>
                    <span className="font-semibold text-slate-900">{review.userId?.name || review.guestName || 'Traveler'}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="mt-4 text-[16px] leading-8 text-slate-800">
                    {clampText(review.comment || '', 170)}
                  </p>
                </article>
              ))}
            </div>

            <a
              href="#reviews"
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-emerald-900 text-emerald-900 transition hover:bg-emerald-50"
              aria-label="View all reviews"
            >
              <MoveRight className="h-6 w-6" />
            </a>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-sm text-slate-500">
            Reviews will appear here once guests start sharing feedback.
          </p>
        )}
      </div>

      <div className="pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {facts.map((fact) => {
            const Icon = fact.icon

            return (
              <div key={fact.label} className="flex items-start gap-3 text-[16px] text-slate-800">
                <span className="mt-1 text-emerald-800">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <span className="font-medium">{fact.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const overviewFactIcons = {
  group: Users,
  duration: Clock3,
  start: CircleHelp,
  ticket: Smartphone,
  language: Languages,
}

export default OverviewSection
