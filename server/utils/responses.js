// Response utility functions
const sendResponse = (res, statusCode, data = null, message = 'Success') => {
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res, statusCode, message = 'An error occurred') => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  });
};

const sendPaginatedResponse = (res, statusCode, data, pagination) => {
  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    statusCode,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  sendResponse,
  sendError,
  sendPaginatedResponse,
};
