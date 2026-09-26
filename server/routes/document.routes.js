import express from 'express';
import {
  uploadAndProcess,
  getDocuments,
  getDocumentById,
  updateDocumentData,
  updateDocumentStatus,
  deleteDocument,
  reprocessDocument,
  getAnalytics,
} from '../controllers/document.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { validate, updateDocumentStatusSchema } from '../middleware/validate.middleware.js';

const router = express.Router();

// Apply auth protection to all document endpoints
router.use(protect);

router.get('/analytics', getAnalytics);
router.post('/upload', upload.single('file'), uploadAndProcess);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocumentData);
router.patch('/:id/status', validate(updateDocumentStatusSchema), updateDocumentStatus);
router.post('/:id/reprocess', reprocessDocument);
router.delete('/:id', deleteDocument);

export default router;
