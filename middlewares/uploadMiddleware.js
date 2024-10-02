// middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store files (you can change this)
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to check file type (Optional, e.g., only allow PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  cb(null, true);
};

// Initialize the upload middleware with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Max file size 5MB (optional)
});

module.exports = upload;
