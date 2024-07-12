// server/routes/upload.js
// This route handles the upload and fractionation of images.

const express = require('express');
const multer = require('multer');
const path = require('path');
const { fractionateImage } = require('../services/uploadService');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') });

// Handle image upload and fractionation
router.post('/', upload.single('image'), async (req, res) => {
    const { totalPrice, owner } = req.body; // Get totalPrice and owner from request body

    try {
        const imagePath = req.file.path; // Path to the uploaded image
        const fractions = await fractionateImage(imagePath, owner, totalPrice); // Call the service to fractionate the image
        res.status(200).json({ fractions }); // Respond with the fractions
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
});

module.exports = router;
