const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadErrors } = require('../middleware/upload');
const { propertyValidation } = require('../utils/validators');
const {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  getPropertyImages
} = require('../controllers/propertyController');

const router = express.Router();

// MVP: Authentication disabled for now
// router.use(authenticateToken);

// Property routes
router.get('/', getAllProperties);
router.get('/:id', getPropertyById);
router.post('/', propertyValidation, createProperty);
router.put('/:id', propertyValidation, updateProperty);
router.delete('/:id', deleteProperty);

// Property images routes
router.post('/:id/images', upload.single('image'), handleUploadErrors, uploadPropertyImage);
router.get('/:id/images', getPropertyImages);

module.exports = router;