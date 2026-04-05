import useTranslation from '../../hooks/useTranslation.js';
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
  const { t } = useTranslation();

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
            <h1 className="text-lg sm:text-xl font-semibold mt-1 text-slate-900">Manage Listings</h1>
            <p className="text-xs text-slate-500">Your hosted experiences</p>
          </div>

          <Link
            to="/host/experiences/create"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={14} />
            New
          </Link>
        </div>

        {/* Filters */}
        <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings by title, category, or city..."
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-200"
          />

          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-2 rounded-full capitalize font-semibold transition ${
                  filter === f
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  <Plus size={16} />{t("nav_create_experience")}</Link>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(item => {
              const isDeleting = deletingId === item._id

              return (
                <div key={item._id} className="rounded-3xl bg-white p-4 flex flex-col shadow-sm ring-1 ring-slate-200">

                  {/* Image */}
                  <div className="h-36 sm:h-40 rounded-2xl overflow-hidden bg-slate-100">
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
                      <h2 className="text-sm font-semibold text-slate-900 line-clamp-2">
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

                    <p className="text-xs text-slate-500 mt-1">
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
                      className="flex-1 rounded-full bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white no-underline transition hover:bg-emerald-700"
                    >
                      <Pencil size={12} className="inline mr-1" />
                      Edit
                    </Link>

                    <Link
                      to={`/experiences/${item._id}`}
                      className="flex-1 rounded-full bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700 no-underline transition hover:bg-slate-200"
                    >
                      <Eye size={12} className="inline mr-1" />
                      View
                    </Link>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={isDeleting}
                      className="flex-1 rounded-full bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
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
