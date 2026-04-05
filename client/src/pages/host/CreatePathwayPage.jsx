import useTranslation from '../../hooks/useTranslation.js';
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import React from 'react'

import { createPathway } from '../../services/pathwayService.js'
import { getHostExperiences } from '../../services/experienceService.js'
import { getErrorMessage } from '../../utils/helpers.js'

import Button from '../../components/common/Button.jsx'
import Input from '../../components/common/Input.jsx'

const STEPS = ['Basics', 'Details', 'Stops', 'Review & Publish']
const MAX_TITLE_LENGTH = 80
const MAX_CITY_LENGTH = 60
const MAX_TAGS = 8
const MAX_DESCRIPTION_LENGTH = 1200
const MAX_STOPS = 12

const EMPTY_STOP = {
  experienceId: '',
  travelTimeToNext: 15,
  travelMode: 'walk',
  isOptional: false,
  customNote: '',
}

const CreatePathwayPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [myExperiences, setMyExperiences] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    getHostExperiences().then(res => setMyExperiences(res.data.data)).catch(console.error)
  }, [])

  const [form, setForm] = useState({
    title: '',
    city: '',
    difficulty: 'moderate',
    tags: '',
    description: '',
    coverPhoto: '',
    bestFor: '',
    bestTime: '',
    status: 'published',
    stops: [],
  })

  const [stopDraft, setStopDraft] = useState(EMPTY_STOP)

  const set = (field, val) => setForm((f) => ({ ...f, [field]: val }))
  
  const validateStep = (targetStep = step) => {
    const nextErrors = {}

    if (targetStep === 0 || targetStep === 3) {
      if (!form.title.trim()) nextErrors.title = 'Title is required.'
      if (!form.city.trim()) nextErrors.city = 'City is required.'
      if (form.title.length > MAX_TITLE_LENGTH) nextErrors.title = `Title can be up to ${MAX_TITLE_LENGTH} characters.`
      if (form.city.length > MAX_CITY_LENGTH) nextErrors.city = `City can be up to ${MAX_CITY_LENGTH} characters.`
    }

    if (targetStep === 1 || targetStep === 3) {
      if (!form.description.trim()) nextErrors.description = 'Description is required.'
      if (form.description.length > MAX_DESCRIPTION_LENGTH) nextErrors.description = `Description can be up to ${MAX_DESCRIPTION_LENGTH} characters.`
      if (!form.coverPhoto.trim()) nextErrors.coverPhoto = 'Cover photo URL is required for the pathway header.'
    }

    if (targetStep === 2 || targetStep === 3) {
      if (form.stops.length === 0) nextErrors.stops = 'You must add at least one stop to this pathway.'
      if (form.stops.length > MAX_STOPS) nextErrors.stops = `You can only add up to ${MAX_STOPS} stops.`
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const addStop = () => {
    if (!stopDraft.experienceId) {
      toast.error('Please select an experience to add.')
      return
    }
    if (form.stops.findIndex(s => s.experienceId === stopDraft.experienceId) !== -1) {
      toast.error('This experience is already in your pathway.')
      return
    }
    setForm(f => ({
      ...f,
      stops: [...f.stops, { ...stopDraft, order: f.stops.length + 1 }]
    }))
    setStopDraft(EMPTY_STOP)
  }

  const removeStop = (index) => {
    setForm(f => ({
      ...f,
      stops: f.stops.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }))
    }))
  }

  const tagCount = form.tags.split(',').filter(Boolean).length

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please fix the highlighted errors before publishing.')
      return
    }

    try {
      setLoading(true)

      // Calculate totals
      const selectedExps = form.stops.map(s => myExperiences.find(ex => ex._id === s.experienceId)).filter(Boolean)
      const totalDuration = selectedExps.reduce((sum, ex) => sum + (Number(ex.duration) || 0), 0) + 
                            form.stops.reduce((sum, s) => sum + (Number(s.travelTimeToNext) || 0), 0)
      const totalPrice = selectedExps.reduce((sum, ex) => sum + (Number(ex.price) || 0), 0)

      const payload = {
        title: form.title,
        city: form.city,
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        description: form.description,
        coverPhoto: form.coverPhoto,
        bestFor: form.bestFor,
        bestTime: form.bestTime,
        status: form.status,
        totalDuration,
        totalPrice,
        stops: form.stops
      }

      await createPathway(payload)
      toast.success('Pathway created successfully!')
      navigate('/host/pathways')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <Link to="/host/pathways" className="text-sm text-emerald-500 hover:underline">← Cancel & Return to Dashboad</Link>
          <h1 className="text-xl font-semibold text-gray-900 mt-2">Create New Pathway</h1>
        </div>

        {/* Wizard Steps indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  i === step
                    ? 'bg-emerald-500 text-white'
                    : i < step
                      ? 'bg-green-100 text-green-700 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-default'
                }`}
              >
                {i < step ? '✓' : i + 1} {s}
              </button>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-green-300' : 'bg-gray-200'}`}/>}
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          {/* STEP 0: BASICS */}
          {step === 0 && (
             <div className="flex flex-col gap-4">
              <h2 className="text-base font-semibold text-gray-900">Pathway Basics</h2>
              <Input label="Journey Title *" error={errors.title} value={form.title} maxLength={MAX_TITLE_LENGTH} onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. A Weekend in the Old Quarter" />
              
              <Input label="City *" error={errors.city} value={form.city} maxLength={MAX_CITY_LENGTH} onChange={(e) => set('city', e.target.value)}
                placeholder="e.g. Lahore, Pakistan" />
             
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Difficulty Context</label>
                <select value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-emerald-400">
                  <option value="easy">Easy (Relaxed, lots of downtime)</option>
                  <option value="moderate">Moderate (Standard walking and exploration)</option>
                  <option value="challenging">Challenging (Intensive, lots of walking or active sports)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="couples, heritage, food" />
                <p className="text-xs text-slate-400">{tagCount}/{MAX_TAGS} tags.</p>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => validateStep(0) && setStep(1)}>Next: Details</Button>
              </div>
             </div>
          )}

          {/* STEP 1: DETAILS */}
          {step === 1 && (
             <div className="flex flex-col gap-4">
               <h2 className="text-base font-semibold text-gray-900">Journey Details</h2>
               <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Summary Description *</label>
                <textarea rows={5} value={form.description} maxLength={MAX_DESCRIPTION_LENGTH} onChange={(e) => set('description', e.target.value)}
                  placeholder="What is this pathway about? Why should guests take this journey?"
                  className={`border rounded-lg px-4 py-3 text-sm outline-none focus:border-emerald-400 resize-none ${errors.description ? 'border-rose-300 bg-rose-50/30' : 'border-gray-200'}`}/>
                {errors.description && <p className="text-xs text-rose-600">{errors.description}</p>}
              </div>

               <Input label="Cover Photo URL *" error={errors.coverPhoto} value={form.coverPhoto} onChange={(e) => set('coverPhoto', e.target.value)}
                placeholder="https://..." />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Best For (Audiences)" value={form.bestFor} onChange={(e) => set('bestFor', e.target.value)} placeholder="e.g. First-time visitors, families" />
                <Input label="Best Time to Start" value={form.bestTime} onChange={(e) => set('bestTime', e.target.value)} placeholder="e.g. Friday mornings, sunset" />
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(0)}>{t("checkout_back")}</Button>
                <Button onClick={() => validateStep(1) && setStep(2)}>Next: Stops</Button>
              </div>
             </div>
          )}

          {/* STEP 2: STOPS */}
          {step === 2 && (
             <div className="flex flex-col gap-4">
               <h2 className="text-base font-semibold text-gray-900">Journey Stops</h2>
               <p className="text-sm text-gray-500">Pick experiences to string together into a multi-stop journey.</p>
               {errors.stops && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{errors.stops}</p>}

               <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                 <h3 className="font-semibold text-sm">Add a new stop</h3>
                 <select value={stopDraft.experienceId} onChange={e => setStopDraft({...stopDraft, experienceId: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none focus:border-emerald-400">
                    <option value="">-- Select one of your experiences --</option>
                    {myExperiences.map(ex => <option key={ex._id} value={ex._id}>{ex.title}</option>)}
                 </select>
                 
                 <div className="grid grid-cols-2 gap-3 pb-2 pt-1 border-b border-slate-200">
                   <div>
                     <label className="text-xs font-semibold text-gray-600">Travel time to NEXT stop (mins)</label>
                     <input type="number" value={stopDraft.travelTimeToNext} onChange={e => setStopDraft({...stopDraft, travelTimeToNext: Number(e.target.value)})} className="w-full border rounded-lg p-2.5 text-sm bg-white" />
                   </div>
                   <div>
                     <label className="text-xs font-semibold text-gray-600">Mode</label>
                     <select value={stopDraft.travelMode} onChange={e => setStopDraft({...stopDraft, travelMode: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white">
                        <option value="walk">Walking</option>
                        <option value="drive">Driving/Taxi</option>
                        <option value="transit">Public Transit</option>
                        <option value="bike">Bicycle</option>
                        <option value="none">None (Final Stop or Same Location)</option>
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="text-xs font-semibold text-gray-600">Custom note for this transition (Optional)</label>
                   <input type="text" value={stopDraft.customNote} onChange={e => setStopDraft({...stopDraft, customNote: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm bg-white" placeholder="e.g. 'Take the scenic route through the park'" />
                 </div>

                 <div className="flex items-center gap-2">
                   <input type="checkbox" checked={stopDraft.isOptional} onChange={e => setStopDraft({...stopDraft, isOptional: e.target.checked})} id="isOptional" />
                   <label htmlFor="isOptional" className="text-xs font-medium text-gray-700">This stop is optional for guests</label>
                 </div>

                 <Button size="sm" onClick={addStop}>+ Add to Pathway</Button>
               </div>

               {/* Current Stops Display */}
               {form.stops.length > 0 && (
                 <div className="space-y-4">
                   <h3 className="font-semibold text-slate-800">Your Pathway:</h3>
                   {form.stops.map((stop, i) => {
                     const exp = myExperiences.find(e => e._id === stop.experienceId)
                     return (
                       <div key={i} className="flex border border-gray-100 rounded-xl overflow-hidden shadow-sm relative pl-8">
                         <div className="absolute left-0 top-0 bottom-0 w-8 bg-emerald-100 flex items-center justify-center font-bold text-emerald-800 border-r border-emerald-200">
                           {stop.order}
                         </div>
                         <div className="p-3 flex-1">
                           <h4 className="font-semibold text-sm">{exp?.title || 'Unknown'} {stop.isOptional && <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 ml-1 uppercase">Optional</span>}</h4>
                           <div className="text-xs text-slate-500 mt-1">
                             <span className="font-medium text-amber-600">Travel to next:</span> {stop.travelTimeToNext} mins via {stop.travelMode}
                           </div>
                           {stop.customNote && <p className="text-xs italic text-slate-500 mt-1">"{stop.customNote}"</p>}
                         </div>
                         <button onClick={() => removeStop(i)} className="p-3 text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-lg hover:text-rose-700 transition">
                           Remove
                         </button>
                       </div>
                     )
                   })}
                 </div>
               )}

               <div className="mt-6 flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>{t("checkout_back")}</Button>
                <Button onClick={() => validateStep(2) && setStep(3)}>Review & Publish</Button>
              </div>
             </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
             <div className="flex flex-col gap-4">
               <h2 className="text-base font-semibold text-gray-900">Review & Publish</h2>
               <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 text-sm mb-4">
                 Your pathway contains {form.stops.length} stops in {form.city}. Ready to launch?
               </div>
               
               <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <input type="checkbox" id="visibility" checked={form.status === 'published'} 
                   onChange={(e) => set('status', e.target.checked ? 'published' : 'draft')} 
                   className="h-5 w-5 rounded border-slate-300 text-emerald-600" />
                 <label htmlFor="visibility" className="flex flex-col cursor-pointer">
                   <span className="text-sm font-semibold text-slate-900">Make Public Immediately</span>
                   <span className="text-xs text-slate-500">Uncheck to save as a private draft and publish later.</span>
                 </label>
               </div>

               <div className="mt-6 flex justify-between">
                 <Button variant="secondary" onClick={() => setStep(2)}>{t("checkout_back")}</Button>
                 <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Publish Pathway'}</Button>
               </div>
             </div>
          )}
        </div>
      </div>
      
    </div>
  )
}

export default CreatePathwayPage
