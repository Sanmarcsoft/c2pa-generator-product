# Contributing Guide

Thank you for your interest in contributing to the C2PA Generator Product Certification Assistant!

This document provides guidelines for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Making Changes](#making-changes)
5. [Testing](#testing)
6. [Submitting Changes](#submitting-changes)
7. [Coding Standards](#coding-standards)
8. [Project Structure](#project-structure)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js >= 20.0.0
- npm >= 9.0.0
- Docker Desktop
- Git
- A GitHub account
- Familiarity with JavaScript/React
- Understanding of the C2PA certification process (helpful)

### Finding Issues to Work On

1. **Check the Issues Page**
   - Look for issues labeled `good first issue`
   - Check for `help wanted` labels
   - Comment on issues you want to work on

2. **Reporting Bugs**
   - Search existing issues first
   - Use the bug report template
   - Provide detailed reproduction steps
   - Include screenshots if applicable
   - Specify your environment

3. **Requesting Features**
   - Search existing feature requests
   - Use the feature request template
   - Explain the use case
   - Describe expected behavior

---

## Development Setup

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then:
git clone https://github.com/YOUR_USERNAME/c2pa-generator-product.git
cd c2pa-generator-product
```

### 2. Add Upstream Remote

```bash
git remote add upstream https://github.com/smsmatt/c2pa-generator-product.git
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm run install:all

# Or individually
npm run install:backend
npm run install:frontend
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 5. Start Development Environment

#### Option A: Docker (Recommended)
```bash
npm start
```

#### Option B: Local Development
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Verify Setup

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- API Health: `http://localhost:8080/health`

---

## Making Changes

### 1. Create a Branch

```bash
# Always branch from main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed
- Write tests for new features

### 3. Test Your Changes

```bash
# Run linters
npm run lint

# Run tests
npm test

# Test Docker build
docker-compose up --build
```

### 4. Commit Your Changes

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add document filtering feature

- Add filter dropdown to documents page
- Implement category-based filtering
- Update API to support filter parameter
- Add tests for filter functionality"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

---

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# All tests
npm test
```

### Writing Tests

#### Backend Tests (Jest)

```javascript
// backend/src/services/__tests__/aiService.test.js
const { generateResponse } = require('../aiService');

describe('AIService', () => {
  test('generates response for user message', async () => {
    const response = await generateResponse('Hello');
    expect(response).toHaveProperty('message');
    expect(response.message).toBeTruthy();
  });
});
```

#### Frontend Tests (React Testing Library)

```javascript
// frontend/src/components/__tests__/Header.test.jsx
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

test('renders navigation links', () => {
  render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );

  expect(screen.getByText('HOME')).toBeInTheDocument();
  expect(screen.getByText('CHAT')).toBeInTheDocument();
});
```

### Test Coverage

Aim for:
- 80%+ code coverage
- All critical paths tested
- Edge cases covered
- Error handling tested

---

## Submitting Changes

### 1. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 2. Create Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your branch
4. Fill out the PR template:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

### 3. PR Title Format

```
[Type] Brief description

Examples:
[Feature] Add document filtering
[Fix] Resolve chat scroll issue
[Docs] Update API documentation
```

### 4. PR Checklist

Before submitting, ensure:
- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors
- [ ] Docker build succeeds
- [ ] Commits are clean and descriptive

### 5. Code Review Process

- Maintainers will review your PR
- Address any requested changes
- Update your branch if needed
- Once approved, PR will be merged

---

## Coding Standards

### JavaScript/Node.js

```javascript
// Use const/let, not var
const apiUrl = '/api/documents';

// Use async/await over callbacks
async function fetchDocuments() {
  try {
    const response = await fetch(apiUrl);
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Use descriptive names
function calculateProgressPercentage(completed, total) {
  return (completed / total) * 100;
}

// Add JSDoc comments for functions
/**
 * Upload a document to the server
 * @param {File} file - The file to upload
 * @param {string} category - Document category
 * @returns {Promise<Object>} Upload response
 */
async function uploadDocument(file, category) {
  // Implementation
}
```

### React/JSX

```javascript
// Use functional components with hooks
function ChatMessage({ message, sender }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`message ${sender}`}>
      <p>{message}</p>
    </div>
  );
}

// Use PropTypes or TypeScript for type checking
ChatMessage.propTypes = {
  message: PropTypes.string.isRequired,
  sender: PropTypes.oneOf(['user', 'assistant']).isRequired
};
```

### CSS

```css
/* Use BEM naming convention */
.chat-message {}
.chat-message__content {}
.chat-message--highlighted {}

/* Use CSS variables */
:root {
  --neon-green: #00FF00;
  --spacing-md: 1.5rem;
}

.button {
  color: var(--neon-green);
  padding: var(--spacing-md);
}

/* Keep selectors specific but not too deep */
.chat-container .message-list .message {} /* Good */
.chat > div > div > div {} /* Bad - too generic */
```

### File Organization

```
backend/
  src/
    routes/          # API routes
    services/        # Business logic
    models/          # Database models
    middleware/      # Express middleware
    utils/           # Utility functions
    __tests__/       # Tests alongside code

frontend/
  src/
    components/      # Reusable components
    pages/           # Page components
    styles/          # Global styles
    utils/           # Utility functions
    __tests__/       # Tests alongside code
```

---

## Project Structure

### Key Files

- `SPEC.md` - Technical specification
- `README.md` - Project overview
- `package.json` - Root package configuration
- `.env.example` - Environment template
- `docker-compose.yml` - Docker configuration
- `Dockerfile` - Container definition

### Backend Structure

```
backend/
├── src/
│   ├── app.js              # Main application
│   ├── routes/             # API endpoints
│   │   ├── documents.js
│   │   ├── chat.js
│   │   ├── progress.js
│   │   └── c2pa.js
│   ├── services/           # Business logic
│   │   └── aiService.js
│   ├── models/             # Data models
│   │   └── database.js
│   └── utils/              # Utilities
│       └── logger.js
└── package.json
```

### Frontend Structure

```
frontend/
├── src/
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   ├── components/         # UI components
│   │   └── Header.jsx
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── ChatPage.jsx
│   │   ├── DocumentsPage.jsx
│   │   └── ProgressPage.jsx
│   └── styles/             # CSS files
│       ├── global.css
│       └── retro.css
└── package.json
```

---

## Additional Guidelines

### Security

- Never commit API keys or secrets
- Use environment variables
- Sanitize user inputs
- Follow security best practices
- Report security issues privately

### Performance

- Optimize images and assets
- Minimize bundle size
- Use lazy loading where appropriate
- Avoid unnecessary re-renders
- Profile performance changes

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers
- Maintain high contrast

### Documentation

- Update README for major changes
- Document new API endpoints
- Add JSDoc comments
- Update user guide if needed
- Include examples

---

## Questions?

- Open an issue for discussion
- Join our community discussions
- Contact maintainers directly
- Check existing documentation

---

## License

By contributing, you agree that your contributions will be licensed under the project's ISC License.

---

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Release notes
- Project documentation

Thank you for contributing! 🎮

---

**Last Updated:** October 2025
**Version:** 1.0.0
