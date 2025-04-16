const mongoose = require('mongoose');

const InvoiceCounterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  seq: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('InvoiceCounter', InvoiceCounterSchema);