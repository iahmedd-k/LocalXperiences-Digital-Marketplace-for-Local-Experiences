import { useState, useEffect }     from 'react'
import { useSearchParams }          from 'react-router-dom'
import { useQuery }                 from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchParams }          from '../../slices/searchSlice.js'
import { getExperiences }           from '../../services/experienceService.js'
import Navbar                       from '../../components/common/Navbar.jsx'
import Footer                       from '../../components/common/Footer.jsx'
import SearchBar                    from '../../components/common/SearchBar.jsx'
import CategoryTabs                 from '../../components/common/CategoryTabs.jsx'
import ExperienceGrid               from '../../components/experience/ExperienceGrid.jsx'
import ExperienceFilters            from '../../components/experience/ExperienceFilters.jsx'
import ExperienceMap                from '../../components/map/ExperienceMap.jsx'

const SearchPage = () => {
  const dispatch       = useDispatch()
  const [urlParams]    = useSearchParams()
  const location       = useSelector((s) => s.location)

  const [page,     setPage]    = useState(1)
  const [showMap,  setShowMap] = useState(false)
  const [filters,  setFilters] = useState({
    keyword:  urlParams.get('keyword')  || '',
    city:     urlParams.get('city')     || '',
    category: urlParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort:     'createdAt',
  })

  // Sync URL params → filters
  useEffect(() => {
    const kw  = urlParams.get('keyword')
    const ct  = urlParams.get('city')
    const cat = urlParams.get('category')
    setFilters((f) => ({ ...f, keyword: kw || f.keyword, city: ct || f.city, category: cat || f.category }))
    dispatch(setSearchParams({ keyword: kw || '', city: ct || '' }))
  }, [urlParams.toString()])

  const queryParams = {
    ...filters,
    page,
    limit: 12,
    ...(location.lat && location.lng && !filters.city ? { lat: location.lat, lng: location.lng } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['experiences', queryParams],
    queryFn:  () => getExperiences(queryParams).then((r) => r.data),
    keepPreviousData: true,
    enabled: true,
  })

  const experiences  = data?.data      || []
  const totalPages   = data?.pagination?.totalPages || 1
  const total        = data?.pagination?.total      || 0

  const handleFilters = (newFilters) => { setFilters((f) => ({ ...f, ...newFilters })); setPage(1) }
  const handleCategory = (cat)       => { setFilters((f) => ({ ...f, category: cat })); setPage(1) }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Search bar strip */}
      <div className="bg-gray-900 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <SearchBar />
          <CategoryTabs active={filters.category} onChange={handleCategory} dark />
        </div>
      </div>

      {/* Results bar */}
      <div className="border-b border-gray-100 bg-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Searching...' : `${total} experience${total !== 1 ? 's' : ''} found`}
            {filters.city && <span className="font-semibold text-gray-700"> in {filters.city}</span>}
          </p>
          <div className="flex items-center gap-3">
            <ExperienceFilters filters={filters} onChange={handleFilters} />
            {/* Map toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition border
                ${showMap ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Experience list */}
        <div className={`overflow-y-auto p-4 sm:p-6 ${showMap ? 'w-full lg:w-1/2' : 'w-full max-w-7xl mx-auto'}`}>
          <ExperienceGrid
            experiences={experiences}
            isLoading={isLoading}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Map */}
        {showMap && (
          <div className="hidden lg:block lg:w-1/2 sticky top-0 h-[calc(100vh-130px)]">
            <ExperienceMap
              experiences={experiences}
              center={location.lat ? [location.lat, location.lng] : null}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default SearchPage