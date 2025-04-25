const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');
const {
  getDocumentsByEntity,
  uploadDocument,
  getDocumentById,
  deleteDocument
} = require('../controllers/documentController');

const router = express.Router();

// MVP: Authentication disabled for now
// router.use(authenticateToken);

// Document routes
router.get('/:entityType/:entityId', getDocumentsByEntity);
router.post('/:entityType/:entityId', upload.single('document'), handleUploadErrors, uploadDocument);
router.get('/:documentId', getDocumentById);
router.delete('/:documentId', deleteDocument);

module.exports = router;