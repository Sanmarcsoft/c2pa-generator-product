const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const aiService = require('../services/aiService');
const { getDocumentSummary } = require('../services/ragService');
const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');
const requireAuth = require('../middleware/requireAuth');

// POST /api/chat - Send message to AI assistant
router.post('/', requireAuth, express.json(), async (req, res, next) => {
  try {
    const { message, context, sessionId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a string'
      });
    }

    // Get or create session
    let session;
    if (sessionId) {
      // Verify session exists and belongs to user
      session = await sessionService.getSessionById(sessionId, req.user.id);
      if (!session) {
        return res.status(403).json({
          success: false,
          error: 'Session not found or access denied',
          code: 'SESSION_ACCESS_DENIED'
        });
      }
    } else {
      // No session provided, get or create active session
      session = await sessionService.getOrCreateActiveSession(req.user.id);
    }

    // Get existing OpenWebUI chat_id from session
    const existingChatId = session.openwebuiChatId;

    // Save user message with session_id
    const userMessageId = uuidv4();
    await runAsync(
      `INSERT INTO chat_messages (id, sender, message, context, metadata, user_id, session_id, openwebui_chat_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userMessageId,
        'user',
        message,
        JSON.stringify(context || {}),
        JSON.stringify({ timestamp: new Date().toISOString() }),
        req.user.id,
        session.id,
        existingChatId || null
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

    // Generate AI response with user context for OpenWebUI session management
    const aiResponse = await aiService.generateResponse(message, history.reverse(), {
      ...context,
      user: req.user, // Pass authenticated user for OpenWebUI session
      openwebuiChatId: existingChatId // Pass existing session if available
    });

    // Save AI response with OpenWebUI chat_id
    const aiMessageId = uuidv4();
    const openwebuiChatId = aiResponse.openwebuiChatId || existingChatId;
    await runAsync(
      `INSERT INTO chat_messages (id, sender, message, context, metadata, user_id, session_id, openwebui_chat_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        aiMessageId,
        'assistant',
        aiResponse.message,
        JSON.stringify(context || {}),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          emotion: aiResponse.emotion || 'helpful',
          animation: aiResponse.animation || 'idle'
        }),
        req.user.id,
        session.id,
        openwebuiChatId
      ]
    );

    // Update session: increment message count (2 messages: user + assistant)
    await sessionService.incrementMessageCount(session.id);
    await sessionService.incrementMessageCount(session.id);
    await sessionService.updateSessionTimestamp(session.id);

    // Auto-generate session title from first user message if no title set
    if (!session.title || session.title.includes('New Conversation')) {
      const generatedTitle = sessionService.generateSessionTitle(message);
      await sessionService.updateSession(session.id, req.user.id, { title: generatedTitle });
    }

    // Update OpenWebUI chat_id in session if received
    if (openwebuiChatId && !session.openwebuiChatId) {
      await runAsync(
        'UPDATE chat_sessions SET openwebui_chat_id = ? WHERE id = ?',
        [openwebuiChatId, session.id]
      );
    }

    // Get updated session info
    const updatedSession = await sessionService.getSessionById(session.id, req.user.id);

    logger.info(`Chat interaction - Session: ${session.id}, User: "${message.substring(0, 50)}..."`);

    res.json({
      success: true,
      response: {
        id: aiMessageId,
        message: aiResponse.message,
        emotion: aiResponse.emotion,
        animation: aiResponse.animation,
        suggestions: aiResponse.suggestions || []
      },
      session: updatedSession
    });
  } catch (error) {
    logger.error('Chat error:', error);
    next(error);
  }
});

// GET /api/chat/history - Get conversation history
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sessionId = req.query.sessionId;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

    let targetSessionId = sessionId;
    let session = null;

    // If no sessionId provided, get most recent active session
    if (!targetSessionId) {
      session = await sessionService.getOrCreateActiveSession(userId);
      targetSessionId = session.id;
    } else {
      // Verify session belongs to user
      session = await sessionService.getSessionById(targetSessionId, userId);
      if (!session) {
        return res.status(403).json({
          success: false,
          error: 'Session not found or access denied',
          code: 'SESSION_ACCESS_DENIED'
        });
      }
    }

    // Get messages for this session
    const messages = await allAsync(
      `SELECT * FROM chat_messages
       WHERE session_id = ?
       ORDER BY created_at ${order}
       LIMIT ? OFFSET ?`,
      [targetSessionId, limit, offset]
    );

    // Get total count for pagination
    const countResult = await getAsync(
      'SELECT COUNT(*) as total FROM chat_messages WHERE session_id = ?',
      [targetSessionId]
    );

    const total = countResult.total;
    const hasMore = (offset + limit) < total;

    res.json({
      success: true,
      session,
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore
      }
    });
  } catch (error) {
    logger.error('Error getting chat history:', error);
    next(error);
  }
});

// POST /api/chat/analyze-document - Analyze uploaded document
router.post('/analyze-document', express.json(), async (req, res, next) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required'
      });
    }

    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ?',
      [documentId]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Analyze document using AI service
    const analysis = await aiService.analyzeDocument(document);

    // Save analysis as a chat message
    const messageId = uuidv4();
    await runAsync(
      `INSERT INTO chat_messages (id, sender, message, context, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        messageId,
        'assistant',
        analysis.summary,
        JSON.stringify({ documentId, analysis: 'document' }),
        JSON.stringify({
          timestamp: new Date().toISOString(),
          keyPoints: analysis.keyPoints,
          requirements: analysis.requirements
        })
      ]
    );

    logger.info(`Document analyzed: ${document.original_name}`);

    res.json({
      success: true,
      analysis: {
        id: messageId,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        requirements: analysis.requirements,
        suggestions: analysis.suggestions
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/chat/suggestions - Get next step suggestions
router.get('/suggestions', async (req, res, next) => {
  try {
    // Get current progress
    const progress = await getAsync(
      'SELECT * FROM progress WHERE user_id = ?',
      ['sanmarcsoft-llc']
    );

    const suggestions = await aiService.getSuggestions(progress);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/chat/history - Clear conversation history
router.delete('/history', async (req, res, next) => {
  try {
    await runAsync('DELETE FROM chat_messages');

    logger.info('Chat history cleared');

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/chat/search-documents - Search documents for specific topic (RAG)
router.post('/search-documents', express.json(), async (req, res, next) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Topic is required and must be a string'
      });
    }

    const summary = await getDocumentSummary(topic);

    logger.info(`Document search for topic: ${topic} - Found: ${summary.found}`);

    res.json({
      success: true,
      found: summary.found,
      count: summary.count || 0,
      documents: summary.documents || [],
      message: summary.message
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
