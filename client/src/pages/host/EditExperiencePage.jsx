import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient }     from '@tanstack/react-query'
import toast                            from 'react-hot-toast'
import { getExperienceById, updateExperience, updateAvailability } from '../../services/experienceService.js'
import { getErrorMessage }              from '../../utils/helpers.js'
import { CATEGORIES }                   from '../../config/constants.js'
import { formatDate }                   from '../../utils/formatters.js'
import Navbar                           from '../../components/common/Navbar.jsx'
import Footer                           from '../../components/common/Footer.jsx'
import Button                           from '../../components/common/Button.jsx'
import Input                            from '../../components/common/Input.jsx'
import Spinner                          from '../../components/common/Spinner.jsx'

const EditExperiencePage = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const queryClient = useQueryClient()
  const [tab,       setTab]    = useState('details')
  const [loading,   setLoading]= useState(false)
  const [newSlot,   setNewSlot]= useState({ date: '', startTime: '', slots: 10 })

  const { data: exp, isLoading } = useQuery({
    queryKey: ['experience', id],
    queryFn:  () => getExperienceById(id).then((r) => r.data.data),
  })

  const [form, setForm] = useState(null)

  useEffect(() => {
    if (!exp) return
    setForm({
      title:       exp.title,
      description: exp.description,
      category:    exp.category,
      price:       exp.price,
      duration:    exp.duration,
      tags:        exp.tags?.join(', ') || '',
      includes:    exp.includes?.join('\n') || '',
      photoUrls:   exp.photos?.join('\n') || '',
      location:    exp.location || { address: '', city: '', country: '' },
      groupSize:   exp.groupSize || { min: 1, max: 10 },
      isActive:    exp.isActive !== false,
    })
  }, [exp])

  const set    = (field, val) => setForm((f) => ({ ...f, [field]: val }))
  const setLoc = (field, val) => setForm((f) => ({ ...f, location: { ...f.location, [field]: val } }))

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        ...form,
        price:    Number(form.price),
        duration: Number(form.duration),
        tags:     form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        includes: form.includes.split('\n').map((t) => t.trim()).filter(Boolean),
        photos:   form.photoUrls.split('\n').map((u) => u.trim()).filter(Boolean),
      }
      await updateExperience(id, payload)
      toast.success('Experience updated!')
      queryClient.invalidateQueries({ queryKey: ['experience', id] })
      queryClient.invalidateQueries({ queryKey: ['hostExperiences'] })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.startTime) return toast.error('Fill in date and time')
    try {
      const existing = exp.availability || []
      await updateAvailability(id, { availability: [...existing, newSlot] })
      toast.success('Slot added!')
      queryClient.invalidateQueries({ queryKey: ['experience', id] })
      setNewSlot({ date: '', startTime: '', slots: 10 })
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading || !form) return (
    <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1"/></div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link to="/host/dashboard" className="text-sm text-orange-500 hover:underline">← Dashboard</Link>
            <h1 className="font-clash text-2xl font-bold text-gray-900 mt-1">Edit Experience</h1>
            <p className="text-gray-500 text-sm truncate max-w-sm">{exp.title}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/experiences/${id}`} target="_blank"
              className="text-sm border border-gray-200 px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
              Preview 👁️
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['details', 'location', 'availability', 'photos'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition
                ${tab === t ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{t}</button>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">

          {/* Details tab */}
          {tab === 'details' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="font-clash text-lg font-bold text-gray-900">Experience Details</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-600">Active</span>
                  <div
                    onClick={() => set('isActive', !form.isActive)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${form.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`}/>
                  </div>
                </label>
              </div>
              <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <Input label="Price (USD)" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
                <div/>
              </div>
              <Input label="Tags (comma separated)" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="food, heritage, walking" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">What's Included (one per line)</label>
                <textarea rows={4} value={form.includes} onChange={(e) => set('includes', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"/>
              </div>
            </div>
          )}

          {/* Location tab */}
          {tab === 'location' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-lg font-bold text-gray-900">Location</h2>
              <Input label="City" value={form.location.city} onChange={(e) => setLoc('city', e.target.value)} />
              <Input label="Country" value={form.location.country} onChange={(e) => setLoc('country', e.target.value)} />
              <Input label="Meeting Point Address" value={form.location.address} onChange={(e) => setLoc('address', e.target.value)} />
            </div>
          )}

          {/* Availability tab */}
          {tab === 'availability' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-lg font-bold text-gray-900">Manage Availability</h2>

              {/* Add new slot */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3">Add New Slot</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Date</label>
                    <input type="date" value={newSlot.date} min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Start Time</label>
                    <input type="time" value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Max Slots</label>
                    <input type="number" min={1} value={newSlot.slots}
                      onChange={(e) => setNewSlot({ ...newSlot, slots: Number(e.target.value) })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"/>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={handleAddSlot}>+ Add Slot</Button>
              </div>

              {/* Existing slots */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">Existing Slots</p>
                {exp.availability?.length ? exp.availability.map((slot, i) => {
                  const spotsLeft = slot.slots - (slot.booked || 0)
                  const isPast    = new Date(slot.date) < new Date()
                  return (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border
                      ${isPast ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'}`}>
                      <div className="text-sm">
                        <span className={`font-semibold ${isPast ? 'text-gray-400' : 'text-gray-900'}`}>
                          {formatDate(slot.date)}
                        </span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-gray-500">{slot.startTime}</span>
                        {isPast && <span className="ml-2 text-xs text-gray-400">(past)</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                          ${spotsLeft === 0 ? 'bg-red-100 text-red-600'
                          : spotsLeft <= 3  ? 'bg-yellow-100 text-yellow-600'
                          :                   'bg-green-100 text-green-600'}`}>
                          {slot.booked || 0}/{slot.slots} booked
                        </span>
                      </div>
                    </div>
                  )
                }) : <p className="text-gray-400 text-sm text-center py-4">No slots yet</p>}
              </div>
            </div>
          )}

          {/* Photos tab */}
          {tab === 'photos' && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-lg font-bold text-gray-900">Photos</h2>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Photo URLs (one per line)</label>
                <textarea rows={5} value={form.photoUrls} onChange={(e) => set('photoUrls', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none font-mono"/>
              </div>
              {form.photoUrls && (
                <div className="flex gap-3 flex-wrap">
                  {form.photoUrls.split('\n').filter(u => u.trim()).map((url, i) => (
                    <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                      <img src={url.trim()} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}/>
                      {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-orange-500 text-white px-1 rounded">Cover</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Save button — show for all tabs except availability (which auto-saves) */}
          {tab !== 'availability' && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <Button onClick={handleSave} loading={loading}>Save Changes</Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default EditExperiencePage