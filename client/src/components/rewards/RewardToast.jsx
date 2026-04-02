import React from 'react';

export default function RewardToast({ badge, milestone, points, onClose }) {
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-start gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 shadow-lg animate-fade-in sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
        Reward
      </div>
      <div className="min-w-0 flex-1">
        {badge && <div className="mb-1 text-sm font-bold text-emerald-700">New Badge Unlocked!</div>}
        {milestone && <div className="mb-1 text-sm font-bold text-blue-700">Milestone Unlocked!</div>}
        {badge && <div className="mb-1 text-base font-semibold text-slate-800">You're now a {badge}!</div>}
        {milestone && <div className="mb-1 text-base font-semibold text-slate-800">{milestone}</div>}
        {points ? <div className="text-xs font-semibold text-emerald-600">+{points} bonus points awarded</div> : null}
      </div>
      <button onClick={onClose} className="ml-2 shrink-0 text-xs text-slate-400 hover:text-slate-700">
        Close
      </button>
    </div>
  );
}
