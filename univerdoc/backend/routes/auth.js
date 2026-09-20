const express = require('express');
const router = express.Router();
const { login, register, logout, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

module.exports = router;