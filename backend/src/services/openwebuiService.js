const axios = require('axios');
const logger = require('../utils/logger');
const { getSecret } = require('../utils/secrets');
const crypto = require('crypto');

/**
 * OpenWebUI User Management Service
 * Handles automatic user creation and session management for OpenWebUI
 */

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @returns {string} Secure password
 */
function generateSecurePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const all = uppercase + lowercase + numbers + special;

  let password = '';

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Create a new user in OpenWebUI
 * @param {string} email - User email
 * @param {string} name - User full name
 * @param {string} password - User password
 * @returns {Promise<Object>} Creation result
 */
async function createOpenWebUIUser(email, name, password) {
  // Validate inputs
  if (!email || email.trim() === '') {
    throw new Error('Email is required');
  }
  if (!name || name.trim() === '') {
    throw new Error('Name is required');
  }
  if (!password || password.trim() === '') {
    throw new Error('Password is required');
  }

  try {
    const openwebuiUrl = getSecret('OPENWEBUI_URL') || process.env.OPENWEBUI_URL;

    if (!openwebuiUrl) {
      throw new Error('OPENWEBUI_URL not configured');
    }

    const response = await axios.post(
      `${openwebuiUrl}/v1/auths/signup`,
      {
        email: email.trim(),
        name: name.trim(),
        password: password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    logger.info(`Created OpenWebUI user: ${email}`);

    return {
      success: true,
      userId: response.data.id,
      email: response.data.email
    };
  } catch (error) {
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail || '';

      if (status === 400 && detail.toLowerCase().includes('email')) {
        logger.warn(`OpenWebUI user already exists: ${email}`);
        return {
          success: false,
          error: 'User already exists',
          alreadyExists: true
        };
      }
    }

    logger.error(`Failed to create OpenWebUI user ${email}:`, error.message);
    return {
      success: false,
      error: 'Failed to create OpenWebUI user'
    };
  }
}

/**
 * Check if a user exists in OpenWebUI
 * @param {string} email - User email to check
 * @returns {Promise<boolean>} True if user exists
 */
async function checkOpenWebUIUserExists(email) {
  try {
    const openwebuiUrl = getSecret('OPENWEBUI_URL') || process.env.OPENWEBUI_URL;
    const apiKey = getSecret('OPENWEBUI_API_KEY') || process.env.OPENWEBUI_API_KEY;

    if (!openwebuiUrl || !apiKey) {
      logger.warn('OpenWebUI not fully configured');
      return false;
    }

    // Try to get user by email from OpenWebUI API
    // Using a hash of email as user ID lookup (common pattern)
    const emailHash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');

    const response = await axios.get(
      `${openwebuiUrl}/v1/users/${emailHash}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    );

    // If we get a response, user exists
    return response.data && response.data.email === email;
  } catch (error) {
    if (error.response?.status === 404) {
      // User not found
      return false;
    }

    // For any other error, assume user doesn't exist
    logger.error(`Error checking OpenWebUI user existence for ${email}:`, error.message);
    return false;
  }
}

/**
 * Ensure user exists in OpenWebUI (create if doesn't exist)
 * @param {string} email - User email
 * @param {string} name - User full name
 * @param {string} password - User password
 * @returns {Promise<Object>} Result with success status
 */
async function ensureOpenWebUIUser(email, name, password) {
  try {
    // First check if user already exists
    const exists = await checkOpenWebUIUserExists(email);

    if (exists) {
      return {
        success: true,
        alreadyExists: true,
        message: 'User already exists in OpenWebUI'
      };
    }

    // User doesn't exist, create them
    const result = await createOpenWebUIUser(email, name, password);

    if (result.success) {
      return {
        success: true,
        created: true,
        userId: result.userId,
        email: result.email
      };
    }

    // Check if creation failed because user was just created (race condition)
    if (result.alreadyExists) {
      return {
        success: true,
        alreadyExists: true,
        message: 'User already exists in OpenWebUI'
      };
    }

    // Creation failed for other reasons
    return {
      success: false,
      error: result.error || 'Failed to ensure OpenWebUI user exists'
    };
  } catch (error) {
    logger.error('Error in ensureOpenWebUIUser:', error.message);
    return {
      success: false,
      error: 'Failed to ensure OpenWebUI user exists'
    };
  }
}

module.exports = {
  createOpenWebUIUser,
  checkOpenWebUIUserExists,
  ensureOpenWebUIUser,
  generateSecurePassword
};
