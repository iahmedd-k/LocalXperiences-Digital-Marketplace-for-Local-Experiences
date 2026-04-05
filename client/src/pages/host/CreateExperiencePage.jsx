import useTranslation from '../../hooks/useTranslation.js';
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import { useSelector }         from 'react-redux'
import toast                   from 'react-hot-toast'
import { createExperience }    from '../../services/experienceService.js'
import { getErrorMessage }     from '../../utils/helpers.js'
import { CATEGORIES }          from '../../config/constants.js'
import Navbar                  from '../../components/common/Navbar.jsx'
import Footer                  from '../../components/common/Footer.jsx'
import Button                  from '../../components/common/Button.jsx'
import Input                   from '../../components/common/Input.jsx'

const STEPS = ['Basics', 'Pricing & Details', 'Location', 'Availability', 'Itinerary', 'Photos']
const MIN_IMAGES = 2
const MAX_IMAGES = 10
const MAX_TITLE_LENGTH = 80
const MAX_DESCRIPTION_LENGTH = 1200
const MAX_TAGS = 8
const MAX_INCLUDES = 8
const MAX_NOT_INCLUDED = 8
const MAX_ADDRESS_LENGTH = 180
const MAX_CITY_LENGTH = 60
const MAX_COUNTRY_LENGTH = 60
const MAX_AVAILABILITY_SLOTS = 20
const MAX_ITINERARY_STEPS = 12
const MAX_ITINERARY_DESCRIPTION = 280
const MAX_ITINERARY_TRANSITION = 180
const MAX_DETAIL_SECTION_LENGTH = 800

const DETAIL_SECTION_FIELDS = [
  { key: 'whatToExpect', label: 'What to expect', placeholder: 'Tell guests what the overall flow feels like, what they will do, and what they should prepare for.' },
  { key: 'meetingAndPickup', label: 'Meeting and pickup', placeholder: 'Explain the exact meeting point, arrival timing, pickup details, or how guests can find the host.' },
  { key: 'accessibility', label: 'Accessibility', placeholder: 'Mention walking level, stairs, wheelchair access, age suitability, or anything guests should know.' },
  { key: 'additionalInformation', label: 'Additional information', placeholder: 'Add rules, dress code, weather notes, or anything else that helps guests plan.' },
  { key: 'cancellationPolicy', label: 'Cancellation policy', placeholder: 'Describe your cancellation, rescheduling, or refund policy in simple terms.' },
  { key: 'help', label: 'Help', placeholder: 'Share how guests can contact you for help before or after booking.' },
]

const EMPTY_ITINERARY_STEP = {
  title: '',
  startTime: '',
  durationMinutes: 30,
  locationName: '',
  description: '',
  transitionNote: '',
}

const EMPTY_PATHWAY = {
  title: '',
  summary: '',
  durationLabel: '',
  highlight: '',
  phase: 'anchor',
  idealTime: 'anytime',
  pace: 'balanced',
  bestFor: '',
  neighborhood: '',
  stopCount: 3,
}

const EMPTY_GROUP_DISCOUNT = {
  label: '',
  minGuests: '',
  percentOff: '',
}

const countCommaSeparatedItems = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean).length
const countLineItems = (value = '') => value.split('\n').map((item) => item.trim()).filter(Boolean).length

const getContextValue = (feature, prefix) => {
  const match = feature?.context?.find((item) => item.id?.startsWith(prefix))
  return match?.text || ''
}

const getSuggestedLocation = (feature, fallbackCountry) => ({
  address: feature?.place_name || feature?.text || '',
  city:
    getContextValue(feature, 'place.') ||
    getContextValue(feature, 'locality.') ||
    (feature?.place_type?.includes('place') ? feature.text : ''),
  country: getContextValue(feature, 'country.') || fallbackCountry,
  coordinatesHint: Array.isArray(feature?.center) && feature.center.length === 2
    ? { lng: feature.center[0], lat: feature.center[1] }
    : undefined,
})

