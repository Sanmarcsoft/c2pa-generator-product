const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync } = require('./database');

const SALT_ROUNDS = 10;

/**
 * User Model
 * Handles all database operations for user management
 */
class User {
  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} - True if valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean} - True if valid
   */
  static isValidPassword(password) {
    return password && password.length >= 8;
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email (required)
   * @param {string} userData.password - User password (required)
   * @param {string} [userData.name] - User name (optional)
   * @param {string} [userData.role='user'] - User role (optional)
   * @returns {Promise<Object>} Created user (without password_hash)
   * @throws {Error} If validation fails or email already exists
   */
  static async create(userData) {
    const { email, password, name, role = 'user' } = userData;

    // Validation
    if (!email) {
      throw new Error('Email is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!this.isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if email already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate ID
    const id = uuidv4();

    // Insert user
    try {
      await runAsync(
        `INSERT INTO users (id, email, password_hash, role, name, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, email, password_hash, role, name || null, new Date().toISOString()]
      );

      // Return user without password_hash
      return await this.findById(id);
    } catch (error) {
      // Handle SQLite unique constraint error
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      const user = await getAsync(
        'SELECT id, email, password_hash, role, name, created_at, last_login FROM users WHERE email = ?',
        [email]
      );
      return user || null;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  /**
   * Find user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    try {
      const user = await getAsync(
        'SELECT id, email, password_hash, role, name, created_at, last_login FROM users WHERE id = ?',
        [id]
      );
      return user || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  /**
   * Update user data
   * @param {string} id - User ID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.email] - New email
   * @param {string} [updates.password] - New password (will be hashed)
   * @param {string} [updates.name] - New name
   * @param {string} [updates.role] - New role
   * @returns {Promise<Object>} Updated user
   * @throws {Error} If user not found or email already exists
   */
  static async update(id, updates) {
    const { email, password, name, role } = updates;

    // Check if user exists
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If updating email, check if new email already exists
    if (email && email !== user.email) {
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const existingUser = await this.findByEmail(email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already exists');
      }
    }

    // If updating password, validate and hash it
    let password_hash = undefined;
    if (password !== undefined) {
      if (!this.isValidPassword(password)) {
        throw new Error('Password must be at least 8 characters');
      }
      password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (password_hash !== undefined) {
      updateFields.push('password_hash = ?');
      updateValues.push(password_hash);
    }

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (updateFields.length === 0) {
      return user; // No updates to make
    }

    // Add ID to params
    updateValues.push(id);

    try {
      await runAsync(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      return await this.findById(id);
    } catch (error) {
      // Handle SQLite unique constraint error
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   * @param {string} id - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(id) {
    try {
      await runAsync(
        'UPDATE users SET last_login = ? WHERE id = ?',
        [new Date().toISOString(), id]
      );
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  /**
   * Delete user by ID
   * @param {string} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if user not found
   */
  static async delete(id) {
    try {
      const result = await runAsync(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      // result.changes indicates how many rows were affected
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  /**
   * Verify password against hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;
