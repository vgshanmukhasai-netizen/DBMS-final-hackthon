const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload and certificate directories exist
const uploadDir = path.join(__dirname, '..', 'uploads');
const certificateDir = path.join(__dirname, '..', 'certificates');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(certificateDir)) {
  fs.mkdirSync(certificateDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `poster-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

module.exports = upload;
