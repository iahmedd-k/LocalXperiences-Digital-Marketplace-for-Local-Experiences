import React from 'react';
import { CheckCircle2, Award, Info } from 'lucide-react';

export default function RewardsSummaryCard({ checkInCount = 0, badges = [] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-2xl min-w-[200px] border border-emerald-100 shadow-inner">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mb-2" />
        <span className="text-5xl font-extrabold text-emerald-950 tracking-tighter">{checkInCount}</span>
        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Check-ins</span>
      </div>
      
      <div className="flex-1 w-full">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-slate-800">Earned Badges</h3>
          </div>
        </div>
        
        {badges.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-center flex flex-col items-center gap-2">
            <Info className="w-5 h-5 text-slate-300" />
            <p className="text-sm text-slate-500 font-medium">
              Check in to local experiences physically to start earning badges!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.map(b => (
              <div key={b} title={b} className="flex items-center gap-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 px-4 py-2.5 rounded-xl shadow-sm hover:-translate-y-0.5 transition-transform">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs" style={{ boxShadow: 'inset 0 1px 3px rgba(251, 191, 36, 0.4)' }}>
                  ★
                </div>
                <span className="text-sm font-semibold text-amber-900">{b}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-5 text-[11px] text-slate-400 font-medium flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg w-max">
          <Info className="w-3.5 h-3.5" />
          Milestones: 5 = <span className="text-slate-600">Local Explorer</span>, 10 = <span className="text-slate-600">Adventure Seeker</span>, 25 = <span className="text-slate-600">City Insider</span>, 50 = <span className="text-slate-600">Legend</span>
        </div>
      </div>
    </div>
  );
}
