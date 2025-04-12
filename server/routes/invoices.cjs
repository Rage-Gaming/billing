const express = require('express');
const router = express.Router();
const { getNextInvoiceNumber } = require('../controllers/invoices.cjs');

router.post('/next-number', getNextInvoiceNumber);

module.exports = router;