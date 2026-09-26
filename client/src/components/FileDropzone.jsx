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
  Stethoscope,
  Pill,
  TestTube2,
  Cpu,
  Check,
} from 'lucide-react';

export default function FileDropzone({ onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Auto-Detect');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const processingSteps = [
    'Document Ingestion & Image Preprocessing',
    'Gemini 2.5 Flash Vision Multimodal Extraction',
    'ICD-10 & CPT Medical Code Validation',
    'Mathematical Variance & Copay Reconciliation',
  ];

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

  const simulateStepProgression = () => {
    setCurrentStep(0);
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < processingSteps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 600);
    return stepInterval;
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setUploadProgress(15);
    const stepTimer = simulateStepProgression();

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
      clearInterval(stepTimer);
      setUploadProgress(100);
      setCurrentStep(3);

      if (res.data.success) {
        if (onUploadSuccess) {
          onUploadSuccess(res.data.document);
        } else {
          navigate(`/documents/${res.data.document._id}`);
        }
      }
    } catch (err) {
      console.error('Upload failed:', err);
      clearInterval(stepTimer);
      setError(err.response?.data?.message || err.message || 'Processing failed. Please check Gemini API key or network.');
    } finally {
      setUploading(false);
    }
  };

  const handleTestSample = async (sampleName, sampleDocType) => {
    setUploading(true);
    setError(null);
    setUploadProgress(20);
    const stepTimer = simulateStepProgression();

    try {
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

      clearInterval(stepTimer);
      setUploadProgress(100);
      setCurrentStep(3);

      if (res.data.success) {
        if (onUploadSuccess) {
          onUploadSuccess(res.data.document);
        } else {
          navigate(`/documents/${res.data.document._id}`);
        }
      }
    } catch (err) {
      console.error('Sample processing failed:', err);
      clearInterval(stepTimer);
      setError('Could not process sample document. Check server health.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Box Container */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
          dragActive
            ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
            : selectedFile
            ? 'border-cyan-500/50 bg-slate-900/80 shadow-xl'
            : 'border-slate-800 bg-[#0a0f1d] hover:border-cyan-500/40 hover:bg-slate-900/50 shadow-2xl'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {/* Animated Scanline during AI processing */}
        {uploading && <div className="animate-scanline z-20" />}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-6">
            <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500/15 via-brand-500/10 to-indigo-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.3)] transition-all">
                <UploadCloud className="w-10 h-10" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-[#0a0f1d]"></span>
              </span>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">
                Drag &amp; Drop Medical Claim File
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Hospital invoices, CMS-1500 / UB-04 statements, prescriptions (Rx), or clinical lab panels (PDF, PNG, JPG up to 10MB).
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-brand-600 hover:from-cyan-400 hover:to-brand-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Browse Files</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            <div className="flex items-center justify-center gap-4 text-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white truncate max-w-sm">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for Gemini Multimodal Analysis
                </p>
              </div>
            </div>

            {/* Document Classification Selector */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-medium">Claim Modality:</span>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                disabled={uploading}
                className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Auto-Detect">Auto-Detect (Recommended)</option>
                <option value="Medical Bill">Medical Bill / Inpatient Statement</option>
                <option value="Prescription">Prescription (Rx)</option>
                <option value="Diagnostic Lab Report">Diagnostic Lab Report</option>
                <option value="Discharge Summary">Discharge Summary</option>
              </select>
            </div>

            {/* Multi-step progress timeline */}
            {uploading && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold mb-1">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Multimodal AI Pipeline Active
                  </span>
                  <span className="font-mono text-cyan-400">{uploadProgress}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  {processingSteps.map((step, idx) => (
                    <div
                      key={step}
                      className={`flex items-center gap-2 transition-colors ${
                        idx < currentStep
                          ? 'text-emerald-400'
                          : idx === currentStep
                          ? 'text-cyan-400 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      {idx < currentStep ? (
                        <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      ) : idx === currentStep ? (
                        <Loader2 className="w-3 h-3 animate-spin text-cyan-400 flex-shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-slate-700 flex-shrink-0" />
                      )}
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="px-7 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-brand-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Document...</span>
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

        {/* Error notification */}
        {error && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Pre-built Clinical Claims Showcase */}
      <div className="p-6 rounded-3xl glass-panel-elevated border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white block">
                Instant Demo Claims (1-Click AI Test)
              </span>
              <span className="text-[10px] text-slate-400">Benchmark claims pre-configured for verification</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sample 1: Clean Bill */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_bill_clean.svg', 'Medical Bill')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                Clean Inpatient Bill
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">St. Jude Cardiology Encounter</p>
            <p className="text-xs font-mono font-bold text-emerald-400 mt-2">Claim: ₹3,600.00</p>
          </button>

          {/* Sample 2: Flagged Bill */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_bill_flagged.svg', 'Medical Bill')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 text-left transition-all group shadow-sm hover:shadow-[0_0_20px_rgba(244,63,94,0.15)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                Flagged Claim (Fraud)
              </span>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                High Risk
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Duplicate CPT + ₹850 Inflation</p>
            <p className="text-xs font-mono font-bold text-rose-400 mt-2">Billed: ₹5,850.00</p>
          </button>

          {/* Sample 3: Prescription */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_rx.svg', 'Prescription')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group shadow-sm hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-cyan-400" />
                Prescription (Rx)
              </span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Clean Rx
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Humalog Insulin with NDC code</p>
            <p className="text-xs font-mono font-bold text-cyan-400 mt-2">Claim: ₹160.00</p>
          </button>

          {/* Sample 4: Lab Report */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => handleTestSample('sample_lab.svg', 'Diagnostic Lab Report')}
            className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group shadow-sm hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 flex items-center gap-1.5">
                <TestTube2 className="w-3.5 h-3.5 text-indigo-400" />
                Diagnostic Lab Report
              </span>
              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Panels
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Quest CMP Panel + LOINC</p>
            <p className="text-xs font-mono font-bold text-indigo-400 mt-2">Claim: ₹420.00</p>
          </button>
        </div>
      </div>
    </div>
  );
}
