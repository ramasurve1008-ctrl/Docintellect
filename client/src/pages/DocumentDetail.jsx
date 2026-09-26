import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import StatusBadge from '../components/StatusBadge';
import FraudScoreGauge from '../components/FraudScoreGauge';
import DataViewer from '../components/DataViewer';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Edit3,
  Save,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Loader2,
  FileText,
} from 'lucide-react';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [notification, setNotification] = useState(null);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      if (res.data.success) {
        setDoc(res.data.document);
        setEditedData(res.data.document.extractedData || {});
        setReviewNotes(res.data.document.reviewNotes || '');
      }
    } catch (err) {
      console.error('Failed to fetch document:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStatusUpdate = async (newStatus) => {
    setSaving(true);
    try {
      const res = await api.patch(`/documents/${id}/status`, {
        status: newStatus,
        reviewNotes,
      });
      if (res.data.success) {
        setDoc(res.data.document);
        showNotification(`Claim marked as ${newStatus} successfully!`);
      }
    } catch (err) {
      showNotification('Failed to update status', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const res = await api.put(`/documents/${id}`, {
        extractedData: editedData,
        reviewNotes,
      });
      if (res.data.success) {
        setDoc(res.data.document);
        setIsEditing(false);
        showNotification('Adjustments saved & mathematical reconciliation updated!');
      }
    } catch (err) {
      showNotification('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const res = await api.post(`/documents/${id}/reprocess`);
      if (res.data.success) {
        setDoc(res.data.document);
        setEditedData(res.data.document.extractedData || {});
        showNotification('Document successfully re-analyzed via Gemini AI!');
      }
    } catch (err) {
      showNotification('Reprocessing failed', 'error');
    } finally {
      setReprocessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this claim document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      navigate('/dashboard');
    } catch (err) {
      showNotification('Failed to delete document', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        <p className="text-xs text-slate-400">Loading document verification workspace...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-300">Document not found.</p>
        <Link to="/dashboard" className="text-xs text-brand-400 hover:underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Resolve preview file URL
  const fileUrl = doc.fileUrl?.startsWith('http')
    ? doc.fileUrl
    : doc.fileUrl?.startsWith('/')
    ? doc.fileUrl
    : `/${doc.fileUrl}`;

  return (
    <div className="space-y-4">
      {/* Top Banner & Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                {doc.originalName}
              </h1>
              <StatusBadge status={doc.status} size="sm" />
            </div>
            <p className="text-[11px] text-slate-400">
              Type: <span className="text-slate-200 font-semibold">{doc.docType}</span> • Confidence:{' '}
              <span className="text-emerald-400 font-mono font-bold">{doc.confidenceScore}%</span> • Turnaround:{' '}
              <span className="font-mono">{doc.processingTimeMs}ms</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Verification Workflow */}
        <div className="flex items-center flex-wrap gap-2">
          {isEditing ? (
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Edits</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
          )}

          <button
            onClick={handleReprocess}
            disabled={reprocessing}
            title="Re-run Gemini Multimodal Extraction"
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <Sparkles className={`w-3.5 h-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
            <span>Reprocess</span>
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Quick Review Decisions */}
          <button
            onClick={() => handleStatusUpdate('Verified')}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approve Claim</span>
          </button>

          <button
            onClick={() => handleStatusUpdate('Flagged')}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Flag for Audit</span>
          </button>

          <button
            onClick={() => handleStatusUpdate('Rejected')}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Reject</span>
          </button>

          <button
            onClick={handleDelete}
            title="Delete Document"
            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            notification.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Side-by-Side Verification Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
        {/* LEFT COLUMN: Document Previewer */}
        <div className="lg:col-span-6 flex flex-col rounded-2xl border border-slate-800 bg-[#0f1422] overflow-hidden shadow-xl">
          {/* Document Preview Controls */}
          <div className="p-3 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <FileText className="w-4 h-4 text-brand-400" />
              <span>Original Scanned Document</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-400">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 15, 200))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(100)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Reset Zoom"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Open in new window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Document Viewport */}
          <div className="flex-1 bg-slate-950/80 p-4 overflow-auto flex items-center justify-center min-h-[500px]">
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="transition-transform duration-200 max-w-full"
            >
              {fileUrl.endsWith('.pdf') ? (
                <object
                  data={fileUrl}
                  type="application/pdf"
                  className="w-[600px] h-[800px] rounded-lg border border-slate-700 bg-white"
                >
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm font-semibold">PDF Document View</p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-brand-400 underline mt-2 block"
                    >
                      Click here to open PDF externally
                    </a>
                  </div>
                </object>
              ) : (
                <img
                  src={fileUrl}
                  alt={doc.originalName}
                  className="max-w-[620px] rounded-lg border border-slate-700/80 shadow-2xl bg-white"
                  onError={(e) => {
                    // Fallback to sample SVG preview if local file was deleted
                    e.target.src = '/samples/sample_bill_clean.svg';
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Analysis & Data Viewer */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Fraud Assessment Gauge */}
          <FraudScoreGauge
            score={doc.fraudScore || 0}
            riskLevel={doc.fraudRiskLevel || 'Low'}
            recommendation={doc.recommendation}
          />

          {/* Interactive Structured Data Tabbed Viewer */}
          <div className="flex-1">
            <DataViewer
              extractedData={editedData}
              anomalies={doc.anomalies || []}
              onDataChange={setEditedData}
              isEditing={isEditing}
            />
          </div>

          {/* Reviewer Audit Notes */}
          <div className="p-4 rounded-2xl bg-[#0f1422] border border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Auditor / Reviewer Notes
            </label>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add adjuster notes, discrepancy explanations, or audit reasoning..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
