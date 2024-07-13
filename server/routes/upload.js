// server/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fractionateImage } = require('../services/uploadService');
require('dotenv').config();

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST /upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { totalPrice, owner } = req.body;

    console.log('File uploaded:', file);
    console.log('Received totalPrice:', totalPrice);
    console.log('Received owner:', owner);

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    // Process the image to create fractions
    console.log('Processing image to create fractions...');
    const { originalImage, fractionedImages } = await fractionateImage(file.path, owner, totalPrice);

    const originalImageUri = 'ipfs://original_image_uri'; // Replace with actual IPFS URI
    console.log('Image processing complete. Sending response to client...');
    res.json({ originalImageUri, fractionedImages });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Internal server error.');
  }
});

module.exports = router;
