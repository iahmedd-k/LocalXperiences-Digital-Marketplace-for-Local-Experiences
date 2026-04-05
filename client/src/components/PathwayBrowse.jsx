import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import useTranslation from '../hooks/useTranslation.js';
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import Spinner from './common/Spinner.jsx'
import { getPathways, toggleSavePathway } from '../services/pathwayService.js'
import { formatPrice } from '../utils/formatters.js'

const CATEGORIES = [
  { id: 'all', label: 'All pathways', icon: 'All' },
  { id: 'food', label: 'Food & drink', icon: 'Food' },
  { id: 'culture', label: 'Culture', icon: 'Culture' },
  { id: 'adventure', label: 'Adventure', icon: 'Adventure' },
  { id: 'art', label: 'Art & craft', icon: 'Art' },
  { id: 'family', label: 'Family', icon: 'Family' },
  { id: 'music', label: 'Music', icon: 'Music' },
  { id: 'nature', label: 'Nature', icon: 'Nature' },
]

export const PathwayCard = ({ pathway, onClick, isSaved, onSave }) => {
  const { t } = useTranslation()
  const hostInitials = pathway.creatorId?.name?.substring(0, 2)?.toUpperCase() || 'LG'
  const city = pathway.stops?.[0]?.experienceId?.location?.city || t('browse_local_area')
  const stopCount = pathway.stops?.length || 0
  const hours = Math.max(1, Math.round((pathway.totalDuration || 0) / 60))

  const handleSaveClick = (event) => {
    event.stopPropagation()
    onSave(pathway._id)
  }

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-52 overflow-hidden">
        {pathway.coverPhoto ? (
          <img
            src={pathway.coverPhoto}
            alt={pathway.title}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f2d1a_0%,#1a6b4a_100%)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 rounded-full bg-white/92 px-2.5 py-1 text-[11px] font-semibold text-[#0f2d1a] shadow-sm">
          {city}
        </div>

        <button
          onClick={handleSaveClick}
          className="absolute right-3 top-3 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 text-base shadow-[0_2px_8px_rgba(0,0,0,.15)]"
          style={{ color: isSaved ? '#e24b4a' : '#888' }}
          aria-label={t('browse_save')}
        >
          {isSaved ? '♥' : '♡'}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 min-h-11 line-clamp-2 text-[1rem] font-bold leading-6 text-[#0f2d1a]">
          {pathway.title}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF8F2] text-[10px] font-bold text-[#1a6b4a]">
            {hostInitials}
          </div>
          <span className="text-xs text-slate-500">{t('browse_by_creator')} {pathway.creatorId?.name || t('browse_by_local')}</span>
        </div>

        <div className="mt-auto pt-2">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {stopCount} stops
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
              {hours} hrs
            </span>
          </div>
          <p className="text-[1rem] font-semibold text-[#0f2d1a]">{t("from")}<span className="font-extrabold">{formatPrice(pathway.estimatedCost || 0)}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PathwaysBrowse() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [activecat, setActivecat] = useState('all')
  const [focused, setFocused] = useState(false)

  const { user } = useSelector((state) => state.auth)
  const isAuthenticated = Boolean(user?._id)

  const { data: pathwaysRes, isLoading } = useQuery({
    queryKey: ['pathways', activecat],
    queryFn: () => getPathways({ tag: activecat === 'all' ? '' : activecat }),
  })

  const pathways = pathwaysRes?.data?.data || []

  const toggleSaveMutation = useMutation({
    mutationFn: toggleSavePathway,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['pathways'])
      if (data.isSaved) toast.success(t('suggested_journey_saved'))
      else toast.success(t('suggested_journey_removed'))
    },
    onError: () => {
      toast.error(t('suggested_journey_failed'))
    },
  })

  const onSave = (id) => {
    if (!isAuthenticated) {
      toast.error(t('suggested_journey_login'))
      return navigate('/login')
    }
    toggleSaveMutation.mutate(id)
  }

  const filtered = pathways.filter((pathway) => {
    const q = query.toLowerCase()
    return !q || pathway.title.toLowerCase().includes(q) || pathway.creatorId?.name?.toLowerCase().includes(q)
  })

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafa] font-sans">
      <Navbar />

      <main className="flex-1">
        <div className="px-6 pb-8 pt-12 text-center">
          <div className="mb-3 text-[13px] font-medium uppercase tracking-[0.12em] text-[#1a6b4a]">
            {t('browse_curated')}
          </div>
          <h1 className="mb-2 font-playfair text-[42px] font-semibold leading-[1.15] tracking-tight text-slate-900">
            {t('browse_discover')}
          </h1>
          <p className="mb-8 text-[15px] font-light text-slate-500">
            {t('browse_multi_stop')}
          </p>

          <div className="relative mx-auto max-w-[640px]">
            <div className={`flex items-center rounded-full bg-white px-1.5 py-1.5 pl-6 transition-all duration-200 ${focused ? 'border-2 border-[#1a6b4a] shadow-[0_4px_24px_rgba(26,107,74,0.12)]' : 'border-2 border-slate-200 shadow-sm'}`}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mr-2.5 shrink-0 opacity-40">
                <circle cx="6.5" cy="6.5" r="5" stroke="#1a1a1a" strokeWidth="1.5" />
                <path d="M10.5 10.5L14 14" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={t('browse_search_placeholder')}
                className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
              />
              {query ? (
                <button onClick={() => setQuery('')} className="mr-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-sm text-slate-500 hover:bg-slate-200">
                  ×
                </button>
              ) : null}
              <button className="whitespace-nowrap rounded-[40px] bg-[#1a6b4a] px-6 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#145a3d]">
                {t('nav_search')}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 px-6 pb-7">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActivecat(cat.id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] transition-all ${
                activecat === cat.id
                  ? 'border-2 border-[#1a6b4a] bg-[#f0faf5] font-semibold text-[#1a6b4a]'
                  : 'border-[1.5px] border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-[13px] text-slate-500">
              {isLoading ? t('browse_loading') : `${filtered.length} ${filtered.length !== 1 ? t('browse_many_pathways') : t('browse_one_pathway')}`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <div className="mb-3 text-[40px]">◈</div>
              <div className="font-playfair text-base text-slate-500">No pathways found</div>
              <div className="mt-1.5 text-[13px]">Try a different search or category</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((pathway) => (
                <PathwayCard
                  key={pathway._id}
                  pathway={pathway}
                  isSaved={user?.savedPathways?.includes(pathway._id)}
                  onSave={onSave}
                  onClick={() => navigate(`/pathways/${pathway._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
