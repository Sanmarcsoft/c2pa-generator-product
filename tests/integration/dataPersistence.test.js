const { runAsync, getAsync, allAsync } = require('../../backend/src/models/database');
const { v4: uuidv4 } = require('uuid');

describe('Data Persistence Integration Tests', () => {
  describe('User Data Persistence', () => {
    let testUserId;

    test('should persist user data', async () => {
      testUserId = uuidv4();
      const testEmail = `test-${Date.now()}@example.com`;

      await runAsync(
        'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
        [testUserId, testEmail, 'hashedpass', 'Test User', 'user']
      );

      const user = await getAsync('SELECT * FROM users WHERE id = ?', [testUserId]);

      expect(user).toBeDefined();
      expect(user.email).toBe(testEmail);
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('user');
    });

    test('should retrieve persisted user data', async () => {
      const user = await getAsync('SELECT * FROM users WHERE id = ?', [testUserId]);

      expect(user).toBeDefined();
      expect(user.id).toBe(testUserId);
    });

    afterAll(async () => {
      if (testUserId) {
        await runAsync('DELETE FROM users WHERE id = ?', [testUserId]);
      }
    });
  });

  describe('GitHub Repository Data Persistence', () => {
    let testRepoId;

    test('should persist GitHub repository data', async () => {
      const result = await runAsync(
        'INSERT INTO github_repos (repo_owner, repo_name, branch, file_count) VALUES (?, ?, ?, ?)',
        ['test-owner', 'test-repo-' + Date.now(), 'main', 42]
      );

      testRepoId = result.lastID;

      const repo = await getAsync('SELECT * FROM github_repos WHERE id = ?', [testRepoId]);

      expect(repo).toBeDefined();
      expect(repo.repo_owner).toBe('test-owner');
      expect(repo.file_count).toBe(42);
    });

    test('should retrieve persisted repository data', async () => {
      const repo = await getAsync('SELECT * FROM github_repos WHERE id = ?', [testRepoId]);

      expect(repo).toBeDefined();
      expect(repo.id).toBe(testRepoId);
    });

    afterAll(async () => {
      if (testRepoId) {
        await runAsync('DELETE FROM github_repos WHERE id = ?', [testRepoId]);
      }
    });
  });

  describe('App Settings Persistence', () => {
    const testKey = `test_setting_${Date.now()}`;

    test('should persist application settings', async () => {
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        [testKey, 'test_value', 'string']
      );

      const setting = await getAsync('SELECT * FROM app_settings WHERE key = ?', [testKey]);

      expect(setting).toBeDefined();
      expect(setting.value).toBe('test_value');
      expect(setting.type).toBe('string');
    });

    test('should retrieve persisted settings', async () => {
      const setting = await getAsync('SELECT * FROM app_settings WHERE key = ?', [testKey]);

      expect(setting).toBeDefined();
      expect(setting.key).toBe(testKey);
    });

    afterAll(async () => {
      await runAsync('DELETE FROM app_settings WHERE key = ?', [testKey]);
    });
  });

  describe('Chat Session Persistence', () => {
    let testSessionId;
    let testUserId;

    beforeAll(async () => {
      testUserId = uuidv4();
      await runAsync(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [testUserId, `session-test-${Date.now()}@example.com`, 'hash', 'user']
      );
    });

    test('should persist chat session data', async () => {
      testSessionId = uuidv4();

      await runAsync(
        'INSERT INTO chat_sessions (id, user_id, title, message_count) VALUES (?, ?, ?, ?)',
        [testSessionId, testUserId, 'Test Session', 5]
      );

      const session = await getAsync('SELECT * FROM chat_sessions WHERE id = ?', [testSessionId]);

      expect(session).toBeDefined();
      expect(session.user_id).toBe(testUserId);
      expect(session.title).toBe('Test Session');
      expect(session.message_count).toBe(5);
    });

    test('should retrieve persisted session data', async () => {
      const session = await getAsync('SELECT * FROM chat_sessions WHERE id = ?', [testSessionId]);

      expect(session).toBeDefined();
      expect(session.id).toBe(testSessionId);
    });

    afterAll(async () => {
      if (testSessionId) {
        await runAsync('DELETE FROM chat_sessions WHERE id = ?', [testSessionId]);
      }
      if (testUserId) {
        await runAsync('DELETE FROM users WHERE id = ?', [testUserId]);
      }
    });
  });

  describe('Data Consistency After Updates', () => {
    let testUserId;

    beforeAll(async () => {
      testUserId = uuidv4();
      await runAsync(
        'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)',
        [testUserId, `update-test-${Date.now()}@example.com`, 'hash', 'Original Name', 'user']
      );
    });

    test('should maintain data consistency after updates', async () => {
      await runAsync(
        'UPDATE users SET name = ?, role = ? WHERE id = ?',
        ['Updated Name', 'admin', testUserId]
      );

      const user = await getAsync('SELECT * FROM users WHERE id = ?', [testUserId]);

      expect(user).toBeDefined();
      expect(user.name).toBe('Updated Name');
      expect(user.role).toBe('admin');
    });

    test('should retrieve updated data consistently', async () => {
      const user = await getAsync('SELECT * FROM users WHERE id = ?', [testUserId]);

      expect(user.name).toBe('Updated Name');
      expect(user.role).toBe('admin');
    });

    afterAll(async () => {
      if (testUserId) {
        await runAsync('DELETE FROM users WHERE id = ?', [testUserId]);
      }
    });
  });

  describe('Foreign Key Constraints', () => {
    let testUserId;
    let testSessionId;

    beforeAll(async () => {
      testUserId = uuidv4();
      testSessionId = uuidv4();

      await runAsync(
        'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [testUserId, `fk-test-${Date.now()}@example.com`, 'hash', 'user']
      );

      await runAsync(
        'INSERT INTO chat_sessions (id, user_id, title) VALUES (?, ?, ?)',
        [testSessionId, testUserId, 'FK Test Session']
      );
    });

    test('should enforce foreign key constraints on delete', async () => {
      const session = await getAsync('SELECT * FROM chat_sessions WHERE id = ?', [testSessionId]);
      expect(session).toBeDefined();

      await runAsync('DELETE FROM users WHERE id = ?', [testUserId]);

      const deletedSession = await getAsync('SELECT * FROM chat_sessions WHERE id = ?', [testSessionId]);
      expect(deletedSession).toBeUndefined();
    });
  });

  describe('Database Indexes', () => {
    test('should have required indexes for performance', async () => {
      const indexes = await allAsync(
        `SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL`
      );

      const indexNames = indexes.map(i => i.name);

      expect(indexNames).toContain('idx_users_email');
      expect(indexNames).toContain('idx_chat_sessions_user_id');
      expect(indexNames).toContain('idx_github_files_content');
    });

    test('should use indexes for email lookups', async () => {
      const queryPlan = await getAsync(
        `EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = ?`,
        ['test@example.com']
      );

      expect(queryPlan.detail).toContain('idx_users_email');
    });
  });
});
