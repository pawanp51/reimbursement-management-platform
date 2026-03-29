const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import middleware
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes/index');

// Import database
const { connectDB } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE SETUP ====================

// Built-in middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom middleware
app.use(requestLogger);

// ==================== ROUTES ====================

app.use('/', routes);

// Handle 404 NOT FOUND
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method,
  });
});

// ==================== ERROR HANDLING ====================

app.use(errorHandler);

// ==================== SERVER START ====================

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════╗
║  Reimbursement Management Platform API            ║
║  Server running on ${`http://localhost:${PORT}`.padEnd(36)}║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(44)}║
║  Database: PostgreSQL (Neon)                       ║
╚════════════════════════════════════════════════════╝
      `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
