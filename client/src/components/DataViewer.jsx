import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  User,
  Activity,
  AlertTriangle,
  Code,
  Plus,
  Trash2,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

export default function DataViewer({ extractedData = {}, anomalies = [], onDataChange, isEditing = false }) {
  const [activeTab, setActiveTab] = useState('financial');
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: 'financial', label: 'Financial & Items', icon: DollarSign },
    { id: 'patient', label: 'Patient & Provider', icon: User },
    { id: 'medical', label: 'Medical & Codes', icon: Activity },
    {
      id: 'anomalies',
      label: `Anomalies (${anomalies.length})`,
      icon: AlertTriangle,
      badge: anomalies.length > 0 ? anomalies.length : null,
    },
    { id: 'raw', label: 'Raw JSON', icon: Code },
  ];

  // Helper for deep updates
  const handleFieldChange = (section, field, value) => {
    if (!onDataChange) return;
    const updated = {
      ...extractedData,
      [section]: {
        ...extractedData[section],
        [field]: value,
      },
    };
    onDataChange(updated);
  };

  const handleLineItemChange = (index, field, value) => {
    if (!onDataChange) return;
    const items = [...(extractedData.lineItems || [])];
    items[index] = {
      ...items[index],
      [field]: field === 'quantity' || field === 'unitPrice' || field === 'totalPrice' ? Number(value) : value,
    };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : items[index].quantity || 1;
      const u = field === 'unitPrice' ? Number(value) : items[index].unitPrice || 0;
      items[index].totalPrice = Math.round(q * u * 100) / 100;
    }

    const updated = {
      ...extractedData,
      lineItems: items,
    };
    onDataChange(updated);
  };

  const addLineItem = () => {
    if (!onDataChange) return;
    const items = [...(extractedData.lineItems || [])];
    items.push({
      itemNumber: items.length + 1,
      code: 'CPT-XXXXX',
      description: 'New Itemized Procedure',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      flagged: false,
    });
    onDataChange({ ...extractedData, lineItems: items });
  };

  const removeLineItem = (index) => {
    if (!onDataChange) return;
    const items = (extractedData.lineItems || []).filter((_, idx) => idx !== index);
    onDataChange({ ...extractedData, lineItems: items });
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const financial = extractedData.financial || {};
  const patient = extractedData.patient || {};
  const provider = extractedData.provider || {};
  const lineItems = extractedData.lineItems || [];
  const medical = extractedData.medicalDetails || {};

  // Compute live line items sum
  const computedSum = lineItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
  const billedTotal = Number(financial.totalAmount) || 0;
  const isMatch = Math.abs(computedSum - billedTotal) < 0.05;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f1422] overflow-hidden flex flex-col h-full shadow-xl">
      {/* Tabs Header */}
      <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="p-5 flex-1 overflow-y-auto">
        {/* FINANCIAL & LINE ITEMS */}
        {activeTab === 'financial' && (
          <div className="space-y-6">
            {/* Arithmetic Reconciliation Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isMatch
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isMatch ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold">
                    {isMatch
                      ? 'Mathematical Reconciliation Verified ✓'
                      : 'Arithmetic Discrepancy Detected ⚠️'}
                  </p>
                  <p className="text-[11px] opacity-80">
                    {isMatch
                      ? 'Itemized line items exactly match billed total amount.'
                      : `Line items total (₹${computedSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) differs from claim amount (₹${billedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).`}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-sm">Diff: ₹{(billedTotal - computedSum).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Financial Overview Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Invoice / Bill #
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={financial.invoiceNumber || ''}
                    onChange={(e) => handleFieldChange('financial', 'invoiceNumber', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {financial.invoiceNumber || 'N/A'}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Gross Subtotal
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={financial.subtotal || 0}
                    onChange={(e) => handleFieldChange('financial', 'subtotal', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-200">
                    ₹{(Number(financial.subtotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Co-Pay / Deductible
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={financial.copay || 0}
                    onChange={(e) => handleFieldChange('financial', 'copay', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                  />
                ) : (
                  <span className="text-xs font-mono font-bold text-slate-200">
                    ₹{(Number(financial.copay) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30">
                <label className="text-[10px] uppercase font-bold text-brand-300 block mb-1">
                  Claim Total Amount
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={financial.totalAmount || 0}
                    onChange={(e) => handleFieldChange('financial', 'totalAmount', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-brand-300 font-bold"
                  />
                ) : (
                  <span className="text-sm font-mono font-extrabold text-brand-400">
                    ₹{billedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Itemized Charges &amp; CPT Codes ({lineItems.length})
                </span>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-600/20 text-brand-400 hover:bg-brand-600/30 text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Item
                  </button>
                )}
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-10">#</th>
                      <th className="py-2.5 px-3 w-28">CPT / Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 w-16 text-right">Qty</th>
                      <th className="py-2.5 px-3 w-24 text-right">Unit (₹)</th>
                      <th className="py-2.5 px-3 w-24 text-right">Total (₹)</th>
                      {isEditing && <th className="py-2.5 px-3 w-12 text-center">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {lineItems.map((item, idx) => (
                      <tr
                        key={idx}
                        className={`${
                          item.flagged
                            ? 'bg-rose-500/10 text-rose-200'
                            : 'hover:bg-slate-800/40 text-slate-200'
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400 text-xs">{idx + 1}</td>
                        <td className="py-2 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.code || ''}
                              onChange={(e) => handleLineItemChange(idx, 'code', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                            />
                          ) : (
                            <span className="font-semibold text-brand-400">{item.code || 'N/A'}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-sans">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                            />
                          ) : (
                            <div>
                              <span>{item.description}</span>
                              {item.flagReason && (
                                <p className="text-[10px] text-rose-400 mt-0.5">⚠️ {item.flagReason}</p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={item.quantity || 1}
                              onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-white"
                            />
                          ) : (
                            item.quantity || 1
                          )}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPrice || 0}
                              onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-20 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-white"
                            />
                          ) : (
                            `₹${(Number(item.unitPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-slate-100">
                          ₹{(Number(item.totalPrice) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        {isEditing && (
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLineItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-400 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {lineItems.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                          No line items extracted.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PATIENT & PROVIDER */}
        {activeTab === 'patient' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Patient Demographics &amp; Coverage
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Patient Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={patient.name || ''}
                      onChange={(e) => handleFieldChange('patient', 'name', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-100">{patient.name || 'Not Detected'}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Insurance Policy / Member ID</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={patient.insurancePolicyNumber || ''}
                      onChange={(e) => handleFieldChange('patient', 'insurancePolicyNumber', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  ) : (
                    <p className="text-sm font-mono font-semibold text-brand-400">
                      {patient.insurancePolicyNumber || 'Not Detected'}
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Patient ID / MRN</span>
                  <p className="text-sm font-mono text-slate-300">{patient.id || 'N/A'}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Age &amp; Gender</span>
                  <p className="text-sm text-slate-300">
                    {patient.age ? `${patient.age} yrs` : 'Unknown'} • {patient.gender || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Healthcare Provider &amp; Billing Entity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Facility / Hospital Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={provider.name || ''}
                      onChange={(e) => handleFieldChange('provider', 'name', e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-100">{provider.name || 'Not Detected'}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Attending Physician / NPI</span>
                  <p className="text-sm font-semibold text-slate-200">
                    {provider.doctorName || 'Not Stated'}
                    {provider.licenseNumber && (
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">
                        Lic: {provider.licenseNumber}
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 sm:col-span-2">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Department &amp; Address</span>
                  <p className="text-xs text-slate-300">
                    {provider.department} • {provider.address || 'Address not listed'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEDICAL & CODES */}
        {activeTab === 'medical' && (
          <div className="space-y-6">
            {/* Diagnoses */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Clinical Diagnoses (ICD-10)
              </h4>
              <div className="space-y-2">
                {(medical.diagnoses || []).map((diag, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200">{diag.condition}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                      {diag.icdCode || 'ICD-10'}
                    </span>
                  </div>
                ))}
                {(!medical.diagnoses || medical.diagnoses.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No formal diagnosis codes detected.</p>
                )}
              </div>
            </div>

            {/* Medications */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Prescribed Medications
              </h4>
              <div className="space-y-2">
                {(medical.medications || []).map((med, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{med.name}</span>
                      <span className="text-xs font-mono text-slate-400">{med.dosage}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {med.frequency} {med.days ? `• ${med.days} days supply` : ''}
                    </p>
                  </div>
                ))}
                {(!medical.medications || medical.medications.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No medications listed on this claim.</p>
                )}
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Diagnostic Lab Panels &amp; Biomarkers
              </h4>
              <div className="space-y-2">
                {(medical.testResults || []).map((test, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      test.isAbnormal
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold">{test.testName}</p>
                      <p className="text-[11px] text-slate-400">Ref: {test.referenceRange || 'Standard'}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm">
                        {test.value} {test.unit}
                      </span>
                      {test.isAbnormal && (
                        <span className="block text-[10px] font-bold text-rose-400 uppercase">
                          Abnormal
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {(!medical.testResults || medical.testResults.length === 0) && (
                  <p className="text-xs text-slate-400 italic">No lab test panels detected.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ANOMALIES & AUDIT */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Automated Gemini Discrepancy Findings
              </span>
              <span className="text-xs font-bold text-slate-300">
                {anomalies.length} Flagged
              </span>
            </div>

            {anomalies.map((anom, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-bold text-rose-300">{anom.issue}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    {anom.severity || 'Medium'} Severity
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{anom.description}</p>
                <div className="pt-1 text-[11px] font-mono text-slate-400">
                  Target Field: <span className="text-brand-400">{anom.field}</span>
                </div>
              </div>
            ))}

            {anomalies.length === 0 && (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">Zero Anomalies Detected</p>
                <p className="text-xs text-slate-400">
                  All dates, arithmetic sums, provider credentials, and CPT codes passed automated validation.
                </p>
              </div>
            )}
          </div>
        )}

        {/* RAW JSON */}
        {activeTab === 'raw' && (
          <div className="relative">
            <button
              onClick={handleCopyJSON}
              className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
            <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-brand-300 overflow-x-auto max-h-[460px] border border-slate-800">
              {JSON.stringify(extractedData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
