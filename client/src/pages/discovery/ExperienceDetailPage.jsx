import { useState }        from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery }        from '@tanstack/react-query'
import { getExperienceById } from '../../services/experienceService.js'
import Navbar              from '../../components/common/Navbar.jsx'
import Footer              from '../../components/common/Footer.jsx'
import Spinner             from '../../components/common/Spinner.jsx'
import ExperienceGallery   from '../../components/experience/ExperienceGallery.jsx'
import ExperienceHost      from '../../components/experience/ExperienceHost.jsx'
import PriceBox            from '../../components/experience/PriceBox.jsx'
import ReviewList          from '../../components/reviews/ReviewList.jsx'
import ReviewForm          from '../../components/reviews/ReviewForm.jsx'
import QnAList             from '../../components/qna/QnAList.jsx'
import ExperienceMap       from '../../components/map/ExperienceMap.jsx'
import Badge               from '../../components/common/Badge.jsx'
import { formatDuration }  from '../../utils/formatters.js'
import { CATEGORIES }      from '../../config/constants.js'

const ExperienceDetailPage = () => {
  const { id } = useParams()
  const [reviewKey, setReviewKey] = useState(0)

  const { data: exp, isLoading } = useQuery({
    queryKey: ['experience', id],
    queryFn:  () => getExperienceById(id).then((r) => r.data.data),
  })

  if (isLoading) return (
    <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>
  )

  if (!exp) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><div className="text-5xl mb-4">😕</div><h2 className="text-xl font-bold text-gray-800">Experience not found</h2><Link to="/search" className="text-orange-500 mt-2 block hover:underline">Browse experiences →</Link></div>
      </div>
    </div>
  )

  const catLabel = CATEGORIES.find((c) => c.value === exp.category)?.label || exp.category
  const coords   = exp.location?.coordinates?.coordinates

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-orange-500">Experiences</Link>
          <span>/</span>
          <span className="text-gray-700">{exp.title}</span>
        </div>

        {/* Title row */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="font-clash text-3xl md:text-4xl font-bold text-gray-900 mb-2">{exp.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="orange">{catLabel}</Badge>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {exp.location?.city}{exp.location?.country ? `, ${exp.location.country}` : ''}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {formatDuration(exp.duration)}
              </span>
              {exp.groupSize && (
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Up to {exp.groupSize.max} guests
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-8">
          <ExperienceGallery photos={exp.photos} title={exp.title} />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Description */}
            <section>
              <h2 className="font-clash text-2xl font-bold text-gray-900 mb-3">About this experience</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{exp.description}</p>
            </section>

            {/* Includes */}
            {exp.includes?.length > 0 && (
              <section>
                <h2 className="font-clash text-xl font-bold text-gray-900 mb-3">What's included</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {exp.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" d="M5 13l4 4L19 7"/></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tags */}
            {exp.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {exp.tags.map((t) => <Badge key={t} variant="gray">#{t}</Badge>)}
              </div>
            )}

            {/* Host */}
            <ExperienceHost host={exp.hostId} />

            {/* Map */}
            {coords && coords[0] !== 0 && (
              <section>
                <h2 className="font-clash text-xl font-bold text-gray-900 mb-3">Location</h2>
                <div className="h-56 rounded-2xl overflow-hidden border border-gray-100">
                  <ExperienceMap
                    experiences={[exp]}
                    center={[coords[1], coords[0]]}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{exp.location?.address}</p>
              </section>
            )}

            {/* Reviews */}
            <section>
              <ReviewList experienceId={id} rating={exp.rating} />
              <div className="mt-5">
                {/* Only show ReviewForm if user has a valid booking for this experience */}
                {exp.myBookingId ? (
                  <ReviewForm bookingId={exp.myBookingId} experienceId={id} onSuccess={() => setReviewKey(k => k+1)} />
                ) : (
                  <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50 text-center">
                    <h4 className="font-bold text-gray-900 mb-3">Leave a Review</h4>
                    <p className="text-gray-500 mb-3">You must book and complete this experience before leaving a review.</p>
                    <Link to={`/booking/${id}`} className="inline-block bg-orange-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-orange-600 transition">Book Now</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Q&A */}
            <section>
              <QnAList experienceId={id} />
            </section>
          </div>

          {/* Right column — Price box */}
          <div className="lg:col-span-1">
            <PriceBox experience={exp} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ExperienceDetailPage