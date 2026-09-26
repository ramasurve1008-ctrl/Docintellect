import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

export default function FraudScoreGauge({ score = 0, riskLevel = 'Low', recommendation = 'Auto-Approve' }) {
  // Score 0-100
  const normalizedScore = Math.min(Math.max(Math.round(score), 0), 100);

  let color = 'emerald';
  let Icon = ShieldCheck;
  let label = 'Low Risk';

  if (normalizedScore >= 70 || riskLevel === 'High') {
    color = 'rose';
    Icon = ShieldX;
    label = 'High Fraud Risk';
  } else if (normalizedScore >= 30 || riskLevel === 'Medium') {
    color = 'amber';
    Icon = ShieldAlert;
    label = 'Medium Risk';
  }

  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bar: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-amber-500',
      glow: 'shadow-amber-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      bar: 'bg-rose-500',
      glow: 'shadow-rose-500/20',
    },
  }[color];

  return (
    <div className={`rounded-xl border p-4 ${colorStyles.bg} ${colorStyles.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${colorStyles.text}`} />
          <span className="text-sm font-semibold text-slate-200">Fraud Assessment</span>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorStyles.bg} ${colorStyles.text}`}>
          {label}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs text-slate-400">Calculated Risk Index</span>
        <span className={`text-2xl font-extrabold font-mono ${colorStyles.text}`}>
          {normalizedScore}<span className="text-xs text-slate-500 font-normal">/100</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colorStyles.bar}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between text-xs">
        <span className="text-slate-400">Recommendation:</span>
        <span className="font-semibold text-slate-200">
          {recommendation || (normalizedScore > 65 ? 'Reject / Investigate' : 'Approve Claim')}
        </span>
      </div>
    </div>
  );
}
