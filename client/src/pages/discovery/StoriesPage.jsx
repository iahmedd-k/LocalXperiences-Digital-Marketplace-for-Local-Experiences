import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Footer from '../../components/Footer.jsx'
import useTranslation from '../../hooks/useTranslation.js';
import { getStories } from '../../services/storyService.js'

const CATEGORY_COLORS = {
  culture: 'bg-[#EAF8F2] text-[#00AA6C]',
  food: 'bg-amber-50 text-amber-700',
  adventure: 'bg-[#EAF8F2] text-[#0f2d1a]',
  nature: 'bg-[#EAF8F2] text-[#00AA6C]',
  'city guide': 'bg-slate-100 text-slate-600',
  'hidden gems': 'bg-pink-50 text-pink-700',
  default: 'bg-slate-100 text-slate-500',
}

const categoryClass = (cat) => CATEGORY_COLORS[(cat || '').toLowerCase()] || CATEGORY_COLORS.default

const SkeletonSlide = () => (
  <div className="animate-pulse relative h-[480px] w-full overflow-hidden rounded-2xl bg-slate-200">
    <div className="absolute bottom-10 left-10 space-y-3">
      <div className="h-8 w-80 rounded bg-slate-300" />
      <div className="h-4 w-52 rounded bg-slate-300" />
      <div className="h-9 w-28 rounded-full bg-slate-300" />
    </div>
  </div>
)

const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white">
    <div className="h-52 bg-slate-100" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-3/4 rounded bg-slate-100" />
      <div className="h-3 w-1/2 rounded bg-slate-100" />
    </div>
  </div>
)

