// server/models/BatchModel.js
// This model defines the schema for storing image batches in MongoDB.

const mongoose = require('mongoose');

// Schema for image batches
const BatchSchema = new mongoose.Schema({
  batchCode: { type: String, required: true, unique: true },  // Unique code for the batch
  images: { type: [mongoose.Schema.Types.ObjectId], ref: 'Image', required: true },  // Reference to the IDs of the fractionated images
  createdAt: { type: Date, default: Date.now }  // Creation date
});

module.exports = mongoose.model('Batch', BatchSchema);
