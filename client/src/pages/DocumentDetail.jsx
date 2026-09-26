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
  Save,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Sparkles,
  Edit3,
  Trash2,
  FileText,
  Clock,
  ShieldAlert,
  Moon,
  Sun,
  Scan,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from 'lucide-react';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [darkScanMode, setDarkScanMode] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [notification, setNotification] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const fetchDocument = async () => {
    try {
      const res = await api.get(`/documents/${id}`);
      if (res.data.success) {
        setDoc(res.data.document);
        setEditedData(res.data.document.extractedData || {});
        setReviewNotes(res.data.document.reviewNotes || '');
      }
    } catch (err) {
      console.error('Error fetching document details:', err);
      showNotification('Failed to load document details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  // Global hotkeys for claims adjuster workflow
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger hotkeys if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'a' || e.key === 'A') {
        handleStatusUpdate('Verified');
      } else if (e.key === 'f' || e.key === 'F') {
        handleStatusUpdate('Flagged');
      } else if (e.key === 'r' || e.key === 'R') {
        handleStatusUpdate('Rejected');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editedData, reviewNotes, doc]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusUpdate = async (newStatus) => {
    setSaving(true);
    try {
      const res = await api.patch(`/documents/${id}/status`, {
        status: newStatus,
        reviewNotes,
        extractedData: editedData,
      });

      if (res.data.success) {
        setDoc(res.data.document);
        showNotification(`Claim successfully marked as ${newStatus}!`);
      }
    } catch (err) {
      showNotification('Failed to update claim decision', 'error');
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
        showNotification('Structured claim fields updated and re-verified!');
      }
    } catch (err) {
      showNotification('Failed to save edited data', 'error');
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
        setEditedData(res.data.document.extractedData);
        showNotification('AI Gemini re-extraction and reconciliation completed!');
      }
    } catch (err) {
      showNotification('Re-processing failed. Please check backend logs.', 'error');
    } finally {
      setReprocessing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this claim record?')) return;
    try {
      await api.delete(`/documents/${id}`);
      navigate('/dashboard');
    } catch (err) {
      showNotification('Could not delete document', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-spin">
          <Sparkles className="w-6 h-6 text-cyan-400" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading claim metadata &amp; scans...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-8 text-center glass-panel rounded-3xl max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Document Not Found</h2>
        <p className="text-xs text-slate-400 mt-1 mb-4">
          The requested document could not be located or has been purged.
        </p>
        <Link
          to="/dashboard"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const fileUrl = doc.fileUrl?.startsWith('http')
    ? doc.fileUrl
    : doc.fileUrl?.startsWith('/')
    ? doc.fileUrl
    : `/${doc.fileUrl}`;

  const totalAmount = Number(doc.extractedData?.financial?.totalAmount) || 0;
  const invoiceNo = doc.extractedData?.financial?.invoiceNumber || 'INV-PENDING';
  const patientName = doc.extractedData?.patient?.name || 'Patient';

  return (
    <div className="space-y-4">
      {/* Top Banner & Header Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl glass-panel-elevated border border-slate-800 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Back & Document Title */}
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all shadow-sm"
              title="Return to Claims Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-extrabold text-white truncate max-w-md">
                  {doc.originalName}
                </h1>
                <StatusBadge status={doc.status} size="sm" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                  {doc.docType || 'Claim'}
                </span>
              </div>

              {/* Meta details bar */}
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                <span>
                  Patient:{' '}
                  <strong className="text-slate-200">{patientName}</strong>
                </span>
                <span>•</span>
                <span>
                  Invoice:{' '}
                  <button
                    onClick={() => handleCopy(invoiceNo, 'inv')}
                    className="font-mono text-cyan-400 hover:underline inline-flex items-center gap-1"
                    title="Copy Invoice #"
                  >
                    <span>{invoiceNo}</span>
                    {copiedField === 'inv' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </span>
                <span>•</span>
                <span>
                  Claim Total:{' '}
                  <strong className="font-mono text-white text-sm">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Confidence:{' '}
                  <strong className="text-emerald-400 font-mono">{doc.confidenceScore}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Decision Workflow Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {isEditing ? (
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/25"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Edits</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Fields</span>
              </button>
            )}

            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              title="Re-run Gemini Multimodal OCR Extraction"
              className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
              <span>Reprocess AI</span>
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Quick Actions with Hotkeys */}
            <button
              onClick={() => handleStatusUpdate('Verified')}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Shortcut: Press 'A'"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve [A]</span>
            </button>

            <button
              onClick={() => handleStatusUpdate('Flagged')}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Shortcut: Press 'F'"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Flag Audit [F]</span>
            </button>

            <button
              onClick={() => handleStatusUpdate('Rejected')}
              disabled={saving}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              title="Shortcut: Press 'R'"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject [R]</span>
            </button>

            <button
              onClick={handleDelete}
              title="Delete Document"
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all shadow-xl animate-in slide-in-from-top-2 ${
            notification.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-300'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Side-by-Side Verification Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
        {/* LEFT COLUMN: Document Scanned Previewer */}
        <div
          className={`flex flex-col rounded-3xl border border-slate-800 bg-[#0a0f1d] overflow-hidden shadow-2xl transition-all ${
            isFullscreen ? 'fixed inset-4 z-50 bg-[#080c16]' : 'lg:col-span-6'
          }`}
        >
          {/* Controls Bar */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Scanned Encounters &amp; Billing Sheet</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Dark Scan Mode Toggle */}
              <button
                onClick={() => setDarkScanMode(!darkScanMode)}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                  darkScanMode
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
                title="Toggle Inverted Dark Mode Scan"
              >
                {darkScanMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-[11px] font-medium">Dark Scan</span>
              </button>

              {/* Laser Scanner Animation Toggle */}
              <button
                onClick={() => setScannerActive(!scannerActive)}
                className={`p-1.5 rounded-xl border text-xs flex items-center gap-1 transition-all ${
                  scannerActive
                    ? 'bg-brand-500/20 border-brand-500/40 text-brand-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white'
                }`}
                title="Toggle AI OCR Laser Scanner HUD"
              >
                <Scan className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-800 mx-0.5" />

              {/* Zoom Controls */}
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 font-mono text-[11px] text-slate-400">{zoomLevel}%</span>
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

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Open raw document externally"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Interactive Document Viewport */}
          <div className="relative flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center min-h-[550px]">
            {/* Animated Laser OCR Scanline */}
            {scannerActive && <div className="animate-scanline pointer-events-none z-20"></div>}

            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className={`transition-transform duration-200 max-w-full relative z-10 ${
                darkScanMode ? 'filter-dark-scan' : ''
              }`}
            >
              {fileUrl.endsWith('.pdf') ? (
                <object
                  data={fileUrl}
                  type="application/pdf"
                  className="w-[620px] h-[820px] rounded-xl border border-slate-700 bg-white shadow-2xl"
                >
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm font-semibold">PDF Document View</p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 underline mt-2 block"
                    >
                      Click here to open PDF externally
                    </a>
                  </div>
                </object>
              ) : (
                <img
                  src={fileUrl}
                  alt={doc.originalName}
                  className="max-w-[620px] rounded-xl border border-slate-800 shadow-2xl bg-white"
                  onError={(e) => {
                    e.target.src = '/samples/sample_bill_clean.svg';
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Fraud Radar & Structured Inspector */}
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
          <div className="p-5 rounded-3xl glass-panel border border-slate-800">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Auditor / Claims Adjuster Notes
            </label>
            <textarea
              rows={2}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add adjuster observations, compliance notes, or audit variance justification..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
