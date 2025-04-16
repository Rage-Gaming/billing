const express = require('express');
const router = express.Router();
const { getNextInvoiceNumber, saveInvoice } = require('../controllers/invoices.cjs');

router.post('/next-number', getNextInvoiceNumber);
router.post('/saveInvoice', saveInvoice)

module.exports = router;