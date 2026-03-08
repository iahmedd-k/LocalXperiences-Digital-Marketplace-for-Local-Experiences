import { useParams, Link } from 'react-router-dom'
import { useQuery }        from '@tanstack/react-query'
import Navbar              from '../../components/common/Navbar.jsx'
import Footer              from '../../components/common/Footer.jsx'
import Spinner             from '../../components/common/Spinner.jsx'
import EmptyState          from '../../components/common/EmptyState.jsx'
import ExperienceCard      from '../../components/experience/ExperienceCard.jsx'
import { getItineraryById } from '../../services/itineraryService.js'

const ItineraryDetailPage = () => {
  const { id } = useParams()

  const { data: itinerary, isLoading, isError } = useQuery({
    queryKey: ['itinerary', id],
    queryFn:  () => getItineraryById(id).then((r) => r.data.data),
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Spinner size="lg" className="flex-1" />
      </div>
    )
  }

  if (isError || !itinerary) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <EmptyState
            icon="🗺️"
            title="Itinerary not found"
            description="This itinerary may have been deleted or is not accessible."
            actionLabel="Back to My Itineraries"
            action={() => (window.location.href = '/my-itineraries')}
          />
        </div>
        <Footer />
      </div>
    )
  }

  const experiences = itinerary.experiences || itinerary.experienceIds || []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/my-itineraries" className="text-sm text-orange-500 hover:underline">
              ← My Itineraries
            </Link>
            <h1 className="font-clash text-3xl font-bold text-gray-900 mt-1">
              {itinerary.title}
            </h1>
            {itinerary.description && (
              <p className="text-gray-500 text-sm mt-1">{itinerary.description}</p>
            )}
          </div>
        </div>

        {/* Experiences */}
        {experiences.length === 0 ? (
          <EmptyState
            icon="🌍"
            title="No experiences added yet"
            description="Browse experiences and use “Save to Itinerary” to build this trip."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {experiences.map((exp) => (
              <ExperienceCard key={exp._id} experience={exp} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default ItineraryDetailPage