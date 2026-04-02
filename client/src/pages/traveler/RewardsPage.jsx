import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  Award, CheckCircle, Info, Lock, MapPin,
  Star, Ticket, Trophy, ArrowRight, Zap
} from 'lucide-react'
import { getRewardsConfig } from '../../services/rewardService.js'
import Spinner from '../../components/common/Spinner.jsx'

import Footer from '../../components/common/Footer.jsx'
import Navbar from '../../components/Navbar.jsx'

/* ─── tiny helpers ─────────────────────────────────────── */
const getBadgeIcon = (iconName) => {
  const cls = 'w-6 h-6'
  switch (iconName) {
    case 'ticket':  return <Ticket  className={cls} />
    case 'map-pin': return <MapPin  className={cls} />
    case 'utensils':return <Award   className={cls} />
    default:        return <Star    className={cls} />
  }
}

const HOW_TO = [
  { icon: CheckCircle, label: 'Check in at an experience', pts: 100 },
  { icon: Ticket,      label: 'Complete a booking',        pts: 100 },
  { icon: Info,        label: 'Share your itinerary',      pts: 50  },
]

/* ─── component ────────────────────────────────────────── */
const RewardsPage = () => {
  const { user } = useSelector((s) => s.auth)
  const userRewards = user?.rewards || { points: 0, level: 'Explorer', badges: [] }

  const { data: configRaw, isLoading } = useQuery({
    queryKey: ['rewardsConfig'],
    queryFn: () => getRewardsConfig().then((res) => res.data.data),
  })

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Spinner size="lg" />
      </div>
    )

  const { badges = [], LEVELS = [] } = configRaw || {}

  const currentLevelIndex   = LEVELS.findIndex((l) => l.label === userRewards.level)
  const nextLevel           = LEVELS[currentLevelIndex + 1]
  const currentThreshold    = LEVELS[currentLevelIndex]?.threshold || 0
  const pointsSinceStart    = userRewards.points - currentThreshold
  const pointsToNext        = nextLevel ? nextLevel.threshold - currentThreshold : 0
  const progressPercent     = nextLevel
    ? Math.min(100, Math.round((pointsSinceStart / pointsToNext) * 100))
    : 100

  return (
    <div className="min-h-screen bg-stone-50 font-sans pb-20 lg:pb-0">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Page header ─────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
            Member Rewards
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
            LocalX Rewards
          </h1>
          <p className="mt-2 text-stone-500 text-sm sm:text-base">
            Earn points by exploring your city and unlock exclusive perks.
          </p>
        </div>

        {/* ── Hero status card ────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white">

          {/* dark header */}
          <div className="bg-emerald-950 px-6 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">

              {/* avatar + level */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="shrink-0 w-16 h-16 rounded-xl bg-emerald-800 border border-emerald-700
                                flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-emerald-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                    Current Level
                  </p>
                  <h2 className="text-2xl font-bold text-white truncate">{userRewards.level}</h2>
                  <p className="text-emerald-200/60 text-xs mt-0.5">
                    {userRewards.points.toLocaleString()} pts earned
                  </p>
                </div>
              </div>

              {/* progress */}
              <div className="flex-1 sm:max-w-xs w-full">
                <div className="flex justify-between text-[11px] font-semibold mb-2">
                  <span className="text-emerald-400">
                    {nextLevel ? `Next: ${nextLevel.label}` : 'Max level reached 🎉'}
                  </span>
                  <span className="text-white">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-emerald-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {nextLevel && (
                  <p className="text-emerald-200/50 text-[11px] mt-1.5 text-right">
                    {(nextLevel.threshold - userRewards.points).toLocaleString()} pts to go
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* stats strip */}
          <div className="grid grid-cols-3 divide-x divide-stone-100 border-t border-stone-100">
            {[
              { label: 'Badges',     value: userRewards.badges.length },
              { label: 'Total Pts',  value: userRewards.points.toLocaleString() },
              { label: 'Global Rank',value: `#${Math.floor(Math.random() * 500) + 120}` },
            ].map(({ label, value }) => (
              <div key={label} className="py-5 flex flex-col items-center gap-0.5">
                <span className="text-lg sm:text-xl font-bold text-emerald-600">{value}</span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-stone-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Levels ──────────────────────────────────────── */}
        <section>
          <SectionHeader title="Exploration Levels" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {LEVELS.map((lvl) => {
              const done   = userRewards.points >= lvl.threshold
              const active = userRewards.level === lvl.label
              return (
                <div
                  key={lvl.label}
                  className={`rounded-xl border p-4 transition-all ${
                    active
                      ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100'
                      : done
                      ? 'border-stone-200 bg-white'
                      : 'border-stone-100 bg-stone-50 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-1.5 rounded-lg ${done ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-400'}`}>
                      <Star className="w-4 h-4" fill={done ? 'currentColor' : 'none'} />
                    </div>
                    {done
                      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : <Lock        className="w-4 h-4 text-stone-300" />
                    }
                  </div>
                  <p className={`text-sm font-bold leading-snug ${done ? 'text-stone-800' : 'text-stone-400'}`}>
                    {lvl.label}
                  </p>
                  {lvl.desc && (
                    <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">{lvl.desc}</p>
                  )}
                  <p className="text-[10px] font-bold text-stone-400 mt-3">
                    {lvl.threshold.toLocaleString()} PTS
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Badges ──────────────────────────────────────── */}
        <section>
          <SectionHeader title="Digital Badges" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const has = userRewards.badges.includes(badge.label)
              return (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-5 flex flex-col items-center text-center gap-3 transition-all ${
                    has
                      ? 'bg-white border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                      : 'bg-stone-50 border-stone-100 opacity-50'
                  }`}
                >
                  {/* hexagon badge icon */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                      <path
                        d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z"
                        fill={has ? '#ecfdf5' : '#f8fafc'}
                        stroke={has ? '#10b981' : '#e2e8f0'}
                        strokeWidth="3"
                      />
                    </svg>
                    <span className={`relative z-10 ${has ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {getBadgeIcon(badge.icon)}
                    </span>
                    {!has && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Lock className="w-3 h-3 text-stone-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <p className={`text-xs font-bold leading-tight ${has ? 'text-stone-800' : 'text-stone-400'}`}>
                      {badge.label}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {has
                        ? '✓ Unlocked'
                        : `${badge.condition?.count || 0} ${badge.condition?.event?.replace('_', ' ') || 'milestones'}`
                      }
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── How to earn ─────────────────────────────────── */}
        <section className="rounded-2xl bg-stone-900 text-white p-6 sm:p-8
                            flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400
                            text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <Zap className="w-3 h-3" /> How to earn
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2">Level up faster</h3>
            <p className="text-stone-400 text-sm mb-6 leading-relaxed">
              The more you explore, the more you win. Here's how to rack up points.
            </p>

            <ul className="space-y-3">
              {HOW_TO.map(({ icon: Icon, label, pts }) => (
                <li key={label} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-sm font-medium text-stone-200">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 whitespace-nowrap">
                    +{pts} pts
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
                       text-stone-900 text-sm font-bold px-6 py-3 rounded-xl transition-colors
                       no-underline whitespace-nowrap shrink-0"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  )
}

/* ── small sub-component ──────────────────────────────── */
const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-1 h-5 rounded-full bg-emerald-500" />
    <h2 className="text-base sm:text-lg font-bold text-stone-900">{title}</h2>
  </div>
)

export default RewardsPage