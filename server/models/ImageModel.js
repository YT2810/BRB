// server/models/ImageModel.js
// This model defines the schema for storing image data in MongoDB.

const mongoose = require('mongoose');

// Schema for fractionated images
const ImageSchema = new mongoose.Schema({
  originalImage: { type: String, required: true },  // URL of the original image
  fractionedImages: { type: [String], required: true },  // URLs of the fractionated images
  owner: { type: String, required: true },  // Wallet address of the owner
  price: { type: Number, required: true },  // Total price of the fractionated image
  createdAt: { type: Date, default: Date.now }  // Creation date
});

module.exports = mongoose.model('Image', ImageSchema);
