const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  city: String,
  contactNumber: String
}, { timestamps: true });

// Create text index for search
ClientSchema.index({ name: 'text', city: 'text', contactNumber: 'text' });

module.exports = mongoose.model('Client', ClientSchema);