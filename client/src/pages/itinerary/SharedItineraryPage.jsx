import { useParams, Link } from 'react-router-dom'
import { useQuery }        from '@tanstack/react-query'
import { getSharedItinerary } from '../../services/itineraryService.js'
import Navbar              from '../../components/common/Navbar.jsx'
import Footer              from '../../components/common/Footer.jsx'
import ExperienceCard      from '../../components/experience/ExperienceCard.jsx'
import Spinner             from '../../components/common/Spinner.jsx'

const SharedItineraryPage = () => {
  const { token } = useParams()

  const { data: itinerary, isLoading, isError } = useQuery({
    queryKey: ['sharedItinerary', token],
    queryFn:  () => getSharedItinerary(token).then((r) => r.data.data),
  })

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar/><Spinner size="lg" className="flex-1"/></div>

  if (isError) return (
    <div className="min-h-screen flex flex-col"><Navbar/>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Itinerary not found</h2>
          <p className="text-gray-500 mb-4">This link may have expired or been removed.</p>
          <Link to="/" className="text-orange-500 hover:underline">Go Home</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            🔗 Shared Itinerary
          </div>
          <h1 className="font-clash text-4xl font-bold text-gray-900 mb-2">{itinerary?.title}</h1>
          {itinerary?.description && <p className="text-gray-500 text-lg mb-2">{itinerary.description}</p>}
          <p className="text-gray-400 text-sm">
            Shared by {itinerary?.userId?.name} · {(itinerary?.experiences || itinerary?.experienceIds || []).length} experiences
          </p>
        </div>

        {/* Experiences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {(itinerary?.experiences || itinerary?.experienceIds || []).map((exp) => (
            <ExperienceCard key={exp._id} experience={exp} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-orange-50 rounded-2xl p-8">
          <h3 className="font-clash text-2xl font-bold text-gray-900 mb-2">Plan Your Own Trip</h3>
          <p className="text-gray-500 mb-5">Create your own itinerary and explore unique local experiences.</p>
          <Link to="/signup" className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition">
            Get Started Free →
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default SharedItineraryPage