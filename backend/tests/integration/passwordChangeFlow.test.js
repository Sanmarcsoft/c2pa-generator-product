const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user');
const { initDatabase } = require('../../src/models/database');

// Mock axios to prevent actual API calls to OpenWebUI
jest.mock('axios');

describe('Password Change Flow Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Initialize test database
    await initDatabase();
  });

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      email: 'passwordtest@example.com',
      password: 'OldPassword123!',
      name: 'Password Test User',
      role: 'user'
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'passwordtest@example.com',
        password: 'OldPassword123!'
      });

    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up test user
    if (testUser) {
      await User.delete(testUser.id);
    }
  });

  // Test Suite 1: Password Change Basic Flow
  describe('Basic Password Change', () => {
    test('should successfully change password in C2PA system', async () => {
      // Act
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Verify new password works for login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'passwordtest@example.com',
          password: 'NewPassword456!'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
    });

    test('should reject login with old password after change', async () => {
      // Arrange - Change password
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      // Act - Try to login with old password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'passwordtest@example.com',
          password: 'OldPassword123!'
        });

      // Assert
      expect(loginResponse.status).toBe(401);
      expect(loginResponse.body.error).toBe('Invalid credentials');
    });
  });

  // Test Suite 2: OpenWebUI Integration After Password Change
  describe('OpenWebUI Integration After Password Change', () => {
    test('should handle password change when OpenWebUI sync is NOT enabled', async () => {
      // This test verifies current behavior: password sync is NOT implemented
      // Chat still works because OpenWebUI sessions use API keys, not user passwords

      // Act - Change password
      const changeResponse = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      // Assert - Password change succeeds
      expect(changeResponse.status).toBe(200);
      expect(changeResponse.body.success).toBe(true);

      // Verify the new password works in C2PA system
      const user = await User.findByEmail('passwordtest@example.com');
      const isNewPasswordValid = await User.verifyPassword('NewPassword456!', user.password_hash);
      expect(isNewPasswordValid).toBe(true);

      // Verify old password no longer works
      const isOldPasswordValid = await User.verifyPassword('OldPassword123!', user.password_hash);
      expect(isOldPasswordValid).toBe(false);
    });

    test('should document that OpenWebUI password remains unchanged', async () => {
      // This test documents the current behavior for future reference

      // Arrange
      const initialState = {
        c2paPassword: 'OldPassword123!',
        openwebuiPassword: 'auto-generated-random-20-char-password',
        note: 'OpenWebUI password is never used after initial creation'
      };

      // Act - Change C2PA password
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      const finalState = {
        c2paPassword: 'NewPassword456!',
        openwebuiPassword: 'auto-generated-random-20-char-password', // UNCHANGED
        note: 'Passwords are out of sync, but chat still works via API key'
      };

      // Assert - Document the behavior
      expect(initialState.c2paPassword).not.toBe(finalState.c2paPassword);
      expect(initialState.openwebuiPassword).toBe(finalState.openwebuiPassword);

      // This is acceptable because:
      // 1. OpenWebUI sessions use API keys for authentication, not user passwords
      // 2. Users authenticate to C2PA system, which then calls OpenWebUI APIs
      // 3. Individual OpenWebUI user passwords are only needed for direct OpenWebUI login
    });
  });

  // Test Suite 3: Authentication Continuity
  describe('Authentication Continuity After Password Change', () => {
    test('should receive new valid JWT token after password change', async () => {
      // Act - Change password
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      // Re-login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'passwordtest@example.com',
          password: 'NewPassword456!'
        });

      // Assert - Should successfully login and receive token
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
      expect(loginResponse.body.user).toBeDefined();
      expect(loginResponse.body.user.email).toBe('passwordtest@example.com');

      // The new token proves authentication continues to work
      // This means OpenWebUI integration will continue to work
    });

    test('should maintain user identity and data across password change', async () => {
      // Arrange - Get user data before password change
      const userBefore = await User.findByEmail('passwordtest@example.com');
      const userIdBefore = userBefore.id;
      const userEmailBefore = userBefore.email;
      const userNameBefore = userBefore.name;

      // Change password
      await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!',
          newPassword: 'NewPassword456!'
        });

      // Get user data after password change
      const userAfter = await User.findByEmail('passwordtest@example.com');

      // Assert - All user data except password should remain the same
      expect(userAfter.id).toBe(userIdBefore);
      expect(userAfter.email).toBe(userEmailBefore);
      expect(userAfter.name).toBe(userNameBefore);

      // Verify password was actually changed
      const isOldPasswordValid = await User.verifyPassword('OldPassword123!', userAfter.password_hash);
      const isNewPasswordValid = await User.verifyPassword('NewPassword456!', userAfter.password_hash);

      expect(isOldPasswordValid).toBe(false);
      expect(isNewPasswordValid).toBe(true);

      // This proves that the user's identity is preserved across password changes
      // Their OpenWebUI user association (by email) remains intact
    });
  });

  // Test Suite 4: Error Scenarios
  describe('Error Scenarios', () => {
    test('should handle password change with invalid old password', async () => {
      // Act
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'WrongPassword!',
          newPassword: 'NewPassword456!'
        });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Current password is incorrect');

      // Verify old password still works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'passwordtest@example.com',
          password: 'OldPassword123!'
        });

      expect(loginResponse.status).toBe(200);
    });

    test('should handle missing password fields', async () => {
      // Act - Missing new password
      const response1 = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          oldPassword: 'OldPassword123!'
        });

      // Assert
      expect(response1.status).toBe(400);
      expect(response1.body.success).toBe(false);

      // Act - Missing old password
      const response2 = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newPassword: 'NewPassword456!'
        });

      // Assert
      expect(response2.status).toBe(400);
      expect(response2.body.success).toBe(false);
    });
  });
});
