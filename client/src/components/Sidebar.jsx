import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileCheck2,
  PieChart,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/upload', label: 'Ingest Document', icon: UploadCloud },
    { to: '/analytics', label: 'Fraud & Analytics', icon: PieChart },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f1422] flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Claims Operations
          </p>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600/15 text-brand-400 border border-brand-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Medical Document Processing Filters & Types */}
        <div className="pt-2">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Ingestion Types
          </p>
          <div className="space-y-1.5 px-3 text-xs text-slate-400">
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/40">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                Medical Bills
              </span>
              <span className="font-mono text-[10px] text-slate-400">CMS-1500 / UB-04</span>
            </div>
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/40">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Prescriptions
              </span>
              <span className="font-mono text-[10px] text-slate-400">Rx / NDC</span>
            </div>
            <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-800/40">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                Lab Diagnostics
              </span>
              <span className="font-mono text-[10px] text-slate-400">LOINC / Panels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Compliance Badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
            <ShieldAlert className="w-4 h-4 text-brand-400" />
            <span>HITL Enabled</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Human-in-the-loop verification pipeline for claims audit compliance.
          </p>
        </div>
      </div>
    </aside>
  );
}
