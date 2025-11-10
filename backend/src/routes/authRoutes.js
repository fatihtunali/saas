const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes (authentication required)
router.get('/me', authenticateToken, authController.me);

module.exports = router;
