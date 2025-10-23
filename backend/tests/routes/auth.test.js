const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user');
const { initDatabase } = require('../../src/models/database');

describe('Authentication Routes', () => {
  // Initialize database before all tests
  beforeAll(async () => {
    await initDatabase();
  });

  // Clean up database before each test
  beforeEach(async () => {
    // Delete all users by directly running SQL
    const { runAsync } = require('../../src/models/database');
    await runAsync('DELETE FROM users');
  });

  /**
   * Test Suite 3.1: Registration Endpoint
   */
  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('newuser@example.com');
      expect(response.body.user.name).toBe('New User');
      expect(response.body.user.role).toBe('user');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password_hash).toBeUndefined(); // Should not expose hash
    });

    test('should register user without name (optional field)', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'noname@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('noname@example.com');
      expect(response.body.token).toBeDefined();
    });

    test('should reject registration with existing email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'SecurePass123!'
        });

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'DifferentPass456!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('already exists');
    });

    test('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('email');
    });

    test('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('password');
    });

    test('should reject registration with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('required');
    });

    test('should reject registration with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('required');
    });
  });

  /**
   * Test Suite 3.2: Login Endpoint
   */
  describe('POST /api/auth/login', () => {
    // Create test user before each login test
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!',
          name: 'Login User'
        });
    });

    test('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.user.name).toBe('Login User');
      expect(response.body.user.password_hash).toBeUndefined(); // Should not expose hash
    });

    test('should reject login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'WrongPassword!'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('invalid');
    });

    test('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('invalid');
    });

    test('should update last_login timestamp on successful login', async () => {
      // Login
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'SecurePass123!'
        });

      // Verify last_login was updated
      const user = await User.findByEmail('login@example.com');
      expect(user.last_login).toBeDefined();
      expect(user.last_login).not.toBeNull();
    });

    test('should reject login with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'SecurePass123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    test('should reject login with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite 3.3: Current User Endpoint
   */
  describe('GET /api/auth/me', () => {
    let token;
    let userId;

    // Create test user and get token before each test
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'me@example.com',
          password: 'SecurePass123!',
          name: 'Me User'
        });

      token = response.body.token;
      userId = response.body.user.id;
    });

    test('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('me@example.com');
      expect(response.body.name).toBe('Me User');
      expect(response.body.role).toBe('user');
      expect(response.body.password_hash).toBeUndefined(); // Should not expose hash
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token-here');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request with missing Bearer prefix', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', token); // Missing "Bearer " prefix

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
