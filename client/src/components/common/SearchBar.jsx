import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setSearchParams }     from '../../slices/searchSlice.js'

const SearchBar = ({ large = false }) => {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()
  const location  = useSelector((s) => s.location)
  const search    = useSelector((s) => s.search)

  const [keyword,  setKeyword]  = useState(search.keyword  || '')
  const [city,     setCity]     = useState(search.city     || location.city || '')

  // Sync detected city into field when it arrives
  useEffect(() => {
    if (location.city && !city) setCity(location.city)
  }, [location.city])

  const handleSearch = () => {
    dispatch(setSearchParams({ keyword, city }))
    navigate(`/search?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(city)}`)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSearch() }

  return (
    <div className={`flex items-center bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100
      ${large ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}
    >
      {/* Keyword */}
      <div className="flex items-center gap-2 flex-1 px-4 h-14 border-r border-gray-100">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Search experiences..."
          className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 font-satoshi"
        />
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 px-4 h-14 min-w-[160px]">
        <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKey}
          placeholder={location.detected ? location.city || 'Enter city...' : 'Detecting...'}
          className="w-full text-sm outline-none text-gray-800 placeholder-gray-400 font-satoshi"
        />
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="bg-orange-500 hover:bg-orange-600 transition-colors h-14 px-5 flex items-center justify-center flex-shrink-0"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
    </div>
  )
}

export default SearchBar