const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;
const DEFAULT_EXPIRATION = '7d'; // 7 days

/**
 * Load JWT secret from secrets.json or environment
 * @returns {string} JWT secret
 */
function getJWTSecret() {
  // Try environment variable first
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  // Try secrets.json
  try {
    const secretsPath = path.join(__dirname, '..', '..', 'config', 'secrets.json');
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
    if (secrets.JWT_SECRET) {
      return secrets.JWT_SECRET;
    }
  } catch (error) {
    // Secrets file not found or invalid
  }

  // Development fallback (with warning)
  console.warn('WARNING: Using default JWT_SECRET. Please set JWT_SECRET in secrets.json or environment!');
  return 'development-jwt-secret-please-change-in-production';
}

const JWT_SECRET = getJWTSecret();

/**
 * Authentication Service
 * Handles password hashing, JWT generation, and token verification
 */
class AuthService {
  /**
   * Hash a password using bcrypt
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Verify a password against a hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate a JWT token for a user
   * @param {Object} user - User object
   * @param {string} user.id - User ID
   * @param {string} user.email - User email
   * @param {string} user.role - User role
   * @param {Object} [options] - Token options
   * @param {string} [options.expiresIn] - Token expiration (default: 7d)
   * @returns {string} JWT token
   */
  static generateToken(user, options = {}) {
    // Only include essential user data in token payload
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    // Set expiration time
    const tokenOptions = {
      expiresIn: options.expiresIn || DEFAULT_EXPIRATION
    };

    // Generate and return token
    return jwt.sign(payload, JWT_SECRET, tokenOptions);
  }

  /**
   * Verify and decode a JWT token
   * @param {string} token - JWT token to verify
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  static verifyToken(token) {
    try {
      // Verify and decode token
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Token not active yet');
      }

      // Unknown error
      throw new Error('Token verification failed');
    }
  }

  /**
   * Get the JWT secret (for testing purposes only)
   * @private
   * @returns {string} JWT secret
   */
  static _getSecret() {
    return JWT_SECRET;
  }
}

module.exports = AuthService;
