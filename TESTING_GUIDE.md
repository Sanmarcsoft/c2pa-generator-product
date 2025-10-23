# Testing Guide - Chat Session Persistence

## Quick Start

### Backend Tests
```bash
cd backend
npm install                    # Install dependencies
npm test                       # Run all tests
```

### Frontend Tests
```bash
cd frontend
npm install                    # Install dependencies (includes test dependencies)
npm test                       # Run all tests
```

---

## Expected Test Status

⚠️ **IMPORTANT**: These tests follow TDD (Test-Driven Development) principles.

**Current Status**: 🔴 **ALL TESTS WILL FAIL**

This is expected and correct! The tests were written BEFORE implementation to define the expected behavior.

**After Implementation**: 🟢 **ALL TESTS SHOULD PASS**

---

## Test Commands Reference

### Backend Testing

#### Run All Tests
```bash
npm test
```

#### Run Specific Test File
```bash
npm test -- sessions.test.js          # Unit tests
npm test -- chat-api.test.js          # Integration tests
```

#### Run Tests in Watch Mode
```bash
npm test -- --watch
```

#### Generate Coverage Report
```bash
npm test -- --coverage
```

#### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Session Creation"
```

#### Verbose Output
```bash
npm test -- --verbose
```

---

### Frontend Testing

#### Run All Tests
```bash
npm test
```

#### Run Specific Test File
```bash
npm test -- ChatPage.test.jsx
```

#### Run Tests in Watch Mode
```bash
npm test:watch
```

#### Generate Coverage Report
```bash
npm test:coverage
```

#### Update Snapshots (if using)
```bash
npm test -- -u
```

---

## Test Files Overview

### Backend Tests

#### `/backend/tests/sessions.test.js`
**Purpose**: Unit tests for session management
**Test Count**: 35 tests
**Coverage**:
- Session creation and defaults
- Session retrieval and filtering
- Message-to-session association
- Session updates
- Session archival
- Foreign key constraints
- Security isolation

**Run Command**:
```bash
npm test -- sessions.test.js
```

#### `/backend/tests/chat-api.test.js`
**Purpose**: Integration tests for chat API endpoints
**Test Count**: 46 tests
**Coverage**:
- POST /api/chat
- GET /api/chat/sessions
- POST /api/chat/sessions
- GET /api/chat/sessions/:id
- PATCH /api/chat/sessions/:id
- DELETE /api/chat/sessions/:id
- GET /api/chat/history
- Error handling
- Session limits

**Run Command**:
```bash
npm test -- chat-api.test.js
```

---

### Frontend Tests

#### `/frontend/src/tests/ChatPage.test.jsx`
**Purpose**: Component tests for ChatPage with session persistence
**Test Count**: 31 tests
**Coverage**:
- Session loading on mount
- Sending messages
- Session persistence across remounts
- Message display
- Error handling
- Session title display
- Keyboard shortcuts
- Authentication integration

**Run Command**:
```bash
npm test -- ChatPage.test.jsx
```

---

## Test Configuration

### Backend (`/backend/jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  maxWorkers: 1  // Sequential execution for database tests
}
```

### Frontend (`/frontend/jest.config.js`)
```javascript
{
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.jsx'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
}
```

---

## Test Database

### Backend
- Uses **in-memory SQLite** for tests
- Database reset before each test
- No persistent test data
- Configured in `/backend/tests/setup.js`

### Environment Variables
```bash
NODE_ENV=test
DATABASE_URL=sqlite::memory:
```

---

## Coverage Thresholds

### Backend
Target: **80%+ coverage** for new code

### Frontend
Target: **70%+ coverage** for components
```javascript
coverageThresholds: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

---

## Troubleshooting

### Tests Hang or Don't Complete

**Problem**: Tests run but never complete
**Solution**: Check for async operations without proper cleanup
```bash
npm test -- --detectOpenHandles
```

### Database Lock Errors

**Problem**: SQLITE_BUSY errors
**Solution**: Tests run sequentially (maxWorkers: 1)
```bash
# Already configured in jest.config.js
maxWorkers: 1
```

### Module Not Found Errors

**Problem**: Cannot find module '@testing-library/react'
**Solution**: Install dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Frontend Tests Fail with "window is not defined"

**Problem**: Tests run in Node environment instead of jsdom
**Solution**: Verify jest.config.js has correct testEnvironment
```javascript
testEnvironment: 'jsdom'  // Frontend
testEnvironment: 'node'   // Backend
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test -- --coverage

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test -- --coverage
```

---

## Test Development Workflow

### TDD Cycle (Red → Green → Refactor)

#### 1. Red Phase (Current)
✅ Tests written and failing (expected)
```bash
npm test  # Should see failures
```

#### 2. Green Phase (Implementation)
🔨 Write minimum code to make tests pass
```bash
npm test -- --watch  # Watch mode during development
```

#### 3. Refactor Phase (Optimization)
🔧 Improve code quality while keeping tests green
```bash
npm test  # Verify tests still pass after refactoring
```

---

## Best Practices

### Writing New Tests

1. **Follow AAA Pattern**
   - **Arrange**: Set up test data
   - **Act**: Execute the function/endpoint
   - **Assert**: Verify the result

2. **Test Isolation**
   - Each test should be independent
   - Use beforeEach for setup
   - Clean up in afterEach

3. **Descriptive Names**
   ```javascript
   test('should create new session with auto-generated UUID', async () => {
     // Test implementation
   });
   ```

4. **Test One Thing**
   - Each test should verify one behavior
   - Multiple assertions OK if testing same behavior

### Running Tests During Development

#### Backend
```bash
# Terminal 1: Run backend server
npm run dev

# Terminal 2: Run tests in watch mode
npm test -- --watch
```

#### Frontend
```bash
# Terminal 1: Run frontend dev server
npm run dev

# Terminal 2: Run tests in watch mode
npm test:watch
```

---

## Test Data Helpers

### Backend (`/backend/tests/setup.js`)
```javascript
global.testUtils = {
  createUserData: (overrides = {}) => ({
    email: 'test@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
    ...overrides
  })
};
```

### Frontend (`/frontend/src/tests/setup.js`)
```javascript
global.testUtils = {
  createMockSession: (overrides = {}) => ({ /* ... */ }),
  createMockMessage: (overrides = {}) => ({ /* ... */ }),
  createMockUser: (overrides = {}) => ({ /* ... */ })
};
```

---

## Debugging Tests

### Enable Debug Output
```bash
DEBUG=* npm test
```

### Run Single Test
```bash
npm test -- --testNamePattern="should create new session"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## Performance Testing

### Backend Load Test
```bash
# Install Apache Bench
brew install httpd  # macOS
apt-get install apache2-utils  # Linux

# Run load test
ab -n 1000 -c 100 -H "Authorization: Bearer TOKEN" \
   -p message.json -T application/json \
   http://localhost:3000/api/chat
```

### Measure Test Execution Time
```bash
time npm test
```

---

## Documentation Links

- **Architecture**: `/backend/docs/session-persistence-architecture.md`
- **Test Summary**: `/backend/tests/TEST_SUMMARY.md`
- **API Documentation**: (To be created during implementation)

---

## Support

For questions or issues with tests:
1. Check this guide first
2. Review test file comments
3. Check architecture documentation
4. Review TEST_SUMMARY.md for test specifications

---

**Last Updated**: 2025-10-21
**Version**: 1.0
**Status**: Tests Complete - Ready for Implementation
