/**
 * Jest Test Setup for Frontend
 * Runs before all tests
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia (required for some UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch globally
global.fetch = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.fetch.mockClear();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Test utilities
global.testUtils = {
  // Helper to create mock session
  createMockSession: (overrides = {}) => ({
    id: 'test-session-1',
    userId: 'test-user-1',
    title: 'Test Session',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    messageCount: 0,
    ...overrides
  }),

  // Helper to create mock message
  createMockMessage: (overrides = {}) => ({
    id: 'test-message-1',
    sender: 'user',
    message: 'Test message',
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    ...overrides
  })
};
