// Home controller
const { STATUS_CODES } = require('../config/constants');
const { sendResponse } = require('../utils/responses');

// Get home endpoint
const getHome = (req, res) => {
  try {
    sendResponse(res, STATUS_CODES.SUCCESS, {
      message: 'Welcome to Reimbursement Management Platform API',
      version: '1.0.0',
      status: 'operational',
    });
  } catch (error) {
    sendResponse(res, STATUS_CODES.SERVER_ERROR, null, error.message);
  }
};

// Health check endpoint
const healthCheck = (req, res) => {
  try {
    sendResponse(res, STATUS_CODES.SUCCESS, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    sendResponse(res, STATUS_CODES.SERVER_ERROR, null, error.message);
  }
};


module.exports = {
  getHome,
  healthCheck,
};
