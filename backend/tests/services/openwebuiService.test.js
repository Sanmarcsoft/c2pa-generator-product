const axios = require('axios');
const openwebuiService = require('../../src/services/openwebuiService');
const { getSecret } = require('../../src/utils/secrets');

// Mock axios for HTTP requests
jest.mock('axios');

// Mock secrets utility
jest.mock('../../src/utils/secrets', () => ({
  getSecret: jest.fn()
}));

describe('OpenWebUI Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Set up default secret mocks
    getSecret.mockImplementation((key) => {
      const secrets = {
        'OPENWEBUI_URL': 'https://openwebui.test.com/api',
        'OPENWEBUI_API_KEY': 'test-api-key-123'
      };
      return secrets[key];
    });
  });

  // Test Suite 1: User Creation
  describe('createOpenWebUIUser', () => {
    test('should successfully create user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      };

      const mockResponse = {
        data: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          profile_image_url: ''
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      // Act
      const result = await openwebuiService.createOpenWebUIUser(
        userData.email,
        userData.name,
        userData.password
      );

      // Assert
      expect(result).toEqual({
        success: true,
        userId: 'user-123',
        email: 'test@example.com'
      });

      expect(axios.post).toHaveBeenCalledWith(
        'https://openwebui.test.com/api/v1/auths/signup',
        {
          email: userData.email,
          name: userData.name,
          password: userData.password
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          timeout: 10000
        })
      );
    });

    test('should handle user already exists error', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'SecurePass123!'
      };

      axios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { detail: 'Email already exists' }
        }
      });

      // Act
      const result = await openwebuiService.createOpenWebUIUser(
        userData.email,
        userData.name,
        userData.password
      );

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'User already exists',
        alreadyExists: true
      });
    });

    test('should handle network errors gracefully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      };

      axios.post.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await openwebuiService.createOpenWebUIUser(
        userData.email,
        userData.name,
        userData.password
      );

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Failed to create OpenWebUI user'
      });
    });

    test('should validate required fields', async () => {
      // Act & Assert
      await expect(
        openwebuiService.createOpenWebUIUser('', 'Name', 'pass')
      ).rejects.toThrow('Email is required');

      await expect(
        openwebuiService.createOpenWebUIUser('test@test.com', '', 'pass')
      ).rejects.toThrow('Name is required');

      await expect(
        openwebuiService.createOpenWebUIUser('test@test.com', 'Name', '')
      ).rejects.toThrow('Password is required');
    });

    test('should use configured OpenWebUI URL from secrets', async () => {
      // Arrange
      const customUrl = 'https://custom.openwebui.com/api';
      getSecret.mockImplementation((key) => {
        if (key === 'OPENWEBUI_URL') return customUrl;
        if (key === 'OPENWEBUI_API_KEY') return 'test-key';
        return null;
      });

      axios.post.mockResolvedValue({
        data: { id: 'user-123', email: 'test@example.com', name: 'Test' }
      });

      // Act
      await openwebuiService.createOpenWebUIUser(
        'test@example.com',
        'Test User',
        'SecurePass123!'
      );

      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        `${customUrl}/v1/auths/signup`,
        expect.any(Object),
        expect.any(Object)
      );
    });
  });

  // Test Suite 2: Check User Exists
  describe('checkOpenWebUIUserExists', () => {
    test('should return true when user exists', async () => {
      // Arrange
      const email = 'existing@example.com';

      axios.get.mockResolvedValue({
        data: {
          id: 'user-123',
          email: email,
          name: 'Existing User'
        }
      });

      // Act
      const exists = await openwebuiService.checkOpenWebUIUserExists(email);

      // Assert
      expect(exists).toBe(true);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/users/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key-123'
          })
        })
      );
    });

    test('should return false when user does not exist', async () => {
      // Arrange
      const email = 'nonexistent@example.com';

      axios.get.mockRejectedValue({
        response: {
          status: 404,
          data: { detail: 'User not found' }
        }
      });

      // Act
      const exists = await openwebuiService.checkOpenWebUIUserExists(email);

      // Assert
      expect(exists).toBe(false);
    });

    test('should handle network errors when checking user', async () => {
      // Arrange
      const email = 'test@example.com';

      axios.get.mockRejectedValue(new Error('Network error'));

      // Act
      const exists = await openwebuiService.checkOpenWebUIUserExists(email);

      // Assert
      expect(exists).toBe(false);
    });
  });

  // Test Suite 3: Auto-Create User Flow
  describe('ensureOpenWebUIUser', () => {
    test('should skip creation if user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'SecurePass123!'
      };

      // Mock: User exists
      axios.get.mockResolvedValue({
        data: { id: 'user-123', email: userData.email }
      });

      // Act
      const result = await openwebuiService.ensureOpenWebUIUser(
        userData.email,
        userData.name,
        userData.password
      );

      // Assert
      expect(result).toEqual({
        success: true,
        alreadyExists: true,
        message: 'User already exists in OpenWebUI'
      });

      // Should not call create endpoint
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('should create user if does not exist', async () => {
      // Arrange
      const userData = {
        email: 'new@example.com',
        name: 'New User',
        password: 'SecurePass123!'
      };

      // Mock: User does not exist
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      // Mock: Successful creation
      axios.post.mockResolvedValue({
        data: {
          id: 'new-user-456',
          email: userData.email,
          name: userData.name
        }
      });

      // Act
      const result = await openwebuiService.ensureOpenWebUIUser(
        userData.email,
        userData.name,
        userData.password
      );

      // Assert
      expect(result).toEqual({
        success: true,
        created: true,
        userId: 'new-user-456',
        email: userData.email
      });

      expect(axios.get).toHaveBeenCalled();
      expect(axios.post).toHaveBeenCalled();
    });

    test('should handle errors during auto-creation', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!'
      };

      // Mock: User check returns false (doesn't exist)
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      // Mock: User creation also fails
      axios.post.mockRejectedValue(new Error('Service unavailable'));

      // Act
      const result = await openwebuiService.ensureOpenWebUIUser(
        userData.email,
        userData.name,
        userData.password
      );

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Failed to create OpenWebUI user'
      });
    });
  });

  // Test Suite 4: Generate Secure Password
  describe('generateSecurePassword', () => {
    test('should generate password of correct length', () => {
      // Act
      const password = openwebuiService.generateSecurePassword(16);

      // Assert
      expect(password).toBeDefined();
      expect(password.length).toBe(16);
    });

    test('should generate different passwords each time', () => {
      // Act
      const password1 = openwebuiService.generateSecurePassword(12);
      const password2 = openwebuiService.generateSecurePassword(12);

      // Assert
      expect(password1).not.toBe(password2);
    });

    test('should include required character types', () => {
      // Act
      const password = openwebuiService.generateSecurePassword(20);

      // Assert
      expect(password).toMatch(/[A-Z]/); // uppercase
      expect(password).toMatch(/[a-z]/); // lowercase
      expect(password).toMatch(/[0-9]/); // number
      expect(password).toMatch(/[!@#$%^&*]/); // special char
    });

    test('should use default length of 16 if not specified', () => {
      // Act
      const password = openwebuiService.generateSecurePassword();

      // Assert
      expect(password.length).toBe(16);
    });
  });
});
