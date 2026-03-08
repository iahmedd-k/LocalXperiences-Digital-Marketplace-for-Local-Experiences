import { useState } from 'react'
import { CATEGORIES, SORT_OPTIONS } from '../../config/constants.js'
import Button from '../common/Button.jsx'

const ExperienceFilters = ({ filters, onChange }) => {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState(filters)

  const apply = () => { onChange(local); setOpen(false) }
  const reset = () => { const clean = { category:'', minPrice:'', maxPrice:'', sort:'createdAt' }; setLocal(clean); onChange(clean); setOpen(false) }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M3 6h18M6 12h12M9 18h6"/>
        </svg>
        Filters
        {(filters.category || filters.minPrice || filters.maxPrice) && (
          <span className="w-2 h-2 bg-orange-500 rounded-full"/>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)}/>
          <div className="absolute right-0 top-12 w-72 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Filter Experiences</h3>

            {/* Category */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Category</label>
              <select
                value={local.category}
                onChange={(e) => setLocal({ ...local, category: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Price range */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="Min $"
                  value={local.minPrice}
                  onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
                <input
                  type="number" placeholder="Max $"
                  value={local.maxPrice}
                  onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="mb-5">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Sort By</label>
              <select
                value={local.sort}
                onChange={(e) => setLocal({ ...local, sort: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
              >
                {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth onClick={reset}>Reset</Button>
              <Button size="sm" fullWidth onClick={apply}>Apply</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ExperienceFilters