import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import Button from '../../components/common/Button.jsx'
import Avatar from '../../components/common/Avatar.jsx'
import { formatPrice, formatDate } from '../../utils/formatters.js'

const fetchGroupBooking = async (groupCode) => {
  const res = await fetch(`/api/bookings/group/${groupCode}`)
  if (!res.ok) throw new Error('Group not found')
  return res.json().then((r) => r.data)
}

const GroupInvitePage = () => {
  const { group_id } = useParams()
  const navigate = useNavigate()
  const { data: group, isLoading, isError } = useQuery({
    queryKey: ['groupBooking', group_id],
    queryFn: () => fetchGroupBooking(group_id),
    enabled: !!group_id,
  })

  if (isLoading) return <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>
  if (isError || !group) return (
    <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center">Group not found</div><Footer /></div>
  )

  const exp = group.experienceId || {}
  const slotsLeft = group.slot && typeof group.slot.remaining === 'number' ? group.slot.remaining : '—'
  const pricePerPerson = group.pricing?.totalAfterDiscount ? formatPrice(group.pricing.totalAfterDiscount / Math.max(1, group.splitPayments?.length || 1)) : '—'
  const participants = group.splitPayments || []

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <Navbar />
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-violet-200 bg-white p-6 shadow-sm">
          <h1 className="font-clash text-2xl font-bold text-violet-900 mb-2">Join Group Booking</h1>
          <div className="mb-4 flex gap-4 items-center">
            <img src={exp.photos?.[0]} alt={exp.title} className="h-20 w-28 object-cover rounded-xl border border-slate-200" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">{exp.title}</h2>
              <div className="text-xs text-slate-500">{exp.location?.city} • {formatDate(group.slot?.date)} {group.slot?.startTime}</div>
              <div className="mt-1 text-xs text-slate-700">Group code: <span className="font-mono text-violet-700">{group.collaboration.groupCode}</span></div>
            </div>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500 mb-1">Slots left</div>
              <div className="text-lg font-bold text-slate-900">{slotsLeft}</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500 mb-1">Price per person</div>
              <div className="text-lg font-bold text-slate-900">{pricePerPerson}</div>
            </div>
          </div>
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-700 mb-1">Participants</div>
            <div className="flex flex-wrap gap-2">
              {participants.map((p, i) => (
                <div key={p.email} className="flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs text-violet-800">
                  <Avatar name={p.email} size={20} />
                  {p.email} {p.status === 'paid' ? <span className="ml-1 text-emerald-700">✔</span> : null}
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">{participants.filter((p) => p.status === 'paid').length} / {participants.length} paid</div>
          </div>
          <Button className="w-full mt-4" onClick={() => navigate(`/checkout/${exp._id}?slot=${group.slot?._id}&guests=1&group=1&groupCode=${group.collaboration.groupCode}`)}>
            Join Group
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default GroupInvitePage
