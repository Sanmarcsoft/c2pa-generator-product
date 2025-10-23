// Test setup file
// This runs before all tests

const path = require('path');
const fs = require('fs');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite::memory:'; // Use in-memory database for tests

// Mock logger to reduce noise in tests
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// Clean up test database after all tests
afterAll(() => {
  const testDbPath = path.join(__dirname, '../../../data/test.db');
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

// Global test utilities
global.testUtils = {
  // Helper to create test user data
  createUserData: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
    ...overrides
  })
};
