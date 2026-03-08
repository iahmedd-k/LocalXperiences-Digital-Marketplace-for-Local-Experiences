
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useSelector } from "react-redux"

import useGeolocation from "../../hooks/useGeolocation.js"

import SearchBar from "../../components/common/SearchBar.jsx"
import CategoryTabs from "../../components/common/CategoryTabs.jsx"
import ExperienceCard from "../../components/experience/ExperienceCard.jsx"
import Spinner from "../../components/common/Spinner.jsx"
import Navbar from "../../components/common/Navbar.jsx"
import Footer from "../../components/common/Footer.jsx"

import { getFeatured, getExperiences } from "../../services/experienceService.js"
import { getRecommendations } from "../../services/recommendationService.js"

const CITIES = [
  { name: "Lahore", emoji: "🕌", color: "from-orange-300 to-orange-500" },
  { name: "Karachi", emoji: "🌊", color: "from-blue-300 to-blue-500" },
  { name: "Islamabad", emoji: "🏛️", color: "from-green-300 to-green-500" },
  { name: "Peshawar", emoji: "🏔️", color: "from-purple-300 to-purple-500" },
  { name: "Multan", emoji: "🌾", color: "from-yellow-300 to-yellow-500" },
  { name: "Quetta", emoji: "🏯", color: "from-red-300 to-red-500" },
]

const HomePage = () => {
  const navigate = useNavigate()
  const location = useGeolocation()
  const { isAuthenticated, user } = useSelector((s) => s.auth)

  const [activeCategory, setActiveCategory] = useState("")

  // Featured
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured"],
    queryFn: () => getFeatured().then((r) => r.data.data),
    staleTime: 1000 * 60 * 10,
  })

  // Experiences
  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ["experiences", activeCategory],
    queryFn: () =>
      getExperiences({
        category: activeCategory,
        limit: 8,
      }).then((r) => r.data.data),
    staleTime: 1000 * 60 * 5,
  })

  // AI recommendations
  const { data: recommendationsData, isLoading: recLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => getRecommendations().then((r) => r.data.data),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 30,
  })

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    if (cat) navigate(`/search?category=${cat}`)
  }

  const experiences = allData || featuredData || []

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-gray-900 relative overflow-hidden pt-20 pb-16 px-4 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 60% 0%, rgba(249,115,22,0.25) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(249,115,22,0.12) 0%, transparent 50%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
            Now live in 50+ cities
          </div>

          <h1 className="font-clash text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Discover & Book <span className="text-orange-500">Unique</span>
            <br />
            Local Experiences
          </h1>

          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            From hidden city tours to artisanal workshops — curated for every
            traveler and local adventurer.
          </p>

          <div className="mb-10">
            <SearchBar large />
          </div>

          <CategoryTabs
            active={activeCategory}
            onChange={handleCategoryChange}
            dark
          />
        </div>
      </section>

      {/* TRENDING */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-clash text-2xl font-bold text-gray-900">
              {location.detected && location.city
                ? `🔥 Trending in ${location.city}`
                : "🔥 Trending Experiences"}
            </h2>

            {!location.detected && (
              <p className="text-sm text-gray-400 mt-1">
                Detecting your location…
              </p>
            )}
          </div>

          <Link
            to="/search"
            className="text-sm font-semibold text-orange-500 hover:underline"
          >
            See all →
          </Link>
        </div>

        {allLoading || featuredLoading ? (
          <Spinner size="lg" className="py-16" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {experiences.slice(0, 8).map((exp) => (
              <ExperienceCard key={exp._id} experience={exp} />
            ))}
          </div>
        )}
      </section>

      {/* AI RECOMMENDATIONS */}
      <section className="bg-gray-900 py-14 px-4">
        <div className="max-w-7xl mx-auto">
          {isAuthenticated ? (
            <>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-clash text-2xl font-bold text-white">
                    ✨ Picked For You{" "}
                    <span className="text-purple-400">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Based on your bookings & interests
                  </p>
                </div>

                <Link
                  to="/search"
                  className="text-sm font-semibold text-purple-400 hover:underline"
                >
                  See all →
                </Link>
              </div>

              {recLoading ? (
                <Spinner size="lg" className="py-16" />
              ) : recommendationsData?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recommendationsData.slice(0, 6).map((exp) => (
                    <ExperienceCard
                      key={exp._id}
                      experience={exp}
                      aiReason={exp.reason}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  No recommendations yet. Start booking experiences.
                </p>
              )}
            </>
          ) : (
            <div className="text-center text-white">
              <h2 className="font-clash text-2xl mb-3">
                Get Personalized Recommendations
              </h2>

              <p className="text-gray-400 mb-6">
                Sign in to unlock AI-powered suggestions.
              </p>

              <Link
                to="/login"
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl"
              >
                Sign in →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* TOP CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 w-full">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-clash text-2xl font-bold text-gray-900">
            🌍 Top Destinations
          </h2>

          <Link
            to="/search"
            className="text-sm font-semibold text-orange-500 hover:underline"
          >
            Explore all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CITIES.map((city) => (
            <Link
              key={city.name}
              to={`/search?city=${city.name}`}
              className="relative rounded-2xl overflow-hidden h-32"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${city.color} flex items-center justify-center text-4xl`}
              >
                {city.emoji}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              <span className="absolute bottom-3 left-3 text-white font-bold text-sm">
                {city.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default HomePage
