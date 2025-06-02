const multer = require('multer');
const path = require('path');

// Using memory storage instead of disk storage for Vercel compatibility
// This stores files in memory as Buffer objects rather than writing to disk
const storage = multer.memoryStorage();


// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg and .png image files are allowed'), false);
  }
};

// Configure multer with size limits (5MB)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