function StoryCard({ story, compact = false, t }) {
  return (
    <Link
      to={`/stories/${story.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className={`relative overflow-hidden ${compact ? 'h-48' : 'h-52'}`}>
        <img
          src={story.coverImage}
          alt={story.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider shadow-sm ${categoryClass(story.category)}`}>
          {story.category || t('stories_category')}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="min-h-11 line-clamp-2 text-[1rem] font-bold leading-6 text-[#0f2d1a] transition-colors group-hover:text-emerald-700">
          {story.title}
        </h3>
        {!compact && story.excerpt ? (
          <p className="mt-2 line-clamp-2 text-[0.78rem] leading-6 text-slate-500">
            {story.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-2">
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#EAF8F2] text-[0.7rem] font-bold text-[#00AA6C]">
              {(story.hostId?.name || 'H')[0].toUpperCase()}
            </div>
            <span className="text-[0.75rem] font-semibold text-slate-700">{story.hostId?.name || t('stories_host')}</span>
          </div>
          <span className="text-[0.7rem] text-slate-400">{story.readTimeMinutes || 6} {t('story_min_read')}</span>
        </div>
      </div>
    </Link>
  )
}

function HeroSlider({ stories, t }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)
  const slides = stories.slice(0, 6)

  const go = (idx) => {
    setCurrent((idx + slides.length) % slides.length)
  }

  useEffect(() => {
    timerRef.current = setInterval(() => go(current + 1), 5000)
    return () => clearInterval(timerRef.current)
  }, [current, slides.length])

  if (!slides.length) return <SkeletonSlide />

  const story = slides[current]

  return (
    <div className="relative h-[480px] w-full overflow-hidden rounded-2xl">
      {slides.map((item, index) => (
        <div
          key={item._id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: index === current ? 1 : 0 }}
        >
          <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.72)_40%,rgba(0,0,0,.08)_100%)]" />
        </div>
      ))}

      <button
        onClick={() => go(current - 1)}
        className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
        aria-label={t("stories_previous")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      <button
        onClick={() => go(current + 1)}
        className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-white"
        aria-label={t("stories_next")}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <div className="absolute bottom-0 left-0 right-0 z-10 px-8 pb-10">
        {story.category ? (
          <span className={`mb-3 inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${categoryClass(story.category)}`}>
            {story.category}
          </span>
        ) : null}
        <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', fontWeight: 700, color: '#fff', lineHeight: 1.25, maxWidth: 700 }}>
          {story.title}
        </h2>
        {story.excerpt ? (
          <p className="mt-2 line-clamp-2 max-w-[480px] text-[.85rem] text-white/75">
            {story.excerpt}
          </p>
        ) : null}
        <Link
          to={`/stories/${story.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-[.8rem] font-bold text-[#0f2d1a] no-underline"
        >
          {t('stories_read_more')}
        </Link>
      </div>

      <div className="absolute bottom-4 right-6 z-10 flex gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => go(index)}
            style={{
              width: index === current ? 20 : 6,
              height: 6,
              borderRadius: 100,
              background: index === current ? '#34E0A1' : 'rgba(255,255,255,.5)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

function TravelYourWay({ stories, t }) {
  const scrollRef = useRef(null)
  const cards = stories.slice(0, 8)

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
    }
  }

  return (
    <section className="mt-14">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '1.35rem', fontWeight: 700, color: '#0f2d1a', margin: 0 }}>
            {t('stories_travel_way')}
          </h2>
          <p className="mt-1 text-[.82rem] text-slate-500">
            {t('stories_guides')}
          </p>
        </div>
        <button
          onClick={() => scroll(1)}
          className="hidden h-[38px] w-[38px] items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 sm:flex"
          aria-label={t('stories_scroll')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cards.map((story) => (
            <div key={story._id} className="shrink-0" style={{ width: 280 }}>
              <StoryCard story={story} compact t={t} />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-16 bg-[linear-gradient(to_left,#fff,transparent)]" />
      </div>
    </section>
  )
}

export default function StoriesPage() {
  const { t } = useTranslation()
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['stories'],
    queryFn: () => getStories({ limit: 24 }).then((res) => res.data.data || []),
  })

  const gridStories = stories.slice(6)

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="space-y-10">
            <SkeletonSlide />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
            </div>
          </div>
        ) : !stories.length ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>{t('stories_empty_title')}</h2>
            <p className="mt-2 text-[.82rem] text-slate-500">{t('stories_empty_sub')}</p>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <div className="mb-4 flex items-center gap-2">
                <span style={{ width: 3, height: 18, borderRadius: 100, background: '#00AA6C', display: 'inline-block' }} />
                <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0f2d1a', margin: 0 }}>{t('stories_featured')}</h2>
              </div>
              <HeroSlider stories={stories} t={t} />
            </div>

            <TravelYourWay stories={stories} t={t} />

            {gridStories.length > 0 ? (
              <section className="mt-14">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ width: 3, height: 18, borderRadius: 100, background: '#00AA6C', display: 'inline-block' }} />
                    <h2 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0f2d1a', margin: 0 }}>{t('stories_all')}</h2>
                  </div>
                  <span className="text-[.72rem] text-slate-400">{gridStories.length} {t('stories_count_suffix')}</span>
                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {gridStories.map((story) => (
                    <StoryCard key={story._id} story={story} t={t} />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="mt-14 rounded-2xl border border-slate-100 bg-slate-50 px-8 py-10 text-center">
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#EAF8F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00AA6C" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h3 style={{ fontFamily: "'Georgia', serif", fontSize: '1.15rem', fontWeight: 700, color: '#0f2d1a' }}>{t('stories_never_miss')}</h3>
              <p className="mt-1.5 text-[.8rem] text-slate-500">{t('stories_inbox')}</p>
              <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder={t('stories_email_placeholder')}
                  style={{ borderRadius: 100, border: '1px solid #e2e8f0', padding: '9px 18px', fontSize: '.8rem', outline: 'none', width: 260 }}
                />
                <button style={{ borderRadius: 100, background: '#0f2d1a', color: '#fff', padding: '9px 22px', fontSize: '.8rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t("footer_subscribe")}</button>
              </div>
              <p className="mt-2.5 text-[.68rem] text-slate-400">{t('stories_no_spam')}</p>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
