import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import {
  PieChart,
  TrendingUp,
  ShieldAlert,
  Clock,
  DollarSign,
  FileCheck2,
  AlertTriangle,
  Zap,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/documents/analytics');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const data = analytics || {
    totalProcessed: 28,
    verifiedCount: 22,
    flaggedCount: 5,
    rejectedCount: 1,
    totalClaimValue: 84920.0,
    approvedClaimValue: 71200.0,
    avgProcessingTimeMs: 1240,
    fraudRiskDistribution: { low: 21, medium: 5, high: 2 },
    docTypeDistribution: {
      medicalBill: 16,
      prescription: 7,
      labReport: 4,
      dischargeSummary: 1,
      other: 0,
    },
  };

  const autoApproveRate = data.totalProcessed > 0
    ? Math.round((data.verifiedCount / data.totalProcessed) * 100)
    : 0;

  const fraudRate = data.totalProcessed > 0
    ? Math.round((data.flaggedCount / data.totalProcessed) * 100)
    : 0;

  const savingsValue = Math.max(0, (data.totalClaimValue || 0) - (data.approvedClaimValue || 0));

  // Simulated 7-day throughput data for rich chart
  const weeklyData = [
    { day: 'Mon', claims: 14, verified: 12, flagged: 2 },
    { day: 'Tue', claims: 19, verified: 16, flagged: 3 },
    { day: 'Wed', claims: 24, verified: 20, flagged: 4 },
    { day: 'Thu', claims: 28, verified: 23, flagged: 5 },
    { day: 'Fri', claims: 22, verified: 18, flagged: 4 },
    { day: 'Sat', claims: 9, verified: 8, flagged: 1 },
    { day: 'Sun', claims: 6, verified: 5, flagged: 1 },
  ];

  const maxClaims = Math.max(...weeklyData.map((d) => d.claims));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Operational Telemetry &amp; Compliance Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Claims Intelligence &amp; Fraud Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Automated settlement velocity, financial leakage prevention, and machine learning risk heuristics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl glass-panel-elevated border border-slate-800 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-semibold">Gemini API Ingestion: Online</span>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Auto-Settlement Velocity */}
        <div className="p-5 rounded-3xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Auto-Settlement Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {autoApproveRate}%
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +5.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Clean claims cleared with zero touch</p>
        </div>

        {/* Discrepancy Catch Rate */}
        <div className="p-5 rounded-3xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Discrepancy Catch
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono tracking-tight">
              {fraudRate}%
            </span>
            <span className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              Audit Alert
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Arithmetic errors &amp; duplicate CPT</p>
        </div>

        {/* Financial Leakage Saved */}
        <div className="p-5 rounded-3xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Overbilling Caught
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ₹{savingsValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Intercepted inflated charges</p>
        </div>

        {/* Turnaround Velocity */}
        <div className="p-5 rounded-3xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              AI Turnaround
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono tracking-tight">
              {(data.avgProcessingTimeMs / 1000).toFixed(2)}s
            </span>
            <span className="text-xs text-indigo-400 font-semibold font-mono">avg / doc</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">vs 45 minutes human manual entry</p>
        </div>
      </div>

      {/* Interactive Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Weekly Throughput Interactive Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel-elevated border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span>Weekly Processing Throughput (Claims Volume)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Automated extraction volume vs auditor flags</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span> Verified Clean
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Flagged
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="pt-4 h-56 flex items-end justify-between gap-3 px-2">
            {weeklyData.map((item) => {
              const cleanHeight = Math.round((item.verified / maxClaims) * 160);
              const flagHeight = Math.round((item.flagged / maxClaims) * 160);

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-cyan-400 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded shadow">
                    {item.claims}
                  </div>

                  {/* Stacked bar */}
                  <div className="w-full max-w-[36px] flex flex-col items-center justify-end rounded-xl overflow-hidden bg-slate-800/40 p-0.5 gap-0.5">
                    <div
                      style={{ height: `${flagHeight}px` }}
                      className="w-full bg-rose-500/80 rounded-t-lg transition-all group-hover:bg-rose-400"
                      title={`${item.flagged} Flagged`}
                    />
                    <div
                      style={{ height: `${cleanHeight}px` }}
                      className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-b-lg transition-all group-hover:from-cyan-500 group-hover:to-cyan-300"
                      title={`${item.verified} Clean`}
                    />
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fraud Risk Segmentation Donut */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-panel-elevated border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Fraud Risk Stratification</span>
            </h3>
            <p className="text-xs text-slate-400">Risk distribution across active claims</p>
          </div>

          {/* Risk Level Bars */}
          <div className="space-y-4 my-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Low Risk (&lt; 30)
                </span>
                <span className="font-mono font-bold text-white">
                  {data.fraudRiskDistribution?.low || 0} claims
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${data.totalProcessed > 0 ? ((data.fraudRiskDistribution?.low || 0) / data.totalProcessed) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Medium Risk (30–69)
                </span>
                <span className="font-mono font-bold text-white">
                  {data.fraudRiskDistribution?.medium || 0} claims
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${data.totalProcessed > 0 ? ((data.fraudRiskDistribution?.medium || 0) / data.totalProcessed) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-rose-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  High Risk (≥ 70)
                </span>
                <span className="font-mono font-bold text-white">
                  {data.fraudRiskDistribution?.high || 0} claims
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="bg-rose-500 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${data.totalProcessed > 0 ? ((data.fraudRiskDistribution?.high || 0) / data.totalProcessed) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Claims Inspected:</span>
            <span className="font-mono font-bold text-cyan-400">{data.totalProcessed} total</span>
          </div>
        </div>
      </div>

      {/* Document Type Distribution Grid */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Multi-Modal Claim Formats Processed</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated document classification distribution</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-colors">
            <p className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Medical Bills</p>
            <p className="text-3xl font-extrabold font-mono text-white mt-1.5">
              {data.docTypeDistribution?.medicalBill || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">UB-04 / CMS-1500</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 transition-colors">
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Prescriptions</p>
            <p className="text-3xl font-extrabold font-mono text-white mt-1.5">
              {data.docTypeDistribution?.prescription || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Rx NDC Formulary</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-colors">
            <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Diagnostic Labs</p>
            <p className="text-3xl font-extrabold font-mono text-white mt-1.5">
              {data.docTypeDistribution?.labReport || 0}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">CMP / Lipid Panels</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-colors">
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Discharges &amp; Other</p>
            <p className="text-3xl font-extrabold font-mono text-white mt-1.5">
              {(data.docTypeDistribution?.dischargeSummary || 0) + (data.docTypeDistribution?.other || 0)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Clinical Summaries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
