const InvoiceCounter = require('../models/InvoiceCounter.cjs');
const Invoice = require('../models/Invoice.cjs');

// Update counter only when invoice is successfully saved
async function updateInvoiceCounter() {
  try {
    const counter = await InvoiceCounter.findOneAndUpdate(
      { _id: 'invoice' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      throw new Error('Failed to create or update invoice counter');
    }

    return counter.seq;
  } catch (err) {
    console.error('Error updating invoice counter:', err);
    throw err;
  }
}

// Save invoice with user-provided number
exports.saveInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    console.log('Received invoice date:', invoiceData.invoiceInfo.date);

    // Check if invoice number exists in body
    if (!invoiceData.invoiceInfo?.number) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number is required'
      });
    }

    // Check for existing invoice with same number
    const existing = await Invoice.findOne({
      'invoiceInfo.number': invoiceData.invoiceInfo.number
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Invoice number already exists',
        existingInvoice: {
          date: existing.invoiceInfo.date,
          clientName: existing.client.name
        }
      });
    }

    // Create new invoice
    const invoice = new Invoice({
      client: {
        name: invoiceData.client.name,
        address: invoiceData.client.address,
        phone: invoiceData.client.phone
      },
      invoiceInfo: {
        date: invoiceData.invoiceInfo.date,
        number: invoiceData.invoiceInfo.number
      },
      items: invoiceData.items.map(item => ({
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
        amount: item.amount
      })),
      author: invoiceData.author,
      totals: invoiceData.totals
    });

    await invoice.validate();
    await invoice.save();

    // Increment counter only after successful save
    await updateInvoiceCounter();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoiceNumber: invoice.invoiceInfo.number,
      invoiceId: invoice._id
    });

  } catch (err) {
    console.error('Error saving invoice:', err);

    if (err.name === 'ValidationError') {
      const errors = {};
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to save invoice',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Optional: Get current invoice counter (debug/admin)
exports.getCurrentInvoiceNumber = async (req, res) => {
  try {
    const counter = await InvoiceCounter.findOne({ _id: 'invoice' });
    res.json({ nextNumber: counter?.seq || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.searchInvoice = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query ) return res.status(400).json({ success: false, message: 'Search query is required' });
    if (query.length < 2) return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters long' });
    const regex = new RegExp(query, 'i'); // Case-insensitive regex

    const invoices = await Invoice.find({
      $or: [
        { 'client.name': regex },
        { 'client.address': regex },
        { 'client.phone': regex },
        { 'invoiceInfo.number': regex }
      ]
    }).sort({ createdAt: -1 }); // Sort by creation date, most recent first

    res.status(200).json({
      success: true,
      data: invoices
    });
  } catch (err) {
    console.error('Error searching invoices:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to search invoices',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

exports.getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.query; 
    
    if (!invoiceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invoice ID is required' 
      });
    }

    const invoices = await Invoice.find({ "invoiceInfo.number": invoiceId });
    
    if (invoices.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      count: invoices.length,  // Useful to know how many were found
      data: invoices
    });
  }
  catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}