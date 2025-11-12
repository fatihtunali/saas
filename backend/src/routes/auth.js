const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC AUTH ROUTES
// ============================================

// Login - No authentication required
router.post('/login', authController.login);

// Register - No authentication required
router.post('/register', authController.register);

// Get current user - Authentication required
router.get('/me', authenticateToken, authController.me);

module.exports = router;
