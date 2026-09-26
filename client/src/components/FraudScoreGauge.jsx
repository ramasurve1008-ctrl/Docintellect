import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Sparkles, AlertOctagon } from 'lucide-react';

export default function FraudScoreGauge({ score = 0, riskLevel = 'Low', recommendation = 'Auto-Approve' }) {
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
      bg: 'bg-emerald-950/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      bar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    amber: {
      bg: 'bg-amber-950/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      bar: 'bg-gradient-to-r from-amber-500 to-orange-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    rose: {
      bg: 'bg-rose-950/20',
      border: 'border-rose-500/30',
      text: 'text-rose-400',
      bar: 'bg-gradient-to-r from-rose-500 to-red-400',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)]',
    },
  }[color];

  return (
    <div className={`rounded-3xl border p-5 glass-panel ${colorStyles.bg} ${colorStyles.border} ${colorStyles.glow} transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${colorStyles.badge}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white block">
              AI Fraud Assessment
            </span>
            <span className="text-[10px] text-slate-400">Gemini Risk Heuristics</span>
          </div>
        </div>

        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${colorStyles.badge}`}>
          {color === 'rose' && <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping"></span>}
          {label}
        </span>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs text-slate-300 font-medium">Anomaly Risk Index</span>
        <span className={`text-3xl font-extrabold font-mono tracking-tight ${colorStyles.text}`}>
          {normalizedScore}
          <span className="text-xs text-slate-500 font-normal"> / 100</span>
        </span>
      </div>

      {/* Segmented Gradient Progress bar */}
      <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorStyles.bar}`}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>

      {/* Recommendation footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Automated Decision:</span>
        <span className={`font-bold flex items-center gap-1 ${colorStyles.text}`}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>{recommendation || (normalizedScore > 65 ? 'Flag for Special Investigation' : 'Auto-Approve Claim')}</span>
        </span>
      </div>
    </div>
  );
}
