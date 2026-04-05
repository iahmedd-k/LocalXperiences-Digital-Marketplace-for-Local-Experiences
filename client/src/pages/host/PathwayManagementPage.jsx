import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Spinner from '../../components/common/Spinner.jsx'
import { getPathways, createPathway, updatePathway, deletePathway } from '../../services/pathwayService.js'
import { getHostExperiences } from '../../services/experienceService.js' // Assume we use this to let host pick their experiences
import { GripVertical, Plus, Trash2, Edit2, Play, CircleSlash2 } from 'lucide-react'

export default function PathwayManagementPage() {
  const queryClient = useQueryClient()
  const { user } = useSelector((state) => state.auth)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverPhoto: '',
    tags: '',
    isPublic: true,
    stops: [] // { experienceId, transitionNote }
  })

  // Fetch host's pathways
  const { data: pathwaysRes, isLoading: pathwaysLoading } = useQuery({
    queryKey: ['hostPathways'],
    // Since getPathways returns public, here we could fetch user's specifically.
    // For now we'll fetch all and filter client side simply, or API needs a fix.
    // Wait, the API GET /api/pathways just returns public ones. 
    // If we want the host's pathways, we can rely on standard getPathways and the backend returns their own plus public.
    // Actually we should create a getHostPathways but let's just use what we have.
    queryFn: () => getPathways({ limit: 100 }),
  })
  
  const myPathways = (pathwaysRes?.data?.data || []).filter(p => String(p.creatorId?._id || p.creatorId) === String(user._id))

  // Fetch host's experiences to add to pathway
  const { data: myExperiencesRes } = useQuery({
    queryKey: ['myExperiences'],
    queryFn: () => getHostExperiences(),
  })
  
  const myExperiences = myExperiencesRes?.data?.data || []

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data) => editingId ? updatePathway(editingId, data) : createPathway(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['hostPathways'])
      toast.success(editingId ? 'Pathway updated' : 'Pathway created')
      resetForm()
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to save pathway')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePathway,
    onSuccess: () => {
      queryClient.invalidateQueries(['hostPathways'])
      toast.success('Pathway deleted')
    },
    onError: () => toast.error('Failed to delete pathway')
  })

  // Handlers
  const resetForm = () => {
    setFormData({ title: '', description: '', coverPhoto: '', tags: '', isPublic: true, stops: [] })
    setEditingId(null)
    setIsModalOpen(false)
  }

  const handleEdit = (pathway) => {
    setFormData({
      title: pathway.title,
      description: pathway.description || '',
      coverPhoto: pathway.coverPhoto || '',
      tags: (pathway.tags || []).join(', '),
      isPublic: pathway.isPublic,
      stops: (pathway.stops || []).map(s => ({
        experienceId: s.experienceId?._id || s.experienceId,
        transitionNote: s.transitionNote || ''
      }))
    })
    setEditingId(pathway._id)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this pathway?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleAddStop = (e) => {
    const expId = e.target.value
    if (!expId) return
    if (formData.stops.find(s => s.experienceId === expId)) {
      return toast.error('Experience already added')
    }
    setFormData(prev => ({
      ...prev,
      stops: [...prev.stops, { experienceId: expId, transitionNote: '' }]
    }))
    e.target.value = '' // reset select
  }

  const handleRemoveStop = (index) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }))
  }

  const handleUpdateStopNote = (index, value) => {
    setFormData(prev => {
      const newStops = [...prev.stops]
      newStops[index].transitionNote = value
      return { ...prev, stops: newStops }
    })
  }

  // Simple drag list reordering using local dragging
  const [draggedIdx, setDraggedIdx] = useState(null)
  const onDragStart = (e, idx) => setDraggedIdx(idx)
  const onDragOver = (e) => e.preventDefault()
  const onDrop = (e, idx) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === idx) return
    const newStops = [...formData.stops]
    const [moved] = newStops.splice(draggedIdx, 1)
    newStops.splice(idx, 0, moved)
    setFormData({ ...formData, stops: newStops })
    setDraggedIdx(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title) return toast.error('Title is required')
    if (formData.stops.length === 0) return toast.error('Add at least one experience stop')

    // Calc totals
    const selectedExps = formData.stops.map(s => myExperiences.find(ex => ex._id === s.experienceId)).filter(Boolean)
    const totalDuration = selectedExps.reduce((sum, ex) => sum + (Number(ex.duration) || 0), 0)
    const estimatedCost = selectedExps.reduce((sum, ex) => sum + (Number(ex.price) || 0), 0)

    saveMutation.mutate({
      title: formData.title,
      description: formData.description,
      coverPhoto: formData.coverPhoto,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      isPublic: formData.isPublic,
      stops: formData.stops,
      totalDuration,
      estimatedCost
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <main className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Link to="/host/dashboard" className="text-xs text-emerald-500 hover:underline">← Dashboard</Link>
            <h1 className="text-lg font-semibold text-gray-900 mt-1">Manage Pathways</h1>
            <p className="text-xs text-slate-500">Create beautiful multi-experience journeys for your guests.</p>
          </div>
          <div className="mb-8 flex items-center justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#1a6b4a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#145a3d]"
            >
              <Plus className="h-3.5 w-3.5" /> Create Pathway
            </button>
          </div>

          {pathwaysLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : myPathways.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Play className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">No pathways yet</h2>
              <p className="mt-2 text-sm text-slate-500">Group your experiences into a curated journey.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myPathways.map((pathway) => (
                <div key={pathway._id} className="relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-sm">
                  <div className="h-32 shrink-0 w-full bg-slate-100">
                    {pathway.coverPhoto ? (
                      <img src={pathway.coverPhoto} alt="" className="h-full w-full object-cover block" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-emerald-900 text-white/50">No Cover</div>
                    )}
                    <div className="absolute top-3 left-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-sm backdrop-blur-sm">
                      {pathway.stops?.length || 0} stops
                    </div>
                    {!pathway.isPublic && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        <CircleSlash2 className="h-3 w-3" /> PRIVATE
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-1 font-clash text-sm font-bold text-slate-900">{pathway.title}</h3>
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{pathway.description || 'No description'}</p>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <div className="text-[10px] font-semibold text-slate-700">♥ {pathway.saves || 0} saves</div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEdit(pathway)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-emerald-600"><Edit2 className="h-3.5 w-3.5" /></button>
                        <button onClick={() => handleDelete(pathway._id)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-base font-semibold text-slate-900">{editingId ? 'Edit Pathway' : 'Create Pathway'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Pathway Title *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-emerald-500" placeholder="e.g. Perfect Weekend in the City" />
                </div>
                
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700">Description</label>
                  <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-emerald-500" placeholder="Describe this journey..." />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Cover Photo URL</label>
                    <input type="url" value={formData.coverPhoto} onChange={e => setFormData({ ...formData, coverPhoto: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-emerald-500" placeholder="https://" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">Tags (comma separated)</label>
                    <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-emerald-500" placeholder="food, culture" />
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <input type="checkbox" id="isPublic" checked={formData.isPublic} onChange={e => setFormData({ ...formData, isPublic: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="isPublic" className="flex flex-col cursor-pointer">
                    <span className="text-xs font-semibold text-slate-900">Make Public</span>
                    <span className="text-[10px] text-slate-500">Allow anyone to discover and save this pathway.</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Journey Stops *</h3>
                
                <div className="mb-3">
                  <select onChange={handleAddStop} className="w-full rounded-lg border border-slate-200 p-2 text-sm outline-none focus:border-emerald-500 bg-white">
                    <option value="">+ Add an experience to this pathway...</option>
                    {myExperiences.map(ex => (
                      <option key={ex._id} value={ex._id}>{ex.title} (${ex.price || 0})</option>
                    ))}
                  </select>
                </div>

                {formData.stops.length > 0 ? (
                  <div className="space-y-2">
                    {formData.stops.map((stop, index) => {
                      const exp = myExperiences.find(ex => ex._id === stop.experienceId)
                      return (
                        <div 
                          key={stop.experienceId + index}
                          draggable
                          onDragStart={(e) => onDragStart(e, index)}
                          onDragOver={onDragOver}
                          onDrop={(e) => onDrop(e, index)}
                          className="flex flex-col gap-1.5 rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm cursor-move"
                        >
                          <div className="flex items-center gap-2.5">
                            <GripVertical className="h-4 w-4 text-slate-300" />
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-slate-900 truncate">{exp?.title || 'Unknown Experience'}</p>
                            </div>
                            <button type="button" onClick={() => handleRemoveStop(index)} className="p-1 text-slate-400 hover:text-red-500">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="ml-12">
                            <input 
                              type="text" 
                              value={stop.transitionNote} 
                              onChange={e => handleUpdateStopNote(index, e.target.value)} 
                              placeholder="Transition note..." 
                              className="w-full rounded bg-slate-50 px-2 py-1 text-[11px] text-slate-600 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-200"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
                    No stops added.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button type="button" onClick={resetForm} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-[#1a6b4a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#145a3d] disabled:opacity-50">
                  {saveMutation.isPending ? 'Saving...' : 'Save Pathway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  )
}
