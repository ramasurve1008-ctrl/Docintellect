import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Filter,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  const stats = analytics || {
    totalProcessed: documents.length,
    verifiedCount: documents.filter((d) => d.status === 'Verified').length,
    flaggedCount: documents.filter((d) => d.status === 'Flagged').length,
    totalClaimValue: documents.reduce(
      (sum, d) => sum + (Number(d.extractedData?.financial?.totalAmount) || 0),
      0
    ),
    avgProcessingTimeMs: 1250,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Claims Ingestion &amp; Verification Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multimodal document understanding and automated fraud audit
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            title="Refresh dashboard"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-all flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/upload"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Document</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Ingested
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{stats.totalProcessed}</span>
            <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
              <Zap className="w-3 h-3 mr-0.5" /> 100% OCR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Ingested via Gemini Vision</p>
        </div>

        {/* Auto-Approved / Verified */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Verified / Clean
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {stats.verifiedCount}
            </span>
            <span className="text-[11px] text-slate-400">
              {stats.totalProcessed > 0
                ? `${Math.round((stats.verifiedCount / stats.totalProcessed) * 100)}% Auto-cleared`
                : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reconciled without anomalies</p>
        </div>

        {/* Flagged Anomalies */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Flagged Anomalies
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-mono">
              {stats.flaggedCount}
            </span>
            <span className="text-[11px] text-rose-400 font-medium">Audit Required</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calculation mismatch / High fraud</p>
        </div>

        {/* Total Claim Value */}
        <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-slate-700 transition-all shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Claims Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-brand-300 font-mono">
              ₹{(stats.totalClaimValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Avg speed: <span className="text-brand-400 font-mono">{stats.avgProcessingTimeMs}ms</span>
          </p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="rounded-2xl border border-slate-800 bg-[#0f1422] overflow-hidden shadow-xl">
        {/* Table Controls (Search & Status Tabs) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Verified', 'Flagged', 'Pending', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search patient, hospital, bill #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </form>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Document / File</th>
                <th className="py-3 px-4">Claim Type</th>
                <th className="py-3 px-4">Patient &amp; Policy</th>
                <th className="py-3 px-4">Provider / Facility</th>
                <th className="py-3 px-4 text-right">Claim Amount (₹)</th>
                <th className="py-3 px-4 text-center">Fraud Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {documents.map((doc) => {
                const totalAmt = Number(doc.extractedData?.financial?.totalAmount) || 0;
                const patientName = doc.extractedData?.patient?.name || 'Unknown Patient';
                const policyNo = doc.extractedData?.patient?.insurancePolicyNumber || 'No Policy #';
                const providerName = doc.extractedData?.provider?.name || 'Healthcare Facility';
                const fraudScore = doc.fraudScore || 0;

                return (
                  <tr key={doc._id || doc.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-brand-400 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate max-w-[180px]">
                          <p className="font-semibold text-slate-200 truncate group-hover:text-brand-400 transition-colors">
                            {doc.originalName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(doc.createdAt).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                        {doc.docType || 'Medical Bill'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-200">{patientName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{policyNo}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-300 truncate max-w-[160px] block" title={providerName}>
                        {providerName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          fraudScore >= 70
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : fraudScore >= 30
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {fraudScore}/100
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={doc.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/documents/${doc._id || doc.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600/15 hover:bg-brand-600 text-brand-400 hover:text-white text-xs font-semibold transition-all"
                      >
                        <span>Review</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {documents.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No documents found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload a claim document or test one of the pre-built samples.
                    </p>
                    <Link
                      to="/upload"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Upload First Claim
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
