const InvoiceCounter = require('../models/InvoiceCounter.cjs');

exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const counter = await InvoiceCounter.findByIdAndUpdate(
      'invoice',
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    res.json({ nextNumber: counter.seq });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};