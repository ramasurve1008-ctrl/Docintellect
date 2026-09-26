# 🏥 DocIntellect AI — Intelligent Document Processing (IDP) Platform

> **An AI-powered Intelligent Document Processing (IDP) solution for automating Medical Insurance Claims reconciliation, OCR/Vision document understanding, and fraud anomaly detection powered by the Google Gemini API.**

[![Vite](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-000000?logo=express)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-4285F4?logo=google)](https://aistudio.google.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)

---

## 📌 Problem Statement & Core Solution

* **The Problem:** Hospitals, pharmacies, and health insurance payers process millions of complex, unstructured documents (itemized hospital bills, handwritten doctor prescriptions, and diagnostic lab reports). Manual data entry causes high administrative costs, slow claim turnaround, frequent billing calculation errors, and exposes payers to undetected duplicate or inflated claim fraud.
* **The Solution:** **DocIntellect AI** ingests multi-format documents (PDFs, high-resolution scans, images), utilizes **Google Gemini Multimodal Vision** to extract structured clinical and financial entities, performs real-time mathematical line item reconciliation, scores claims on a 0–100 Fraud Risk Index, and provides a Human-in-the-Loop (HITL) side-by-side verification dashboard for claims adjusters.

---

## 🏛️ System Architecture

```text
idp-platform/
├── client/                     # React 18 + Vite Frontend
│   ├── src/
│   │   ├── api/axios.js        # Axios instance with JWT auth interceptors
│   │   ├── context/AuthContext.jsx # Authentication state & role-based demo logins
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Header with health status & user profile
│   │   │   ├── Sidebar.jsx     # Navigation and claim type classification filters
│   │   │   ├── FileDropzone.jsx# Drag & drop uploader with 1-click test samples
│   │   │   ├── DataViewer.jsx  # Tabbed interactive extracted data & anomaly editor
│   │   │   ├── StatusBadge.jsx # Verified, Flagged, Pending, Rejected badges
│   │   │   └── FraudScoreGauge.jsx # Risk stratification meter (0-100)
│   │   ├── pages/              # Application views
│   │   │   ├── Login.jsx       # Auth login with 1-click demo persona buttons
│   │   │   ├── Register.jsx    # User account creation
│   │   │   ├── Dashboard.jsx   # KPI metric cards, filters, and claims table
│   │   │   ├── UploadPage.jsx  # Dedicated document ingestion console
│   │   │   ├── DocumentDetail.jsx # Side-by-side preview & HITL review workspace
│   │   │   └── Analytics.jsx   # Fraud distribution, turnaround, & financial metrics
│   │   ├── App.jsx             # React Router DOM configuration
│   │   ├── index.css           # Modern medical-fintech styling with Tailwind CSS
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js          # Vite configuration with /api backend proxy
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   └── db.js               # Resilient MongoDB connection with local fallback
│   ├── controllers/
│   │   ├── auth.controller.js  # JWT registration, login, and fast demo personas
│   │   └── document.controller.js # Multer upload, Gemini ingestion, and CRUD ops
│   ├── middleware/
│   │   ├── auth.middleware.js  # JWT Bearer token authentication & role checks
│   │   ├── upload.middleware.js# Multer config (10MB limit, PDF & image filters)
│   │   └── validate.middleware.js # Zod request validation schemas
│   ├── models/
│   │   ├── User.js             # Mongoose User model with bcrypt password hashing
│   │   ├── Document.js         # Claim schema (Patient, Provider, Items, Fraud)
│   │   └── Insight.js          # Aggregated analytics schema
│   ├── routes/
│   │   ├── auth.routes.js      # /api/auth routes
│   │   └── document.routes.js  # /api/documents routes
│   ├── services/
│   │   ├── ai.service.js       # Google Gemini Multimodal Vision & OCR service
│   │   └── store.service.js    # Resilient local JSON data store fallback
│   ├── samples/                # High-resolution clinical sample documents (SVG/PDF)
│   │   ├── sample_bill_clean.svg
│   │   ├── sample_bill_flagged.svg
│   │   ├── sample_rx.svg
│   │   └── sample_lab.svg
│   ├── .env.example            # Environment variables template
│   ├── server.js               # Express application entry point
│   └── package.json
│
├── package.json                # Root orchestration package.json
└── README.md
```

---

## ⚡ Key Features

1. **Multimodal OCR & Document Understanding:**
   * Powered by **Google Gemini 2.5 Flash** (`@google/generative-ai`).
   * Direct parsing of image & PDF document buffers with zero third-party OCR dependencies.
   * Extracts structured entities: Patient demographics, Insurance policy #, Attending physician & NPI, Encounter dates, ICD-10 diagnoses, CPT procedure codes, and Prescription details.

2. **Automated Mathematical Reconciliation & Fraud Detection:**
   * Reconciles itemized line items sum ($\sum (\text{Qty} \times \text{UnitPrice})$) against billed subtotal and total claim amount.
   * Detects duplicate procedure billing (e.g. unbundled anesthesia or imaging billed twice).
   * Generates a 0–100 **Fraud Risk Score** with automated recommendations (`Auto-Approve`, `Manual Review`, `Reject`).

3. **Human-in-the-Loop (HITL) Side-by-Side Review Console:**
   * Left panel: Interactive original document viewport (Zoom In, Zoom Out, Reset, Fullscreen).
   * Right panel: Tabbed extracted data editor allowing adjusters to edit line items, add charges, view anomalies, inspect raw JSON, and single-click **Approve**, **Flag for Audit**, or **Reject**.

4. **1-Click Instant Demo Testing:**
   * Preloaded with high-fidelity sample medical bills, flagged duplicate claims, prescriptions, and lab reports.
   * Test out-of-the-box in 1 click without hunting down medical PDFs.

5. **Fault-Tolerant & Resilient Architecture:**
   * If local MongoDB is not running, the backend seamlessly activates an internal file-backed store so all auth, uploads, and data reviews continue working 100% reliably.
   * If Gemini API key is missing or quota-limited, a high-fidelity AI simulation engine generates realistic extractions for continuous evaluation.

---

## ⚙️ Environment Variables

Create `.env` inside `server/` (a template is provided in `server/.env.example`):

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (MongoDB Atlas or Local MongoDB)
# Note: If MongoDB is offline, DocIntellect automatically uses local storage fallback
MONGO_URI=mongodb://localhost:27017/docintellect

# Security & Authentication
JWT_SECRET=super_secret_jwt_key_docintellect_ai_2026_production
JWT_EXPIRES_IN=7d

# Google Gemini API Key
# Obtain an API key from Google AI Studio: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Upload Limits
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_TYPES=pdf,png,jpg,jpeg,webp
```

---

## 🚀 Quickstart & Execution Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher) & **npm**

### Step 1: Install Dependencies

From the project root:
```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Step 2: Start the Backend Server

```bash
cd server
npm start
# Server listens on http://localhost:5000
```

### Step 3: Start the Vite Frontend Client

In a separate terminal:
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 4: Access the Application

1. Open your browser and navigate to **`http://localhost:5173`**.
2. On the Login screen, click **"Claims Adjuster (Sarah Jenkins)"** or **"Medical Auditor (Dr. Marcus Vance)"** for instant 1-click access.
3. Explore the pre-loaded claims on the **Dashboard** or navigate to **Ingest Document** to upload or test sample claims!

---

## 🧪 Testing the Claims Pipeline

| Sample Document | Category | Expected Behavior |
| :--- | :--- | :--- |
| **`St. Jude Cardiology Bill`** | Medical Bill | Clean claim, mathematical sum matches billed total. **Auto-Approved** (Fraud Score: 12/100). |
| **`Mercy Regional Trauma Bill`** | Medical Bill | Mathematical discrepancy (+$850 unitemized inflation) + duplicate CPT-01210 code. **Flagged for Audit** (Fraud Score: 78/100). |
| **`MetroHealth Insulin Rx`** | Prescription | Extracted Humalog 100u/mL, NDC code, physician DEA #. **Verified** (Fraud Score: 8/100). |
| **`Quest CMP Lab Report`** | Diagnostic Lab | Extracted metabolic panel, lipid panel, reference ranges, and flagged high cholesterol. **Verified**. |

---

## 🌐 Production Deployment Guidelines

### Frontend (Vercel)
1. Set Root Directory to `client`.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Environment Variables:
   * `VITE_API_URL`: Your deployed backend URL (e.g. `https://docintellect-api.onrender.com/api`).

### Backend (Render / Railway / AWS EC2)
1. Set Root Directory to `server`.
2. Build Command: `npm install`.
3. Start Command: `node server.js`.
4. Environment Variables:
   * `PORT`: `5000` (or dynamic `$PORT`)
   * `MONGO_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
   * `JWT_SECRET`: Secure 256-bit random secret
   * `GEMINI_API_KEY`: Your Google Gemini API key

---

## 📄 License
This project is licensed under the MIT License.
