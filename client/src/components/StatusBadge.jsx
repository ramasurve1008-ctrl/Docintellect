import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, XCircle, Loader2 } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  switch (status?.toLowerCase()) {
    case 'verified':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Verified
        </span>
      );
    case 'flagged':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 ${sizeClasses[size]}`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Flagged (Audit)
        </span>
      );
    case 'rejected':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-500/20 text-slate-400 border border-slate-600 ${sizeClasses[size]}`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    case 'processing':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 ${sizeClasses[size]}`}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          AI Processing
        </span>
      );
    case 'pending':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses[size]}`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Review
        </span>
      );
  }
}
