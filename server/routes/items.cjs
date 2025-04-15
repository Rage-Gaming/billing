const express = require('express');
const router = express.Router();
const { createItem, searchItems } = require('../controllers/items.cjs');

router.post('/create', createItem);
router.post('/search', searchItems);

module.exports = router;