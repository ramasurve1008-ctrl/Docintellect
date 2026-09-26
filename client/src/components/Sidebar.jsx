import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  PieChart,
  ShieldCheck,
  FileText,
  Pill,
  TestTube2,
  Lock,
  ExternalLink,
  Cpu,
} from 'lucide-react';

export default function Sidebar() {
  const navLinks = [
    { to: '/dashboard', label: 'Claims Workspace', icon: LayoutDashboard },
    { to: '/upload', label: 'Ingest Document', icon: UploadCloud },
    { to: '/analytics', label: 'Fraud & Analytics', icon: PieChart },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0a0f1d] flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)] relative z-20">
      <div className="p-4 space-y-6">
        {/* Navigation Sections */}
        <div>
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Operations &amp; Audit
          </p>
          <nav className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 hover:border hover:border-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                      )}
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Multimodal Document Formats Supported */}
        <div className="pt-1">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
            Supported Modalities
          </p>
          <div className="space-y-2 px-1 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-cyan-500/30 transition-colors">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                Hospital Bills
              </span>
              <span className="font-mono text-[9px] text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                UB-04 / CMS
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 transition-colors">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <Pill className="w-3.5 h-3.5 text-emerald-400" />
                Prescriptions
              </span>
              <span className="font-mono text-[9px] text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Rx / NDC
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
              <span className="flex items-center gap-2 text-slate-300 font-medium">
                <TestTube2 className="w-3.5 h-3.5 text-indigo-400" />
                Diagnostic Labs
              </span>
              <span className="font-mono text-[9px] text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                LOINC
              </span>
            </div>
          </div>
        </div>

        {/* Real-time IDP Pipeline Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800/80">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-xs mb-1.5">
            <Cpu className="w-4 h-4 text-brand-400" />
            <span>AI Pipeline Stack</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Google Gemini 2.5 Flash with sub-second OCR extraction and ICD-10 cross-validation.
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>OCR Confidence</span>
            <span className="text-emerald-400 font-mono font-bold">98.4%</span>
          </div>
        </div>
      </div>

      {/* Trust & HIPAA Badge */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>HIPAA Compliant</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">v1.2.0</span>
        </div>
      </div>
    </aside>
  );
}
