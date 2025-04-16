const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  client: {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true }
  },
  invoiceInfo: {
    date: { type: Date, default: Date.now, required: true },
    number: { type: String, required: true, unique: true, trim: true }
  },
  items: [{
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    amount: { type: Number, required: true, min: 0 }
  }],
  totals: {
    subTotal: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

InvoiceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

InvoiceSchema.index({ 'invoiceInfo.number': 1 }, { unique: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
