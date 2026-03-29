// Transaction routes
const express = require('express');
const multer = require('multer');
const {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  updateTransaction,
  submitTransaction,
  approveTransaction,
  rejectTransaction,
  deleteTransaction,
  getPendingApprovalsForApprover,
  getApprovalHistory,
  getAllTransactions,
  getUserTransactionHistory,
} = require('../controllers/transactionController');
const {
  uploadAttachment,
  getAttachment,
  downloadAttachment,
  deleteAttachment,
  updateOCRData,
} = require('../controllers/attachmentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image formats
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, Images, Word, Excel'));
    }
  },
});

// All routes require authentication
router.use(authMiddleware);

// ==================== FIXED PATH ROUTES (must come before parameter routes) ====================

// Create transaction
router.post('/', createTransaction);

// Get all user transactions
router.get('/', getUserTransactions);

// Get user transaction history (all transactions they created, submitted, or approved)
router.get('/history/all', getUserTransactionHistory);

// Get all transactions (ADMIN ONLY)
router.get('/admin/all-transactions', getAllTransactions);

// Get pending approvals for current approver
router.get('/approvals/pending', getPendingApprovalsForApprover);

// ==================== PARAMETRIZED ROUTES (with :transactionId) ====================

// Get approval history for transaction (specific route - must come before generic :transactionId)
router.get('/:transactionId/approvals/history', getApprovalHistory);

// Update transaction
router.put('/:transactionId', updateTransaction);

// Submit transaction for approval
router.post('/:transactionId/submit', submitTransaction);

// Approve transaction
router.post('/:transactionId/approve', approveTransaction);

// Reject transaction
router.post('/:transactionId/reject', rejectTransaction);

// ==================== ATTACHMENT ROUTES (specific paths) ====================

// Upload attachment
router.post('/:transactionId/attachments', upload.single('file'), uploadAttachment);

// Get attachment details
router.get('/:transactionId/attachments/:attachmentId', getAttachment);

// Download attachment
router.get('/:transactionId/attachments/:attachmentId/download', downloadAttachment);

// Update OCR data for attachment
router.put('/:transactionId/attachments/:attachmentId/ocr', updateOCRData);

// Delete attachment
router.delete('/:transactionId/attachments/:attachmentId', deleteAttachment);

// ==================== CATCH-ALL PARAMETRIZED ROUTES (must come last) ====================

// Get transaction by ID (generic catch-all - comes last)
router.get('/:transactionId', getTransactionById);

// Delete transaction
router.delete('/:transactionId', deleteTransaction);

module.exports = router;
