/**
 * Integration Tests for Chat API with Session Persistence
 *
 * These tests follow TDD principles - they are written BEFORE implementation
 * and will initially FAIL until the session persistence feature is implemented.
 *
 * Tests cover:
 * - POST /api/chat - Send message with optional sessionId
 * - GET /api/chat/sessions - List user's sessions
 * - POST /api/chat/sessions - Create new session
 * - GET /api/chat/sessions/:id - Get session details
 * - PATCH /api/chat/sessions/:id - Update session
 * - DELETE /api/chat/sessions/:id - Archive session
 * - GET /api/chat/history?sessionId=:id - Get session messages
 */

const request = require('supertest');
const app = require('../src/app');
const { initDatabase, runAsync } = require('../src/models/database');
const { v4: uuidv4 } = require('uuid');

describe('Chat API - Session Persistence Integration Tests', () => {
  let userToken;
  let userId;
  let user2Token;
  let user2Id;

  // Initialize database before all tests
  beforeAll(async () => {
    await initDatabase();
  });

  // Clean up and create test users before each test
  beforeEach(async () => {
    // Clear all test data
    await runAsync('DELETE FROM chat_messages');
    await runAsync('DELETE FROM chat_sessions');
    await runAsync('DELETE FROM users');

    // Create test user 1
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'chatuser1@test.com',
        password: 'SecurePass123!',
        name: 'Chat User 1'
      });

    userToken = user1Response.body.token;
    userId = user1Response.body.user.id;

    // Create test user 2
    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'chatuser2@test.com',
        password: 'SecurePass123!',
        name: 'Chat User 2'
      });

    user2Token = user2Response.body.token;
    user2Id = user2Response.body.user.id;
  });

  /**
   * Test Suite: POST /api/chat - Send Message
   */
  describe('POST /api/chat', () => {
    test('should create session automatically when sending first message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Hello, this is my first message',
          context: { currentPhase: 'phase-1' }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.response).toBeDefined();
      expect(response.body.session).toBeDefined();
      expect(response.body.session.id).toBeDefined();
      expect(response.body.session.messageCount).toBeGreaterThanOrEqual(1);
    });

    test('should send message to existing session when sessionId provided', async () => {
      // Create a session first
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Existing Session' });

      const sessionId = createResponse.body.session.id;

      // Send message to that session
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Message to existing session',
          sessionId: sessionId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session.id).toBe(sessionId);
    });

    test('should increment session message_count when message sent', async () => {
      // Create session
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Session' });

      const sessionId = createResponse.body.session.id;

      // Send first message
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'First message',
          sessionId: sessionId
        });

      // Send second message
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Second message',
          sessionId: sessionId
        });

      expect(response.body.session.messageCount).toBeGreaterThanOrEqual(2);
    });

    test('should update session updated_at and last_message_at', async () => {
      // Create session
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Session' });

      const sessionId = createResponse.body.session.id;
      const initialUpdatedAt = createResponse.body.session.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Send message
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Test message',
          sessionId: sessionId
        });

      expect(response.body.session.updatedAt).toBeDefined();
      expect(response.body.session.updatedAt).not.toBe(initialUpdatedAt);
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Unauthorized message' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid sessionId', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Test message',
          sessionId: 'invalid-session-id'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request to access another users session', async () => {
      // Create session for user 1
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'User 1 Session' });

      const sessionId = createResponse.body.session.id;

      // User 2 tries to send message to user 1's session
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          message: 'Unauthorized access attempt',
          sessionId: sessionId
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: GET /api/chat/sessions - List Sessions
   */
  describe('GET /api/chat/sessions', () => {
    test('should return empty array for user with no sessions', async () => {
      const response = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toEqual([]);
    });

    test('should return all active sessions for authenticated user', async () => {
      // Create 3 sessions
      await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Session 1' });

      await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Session 2' });

      await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Session 3' });

      const response = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessions).toHaveLength(3);
      expect(response.body.sessions[0].title).toBeDefined();
    });

    test('should not return archived sessions by default', async () => {
      // Create and archive a session
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'To Be Archived' });

      const sessionId = createResponse.body.session.id;

      await request(app)
        .delete(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // List sessions
      const response = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(0);
    });

    test('should include archived sessions when includeArchived=true', async () => {
      // Create and archive a session
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Archived Session' });

      const sessionId = createResponse.body.session.id;

      await request(app)
        .delete(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // List sessions with archived
      const response = await request(app)
        .get('/api/chat/sessions?includeArchived=true')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].isActive).toBe(false);
    });

    test('should only return sessions for authenticated user', async () => {
      // Create session for user 1
      await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'User 1 Session' });

      // Create session for user 2
      await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'User 2 Session' });

      // User 1 lists sessions
      const response = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(1);
      expect(response.body.sessions[0].title).toBe('User 1 Session');
    });

    test('should support pagination with limit and offset', async () => {
      // Create 5 sessions
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/chat/sessions')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ title: `Session ${i}` });
      }

      // Get first 3
      const response = await request(app)
        .get('/api/chat/sessions?limit=3&offset=0')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toHaveLength(3);
      expect(response.body.pagination.total).toBe(5);
      expect(response.body.pagination.hasMore).toBe(true);
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/chat/sessions');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: POST /api/chat/sessions - Create Session
   */
  describe('POST /api/chat/sessions', () => {
    test('should create new session with provided title', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'My New Session' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.session).toBeDefined();
      expect(response.body.session.id).toBeDefined();
      expect(response.body.session.title).toBe('My New Session');
      expect(response.body.session.isActive).toBe(true);
      expect(response.body.session.messageCount).toBe(0);
    });

    test('should auto-generate title if not provided', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.session.title).toBeDefined();
      expect(response.body.session.title).toContain('New Conversation');
    });

    test('should create session with metadata', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Phase 2 Session',
          metadata: {
            currentPhase: 'phase-2',
            tags: ['important', 'requirements']
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.session.metadata).toBeDefined();
      expect(response.body.session.metadata.currentPhase).toBe('phase-2');
    });

    test('should associate session with authenticated user', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Session' });

      expect(response.status).toBe(201);
      expect(response.body.session.userId).toBe(userId);
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .post('/api/chat/sessions')
        .send({ title: 'Unauthorized Session' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: GET /api/chat/sessions/:id - Get Session Details
   */
  describe('GET /api/chat/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a test session
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Session' });

      sessionId = response.body.session.id;
    });

    test('should return session details for valid session ID', async () => {
      const response = await request(app)
        .get(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session).toBeDefined();
      expect(response.body.session.id).toBe(sessionId);
      expect(response.body.session.title).toBe('Test Session');
      expect(response.body.session.userId).toBe(userId);
    });

    test('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .get(`/api/chat/sessions/${uuidv4()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('should return 403 when accessing another users session', async () => {
      // User 2 tries to access User 1's session
      const response = await request(app)
        .get(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/chat/sessions/${sessionId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: PATCH /api/chat/sessions/:id - Update Session
   */
  describe('PATCH /api/chat/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a test session
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Original Title' });

      sessionId = response.body.session.id;
    });

    test('should update session title', async () => {
      const response = await request(app)
        .patch(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.session.title).toBe('Updated Title');
    });

    test('should update session metadata', async () => {
      const response = await request(app)
        .patch(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          metadata: {
            phase: 'phase-3',
            tags: ['updated']
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.session.metadata).toBeDefined();
      expect(response.body.session.metadata.phase).toBe('phase-3');
    });

    test('should update session updated_at timestamp', async () => {
      const initialResponse = await request(app)
        .get(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const initialUpdatedAt = initialResponse.body.session.updatedAt;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .patch(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'New Title' });

      expect(response.body.session.updatedAt).not.toBe(initialUpdatedAt);
    });

    test('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .patch(`/api/chat/sessions/${uuidv4()}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('should return 403 when updating another users session', async () => {
      const response = await request(app)
        .patch(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked Title' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .patch(`/api/chat/sessions/${sessionId}`)
        .send({ title: 'Unauthorized Update' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: DELETE /api/chat/sessions/:id - Archive Session
   */
  describe('DELETE /api/chat/sessions/:id', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a test session
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Session to Archive' });

      sessionId = response.body.session.id;
    });

    test('should archive session (soft delete)', async () => {
      const response = await request(app)
        .delete(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('archived');
    });

    test('should not appear in active sessions after archival', async () => {
      await request(app)
        .delete(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const response = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.body.sessions).toHaveLength(0);
    });

    test('should preserve messages after session archival', async () => {
      // Send a message to the session
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Test message',
          sessionId: sessionId
        });

      // Archive session
      await request(app)
        .delete(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      // Get session history
      const response = await request(app)
        .get(`/api/chat/history?sessionId=${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    test('should return 404 for non-existent session', async () => {
      const response = await request(app)
        .delete(`/api/chat/sessions/${uuidv4()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    test('should return 403 when archiving another users session', async () => {
      const response = await request(app)
        .delete(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .delete(`/api/chat/sessions/${sessionId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: GET /api/chat/history?sessionId=:id - Get Session Messages
   */
  describe('GET /api/chat/history', () => {
    let sessionId;

    beforeEach(async () => {
      // Create a test session
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test Session' });

      sessionId = response.body.session.id;

      // Send some messages
      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'First message',
          sessionId: sessionId
        });

      await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          message: 'Second message',
          sessionId: sessionId
        });
    });

    test('should return messages for specific session', async () => {
      const response = await request(app)
        .get(`/api/chat/history?sessionId=${sessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.messages).toBeDefined();
      expect(response.body.messages.length).toBeGreaterThan(0);
    });

    test('should return messages in chronological order', async () => {
      const response = await request(app)
        .get(`/api/chat/history?sessionId=${sessionId}&order=asc`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      const messages = response.body.messages;

      // Check timestamps are in ascending order
      for (let i = 1; i < messages.length; i++) {
        expect(new Date(messages[i].createdAt) >= new Date(messages[i-1].createdAt)).toBe(true);
      }
    });

    test('should support pagination with limit and offset', async () => {
      const response = await request(app)
        .get(`/api/chat/history?sessionId=${sessionId}&limit=1&offset=0`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toHaveLength(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.hasMore).toBe(true);
    });

    test('should return empty array for session with no messages', async () => {
      // Create new session with no messages
      const newSessionResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Empty Session' });

      const emptySessionId = newSessionResponse.body.session.id;

      const response = await request(app)
        .get(`/api/chat/history?sessionId=${emptySessionId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toEqual([]);
    });

    test('should return 403 when accessing another users session history', async () => {
      const response = await request(app)
        .get(`/api/chat/history?sessionId=${sessionId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
    });

    test('should return most recent session history when no sessionId provided', async () => {
      const response = await request(app)
        .get('/api/chat/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.messages).toBeDefined();
      expect(response.body.session).toBeDefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/chat/history?sessionId=${sessionId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: Error Handling
   */
  describe('Error Handling', () => {
    test('should return proper error format for validation errors', async () => {
      const response = await request(app)
        .post('/api/chat')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: '' }); // Empty message

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should return proper error format for not found errors', async () => {
      const response = await request(app)
        .get(`/api/chat/sessions/${uuidv4()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe('SESSION_NOT_FOUND');
    });

    test('should return proper error format for authorization errors', async () => {
      // Create session for user 1
      const createResponse = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'User 1 Session' });

      const sessionId = createResponse.body.session.id;

      // User 2 tries to access it
      const response = await request(app)
        .get(`/api/chat/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe('SESSION_ACCESS_DENIED');
    });
  });

  /**
   * Test Suite: Session Limit Enforcement
   */
  describe('Session Limit Enforcement', () => {
    test('should auto-archive oldest session when exceeding 50 sessions', async () => {
      // Create 50 sessions
      for (let i = 1; i <= 50; i++) {
        await request(app)
          .post('/api/chat/sessions')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ title: `Session ${i}` });
      }

      // Create 51st session - should trigger auto-archival
      const response = await request(app)
        .post('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Session 51' });

      expect(response.status).toBe(201);

      // Check that we still have only 50 active sessions
      const sessionsResponse = await request(app)
        .get('/api/chat/sessions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(sessionsResponse.body.sessions.length).toBeLessThanOrEqual(50);
    }, 30000); // Increase timeout for this test
  });
});
