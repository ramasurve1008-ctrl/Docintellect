import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (or activate resilient local fallback)
connectDB();

// Ensure required public directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const samplesDir = path.join(__dirname, 'samples');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(samplesDir)) fs.mkdirSync(samplesDir, { recursive: true });

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file serving for uploaded files and demo sample documents
app.use('/uploads', express.static(uploadsDir));
app.use('/samples', express.static(samplesDir));

// System Health & Telemetry Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'DocIntellect AI - Intelligent Document Processing Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiEngine: {
      provider: 'Google Gemini Vision & OCR',
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'),
    },
  });
});

// Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 10MB limit',
      });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Express Listener
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 DocIntellect AI IDP Server running on port: ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🧠 AI Engine: Google Gemini API (${process.env.GEMINI_MODEL || 'gemini-2.5-flash'})`);
  console.log(`=======================================================`);
});
