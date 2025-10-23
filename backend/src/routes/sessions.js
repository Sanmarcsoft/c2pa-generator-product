/**
 * Session Management Routes
 *
 * REST API endpoints for managing chat sessions:
 * - GET    /api/sessions          - List user's sessions
 * - POST   /api/sessions          - Create new session
 * - GET    /api/sessions/:id      - Get session details
 * - PATCH  /api/sessions/:id      - Update session
 * - DELETE /api/sessions/:id      - Archive session
 */

const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

// All routes require authentication
router.use(requireAuth);

/**
 * GET /api/sessions - List user's sessions
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const includeArchived = req.query.includeArchived === 'true';
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const result = await sessionService.getUserSessions(
      userId,
      includeArchived,
      limit,
      offset
    );

    res.json({
      success: true,
      sessions: result.sessions,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Error listing sessions:', error);
    next(error);
  }
});

/**
 * POST /api/sessions - Create new session
 */
router.post('/', express.json(), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, metadata } = req.body;

    // Enforce session limit before creating new session
    await sessionService.enforceSessionLimit(userId);

    const session = await sessionService.createSession(userId, title, metadata);

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    logger.error('Error creating session:', error);
    next(error);
  }
});

/**
 * GET /api/sessions/:id - Get session details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID format',
        code: 'INVALID_SESSION_ID'
      });
    }

    const session = await sessionService.getSessionById(sessionId, userId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    logger.error('Error getting session:', error);
    next(error);
  }
});

/**
 * PATCH /api/sessions/:id - Update session
 */
router.patch('/:id', express.json(), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { title, metadata } = req.body;

    // Validate at least one field is being updated
    if (title === undefined && metadata === undefined) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update provided'
      });
    }

    const session = await sessionService.updateSession(sessionId, userId, {
      title,
      metadata
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    logger.error('Error updating session:', error);
    next(error);
  }
});

/**
 * DELETE /api/sessions/:id - Archive session
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const archived = await sessionService.archiveSession(sessionId, userId);

    if (!archived) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or access denied',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Session archived successfully'
    });
  } catch (error) {
    logger.error('Error archiving session:', error);
    next(error);
  }
});

module.exports = router;
