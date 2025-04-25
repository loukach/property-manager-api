const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
// Store files in memory, not on disk
const storage = multer.memoryStorage();

// Define file filter
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure upload settings
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Error handler for multer errors
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    // Custom file filter error or other
    return res.status(400).json({ error: err.message });
  }
  
  // No errors
  next();
};

module.exports = {
  upload,
  handleUploadErrors
};