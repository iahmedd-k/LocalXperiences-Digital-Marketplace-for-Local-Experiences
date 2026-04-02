import React from 'react';

export default function RewardToast({ badge, milestone, points, onClose }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-white border border-emerald-200 shadow-lg px-6 py-4 flex items-center gap-3 animate-fade-in">
      <div className="text-3xl">🎉</div>
      <div>
        {badge && <div className="font-bold text-emerald-700 text-sm mb-1">New Badge Unlocked!</div>}
        {milestone && <div className="font-bold text-blue-700 text-sm mb-1">Milestone Unlocked!</div>}
        {badge && <div className="text-base font-semibold text-slate-800 mb-1">You're now a {badge}!</div>}
        {milestone && <div className="text-base font-semibold text-slate-800 mb-1">{milestone}</div>}
        {points ? <div className="text-xs text-emerald-600 font-semibold">+{points} bonus points awarded</div> : null}
      </div>
      <button onClick={onClose} className="ml-4 text-xs text-slate-400 hover:text-slate-700">✕</button>
    </div>
  );
}
