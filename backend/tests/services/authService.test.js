const authService = require('../../src/services/authService');
const User = require('../../src/models/user');

describe('Authentication Service', () => {
  // Test Suite 2.1: Password Hashing (Wrapper around User model)
  describe('Password Hashing', () => {
    test('should hash password using bcrypt', async () => {
      const password = 'MySecurePassword123!';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are long
    });

    test('should verify correct password', async () => {
      const password = 'MySecurePassword123!';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const hash = await authService.hashPassword('correct');
      const isValid = await authService.verifyPassword('incorrect', hash);

      expect(isValid).toBe(false);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt should be different
    });
  });

  // Test Suite 2.2: JWT Token Management
  describe('JWT Token Management', () => {
    test('should generate valid JWT token', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = authService.generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    test('should include user data in token payload', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    test('should verify valid token', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user.id);
    });

    test('should reject invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid.token.here');
      }).toThrow('Invalid token');
    });

    test('should reject expired token', () => {
      // Generate token with 0 expiration
      const token = authService.generateToken(
        { id: '123' },
        { expiresIn: '0s' }
      );

      // Wait a tiny bit to ensure expiration
      expect(() => {
        authService.verifyToken(token);
      }).toThrow('Token expired');
    });

    test('should include expiration in token', () => {
      const token = authService.generateToken({ id: '123' });
      const decoded = authService.verifyToken(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    test('should use configurable expiration time', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };

      // Generate token with custom expiration (1 hour)
      const token = authService.generateToken(user, { expiresIn: '1h' });
      const decoded = authService.verifyToken(token);

      // Check that token expires in approximately 1 hour (3600 seconds)
      const expirationDuration = decoded.exp - decoded.iat;
      expect(expirationDuration).toBeCloseTo(3600, -2); // Allow 1% variance
    });

    test('should default to 7 days expiration', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);

      // 7 days = 604800 seconds
      const expirationDuration = decoded.exp - decoded.iat;
      expect(expirationDuration).toBeCloseTo(604800, -3); // Allow 0.1% variance
    });

    test('should reject malformed token', () => {
      expect(() => {
        authService.verifyToken('malformed-token-without-dots');
      }).toThrow('Invalid token');
    });

    test('should reject token with invalid signature', () => {
      const user = { id: '123', email: 'test@example.com', role: 'user' };
      const token = authService.generateToken(user);

      // Tamper with the token by changing the last character
      const tamperedToken = token.slice(0, -1) + 'X';

      expect(() => {
        authService.verifyToken(tamperedToken);
      }).toThrow('Invalid token');
    });

    test('should handle user objects with additional properties', () => {
      const user = {
        id: '123',
        email: 'test@example.com',
        role: 'admin',
        name: 'Test User',
        extraField: 'should not be in token'
      };

      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);

      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
      // Only id, email, role should be in token
      expect(decoded.name).toBeUndefined();
      expect(decoded.extraField).toBeUndefined();
    });
  });
});
