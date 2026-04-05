import useTranslation from '../../hooks/useTranslation.js';
import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
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

const MAX_TITLE_LENGTH = 80
const MAX_DESCRIPTION_LENGTH = 1200
const MAX_TAGS = 8
const MAX_INCLUDES = 8
const MAX_NOT_INCLUDED = 8
const MAX_ADDRESS_LENGTH = 180
const MAX_CITY_LENGTH = 60
const MAX_COUNTRY_LENGTH = 60
const MAX_AVAILABILITY_SLOTS = 20
const MAX_IMAGES = 10
const MIN_IMAGES = 1
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

const EMPTY_TRANSLATION = {
  languageCode: '',
  languageLabel: '',
  title: '',
  description: '',
  whatToExpect: '',
  meetingAndPickup: '',
}

const EMPTY_GROUP_DISCOUNT = {
  label: '',
  minGuests: '',
  percentOff: '',
}

const countCommaSeparatedItems = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean).length
const countLineItems = (value = '') => value.split('\n').map((item) => item.trim()).filter(Boolean).length

const EditExperiencePage = () => {
  const { t } = useTranslation();

  const { id }      = useParams()
  const queryClient = useQueryClient()
  const [tab,       setTab]    = useState('details')
  const [loading,   setLoading]= useState(false)
  const [newSlot,   setNewSlot]= useState({ date: '', startTime: '', slots: 10 })
  const [errors,    setErrors] = useState({})
  const [existingPhotos, setExistingPhotos] = useState([])
  const [newPhotoFiles, setNewPhotoFiles] = useState([])
  const [newItineraryStep, setNewItineraryStep] = useState(EMPTY_ITINERARY_STEP)
  const [newPathway, setNewPathway] = useState(EMPTY_PATHWAY)
  const [newTranslation, setNewTranslation] = useState(EMPTY_TRANSLATION)
  const [groupDiscountDraft, setGroupDiscountDraft] = useState(EMPTY_GROUP_DISCOUNT)

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
      notIncluded: exp.notIncluded?.join('\n') || '',
      detailsSections: {
        whatToExpect: exp.detailsSections?.whatToExpect || '',
        meetingAndPickup: exp.detailsSections?.meetingAndPickup || '',
        accessibility: exp.detailsSections?.accessibility || '',
        additionalInformation: exp.detailsSections?.additionalInformation || '',
        cancellationPolicy: exp.detailsSections?.cancellationPolicy || '',
        help: exp.detailsSections?.help || '',
      },
      storytellingProfile: {
        hostStory: exp.storytellingProfile?.hostStory || '',
        localConnection: exp.storytellingProfile?.localConnection || '',
        insiderTips: (exp.storytellingProfile?.insiderTips || []).join('\n'),
        photoMoments: (exp.storytellingProfile?.photoMoments || []).join('\n'),
      },
      experiencePathways: Array.isArray(exp.experiencePathways) ? exp.experiencePathways : [],
      languagesSupported: (exp.languagesSupported || []).join(', '),
      translations: Array.isArray(exp.translations) ? exp.translations : [],
      location:    exp.location || { address: '', city: '', country: '' },
      groupSize:   exp.groupSize || { min: 1, max: 10 },
      bookingSettings: exp.bookingSettings || {
        minAdvanceHours: 6,
        maxAdvanceDays: 180,
        allowSplitPayments: false,
        splitPaymentDepositPercent: 30,
        allowGroupPricing: false,
        allowCollaborativeBookings: true,
        groupDiscounts: [],
      },
      microExperience: exp.microExperience || { isEnabled: false, label: '', teaser: '' },
      rewards: exp.rewards || { pointsPerCheckIn: 50, badgeLabel: '', bonusTip: '' },
      itinerary:   Array.isArray(exp.itinerary) ? exp.itinerary : [],
      availabilitySettings: exp.availabilitySettings || { syncMode: 'manual', timezone: 'Asia/Karachi', instantConfirmation: true },
      isActive:    exp.isActive !== false,
    })
    setExistingPhotos(exp.photos || [])
    setNewPhotoFiles([])
    setErrors({})
  }, [exp])

  const set    = (field, val) => setForm((f) => ({ ...f, [field]: val }))
  const setLoc = (field, val) => setForm((f) => ({ ...f, location: { ...f.location, [field]: val } }))
  const setDetailSection = (field, value) => setForm((f) => ({
    ...f,
    detailsSections: {
      ...f.detailsSections,
      [field]: value,
    },
  }))
  const setStory = (field, value) => setForm((f) => ({
    ...f,
    storytellingProfile: {
      ...f.storytellingProfile,
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
  const setMicroExperience = (field, value) => setForm((f) => ({
    ...f,
    microExperience: {
      ...f.microExperience,
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
  const tagCount = countCommaSeparatedItems(form?.tags)
  const includesCount = countLineItems(form?.includes)
  const notIncludedCount = countLineItems(form?.notIncluded)
  const totalPhotoCount = existingPhotos.length + newPhotoFiles.length

  const newPhotoPreviews = useMemo(
    () => newPhotoFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [newPhotoFiles]
  )

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [newPhotoPreviews])

  const validate = () => {
    const nextErrors = {}
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const includes = form.includes.split('\n').map((t) => t.trim()).filter(Boolean)
    const notIncluded = form.notIncluded.split('\n').map((t) => t.trim()).filter(Boolean)

    if (!form.title.trim()) nextErrors.title = 'Title is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    if (!form.category) nextErrors.category = 'Category is required.'
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Price must be greater than 0.'
    if (!form.duration || Number(form.duration) < 15) nextErrors.duration = 'Duration must be at least 15 minutes.'
    if (!(form.location?.city || '').trim()) nextErrors.city = 'City is required.'
    if (!(form.location?.address || '').trim()) nextErrors.address = 'Meeting point address is required.'
    if (form.title.length > MAX_TITLE_LENGTH) nextErrors.title = `Title can be up to ${MAX_TITLE_LENGTH} characters.`
    if (form.description.length > MAX_DESCRIPTION_LENGTH) nextErrors.description = `Description can be up to ${MAX_DESCRIPTION_LENGTH} characters.`
    if ((form.location.address || '').length > MAX_ADDRESS_LENGTH) nextErrors.address = `Address can be up to ${MAX_ADDRESS_LENGTH} characters.`
    if ((form.location.city || '').length > MAX_CITY_LENGTH) nextErrors.city = `City can be up to ${MAX_CITY_LENGTH} characters.`
    if ((form.location.country || '').length > MAX_COUNTRY_LENGTH) nextErrors.country = `Country can be up to ${MAX_COUNTRY_LENGTH} characters.`
    if (tags.length > MAX_TAGS) nextErrors.tags = `Use up to ${MAX_TAGS} tags.`
    if (includes.length > MAX_INCLUDES) nextErrors.includes = `Use up to ${MAX_INCLUDES} included items.`
    if (notIncluded.length > MAX_NOT_INCLUDED) nextErrors.notIncluded = `Use up to ${MAX_NOT_INCLUDED} not included items.`
    DETAIL_SECTION_FIELDS.forEach(({ key, label }) => {
      if (!form.detailsSections?.[key]?.trim()) nextErrors[key] = `${label} is required.`
      else if (form.detailsSections[key].length > MAX_DETAIL_SECTION_LENGTH) nextErrors[key] = `${label} can be up to ${MAX_DETAIL_SECTION_LENGTH} characters.`
    })
    if ((form.itinerary || []).length === 0) nextErrors.itinerary = 'Add at least one itinerary step.'
    if ((form.itinerary || []).length > MAX_ITINERARY_STEPS) nextErrors.itinerary = `Use up to ${MAX_ITINERARY_STEPS} itinerary steps.`
    if ((form.itinerary || []).some((item) => !item?.title?.trim())) nextErrors.itinerary = 'Each itinerary step needs a title.'
    if (totalPhotoCount < MIN_IMAGES) nextErrors.photos = `At least ${MIN_IMAGES} photo is required.`
    if (totalPhotoCount > MAX_IMAGES) nextErrors.photos = `Use up to ${MAX_IMAGES} photos.`

    setErrors(nextErrors)
    return { isValid: Object.keys(nextErrors).length === 0, tags, includes, notIncluded }
  }

  const handlePhotoFiles = (event) => {
    const selected = Array.from(event.target.files || [])
    if (!selected.length) return

    const availableSlots = Math.max(0, MAX_IMAGES - existingPhotos.length - newPhotoFiles.length)
    const toAdd = selected.slice(0, availableSlots)
    if (toAdd.length < selected.length) {
      toast.error(`You can upload up to ${MAX_IMAGES} photos in total`)
    }

    setNewPhotoFiles((files) => [...files, ...toAdd])
    setErrors((prev) => {
      const { photos: _photos, ...rest } = prev
      return rest
    })
  }

  const removeExistingPhoto = (index) => {
    setExistingPhotos((photos) => photos.filter((_, idx) => idx !== index))
  }

  const removeNewPhoto = (index) => {
    setNewPhotoFiles((files) => files.filter((_, idx) => idx !== index))
  }

  const addItineraryStep = () => {
    if (!newItineraryStep.title.trim()) {
      toast.error('Step title is required')
      return
    }

    if ((form.itinerary || []).length >= MAX_ITINERARY_STEPS) {
      toast.error(`You can add up to ${MAX_ITINERARY_STEPS} itinerary steps`)
      return
    }

    setForm((prev) => ({
      ...prev,
      itinerary: [
        ...(prev.itinerary || []),
        {
          ...newItineraryStep,
          title: newItineraryStep.title.trim(),
          locationName: newItineraryStep.locationName.trim(),
          description: newItineraryStep.description.trim(),
          transitionNote: newItineraryStep.transitionNote.trim(),
          durationMinutes: Number(newItineraryStep.durationMinutes) || 0,
        },
      ],
    }))
    setNewItineraryStep(EMPTY_ITINERARY_STEP)
  }

  const removeItineraryStep = (index) => {
    setForm((prev) => ({
      ...prev,
      itinerary: (prev.itinerary || []).filter((_, idx) => idx !== index),
    }))
  }

  const addPathway = () => {
    if (!newPathway.title.trim()) {
      toast.error('Journey title is required')
      return
    }

    setForm((prev) => ({
      ...prev,
      experiencePathways: [...(prev.experiencePathways || []), {
        title: newPathway.title.trim(),
        summary: newPathway.summary.trim(),
        durationLabel: newPathway.durationLabel.trim(),
        highlight: newPathway.highlight.trim(),
        phase: newPathway.phase,
        idealTime: newPathway.idealTime,
        pace: newPathway.pace,
        bestFor: newPathway.bestFor.trim(),
        neighborhood: newPathway.neighborhood.trim(),
        stopCount: Number(newPathway.stopCount) || 3,
      }].slice(0, 6),
    }))
    setNewPathway(EMPTY_PATHWAY)
  }

  const addTranslation = () => {
    if (!newTranslation.languageCode.trim() || !newTranslation.languageLabel.trim()) {
      toast.error('Language code and label are required')
      return
    }

    setForm((prev) => ({
      ...prev,
      translations: [...(prev.translations || []), {
        languageCode: newTranslation.languageCode.trim().toLowerCase(),
        languageLabel: newTranslation.languageLabel.trim(),
        title: newTranslation.title.trim(),
        description: newTranslation.description.trim(),
        whatToExpect: newTranslation.whatToExpect.trim(),
        meetingAndPickup: newTranslation.meetingAndPickup.trim(),
      }].slice(0, 8),
    }))
    setNewTranslation(EMPTY_TRANSLATION)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { isValid, tags, includes, notIncluded } = validate()
      if (!isValid) {
        toast.error('Please fix highlighted fields.')
        return
      }

      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('description', form.description.trim())
      fd.append('category', form.category)
      fd.append('price', String(Number(form.price)))
      fd.append('duration', String(Number(form.duration)))
      fd.append('location', JSON.stringify(form.location))
      fd.append('groupSize', JSON.stringify(form.groupSize))
      fd.append('storytellingProfile', JSON.stringify({
        hostStory: form.storytellingProfile.hostStory,
        localConnection: form.storytellingProfile.localConnection,
        insiderTips: form.storytellingProfile.insiderTips.split('\n').map((item) => item.trim()).filter(Boolean),
        photoMoments: form.storytellingProfile.photoMoments.split('\n').map((item) => item.trim()).filter(Boolean),
      }))
      fd.append('experiencePathways', JSON.stringify(form.experiencePathways || []))
      fd.append('languagesSupported', JSON.stringify((form.languagesSupported || '').split(',').map((item) => item.trim()).filter(Boolean)))
      fd.append('translations', JSON.stringify(form.translations || []))
      fd.append('bookingSettings', JSON.stringify(form.bookingSettings))
      fd.append('microExperience', JSON.stringify(form.microExperience))
      fd.append('rewards', JSON.stringify(form.rewards))
      fd.append('tags', JSON.stringify(tags))
      fd.append('includes', JSON.stringify(includes))
      fd.append('notIncluded', JSON.stringify(notIncluded))
      fd.append('detailsSections', JSON.stringify(form.detailsSections))
      fd.append('itinerary', JSON.stringify((form.itinerary || []).map((item, index) => ({ ...item, stepNumber: index + 1 }))))
      fd.append('availabilitySettings', JSON.stringify(form.availabilitySettings))
      fd.append('photos', JSON.stringify(existingPhotos))
      fd.append('isActive', String(form.isActive))
      newPhotoFiles.forEach((file) => fd.append('photos', file))

      const payload = fd
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
    if ((exp.availability?.length || 0) >= MAX_AVAILABILITY_SLOTS) {
      return toast.error(`You can add up to ${MAX_AVAILABILITY_SLOTS} availability slots`)
    }
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
    <div className="min-h-screen flex flex-col"><Spinner size="lg" className="flex-1"/></div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link to="/host/dashboard" className="text-sm text-emerald-500 hover:underline">← Dashboard</Link>
            <h1 className="text-xl font-semibold text-gray-900 mt-1">Edit Experience</h1>
            <p className="text-gray-500 text-sm truncate max-w-sm">{exp.title}</p>
          </div>
          <div className="flex gap-2">
            <Link to={`/experiences/${id}`} target="_blank"
              className="text-sm border border-gray-200 px-4 py-2 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition">
              Preview
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['details', 'location', 'availability', 'itinerary', 'photos'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition
                ${tab === t ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >{t}</button>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6">

          {/* Details tab */}
          {tab === 'details' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Experience Details</h2>
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
              <Input label="Title" maxLength={MAX_TITLE_LENGTH} error={errors.title} value={form.title} onChange={(e) => set('title', e.target.value)} />
              <p className="-mt-2 text-right text-xs text-slate-400">{form.title.length}/{MAX_TITLE_LENGTH}</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea rows={5} maxLength={MAX_DESCRIPTION_LENGTH} value={form.description} onChange={(e) => set('description', e.target.value)}
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.description ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.description ? <p className="text-xs text-rose-600">{errors.description}</p> : null}
                <p className="text-right text-xs text-slate-400">{form.description.length}/{MAX_DESCRIPTION_LENGTH}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">{t("search_category")}</label>
                  <select value={form.category} onChange={(e) => set('category', e.target.value)}
                    className={`border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 ${errors.category ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {errors.category ? <p className="text-xs text-rose-600">{errors.category}</p> : null}
                </div>
                <Input label="Price (USD)" type="number" error={errors.price} value={form.price} onChange={(e) => set('price', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Duration (minutes)" type="number" error={errors.duration} value={form.duration} onChange={(e) => set('duration', e.target.value)} />
                <div/>
              </div>
              <Input label="Tags (comma separated)" error={errors.tags} value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="food, heritage, walking" />
              <p className="-mt-2 text-xs text-slate-400">{tagCount}/{MAX_TAGS} tags used.</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">What's Included (one per line)</label>
                <textarea rows={4} value={form.includes} onChange={(e) => set('includes', e.target.value)}
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.includes ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.includes ? <p className="text-xs text-rose-600">{errors.includes}</p> : null}
                <p className="text-xs text-slate-400">{includesCount}/{MAX_INCLUDES} included items used.</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">What's Not Included (one per line)</label>
                <textarea rows={4} value={form.notIncluded} onChange={(e) => set('notIncluded', e.target.value)}
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.notIncluded ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.notIncluded ? <p className="text-xs text-rose-600">{errors.notIncluded}</p> : null}
                <p className="text-xs text-slate-400">{notIncludedCount}/{MAX_NOT_INCLUDED} not included items used.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <h3 className="text-base font-semibold text-slate-900">Details tab answers</h3>
                <p className="mt-1 text-sm text-slate-500">These answers show on the experience detail page as accordion sections.</p>
                <div className="mt-4 grid gap-4">
                  {DETAIL_SECTION_FIELDS.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">{field.label} *</label>
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

              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                <h3 className="text-base font-semibold text-slate-900">Storytelling profile</h3>
                <div className="mt-4 grid gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Host story</label>
                    <textarea rows={4} value={form.storytellingProfile.hostStory} onChange={(e) => setStory('hostStory', e.target.value)} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                  </div>
                  <Input label="Local connection" value={form.storytellingProfile.localConnection} onChange={(e) => setStory('localConnection', e.target.value)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Insider tips</label>
                      <textarea rows={4} value={form.storytellingProfile.insiderTips} onChange={(e) => setStory('insiderTips', e.target.value)} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-semibold text-gray-700">Photo moments</label>
                      <textarea rows={4} value={form.storytellingProfile.photoMoments} onChange={(e) => setStory('photoMoments', e.target.value)} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                <h3 className="text-base font-semibold text-slate-900">Booking flexibility, micro-format, and languages</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input label="Min advance hours" type="number" value={form.bookingSettings.minAdvanceHours} onChange={(e) => setBookingSetting('minAdvanceHours', Number(e.target.value) || 0)} />
                  <Input label="Max advance days" type="number" value={form.bookingSettings.maxAdvanceDays} onChange={(e) => setBookingSetting('maxAdvanceDays', Number(e.target.value) || 1)} />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.bookingSettings.allowSplitPayments} onChange={(e) => setBookingSetting('allowSplitPayments', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Allow split payments
                  </label>
                  <Input label="Deposit percent" type="number" value={form.bookingSettings.splitPaymentDepositPercent} onChange={(e) => setBookingSetting('splitPaymentDepositPercent', Number(e.target.value) || 30)} />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.bookingSettings.allowGroupPricing} onChange={(e) => setBookingSetting('allowGroupPricing', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Enable group pricing
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.bookingSettings.allowCollaborativeBookings} onChange={(e) => setBookingSetting('allowCollaborativeBookings', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Enable collaborative bookings
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.microExperience.isEnabled} onChange={(e) => setMicroExperience('isEnabled', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Micro-experience
                  </label>
                  <Input label="Micro label" value={form.microExperience.label} onChange={(e) => setMicroExperience('label', e.target.value)} placeholder="30-min tasting" />
                  <Input label="Languages supported" value={form.languagesSupported} onChange={(e) => set('languagesSupported', e.target.value)} placeholder="English, Urdu, French" />
                  <Input label="Reward badge label" value={form.rewards.badgeLabel} onChange={(e) => setRewards('badgeLabel', e.target.value)} placeholder="Neighborhood Insider" />
                </div>
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
                        toast.error('Add a valid discount label, minimum guests, and percent off')
                        return
                      }
                      setBookingSetting('groupDiscounts', [
                        ...(form.bookingSettings.groupDiscounts || []),
                        { label, minGuests, percentOff },
                      ].slice(0, 6))
                      setGroupDiscountDraft(EMPTY_GROUP_DISCOUNT)
                    }}
                    className="mt-3 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700"
                  >
                    + Add group discount
                  </button>
                  {(form.bookingSettings.groupDiscounts || []).length ? (
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
                <div className="mt-4 flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-700">Micro teaser</label>
                  <textarea rows={2} value={form.microExperience.teaser} onChange={(e) => setMicroExperience('teaser', e.target.value)} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                </div>
              </div>
            </div>
          )}

          {/* Location tab */}
          {tab === 'location' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Location</h2>
              <Input label="City" maxLength={MAX_CITY_LENGTH} error={errors.city} value={form.location.city} onChange={(e) => setLoc('city', e.target.value)} />
              <p className="-mt-2 text-right text-xs text-slate-400">{(form.location.city || '').length}/{MAX_CITY_LENGTH}</p>
              <Input label="Country" maxLength={MAX_COUNTRY_LENGTH} error={errors.country} value={form.location.country} onChange={(e) => setLoc('country', e.target.value)} />
              <p className="-mt-2 text-right text-xs text-slate-400">{(form.location.country || '').length}/{MAX_COUNTRY_LENGTH}</p>
              <Input label="Meeting Point Address" maxLength={MAX_ADDRESS_LENGTH} error={errors.address} value={form.location.address} onChange={(e) => setLoc('address', e.target.value)} />
              <p className="-mt-2 text-right text-xs text-slate-400">{(form.location.address || '').length}/{MAX_ADDRESS_LENGTH}</p>
            </div>
          )}

          {/* Availability tab */}
          {tab === 'availability' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Manage Availability</h2>
              <p className="text-sm text-gray-500">Standard limit: {(exp.availability?.length || 0)}/{MAX_AVAILABILITY_SLOTS} slots used.</p>

              {/* Add new slot */}
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
                    <label className="text-xs font-semibold text-gray-600">Max Slots</label>
                    <input type="number" min={1} value={newSlot.slots}
                      onChange={(e) => setNewSlot({ ...newSlot, slots: Number(e.target.value) })}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-400"/>
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

              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
                <h3 className="text-base font-semibold text-slate-900">Sync and rewards</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Sync mode</label>
                    <select value={form.availabilitySettings.syncMode} onChange={(e) => setAvailabilitySetting('syncMode', e.target.value)} className="border rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="manual">Manual</option>
                      <option value="calendar">Calendar sync</option>
                      <option value="api">API sync</option>
                    </select>
                  </div>
                  <Input label="Timezone" value={form.availabilitySettings.timezone} onChange={(e) => setAvailabilitySetting('timezone', e.target.value)} />
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.availabilitySettings.instantConfirmation} onChange={(e) => setAvailabilitySetting('instantConfirmation', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                    Instant confirmation
                  </label>
                  <Input label="Points per check-in" type="number" value={form.rewards.pointsPerCheckIn} onChange={(e) => setRewards('pointsPerCheckIn', Number(e.target.value) || 0)} />
                  <Input label="Bonus tip" value={form.rewards.bonusTip} onChange={(e) => setRewards('bonusTip', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Itinerary tab */}
          {tab === 'itinerary' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Itinerary Steps</h2>
              <p className="text-sm text-gray-500">Standard limit: {(form.itinerary || []).length}/{MAX_ITINERARY_STEPS} steps used.</p>
              {errors.itinerary ? <p className="text-xs text-rose-600">{errors.itinerary}</p> : null}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-700">Add New Step</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Step Title *"
                    value={newItineraryStep.title}
                    onChange={(e) => setNewItineraryStep((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Host welcome"
                  />
                  <Input
                    label="Start Time"
                    type="time"
                    value={newItineraryStep.startTime}
                    onChange={(e) => setNewItineraryStep((prev) => ({ ...prev, startTime: e.target.value }))}
                  />
                  <Input
                    label="Duration (minutes)"
                    type="number"
                    min={0}
                    value={newItineraryStep.durationMinutes}
                    onChange={(e) => setNewItineraryStep((prev) => ({ ...prev, durationMinutes: Number(e.target.value) || 0 }))}
                  />
                  <Input
                    label="Location / Stop"
                    value={newItineraryStep.locationName}
                    onChange={(e) => setNewItineraryStep((prev) => ({ ...prev, locationName: e.target.value }))}
                    placeholder="Main courtyard"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Step Description</label>
                    <textarea
                      rows={3}
                      maxLength={MAX_ITINERARY_DESCRIPTION}
                      value={newItineraryStep.description}
                      onChange={(e) => setNewItineraryStep((prev) => ({ ...prev, description: e.target.value }))}
                      className="resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                      placeholder="What guests do in this step"
                    />
                    <p className="text-right text-xs text-slate-400">{newItineraryStep.description.length}/{MAX_ITINERARY_DESCRIPTION}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Transition To Next Step</label>
                    <textarea
                      rows={2}
                      maxLength={MAX_ITINERARY_TRANSITION}
                      value={newItineraryStep.transitionNote}
                      onChange={(e) => setNewItineraryStep((prev) => ({ ...prev, transitionNote: e.target.value }))}
                      className="resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-emerald-400"
                      placeholder="Walk for 5 minutes to the next stop"
                    />
                    <p className="text-right text-xs text-slate-400">{newItineraryStep.transitionNote.length}/{MAX_ITINERARY_TRANSITION}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <Button size="sm" variant="secondary" onClick={addItineraryStep}>+ Add Step</Button>
                </div>
              </div>

              {(form.itinerary || []).length ? (
                <div className="space-y-2">
                  {(form.itinerary || []).map((stepItem, index) => (
                    <div key={`${stepItem.title || 'step'}-${index}`} className="rounded-xl border border-gray-100 bg-white px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Step {index + 1}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">{stepItem.title || 'Untitled step'}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {[stepItem.startTime || 'Flexible', `${Number(stepItem.durationMinutes) || 0} min`, stepItem.locationName].filter(Boolean).join(' · ')}
                          </p>
                          {stepItem.description ? <p className="mt-1.5 text-sm text-slate-600">{stepItem.description}</p> : null}
                          {stepItem.transitionNote ? <p className="mt-1 text-xs text-emerald-700">Next: {stepItem.transitionNote}</p> : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItineraryStep(index)}
                          className="text-lg leading-none text-red-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-3 text-center text-sm text-gray-400">No itinerary steps yet.</p>
              )}

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                <h3 className="text-base font-semibold text-slate-900">Suggested pathways</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input label="Journey title" value={newPathway.title} onChange={(e) => setNewPathway((prev) => ({ ...prev, title: e.target.value }))} />
                  <Input label="Duration label" value={newPathway.durationLabel} onChange={(e) => setNewPathway((prev) => ({ ...prev, durationLabel: e.target.value }))} />
                  <Input label="Highlight" value={newPathway.highlight} onChange={(e) => setNewPathway((prev) => ({ ...prev, highlight: e.target.value }))} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Journey phase</label>
                    <select value={newPathway.phase} onChange={(e) => setNewPathway((prev) => ({ ...prev, phase: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="before">Before this experience</option>
                      <option value="anchor">Main anchor experience</option>
                      <option value="after">After this experience</option>
                      <option value="full-day">Full-day route</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Best time of day</label>
                    <select value={newPathway.idealTime} onChange={(e) => setNewPathway((prev) => ({ ...prev, idealTime: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="morning">{t("search_morning")}</option>
                      <option value="afternoon">{t("search_afternoon")}</option>
                      <option value="evening">{t("search_evening")}</option>
                      <option value="anytime">Anytime</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-700">Pace</label>
                    <select value={newPathway.pace} onChange={(e) => setNewPathway((prev) => ({ ...prev, pace: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 border-gray-200">
                      <option value="easy">Easy</option>
                      <option value="balanced">Balanced</option>
                      <option value="immersive">Immersive</option>
                    </select>
                  </div>
                  <Input label="Best for" value={newPathway.bestFor} onChange={(e) => setNewPathway((prev) => ({ ...prev, bestFor: e.target.value }))} />
                  <Input label="Neighborhood / area" value={newPathway.neighborhood} onChange={(e) => setNewPathway((prev) => ({ ...prev, neighborhood: e.target.value }))} />
                  <Input label="Suggested stop count" type="number" min={1} max={12} value={newPathway.stopCount} onChange={(e) => setNewPathway((prev) => ({ ...prev, stopCount: Number(e.target.value) || 3 }))} />
                  <textarea rows={3} value={newPathway.summary} onChange={(e) => setNewPathway((prev) => ({ ...prev, summary: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                </div>
                <Button size="sm" variant="secondary" onClick={addPathway}>+ Add pathway</Button>
                {(form.experiencePathways || []).length ? (
                  <div className="mt-3 space-y-2">
                    {form.experiencePathways.map((item, index) => (
                      <div key={`${item.title}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                        <span>{item.title}</span>
                        <button type="button" onClick={() => set('experiencePathways', form.experiencePathways.filter((_, idx) => idx !== index))} className="text-rose-600">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4">
                <h3 className="text-base font-semibold text-slate-900">Translations</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input label="Language code" value={newTranslation.languageCode} onChange={(e) => setNewTranslation((prev) => ({ ...prev, languageCode: e.target.value }))} />
                  <Input label="Language label" value={newTranslation.languageLabel} onChange={(e) => setNewTranslation((prev) => ({ ...prev, languageLabel: e.target.value }))} />
                  <Input label="Translated title" value={newTranslation.title} onChange={(e) => setNewTranslation((prev) => ({ ...prev, title: e.target.value }))} />
                  <textarea rows={3} value={newTranslation.description} onChange={(e) => setNewTranslation((prev) => ({ ...prev, description: e.target.value }))} className="border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none border-gray-200" />
                </div>
                <Button size="sm" variant="secondary" onClick={addTranslation}>+ Add translation</Button>
                {(form.translations || []).length ? (
                  <div className="mt-3 space-y-2">
                    {form.translations.map((item, index) => (
                      <div key={`${item.languageCode}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                        <span>{item.languageLabel} ({item.languageCode})</span>
                        <button type="button" onClick={() => set('translations', form.translations.filter((_, idx) => idx !== index))} className="text-rose-600">Remove</button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Photos tab */}
          {tab === 'photos' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Photos</h2>
              <p className="text-sm text-gray-500">Standard limit: {totalPhotoCount}/{MAX_IMAGES} photos used.</p>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Upload New Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoFiles}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:font-semibold file:text-emerald-700"
                />
              </div>
              {errors.photos ? <p className="text-xs text-rose-600">{errors.photos}</p> : null}

              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-gray-700">Current Photos</p>
                {existingPhotos.length ? (
                  <div className="flex gap-3 flex-wrap">
                    {existingPhotos.map((url, i) => (
                      <div key={`existing-${i}`} className="relative group w-24 h-24 min-w-[6rem] shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === 0 && <span className="absolute bottom-1 left-1 text-xs bg-emerald-500 text-white px-1 rounded">Cover</span>}
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(i)}
                          className="absolute right-1.5 top-1.5 h-5 w-5 rounded-full bg-white/90 text-xs font-bold text-slate-700"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500">No existing photos left.</p>}
              </div>

              {newPhotoPreviews.length ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-gray-700">New Photos To Upload</p>
                  <div className="flex gap-3 flex-wrap">
                    {newPhotoPreviews.map(({ file, url }, i) => (
                      <div key={`new-${file.name}-${i}`} className="relative group w-24 h-24 min-w-[6rem] shrink-0 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                        <img src={url} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(i)}
                          className="absolute right-1.5 top-1.5 h-5 w-5 rounded-full bg-white/90 text-xs font-bold text-slate-700"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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
      
    </div>
  )
}

export default EditExperiencePage
