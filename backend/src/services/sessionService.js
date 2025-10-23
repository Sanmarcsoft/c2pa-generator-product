/**
 * Session Management Service
 *
 * Handles all database operations related to chat sessions including:
 * - Creating new sessions
 * - Retrieving sessions for users
 * - Updating session metadata
 * - Archiving sessions
 * - Session limit enforcement
 */

const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');

/**
 * Create a new chat session for a user
 * @param {string} userId - User ID
 * @param {string} title - Session title (optional)
 * @param {object} metadata - Additional metadata (optional)
 * @returns {Promise<object>} Created session object
 */
async function createSession(userId, title = null, metadata = null) {
  try {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    // Auto-generate title if not provided
    const sessionTitle = title || `New Conversation - ${new Date().toLocaleDateString()}`;

    await runAsync(
      `INSERT INTO chat_sessions (id, user_id, title, created_at, updated_at, is_active, message_count, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        sessionTitle,
        now,
        now,
        1, // is_active
        0, // message_count
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    const session = await getAsync(
      'SELECT * FROM chat_sessions WHERE id = ?',
      [sessionId]
    );

    logger.info(`Session created: ${sessionId} for user ${userId}`);

    return formatSession(session);
  } catch (error) {
    logger.error('Error creating session:', error);
    throw error;
  }
}

/**
 * Get a specific session by ID (with user security check)
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<object|null>} Session object or null if not found
 */
async function getSessionById(sessionId, userId) {
  try {
    const session = await getAsync(
      'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    return session ? formatSession(session) : null;
  } catch (error) {
    logger.error('Error getting session:', error);
    throw error;
  }
}

/**
 * Get all sessions for a user
 * @param {string} userId - User ID
 * @param {boolean} includeArchived - Include archived sessions
 * @param {number} limit - Pagination limit
 * @param {number} offset - Pagination offset
 * @returns {Promise<object>} Object with sessions array and pagination info
 */
async function getUserSessions(userId, includeArchived = false, limit = 20, offset = 0) {
  try {
    // Build query based on includeArchived flag
    const activeFilter = includeArchived ? '' : 'AND is_active = 1';

    // Get sessions
    const sessions = await allAsync(
      `SELECT * FROM chat_sessions
       WHERE user_id = ? ${activeFilter}
       ORDER BY updated_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await getAsync(
      `SELECT COUNT(*) as total FROM chat_sessions
       WHERE user_id = ? ${activeFilter}`,
      [userId]
    );

    const total = countResult.total;
    const hasMore = (offset + limit) < total;

    return {
      sessions: sessions.map(formatSession),
      pagination: {
        total,
        limit,
        offset,
        hasMore
      }
    };
  } catch (error) {
    logger.error('Error getting user sessions:', error);
    throw error;
  }
}

/**
 * Update session metadata (title, metadata, etc.)
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID (for security)
 * @param {object} updates - Updates to apply
 * @returns {Promise<object|null>} Updated session or null if not found
 */
async function updateSession(sessionId, userId, updates) {
  try {
    // Verify session belongs to user
    const session = await getAsync(
      'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (!session) {
      return null;
    }

    const now = new Date().toISOString();
    const { title, metadata } = updates;

    // Build update query dynamically
    const updateFields = ['updated_at = ?'];
    const updateValues = [now];

    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }

    if (metadata !== undefined) {
      updateFields.push('metadata = ?');
      updateValues.push(JSON.stringify(metadata));
    }

    updateValues.push(sessionId, userId);

    await runAsync(
      `UPDATE chat_sessions SET ${updateFields.join(', ')}
       WHERE id = ? AND user_id = ?`,
      updateValues
    );

    const updatedSession = await getAsync(
      'SELECT * FROM chat_sessions WHERE id = ?',
      [sessionId]
    );

    logger.info(`Session updated: ${sessionId}`);

    return formatSession(updatedSession);
  } catch (error) {
    logger.error('Error updating session:', error);
    throw error;
  }
}

/**
 * Archive a session (soft delete)
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID (for security)
 * @returns {Promise<boolean>} True if archived, false if not found
 */
