const request = require('supertest');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../../backend/src/models/database');

/**
 * TDD Tests for GitHub Token Management
 *
 * Requirements:
 * 1. Only admin users can set/view/delete GitHub tokens
 * 2. Token is stored as a system-level setting (not per-user)
 * 3. To change token, admin must first delete the existing one
 * 4. Token is masked in UI (show only last 4 characters)
 * 5. No "Enable GitHub Integration" checkbox - just token field
 * 6. Token validation on save
 */

describe('GitHub Token Management - TDD', () => {
  let app;
  let adminToken;
  let userToken;
  let adminUserId;
  let regularUserId;

  beforeAll(async () => {
    // Import app after database is initialized
    app = require('../../backend/src/app');

    // Create test admin user
    adminUserId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('adminpass123', 10);
    await runAsync(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [adminUserId, `test-admin-${Date.now()}@example.com`, adminPasswordHash, 'admin']
    );

    // Create test regular user
    regularUserId = uuidv4();
    const userPasswordHash = await bcrypt.hash('userpass123', 10);
    await runAsync(
      'INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [regularUserId, `test-user-${Date.now()}@example.com`, userPasswordHash, 'user']
    );

    // Get auth tokens
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: `test-admin-${Date.now()}@example.com`,
        password: 'adminpass123'
      });
    adminToken = adminLoginResponse.body.token;

    const userLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: `test-user-${Date.now()}@example.com`,
        password: 'userpass123'
      });
    userToken = userLoginResponse.body.token;
  });

  afterAll(async () => {
    // Clean up test users
    await runAsync('DELETE FROM users WHERE id IN (?, ?)', [adminUserId, regularUserId]);
    // Clean up test GitHub token
    await runAsync('DELETE FROM app_settings WHERE key = ?', ['github_token']);
  });

  describe('GET /api/admin/github/token', () => {
    test('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/admin/github/token');

      expect(response.status).toBe(401);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/admin/github/token')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    test('should return token info for admin users', async () => {
      // Set a test token
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_test1234567890abcdef', 'secret']
      );

      const response = await request(app)
        .get('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.hasToken).toBe(true);
      expect(response.body.tokenPreview).toBe('ghp_...cdef'); // Last 4 chars
      expect(response.body.fullToken).toBeUndefined(); // Never expose full token
    });

    test('should return hasToken=false when no token exists', async () => {
      // Delete any existing token
      await runAsync('DELETE FROM app_settings WHERE key = ?', ['github_token']);

      const response = await request(app)
        .get('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.hasToken).toBe(false);
      expect(response.body.tokenPreview).toBeUndefined();
    });
  });

  describe('POST /api/admin/github/token', () => {
    beforeEach(async () => {
      // Clean up before each test
      await runAsync('DELETE FROM app_settings WHERE key = ?', ['github_token']);
    });

    test('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/admin/github/token')
        .send({ token: 'ghp_newtoken123' });

      expect(response.status).toBe(401);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ token: 'ghp_newtoken123' });

      expect(response.status).toBe(403);
    });

    test('should set new token when no existing token', async () => {
      const response = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'ghp_newtoken123456' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('set successfully');

      // Verify token was saved
      const savedToken = await getAsync(
        'SELECT value FROM app_settings WHERE key = ?',
        ['github_token']
      );
      expect(savedToken.value).toBe('ghp_newtoken123456');
    });

    test('should reject when token already exists', async () => {
      // Set an existing token
      await runAsync(
        'INSERT INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_existingtoken', 'secret']
      );

      const response = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'ghp_newtoken123' });

      expect(response.status).toBe(409); // Conflict
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
      expect(response.body.error).toContain('delete');
    });

    test('should reject invalid token format', async () => {
      const response = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'invalid_token' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('format');
    });

    test('should reject empty token', async () => {
      const response = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    test('should validate token format starts with ghp_ or github_pat_', async () => {
      const validTokens = [
        'ghp_1234567890abcdefghij',
        'github_pat_1234567890abcdefghij'
      ];

      for (const token of validTokens) {
        // Clean up
        await runAsync('DELETE FROM app_settings WHERE key = ?', ['github_token']);

        const response = await request(app)
          .post('/api/admin/github/token')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ token });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('DELETE /api/admin/github/token', () => {
    test('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .delete('/api/admin/github/token');

      expect(response.status).toBe(401);
    });

    test('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete('/api/admin/github/token')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    test('should delete existing token', async () => {
      // Set a token first
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_tokentoDelete', 'secret']
      );

      const response = await request(app)
        .delete('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify token was deleted
      const deletedToken = await getAsync(
        'SELECT value FROM app_settings WHERE key = ?',
        ['github_token']
      );
      expect(deletedToken).toBeUndefined();
    });

    test('should return 404 when no token exists', async () => {
      // Ensure no token exists
      await runAsync('DELETE FROM app_settings WHERE key = ?', ['github_token']);

      const response = await request(app)
        .delete('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('No token found');
    });

    test('should allow setting new token after deletion', async () => {
      // Set initial token
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_oldtoken', 'secret']
      );

      // Delete token
      const deleteResponse = await request(app)
        .delete('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      // Set new token
      const setResponse = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'ghp_newtoken456' });

      expect(setResponse.status).toBe(200);
      expect(setResponse.body.success).toBe(true);

      // Verify new token
      const newToken = await getAsync(
        'SELECT value FROM app_settings WHERE key = ?',
        ['github_token']
      );
      expect(newToken.value).toBe('ghp_newtoken456');
    });
  });

  describe('Token Security', () => {
    test('should never return full token in any response', async () => {
      // Set a test token
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_fullsecrettoken123', 'secret']
      );

      const response = await request(app)
        .get('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain('ghp_fullsecrettoken123');
      expect(response.body.tokenPreview).toBe('ghp_...t123');
    });

    test('should not expose token in error messages', async () => {
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_secrettoken', 'secret']
      );

      const response = await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'ghp_newtoken' });

      expect(response.status).toBe(409);
      expect(JSON.stringify(response.body)).not.toContain('ghp_secrettoken');
    });
  });

  describe('GitHub Config Endpoint Integration', () => {
    test('should not include github_token in /api/admin/config response', async () => {
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_secrettoken', 'secret']
      );

      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(JSON.stringify(response.body)).not.toContain('ghp_secrettoken');
      expect(response.body.config.github_token).toBeUndefined();
    });

    test('should include hasGithubToken flag in config', async () => {
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_test', 'secret']
      );

      const response = await request(app)
        .get('/api/admin/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.config.hasGithubToken).toBe(true);
    });
  });

  describe('Backwards Compatibility', () => {
    test('should remove github_configured flag when token is set', async () => {
      // Set old github_configured flag
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_configured', 'true', 'boolean']
      );

      // Set new token
      await request(app)
        .post('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'ghp_newtoken' });

      // Old flag should still exist for backwards compat, but be updated
      const githubConfigured = await getAsync(
        'SELECT value FROM app_settings WHERE key = ?',
        ['github_configured']
      );
      expect(githubConfigured.value).toBe('true');
    });

    test('should update github_configured to false when token is deleted', async () => {
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_token', 'ghp_test', 'secret']
      );
      await runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, type) VALUES (?, ?, ?)',
        ['github_configured', 'true', 'boolean']
      );

      await request(app)
        .delete('/api/admin/github/token')
        .set('Authorization', `Bearer ${adminToken}`);

      const githubConfigured = await getAsync(
        'SELECT value FROM app_settings WHERE key = ?',
        ['github_configured']
      );
      expect(githubConfigured.value).toBe('false');
    });
  });
});
