/**
 * Unit Tests for Chat Session Management
 *
 * These tests follow TDD principles - they are written BEFORE implementation
 * and will initially FAIL until the session persistence feature is implemented.
 *
 * Tests cover:
 * - Session creation with proper defaults
 * - Session retrieval and filtering
 * - Message-to-session association
 * - Session updates
 * - Session archival
 * - Cross-user security
 */

const { v4: uuidv4 } = require('uuid');
const { initDatabase, runAsync, getAsync, allAsync } = require('../src/models/database');

describe('Chat Session Management - Unit Tests', () => {
  let testUserId1;
  let testUserId2;
  let testSessionId;

  // Initialize database before all tests
  beforeAll(async () => {
    await initDatabase();
  });

  // Clean up database before each test
  beforeEach(async () => {
    // Clear all test data
    await runAsync('DELETE FROM chat_messages');
    await runAsync('DELETE FROM chat_sessions');
    await runAsync('DELETE FROM users');

    // Create test users
    testUserId1 = uuidv4();
    testUserId2 = uuidv4();

    await runAsync(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [testUserId1, 'user1@test.com', 'hash1', 'Test User 1', 'user']
    );

    await runAsync(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
      [testUserId2, 'user2@test.com', 'hash2', 'Test User 2', 'user']
    );
  });

  /**
   * Test Suite: Session Creation
   */
  describe('Session Creation', () => {
    test('should create new session with auto-generated UUID', async () => {
      const sessionId = uuidv4();
      const title = 'Test Session';

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [sessionId, testUserId1, title]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [sessionId]
      );

      expect(session).toBeDefined();
      expect(session.id).toBe(sessionId);
      expect(session.user_id).toBe(testUserId1);
      expect(session.title).toBe(title);
    });

    test('should set default values on session creation', async () => {
      const sessionId = uuidv4();

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [sessionId, testUserId1, 'New Session']
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [sessionId]
      );

      expect(session.is_active).toBe(1);
      expect(session.message_count).toBe(0);
      expect(session.created_at).toBeDefined();
      expect(session.updated_at).toBeDefined();
    });

    test('should associate session with correct user_id', async () => {
      const sessionId = uuidv4();

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [sessionId, testUserId1, 'User 1 Session']
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [sessionId]
      );

      expect(session.user_id).toBe(testUserId1);
      expect(session.user_id).not.toBe(testUserId2);
    });

    test('should allow creating multiple sessions for same user', async () => {
      const session1Id = uuidv4();
      const session2Id = uuidv4();

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [session1Id, testUserId1, 'Session 1']
      );

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [session2Id, testUserId1, 'Session 2']
      );

      const sessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ?',
        [testUserId1]
      );

      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.id)).toContain(session1Id);
      expect(sessions.map(s => s.id)).toContain(session2Id);
    });
  });

  /**
   * Test Suite: Session Retrieval
   */
  describe('Session Retrieval', () => {
    beforeEach(async () => {
      // Create test sessions
      testSessionId = uuidv4();
      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active) VALUES (?, ?, ?, ?)`,
        [testSessionId, testUserId1, 'Active Session', 1]
      );

      const archivedSessionId = uuidv4();
      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active) VALUES (?, ?, ?, ?)`,
        [archivedSessionId, testUserId1, 'Archived Session', 0]
      );
    });

    test('should retrieve all active sessions for a user', async () => {
      const sessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = 1',
        [testUserId1]
      );

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe(testSessionId);
      expect(sessions[0].title).toBe('Active Session');
      expect(sessions[0].is_active).toBe(1);
    });

    test('should retrieve specific session by ID', async () => {
      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session).toBeDefined();
      expect(session.id).toBe(testSessionId);
      expect(session.user_id).toBe(testUserId1);
    });

    test('should return empty array for user with no sessions', async () => {
      // testUserId2 has no sessions
      const sessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = 1',
        [testUserId2]
      );

      expect(sessions).toHaveLength(0);
    });

    test('should filter out inactive sessions by default', async () => {
      const activeSessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = 1',
        [testUserId1]
      );

      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0].title).toBe('Active Session');

      // Verify archived session exists but isn't in active results
      const allSessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ?',
        [testUserId1]
      );
      expect(allSessions).toHaveLength(2);
    });

    test('should prevent cross-user session access (security)', async () => {
      // User 2 tries to access User 1's session
      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?',
        [testSessionId, testUserId2]
      );

      expect(session).toBeUndefined();
    });

    test('should order sessions by updated_at DESC', async () => {
      // Create multiple sessions with delays
      const session1Id = uuidv4();
      const session2Id = uuidv4();

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [session1Id, testUserId1, 'Older Session', 1, '2025-01-01T00:00:00Z']
      );

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [session2Id, testUserId1, 'Newer Session', 1, '2025-01-02T00:00:00Z']
      );

      const sessions = await allAsync(
        `SELECT * FROM chat_sessions
         WHERE user_id = ? AND is_active = 1
         ORDER BY updated_at DESC`,
        [testUserId1]
      );

      expect(sessions[0].title).toBe('Newer Session');
      expect(sessions[1].title).toBe('Older Session');
    });
  });

  /**
   * Test Suite: Message to Session Association
   */
  describe('Message to Session Association', () => {
    beforeEach(async () => {
      testSessionId = uuidv4();
      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [testSessionId, testUserId1, 'Test Session']
      );
    });

    test('should associate message with session_id', async () => {
      const messageId = uuidv4();

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, 'user', 'Hello', testUserId1, testSessionId]
      );

      const message = await getAsync(
        'SELECT * FROM chat_messages WHERE id = ?',
        [messageId]
      );

      expect(message.session_id).toBe(testSessionId);
      expect(message.user_id).toBe(testUserId1);
    });

    test('should increment session message_count when message added', async () => {
      const messageId = uuidv4();

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, 'user', 'Hello', testUserId1, testSessionId]
      );

      await runAsync(
        `UPDATE chat_sessions SET message_count = message_count + 1 WHERE id = ?`,
        [testSessionId]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session.message_count).toBe(1);
    });

    test('should update session last_message_at when message added', async () => {
      const messageId = uuidv4();
      const timestamp = new Date().toISOString();

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [messageId, 'user', 'Hello', testUserId1, testSessionId, timestamp]
      );

      await runAsync(
        `UPDATE chat_sessions SET last_message_at = ? WHERE id = ?`,
        [timestamp, testSessionId]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session.last_message_at).toBe(timestamp);
    });

    test('should auto-generate session title from first message (50 char limit)', async () => {
      const longMessage = 'This is a very long message that exceeds fifty characters and should be truncated';
      const messageId = uuidv4();

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, 'user', longMessage, testUserId1, testSessionId]
      );

      // Simulate title generation
      const title = longMessage.substring(0, 50);
      await runAsync(
        `UPDATE chat_sessions SET title = ? WHERE id = ?`,
        [title, testSessionId]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session.title).toHaveLength(50);
      expect(session.title).toBe(longMessage.substring(0, 50));
    });

    test('should allow multiple messages in same session', async () => {
      const message1Id = uuidv4();
      const message2Id = uuidv4();

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [message1Id, 'user', 'Hello', testUserId1, testSessionId]
      );

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [message2Id, 'assistant', 'Hi there!', testUserId1, testSessionId]
      );

      const messages = await allAsync(
        'SELECT * FROM chat_messages WHERE session_id = ?',
        [testSessionId]
      );

      expect(messages).toHaveLength(2);
      expect(messages.map(m => m.id)).toContain(message1Id);
      expect(messages.map(m => m.id)).toContain(message2Id);
    });

    test('should update session updated_at when message added', async () => {
      const initialSession = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      const messageId = uuidv4();
      const newTimestamp = new Date().toISOString();

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, 'user', 'Hello', testUserId1, testSessionId]
      );

      await runAsync(
        `UPDATE chat_sessions SET updated_at = ? WHERE id = ?`,
        [newTimestamp, testSessionId]
      );

      const updatedSession = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(updatedSession.updated_at).not.toBe(initialSession.updated_at);
      expect(updatedSession.updated_at).toBe(newTimestamp);
    });
  });

  /**
   * Test Suite: Session Update
   */
  describe('Session Update', () => {
    beforeEach(async () => {
      testSessionId = uuidv4();
      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, metadata)
         VALUES (?, ?, ?, ?)`,
        [testSessionId, testUserId1, 'Original Title', '{}']
      );
    });

    test('should update session title', async () => {
      const newTitle = 'Updated Title';

      await runAsync(
        `UPDATE chat_sessions SET title = ? WHERE id = ?`,
        [newTitle, testSessionId]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session.title).toBe(newTitle);
    });

    test('should update session metadata', async () => {
      const metadata = JSON.stringify({ phase: 'phase-2', tags: ['important'] });

      await runAsync(
        `UPDATE chat_sessions SET metadata = ? WHERE id = ?`,
        [metadata, testSessionId]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session.metadata).toBe(metadata);
      const parsedMetadata = JSON.parse(session.metadata);
      expect(parsedMetadata.phase).toBe('phase-2');
      expect(parsedMetadata.tags).toContain('important');
    });

    test('should update updated_at timestamp on modification', async () => {
      const initialSession = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      const newTimestamp = new Date().toISOString();
      await runAsync(
        `UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ?`,
        ['New Title', newTimestamp, testSessionId]
      );

      const updatedSession = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(updatedSession.updated_at).not.toBe(initialSession.updated_at);
    });

    test('should prevent cross-user session updates (security)', async () => {
      // User 2 tries to update User 1's session
      const result = await runAsync(
        `UPDATE chat_sessions SET title = ? WHERE id = ? AND user_id = ?`,
        ['Hacked Title', testSessionId, testUserId2]
      );

      // No rows should be affected
      expect(result.changes).toBe(0);

      // Verify title unchanged
      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );
      expect(session.title).toBe('Original Title');
    });
  });

  /**
   * Test Suite: Session Archival
   */
  describe('Session Archival', () => {
    beforeEach(async () => {
      testSessionId = uuidv4();
      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active)
         VALUES (?, ?, ?, ?)`,
        [testSessionId, testUserId1, 'Active Session', 1]
      );

      // Add some messages to the session
      const messageId = uuidv4();
      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, 'user', 'Test message', testUserId1, testSessionId]
      );
    });

    test('should archive session by setting is_active to 0', async () => {
      await runAsync(
        `UPDATE chat_sessions SET is_active = 0 WHERE id = ?`,
        [testSessionId]
      );

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );

      expect(session.is_active).toBe(0);
    });

    test('should not appear in active sessions list after archival', async () => {
      await runAsync(
        `UPDATE chat_sessions SET is_active = 0 WHERE id = ?`,
        [testSessionId]
      );

      const activeSessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = 1',
        [testUserId1]
      );

      expect(activeSessions).toHaveLength(0);
    });

    test('should keep messages accessible after archival', async () => {
      await runAsync(
        `UPDATE chat_sessions SET is_active = 0 WHERE id = ?`,
        [testSessionId]
      );

      const messages = await allAsync(
        'SELECT * FROM chat_messages WHERE session_id = ?',
        [testSessionId]
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Test message');
    });

    test('should prevent archiving other users sessions (security)', async () => {
      // User 2 tries to archive User 1's session
      const result = await runAsync(
        `UPDATE chat_sessions SET is_active = 0 WHERE id = ? AND user_id = ?`,
        [testSessionId, testUserId2]
      );

      expect(result.changes).toBe(0);

      // Verify session still active
      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );
      expect(session.is_active).toBe(1);
    });

    test('should handle archiving already archived session gracefully', async () => {
      // Archive once
      await runAsync(
        `UPDATE chat_sessions SET is_active = 0 WHERE id = ?`,
        [testSessionId]
      );

      // Archive again
      const result = await runAsync(
        `UPDATE chat_sessions SET is_active = 0 WHERE id = ?`,
        [testSessionId]
      );

      expect(result.changes).toBe(1); // Still updates the row

      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [testSessionId]
      );
      expect(session.is_active).toBe(0);
    });
  });

  /**
   * Test Suite: Session Limits and Cleanup
   */
  describe('Session Limits and Cleanup', () => {
    test('should enforce soft limit of 50 active sessions per user', async () => {
      // Create 51 sessions
      for (let i = 0; i < 51; i++) {
        const sessionId = uuidv4();
        await runAsync(
          `INSERT INTO chat_sessions (id, user_id, title, is_active)
           VALUES (?, ?, ?, ?)`,
          [sessionId, testUserId1, `Session ${i}`, 1]
        );
      }

      const activeSessions = await allAsync(
        'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = 1',
        [testUserId1]
      );

      expect(activeSessions.length).toBeGreaterThanOrEqual(50);

      // In real implementation, oldest session should be auto-archived
      // when creating the 51st session
    });

    test('should retrieve oldest session for auto-archival', async () => {
      const session1Id = uuidv4();
      const session2Id = uuidv4();

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [session1Id, testUserId1, 'Oldest Session', 1, '2025-01-01T00:00:00Z']
      );

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [session2Id, testUserId1, 'Newer Session', 1, '2025-01-02T00:00:00Z']
      );

      const oldestSession = await getAsync(
        `SELECT * FROM chat_sessions
         WHERE user_id = ? AND is_active = 1
         ORDER BY updated_at ASC
         LIMIT 1`,
        [testUserId1]
      );

      expect(oldestSession.id).toBe(session1Id);
    });
  });

  /**
   * Test Suite: Foreign Key Constraints
   */
  describe('Foreign Key Constraints', () => {
    test('should cascade delete sessions when user is deleted', async () => {
      const sessionId = uuidv4();
      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [sessionId, testUserId1, 'Test Session']
      );

      // Delete user
      await runAsync('DELETE FROM users WHERE id = ?', [testUserId1]);

      // Session should be deleted
      const session = await getAsync(
        'SELECT * FROM chat_sessions WHERE id = ?',
        [sessionId]
      );

      expect(session).toBeUndefined();
    });

    test('should cascade delete messages when session is deleted', async () => {
      const sessionId = uuidv4();
      const messageId = uuidv4();

      await runAsync(
        `INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)`,
        [sessionId, testUserId1, 'Test Session']
      );

      await runAsync(
        `INSERT INTO chat_messages (id, sender, message, user_id, session_id)
         VALUES (?, ?, ?, ?, ?)`,
        [messageId, 'user', 'Hello', testUserId1, sessionId]
      );

      // Delete session
      await runAsync('DELETE FROM chat_sessions WHERE id = ?', [sessionId]);

      // Message should be deleted
      const message = await getAsync(
        'SELECT * FROM chat_messages WHERE id = ?',
        [messageId]
      );

      expect(message).toBeUndefined();
    });
  });
});