async function archiveSession(sessionId, userId) {
  try {
    const result = await runAsync(
      `UPDATE chat_sessions SET is_active = 0, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [new Date().toISOString(), sessionId, userId]
    );

    if (result.changes > 0) {
      logger.info(`Session archived: ${sessionId}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('Error archiving session:', error);
    throw error;
  }
}

/**
 * Get or create an active session for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Active session
 */
async function getOrCreateActiveSession(userId) {
  try {
    // Try to get most recent active session
    const session = await getAsync(
      `SELECT * FROM chat_sessions
       WHERE user_id = ? AND is_active = 1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [userId]
    );

    if (session) {
      return formatSession(session);
    }

    // No active session found, create one
    return await createSession(userId);
  } catch (error) {
    logger.error('Error getting or creating active session:', error);
    throw error;
  }
}

/**
 * Increment message count for a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
async function incrementMessageCount(sessionId) {
  try {
    await runAsync(
      `UPDATE chat_sessions SET message_count = message_count + 1
       WHERE id = ?`,
      [sessionId]
    );
  } catch (error) {
    logger.error('Error incrementing message count:', error);
    throw error;
  }
}

/**
 * Update session timestamp and last_message_at
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
async function updateSessionTimestamp(sessionId) {
  try {
    const now = new Date().toISOString();
    await runAsync(
      `UPDATE chat_sessions SET updated_at = ?, last_message_at = ?
       WHERE id = ?`,
      [now, now, sessionId]
    );
  } catch (error) {
    logger.error('Error updating session timestamp:', error);
    throw error;
  }
}

/**
 * Generate session title from first message
 * @param {string} firstMessage - First message in session
 * @returns {string} Generated title (max 50 chars)
 */
function generateSessionTitle(firstMessage) {
  if (!firstMessage || typeof firstMessage !== 'string') {
    return 'New Conversation';
  }

  // Truncate to 50 characters
  const title = firstMessage.substring(0, 50);

  // Add ellipsis if truncated
  return firstMessage.length > 50 ? `${title}...` : title;
}

/**
 * Enforce session limit per user (auto-archive oldest if > 50 active sessions)
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of sessions archived
 */
async function enforceSessionLimit(userId) {
  try {
    const MAX_ACTIVE_SESSIONS = 50;

    // Count active sessions
    const countResult = await getAsync(
      'SELECT COUNT(*) as count FROM chat_sessions WHERE user_id = ? AND is_active = 1',
      [userId]
    );

    const activeCount = countResult.count;

    if (activeCount <= MAX_ACTIVE_SESSIONS) {
      return 0; // Under limit, no action needed
    }

    // Get oldest sessions to archive
    const excessCount = activeCount - MAX_ACTIVE_SESSIONS;
    const oldestSessions = await allAsync(
      `SELECT id FROM chat_sessions
       WHERE user_id = ? AND is_active = 1
       ORDER BY updated_at ASC
       LIMIT ?`,
      [userId, excessCount]
    );

    // Archive oldest sessions
    for (const session of oldestSessions) {
      await archiveSession(session.id, userId);
    }

    logger.info(`Auto-archived ${excessCount} sessions for user ${userId}`);
    return excessCount;
  } catch (error) {
    logger.error('Error enforcing session limit:', error);
    throw error;
  }
}

/**
 * Format session object for API response
 * @param {object} session - Raw session from database
 * @returns {object} Formatted session
 */
function formatSession(session) {
  if (!session) return null;

  return {
    id: session.id,
    userId: session.user_id,
    title: session.title,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    lastMessageAt: session.last_message_at,
    messageCount: session.message_count,
    openwebuiChatId: session.openwebui_chat_id,
    isActive: session.is_active === 1,
    metadata: session.metadata ? JSON.parse(session.metadata) : null
  };
}

module.exports = {
  createSession,
  getSessionById,
  getUserSessions,
  updateSession,
  archiveSession,
  getOrCreateActiveSession,
  incrementMessageCount,
  updateSessionTimestamp,
  generateSessionTitle,
  enforceSessionLimit
};
