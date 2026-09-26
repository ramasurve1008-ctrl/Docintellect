import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;
let isConfigured = false;

export const initSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://paoagkctoxjofhllitjd.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseKey || supabaseKey.includes('your_supabase')) {
    console.log('ℹ️ Supabase URL configured:', supabaseUrl);
    console.log('⚠️ SUPABASE_KEY is missing in server/.env. Provide the anon/service_role API key to enable live Supabase persistence.');
    isConfigured = false;
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    isConfigured = true;
    console.log(`✅ Supabase Client Initialized: ${supabaseUrl}`);
    return supabaseClient;
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
    isConfigured = false;
    return null;
  }
};

export const getSupabase = () => supabaseClient;
export const isSupabaseConnected = () => isConfigured;

/**
 * Test connectivity against Supabase
 */
export const testSupabaseConnection = async () => {
  if (!supabaseClient) return { success: false, message: 'Supabase client not initialized (missing API key)' };

  try {
    // Attempt a light ping or health check
    const { data, error } = await supabaseClient.from('documents').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, it's still reachable
      if (error.message?.includes('relation "public.documents" does not exist') || error.code === '42P01') {
        return {
          success: true,
          tableReady: false,
          message: 'Connected to Supabase, but "documents" table not yet created. Run schema migration script.',
        };
      }
      return { success: false, error: error.message };
    }
    return { success: true, tableReady: true, count: data };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Sync / Upsert a document record to Supabase
 */
export const syncDocumentToSupabase = async (doc) => {
  if (!supabaseClient) return null;

  try {
    const payload = {
      id: String(doc._id || doc.id),
      original_name: doc.originalName || doc.original_name,
      file_url: doc.fileUrl || doc.file_url,
      file_size: doc.fileSize || doc.file_size,
      mime_type: doc.mimeType || doc.mime_type,
      doc_type: doc.docType || doc.doc_type,
      status: doc.status || 'Pending',
      fraud_score: doc.fraudScore || doc.fraud_score || 0,
      fraud_risk_level: doc.fraudRiskLevel || doc.fraud_risk_level || 'Low',
      confidence_score: doc.confidenceScore || doc.confidence_score || 95,
      extracted_data: doc.extractedData || doc.extracted_data || {},
      anomalies: doc.anomalies || [],
      recommendation: doc.recommendation || '',
      review_notes: doc.reviewNotes || doc.review_notes || '',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from('documents')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('⚠️ Supabase document sync warning:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('⚠️ Supabase sync exception:', err.message);
    return null;
  }
};

/**
 * Upload a document buffer to Supabase Storage bucket
 */
export const uploadToSupabaseStorage = async (fileBuffer, fileName, mimeType) => {
  if (!supabaseClient) return null;

  try {
    const bucketName = 'claims-documents';
    const filePath = `uploads/${Date.now()}_${fileName}`;

    const { data, error } = await supabaseClient.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.warn('⚠️ Supabase Storage upload warning:', error.message);
      return null;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.warn('⚠️ Supabase Storage exception:', err.message);
    return null;
  }
};
