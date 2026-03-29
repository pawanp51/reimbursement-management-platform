// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};

module.exports = requestLogger;
