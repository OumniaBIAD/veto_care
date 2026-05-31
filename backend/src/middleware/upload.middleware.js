const multer = require('multer');
const path = require('path');

// Destination folder: ../uploads relative to backend root
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists; Node will create it if missing.
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });
module.exports = upload;
