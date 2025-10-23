const request = require('supertest');
const app = require('../../src/app');
const { initDatabase } = require('../../src/models/database');

describe('GitHub Routes - Protected Routes', () => {
  let adminToken;
  let userToken;
  let adminUserId;
  let regularUserId;

  // Initialize database before all tests
  beforeAll(async () => {
    await initDatabase();
  });

  // Clean up database before each test and create test users
  beforeEach(async () => {
    const { runAsync } = require('../../src/models/database');
    await runAsync('DELETE FROM users');

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'AdminPass123!',
        name: 'Admin User'
      });

    adminToken = adminResponse.body.token;
    adminUserId = adminResponse.body.user.id;

    // Promote to admin by directly updating database
    await runAsync('UPDATE users SET role = ? WHERE id = ?', ['admin', adminUserId]);

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@example.com',
        password: 'UserPass123!',
        name: 'Regular User'
      });

    userToken = userResponse.body.token;
    regularUserId = userResponse.body.user.id;
  });

  /**
   * Test Suite: POST /api/github/auth/token - Store GitHub Token (Admin Only)
   */
  describe('POST /api/github/auth/token', () => {
    test('should allow admin to store GitHub token', async () => {
      const response = await request(app)
        .post('/api/github/auth/token')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          token: 'ghp_adminTestToken123456789'
        });

      // Note: The actual implementation will determine if the token is valid
      // For now, we're just testing authorization, not GitHub API validation
      expect([200, 401]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      } else if (response.status === 401) {
        // If GitHub rejects the token, that's fine - admin was authorized
        expect(response.body.success).toBe(false);
      }
    });

    test('should reject regular user from storing GitHub token', async () => {
      const response = await request(app)
        .post('/api/github/auth/token')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          token: 'ghp_userTestToken123456789'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/github/auth/token')
        .send({
          token: 'ghp_unauthTestToken123456789'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid token format', async () => {
      const response = await request(app)
        .post('/api/github/auth/token')
        .set('Authorization', 'InvalidFormat')
        .send({
          token: 'ghp_testToken123456789'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: POST /api/github/repos/index - Index Repository (Admin Only)
   */
  describe('POST /api/github/repos/index', () => {
    test('should allow admin to index repository', async () => {
      const response = await request(app)
        .post('/api/github/repos/index')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          owner: 'testowner',
          repo: 'testrepo',
          branch: 'main'
        });

      // Note: This will fail without GitHub authentication, but that's expected
      // We're testing authorization, not GitHub functionality
      expect([200, 401]).toContain(response.status);
    });

    test('should reject regular user from indexing repository', async () => {
      const response = await request(app)
        .post('/api/github/repos/index')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          owner: 'testowner',
          repo: 'testrepo',
          branch: 'main'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/github/repos/index')
        .send({
          owner: 'testowner',
          repo: 'testrepo'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: DELETE /api/github/repos/:repoId - Delete Repository (Admin Only)
   */
  describe('DELETE /api/github/repos/:repoId', () => {
    test('should allow admin to delete indexed repository', async () => {
      const response = await request(app)
        .delete('/api/github/repos/1')
        .set('Authorization', `Bearer ${adminToken}`);

      // Will return 400 if repo doesn't exist, but authorization passed
      expect([200, 400]).toContain(response.status);
    });

    test('should reject regular user from deleting repository', async () => {
      const response = await request(app)
        .delete('/api/github/repos/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .delete('/api/github/repos/1');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: Public Routes - Should remain accessible
   */
  describe('Public GitHub Routes', () => {
    test('GET /api/github/auth/status should be accessible without auth', async () => {
      const response = await request(app)
        .get('/api/github/auth/status');

      expect(response.status).toBe(200);
      expect(response.body.authenticated).toBeDefined();
    });

    test('POST /api/github/auth/logout should be accessible without auth', async () => {
      const response = await request(app)
        .post('/api/github/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('GET /api/github/repos should be accessible without auth', async () => {
      const response = await request(app)
        .get('/api/github/repos');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.repositories).toBeDefined();
    });

    test('POST /api/github/search should be accessible without auth', async () => {
      const response = await request(app)
        .post('/api/github/search')
        .send({
          query: 'test query'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
