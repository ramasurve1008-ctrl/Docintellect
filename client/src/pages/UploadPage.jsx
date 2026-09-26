import React from 'react';
import FileDropzone from '../components/FileDropzone';
import { Sparkles, ShieldCheck, CheckCircle2, Cpu, Eye, FileSpreadsheet } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
          Ingest &amp; Analyze Medical Claim
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload medical bills, prescriptions, or lab reports to trigger Google Gemini Multimodal Vision analysis
        </p>
      </div>

      {/* Main File Dropzone */}
      <FileDropzone />

      {/* Workflow Explanatory Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold text-xs mb-3">
            1
          </div>
          <h3 className="text-xs font-bold text-slate-200">Multimodal Vision Parsing</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            The Gemini API processes document buffers directly, detecting line item tables, handwriting, ICD-10/CPT codes, and provider NPIs.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs mb-3">
            2
          </div>
          <h3 className="text-xs font-bold text-slate-200">Arithmetic &amp; Fraud Audit</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Automatic calculation checks: itemized line items sum vs billed total, duplicate procedure checks, and billing variance flags.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs mb-3">
            3
          </div>
          <h3 className="text-xs font-bold text-slate-200">HITL Approval Console</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Claims adjusters review original document scans alongside extracted JSON data, with 1-click Verify, Audit Flag, or Reject actions.
          </p>
        </div>
      </div>
    </div>
  );
}
