// Transaction controller
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const { sendResponse, sendError } = require('../utils/responses');
const { STATUS_CODES } = require('../config/constants');

// ==================== CREATE TRANSACTION ====================
const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      description,
      expenseDate,
      category,
      paidBy,
      currency,
      totalAmount,
      remarks,
    } = req.body;

    // Validate input
    if (!description || !expenseDate || !category || !paidBy || !totalAmount) {
      return sendError(
        res,
        STATUS_CODES.BAD_REQUEST,
        'Description, expenseDate, category, paidBy, and totalAmount are required'
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(
        res,
        STATUS_CODES.NOT_FOUND,
        'User not found. Please login with a valid account.'
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        description,
        expenseDate: new Date(expenseDate),
        category,
        paidBy,
        currency: currency || 'USD',
        totalAmount: parseFloat(totalAmount),
        remarks: remarks || null,
        status: 'DRAFT',
        userId,
      },
    });

    sendResponse(
      res,
      STATUS_CODES.CREATED,
      {
        transaction: {
          id: transaction.id,
          description: transaction.description,
          expenseDate: transaction.expenseDate,
          category: transaction.category,
          paidBy: transaction.paidBy,
          currency: transaction.currency,
          totalAmount: transaction.totalAmount,
          remarks: transaction.remarks,
          status: transaction.status,
          createdAt: transaction.createdAt,
        },
      },
      'Transaction created successfully'
    );
  } catch (error) {
    console.error('Create transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET USER TRANSACTIONS ====================
const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
console.log('Fetching transactions for userId:', userId);
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        attachments: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, { transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET TRANSACTION BY ID ====================
const getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        attachments: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    // Authorization checks:
    // 1. Owner can view their own transactions
    // 2. Approvers can view transactions in WAITING_APPROVAL status
    // 3. Admin can view any transaction
    let canView = false;

    if (transaction.userId === userId) {
      canView = true; // Owner can always view
    } else if (userRole === 'ADMIN') {
      canView = true; // Admin can view all
    } else if (transaction.status === 'WAITING_APPROVAL') {
      // Check if user is an approver for this transaction
      const isApprover = transaction.approvals.some((a) => a.approverId === userId);
      canView = isApprover;
    }

    if (!canView) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot view this transaction');
    }

    sendResponse(res, STATUS_CODES.SUCCESS, { transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== UPDATE TRANSACTION ====================
const updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;
    const {
      description,
      expenseDate,
      category,
      paidBy,
      currency,
      totalAmount,
      remarks,
    } = req.body;

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    // Only owner or admin can update
    if (transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot update this transaction');
    }

    // Only DRAFT transactions can be updated
    if (transaction.status !== 'DRAFT') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Only DRAFT transactions can be updated');
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        description: description !== undefined ? description : transaction.description,
        expenseDate: expenseDate ? new Date(expenseDate) : transaction.expenseDate,
        category: category !== undefined ? category : transaction.category,
        paidBy: paidBy !== undefined ? paidBy : transaction.paidBy,
        currency: currency !== undefined ? currency : transaction.currency,
        totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : transaction.totalAmount,
        remarks: remarks !== undefined ? remarks : transaction.remarks,
      },
      include: {
        attachments: true,
        approvals: true,
      },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, { transaction: updatedTransaction }, 'Transaction updated successfully');
  } catch (error) {
    console.error('Update transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== SUBMIT TRANSACTION FOR APPROVAL ====================
const submitTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: { include: { approvalRules: { include: { approvers: true } } } } },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    // Only owner can submit
    if (transaction.userId !== userId) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot submit this transaction');
    }

    // Only DRAFT transactions can be submitted
    if (transaction.status !== 'DRAFT') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Only DRAFT transactions can be submitted');
    }

    // Get approval rules for the user
    const approvalRules = transaction.user.approvalRules;

    if (approvalRules.length === 0) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'No approval rules configured for this user');
    }

    // Use first rule matching the transaction amount (you can add logic to select based on amount)
    const approvalRule = approvalRules[0];
    const approvers = approvalRule.approvers;

    if (approvers.length === 0) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'No approvers configured in the approval rule');
    }

    // Create transaction approval records
    // If manager approver required, add manager first
    if (approvalRule.isManagerApprover && transaction.user.managerId) {
      const existingManagerApproval = approvers.find((a) => a.approverId === transaction.user.managerId);

      if (!existingManagerApproval) {
        // Add manager as first approver if not already in the list
        await prisma.transactionApproval.create({
          data: {
            transactionId,
            approverId: transaction.user.managerId,
            status: 'PENDING',
            sequenceOrder: 1, // Manager is first if sequence is required
          },
        });
      }
    }

    // Add all approvers from the rule
    for (let i = 0; i < approvers.length; i++) {
      await prisma.transactionApproval.create({
        data: {
          transactionId,
          approverId: approvers[i].approverId,
          status: 'PENDING',
          sequenceOrder: approvalRule.isApproversSequence ? i + (approvalRule.isManagerApprover ? 2 : 1) : null,
        },
      });
    }

    // Update transaction status to WAITING_APPROVAL
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'WAITING_APPROVAL' },
      include: {
        user: true,
        attachments: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    sendResponse(
      res,
      STATUS_CODES.SUCCESS,
      { transaction: updatedTransaction },
      'Transaction submitted for approval'
    );
  } catch (error) {
    console.error('Submit transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== APPROVE TRANSACTION ====================
const approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const approverId = req.user.userId;
    const { comments } = req.body;

    // Find transaction with all details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: { include: { approvalRules: true } },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    // Check if transaction is waiting approval
    if (transaction.status !== 'WAITING_APPROVAL') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Transaction is not pending approval');
    }

    // Get approver info
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: { role: true, managerId: true },
    });

    if (!approver) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Approver not found');
    }

    // Find approval record
    const approval = await prisma.transactionApproval.findFirst({
      where: {
        transactionId,
        approverId,
      },
    });

    if (!approval) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You are not an approver for this transaction');
    }

    // Get approval rule
    const approvalRule = transaction.user.approvalRules[0];

    // Check sequential approval: if this approver is not first in sequence and previous hasn't approved
    if (approvalRule?.isApproversSequence && approval.sequenceOrder && approval.sequenceOrder > 1) {
      const previousApproval = transaction.approvals.find((a) => a.sequenceOrder === approval.sequenceOrder - 1);

      if (!previousApproval || previousApproval.status !== 'APPROVED') {
        return sendError(
          res,
          STATUS_CODES.BAD_REQUEST,
          'Previous approver in sequence must approve first'
        );
      }
    }

    // Check manager approval requirement
    if (approvalRule?.isManagerApprover && approval.sequenceOrder === 1 && approver.role !== 'MANAGER') {
      // Manager must be first to approve if required
      const managerApproval = transaction.approvals.find(
        (a) => a.approverId === transaction.user.managerId && a.sequenceOrder === 1
      );

      if (managerApproval && managerApproval.status !== 'APPROVED' && approverId !== transaction.user.managerId) {
        return sendError(res, STATUS_CODES.BAD_REQUEST, 'Manager must approve first');
      }
    }

    // Update approval status
    await prisma.transactionApproval.update({
      where: { id: approval.id },
      data: {
        status: 'APPROVED',
        approvalDate: new Date(),
        comments: comments || null,
      },
    });

    // Special case: If CTO approves, auto-approve entire transaction
    if (approver.role === 'CTO') {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'APPROVED',
          approvalDate: new Date(),
          approvedBy: approverId,
        },
      });

      // Mark all other approvals as auto-approved
      await prisma.transactionApproval.updateMany({
        where: {
          transactionId,
          approverId: { not: approverId },
          status: 'PENDING',
        },
        data: {
          status: 'APPROVED',
          approvalDate: new Date(),
          comments: 'Auto-approved by CTO approval',
        },
      });

      const updatedTransaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          attachments: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                },
              },
            },
            orderBy: { sequenceOrder: 'asc' },
          },
        },
      });

      return sendResponse(
        res,
        STATUS_CODES.SUCCESS,
        { transaction: updatedTransaction },
        'Transaction auto-approved by CTO'
      );
    }

    // Check if all required approvals are complete
    const allApprovals = await prisma.transactionApproval.findMany({
      where: { transactionId },
    });

    const approvedCount = allApprovals.filter((a) => a.status === 'APPROVED').length;
    const requiredApprovals = Math.ceil((allApprovals.length * (approvalRule?.minimalApprovalPercentage || 50)) / 100);

    // If required percentage of approvals received, mark transaction as APPROVED
    if (approvedCount >= requiredApprovals) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'APPROVED',
          approvalDate: new Date(),
          approvedBy: approverId,
        },
      });
    }

    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
        attachments: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    sendResponse(
      res,
      STATUS_CODES.SUCCESS,
      { transaction: updatedTransaction },
      'Transaction approved'
    );
  } catch (error) {
    console.error('Approve transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== REJECT TRANSACTION ====================
const rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const approverId = req.user.userId;
    const { comments } = req.body;

    if (!comments) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Rejection remarks are required');
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    if (transaction.status !== 'WAITING_APPROVAL') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Transaction is not pending approval');
    }

    // Find approval record
    const approval = await prisma.transactionApproval.findFirst({
      where: {
        transactionId,
        approverId,
      },
    });

    if (!approval) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You are not an approver for this transaction');
    }

    // Update approval status to REJECTED with remarks
    await prisma.transactionApproval.update({
      where: { id: approval.id },
      data: {
        status: 'REJECTED',
        approvalDate: new Date(),
        comments,
      },
    });

    // Update transaction to REJECTED (any single rejection rejects the entire transaction)
    await prisma.transaction.update({
      where: { id: transactionId },
      data: { status: 'REJECTED' },
    });

    const updatedTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: true,
        attachments: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, { transaction: updatedTransaction }, 'Transaction rejected');
  } catch (error) {
    console.error('Reject transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== DELETE TRANSACTION ====================
const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { attachments: true },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    // Only owner or admin can delete
    if (transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot delete this transaction');
    }

    // Only DRAFT transactions can be deleted
    if (transaction.status !== 'DRAFT') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Only DRAFT transactions can be deleted');
    }

    // Delete attached files
    for (const attachment of transaction.attachments) {
      const filePath = path.join(__dirname, '../../', attachment.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete transaction (attachments deleted via cascade)
    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, null, 'Transaction deleted successfully');
  } catch (error) {
    console.error('Delete transaction error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET PENDING APPROVALS FOR APPROVER ====================
const getPendingApprovalsForApprover = async (req, res) => {
  try {
    const approverId = req.user.userId;

    // Get all pending approvals for this approver
    const pendingApprovals = await prisma.transactionApproval.findMany({
      where: {
        approverId,
        status: 'PENDING',
        transaction: {
          status: 'WAITING_APPROVAL',
        },
      },
      include: {
        transaction: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            attachments: true,
            approvals: {
              include: {
                approver: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                  },
                },
              },
              orderBy: { sequenceOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter transactions based on sequential approval logic
    const transactions = pendingApprovals
      .filter((approval) => {
        if (!approval.transaction) return false; // Transaction not in WAITING_APPROVAL status

        // Check if sequential approval is required
        const hasSequenceOrder = approval.sequenceOrder !== null;

        if (hasSequenceOrder && approval.sequenceOrder > 1) {
          // For sequential approvals, check if previous approver has approved
          const previousApproval = approval.transaction.approvals.find(
            (a) => a.sequenceOrder === approval.sequenceOrder - 1
          );

          return previousApproval && previousApproval.status === 'APPROVED';
        }

        return true; // No sequence requirement or this is the first in sequence
      })
      .map((approval) => ({
        ...approval.transaction,
        pendingApprovalId: approval.id,
        myApprovalStatus: approval.status,
        mySequenceOrder: approval.sequenceOrder,
      }));

    sendResponse(res, STATUS_CODES.SUCCESS, { transactions, count: transactions.length });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET APPROVAL HISTORY ====================
const getApprovalHistory = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    sendResponse(res, STATUS_CODES.SUCCESS, {
      approvalHistory: transaction.approvals,
      transactionStatus: transaction.status,
    });
  } catch (error) {
    console.error('Get approval history error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET ALL TRANSACTIONS (ADMIN ONLY) ====================
const getAllTransactions = async (req, res) => {
  try {
    const { status, userId } = req.query;

    if (req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'Only admins can view all transactions');
    }

    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        attachments: true,
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, { transactions, count: transactions.length });
  } catch (error) {
    console.error('Get all transactions error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

module.exports = {
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
};
