import Badge from '../common/Badge.jsx'
const statusVariant = { pending:'yellow', confirmed:'green', cancelled:'red', completed:'blue' }
const BookingStatus = ({ status }) => (
  <Badge variant={statusVariant[status] || 'gray'} className="capitalize">{status}</Badge>
)
export default BookingStatus