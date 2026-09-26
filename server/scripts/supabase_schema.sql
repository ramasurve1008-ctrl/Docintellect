-- ==============================================================================
-- DocIntellect AI: Supabase PostgreSQL Schema Migration
-- Project: https://paoagkctoxjofhllitjd.supabase.co
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/paoagkctoxjofhllitjd/sql)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Documents / Medical Claims Table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    original_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT,
    doc_type TEXT DEFAULT 'Medical Bill',
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Flagged', 'Rejected')),
    fraud_score NUMERIC DEFAULT 0,
    fraud_risk_level TEXT DEFAULT 'Low' CHECK (fraud_risk_level IN ('Low', 'Medium', 'High')),
    confidence_score NUMERIC DEFAULT 95,
    extracted_data JSONB DEFAULT '{}'::jsonb,
    anomalies JSONB DEFAULT '[]'::jsonb,
    recommendation TEXT,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON public.documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_fraud_score ON public.documents(fraud_score);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);

-- 3. Users / Claims Adjusters Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    role TEXT DEFAULT 'Claims Adjuster',
    organization TEXT DEFAULT 'DocIntellect Medical Network',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit Log Table for HIPAA Compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id TEXT REFERENCES public.documents(id) ON DELETE CASCADE,
    adjuster_name TEXT,
    action TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Storage Bucket for Document Scans & PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('claims-documents', 'claims-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Security Policies
CREATE POLICY "Public Document Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'claims-documents');

CREATE POLICY "Adjuster Document Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'claims-documents');

-- 7. Enable Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write for service role & authenticated adjusters
CREATE POLICY "Enable read for all" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Enable insert for all" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all" ON public.documents FOR DELETE USING (true);

-- Success message
SELECT 'DocIntellect AI Schema deployed successfully for paoagkctoxjofhllitjd' AS status;
