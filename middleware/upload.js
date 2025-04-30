const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    console.log('Upload directory:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('File type:', file.mimetype);
  // Check file type
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  console.error('Multer error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = { upload, handleMulterError }; 