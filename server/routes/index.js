// Main routes
const express = require('express');
const { getHome, healthCheck } = require('../controllers/homeController');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const router = express.Router();

// Home routes
router.get('/', getHome);
router.get('/health', healthCheck);

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);

// Future route groups can be added here
// router.use('/api/users', userRoutes);
// router.use('/api/approvals', approvalRoutes);

module.exports = router;
