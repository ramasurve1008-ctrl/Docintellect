import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Bell,
  LogOut,
  Sparkles,
  ShieldCheck,
  Plus,
  AlertTriangle,
  ChevronDown,
  Activity,
  Zap,
} from 'lucide-react';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [anomalies, setAnomalies] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api
        .get('/documents')
        .then((res) => {
          if (res.data?.success) {
            const flagged = (res.data.documents || [])
              .filter((d) => d.status === 'Flagged' || (d.anomalies && d.anomalies.length > 0))
              .slice(0, 5);
            setAnomalies(flagged);
            setUnreadCount(flagged.length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080c16]/85 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all duration-300">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#080c16]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  DocIntellect
                </span>
                <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                  AI IDP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Medical Insurance Claims Automation
              </p>
            </div>
          </Link>
        </div>

        {/* Center / System Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">Gemini 2.5 Flash</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>82ms latency</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HITL Active</span>
          </div>
        </div>

        {/* Right Section: Ingest CTA, Notifications & User */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <Link
            to="/upload"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Claim</span>
          </Link>

          {/* Anomaly Notification Bell with Popover */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Audit alerts & anomalies"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-elevated p-4 shadow-2xl z-50 border border-slate-700/80 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Audit Notifications ({unreadCount})
                    </span>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                  {anomalies.length > 0 ? (
                    anomalies.map((doc) => (
                      <Link
                        key={doc._id}
                        to={`/documents/${doc._id}`}
                        onClick={() => setNotificationsOpen(false)}
                        className="block p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-rose-500/20 hover:border-rose-500/40 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-300 truncate max-w-[200px]">
                            {doc.originalName}
                          </span>
                          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            Risk {doc.fraudScore}/100
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {doc.anomalies?.[0]?.description ||
                            'Arithmetic variance or duplicate procedure flagged for human review.'}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="py-6 text-center text-xs text-slate-400">
                      No active anomalies detected. All claims clear!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-brand-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-brand-500/20 ring-2 ring-white/10">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-200 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-cyan-400 font-medium leading-tight">
                    {user.role || 'Claims Adjuster'}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
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
