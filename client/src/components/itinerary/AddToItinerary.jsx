import { useState }   from 'react'
import { useQuery }   from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Link }       from 'react-router-dom'
import toast          from 'react-hot-toast'
import { getMyItineraries, addExperience } from '../../services/itineraryService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import Modal          from '../common/Modal.jsx'
import Button         from '../common/Button.jsx'
import Spinner        from '../common/Spinner.jsx'

const AddToItinerary = ({ experienceId }) => {
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [open,    setOpen]    = useState(false)
  const [adding,  setAdding]  = useState(null)

  const { data: itineraries = [], isLoading } = useQuery({
    queryKey: ['myItineraries'],
    queryFn:  () => getMyItineraries().then((r) => r.data.data),
    enabled:  open && isAuthenticated,
  })

  const handleAdd = async (itineraryId) => {
    try {
      setAdding(itineraryId)
      await addExperience(itineraryId, experienceId)
      toast.success('Added to itinerary!')
      setOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAdding(null)
    }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-500 transition">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
        Save to Itinerary
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add to Itinerary">
        {isLoading ? <Spinner className="py-6"/> : itineraries.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">You have no itineraries yet.</p>
            <Link to="/my-itineraries"><Button size="sm">Create Itinerary</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {itineraries.map((it) => (
              <button key={it._id} onClick={() => handleAdd(it._id)}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition text-left">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{it.title}</p>
                  <p className="text-xs text-gray-400">{it.experiences?.length || 0} experiences</p>
                </div>
                {adding === it._id
                  ? <Spinner size="sm"/>
                  : <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>}
              </button>
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}

export default AddToItinerary