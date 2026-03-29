// Authentication middleware
const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responses');
const { STATUS_CODES } = require('../config/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, STATUS_CODES.UNAUTHORIZED, 'No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, STATUS_CODES.UNAUTHORIZED, 'Token expired');
    }
    return sendError(res, STATUS_CODES.UNAUTHORIZED, 'Invalid token');
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch (error) {
    // Silently fail, continue without user context
  }
  next();
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, STATUS_CODES.UNAUTHORIZED, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, STATUS_CODES.FORBIDDEN, 'Insufficient permissions');
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  authorize,
};
