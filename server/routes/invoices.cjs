const express = require('express');
const router = express.Router();
const { getCurrentInvoiceNumber, saveInvoice, searchInvoice, getInvoice, updateInvoice } = require('../controllers/invoices.cjs');

router.post('/currentInvoiceNo', getCurrentInvoiceNumber);
router.post('/saveInvoice', saveInvoice);
router.post('/search', searchInvoice);
router.post('/getInvoice', getInvoice);
router.post('/update', updateInvoice);


module.exports = router;