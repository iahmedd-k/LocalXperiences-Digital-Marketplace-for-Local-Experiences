import React from 'react';

export default function MilestoneList({ milestones = [], unlockedMilestones = [] }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm mb-6">
      <div className="mb-2 text-base font-bold text-emerald-700 flex items-center gap-2">
        🎯 Milestones
      </div>
      <div className="space-y-2">
        {milestones.map((m) => {
          const unlocked = unlockedMilestones.some((um) => um.milestoneId === m.milestoneId);
          return (
            <div key={m.milestoneId} className={`flex items-center gap-2 text-sm ${unlocked ? 'text-emerald-700' : 'text-slate-400'}`}>
              <span>{unlocked ? '✅' : '🔒'}</span>
              <span className="font-semibold">{m.title}</span>
              <span className="ml-2 text-xs">{m.description}</span>
              {!unlocked && m.progress !== undefined && (
                <span className="ml-2 text-xs">{m.progress} / {m.targetCount}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
