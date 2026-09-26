import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Cpu, Bell, LogOut, User as UserIcon, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  DocIntellect
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  IDP AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Medical Insurance Claims Automation
              </p>
            </div>
          </Link>
        </div>

        {/* Status Pills & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* AI Engine Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Gemini Vision 2.5 Flash</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Quick User Role Pill */}
          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-brand-400 leading-tight">{user.role || 'Claims Adjuster'}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
