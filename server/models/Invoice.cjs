const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    client: {
        name: {
            type: String,
            required: [true, 'Client name is required'],
            trim: true
        },
        address: {
            type: String,
            required: [true, 'Client address is required'],
            trim: true
        },
        phone: {
            type: String,
            required: [true, 'Client phone is required'],
            trim: true
        }
    },
    invoiceInfo: {
        date: {
            type: Date,
            required: [true, 'Invoice date is required'],
            default: Date.now
        },
        number: {
          type: String,
          required: [true, 'Invoice number is required'],
          unique: true,
          trim: true
        }
    },
    items: [{
        description: {
            type: String,
            required: [true, 'Item description is required'],
            trim: true
        },
        quantity: {
            type: Number,
            required: [true, 'Item quantity is required'],
            min: [0, 'Quantity cannot be negative']
        },
        rate: {
            type: Number,
            required: [true, 'Item rate is required'],
            min: [0, 'Rate cannot be negative']
        },
        amount: {
            type: Number,
            required: [true, 'Item amount is required'],
            min: [0, 'Amount cannot be negative']
        }
    }],
    totals: {
        subTotal: {
            type: Number,
            required: [true, 'Subtotal is required'],
            min: [0, 'Subtotal cannot be negative']
        },
        gst: {
            type: Number,
            required: [true, 'GST amount is required'],
            min: [0, 'GST cannot be negative']
        },
        total: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total cannot be negative']
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
InvoiceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Add index for frequently queried fields
InvoiceSchema.index({ 'client.name': 1 });
InvoiceSchema.index({ 'invoiceInfo.date': -1 });
InvoiceSchema.index({ 'invoiceInfo.number': 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);