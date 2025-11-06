module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'backend/src/**/*.js',
    '!backend/src/**/*.test.js',
    '!backend/src/**/*.spec.js',
    '!**/node_modules/**',
  ],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/'
  ],
  moduleNameMapper: {
    '^uuid$': require.resolve('uuid')
  },
  transformIgnorePatterns: [
    'node_modules/(?!(uuid)/)'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000
};
