import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import toast                   from 'react-hot-toast'
import { createExperience }    from '../../services/experienceService.js'
import { getErrorMessage }     from '../../utils/helpers.js'
import { CATEGORIES }          from '../../config/constants.js'
import Navbar                  from '../../components/common/Navbar.jsx'
import Footer                  from '../../components/common/Footer.jsx'
import Button                  from '../../components/common/Button.jsx'
import Input                   from '../../components/common/Input.jsx'

const STEPS = ['Basic Info', 'Details', 'Location', 'Availability', 'Photos']

const CreateExperiencePage = () => {
  const navigate = useNavigate()
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    price:       '',
    duration:    '',
    tags:        '',
    includes:    '',
    groupSize:   { min: 1, max: 10 },
    location: { address: '', city: '', country: 'Pakistan' },
    availability: [],
    photos:      [],
    photoUrls:   '',
  })

  const [cityQuery, setCityQuery] = useState('')
  const [cityResults, setCityResults] = useState([])
  const [isSearchingCity, setIsSearchingCity] = useState(false)

  // New availability slot
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '', slots: 10 })

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))
  const setLoc = (field, val) => setForm((f) => ({ ...f, location: { ...f.location, [field]: val } }))

  // City autocomplete using Mapbox Places API (if token configured)
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) return
    if (!cityQuery || cityQuery.length < 3) {
      setCityResults([])
      return
    }

    const controller = new AbortController()
    const fetchCities = async () => {
      try {
        setIsSearchingCity(true)
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityQuery)}.json` +
          `?types=place,locality&limit=5&access_token=${token}`,
          { signal: controller.signal }
        )
        const data = await resp.json()
        const results = (data.features || []).map((f) => ({
          id:   f.id,
          name: f.text,
          full: f.place_name,
          // [lng, lat]
          center: f.center,
        }))
        setCityResults(results)
      } catch (_) {
        // ignore network errors in dev
      } finally {
        setIsSearchingCity(false)
      }
    }

    const timeoutId = setTimeout(fetchCities, 300)
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [cityQuery])

  const addSlot = () => {
    if (!newSlot.date || !newSlot.startTime) return toast.error('Fill in date and time')
    setForm((f) => ({ ...f, availability: [...f.availability, { ...newSlot }] }))
    setNewSlot({ date: '', startTime: '', slots: 10 })
    toast.success('Slot added!')
  }

  const removeSlot = (i) => setForm((f) => ({ ...f, availability: f.availability.filter((_, idx) => idx !== i) }))

  const [photoFiles, setPhotoFiles] = useState([])

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category || !form.price || !form.duration)
      return toast.error('Please fill in all required fields')
    if (!form.location.city) return toast.error('Please enter a city')
    if (form.availability.length === 0) return toast.error('Please add at least one availability slot')

    try {
      setLoading(true)

      const tagsArray      = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const includesArray  = form.includes.split('\n').map((t) => t.trim()).filter(Boolean)
      const photoUrlArray  = form.photoUrls.split('\n').map((u) => u.trim()).filter(Boolean)

      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('category', form.category)
      fd.append('price', String(form.price))
      fd.append('duration', String(form.duration))
      // Append location fields individually for backend validation
      fd.append('location.city', form.location.city)
      fd.append('location.address', form.location.address)
      fd.append('location.country', form.location.country)
      if (form.location.coordinatesHint) {
        fd.append('location.coordinatesHint', JSON.stringify(form.location.coordinatesHint))
      }
      fd.append('groupSize', JSON.stringify(form.groupSize))
      fd.append('availability', JSON.stringify(form.availability))
      fd.append('tags', JSON.stringify(tagsArray))
      fd.append('includes', JSON.stringify(includesArray))

      // Direct URLs (used when no files)
      if (photoUrlArray.length > 0 && photoFiles.length === 0) {
        fd.append('photos', JSON.stringify(photoUrlArray))
      }

      // Uploaded files
      photoFiles.forEach((file) => {
        fd.append('photos', file)
      })

      await createExperience(fd)
      toast.success('Experience created! 🎉')
      navigate('/host/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 0) return form.title && form.description && form.category
    if (step === 1) return form.price && form.duration
    if (step === 2) return form.location.city
    return true
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <Link to="/host/dashboard" className="text-sm text-orange-500 hover:underline">← Dashboard</Link>
          <h1 className="font-clash text-3xl font-bold text-gray-900 mt-2">Create New Experience</h1>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition
                  ${i === step ? 'bg-orange-500 text-white'
                  : i < step   ? 'bg-green-100 text-green-700 cursor-pointer'
                  :               'bg-gray-100 text-gray-400 cursor-default'}`}
              >
                {i < step ? '✓' : i + 1} {s}
              </button>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-green-300' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900">Basic Information</h2>
              <Input label="Experience Title *" value={form.title} onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Old City Food Walking Tour" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe what guests will experience, see, taste, or learn..."
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Category *</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400">
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="food, heritage, walking, beginner-friendly" />
              </div>
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900">Experience Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (USD) *" type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="25" />
                <Input label="Duration (minutes) *" type="number" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="120" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Min Group Size</label>
                  <input type="number" min={1} value={form.groupSize.min}
                    onChange={(e) => setForm((f) => ({ ...f, groupSize: { ...f.groupSize, min: Number(e.target.value) } }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Max Group Size</label>
                  <input type="number" min={1} value={form.groupSize.max}
                    onChange={(e) => setForm((f) => ({ ...f, groupSize: { ...f.groupSize, max: Number(e.target.value) } }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-orange-400"/>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">What's Included <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea rows={4} value={form.includes} onChange={(e) => set('includes', e.target.value)}
                  placeholder={"Food tastings at 5 local spots\nBottled water\nLocal guide"}
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"/>
              </div>
            </div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900">Location</h2>
              <div className="relative">
                <Input
                  label="City *"
                  value={cityQuery || form.location.city}
                  onChange={(e) => {
                    setCityQuery(e.target.value)
                    setLoc('city', e.target.value)
                  }}
                  placeholder="Lahore"
                />
                {isSearchingCity && (
                  <p className="text-xs text-gray-400 mt-1">Searching locations…</p>
                )}
                {cityResults.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-auto">
                    {cityResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setLoc('city', c.name)
                          setLoc('address', c.full)
                          // store coordinates as hint for backend geocoding
                          setForm((f) => ({
                            ...f,
                            location: {
                              ...f.location,
                              coordinatesHint: { lng: c.center[0], lat: c.center[1] },
                            },
                          }))
                          setCityQuery(c.name)
                          setCityResults([])
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      >
                        <div className="font-semibold text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.full}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input label="Country" value={form.location.country} onChange={(e) => setLoc('country', e.target.value)} placeholder="Pakistan" />
              <Input label="Meeting Point Address" value={form.location.address} onChange={(e) => setLoc('address', e.target.value)}
                placeholder="e.g. Food Street, Fort Road, Lahore" />
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                💡 The exact coordinates will be auto-detected from your address and chosen city using Mapbox when you submit.
              </div>
            </div>
          )}

          {/* Step 3 — Availability */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900">Availability Slots</h2>
              <p className="text-sm text-gray-500">Add the dates and times when you'll run this experience.</p>

              {/* Add slot form */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3 border border-gray-100">
                <div className="grid grid-cols-3 gap-3">
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
                <Button size="sm" variant="secondary" onClick={addSlot}>+ Add Slot</Button>
              </div>

              {/* Added slots */}
              {form.availability.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {form.availability.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-900">{slot.date}</span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-gray-600">{slot.startTime}</span>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-gray-600">{slot.slots} spots</span>
                      </div>
                      <button onClick={() => removeSlot(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">No slots added yet</p>
              )}
            </div>
          )}

          {/* Step 4 — Photos */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-clash text-xl font-bold text-gray-900">Photos</h2>
              <p className="text-sm text-gray-500">Add photo URLs for your experience. The first photo will be the cover image.</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Photo URLs <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea rows={5} value={form.photoUrls} onChange={(e) => set('photoUrls', e.target.value)}
                  placeholder={"https://images.unsplash.com/photo-1...\nhttps://images.unsplash.com/photo-2..."}
                  className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none font-mono"/>
              </div>

              {/* Photo preview */}
              {form.photoUrls && (
                <div className="flex gap-3 flex-wrap">
                  {form.photoUrls.split('\n').filter(u => u.trim()).map((url, i) => (
                    <div key={i} className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                      <img src={url.trim()} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none' }}/>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                💡 In production, you'd upload directly via Cloudinary. For now, paste hosted image URLs.
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>← Back</Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next →</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>🚀 Publish Experience</Button>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Need Link import
import { Link } from 'react-router-dom'

export default CreateExperiencePage