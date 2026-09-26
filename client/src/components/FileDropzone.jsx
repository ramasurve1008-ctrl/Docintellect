import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';

export default function FileDropzone({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Auto-Detect');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxBytes = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp)$/i)) {
      setError('Invalid format. Please upload a PDF or Image (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > maxBytes) {
      setError('File size exceeds the 10MB limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setUploadProgress(15);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('docType', docType);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 350);

      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.data.success) {
        if (onUploadSuccess) {
          onUploadSuccess(res.data.document);
        } else {
          navigate(`/documents/${res.data.document._id}`);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || err.message || 'Processing failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Instant Sample Testing Loader
  const handleTestSample = async (sampleName, sampleDocType) => {
    setUploading(true);
    setError(null);
    setUploadProgress(20);

    try {
      // Fetch sample SVG asset as Blob and convert to a File object
      const url = `/samples/${sampleName}`;
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], sampleName.replace('.svg', '.pdf'), { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', sampleDocType);

      setUploadProgress(50);
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadProgress(100);
      if (res.data.success) {
        if (onUploadSuccess) {
          onUploadSuccess(res.data.document);
        } else {
          navigate(`/documents/${res.data.document._id}`);
        }
      }
    } catch (err) {
      console.error('Sample processing failed:', err);
      setError('Could not process sample document. Check server health.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box Container */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-brand-400 bg-brand-500/10'
            : selectedFile
            ? 'border-slate-600 bg-slate-800/40'
            : 'border-slate-700/80 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Scanline during AI processing */}
        {uploading && <div className="animate-scanline" />}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-2">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Drag & Drop Medical Claim Document
            </h3>
            <p className="text-sm text-slate-400 max-w-md">
              Upload patient bills, hospital invoices, prescriptions (Rx), or diagnostic lab reports
              (PDF, PNG, JPG up to 10MB).
            </p>
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shadow-lg shadow-brand-600/30 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Select File
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-center gap-3 text-slate-200">
              <div className="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold truncate max-w-sm">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Gemini Multimodal Analysis
                </p>
              </div>
            </div>

            {/* Document Classification Selector */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-xs text-slate-400 font-medium">Claim Type Hint:</span>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                disabled={uploading}
                className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="Auto-Detect">Auto-Detect (Recommended)</option>
                <option value="Medical Bill">Medical Bill / Inpatient Statement</option>
                <option value="Prescription">Prescription (Rx)</option>
                <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>

            {/* Upload / Ingest Action */}
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini OCR... {uploadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Process Claim with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Instant Demo Testing Buttons */}
      <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Instant Demo Samples (1-Click Test)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Pre-built clinical claims for testing</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_bill_clean.svg', 'Medical Bill')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                Clean Medical Bill
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">St. Jude Inpatient (₹3,600 claim)</p>
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_bill_flagged.svg', 'Medical Bill')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-rose-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-rose-400">
                Flagged Claim (Fraud)
              </span>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                High Risk
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Arithmetic inflation (+₹850 anomaly)</p>
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_rx.svg', 'Prescription')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                Prescription (Rx)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Clean Rx
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Humalog Insulin with NDC code</p>
          </button>

          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_lab.svg', 'Diagnostic Lab Report')}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-500/50 text-left transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400">
                Diagnostic Lab Report
              </span>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">
                Panels
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Quest CMP Metabolic Panel (₹420)</p>
          </button>
        </div>
      </div>
    </div>
  );
}
