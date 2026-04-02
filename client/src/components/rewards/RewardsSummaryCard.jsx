import React from 'react'
import { Award, CheckCircle2, Info } from 'lucide-react'

export default function RewardsSummaryCard({ checkInCount = 0, badges = [] }) {
  return (
    <div className="mb-6 flex min-w-0 flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:flex-row md:items-start">
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-inner md:w-[190px] md:flex-none">
        <CheckCircle2 className="mb-2 h-10 w-10 text-emerald-600" />
        <span className="text-4xl font-extrabold tracking-tighter text-emerald-950 sm:text-5xl">{checkInCount}</span>
        <span className="mt-1 text-[11px] font-bold uppercase tracking-widest text-emerald-600">Check-ins</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-4 flex min-w-0 items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="h-5 w-5 text-amber-500" />
          <h3 className="min-w-0 text-lg font-bold text-slate-800">Earned Badges</h3>
        </div>

        {badges.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
            <Info className="h-5 w-5 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              Check in to local experiences physically to start earning badges!
            </p>
          </div>
        ) : (
          <div className="flex min-w-0 flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge}
                title={badge}
                className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-3 py-2.5 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-600"
                  style={{ boxShadow: 'inset 0 1px 3px rgba(251, 191, 36, 0.4)' }}
                >
                  *
                </div>
                <span className="min-w-0 break-words text-sm font-semibold text-amber-900">{badge}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex max-w-full flex-wrap items-start gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[11px] font-medium text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="min-w-0 break-words">
            Milestones: 5 = <span className="text-slate-600">Local Explorer</span>, 10 = <span className="text-slate-600">Adventure Seeker</span>, 25 = <span className="text-slate-600">City Insider</span>, 50 = <span className="text-slate-600">Legend</span>
          </span>
        </div>
      </div>
    </div>
  )
}
