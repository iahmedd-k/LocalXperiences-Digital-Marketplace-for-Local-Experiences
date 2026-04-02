import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import Spinner from '../../components/common/Spinner.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import useWishlist from '../../hooks/useWishlist.js'
import { getWishlist } from '../../services/wishlistService.js'
import { formatDuration, formatPrice } from '../../utils/formatters.js'

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="12 2.5 15.1 8.8 22 9.8 17 14.7 18.2 21.5 12 18.1 5.8 21.5 7 14.7 2 9.8 8.9 8.8" />
  </svg>
)

const WishlistPage = () => {
  const { toggleWishlist, isPendingFor } = useWishlist()

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => getWishlist().then((res) => res.data.data || []),
  })

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-10">

        {/* ── Page header ─────────────────────────────────── */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
            Your Collection
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Wishlist
            </h1>
            {!isLoading && wishlist.length > 0 && (
              <span className="shrink-0 text-xs font-semibold text-stone-500 bg-stone-100 border border-stone-200 rounded-full px-3 py-1">
                {wishlist.length} saved
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-stone-500">Experiences you've saved for later.</p>
        </div>

        {/* ── Loading ─────────────────────────────────────── */}
        {isLoading && (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        )}

        {/* ── Empty state ─────────────────────────────────── */}
        {!isLoading && wishlist.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="Nothing saved yet"
              description="Tap the heart on any experience to save it here."
              action={
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl no-underline transition-colors"
                >
                  Explore experiences
                </Link>
              }
            />
          </div>
        )}

        {/* ── Grid ────────────────────────────────────────── */}
        {!isLoading && wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {wishlist.map((exp) => {
              const rating  = Number(exp?.rating?.average || 0)
              const reviews = Number(exp?.rating?.count   || 0)

              return (
                <article
                  key={exp._id}
                  className="group flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Image */}
                  <Link to={`/experiences/${exp._id}`} className="block no-underline shrink-0">
                    <div className="relative h-48 sm:h-52 bg-stone-100 overflow-hidden">
                      <img
                        src={exp?.photos?.[0] || 'https://images.unsplash.com/photo-1521292270410-a8c4d716d518?auto=format&fit=crop&w=900&q=80'}
                        alt={exp?.title || 'Experience'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* City pill */}
                      <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                        {exp?.location?.city || 'Local'}
                      </span>
                      {/* Price pill */}
                      <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-emerald-700 text-[12px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                        {formatPrice(exp?.price || 0)}
                      </span>
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-4">
                    <Link to={`/experiences/${exp._id}`} className="no-underline flex-1">
                      <h2 className="text-[14px] font-bold text-stone-900 line-clamp-2 leading-snug mb-1">
                        {exp?.title || 'Experience'}
                      </h2>
                      <p className="text-[12px] text-stone-400 font-medium">
                        {formatDuration(exp?.duration)}
                      </p>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-3 mb-4">
                      <StarIcon />
                      <span className="text-[12px] font-semibold text-stone-700">
                        {rating > 0 ? rating.toFixed(1) : 'New'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        ({reviews} {reviews === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                      <Link
                        to={`/experiences/${exp._id}`}
                        className="flex-1 text-center text-[12px] font-semibold text-emerald-700 border border-emerald-200 rounded-lg py-2 hover:bg-emerald-50 transition-colors no-underline"
                      >
                        View details
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleWishlist(exp._id)}
                        disabled={isPendingFor(exp._id)}
                        className="flex-1 text-[12px] font-semibold text-rose-500 border border-rose-200 rounded-lg py-2 hover:bg-rose-50 transition-colors disabled:opacity-50"
                      >
                        {isPendingFor(exp._id) ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default WishlistPage