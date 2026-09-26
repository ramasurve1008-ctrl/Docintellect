import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ShieldAlert,
  Zap,
  Filter,
  X,
  TrendingUp,
  Copy,
  Check,
  Building2,
  Calendar,
  Sparkles,
  Pill,
  TestTube2,
  Stethoscope,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [docsRes, analyticsRes] = await Promise.all([
        api.get('/documents', {
          params: {
            status: statusFilter !== 'All' ? statusFilter : undefined,
            search: search.trim() || undefined,
          },
        }),
        api.get('/documents/analytics'),
      ]);

      if (docsRes.data.success) {
        setDocuments(docsRes.data.documents || []);
      }
      if (analyticsRes.data.success) {
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDashboardData();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter documents by docType on client if typeFilter selected
  const filteredDocuments = documents.filter((doc) => {
    if (typeFilter === 'All') return true;
    if (typeFilter === 'Bills') return doc.docType?.toLowerCase().includes('bill');
    if (typeFilter === 'Prescriptions') return doc.docType?.toLowerCase().includes('prescription');
    if (typeFilter === 'Labs') return doc.docType?.toLowerCase().includes('lab');
    return true;
  });

  const stats = analytics || {
    totalProcessed: documents.length,
    verifiedCount: documents.filter((d) => d.status === 'Verified').length,
    flaggedCount: documents.filter((d) => d.status === 'Flagged').length,
    totalClaimValue: documents.reduce(
      (sum, d) => sum + (Number(d.extractedData?.financial?.totalAmount) || 0),
      0
    ),
    avgProcessingTimeMs: 1180,
  };

  const getDocTypeIcon = (docType = '') => {
    const lower = docType.toLowerCase();
    if (lower.includes('prescription')) {
      return { icon: Pill, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' };
    }
    if (lower.includes('lab')) {
      return { icon: TestTube2, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/25' };
    }
    return { icon: Stethoscope, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/25' };
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Live Status Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-panel-elevated border border-slate-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-brand-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Intelligent Medical Claims Processing Engine Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
                {user?.name || 'Claims Adjuster'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Real-time multimodal document understanding, CPT/ICD-10 code extraction, and automated mathematical discrepancy auditing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              title="Refresh claims data"
              className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all flex items-center gap-2 text-xs font-bold shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>

            <Link
              to="/upload"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ingest Document</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards with Cyber Glow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ingested */}
        <div className="group relative p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Ingested
            </span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {stats.totalProcessed}
            </span>
            <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              <Zap className="w-3 h-3" /> 100% OCR
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Sub-second extraction</span>
            <span className="text-slate-300 font-mono font-medium">{stats.avgProcessingTimeMs}ms avg</span>
          </div>
        </div>

        {/* Auto-Verified Claims */}
        <div className="group relative p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Verified / Clean
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
              {stats.verifiedCount}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {stats.totalProcessed > 0
                ? `${Math.round((stats.verifiedCount / stats.totalProcessed) * 100)}% Auto-cleared`
                : '0%'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Reconciled sum</span>
            <span className="text-emerald-400 font-medium">Zero variance</span>
          </div>
        </div>

        {/* Flagged Anomalies */}
        <div className="group relative p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Flagged Anomalies
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-400 font-mono tracking-tight">
              {stats.flaggedCount}
            </span>
            <span className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
              Audit Required
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Math / CPT discrepancy</span>
            <span className="text-rose-400 font-medium">Review needed</span>
          </div>
        </div>

        {/* Total Claims Volume in INR */}
        <div className="group relative p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Volume
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              ₹{(stats.totalClaimValue || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Financial throughput</span>
            <span className="text-indigo-400 font-mono font-medium">INR (₹)</span>
          </div>
        </div>
      </div>

      {/* Main Claims Workspace Table Card */}
      <div className="rounded-3xl border border-slate-800 bg-[#0a0f1d] overflow-hidden shadow-2xl">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Verified', 'Flagged', 'Pending', 'Rejected'].map((status) => {
              const count =
                status === 'All'
                  ? documents.length
                  : documents.filter((d) => d.status === status).length;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-cyan-500 to-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{status}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      statusFilter === status
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Filters: Doc Type & Search */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Type selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              {['All', 'Bills', 'Prescriptions', 'Labs'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    typeFilter === type
                      ? 'bg-slate-800 text-cyan-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Live Search input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, hospital, bill #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    fetchDashboardData();
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-slate-800/80 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Document / Modality</th>
                <th className="py-3.5 px-4">Patient &amp; Policy</th>
                <th className="py-3.5 px-4">Provider / Facility</th>
                <th className="py-3.5 px-4 text-right">Claim Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Fraud Risk</th>
                <th className="py-3.5 px-4">Audit Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredDocuments.map((doc) => {
                const totalAmt = Number(doc.extractedData?.financial?.totalAmount) || 0;
                const patientName = doc.extractedData?.patient?.name || 'Unknown Patient';
                const policyNo = doc.extractedData?.patient?.insurancePolicyNumber || 'No Policy #';
                const providerName = doc.extractedData?.provider?.name || 'Healthcare Facility';
                const fraudScore = doc.fraudScore || 0;
                const { icon: DocIcon, color: iconColor, bg: iconBg } = getDocTypeIcon(doc.docType);
                const isFlagged = doc.status === 'Flagged';

                return (
                  <tr
                    key={doc._id || doc.id}
                    className={`hover:bg-slate-900/60 transition-colors group ${
                      isFlagged ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    {/* Document details */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor} transition-transform group-hover:scale-105`}
                        >
                          <DocIcon className="w-4 h-4" />
                        </div>
                        <div className="truncate max-w-[210px]">
                          <p className="font-semibold text-slate-100 truncate group-hover:text-cyan-400 transition-colors">
                            {doc.originalName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-400">
                              {doc.docType || 'Medical Bill'}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-[10px] text-slate-400">
                              {(doc.fileSize / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Patient & Policy */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-slate-200">{patientName}</p>
                        <button
                          onClick={() => handleCopy(policyNo, doc._id + '-policy')}
                          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors mt-0.5"
                          title="Click to copy policy #"
                        >
                          <span>{policyNo}</span>
                          {copiedId === doc._id + '-policy' ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="py-4 px-4">
                      <div className="truncate max-w-[180px]">
                        <p className="font-medium text-slate-300 truncate" title={providerName}>
                          {providerName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {doc.extractedData?.provider?.doctorName || 'Attending Physician'}
                        </p>
                      </div>
                    </td>

                    {/* Claim Amount */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono font-bold text-sm text-white">
                        ₹{totalAmt.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Fraud Score */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            fraudScore >= 70
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : fraudScore >= 30
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {fraudScore >= 70 && <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping"></span>}
                          {fraudScore}/100
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 capitalize">
                          {doc.fraudRiskLevel || 'Low'} Risk
                        </span>
                      </div>
                    </td>

                    {/* Audit Status */}
                    <td className="py-4 px-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <Link
                        to={`/documents/${doc._id || doc.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white text-xs font-bold border border-cyan-500/30 hover:border-cyan-400 transition-all shadow-sm group-hover:scale-105"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredDocuments.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-200">No matching claims found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Try adjusting your search or filters, or upload a new claim for multimodal extraction.
                    </p>
                    <Link
                      to="/upload"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-brand-600 text-white text-xs font-bold shadow-md shadow-brand-500/20"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ingest New Claim</span>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
