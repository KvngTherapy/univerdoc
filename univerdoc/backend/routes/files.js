const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');
const { authenticate } = require('../middleware/auth');

// Upload file directly
router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No valid file uploaded' });
  }

  const file_url = `/uploads/${req.file.filename}`;
  return res.json({
    file_url,
    file_name: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Securely view/retrieve file
router.get('/:filename', authenticate, (req, res) => {
  const filename = req.params.filename;

  // Protect against directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  return res.sendFile(filePath);
});

module.exports = router;