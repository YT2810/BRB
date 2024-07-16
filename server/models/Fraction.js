const mongoose = require('mongoose');

const fractionSchema = new mongoose.Schema({
  fractionId: { type: Number, required: true, unique: true },
  originalId: { type: Number, required: true },
  tokenURI: { type: String, required: true },
  price: { type: Number, required: true },
  owner: { type: String, required: true }
});

const Fraction = mongoose.model('Fraction', fractionSchema);

module.exports = Fraction;
