import React from 'react';
import FileDropzone from '../components/FileDropzone';
import { Sparkles, ShieldCheck, CheckCircle2, Cpu, Eye, FileSpreadsheet, Lock, Zap } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Google Gemini Multimodal Vision Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ingest &amp; Analyze Medical Claim
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Upload hospital invoices, prescriptions, or clinical lab panels for instant OCR extraction, code cross-referencing, and fraud auditing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>End-to-End Encrypted</span>
          </span>
        </div>
      </div>

      {/* Main File Dropzone */}
      <FileDropzone />

      {/* Workflow Explanatory Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs mb-3 shadow-md">
            1
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
            Multimodal Vision Parsing
          </h3>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            The Gemini API processes document buffers directly, detecting line item tables, handwriting, ICD-10/CPT codes, and provider NPIs.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs mb-3 shadow-md">
            2
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
            Arithmetic &amp; Fraud Audit
          </h3>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            Automatic calculation checks: itemized line items sum vs billed total, duplicate procedure checks, and billing variance flags.
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel glass-panel-hover border border-slate-800 relative overflow-hidden group">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs mb-3 shadow-md">
            3
          </div>
          <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
            HITL Approval Console
          </h3>
          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
            Claims adjusters review original document scans alongside extracted JSON data, with 1-click Verify, Audit Flag, or Reject actions.
          </p>
        </div>
      </div>
    </div>
  );
}
