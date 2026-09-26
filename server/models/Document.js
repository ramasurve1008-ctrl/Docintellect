import mongoose from 'mongoose';

const lineItemSchema = new mongoose.Schema({
  itemNumber: Number,
  code: { type: String, default: '' },
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false },
  flagReason: { type: String, default: '' },
});

const anomalySchema = new mongoose.Schema({
  field: { type: String, required: true },
  issue: { type: String, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  description: { type: String, required: true },
});

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    docType: {
      type: String,
      enum: [
        'Medical Bill',
        'Prescription',
        'Diagnostic Lab Report',
        'Discharge Summary',
        'Claim Form',
        'Other',
      ],
      default: 'Medical Bill',
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Verified', 'Flagged', 'Rejected'],
      default: 'Pending',
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    fraudScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    fraudRiskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Low',
    },
    recommendation: {
      type: String,
      enum: ['Auto-Approve', 'Manual Review', 'Reject'],
      default: 'Manual Review',
    },
    extractedData: {
      patient: {
        name: { type: String, default: '' },
        id: { type: String, default: '' },
        age: { type: String, default: '' },
        gender: { type: String, default: '' },
        insurancePolicyNumber: { type: String, default: '' },
        contact: { type: String, default: '' },
      },
      provider: {
        name: { type: String, default: '' },
        doctorName: { type: String, default: '' },
        licenseNumber: { type: String, default: '' },
        department: { type: String, default: '' },
        address: { type: String, default: '' },
        contact: { type: String, default: '' },
      },
      dates: {
        serviceDate: { type: String, default: '' },
        billingDate: { type: String, default: '' },
        admissionDate: { type: String, default: '' },
        dischargeDate: { type: String, default: '' },
      },
      financial: {
        invoiceNumber: { type: String, default: '' },
        currency: { type: String, default: 'INR' },
        subtotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        copay: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        calculatedSum: { type: Number, default: 0 },
        calculationMatches: { type: Boolean, default: true },
      },
      lineItems: [lineItemSchema],
      medicalDetails: {
        diagnoses: [
          {
            condition: String,
            icdCode: String,
          },
        ],
        medications: [
          {
            name: String,
            dosage: String,
            frequency: String,
            days: String,
          },
        ],
        testResults: [
          {
            testName: String,
            value: String,
            unit: String,
            referenceRange: String,
            isAbnormal: Boolean,
          },
        ],
      },
      rawExtractedText: {
        type: String,
        default: '',
      },
    },
    anomalies: [anomalySchema],
    processingTimeMs: {
      type: Number,
      default: 0,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.models.Document || mongoose.model('Document', documentSchema);
export default Document;
