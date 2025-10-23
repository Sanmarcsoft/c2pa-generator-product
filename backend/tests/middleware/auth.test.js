const request = require('supertest');
const express = require('express');
const User = require('../../src/models/user');
const authService = require('../../src/services/authService');
const { initDatabase, runAsync } = require('../../src/models/database');
const requireAuth = require('../../src/middleware/requireAuth');
const requireAdmin = require('../../src/middleware/requireAdmin');

// Create a test Express app with test routes
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Test route for requireAuth middleware
  app.get('/api/test/protected', requireAuth, (req, res) => {
    res.status(200).json({
      message: 'Access granted',
      userId: req.user.id
    });
  });

  // Test route that returns the user object (to verify req.user attachment)
  app.get('/api/test/current-user', requireAuth, (req, res) => {
    res.status(200).json(req.user);
  });

  // Test route for requireAdmin middleware (requireAuth + requireAdmin)
  app.get('/api/test/admin-only', requireAuth, requireAdmin, (req, res) => {
    res.status(200).json({
      message: 'Admin access granted',
      userId: req.user.id
    });
  });

  return app;
}

describe('Authentication Middleware', () => {
  let app;

  // Initialize database and test app before all tests
  beforeAll(async () => {
    await initDatabase();
    app = createTestApp();
  });

  // Clean up database before each test
  beforeEach(async () => {
    await runAsync('DELETE FROM users');
  });

  /**
   * Helper function to create a test user and return user + token
   * @param {Object} options - User options
   * @param {string} options.role - User role (default: 'user')
   * @returns {Promise<{user: Object, token: string}>}
   */
  async function createTestUser(options = {}) {
    const { role = 'user' } = options;

    // Create user in database
    const user = await User.create({
      email: `test-${Date.now()}@example.com`,
      password: 'TestPass123!',
      name: 'Test User',
      role
    });

    // Generate token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { user, token };
  }

  /**
   * Test Suite 4.1: requireAuth Middleware
   */
  describe('requireAuth Middleware', () => {
    test('should allow request with valid token', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Access granted');
      expect(response.body.userId).toBeDefined();
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/test/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('authentication');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'Bearer invalid-token-format');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with expired token', async () => {
      const { user } = await createTestUser();

      // Generate token with 0 expiration
      const expiredToken = authService.generateToken(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        { expiresIn: '0s' }
      );

      // Wait a tiny bit to ensure token is expired
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('expired');
    });

    test('should reject request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with missing Bearer prefix', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', token); // Missing "Bearer " prefix

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should attach user to request object', async () => {
      const { user, token } = await createTestUser();

      const response = await request(app)
        .get('/api/test/current-user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(user.id);
      expect(response.body.email).toBe(user.email);
      expect(response.body.role).toBe(user.role);
      expect(response.body.password_hash).toBeUndefined(); // Should not expose hash
    });

    test('should reject request when user no longer exists in database', async () => {
      const { user, token } = await createTestUser();

      // Delete the user from database
      await User.delete(user.id);

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should handle token with valid format but invalid signature', async () => {
      // Create a fake token with proper JWT structure but invalid signature
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.invalid_signature';

      const response = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite 4.2: requireAdmin Middleware
   */
  describe('requireAdmin Middleware', () => {
    test('should allow admin user', async () => {
      const { token } = await createTestUser({ role: 'admin' });

      const response = await request(app)
        .get('/api/test/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Admin access granted');
    });

    test('should reject non-admin user', async () => {
      const { token } = await createTestUser({ role: 'user' });

      const response = await request(app)
        .get('/api/test/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/test/admin-only');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/test/admin-only')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject user with custom role (not admin)', async () => {
      // Manually create user with custom role
      const user = await User.create({
        email: 'moderator@example.com',
        password: 'TestPass123!',
        name: 'Moderator User',
        role: 'moderator'
      });

      const token = authService.generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      const response = await request(app)
        .get('/api/test/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should work correctly when requireAuth is bypassed (edge case)', async () => {
      // Create a test app without requireAuth to test requireAdmin in isolation
      const testApp = express();
      testApp.use(express.json());

      // Route with ONLY requireAdmin (no requireAuth)
      testApp.get('/api/test/admin-only-no-auth', requireAdmin, (req, res) => {
        res.status(200).json({ message: 'Should not reach here' });
      });

      const response = await request(testApp)
        .get('/api/test/admin-only-no-auth');

      // Should return 401 because req.user doesn't exist
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite 4.3: Middleware Integration
   */
  describe('Middleware Integration', () => {
    test('should work with both regular and admin users on same route', async () => {
      const { token: userToken } = await createTestUser({ role: 'user' });
      const { token: adminToken } = await createTestUser({ role: 'admin' });

      // Regular user can access protected route
      const userResponse = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${userToken}`);

      expect(userResponse.status).toBe(200);

      // Admin can also access protected route
      const adminResponse = await request(app)
        .get('/api/test/protected')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminResponse.status).toBe(200);
    });

    test('should preserve user object through middleware chain', async () => {
      const { user, token } = await createTestUser({ role: 'admin' });

      const response = await request(app)
        .get('/api/test/admin-only')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(user.id);
    });
  });
});
