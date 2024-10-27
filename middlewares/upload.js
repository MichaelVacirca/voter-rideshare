// middlewares/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    crypto.randomBytes(16, (err, raw) => {
      cb(null, raw.toString('hex') + path.extname(file.originalname));
    });
  }
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = {
  // Single file upload
  single: multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  }),

  // Multiple files upload
  multiple: multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: 5 // Max 5 files
    }
  }),

  // Document upload for driver verification
  driverDocs: multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB
    }
  })
};

module.exports = upload;