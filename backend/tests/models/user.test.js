const { initDatabase } = require('../../src/models/database');
const User = require('../../src/models/user');
const { v4: uuidv4 } = require('uuid');

describe('User Database Schema', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    // Clean up users table after each test
    const { runAsync } = require('../../src/models/database');
    await runAsync('DELETE FROM users');
  });

  test('should create users table with correct schema', async () => {
    // Verify table exists by attempting to insert and retrieve
    const user = await User.create({
      email: 'schema@example.com',
      password: 'SecurePass123!'
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe('schema@example.com');
    expect(user.password_hash).toBeDefined();
    expect(user.role).toBe('user');
    expect(user.created_at).toBeDefined();
  });

  test('should enforce email uniqueness constraint', async () => {
    // Create first user
    await User.create({
      email: 'unique@example.com',
      password: 'pass123456'
    });

    // Try to create second user with same email
    await expect(
      User.create({
        email: 'unique@example.com',
        password: 'pass456789'
      })
    ).rejects.toThrow('Email already exists');
  });

  test('should set default role to "user"', async () => {
    const user = await User.create({
      email: 'defaultrole@example.com',
      password: 'pass123456'
    });

    expect(user.role).toBe('user');
  });
});

describe('User Model', () => {
  beforeAll(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    // Clean up users table after each test
    const { runAsync } = require('../../src/models/database');
    await runAsync('DELETE FROM users');
  });

  describe('createUser', () => {
    test('should create a new user with hashed password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      };
      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe(userData.password); // Should be hashed
      expect(user.role).toBe('user');
      expect(user.name).toBe('Test User');
    });

    test('should reject user creation with duplicate email', async () => {
      await User.create({ email: 'test@example.com', password: 'pass123456' });

      await expect(
        User.create({ email: 'test@example.com', password: 'pass456789' })
      ).rejects.toThrow('Email already exists');
    });

    test('should reject user creation with invalid email', async () => {
      await expect(
        User.create({ email: 'invalid-email', password: 'pass123456' })
      ).rejects.toThrow('Invalid email format');
    });

    test('should reject weak passwords', async () => {
      await expect(
        User.create({ email: 'test@example.com', password: '123' })
      ).rejects.toThrow('Password must be at least 8 characters');
    });

    test('should reject missing email', async () => {
      await expect(
        User.create({ password: 'pass123456' })
      ).rejects.toThrow('Email is required');
    });

    test('should reject missing password', async () => {
      await expect(
        User.create({ email: 'test@example.com' })
      ).rejects.toThrow('Password is required');
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      await User.create({ email: 'find@example.com', password: 'pass123456' });
      const user = await User.findByEmail('find@example.com');

      expect(user).toBeDefined();
      expect(user.email).toBe('find@example.com');
    });

    test('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('findById', () => {
    test('should find user by ID', async () => {
      const created = await User.create({
        email: 'id@example.com',
        password: 'pass123456'
      });
      const user = await User.findById(created.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(created.id);
      expect(user.email).toBe('id@example.com');
    });

    test('should return null for non-existent ID', async () => {
      const user = await User.findById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('updateUser', () => {
    test('should update user name', async () => {
      const user = await User.create({
        email: 'update@example.com',
        password: 'pass123456'
      });
      await User.update(user.id, { name: 'Updated Name' });

      const updated = await User.findById(user.id);
      expect(updated.name).toBe('Updated Name');
    });

    test('should update user email', async () => {
      const user = await User.create({
        email: 'original@example.com',
        password: 'pass123456'
      });
      await User.update(user.id, { email: 'newemail@example.com' });

      const updated = await User.findById(user.id);
      expect(updated.email).toBe('newemail@example.com');
    });

    test('should not allow updating email to existing email', async () => {
      await User.create({ email: 'user1@example.com', password: 'pass123456' });
      const user2 = await User.create({ email: 'user2@example.com', password: 'pass123456' });

      await expect(
        User.update(user2.id, { email: 'user1@example.com' })
      ).rejects.toThrow('Email already exists');
    });

    test('should update user role', async () => {
      const user = await User.create({
        email: 'roleupdate@example.com',
        password: 'pass123456'
      });
      await User.update(user.id, { role: 'admin' });

      const updated = await User.findById(user.id);
      expect(updated.role).toBe('admin');
    });
  });

  describe('updateLastLogin', () => {
    test('should update last_login timestamp', async () => {
      const user = await User.create({
        email: 'login@example.com',
        password: 'pass123456'
      });

      // Wait a moment to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      await User.updateLastLogin(user.id);

      const updated = await User.findById(user.id);
      expect(updated.last_login).toBeDefined();
      expect(updated.last_login).not.toBeNull();
    });
  });

  describe('deleteUser', () => {
    test('should delete user by ID', async () => {
      const user = await User.create({
        email: 'delete@example.com',
        password: 'pass123456'
      });
      await User.delete(user.id);

      const deleted = await User.findById(user.id);
      expect(deleted).toBeNull();
    });

    test('should return true when deleting existing user', async () => {
      const user = await User.create({
        email: 'exists@example.com',
        password: 'pass123456'
      });
      const result = await User.delete(user.id);
      expect(result).toBe(true);
    });

    test('should return false when deleting non-existent user', async () => {
      const result = await User.delete('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
