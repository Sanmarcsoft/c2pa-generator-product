const request = require('supertest');
const app = require('../../src/app');
const { initDatabase } = require('../../src/models/database');

describe('Settings Routes - Protected Routes', () => {
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
    await runAsync('DELETE FROM app_settings');

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
   * Test Suite: PUT /api/settings/:key - Update Setting (Admin Only)
   */
  describe('PUT /api/settings/:key', () => {
    test('should allow admin to update settings', async () => {
      const response = await request(app)
        .put('/api/settings/test_key')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 'test_value'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.key).toBe('test_key');
      expect(response.body.value).toBe('test_value');
    });

    test('should allow admin to update boolean settings', async () => {
      const response = await request(app)
        .put('/api/settings/feature_enabled')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.value).toBe(true);
    });

    test('should allow admin to update JSON settings', async () => {
      const jsonValue = { config: 'value', nested: { key: 'data' } };
      const response = await request(app)
        .put('/api/settings/json_config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: jsonValue
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.value).toEqual(jsonValue);
    });

    test('should reject regular user from updating settings', async () => {
      const response = await request(app)
        .put('/api/settings/test_key')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          value: 'test_value'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/settings/test_key')
        .send({
          value: 'test_value'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .put('/api/settings/test_key')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          value: 'test_value'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: POST /api/settings/onboarding/complete - Complete Onboarding (Admin Only)
   */
  describe('POST /api/settings/onboarding/complete', () => {
    test('should allow admin to complete onboarding', async () => {
      const response = await request(app)
        .post('/api/settings/onboarding/complete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          aiProvider: 'openai',
          openwebuiUrl: 'http://localhost:8080',
          githubConfigured: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('completed');
    });

    test('should allow admin to complete onboarding with minimal data', async () => {
      const response = await request(app)
        .post('/api/settings/onboarding/complete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should reject regular user from completing onboarding', async () => {
      const response = await request(app)
        .post('/api/settings/onboarding/complete')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          aiProvider: 'openai'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/settings/onboarding/complete')
        .send({
          aiProvider: 'openai'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: POST /api/settings/onboarding/reset - Reset Onboarding (Admin Only)
   */
  describe('POST /api/settings/onboarding/reset', () => {
    test('should allow admin to reset onboarding', async () => {
      // First complete onboarding
      await request(app)
        .post('/api/settings/onboarding/complete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      // Then reset it
      const response = await request(app)
        .post('/api/settings/onboarding/reset')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');
    });

    test('should reject regular user from resetting onboarding', async () => {
      const response = await request(app)
        .post('/api/settings/onboarding/reset')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('admin');
    });

    test('should reject unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/settings/onboarding/reset');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: Public Routes - Should remain accessible
   */
  describe('Public Settings Routes', () => {
    beforeEach(async () => {
      // Create some test settings
      const { runAsync } = require('../../src/models/database');
      await runAsync(`
        INSERT INTO app_settings (key, value, type)
        VALUES
          ('public_key', 'public_value', 'string'),
          ('feature_flag', 'true', 'boolean')
      `);
    });

    test('GET /api/settings should be accessible without auth', async () => {
      const response = await request(app)
        .get('/api/settings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.settings).toBeDefined();
      expect(typeof response.body.settings).toBe('object');
    });

    test('GET /api/settings/:key should be accessible without auth', async () => {
      const response = await request(app)
        .get('/api/settings/public_key');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.key).toBe('public_key');
      expect(response.body.value).toBe('public_value');
    });

    test('GET /api/settings/onboarding/status should be accessible without auth', async () => {
      const response = await request(app)
        .get('/api/settings/onboarding/status');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.onboardingCompleted).toBeDefined();
    });

    test('regular user should be able to read settings', async () => {
      const response = await request(app)
        .get('/api/settings')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  /**
   * Test Suite: Verify settings persist after admin updates
   */
  describe('Settings Persistence', () => {
    test('should persist setting after admin update', async () => {
      // Admin updates setting
      await request(app)
        .put('/api/settings/persistent_key')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 'persistent_value'
        });

      // Anyone can read it
      const response = await request(app)
        .get('/api/settings/persistent_key');

      expect(response.status).toBe(200);
      expect(response.body.value).toBe('persistent_value');
    });

    test('should update existing setting when admin modifies it', async () => {
      // Create initial setting
      await request(app)
        .put('/api/settings/update_test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 'initial_value'
        });

      // Update the setting
      await request(app)
        .put('/api/settings/update_test')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          value: 'updated_value'
        });

      // Verify update
      const response = await request(app)
        .get('/api/settings/update_test');

      expect(response.status).toBe(200);
      expect(response.body.value).toBe('updated_value');
    });
  });
});
