// Auth controller
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { sendResponse, sendError } = require('../utils/responses');
const { STATUS_CODES } = require('../config/constants');
const { sendOTPEmail, sendPasswordEmail } = require('../utils/mailer');
const { generateOTP } = require('../utils/otpGenerator');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// ==================== SIGNUP ====================
const signup = async (req, res) => {
  try {
    let { email, password, firstName, lastName, country } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validate input
    if (!email || !password) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email and password are required');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email already registered');
    }

    // Validate password strength
    if (password.length < 6) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user with ADMIN role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        country: country || '',
        role: 'ADMIN', // All signups are ADMIN
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    sendResponse(res, STATUS_CODES.CREATED, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        country: user.country,
        role: user.role,
      },
    }, 'Signup successful');

  } catch (error) {
    console.error('Signup error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== LOGIN ====================
const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validate input
    if (!email || !password) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email and password are required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, STATUS_CODES.UNAUTHORIZED, 'Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, STATUS_CODES.UNAUTHORIZED, 'Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    sendResponse(res, STATUS_CODES.SUCCESS, {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== FORGOT PASSWORD - SEND OTP ====================
const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validate input
    if (!email) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email is required');
    }
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if email exists
      return sendResponse(res, STATUS_CODES.SUCCESS, null, 'If email exists, OTP will be sent');
    }
    
    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Generating OTP:", otp);
    // Save OTP to database
    const otpRecord = await prisma.oTP.create({
      data: {
        code: otp,
        email,
        expiresAt,
        userId: user.id,
      },
    });

    console.log("OTP saved to database:", otpRecord.id);
    // Send OTP via email
    await sendOTPEmail(email, otp);

    console.log("OTP email sent successfully");
    sendResponse(res, STATUS_CODES.SUCCESS, { success: true, message: 'OTP sent to your email' }, 'OTP sent to your email');

  } catch (error) {
    console.error('Forgot password error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== VERIFY OTP ====================
const verifyOTP = async (req, res) => {
  try {
    let { email, otp } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validate input
    if (!email || !otp) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email and OTP are required');
    }

    // Find valid OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        used: false,
        expiresAt: {
          gt: new Date(), // OTP not expired
        },
      },
    });

    if (!otpRecord) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Invalid or expired OTP');
    }

    // Mark OTP as used
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Generate reset token (short-lived)
    const resetToken = jwt.sign(
      { userId: otpRecord.userId, email, type: 'password-reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    sendResponse(res, STATUS_CODES.SUCCESS, { resetToken }, 'OTP verified successfully');

  } catch (error) {
    console.error('Verify OTP error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== RESET PASSWORD ====================
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate input
    if (!resetToken || !newPassword) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Reset token and new password are required');
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
      if (decoded.type !== 'password-reset') {
        return sendError(res, STATUS_CODES.BAD_REQUEST, 'Invalid reset token');
      }
    } catch (error) {
      return sendError(res, STATUS_CODES.UNAUTHORIZED, 'Token expired or invalid');
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update user password
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    sendResponse(res, STATUS_CODES.SUCCESS, {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }, 'Password reset successful');

  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET CURRENT USER ====================
const getCurrentUser = async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'User not found');
    }

    sendResponse(res, STATUS_CODES.SUCCESS, {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

  } catch (error) {
    console.error('Get current user error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== ADD USER (ADMIN ONLY) ====================
const addUser = async (req, res) => {
  try {
    let { email, name, role, managerId, password, country } = req.body;

    // Normalize email
    email = email?.trim().toLowerCase();

    // Validate input
    if (!email || !name || !role) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email, name, and role are required');
    }

    // Validate role
    const validRoles = ['EMPLOYEE', 'MANAGER', 'CTO', 'DIRECTOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Invalid role. Valid roles: EMPLOYEE, MANAGER, CTO, DIRECTOR, ADMIN');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Email already registered');
    }

    // If managerId is provided, validate that manager exists
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return sendError(res, STATUS_CODES.NOT_FOUND, 'Manager not found');
      }
    }

    // Generate password if not provided
    const finalPassword = password || Math.random().toString(36).slice(-10);

    // Validate password strength
    if (finalPassword.length < 6) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'Password must be at least 6 characters');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(finalPassword, 10);

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        country: country || null,
        managerId: managerId || null,
      },
    });

    // Send password email
    await sendPasswordEmail(email, firstName, finalPassword);

    sendResponse(res, STATUS_CODES.CREATED, {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        managerId: newUser.managerId,
      },
    }, 'User created successfully and password sent to email');

  } catch (error) {
    console.error('Add user error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== SEND PASSWORD EMAIL ====================
const sendPasswordToEmail = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, STATUS_CODES.BAD_REQUEST, 'User ID is required');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, STATUS_CODES.NOT_FOUND, 'User not found');
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-10);

    // Hash and update password
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send password email
    await sendPasswordEmail(user.email, user.firstName, tempPassword);

    sendResponse(res, STATUS_CODES.SUCCESS, {
      message: 'Password sent to ' + user.email,
    }, 'Password sent successfully');

  } catch (error) {
    console.error('Send password error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

// ==================== GET ALL USERS ====================
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });
    
    sendResponse(res, STATUS_CODES.SUCCESS, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('Get all users error:', error);
    sendError(res, STATUS_CODES.SERVER_ERROR, error.message);
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getCurrentUser,
  addUser,
  sendPasswordToEmail,
  getAllUsers,
};
