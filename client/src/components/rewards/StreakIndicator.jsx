import React from 'react';

export default function StreakIndicator({ streak, longestStreak }) {
  if (!streak || streak < 2) return null;
  return (
    <div className="flex items-center gap-2 text-orange-600 font-semibold">
      <span>🔥 {streak} week streak</span>
      <span className="text-xs text-slate-500">(Longest: {longestStreak} weeks)</span>
    </div>
  );
}
