import { useState }           from 'react'
import { Link, useNavigate }  from 'react-router-dom'
import { useQuery }           from '@tanstack/react-query'
import { useSelector }        from 'react-redux'
import useGeolocation         from '../../hooks/useGeolocation.js'
import SearchBar              from '../../components/common/SearchBar.jsx'
import CategoryTabs           from '../../components/common/CategoryTabs.jsx'
import ExperienceCard         from '../../components/experience/ExperienceCard.jsx'
import Spinner                from '../../components/common/Spinner.jsx'
import Navbar                 from '../../components/common/Navbar.jsx'
import Footer                 from '../../components/common/Footer.jsx'
import { getFeatured, getExperiences } from '../../services/experienceService.js'
import { getRecommendations }  from '../../services/recommendationService.js'

const CITIES = [
  { name: 'Lahore',     emoji: '🕌', color: 'from-orange-300 to-orange-500' },
  { name: 'Karachi',    emoji: '🌊', color: 'from-blue-300 to-blue-500'   },
  { name: 'Islamabad',  emoji: '🏛️', color: 'from-green-300 to-green-500'  },
  { name: 'Peshawar',   emoji: '🏔️', color: 'from-purple-300 to-purple-500'},
  { name: 'Multan',     emoji: '🌾', color: 'from-yellow-300 to-yellow-500'},
  { name: 'Quetta',     emoji: '🏯', color: 'from-red-300 to-red-500'     },
]

const HomePage = () => {
  const navigate  = useNavigate()
  const location  = useGeolocation()
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const [activeCategory, setActiveCategory] = useState('')

  // Featured experiences
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn:  () => getFeatured().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })

  // Nearby experiences — only when location is detected
  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['experiences', activeCategory],
    queryFn:  () => getExperiences({ category: activeCategory, limit: 8 }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  // AI recommendations — only when logged in
  const { data: recommendationsData, isLoading: recLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn:  () => getRecommendations().then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30,
  })

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    if (cat) navigate(`/search?category=${cat}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── HERO ── */}
      <section className="bg-gray-900 relative overflow-hidden pt-20 pb-16 px-4 text-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{background:'radial-gradient(ellipse at 60% 0%, rgba(249,115,22,0.25) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(249,115,22,0.12) 0%, transparent 50%)'}}
        />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"/>
            Now live in 50+ cities
          </div>

          <h1 className="font-clash text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Discover & Book <span className="text-orange-500">Unique</span><br/>Local Experiences
          </h1>

          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            From hidden city tours to artisanal workshops — curated for every traveler and local adventurer.
          </p>

          <div className="mb-10">
            <SearchBar large />
          </div>

          <CategoryTabs active={activeCategory} onChange={handleCategoryChange} dark />
        </div>
      </section>

      {/* ── NEARBY / TRENDING ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-clash text-2xl font-bold text-gray-900">
              {location.detected && location.city ? `🔥 Trending in ${location.city}` : '🔥 Trending Experiences'}
            </h2>
            {!location.detected && (
              <p className="text-sm text-gray-400 mt-1">Detecting your location…</p>
            )}
          </div>
          <Link to="/search" className="text-sm font-semibold text-orange-500 hover:underline">See all →</Link>
        </div>

        {allLoading || (!location.detected && featuredLoading) ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(allData || featuredData || []).slice(0, 8).map((exp) => (
              <ExperienceCard key={exp._id} experience={exp} />
            ))}
          </div>
        )}
      </section>

      {/* ── AI RECOMMENDATIONS ── */}
      <section className="relative overflow-hidden py-14 px-4" style={{background:'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
        <div className="absolute inset-0 pointer-events-none"
          style={{background:'radial-gradient(ellipse at 30% 50%, rgba(249,115,22,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.15) 0%, transparent 50%)'}}
        />
        <div className="relative max-w-7xl mx-auto">

          {isAuthenticated ? (
            <>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"/>
                    AI Powered
                  </div>
                  <h2 className="font-clash text-2xl font-bold text-white">
                    ✨ Picked For You, <span className="text-purple-400">{user?.name?.split(' ')[0]}</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">Based on your bookings & interests — refreshed every 30 min</p>
                </div>
                <Link to="/search" className="text-sm font-semibold text-purple-400 hover:underline">See all →</Link>
              </div>

              {recLoading ? (
                <Spinner size="lg" className="py-10" />
              ) : recommendationsData?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recommendationsData.slice(0, 6).map((exp) => (
                    <div key={exp._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-900/20 hover:-translate-y-1 transition-all duration-300">
                      <ExperienceCard experience={exp} aiReason={exp.reason} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-10">Book your first experience to get personalized recommendations!</p>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="font-clash text-2xl font-bold text-white mb-2">Get AI-Powered Recommendations</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">Sign in and our AI learns your taste — recommending experiences you'll actually love.</p>
              <Link
                to="/signup"
                className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-900/30 hover:-translate-y-0.5 transition-all"
              >
                Sign Up to Get Started
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── TOP CITIES ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-clash text-2xl font-bold text-gray-900">🌍 Top Destinations</h2>
          <Link to="/search" className="text-sm font-semibold text-orange-500 hover:underline">Explore all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.name}
              to={`/search?city=${city.name}`}
              className="relative rounded-2xl overflow-hidden h-32 group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${city.color} flex items-center justify-center text-4xl group-hover:scale-105 transition-transform duration-300`}>
                {city.emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              <span className="absolute bottom-3 left-3 text-white font-clash font-bold text-sm">{city.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-orange-50 py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-clash text-3xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🔍', title: 'Discover',      desc: 'Browse hundreds of unique local experiences curated by passionate locals.'      },
              { icon: '📅', title: 'Book Instantly', desc: 'Select your slot, choose guest count, and pay securely. Confirmed in seconds.'  },
              { icon: '✨', title: 'Experience',     desc: 'Show up and enjoy. Leave a review to help others discover great experiences.'   },
              { icon: '🗺️', title: 'Save & Share',   desc: 'Build your personal itinerary and share it with friends for the perfect trip.' },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{step.icon}</div>
                <h3 className="font-clash font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOST CTA ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="bg-gray-900 rounded-3xl p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full" style={{background:'radial-gradient(circle, rgba(249,115,22,0.25), transparent 70%)'}}/>
          <div className="relative">
            <h2 className="font-clash text-3xl font-bold text-white mb-3">Share Your Passion.<br/>Earn Doing What You Love.</h2>
            <p className="text-gray-400 max-w-md">Turn your unique skills and local knowledge into an experience people will never forget.</p>
          </div>
          <div className="relative flex gap-3 flex-shrink-0">
            <Link to="/signup" className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm">Learn More</Link>
            <Link to="/signup" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition text-sm">Become a Host →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage