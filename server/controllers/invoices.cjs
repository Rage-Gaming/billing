const InvoiceCounter = require('../models/InvoiceCounter.cjs');
const Invoice = require('../models/Invoice.cjs');

exports.getCurrentInvoiceNumber = async (req, res) => {
  try {
    const counter = await InvoiceCounter.find({
      _id: 'invoice'
    }).exec();
    res.json({ nextNumber: counter[0].seq});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

  
};

async function updateInvoiceCounter() {  // Fixed typo in function name (lowercase 'd')
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
    throw err;  // Re-throw the error for the caller to handle
  }
}

exports.saveInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    
    // Create a new invoice document
    const invoice = new Invoice({
      client: {
        name: invoiceData.client.name,
        address: invoiceData.client.address,
        phone: invoiceData.client.phone
      },
      invoiceInfo: {
        date: invoiceData.invoiceInfo.date, // Use provided date
        number : invoiceData.invoiceInfo.number // Uncomment if you want to use invoice number
      },
      items: invoiceData.items.map(item => ({
        description: item.description,
        quantity: item.qty,
        rate: item.rate,
        amount: item.amount
      })),
      totals: {
        subTotal: invoiceData.totals.subTotal,
        gst: invoiceData.totals.gst,
        total: invoiceData.totals.total
      }
    });

    // Validate the invoice before saving
    await invoice.validate();
    
    // Save to MongoDB
    await invoice.save();
    upDateInvoiceCounter();
    
    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
    });
    
  } catch (err) {
    console.error('Error saving invoice:', err);
    
    // Handle validation errors
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
    
    // Handle duplicate key errors (if you uncomment invoice number)
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error',
        // error: 'An invoice with this identifier already exists'
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to save invoice',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};