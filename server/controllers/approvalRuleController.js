// Approval Rule controller
const prisma = require('../config/prisma');
const { sendResponse, sendError } = require('../utils/responses');
const { STATUS_CODES } = require('../config/constants');

// ==================== CREATE APPROVAL RULE ====================
const createApprovalRule = async (req, res) => {
  try {
    const {
      userId,
      description,
      isManagerApprover,
      approversList,
      isApproversSequence,
      minimalApprovalPercentage,
    } = req.body;

    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Validate input
    if (!description || !userId) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Description and userId are required');
    }

    // Authorization: Only ADMIN or the user themselves can create approval rules
    if (requesterRole !== 'ADMIN' && requesterId !== userId) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'Only ADMIN can create approval rules for other users');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'User not found');
    }

    // Validate approvers list
    if (!approversList || !Array.isArray(approversList) || approversList.length === 0) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Approvers list is required and must be non-empty');
    }

    // Verify all approvers exist
    const approvers = await prisma.user.findMany({
      where: {
        id: {
          in: approversList,
        },
      },
    });

    if (approvers.length !== approversList.length) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'One or more approvers not found');
    }

    // Validate minimal approval percentage
    const percentage = minimalApprovalPercentage || 50;
    if (percentage < 0 || percentage > 100) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Minimal approval percentage must be between 0 and 100');
    }

    // Check if an approval rule already exists for this user (optional: allow multiple or just one)
    // For now, we'll allow multiple rules per user

    // Create approval rule
    const approvalRule = await prisma.approvalRule.create({
      data: {
        description,
        isManagerApprover: isManagerApprover || false,
        isApproversSequence: isApproversSequence || false,
        minimalApprovalPercentage: percentage,
        userId,
        approvers: {
          create: approversList.map((approverId, index) => ({
            approverId,
            sequenceOrder: isApproversSequence ? index + 1 : null,
          })),
        },
      },
      include: {
        approvers: {
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

    sendResponse(res, STATUS_CODES.CREATED, {
      approvalRule: {
        id: approvalRule.id,
        description: approvalRule.description,
        isManagerApprover: approvalRule.isManagerApprover,
        isApproversSequence: approvalRule.isApproversSequence,
        minimalApprovalPercentage: approvalRule.minimalApprovalPercentage,
        approvers: approvalRule.approvers.map((a) => ({
          id: a.approver.id,
          email: a.approver.email,
          firstName: a.approver.firstName,
          lastName: a.approver.lastName,
          role: a.approver.role,
          sequenceOrder: a.sequenceOrder,
        })),
      },
    }, 'Approval rule created successfully');
  } catch (error) {
    console.error('Create approval rule error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET USER APPROVAL RULES ====================
const getUserApprovalRules = async (req, res) => {
  try {
    const { userId } = req.params;
    const requesterRole = req.user.role;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'User not found');
    }

    // Get approval rules
    const approvalRules = await prisma.approvalRule.findMany({
      where: { userId },
      include: {
        approvers: {
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

    sendResponse(res, STATUS_CODES.SUCCESS, {
      approvalRules: approvalRules.map((rule) => ({
        id: rule.id,
        description: rule.description,
        isManagerApprover: rule.isManagerApprover,
        isApproversSequence: rule.isApproversSequence,
        minimalApprovalPercentage: rule.minimalApprovalPercentage,
        approvers: rule.approvers.map((a) => ({
          id: a.approver.id,
          email: a.approver.email,
          firstName: a.approver.firstName,
          lastName: a.approver.lastName,
          role: a.approver.role,
          sequenceOrder: a.sequenceOrder,
        })),
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get approval rules error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== UPDATE APPROVAL RULE ====================
const updateApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const {
      description,
      isManagerApprover,
      approversList,
      isApproversSequence,
      minimalApprovalPercentage,
    } = req.body;

    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Find approval rule
    const approvalRule = await prisma.approvalRule.findUnique({
      where: { id: ruleId },
    });

    if (!approvalRule) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Approval rule not found');
    }

    // Authorization: Only ADMIN or the rule owner can update
    if (requesterRole !== 'ADMIN' && requesterId !== approvalRule.userId) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'Only ADMIN can update approval rules for other users');
    }

    // Validate approvers if provided
    if (approversList && Array.isArray(approversList) && approversList.length > 0) {
      const approvers = await prisma.user.findMany({
        where: {
          id: {
            in: approversList,
          },
        },
      });

      if (approvers.length !== approversList.length) {
        return sendError(res, STATUS_CODES.NOT_FOUND, 'One or more approvers not found');
      }
    }

    // Validate minimal approval percentage
    const percentage = minimalApprovalPercentage !== undefined ? minimalApprovalPercentage : approvalRule.minimalApprovalPercentage;
    if (percentage < 0 || percentage > 100) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Minimal approval percentage must be between 0 and 100');
    }

    // Delete old approvers if updating approvers list
    if (approversList && Array.isArray(approversList)) {
      await prisma.approvalRuleApprover.deleteMany({
        where: { approvalRuleId: ruleId },
      });
    }

    // Update approval rule
    const updatedRule = await prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        description: description !== undefined ? description : approvalRule.description,
        isManagerApprover: isManagerApprover !== undefined ? isManagerApprover : approvalRule.isManagerApprover,
        isApproversSequence: isApproversSequence !== undefined ? isApproversSequence : approvalRule.isApproversSequence,
        minimalApprovalPercentage: percentage,
        ...(approversList && {
          approvers: {
            create: approversList.map((approverId, index) => ({
              approverId,
              sequenceOrder: (isApproversSequence !== undefined ? isApproversSequence : approvalRule.isApproversSequence) ? index + 1 : null,
            })),
          },
        }),
      },
      include: {
        approvers: {
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

    sendResponse(res, STATUS_CODES.SUCCESS, {
      approvalRule: {
        id: updatedRule.id,
        description: updatedRule.description,
        isManagerApprover: updatedRule.isManagerApprover,
        isApproversSequence: updatedRule.isApproversSequence,
        minimalApprovalPercentage: updatedRule.minimalApprovalPercentage,
        approvers: updatedRule.approvers.map((a) => ({
          id: a.approver.id,
          email: a.approver.email,
          firstName: a.approver.firstName,
          lastName: a.approver.lastName,
          role: a.approver.role,
          sequenceOrder: a.sequenceOrder,
        })),
      },
    }, 'Approval rule updated successfully');
  } catch (error) {
    console.error('Update approval rule error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== DELETE APPROVAL RULE ====================
const deleteApprovalRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const requesterId = req.user.userId;
    const requesterRole = req.user.role;

    // Find approval rule
    const approvalRule = await prisma.approvalRule.findUnique({
      where: { id: ruleId },
    });

    if (!approvalRule) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Approval rule not found');
    }

    // Authorization: Only ADMIN or the rule owner can delete
    if (requesterRole !== 'ADMIN' && requesterId !== approvalRule.userId) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'Only ADMIN can delete approval rules for other users');
    }

    // Delete approval rule
    await prisma.approvalRule.delete({
      where: { id: ruleId },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, null, 'Approval rule deleted successfully');
  } catch (error) {
    console.error('Delete approval rule error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

module.exports = {
  createApprovalRule,
  getUserApprovalRules,
  updateApprovalRule,
  deleteApprovalRule,
};
