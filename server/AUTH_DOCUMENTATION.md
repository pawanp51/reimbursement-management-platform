# Authentication System Documentation

## Overview

The authentication system includes:
- User signup with admin role assignment
- Secure login with JWT tokens
- Password reset with OTP verification
- Email notifications via SMTP
- Role-based access control

## API Endpoints

### 1. **Signup** 
- **POST** `/api/auth/signup`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIs...",
      "user": {
        "id": "cuid123",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "ADMIN"
      }
    },
    "message": "Signup successful"
  }
  ```

### 2. **Login**
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123"
  }
  ```
- **Response:** Same as signup
- **Works for all roles:** EMPLOYEE, MANAGER, CTO, DIRECTOR, ADMIN

### 3. **Forgot Password (Request OTP)**
- **POST** `/api/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "message": "OTP sent to your email"
  }
  ```

### 4. **Verify OTP**
- **POST** `/api/auth/verify-otp`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "resetToken": "eyJhbGciOiJIUzI1NiIs..."
    },
    "message": "OTP verified successfully"
  }
  ```

### 5. **Reset Password**
- **POST** `/api/auth/reset-password`
- **Body:**
  ```json
  {
    "resetToken": "eyJhbGciOiJIUzI1NiIs...",
    "newPassword": "NewSecurePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "user": { /* user data */ }
    },
    "message": "Password reset successful"
  }
  ```

### 6. **Get Current User** (Protected)
- **GET** `/api/auth/me`
- **Headers:**
  ```
  Authorization: Bearer <token>
  ```
- **Response:**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": "cuid123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ADMIN"
    }
  }
  ```

## Setup Instructions

### 1. **Environment Configuration**

Copy `.env.example` to `.env` and update:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# JWT Configuration
JWT_SECRET=your_very_secure_secret_key
JWT_EXPIRY=7d

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=noreply@yourapp.com
```

### 2. **SMTP Setup (Gmail Example)**

1. Enable 2-factor authentication on Gmail
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASSWORD`

### 3. **Initialize Database**

```bash
# Push schema to database
npm run db:push

# View data in Prisma Studio
npm run db:studio
```

## Security Features

✅ **Password Hashing** - Bcrypt with salt rounds  
✅ **JWT Tokens** - Secure token-based authentication  
✅ **OTP Expiration** - 10-minute expiry on OTP codes  
✅ **Reset Token** - 15-minute expiry on password reset tokens  
✅ **Role-Based Access** - Middleware for authorization  
✅ **SMTP with TLS** - Encrypted email transmission  
✅ **Unique Email Constraint** - Prevents duplicate accounts  

## Database Schema

### User Model
```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String     // Hashed with bcrypt
  firstName String?
  lastName  String?
  role      Role       @default(EMPLOYEE)
  
  reimbursements Reimbursement[]
  otps OTP[]
  
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}
```

### OTP Model
```prisma
model OTP {
  id        String     @id @default(cuid())
  code      String     // 6-digit OTP
  email     String
  expiresAt DateTime   // 10 minutes from creation
  used      Boolean    @default(false)
  
  userId    String
  user      User       @relation(...)
  
  createdAt DateTime   @default(now())
}
```

## Password Reset Flow

```
1. User requests password reset → /api/auth/forgot-password
2. System generates 6-digit OTP
3. OTP sent to email via SMTP
4. User receives OTP in email
5. User submits OTP → /api/auth/verify-otp
6. System returns reset token (valid for 15 min)
7. User submits new password + token → /api/auth/reset-password
8. Password updated successfully
```

## NPM Scripts

```bash
npm start              # Start production server
npm run dev            # Start with nodemon (auto-reload)
npm run db:migrate     # Create new migrations
npm run db:push        # Test schema changes (no migration)
npm run db:studio      # Open Prisma Studio UI
npm run db:reset       # Reset database (dev only)
```

## Troubleshooting

### "Email in use" Error
- User already registered with that email
- Use login instead or reset password

### "Invalid OTP" Error
- OTP expired (10 min validity)
- Wrong OTP code
- OTP already used

### "Token expired" Error
- JWT token expired (default 7 days)
- Reset token expired (15 minutes)
- Use refresh or re-authenticate

### Email Not Received
- Check SMTP credentials in .env
- Verify email account allows app passwords
- Check spam folder
- Test SMTP connection

## Next Steps

1. Configure SMTP credentials in `.env`
2. Test signup at `/api/auth/signup`
3. Test login at `/api/auth/login`
4. Test password reset flow
5. Integrate JWT token with protected routes
