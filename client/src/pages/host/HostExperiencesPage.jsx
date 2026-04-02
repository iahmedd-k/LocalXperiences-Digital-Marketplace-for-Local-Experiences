import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { BookOpen, Eye, Pencil, Plus, Trash2 } from 'lucide-react'

import Spinner from '../../components/common/Spinner.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import { deleteExperience, getHostExperiences } from '../../services/experienceService.js'
import { formatPrice } from '../../utils/formatters.js'

const FILTERS = ['all', 'active', 'inactive']

const HostExperiencesPage = () => {
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const { data: experiences = [], isLoading } = useQuery({
    queryKey: ['hostExperiences'],
    queryFn: async () => {
      const res = await getHostExperiences()
      return res?.data?.data || []
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExperience,
    onSuccess: async () => {
      toast.success('Experience deleted')
      await queryClient.invalidateQueries({ queryKey: ['hostExperiences'] })
    },
    onError: () => toast.error('Failed to delete'),
    onSettled: () => setDeletingId(null)
  })

  const counts = useMemo(() => ({
    all: experiences.length,
    active: experiences.filter(e => e.isActive).length,
    inactive: experiences.filter(e => !e.isActive).length,
  }), [experiences])

  const normalizedSearch = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    return experiences
      .filter(e => {
        if (filter === 'all') return true
        return filter === 'active' ? e.isActive : !e.isActive
      })
      .filter(e => {
        if (!normalizedSearch) return true
        return (
          e.title?.toLowerCase().includes(normalizedSearch) ||
          e.category?.toLowerCase().includes(normalizedSearch) ||
          e.location?.city?.toLowerCase().includes(normalizedSearch)
        )
      })
  }, [experiences, filter, normalizedSearch])

  const handleDelete = (id) => {
    if (!window.confirm('Delete this experience?')) return
    setDeletingId(id)
    deleteMutation.mutate(id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-5 space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link to="/host/dashboard" className="text-xs text-emerald-600">
              ← Dashboard
            </Link>
            <h1 className="text-lg sm:text-xl font-bold mt-1">Manage Listings</h1>
            <p className="text-xs text-gray-500">Your hosted experiences</p>
          </div>

          <Link
            to="/host/experiences/create"
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg"
          >
            <Plus size={14} />
            New
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded-xl p-3 space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />

          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2 py-1 rounded-md capitalize ${
                  filter === f
                    ? 'bg-emerald-600 text-white'
                    : 'border bg-white text-gray-600'
                }`}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon="Map"
              title="No listings found"
              description="Start creating unique experiences to share with travelers."
              action={
                <Link
                  to="/host/experiences/create"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl no-underline"
                >
                  <Plus size={16} /> Create experience
                </Link>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const isDeleting = deletingId === item._id

              return (
                <div key={item._id} className="bg-white border rounded-xl p-3 flex flex-col">

                  {/* Image */}
                  <div className="h-36 sm:h-40 rounded-lg overflow-hidden bg-gray-100">
                    {item.photos?.[0] ? (
                      <img
                        src={item.photos[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <BookOpen size={18} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mt-2 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="text-sm font-semibold line-clamp-2">
                        {item.title}
                      </h2>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.location?.city || '—'} • {item.category || '—'}
                    </p>

                    <p className="text-sm font-bold text-emerald-600 mt-1">
                      {formatPrice(item.price || 0)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Link
                      to={`/host/experiences/${item._id}/edit`}
                      className="flex-1 text-center text-xs border rounded-md py-1.5"
                    >
                      <Pencil size={12} className="inline mr-1" />
                      Edit
                    </Link>

                    <Link
                      to={`/experiences/${item._id}`}
                      className="flex-1 text-center text-xs border rounded-md py-1.5"
                    >
                      <Eye size={12} className="inline mr-1" />
                      View
                    </Link>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={isDeleting}
                      className="flex-1 text-center text-xs border border-red-200 text-red-600 rounded-md py-1.5"
                    >
                      <Trash2 size={12} className="inline mr-1" />
                      {isDeleting ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default HostExperiencesPage