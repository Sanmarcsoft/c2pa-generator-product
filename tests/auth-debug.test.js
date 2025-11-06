/**
 * Debug test for authentication endpoint
 * This test is specifically designed to diagnose issues with the auth/register endpoint
 */

const request = require('supertest');
const app = require('../backend/src/app');
const { initDatabase, runAsync } = require('../backend/src/models/database');

describe('Auth Endpoint Debug Tests', () => {
  beforeAll(async () => {
    console.log('Initializing database for auth tests...');
    await initDatabase();
  });

  beforeEach(async () => {
    console.log('Cleaning up test users before each test...');
    await runAsync('DELETE FROM users WHERE email LIKE ?', ['%test.com']);
  });

  test('POST /api/auth/register - should return user with id', async () => {
    console.log('Starting auth register test...');

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'debug-test@test.com',
        password: 'SecurePass123!',
        name: 'Debug User'
      });

    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));

    // Check response structure
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();

    // Check user object
    expect(response.body.user).toBeDefined();
    console.log('User object:', JSON.stringify(response.body.user, null, 2));

    expect(response.body.user.id).toBeDefined();
    expect(response.body.user.email).toBe('debug-test@test.com');
    expect(response.body.user.name).toBe('Debug User');
    expect(response.body.user.password_hash).toBeUndefined();
  });

  test('POST /api/auth/register - check all user fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'fields-test@test.com',
        password: 'SecurePass123!',
        name: 'Fields User'
      });

    console.log('Full response:', JSON.stringify(response.body, null, 2));

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();

    const user = response.body.user;
    console.log('User fields:', Object.keys(user));

    expect(user.id).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.role).toBeDefined();
    expect(user.created_at).toBeDefined();
  });
});
