# Server Project Structure

This Express.js server follows a professional, scalable MVC-inspired architecture.

## Folder Structure

```
server/
├── config/           # Configuration files
│   ├── constants.js  # Application constants
│   └── database.js   # Database configuration
│
├── middleware/       # Express middleware
│   ├── errorHandler.js    # Error handling & async wrapper
│   ├── requestLogger.js   # Request logging
│   └── validation.js      # Input validation
│
├── controllers/      # Business logic handlers
│   └── homeController.js  # Home routes controller
│
├── routes/           # API route definitions
│   └── index.js      # Main routes file
│
├── utils/            # Utility functions
│   └── responses.js   # Response formatting helpers
│
└── server.js         # Main application file
```

## Architecture Overview

### 1. **Config** (`config/`)
Central configuration management for constants, database connections, and environment variables.

### 2. **Middleware** (`middleware/`)
Reusable middleware functions for:
- Request logging
- Error handling
- Input validation
- Authentication (to be added)

### 3. **Controllers** (`controllers/`)
Business logic organized by feature. Each controller handles operations for a specific resource.

### 4. **Routes** (`routes/`)
HTTP endpoint definitions. Routes map HTTP methods to controller functions.

### 5. **Utils** (`utils/`)
Helper functions for:
- Response formatting
- Data transformation
- Common operations

## How It Works

1. **Request** comes into server
2. **Middleware** (logger, validator, CORS) processes it
3. **Router** matches the route
4. **Controller** executes business logic
5. **Response** is formatted and sent back

## Adding New Features

### Example: Add a Reimbursement Module

1. **Create controller** (`controllers/reimbursementController.js`)
   ```javascript
   const getReimbursements = (req, res) => { /* logic */ };
   const createReimbursement = (req, res) => { /* logic */ };
   module.exports = { getReimbursements, createReimbursement };
   ```

2. **Create routes** (`routes/reimbursementRoutes.js`)
   ```javascript
   const express = require('express');
   const controller = require('../controllers/reimbursementController');
   const router = express.Router();
   
   router.get('/', controller.getReimbursements);
   router.post('/', controller.createReimbursement);
   module.exports = router;
   ```

3. **Add to main routes** (`routes/index.js`)
   ```javascript
   const reimbursementRoutes = require('./reimbursementRoutes');
   router.use('/api/reimbursements', reimbursementRoutes);
   ```

## API Response Format

All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2026-03-29T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "timestamp": "2026-03-29T10:30:00.000Z"
}
```

## Middleware Execution Order

1. CORS
2. JSON Parser
3. URL Encoder
4. Request Logger
5. Routes
6. 404 Handler
7. Error Handler (catches all errors)

## Environment Variables

See `.env.example` for required environment variables.
