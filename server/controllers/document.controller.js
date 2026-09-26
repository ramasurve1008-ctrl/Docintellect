import path from 'path';
import fs from 'fs';
import Document from '../models/Document.js';
import { inMemoryStore } from '../services/store.service.js';
import { processDocumentWithGemini } from '../services/ai.service.js';
import { getDBStatus } from '../config/db.js';
import { syncDocumentToSupabase } from '../config/supabase.js';

export const uploadAndProcess = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a document file (PDF or Image)' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const requestedDocType = req.body.docType || 'Auto-Detect';
    const fileUrl = `/uploads/${filename}`;

    console.log(`📄 Ingesting document: ${originalname} (${(size / 1024).toFixed(1)} KB)`);

    // Run Multimodal OCR and Medical Claim Analysis via Google Gemini API
    const aiAnalysis = await processDocumentWithGemini(
      filePath,
      originalname,
      mimetype,
      requestedDocType
    );

    // Initial status determined by AI recommendation & anomalies
    let initialStatus = 'Pending';
    if (aiAnalysis.recommendation === 'Auto-Approve' && aiAnalysis.fraudScore < 30) {
      initialStatus = 'Verified';
    } else if (aiAnalysis.anomalies && aiAnalysis.anomalies.length > 0 || aiAnalysis.fraudScore >= 40) {
      initialStatus = 'Flagged';
    } else if (aiAnalysis.recommendation === 'Reject') {
      initialStatus = 'Rejected';
    }

    const docPayload = {
      userId: req.user?._id || req.user?.id,
      originalName: originalname,
      fileName: filename,
      fileUrl,
      fileType: mimetype,
      fileSize: size,
      docType: aiAnalysis.docType || 'Medical Bill',
      status: initialStatus,
      confidenceScore: aiAnalysis.confidenceScore,
      fraudScore: aiAnalysis.fraudScore,
      fraudRiskLevel: aiAnalysis.fraudRiskLevel,
      recommendation: aiAnalysis.recommendation,
      extractedData: aiAnalysis.extractedData,
      anomalies: aiAnalysis.anomalies,
      processingTimeMs: aiAnalysis.processingTimeMs,
      reviewNotes: aiAnalysis.anomalies.length > 0
        ? `System automated flag: ${aiAnalysis.anomalies.length} anomaly detected during ingestion.`
        : 'Initial automated extraction complete.',
    };

    const isDbConnected = getDBStatus();
    if (isDbConnected) {
      const savedDoc = await Document.create(docPayload);
      syncDocumentToSupabase(savedDoc).catch(() => {});
      return res.status(201).json({
        success: true,
        message: 'Document uploaded and processed successfully',
        document: savedDoc,
      });
    }

    // Fallback store
    const memDoc = {
      _id: `doc-${Date.now()}`,
      ...docPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryStore.addDocument(memDoc);
    syncDocumentToSupabase(memDoc).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Document uploaded and processed successfully',
      document: memDoc,
    });
  } catch (error) {
    console.error('Upload & Processing error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while processing the document',
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { status, docType, search } = req.query;
    const isDbConnected = getDBStatus();

    if (isDbConnected) {
      const query = {};
      if (status && status !== 'All') {
        query.status = status;
      }
      if (docType && docType !== 'All') {
        query.docType = docType;
      }
      if (search) {
        query.$or = [
          { originalName: { $regex: search, $options: 'i' } },
          { 'extractedData.patient.name': { $regex: search, $options: 'i' } },
          { 'extractedData.provider.name': { $regex: search, $options: 'i' } },
          { 'extractedData.financial.invoiceNumber': { $regex: search, $options: 'i' } },
        ];
      }

      let documents = await Document.find(query).sort({ createdAt: -1 });

      // If database is completely empty, automatically seed initial demo claims
      if (documents.length === 0 && !search && (!status || status === 'All')) {
        await seedSampleDocuments();
        documents = await Document.find(query).sort({ createdAt: -1 });
      }

      return res.json({ success: true, count: documents.length, documents });
    }

    // Fallback inMemoryStore
    let documents = inMemoryStore.getAllDocuments({ status, docType, search });
    if (documents.length === 0 && !search && (!status || status === 'All')) {
      seedInMemorySampleDocuments();
      documents = inMemoryStore.getAllDocuments({ status, docType, search });
    }

    return res.json({ success: true, count: documents.length, documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error fetching documents' });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDBStatus();

    if (isDbConnected) {
      const doc = await Document.findById(id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      return res.json({ success: true, document: doc });
    }

    const doc = inMemoryStore.getDocumentById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    return res.json({ success: true, document: doc });
  } catch (error) {
    console.error('Get document by id error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error retrieving document' });
  }
};

export const updateDocumentData = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const isDbConnected = getDBStatus();

    // Re-verify line items calculation if lineItems or financial is updated
    if (updates.extractedData?.lineItems || updates.extractedData?.financial) {
      const lineItems = updates.extractedData.lineItems || [];
      const sum = lineItems.reduce((acc, item) => acc + (Number(item.totalPrice) || 0), 0);
      if (updates.extractedData.financial) {
        updates.extractedData.financial.calculatedSum = Math.round(sum * 100) / 100;
        const total = Number(updates.extractedData.financial.totalAmount) || 0;
        updates.extractedData.financial.calculationMatches = Math.abs(sum - total) < 0.05;
      }
    }

    if (isDbConnected) {
      const doc = await Document.findByIdAndUpdate(id, updates, { new: true });
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      syncDocumentToSupabase(doc).catch(() => {});
      return res.json({ success: true, message: 'Document updated successfully', document: doc });
    }

    const updated = inMemoryStore.updateDocument(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    syncDocumentToSupabase(updated).catch(() => {});

    return res.json({ success: true, message: 'Document updated successfully', document: updated });
  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating document' });
  }
};

export const updateDocumentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const payload = {
      status,
      reviewNotes: reviewNotes || `Status updated to ${status} by adjuster`,
      reviewedBy: req.user?._id || req.user?.id,
      reviewedAt: new Date(),
    };

    const isDbConnected = getDBStatus();
    if (isDbConnected) {
      const doc = await Document.findByIdAndUpdate(id, payload, { new: true });
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }
      syncDocumentToSupabase(doc).catch(() => {});
      return res.json({ success: true, message: `Document marked as ${status}`, document: doc });
    }

    const updated = inMemoryStore.updateDocument(id, payload);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    syncDocumentToSupabase(updated).catch(() => {});

    return res.json({ success: true, message: `Document marked as ${status}`, document: updated });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error updating status' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDBStatus();

    let doc;
    if (isDbConnected) {
      doc = await Document.findByIdAndDelete(id);
    } else {
      doc = inMemoryStore.getDocumentById(id);
      inMemoryStore.deleteDocument(id);
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Attempt clean up of file on disk if exists
    if (doc.fileName) {
      const filePath = path.join(process.cwd(), 'uploads', doc.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error deleting document' });
  }
};

export const reprocessDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = getDBStatus();

    let doc = isDbConnected ? await Document.findById(id) : inMemoryStore.getDocumentById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const filePath = path.join(process.cwd(), 'uploads', doc.fileName);
    const aiAnalysis = await processDocumentWithGemini(
      fs.existsSync(filePath) ? filePath : path.join(process.cwd(), 'samples', 'sample_bill.png'),
      doc.originalName,
      doc.fileType,
      doc.docType
    );

    const updates = {
      confidenceScore: aiAnalysis.confidenceScore,
      fraudScore: aiAnalysis.fraudScore,
      fraudRiskLevel: aiAnalysis.fraudRiskLevel,
      recommendation: aiAnalysis.recommendation,
      extractedData: aiAnalysis.extractedData,
      anomalies: aiAnalysis.anomalies,
      processingTimeMs: aiAnalysis.processingTimeMs,
      status: aiAnalysis.fraudScore > 40 ? 'Flagged' : 'Verified',
    };

    if (isDbConnected) {
      const updated = await Document.findByIdAndUpdate(id, updates, { new: true });
      return res.json({ success: true, message: 'Document reprocessed with Gemini', document: updated });
    }

    const updated = inMemoryStore.updateDocument(id, updates);
    return res.json({ success: true, message: 'Document reprocessed with Gemini', document: updated });
  } catch (error) {
    console.error('Reprocess error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error reprocessing document' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const isDbConnected = getDBStatus();

    if (isDbConnected) {
      const allDocs = await Document.find();
      const total = allDocs.length;
      const verified = allDocs.filter((d) => d.status === 'Verified').length;
      const flagged = allDocs.filter((d) => d.status === 'Flagged').length;
      const rejected = allDocs.filter((d) => d.status === 'Rejected').length;
      const pending = allDocs.filter((d) => d.status === 'Pending' || d.status === 'Processing').length;

      const totalClaimValue = allDocs.reduce((sum, d) => sum + (Number(d.extractedData?.financial?.totalAmount) || 0), 0);
      const approvedClaimValue = allDocs
        .filter((d) => d.status === 'Verified')
        .reduce((sum, d) => sum + (Number(d.extractedData?.financial?.totalAmount) || 0), 0);

      const avgProcessingTimeMs = total > 0
        ? Math.round(allDocs.reduce((acc, d) => acc + (d.processingTimeMs || 1200), 0) / total)
        : 1380;

      return res.json({
        success: true,
        analytics: {
          totalProcessed: total,
          verifiedCount: verified,
          flaggedCount: flagged,
          rejectedCount: rejected,
          pendingCount: pending,
          totalClaimValue: Math.round(totalClaimValue * 100) / 100,
          approvedClaimValue: Math.round(approvedClaimValue * 100) / 100,
          avgProcessingTimeMs,
          fraudRiskDistribution: {
            low: allDocs.filter((d) => (d.fraudScore || 0) < 30).length,
            medium: allDocs.filter((d) => (d.fraudScore || 0) >= 30 && (d.fraudScore || 0) < 70).length,
            high: allDocs.filter((d) => (d.fraudScore || 0) >= 70).length,
          },
          docTypeDistribution: {
            medicalBill: allDocs.filter((d) => d.docType === 'Medical Bill').length,
            prescription: allDocs.filter((d) => d.docType === 'Prescription').length,
            labReport: allDocs.filter((d) => d.docType === 'Diagnostic Lab Report').length,
            dischargeSummary: allDocs.filter((d) => d.docType === 'Discharge Summary').length,
            other: allDocs.filter((d) => !['Medical Bill', 'Prescription', 'Diagnostic Lab Report', 'Discharge Summary'].includes(d.docType)).length,
          },
        },
      });
    }

    const analytics = inMemoryStore.getAnalytics();
    return res.json({ success: true, analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error fetching analytics' });
  }
};

/**
 * Seed sample claims for immediate visual evaluation
 */
function seedInMemorySampleDocuments() {
  const samples = getInitialSampleData();
  samples.forEach((s) => inMemoryStore.addDocument(s));
}

async function seedSampleDocuments() {
  const samples = getInitialSampleData();
  await Document.insertMany(samples);
}

function getInitialSampleData() {
  return [
    {
      _id: 'doc-seed-101',
      originalName: 'St_Jude_Emergency_Cardiology_Bill.pdf',
      fileName: 'sample_bill_101.pdf',
      fileUrl: '/samples/sample_bill_clean.svg',
      fileType: 'application/pdf',
      fileSize: 428190,
      docType: 'Medical Bill',
      status: 'Verified',
      confidenceScore: 98,
      fraudScore: 12,
      fraudRiskLevel: 'Low',
      recommendation: 'Auto-Approve',
      processingTimeMs: 1280,
      reviewNotes: 'Verified clean claim. Line items sum perfectly matches billed total.',
      extractedData: {
        patient: {
          name: 'David K. Miller',
          id: 'PAT-77281',
          age: '42',
          gender: 'Male',
          insurancePolicyNumber: 'POL-AET-994821',
          contact: '+1 (555) 438-9210',
        },
        provider: {
          name: 'St. Jude Comprehensive Medical Center',
          doctorName: 'Dr. Gregory House, M.D.',
          licenseNumber: 'MD-992384-CA',
          department: 'Cardiology & Intensive Care',
          address: '742 Evergreen Terrace, Springfield, OR',
          contact: '+1 (800) 555-0199',
        },
        dates: {
          serviceDate: '2026-09-20',
          billingDate: '2026-09-21',
          admissionDate: '2026-09-19',
          dischargeDate: '2026-09-21',
        },
        financial: {
          invoiceNumber: 'INV-2026-88194',
          currency: 'INR',
          subtotal: 3950.0,
          tax: 0.0,
          copay: 150.0,
          discount: 200.0,
          totalAmount: 3600.0,
          calculatedSum: 3600.0,
          calculationMatches: true,
        },
        lineItems: [
          {
            itemNumber: 1,
            code: 'CPT-99223',
            description: 'Inpatient Hospital Care, Initial, High Severity',
            quantity: 1,
            unitPrice: 750.0,
            totalPrice: 750.0,
            flagged: false,
          },
          {
            itemNumber: 2,
            code: 'CPT-93010',
            description: '12-Lead Electrocardiogram (ECG) with interpretation',
            quantity: 1,
            unitPrice: 350.0,
            totalPrice: 350.0,
            flagged: false,
          },
          {
            itemNumber: 3,
            code: 'CPT-71046',
            description: 'Chest X-Ray Examination, 2 Views Frontal/Lateral',
            quantity: 1,
            unitPrice: 850.0,
            totalPrice: 850.0,
            flagged: false,
          },
          {
            itemNumber: 4,
            code: 'CPT-93306',
            description: 'Transthoracic Echocardiogram Complete with Doppler',
            quantity: 1,
            unitPrice: 1650.0,
            totalPrice: 1650.0,
            flagged: false,
          },
        ],
        medicalDetails: {
          diagnoses: [
            { condition: 'Acute Coronary Syndrome', icdCode: 'I24.9' },
            { condition: 'Essential Hypertension', icdCode: 'I10' },
          ],
          medications: [
            { name: 'Aspirin Enteric Coated', dosage: '81mg', frequency: 'Daily', days: '90' },
            { name: 'Metoprolol Tartrate', dosage: '50mg', frequency: 'BID', days: '30' },
          ],
          testResults: [
            { testName: 'Troponin T', value: '0.01', unit: 'ng/mL', referenceRange: '< 0.04', isAbnormal: false },
          ],
        },
      },
      anomalies: [],
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      _id: 'doc-seed-102',
      originalName: 'Mercy_General_Billing_Discrepancy.pdf',
      fileName: 'sample_bill_102.pdf',
      fileUrl: '/samples/sample_bill_flagged.svg',
      fileType: 'application/pdf',
      fileSize: 512000,
      docType: 'Medical Bill',
      status: 'Flagged',
      confidenceScore: 86,
      fraudScore: 78,
      fraudRiskLevel: 'High',
      recommendation: 'Reject',
      processingTimeMs: 1410,
      reviewNotes: 'Suspicious discrepancy: Billed total exceeds itemized calculation sum by $850.00. Duplicate line code detected.',
      extractedData: {
        patient: {
          name: 'Arthur Pendelton',
          id: 'PAT-48209',
          age: '58',
          gender: 'Male',
          insurancePolicyNumber: 'POL-CIGNA-77291',
          contact: '+1 (555) 882-1920',
        },
        provider: {
          name: 'Mercy Regional Trauma Hospital',
          doctorName: 'Dr. Evelyn Cross, MD',
          licenseNumber: 'MD-551029-TX',
          department: 'Orthopedic Surgery & Trauma',
          address: '100 Medical Blvd, Houston, TX',
          contact: '+1 (800) 555-4921',
        },
        dates: {
          serviceDate: '2026-09-18',
          billingDate: '2026-09-19',
          admissionDate: '2026-09-18',
          dischargeDate: '2026-09-19',
        },
        financial: {
          invoiceNumber: 'INV-MERCY-9921',
          currency: 'INR',
          subtotal: 5200.0,
          tax: 0.0,
          copay: 200.0,
          discount: 0.0,
          totalAmount: 5850.0,
          calculatedSum: 5000.0,
          calculationMatches: false,
        },
        lineItems: [
          {
            itemNumber: 1,
            code: 'CPT-27236',
            description: 'Open treatment of femoral fracture with intermedullary rod',
            quantity: 1,
            unitPrice: 3200.0,
            totalPrice: 3200.0,
            flagged: false,
          },
          {
            itemNumber: 2,
            code: 'CPT-01210',
            description: 'Anesthesia for closed/open procedures on hip joint',
            quantity: 1,
            unitPrice: 1000.0,
            totalPrice: 1000.0,
            flagged: false,
          },
          {
            itemNumber: 3,
            code: 'CPT-01210',
            description: 'Duplicate Anesthesia Charge (Second Entry)',
            quantity: 1,
            unitPrice: 1000.0,
            totalPrice: 1000.0,
            flagged: true,
            flagReason: 'Duplicate unbundled procedure billed twice for same operation',
          },
        ],
        medicalDetails: {
          diagnoses: [
            { condition: 'Fracture of neck of femur, closed', icdCode: 'S72.001A' },
          ],
          medications: [],
          testResults: [],
        },
      },
      anomalies: [
        {
          field: 'financial.totalAmount',
          issue: 'Arithmetic Discrepancy',
          severity: 'Critical',
          description: 'Total billed (₹5,850.00) does not match calculated sum (₹5,000.00). Unexplained ₹850.00 inflation.',
        },
        {
          field: 'lineItems[2]',
          issue: 'Duplicate Procedure Code',
          severity: 'High',
          description: 'CPT Code 01210 (Anesthesia) is billed twice for a single encounter.',
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      _id: 'doc-seed-103',
      originalName: 'Metro_Endocrinology_Rx_Insulin.pdf',
      fileName: 'sample_rx_103.pdf',
      fileUrl: '/samples/sample_rx.svg',
      fileType: 'application/pdf',
      fileSize: 184000,
      docType: 'Prescription',
      status: 'Verified',
      confidenceScore: 96,
      fraudScore: 8,
      fraudRiskLevel: 'Low',
      recommendation: 'Auto-Approve',
      processingTimeMs: 980,
      reviewNotes: 'Standard prescription claim with valid NPI and diagnosis code.',
      extractedData: {
        patient: {
          name: 'Robert Langdon',
          id: 'PAT-8812',
          age: '52',
          gender: 'Male',
          insurancePolicyNumber: 'POL-AET-332190',
          contact: '+1 (555) 782-9902',
        },
        provider: {
          name: 'MetroHealth Endocrinology Clinic',
          doctorName: 'Dr. Aris Thorne, M.D.',
          licenseNumber: 'DEA-AT9823419',
          department: 'Endocrinology',
          address: '500 Central Avenue, Suite 4B, Boston, MA',
          contact: '+1 (617) 555-8833',
        },
        dates: {
          serviceDate: '2026-09-22',
          billingDate: '2026-09-22',
          admissionDate: '',
          dischargeDate: '',
        },
        financial: {
          invoiceNumber: 'RX-67120-B',
          currency: 'INR',
          subtotal: 185.0,
          tax: 0.0,
          copay: 25.0,
          discount: 0.0,
          totalAmount: 160.0,
          calculatedSum: 160.0,
          calculationMatches: true,
        },
        lineItems: [
          {
            itemNumber: 1,
            code: 'NDC-0002-8215-01',
            description: 'Humalog (Insulin Lispro) 100 units/mL 10mL vial',
            quantity: 2,
            unitPrice: 80.0,
            totalPrice: 160.0,
            flagged: false,
          },
        ],
        medicalDetails: {
          diagnoses: [
            { condition: 'Type 1 Diabetes Mellitus', icdCode: 'E10.9' },
          ],
          medications: [
            { name: 'Insulin Lispro (Humalog)', dosage: 'SubQ sliding scale before meals', frequency: 'TID', days: '30' },
          ],
          testResults: [],
        },
      },
      anomalies: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      _id: 'doc-seed-104',
      originalName: 'Quest_Comprehensive_Metabolic_Panel.png',
      fileName: 'sample_lab_104.png',
      fileUrl: '/samples/sample_lab.svg',
      fileType: 'image/png',
      fileSize: 320000,
      docType: 'Diagnostic Lab Report',
      status: 'Verified',
      confidenceScore: 94,
      fraudScore: 16,
      fraudRiskLevel: 'Low',
      recommendation: 'Auto-Approve',
      processingTimeMs: 1150,
      reviewNotes: 'Standard clinical lab report. Chemistry panel with normal reference ranges.',
      extractedData: {
        patient: {
          name: 'Samantha Reed',
          id: 'PAT-7712',
          age: '34',
          gender: 'Female',
          insurancePolicyNumber: 'POL-CIGNA-994821',
          contact: '+1 (555) 431-7788',
        },
        provider: {
          name: 'Quest Diagnostics Regional',
          doctorName: 'Dr. Kimberly Adams, Pathologist',
          licenseNumber: 'CLIA-05D064321',
          department: 'Clinical Chemistry',
          address: '1200 Innovation Parkway, Dallas, TX',
          contact: '+1 (800) 555-5227',
        },
        dates: {
          serviceDate: '2026-09-24',
          billingDate: '2026-09-25',
          admissionDate: '',
          dischargeDate: '',
        },
        financial: {
          invoiceNumber: 'LAB-889104',
          currency: 'INR',
          subtotal: 450.0,
          tax: 0.0,
          copay: 30.0,
          discount: 0.0,
          totalAmount: 420.0,
          calculatedSum: 420.0,
          calculationMatches: true,
        },
        lineItems: [
          {
            itemNumber: 1,
            code: 'CPT-80053',
            description: 'Comprehensive Metabolic Panel (CMP 14)',
            quantity: 1,
            unitPrice: 220.0,
            totalPrice: 220.0,
            flagged: false,
          },
          {
            itemNumber: 2,
            code: 'CPT-80061',
            description: 'Lipid Panel, Total Cholesterol, HDL, Triglycerides',
            quantity: 1,
            unitPrice: 200.0,
            totalPrice: 200.0,
            flagged: false,
          },
        ],
        medicalDetails: {
          diagnoses: [
            { condition: 'Routine General Medical Examination', icdCode: 'Z00.00' },
          ],
          medications: [],
          testResults: [
            { testName: 'Total Cholesterol', value: '238', unit: 'mg/dL', referenceRange: '< 200', isAbnormal: true },
            { testName: 'Fasting Blood Glucose', value: '91', unit: 'mg/dL', referenceRange: '70 - 99', isAbnormal: false },
          ],
        },
      },
      anomalies: [],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];
}
