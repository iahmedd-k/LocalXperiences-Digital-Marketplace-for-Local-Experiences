import { useState }      from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast             from 'react-hot-toast'
import { getMyBookings, cancelBooking } from '../../services/bookingService.js'
import { getErrorMessage } from '../../utils/helpers.js'
import Navbar            from '../../components/common/Navbar.jsx'
import Footer            from '../../components/common/Footer.jsx'
import BookingCard       from '../../components/booking/BookingCard.jsx'
import Spinner           from '../../components/common/Spinner.jsx'
import EmptyState        from '../../components/common/EmptyState.jsx'
import Modal             from '../../components/common/Modal.jsx'
import Button            from '../../components/common/Button.jsx'
import ReviewForm          from '../../components/reviews/ReviewForm.jsx'

const MyBookingsPage = () => {
  const queryClient = useQueryClient()
  const [cancelId,   setCancelId]  = useState(null)
  const [cancelling, setCancelling]= useState(false)
  const [tab,        setTab]       = useState('all')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn:  () => getMyBookings().then((r) => r.data.data),
  })

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab)

  const handleCancel = async () => {
    try {
      setCancelling(true)
      await cancelBooking(cancelId)
      toast.success('Booking cancelled')
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
      setCancelId(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        <h1 className="font-clash text-3xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 border border-gray-100 w-fit">
          {['all','confirmed','pending','completed','cancelled'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition
                ${tab === t ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >{t}</button>
          ))}
        </div>

        {isLoading ? <Spinner size="lg" className="py-16"/> : filtered.length === 0 ? (
          <EmptyState icon="📅" title="No bookings found" description="Book your first experience to get started!" />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((b) => (
              <>
                <BookingCard key={b._id} booking={b} onCancel={(id) => setCancelId(id)} />
                {/* Show review form if eligible */}
                {['confirmed','completed'].includes(b.status) && !b.reviewLeft && (
                  <div className="mt-4">
                    <ReviewForm bookingId={b._id} experienceId={b.experienceId?._id} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['myBookings'] })} />
                  </div>
                )}
              </>
            ))}
          </div>
        )}
      </div>

      {/* Cancel confirm modal */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Booking">
        <p className="text-gray-600 mb-6">Are you sure you want to cancel this booking? This may be subject to a cancellation fee.</p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setCancelId(null)}>Keep Booking</Button>
          <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>Yes, Cancel</Button>
        </div>
      </Modal>

      <Footer />
    </div>
  )
}

export default MyBookingsPage