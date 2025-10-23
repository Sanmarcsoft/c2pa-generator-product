const logger = require('../utils/logger');

/**
 * requireAdmin Middleware
 *
 * Verifies that the authenticated user has admin role.
 * This middleware MUST be used AFTER requireAuth middleware.
 * It checks req.user.role and only allows users with role === 'admin'.
 *
 * Usage:
 *   router.post('/admin/config', requireAuth, requireAdmin, (req, res) => {
 *     // Only admins can access this route
 *   });
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function requireAdmin(req, res, next) {
  try {
    // Check if user is attached to request (requireAuth should have done this)
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      logger.warn(`Non-admin user attempted to access admin route: ${req.user.email}`);
      return res.status(403).json({
        error: 'Admin access required'
      });
    }

    // User is admin, proceed to next middleware
    next();

  } catch (error) {
    // Log unexpected errors
    logger.error('Admin authorization middleware error:', error);

    // Return generic error message
    res.status(500).json({
      error: 'Authorization failed'
    });
  }
}

module.exports = requireAdmin;
