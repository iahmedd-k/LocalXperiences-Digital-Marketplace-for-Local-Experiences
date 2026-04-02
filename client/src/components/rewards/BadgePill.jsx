import React from 'react';

const BADGE_COLORS = {
  Explorer: 'bg-gray-200 text-gray-700',
  Adventurer: 'bg-green-100 text-green-700',
  'Local Legend': 'bg-blue-100 text-blue-700',
  'City Ambassador': 'bg-yellow-100 text-yellow-800',
  'First Timer': 'bg-emerald-100 text-emerald-700',
  'Streak Master': 'bg-orange-100 text-orange-700',
  'New Host': 'bg-violet-100 text-violet-700',
  'Rising Host': 'bg-indigo-100 text-indigo-700',
  'Top Rated Host': 'bg-pink-100 text-pink-700',
  'Community Host': 'bg-cyan-100 text-cyan-700',
};

export default function BadgePill({ badge, className = '' }) {
  if (!badge) return null;
  const color = BADGE_COLORS[badge] || 'bg-slate-200 text-slate-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color} ${className}`}>
      🏅 {badge}
    </span>
  );
}
