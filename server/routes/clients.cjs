const express = require('express');
const router = express.Router();
const { searchClients, registerClient } = require('../controllers/clients.cjs');

router.post('/search', searchClients);
router.post('/register', registerClient); 

module.exports = router;