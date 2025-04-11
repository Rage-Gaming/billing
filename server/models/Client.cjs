const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true  // Add index for better search performance
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true,
    index: true  // Add index if you want to search by city
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
    index: true  // Add index for phone number searches
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for full-text search
clientSchema.index({
  name: 'text',
  contactNumber: 'text',
  city: 'text'
}, {
  weights: {
    name: 3,       // Higher weight for name matches
    contactNumber: 2,
    city: 1
  }
});

module.exports = mongoose.model('Client', clientSchema);