const CreateExperiencePage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  // Guard: host must complete profile before listing
  useEffect(() => {
    if (!user?.bio?.trim() || !user?.phone?.trim()) {
      toast.error('Please complete your host profile before creating an experience.')
      navigate('/host/profile', { replace: true })
    }
  }, [user, navigate])

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    price:       '',
    duration:    '',
    tags:        '',
    includes:    '',
    notIncluded: '',
    detailsSections: {
      whatToExpect: '',
      meetingAndPickup: '',
      accessibility: '',
      additionalInformation: '',
      cancellationPolicy: '',
      help: '',
    },
    experiencePathways: [],
    groupSize:   { min: 1, max: 10 },
    bookingSettings: {
      minAdvanceHours: 6,
      maxAdvanceDays: 180,
      allowSplitPayments: false,
      splitPaymentDepositPercent: 30,
      allowGroupPricing: false,
      allowCollaborativeBookings: false,
      groupDiscounts: [],
    },
    rewards: {
      pointsPerCheckIn: 50,
      badgeLabel: '',
      bonusTip: '',
    },
    location: { address: '', city: '', country: 'Pakistan' },
    availability: [],
    availabilitySettings: {
      syncMode: 'manual',
      timezone: 'Asia/Karachi',
      instantConfirmation: true,
    },
    itinerary: [],
    photos:      [],
  })

  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState([])
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  // New availability slot
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '', slots: 10 })
  const [itineraryDraft, setItineraryDraft] = useState(EMPTY_ITINERARY_STEP)
  const [pathwayDraft, setPathwayDraft] = useState(EMPTY_PATHWAY)
  const [groupDiscountDraft, setGroupDiscountDraft] = useState(EMPTY_GROUP_DISCOUNT)

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))
  const setLoc = (field, val) => setForm((f) => ({ ...f, location: { ...f.location, [field]: val } }))
  const setDetailSection = (field, value) => setForm((f) => ({
    ...f,
    detailsSections: {
      ...f.detailsSections,
      [field]: value,
    },
  }))
  const setBookingSetting = (field, value) => setForm((f) => ({
    ...f,
    bookingSettings: {
      ...f.bookingSettings,
      [field]: value,
    },
  }))
  const setRewards = (field, value) => setForm((f) => ({
    ...f,
    rewards: {
      ...f.rewards,
      [field]: value,
    },
  }))
  const setAvailabilitySetting = (field, value) => setForm((f) => ({
    ...f,
    availabilitySettings: {
      ...f.availabilitySettings,
      [field]: value,
    },
  }))
  const tagCount = countCommaSeparatedItems(form.tags)
  const includesCount = countLineItems(form.includes)
  const notIncludedCount = countLineItems(form.notIncluded)
  const validateStep = (targetStep = step) => {
    const nextErrors = {}

    if (targetStep === 0 || targetStep === 5) {
      if (!form.title.trim()) nextErrors.title = 'Title is required.'
      if (!form.description.trim()) nextErrors.description = 'Description is required.'
      if (!form.category) nextErrors.category = 'Category is required.'
      if (form.title.length > MAX_TITLE_LENGTH) nextErrors.title = `Title can be up to ${MAX_TITLE_LENGTH} characters.`
      if (form.description.length > MAX_DESCRIPTION_LENGTH) nextErrors.description = `Description can be up to ${MAX_DESCRIPTION_LENGTH} characters.`
      if (tagCount > MAX_TAGS) nextErrors.tags = `Use up to ${MAX_TAGS} tags.`
    }

    if (targetStep === 1 || targetStep === 5) {
      if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Price must be greater than 0.'
      if (!form.duration || Number(form.duration) < 15) nextErrors.duration = 'Duration must be at least 15 minutes.'
      if (includesCount > MAX_INCLUDES) nextErrors.includes = `Use up to ${MAX_INCLUDES} included items.`
      if (notIncludedCount > MAX_NOT_INCLUDED) nextErrors.notIncluded = `Use up to ${MAX_NOT_INCLUDED} not included items.`
      DETAIL_SECTION_FIELDS.forEach(({ key, label }) => {
        if (form.detailsSections[key].length > MAX_DETAIL_SECTION_LENGTH) {
          nextErrors[key] = `${label} can be up to ${MAX_DETAIL_SECTION_LENGTH} characters.`
        }
      })
    }

    if (targetStep === 2 || targetStep === 5) {
      if (!(form.location.address || '').trim()) nextErrors.address = 'Meeting point address is required.'
      if (!(form.location.city || '').trim()) nextErrors.city = 'City is required.'
      if ((form.location.address || '').length > MAX_ADDRESS_LENGTH) nextErrors.address = `Address can be up to ${MAX_ADDRESS_LENGTH} characters.`
      if ((form.location.city || '').length > MAX_CITY_LENGTH) nextErrors.city = `City can be up to ${MAX_CITY_LENGTH} characters.`
      if ((form.location.country || '').length > MAX_COUNTRY_LENGTH) nextErrors.country = `Country can be up to ${MAX_COUNTRY_LENGTH} characters.`
    }

    if (targetStep === 3 || targetStep === 5) {
      if (form.availability.length === 0) nextErrors.availability = 'Add at least one availability slot.'
      if (form.availability.length > MAX_AVAILABILITY_SLOTS) nextErrors.availability = `Use up to ${MAX_AVAILABILITY_SLOTS} slots.`
    }

    if (targetStep === 4 || targetStep === 5) {
      if (form.itinerary.length > MAX_ITINERARY_STEPS) nextErrors.itinerary = `Use up to ${MAX_ITINERARY_STEPS} itinerary steps.`
      if (form.itinerary.some((stepItem) => !stepItem.title?.trim())) nextErrors.itinerary = 'Each itinerary step needs a title.'
    }

    if (targetStep === 5) {
      if (photoFiles.length < MIN_IMAGES) nextErrors.photos = `Please upload at least ${MIN_IMAGES} images.`
      if (photoFiles.length > MAX_IMAGES) nextErrors.photos = `Use up to ${MAX_IMAGES} images.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  // Address autocomplete using Mapbox Places API (if token configured)
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN
    if (!token) return
    if (!addressQuery || addressQuery.length < 3) {
      setAddressResults([])
      return
    }

    const controller = new AbortController()
    const fetchAddresses = async () => {
      try {
        setIsSearchingAddress(true)
        const resp = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json` +
          `?autocomplete=true&types=address,poi,place,locality,neighborhood&limit=5&access_token=${token}`,
          { signal: controller.signal }
        )
        const data = await resp.json()
        setAddressResults(data.features || [])
      } catch {
        // ignore network errors in dev
      } finally {
        setIsSearchingAddress(false)
      }
    }

    const timeoutId = setTimeout(fetchAddresses, 300)
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [addressQuery])

  const addSlot = () => {
    if (!newSlot.date || !newSlot.startTime) return toast.error('Fill in date and time')
    if (form.availability.length >= MAX_AVAILABILITY_SLOTS) {
      return toast.error(`You can add up to ${MAX_AVAILABILITY_SLOTS} availability slots`)
    }
    setForm((f) => ({ ...f, availability: [...f.availability, { ...newSlot }] }))
    setNewSlot({ date: '', startTime: '', slots: 10 })
    toast.success('Slot added!')
  }

  const removeSlot = (i) => setForm((f) => ({ ...f, availability: f.availability.filter((_, idx) => idx !== i) }))

  const addItineraryStep = () => {
    if (!itineraryDraft.title.trim()) {
      toast.error('Step title is required')
      return
    }

    if (form.itinerary.length >= MAX_ITINERARY_STEPS) {
      toast.error(`You can add up to ${MAX_ITINERARY_STEPS} itinerary steps`)
      return
    }

    setForm((f) => ({
      ...f,
      itinerary: [
        ...f.itinerary,
        {
          ...itineraryDraft,
          title: itineraryDraft.title.trim(),
          locationName: itineraryDraft.locationName.trim(),
          description: itineraryDraft.description.trim(),
          transitionNote: itineraryDraft.transitionNote.trim(),
          durationMinutes: Number(itineraryDraft.durationMinutes) || 0,
        },
      ],
    }))

    setItineraryDraft(EMPTY_ITINERARY_STEP)
  }

  const removeItineraryStep = (index) => {
    setForm((f) => ({ ...f, itinerary: f.itinerary.filter((_, idx) => idx !== index) }))
  }

  const addPathway = () => {
    if (!pathwayDraft.title.trim()) {
      toast.error('Journey title is required')
      return
    }

    setForm((f) => ({
      ...f,
      experiencePathways: [
        ...f.experiencePathways,
        {
          title: pathwayDraft.title.trim(),
          summary: pathwayDraft.summary.trim(),
          durationLabel: pathwayDraft.durationLabel.trim(),
          highlight: pathwayDraft.highlight.trim(),
          phase: pathwayDraft.phase,
          idealTime: pathwayDraft.idealTime,
          pace: pathwayDraft.pace,
          bestFor: pathwayDraft.bestFor.trim(),
          neighborhood: pathwayDraft.neighborhood.trim(),
          stopCount: Number(pathwayDraft.stopCount) || 3,
        },
      ].slice(0, 6),
    }))

    setPathwayDraft(EMPTY_PATHWAY)
  }

  const removePathway = (index) => {
    setForm((f) => ({ ...f, experiencePathways: f.experiencePathways.filter((_, idx) => idx !== index) }))
  }

  const [photoFiles, setPhotoFiles] = useState([])

  const photoPreviews = useMemo(
    () => photoFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photoFiles]
  )

  useEffect(() => {
    return () => {
      photoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [photoPreviews])

  const handlePhotoFiles = (event) => {
    const selected = Array.from(event.target.files || [])
    if (!selected.length) return

    const nextFiles = [...photoFiles, ...selected].slice(0, MAX_IMAGES)

    if (photoFiles.length + selected.length > MAX_IMAGES) {
      toast.error(`You can upload up to ${MAX_IMAGES} images`)
    }

    setPhotoFiles(nextFiles)
  }

  const removePhotoFile = (index) => {
    setPhotoFiles((files) => files.filter((_, idx) => idx !== index))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast.error('Please fix highlighted fields.')
      return
    }

    try {
      setLoading(true)

      const tagsArray      = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      const includesArray  = form.includes.split('\n').map((t) => t.trim()).filter(Boolean)
      const notIncludedArray = form.notIncluded.split('\n').map((t) => t.trim()).filter(Boolean)
      if (tagsArray.length > MAX_TAGS) return toast.error(`Use up to ${MAX_TAGS} tags`)
      if (includesArray.length > MAX_INCLUDES) return toast.error(`Use up to ${MAX_INCLUDES} included items`)
      if (notIncludedArray.length > MAX_NOT_INCLUDED) return toast.error(`Use up to ${MAX_NOT_INCLUDED} not included items`)
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
      fd.append('experiencePathways', JSON.stringify(form.experiencePathways))
      fd.append('bookingSettings', JSON.stringify(form.bookingSettings))
      fd.append('rewards', JSON.stringify(form.rewards))
      fd.append('availability', JSON.stringify(form.availability))
      fd.append('availabilitySettings', JSON.stringify(form.availabilitySettings))
      fd.append('itinerary', JSON.stringify(form.itinerary.map((item, index) => ({ ...item, stepNumber: index + 1 }))))
      fd.append('tags', JSON.stringify(tagsArray))
      fd.append('includes', JSON.stringify(includesArray))
      fd.append('notIncluded', JSON.stringify(notIncludedArray))
      fd.append('detailsSections', JSON.stringify(form.detailsSections))

      // Uploaded files
      photoFiles.forEach((file) => {
        fd.append('photos', file)
      })

      await createExperience(fd)
      toast.success('Experience created successfully')
      navigate('/host/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    if (step === 0) return form.title && form.description && form.category
    if (step === 1) {
      return (
        form.price &&
        form.duration &&
        includesCount <= MAX_INCLUDES &&
        notIncludedCount <= MAX_NOT_INCLUDED
      )
    }
    if (step === 2) return form.location.address?.trim() && form.location.city?.trim()
    if (step === 5) return photoFiles.length >= MIN_IMAGES
    return true
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <Link to="/host/dashboard" className="text-xs text-emerald-600 hover:underline">← Dashboard</Link>
          <h1 className="text-lg font-semibold text-gray-900 mt-1">Create New Experience</h1>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition
                  ${i === step ? 'bg-emerald-500 text-white'
                  : i < step   ? 'bg-green-100 text-green-700 cursor-pointer'
                  :               'bg-gray-100 text-gray-400 cursor-default'}`}
              >
                {i < step ? '✓' : i + 1} {s}
              </button>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-green-300' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4">
          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-gray-900">Basic Information</h2>
              <Input label="Experience Title *" error={errors.title} value={form.title} maxLength={MAX_TITLE_LENGTH} onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Old City Food Walking Tour" />
              <p className="-mt-2 text-right text-xs text-slate-400">{form.title.length}/{MAX_TITLE_LENGTH}</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Description *</label>
                <textarea rows={5} value={form.description} maxLength={MAX_DESCRIPTION_LENGTH} onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe what guests will experience, see, taste, or learn..."
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.description ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.description ? <p className="text-xs text-rose-600">{errors.description}</p> : null}
                <p className="text-right text-xs text-slate-400">{form.description.length}/{MAX_DESCRIPTION_LENGTH}</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Category *</label>
                <select value={form.category} onChange={(e) => set('category', e.target.value)}
                  className={`border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 ${errors.category ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {errors.category ? <p className="text-xs text-rose-600">{errors.category}</p> : null}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <Input error={errors.tags} value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="food, heritage, walking, beginner-friendly" />
                <p className="text-xs text-slate-400">{tagCount}/{MAX_TAGS} tags used.</p>
              </div>
            </div>
          )}

          {/* Step 1 — Details */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-gray-900">Experience Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Price (USD) *" error={errors.price} type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="25" />
                <Input label="Duration (minutes) *" error={errors.duration} type="number" value={form.duration} onChange={(e) => set('duration', e.target.value)} placeholder="120" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Min Group Size</label>
                  <input type="number" min={1} value={form.groupSize.min}
                    onChange={(e) => setForm((f) => ({ ...f, groupSize: { ...f.groupSize, min: Number(e.target.value) } }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Max Group Size</label>
                  <input type="number" min={1} value={form.groupSize.max}
                    onChange={(e) => setForm((f) => ({ ...f, groupSize: { ...f.groupSize, max: Number(e.target.value) } }))}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400"/>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">What's Included <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea rows={4} value={form.includes} onChange={(e) => set('includes', e.target.value)}
                  placeholder={"Food tastings at 5 local spots\nBottled water\nLocal guide"}
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.includes ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.includes ? <p className="text-xs text-rose-600">{errors.includes}</p> : null}
                <p className="text-xs text-slate-400">{includesCount}/{MAX_INCLUDES} included items used.</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">What's Not Included <span className="text-gray-400 font-normal">(one per line)</span></label>
                <textarea rows={4} value={form.notIncluded} onChange={(e) => set('notIncluded', e.target.value)}
                  placeholder={"Hotel pickup\nPersonal shopping\nExtra meals"}
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.notIncluded ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.notIncluded ? <p className="text-xs text-rose-600">{errors.notIncluded}</p> : null}
                <p className="text-xs text-slate-400">{notIncludedCount}/{MAX_NOT_INCLUDED} not included items used.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="text-base font-semibold text-slate-900">Optional detail sections</h3>
                <p className="mt-1 text-sm text-slate-500">These fields show on the experience page if you fill them in. Leave any box empty and it simply will not show.</p>
                <div className="mt-4 grid gap-4">
                  {DETAIL_SECTION_FIELDS.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">{field.label}</label>
                      <textarea
                        rows={4}
                        maxLength={MAX_DETAIL_SECTION_LENGTH}
                        value={form.detailsSections[field.key]}
                        onChange={(e) => setDetailSection(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors[field.key] ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}
                      />
                      {errors[field.key] ? <p className="text-xs text-rose-600">{errors[field.key]}</p> : null}
                      <p className="text-right text-xs text-slate-400">{form.detailsSections[field.key].length}/{MAX_DETAIL_SECTION_LENGTH}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <h3 className="text-base font-semibold text-slate-900">Booking rules</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="Minimum advance hours" type="number" value={form.bookingSettings.minAdvanceHours} onChange={(e) => setBookingSetting('minAdvanceHours', Number(e.target.value) || 0)} />
                  <Input label="Maximum advance days" type="number" value={form.bookingSettings.maxAdvanceDays} onChange={(e) => setBookingSetting('maxAdvanceDays', Number(e.target.value) || 1)} />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.bookingSettings.allowSplitPayments} onChange={(e) => setBookingSetting('allowSplitPayments', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Allow split payments
                  </label>
                  {form.bookingSettings.allowSplitPayments ? (
                    <Input label="Deposit percent" type="number" value={form.bookingSettings.splitPaymentDepositPercent} onChange={(e) => setBookingSetting('splitPaymentDepositPercent', Number(e.target.value) || 30)} />
                  ) : <div />}
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.bookingSettings.allowGroupPricing} onChange={(e) => setBookingSetting('allowGroupPricing', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Enable group pricing
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.bookingSettings.allowCollaborativeBookings} onChange={(e) => setBookingSetting('allowCollaborativeBookings', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Allow collaborative bookings
                  </label>
                </div>
                {form.bookingSettings.allowGroupPricing ? (
                <div className="mt-4 rounded-xl border border-white/80 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-800">Group discount tiers</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Input label="Tier label" value={groupDiscountDraft.label} onChange={(e) => setGroupDiscountDraft((prev) => ({ ...prev, label: e.target.value }))} placeholder="Friends bundle" />
                    <Input label="Min guests" type="number" value={groupDiscountDraft.minGuests} onChange={(e) => setGroupDiscountDraft((prev) => ({ ...prev, minGuests: e.target.value }))} placeholder="4" />
                    <Input label="Percent off" type="number" value={groupDiscountDraft.percentOff} onChange={(e) => setGroupDiscountDraft((prev) => ({ ...prev, percentOff: e.target.value }))} placeholder="10" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const label = groupDiscountDraft.label.trim()
                      const minGuests = Number(groupDiscountDraft.minGuests)
                      const percentOff = Number(groupDiscountDraft.percentOff)
                      if (!label || minGuests < 2 || percentOff < 1) {
                        toast.error('Add a valid tag')
                        return
                      }
                      setBookingSetting('groupDiscounts', [
                        ...form.bookingSettings.groupDiscounts,
                        { label, minGuests, percentOff },
                      ].slice(0, 6))
                      setGroupDiscountDraft(EMPTY_GROUP_DISCOUNT)
                    }}
                    className="mt-3 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700"
                  >
                    + Add group discount
                  </button>
                  {form.bookingSettings.groupDiscounts.length ? (
                    <div className="mt-3 space-y-2">
                      {form.bookingSettings.groupDiscounts.map((tier, index) => (
                        <div key={`${tier.label}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                          <span>{tier.label} · {tier.minGuests}+ guests · {tier.percentOff}% off</span>
                          <button type="button" onClick={() => setBookingSetting('groupDiscounts', form.bookingSettings.groupDiscounts.filter((_, idx) => idx !== index))} className="text-rose-600">Remove</button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Step 2 — Location */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">Meeting Point</h2>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-sm font-semibold text-gray-700">Meeting Point Address *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search address or enter manually..."
                    value={form.location.address}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLoc('address', val);
                      setAddressQuery(val); // Trigger Mapbox search
                    }}
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 transition-all ${
                      errors.address ? 'border-rose-300 bg-rose-50/10' : 'border-gray-200 shadow-sm'
                    }`}
                  />
                  {isSearchingAddress && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                {errors.address && <p className="text-xs text-rose-600">{errors.address}</p>}

                {/* Suggestions Dropdown */}
                {addressResults.length > 0 && (
                  <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 border border-gray-100 rounded-xl shadow-xl bg-white overflow-hidden max-h-60 overflow-y-auto">
                    <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">Suggestions</p>
                    {addressResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => {
                          const sug = getSuggestedLocation(result, form.location.country);
                          setLoc('address', sug.address);
                          setLoc('city', sug.city);
                          setLoc('country', sug.country);
                          if (sug.coordinatesHint) setLoc('coordinatesHint', sug.coordinatesHint);
                          setAddressResults([]);
                          setAddressQuery('');
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-emerald-50 transition border-b border-gray-50 last:border-0 group"
                      >
                        <div className="font-semibold text-slate-800 group-hover:text-emerald-700">{result.text}</div>
                        <div className="text-[11px] text-slate-400 truncate">{result.place_name}</div>
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-400">Search for a place or type your own address. Map location is optional.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="City *" error={errors.city} value={form.location.city} maxLength={MAX_CITY_LENGTH} onChange={(e) => setLoc('city', e.target.value)} placeholder="e.g. Lahore" />
                <Input label="Country" error={errors.country} value={form.location.country} maxLength={MAX_COUNTRY_LENGTH} onChange={(e) => setLoc('country', e.target.value)} />
              </div>

              {form.location.coordinatesHint && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] font-medium text-emerald-800">Coordinates captured for nearby discovery</p>
                  <button 
                    type="button" 
                    onClick={() => setLoc('coordinatesHint', undefined)}
                    className="ml-auto text-[10px] font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    Clear coordinates
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Availability */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Experience Availability</h2>
              <p className="text-sm text-gray-500">Add dates and times when you can host this experience. {form.availability.length}/{MAX_AVAILABILITY_SLOTS} slots used.</p>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3">Add New Slot</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Date</label>
                    <input type="date" value={newSlot.date} min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Start Time</label>
                    <input type="time" value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-600">Spots Available</label>
                    <input type="number" min={1} value={newSlot.slots}
                      onChange={(e) => setNewSlot({ ...newSlot, slots: Number(e.target.value) })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"/>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={addSlot}>+ Add Slot</Button>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">Scheduled Slots</p>
                {form.availability.length > 0 ? (
                  <div className="grid gap-2">
                    {form.availability.map((slot, i) => (
                      <div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{slot.date}</span>
                          <span className="text-gray-400 mx-2">·</span>
                          <span className="text-gray-600">{slot.startTime}</span>
                          <span className="text-gray-400 mx-2">·</span>
                          <span className="text-gray-600">{slot.slots} spots</span>
                        </div>
                        <button type="button" onClick={() => removeSlot(i)} className="text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 text-sm py-4">No slots added yet</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4 — Itinerary */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">{t("exp_itinerary")}</h2>
              <p className="text-sm text-gray-500">
                This step is optional. Add a traveler-facing timeline only if the experience has multiple moments or stops. {form.itinerary.length}/{MAX_ITINERARY_STEPS} steps used.
              </p>
              {errors.itinerary ? <p className="text-xs text-rose-600">{errors.itinerary}</p> : null}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">Add Step</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Step Title *"
                    value={itineraryDraft.title}
                    onChange={(e) => setItineraryDraft((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Arrival and host welcome"
                  />
                  <Input
                    label="Start Time"
                    type="time"
                    value={itineraryDraft.startTime}
                    onChange={(e) => setItineraryDraft((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    min={0}
                    value={itineraryDraft.durationMinutes}
                    onChange={(e) => setItineraryDraft((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 0 }))}
                  />
                  <Input
                    label="Location / Stop"
                    value={itineraryDraft.locationName}
                    onChange={(e) => setItineraryDraft((prev) => ({ ...prev, locationName: e.target.value }))}
                    placeholder="Delhi Gate"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Step Description</label>
                    <textarea
                      rows={3}
                      maxLength={MAX_ITINERARY_DESCRIPTION}
                      value={itineraryDraft.description}
                      onChange={(e) => setItineraryDraft((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="What happens during this step"
                      className="resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                    />
                    <p className="text-right text-xs text-slate-400">{itineraryDraft.description.length}/{MAX_ITINERARY_DESCRIPTION}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Transition To Next Step</label>
                    <textarea
                      rows={2}
                      maxLength={MAX_ITINERARY_TRANSITION}
                      value={itineraryDraft.transitionNote}
                      onChange={(e) => setItineraryDraft((prev) => ({ ...prev, transitionNote: e.target.value }))}
                      placeholder="Walk 8 minutes to the next stop"
                      className="resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                    />
                    <p className="text-right text-xs text-slate-400">{itineraryDraft.transitionNote.length}/{MAX_ITINERARY_TRANSITION}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <Button size="sm" variant="secondary" onClick={addItineraryStep}>+ Add Step</Button>
                </div>
              </div>

              {form.itinerary.length > 0 ? (
                <div className="space-y-2">
                  {form.itinerary.map((stepItem, index) => (
                    <div key={`${stepItem.title}-${index}`} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {index + 1}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{stepItem.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {[stepItem.startTime || 'Flexible', `${stepItem.durationMinutes || 0} min`, stepItem.locationName].filter(Boolean).join(' · ')}
                          </p>
                          {stepItem.description ? <p className="mt-1.5 text-sm text-slate-600">{stepItem.description}</p> : null}
                          {stepItem.transitionNote ? <p className="mt-1 text-xs text-emerald-700">Next: {stepItem.transitionNote}</p> : null}
                        </div>
                        <button type="button" className="text-lg leading-none text-red-400 hover:text-red-600" onClick={() => removeItineraryStep(index)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-3 text-center text-sm text-gray-400">No itinerary steps added yet. You can skip this if guests do not need a timeline.</p>
              )}

              {false && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                <h3 className="text-base font-semibold text-slate-900">Suggested journey pathways</h3>
                <p className="mt-1 text-sm text-slate-500">Recommend multi-experience routes guests can use to build a bigger day around this booking.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input label="Journey title" value={pathwayDraft.title} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Old City Morning Circuit" />
                  <Input label="Duration label" value={pathwayDraft.durationLabel} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, durationLabel: e.target.value }))} placeholder="3-4 hours" />
                  <Input label="Highlight" value={pathwayDraft.highlight} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, highlight: e.target.value }))} placeholder="Best for food lovers" />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Journey phase</label>
                    <select value={pathwayDraft.phase} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, phase: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="before">Before this experience</option>
                      <option value="anchor">Main anchor experience</option>
                      <option value="after">After this experience</option>
                      <option value="full-day">Full-day route</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Best time of day</label>
                    <select value={pathwayDraft.idealTime} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, idealTime: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="morning">{t("search_morning")}</option>
                      <option value="afternoon">{t("search_afternoon")}</option>
                      <option value="evening">{t("search_evening")}</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Pace</label>
                    <select value={pathwayDraft.pace} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, pace: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="easy">Easy</option>
                      <option value="balanced">Balanced</option>
                      <option value="immersive">Immersive</option>
                    </select>
                  </div>
                  <Input label="Best for" value={pathwayDraft.bestFor} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, bestFor: e.target.value }))} placeholder="Couples, first-time visitors, friend groups" />
                  <Input label="Neighborhood / area" value={pathwayDraft.neighborhood} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, neighborhood: e.target.value }))} placeholder="Walled City, Downtown, waterfront" />
                  <Input label="Suggested stop count" type="number" min={1} max={12} value={pathwayDraft.stopCount} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, stopCount: Number(e.target.value) || 3 }))} placeholder="3" />
                  <textarea rows={3} value={pathwayDraft.summary} onChange={(e) => setPathwayDraft((prev) => ({ ...prev, summary: e.target.value }))} placeholder="Start here, then continue to the bazaar and rooftop tea stop." className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                </div>
                <Button size="sm" variant="secondary" onClick={addPathway}>+ Add pathway</Button>
                {form.experiencePathways.length ? (
                  <div className="mt-3 space-y-2">
                    {form.experiencePathways.map((pathway, index) => (
                      <div key={`${pathway.title}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-3 text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{pathway.title}</p>
                          <p className="text-slate-500">{[pathway.durationLabel, pathway.highlight].filter(Boolean).join(' · ')}</p>
                        </div>
                        <button type="button" onClick={() => removePathway(index)} className="text-rose-600">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              )}
            </div>
          )}

          {/* Step 5 — Photos */}
          {step === 5 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Photos</h2>
              <p className="text-sm text-gray-500">Upload between {MIN_IMAGES} and {MAX_IMAGES} images. The first uploaded image will be used as the thumbnail. {photoFiles.length}/{MAX_IMAGES} selected.</p>
              {errors.photos ? <p className="text-xs text-rose-600">{errors.photos}</p> : null}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Upload Photos *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoFiles}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-700"
                />
              </div>

              {/* Photo preview */}
              {photoFiles.length > 0 ? (
                <div className="flex gap-3 flex-wrap">
                  {photoPreviews.map(({ file, url }, i) => (
                    <div key={`${file.name}-${i}`} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                      <img src={url} alt={file.name} className="w-full h-full object-cover" />
                      {i === 0 ? (
                        <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">Thumbnail</span>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => removePhotoFile(i)}
                        className="absolute right-1.5 top-1.5 h-5 w-5 rounded-full bg-white/90 text-xs font-bold text-slate-700"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                Upload quality images for better results. Required: minimum {MIN_IMAGES} images, maximum {MAX_IMAGES} images.
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>← Back</Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => {
                  if (!validateStep(step)) {
                    toast.error('Please fix highlighted fields.')
                    return
                  }
                  setStep((s) => s + 1)
                }}
                disabled={!canNext()}
              >
                Next →
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>Publish Experience</Button>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default CreateExperiencePage
