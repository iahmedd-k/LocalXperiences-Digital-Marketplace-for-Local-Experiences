import { useState }      from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast             from 'react-hot-toast'
import { getMyItineraries, createItinerary, deleteItinerary } from '../../services/itineraryService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import Navbar            from '../../components/common/Navbar.jsx'
import Footer            from '../../components/common/Footer.jsx'
import ItineraryCard     from '../../components/itinerary/ItineraryCard.jsx'
import ItineraryForm     from '../../components/itinerary/ItineraryForm.jsx'
import Modal             from '../../components/common/Modal.jsx'
import Button            from '../../components/common/Button.jsx'
import Spinner           from '../../components/common/Spinner.jsx'
import EmptyState        from '../../components/common/EmptyState.jsx'

const MyItinerariesPage = () => {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId,   setDeleteId]   = useState(null)
  const [creating,   setCreating]   = useState(false)
  const [deleting,   setDeleting]   = useState(false)

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ['myItineraries'],
    queryFn:  () => getMyItineraries().then((r) => r.data.data),
  })

  const handleCreate = async (form) => {
    if (!form.title) return toast.error('Please enter a name')
    try {
      setCreating(true)
      await createItinerary(form)
      toast.success('Itinerary created!')
      queryClient.invalidateQueries({ queryKey: ['myItineraries'] })
      setShowCreate(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await deleteItinerary(deleteId)
      toast.success('Itinerary deleted')
      queryClient.invalidateQueries({ queryKey: ['myItineraries'] })
      setDeleteId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-clash text-3xl font-bold text-gray-900">My Itineraries</h1>
          <Button onClick={() => setShowCreate(true)}>+ Create New</Button>
        </div>

        {isLoading ? <Spinner size="lg" className="py-16"/> : itineraries.length === 0 ? (
          <EmptyState icon="🗺️" title="No itineraries yet" description="Plan your perfect trip by creating an itinerary!"
            action={() => setShowCreate(true)} actionLabel="Create Itinerary" />
        ) : (
          <div className="flex flex-col gap-4">
            {itineraries.map((it) => (
              <ItineraryCard key={it._id} itinerary={it} onDelete={(id) => setDeleteId(id)} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Itinerary">
        <ItineraryForm onSubmit={handleCreate} loading={creating} />
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Itinerary">
        <p className="text-gray-600 mb-6">Are you sure? This will permanently delete this itinerary and all saved experiences.</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default MyItinerariesPage