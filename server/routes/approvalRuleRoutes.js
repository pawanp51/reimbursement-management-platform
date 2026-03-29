// Approval Rule routes
const express = require('express');
const {
  createApprovalRule,
  getUserApprovalRules,
  updateApprovalRule,
  deleteApprovalRule,
} = require('../controllers/approvalRuleController');
const { authMiddleware, authorize } = require('../middleware/auth');

const router = express.Router();

// All approval rule routes require authentication
router.use(authMiddleware);

// Create approval rule - ADMIN only
router.post('/', authorize('ADMIN'), createApprovalRule);

// Get user approval rules
router.get('/user/:userId', getUserApprovalRules);

// Update approval rule - ADMIN or rule owner only
router.put('/:ruleId', updateApprovalRule);

// Delete approval rule - ADMIN or rule owner only
router.delete('/:ruleId', deleteApprovalRule);

module.exports = router;
