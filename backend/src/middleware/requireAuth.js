const authService = require('../services/authService');
const User = require('../models/user');
const logger = require('../utils/logger');

/**
 * Helper function to extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
function extractToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

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
 * requireAuth Middleware
 *
 * Verifies that the request contains a valid JWT token in the Authorization header.
 * If valid, attaches the user object to req.user and calls next().
 * If invalid, returns 401 Unauthorized.
 *
 * Usage:
 *   router.get('/protected', requireAuth, (req, res) => {
 *     // req.user is available here
 *   });
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function requireAuth(req, res, next) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present
    if (!authHeader) {
      logger.warn('No authorization header provided');
      return res.status(401).json({
        error: 'No authentication token provided'
      });
    }

    // Extract token from header
    const token = extractToken(authHeader);

    // Check if token was successfully extracted
    if (!token) {
      logger.warn('Invalid authorization format');
      return res.status(401).json({
        error: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = authService.verifyToken(token);
    } catch (error) {
      // Handle token verification errors
      logger.warn(`Token verification failed: ${error.message}`);
      if (error.message === 'Token expired') {
        return res.status(401).json({
          error: 'Token expired'
        });
      } else if (error.message === 'Invalid token') {
        return res.status(401).json({
          error: 'Invalid token'
        });
      } else {
        return res.status(401).json({
          error: 'Invalid or expired token'
        });
      }
    }

    // Find user by ID from token payload
    const user = await User.findById(decoded.id);

    // Check if user still exists in database
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Attach sanitized user object to request
    req.user = sanitizeUser(user);

    // Call next middleware
    next();

  } catch (error) {
    // Log unexpected errors
    logger.error('Authentication middleware error:', error);

    // Return generic error message
    res.status(500).json({
      error: 'Authentication failed'
    });
  }
}

module.exports = requireAuth;
