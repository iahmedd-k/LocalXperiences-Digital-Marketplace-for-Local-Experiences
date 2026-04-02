import React from 'react'

export default function MilestoneList({ milestones = [], unlockedMilestones = [] }) {
  if (!milestones.length) return null

  return (
    <div className="mb-6 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-base font-bold text-emerald-700">
        Milestones
      </div>

      <div className="space-y-2">
        {milestones.map((milestone) => {
          const unlocked = unlockedMilestones.some((item) => item.milestoneId === milestone.milestoneId)

          return (
            <div
              key={milestone.milestoneId}
              className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                unlocked
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <span className="shrink-0 text-xs font-semibold">{unlocked ? 'Done' : 'Locked'}</span>
              <span className="font-semibold">{milestone.title}</span>
              <span className="min-w-0 break-words text-xs">{milestone.description}</span>
              {!unlocked && milestone.progress !== undefined ? (
                <span className="text-xs">{milestone.progress} / {milestone.targetCount}</span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
