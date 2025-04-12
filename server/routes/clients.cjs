const express = require('express');
const router = express.Router();
const { searchClients } = require('../controllers/clients.cjs');

router.post('/search', searchClients);

module.exports = router;