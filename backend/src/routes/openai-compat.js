const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const aiService = require('../services/aiService');
const sessionService = require('../services/sessionService');
const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * OpenAI-Compatible API Endpoint
 * This allows OpenWebUI to use the C2PA Generator backend as an OpenAI-compatible API
 */

/**
 * Bearer token authentication middleware
 */
async function authenticateBearer(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Missing or invalid Authorization header',
        type: 'invalid_request_error',
        code: 'invalid_api_key'
      }
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    // Verify token as JWT using authService
    const decoded = authService.verifyToken(token);
    const user = await getAsync('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key',
          type: 'invalid_request_error',
          code: 'invalid_api_key'
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      error: {
        message: 'Internal server error',
        type: 'internal_error'
      }
    });
  }
}

/**
 * POST /api/v1/chat/completions
 * OpenAI-compatible chat completions endpoint
 */
router.post('/chat/completions', authenticateBearer, express.json(), async (req, res) => {
  try {
    const {
      messages,
      model = 'c2pa-assistant',
      temperature = 0.7,
      max_tokens = 500,
      stream = false,
      user: userIdentifier
    } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: {
          message: 'messages is required and must be a non-empty array',
          type: 'invalid_request_error',
          param: 'messages',
          code: null
        }
      });
    }

    // Extract the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return res.status(400).json({
        error: {
          message: 'Last message must be from user',
          type: 'invalid_request_error',
          param: 'messages',
          code: null
        }
      });
    }

    const userMessage = lastMessage.content;

    // Get or create session for this user
    const session = await sessionService.getOrCreateActiveSession(req.user.id);

    // Save user message
    const userMessageId = uuidv4();
    await runAsync(
      `INSERT INTO chat_messages (id, sender, message, context, metadata, user_id, session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userMessageId,
        'user',
        userMessage,
        JSON.stringify({}),
        JSON.stringify({ timestamp: new Date().toISOString() }),
        req.user.id,
        session.id
      ]
    );

    // Get conversation history for this session (last 10 messages)
    const history = await allAsync(
      `SELECT * FROM chat_messages
       WHERE session_id = ?
       ORDER BY created_at DESC
       LIMIT 10`,
      [session.id]
    );

    // Generate AI response
    const aiResponse = await aiService.generateResponse(userMessage, history.reverse(), {
      user: req.user,
      currentPhase: 'phase-1'
    });

    // Save AI response
    const aiMessageId = uuidv4();
    await runAsync(
      `INSERT INTO chat_messages (id, sender, message, context, metadata, user_id, session_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        aiMessageId,
        'assistant',
        aiResponse.message,
        JSON.stringify({}),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          emotion: aiResponse.emotion || 'helpful',
          animation: aiResponse.animation || 'idle'
        }),
        req.user.id,
        session.id
      ]
    );

    // Update session
    await sessionService.incrementMessageCount(session.id);
    await sessionService.incrementMessageCount(session.id);
    await sessionService.updateSessionTimestamp(session.id);

    // Auto-generate session title from first user message if no title set
    if (!session.title || session.title.includes('New Conversation')) {
      const generatedTitle = sessionService.generateSessionTitle(userMessage);
      await sessionService.updateSession(session.id, req.user.id, { title: generatedTitle });
    }

    logger.info(`OpenAI-compat API call - User: ${req.user.email}, Model: ${model}`);

    // Return OpenAI-compatible response
    if (stream) {
      // TODO: Implement streaming response
      return res.status(501).json({
        error: {
          message: 'Streaming not yet implemented',
          type: 'not_implemented_error'
        }
      });
    }

    // Non-streaming response
    const response = {
      id: `chatcmpl-${uuidv4()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: aiResponse.message
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: Math.ceil(userMessage.length / 4),
        completion_tokens: Math.ceil(aiResponse.message.length / 4),
        total_tokens: Math.ceil((userMessage.length + aiResponse.message.length) / 4)
      }
    };

    res.json(response);
  } catch (error) {
    logger.error('OpenAI-compat API error:', error);
    res.status(500).json({
      error: {
        message: error.message || 'Internal server error',
        type: 'internal_error'
      }
    });
  }
});

/**
 * GET /api/v1/models
 * OpenAI-compatible models list endpoint
 */
router.get('/models', authenticateBearer, async (req, res) => {
  try {
    const models = [
      {
        id: 'c2pa-assistant',
        object: 'model',
        created: 1677649963,
        owned_by: 'sanmarcsoft',
        permission: [],
        root: 'c2pa-assistant',
        parent: null
      },
      {
        id: 'c2pa-expert',
        object: 'model',
        created: 1677649963,
        owned_by: 'sanmarcsoft',
        permission: [],
        root: 'c2pa-expert',
        parent: null
      }
    ];

    res.json({
      object: 'list',
      data: models
    });
  } catch (error) {
    logger.error('Models list error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error',
        type: 'internal_error'
      }
    });
  }
});

module.exports = router;
