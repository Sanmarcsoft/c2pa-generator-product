const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authService = require('../services/authService');
const logger = require('../utils/logger');
const requireAuth = require('../middleware/requireAuth');

/**
 * Helper function to remove password_hash from user object
 * @param {Object} user - User object
 * @returns {Object} User object without password_hash
 */
function sanitizeUser(user) {
  if (!user) return null;

  const { password_hash, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * POST /api/auth/register
 * Register a new user
 *
 * @body {string} email - User email (required)
 * @body {string} password - User password (required, min 8 chars)
 * @body {string} name - User name (optional)
 * @returns {Object} { success: true, user, token }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Validate email format (done by User.create, but we check here for better error messages)
    if (!User.isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (!User.isValidPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters'
      });
    }

    // Create user (this will hash the password)
    const user = await User.create({
      email,
      password,
      name: name || null,
      role: 'user' // Default role
    });

    // Generate JWT token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Log successful registration
    logger.info(`User registered: ${email}`);

    // Return sanitized user and token
    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      token
    });

  } catch (error) {
    logger.error('Registration error:', error);

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return res.status(400).json({
        error: 'Email already exists'
      });
    }

    if (error.message.includes('email') || error.message.includes('password')) {
      return res.status(400).json({
        error: error.message
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Registration failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Login a user
 *
 * @body {string} email - User email (required)
 * @body {string} password - User password (required)
 * @returns {Object} { success: true, user, token }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findByEmail(email);

    // Generic error message for security (don't reveal if email exists)
    const invalidCredentialsError = 'Invalid credentials';

    if (!user) {
      return res.status(401).json({
        error: invalidCredentialsError
      });
    }

    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: invalidCredentialsError
      });
    }

    // Update last login timestamp
    await User.updateLastLogin(user.id);

    // Generate JWT token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    // Log successful login
    logger.info(`User logged in: ${email}`);

    // Return sanitized user and token
    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
      token
    });

  } catch (error) {
    logger.error('Login error:', error);

    res.status(500).json({
      error: 'Login failed. Please try again.'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 *
 * @header {string} Authorization - Bearer token (required)
 * @returns {Object} User object (without password_hash)
 */
router.get('/me', requireAuth, (req, res) => {
  // requireAuth middleware already:
  // - Verified the token
  // - Found the user in database
  // - Attached sanitized user to req.user
  // So we just return it!
  res.status(200).json(req.user);
});

/**
 * PUT /api/auth/change-password
 * Change password for the currently logged-in user
 *
 * @header {string} Authorization - Bearer token (required)
 * @body {string} oldPassword - Current password (required)
 * @body {string} newPassword - New password (required, min 8 chars)
 * @returns {Object} { success: true, message }
 */
router.put('/change-password', requireAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Both old password and new password are required'
      });
    }

    // Validate new password strength
    if (!User.isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }

    // Prevent same password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from old password'
      });
    }

    // Get user with password_hash to verify old password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify old password
    const isOldPasswordValid = await User.verifyPassword(oldPassword, user.password_hash);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password (User.update will hash the new password)
    await User.update(userId, { password: newPassword });

    // Log successful password change
    logger.info(`Password changed for user: ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Password change error:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to change password. Please try again.'
    });
  }
});

module.exports = router;
