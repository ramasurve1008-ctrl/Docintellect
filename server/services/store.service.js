import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const storeFile = path.join(dataDir, 'local_store.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

class InMemoryStore {
  constructor() {
    this.users = [];
    this.documents = [];
    this.insights = [];
    this.load();
    this.seedDefaultUsers();
  }

  load() {
    try {
      if (fs.existsSync(storeFile)) {
        const raw = fs.readFileSync(storeFile, 'utf8');
        const data = JSON.parse(raw);
        this.users = data.users || [];
        this.documents = data.documents || [];
        this.insights = data.insights || [];
      }
    } catch (err) {
      console.warn('⚠️ Could not load local_store.json, initializing fresh store.');
    }
  }

  save() {
    try {
      const data = {
        users: this.users,
        documents: this.documents,
        insights: this.insights,
      };
      fs.writeFileSync(storeFile, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to write local_store.json:', err.message);
    }
  }

  async seedDefaultUsers() {
    if (this.users.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      this.users.push({
        _id: 'user-demo-adjuster-1',
        name: 'Sarah Jenkins',
        email: 'adjuster@docintellect.ai',
        password: hashedPassword,
        role: 'Claims Adjuster',
        organization: 'Aetna Health Care Claims',
        createdAt: new Date().toISOString(),
      });
      this.users.push({
        _id: 'user-demo-auditor-2',
        name: 'Dr. Marcus Vance',
        email: 'auditor@docintellect.ai',
        password: hashedPassword,
        role: 'Medical Auditor',
        organization: 'BlueCross Special Investigations',
        createdAt: new Date().toISOString(),
      });
      this.save();
    }
  }

  // User methods
  findUserByEmail(email) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return this.users.find((u) => u._id === id);
  }

  addUser(user) {
    this.users.push(user);
    this.save();
    return user;
  }

  // Document methods
  getAllDocuments(filter = {}) {
    let list = [...this.documents];
    if (filter.status && filter.status !== 'All') {
      list = list.filter((d) => d.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.docType && filter.docType !== 'All') {
      list = list.filter((d) => d.docType.toLowerCase() === filter.docType.toLowerCase());
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          d.originalName.toLowerCase().includes(q) ||
          d.extractedData?.patient?.name?.toLowerCase().includes(q) ||
          d.extractedData?.provider?.name?.toLowerCase().includes(q) ||
          d.extractedData?.financial?.invoiceNumber?.toLowerCase().includes(q)
      );
    }
    // Sort desc by createdAt
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  getDocumentById(id) {
    return this.documents.find((d) => d._id === id || d.id === id);
  }

  addDocument(doc) {
    this.documents.unshift(doc);
    this.save();
    return doc;
  }

  updateDocument(id, updates) {
    const idx = this.documents.findIndex((d) => d._id === id || d.id === id);
    if (idx !== -1) {
      this.documents[idx] = {
        ...this.documents[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.documents[idx];
    }
    return null;
  }

  deleteDocument(id) {
    const initialLen = this.documents.length;
    this.documents = this.documents.filter((d) => d._id !== id && d.id !== id);
    this.save();
    return this.documents.length < initialLen;
  }

  getAnalytics() {
    const total = this.documents.length;
    const verified = this.documents.filter((d) => d.status === 'Verified').length;
    const flagged = this.documents.filter((d) => d.status === 'Flagged').length;
    const rejected = this.documents.filter((d) => d.status === 'Rejected').length;
    const pending = this.documents.filter(
      (d) => d.status === 'Pending' || d.status === 'Processing'
    ).length;

    const totalClaimValue = this.documents.reduce((sum, d) => {
      return sum + (Number(d.extractedData?.financial?.totalAmount) || 0);
    }, 0);

    const approvedClaimValue = this.documents
      .filter((d) => d.status === 'Verified')
      .reduce((sum, d) => {
        return sum + (Number(d.extractedData?.financial?.totalAmount) || 0);
      }, 0);

    const avgProcessingTimeMs = total > 0
      ? Math.round(
          this.documents.reduce((acc, d) => acc + (d.processingTimeMs || 1200), 0) / total
        )
      : 1450;

    const fraudDistribution = {
      low: this.documents.filter((d) => (d.fraudScore || 0) < 30).length,
      medium: this.documents.filter((d) => (d.fraudScore || 0) >= 30 && (d.fraudScore || 0) < 70).length,
      high: this.documents.filter((d) => (d.fraudScore || 0) >= 70).length,
    };

    const docTypeDistribution = {
      medicalBill: this.documents.filter((d) => d.docType === 'Medical Bill').length,
      prescription: this.documents.filter((d) => d.docType === 'Prescription').length,
      labReport: this.documents.filter((d) => d.docType === 'Diagnostic Lab Report').length,
      dischargeSummary: this.documents.filter((d) => d.docType === 'Discharge Summary').length,
      other: this.documents.filter((d) => !['Medical Bill', 'Prescription', 'Diagnostic Lab Report', 'Discharge Summary'].includes(d.docType)).length,
    };

    return {
      totalProcessed: total,
      verifiedCount: verified,
      flaggedCount: flagged,
      rejectedCount: rejected,
      pendingCount: pending,
      totalClaimValue: Math.round(totalClaimValue * 100) / 100,
      approvedClaimValue: Math.round(approvedClaimValue * 100) / 100,
      avgProcessingTimeMs,
      fraudRiskDistribution: fraudDistribution,
      docTypeDistribution,
    };
  }
}

export const inMemoryStore = new InMemoryStore();
