// Auth routes
const express = require('express');
const {
  addUser,
  sendPasswordToEmail,
} = require('../controllers/authControllor');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();


// Admin-only routes (requires token and ADMIN role)
router.post('/add-user', authMiddleware, authorize('ADMIN'), addUser);
router.post('/send-password', authMiddleware, authorize('ADMIN'), sendPasswordToEmail);

module.exports = router;
