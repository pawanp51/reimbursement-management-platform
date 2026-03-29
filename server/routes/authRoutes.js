// Auth routes
const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getCurrentUser,
} = require('../controllers/authControllor');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
