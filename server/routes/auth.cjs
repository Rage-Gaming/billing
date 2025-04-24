const express = require('express');
const router = express.Router();
const { register, login, searchUsers } = require('../controllers/auth.cjs');

router.post('/register', register);
router.post('/login', login);
router.post('/search', searchUsers);

module.exports = router;