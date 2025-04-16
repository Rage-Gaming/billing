const express = require('express');
const router = express.Router();
const { getCurrentInvoiceNumber, saveInvoice } = require('../controllers/invoices.cjs');

router.post('/currentInvoiceNo', getCurrentInvoiceNumber);
router.post('/saveInvoice', saveInvoice)

module.exports = router;