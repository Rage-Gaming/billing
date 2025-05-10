const express = require('express');
const router = express.Router();
const { register, login, searchUsers, deleteUser } = require('../controllers/auth.cjs');

router.post('/register', register);
router.post('/login', login);
router.post('/search', searchUsers);
router.post('/delete', deleteUser);

module.exports = router;