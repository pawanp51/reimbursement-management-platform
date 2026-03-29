// Attachment controller - handles file uploads and OCR
const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');
const { sendResponse, sendError } = require('../utils/responses');
const { STATUS_CODES } = require('../config/constants');

// Directory to store uploaded files
const UPLOAD_DIR = path.join(__dirname, '../../uploads/transactions');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ==================== UPLOAD ATTACHMENT ====================
const uploadAttachment = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    if (!req.file) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'No file provided');
    }

    // Find transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Transaction not found');
    }

    // Only owner or admin can upload
    if (transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot upload to this transaction');
    }

    // Only DRAFT transactions can have attachments added
    if (transaction.status !== 'DRAFT') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Only DRAFT transactions can have attachments added');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${transactionId}-${timestamp}-${req.file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file
    fs.writeFileSync(filePath, req.file.buffer);

    // Perform OCR (simplified - extract text or relevant data)
    let ocrData = null;
    if (req.file.mimetype.startsWith('image/') || req.file.mimetype === 'application/pdf') {
      // In production, you would integrate with actual OCR service like:
      // - Tesseract.js for client-side
      // - Google Cloud Vision API
      // - AWS Textract
      // - Azure Computer Vision API
      ocrData = {
        extractedAt: new Date(),
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        note: 'OCR data would be populated by OCR service',
        placeholders: {
          amount: null,
          date: null,
          vendor: null,
          description: null,
        },
      };
    }

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        fileName: req.file.originalname,
        filePath: `uploads/transactions/${fileName}`,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        ocrData: ocrData,
        transactionId,
      },
    });

    sendResponse(
      res,
      STATUS_CODES.CREATED,
      {
        attachment: {
          id: attachment.id,
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          fileType: attachment.fileType,
          ocrData: attachment.ocrData,
          createdAt: attachment.createdAt,
        },
      },
      'Attachment uploaded successfully'
    );
  } catch (error) {
    console.error('Upload attachment error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET ATTACHMENT ====================
const getAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.userId;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { transaction: true },
    });

    if (!attachment) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Attachment not found');
    }

    // Check authorization
    if (attachment.transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot access this attachment');
    }

    sendResponse(res, STATUS_CODES.SUCCESS, {
      attachment: {
        id: attachment.id,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        fileType: attachment.fileType,
        ocrData: attachment.ocrData,
        createdAt: attachment.createdAt,
      },
    });
  } catch (error) {
    console.error('Get attachment error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== DOWNLOAD ATTACHMENT ====================
const downloadAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.userId;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { transaction: true },
    });

    if (!attachment) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Attachment not found');
    }

    // Check authorization
    if (attachment.transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot download this attachment');
    }

    const filePath = path.join(__dirname, '../../', attachment.filePath);

    if (!fs.existsSync(filePath)) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'File not found');
    }

    res.download(filePath, attachment.fileName);
  } catch (error) {
    console.error('Download attachment error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== DELETE ATTACHMENT ====================
const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.userId;

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { transaction: true },
    });

    if (!attachment) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Attachment not found');
    }

    // Check authorization
    if (attachment.transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot delete this attachment');
    }

    // Only DRAFT transactions can have attachments deleted
    if (attachment.transaction.status !== 'DRAFT') {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Only attachments for DRAFT transactions can be deleted');
    }

    // Delete file from storage
    const filePath = path.join(__dirname, '../../', attachment.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, null, 'Attachment deleted successfully');
  } catch (error) {
    console.error('Delete attachment error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== UPDATE OCR DATA ====================
const updateOCRData = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.userId;
    const { ocrData } = req.body;

    if (!ocrData) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'OCR data is required');
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { transaction: true },
    });

    if (!attachment) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'Attachment not found');
    }

    // Only owner or admin can update OCR
    if (attachment.transaction.userId !== userId && req.user.role !== 'ADMIN') {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'You cannot update this attachment');
    }

    // Update attachment with OCR data
    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: { ocrData },
    });

    // If OCR data contains transaction details, update the transaction
    if (
      ocrData.extractedData &&
      (ocrData.extractedData.amount ||
        ocrData.extractedData.date ||
        ocrData.extractedData.vendor ||
        ocrData.extractedData.description)
    ) {
      const updateData = {};

      if (ocrData.extractedData.amount) {
        updateData.totalAmount = parseFloat(ocrData.extractedData.amount);
      }
      if (ocrData.extractedData.date) {
        updateData.expenseDate = new Date(ocrData.extractedData.date);
      }
      if (ocrData.extractedData.vendor) {
        updateData.paidBy = ocrData.extractedData.vendor;
      }
      if (ocrData.extractedData.description) {
        updateData.description = ocrData.extractedData.description;
      }

      await prisma.transaction.update({
        where: { id: attachment.transactionId },
        data: updateData,
      });
    }

    sendResponse(
      res,
      STATUS_CODES.SUCCESS,
      {
        attachment: {
          id: updatedAttachment.id,
          fileName: updatedAttachment.fileName,
          ocrData: updatedAttachment.ocrData,
        },
      },
      'OCR data updated successfully'
    );
  } catch (error) {
    console.error('Update OCR data error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

module.exports = {
  uploadAttachment,
  getAttachment,
  downloadAttachment,
  deleteAttachment,
  updateOCRData,
};
