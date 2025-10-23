# Test-Driven Implementation Strategy: Authentication System

## Overview

This document outlines a complete test-driven development (TDD) strategy for implementing user authentication with role-based access control (RBAC) in the C2PA Generator Product Certification Assistant.

## Implementation Phases

### Phase 1: Database Layer (Backend)
### Phase 2: Authentication Service (Backend)
### Phase 3: Authentication Routes (Backend)
### Phase 4: Authentication Middleware (Backend)
### Phase 5: Protected Routes (Backend)
### Phase 6: Frontend Authentication UI
### Phase 7: Integration & E2E Testing

---

## Phase 1: Database Layer

**Objective**: Create user database schema and basic CRUD operations

### Test Suite 1.1: User Table Schema
**File**: `backend/tests/models/user.test.js`

```javascript
describe('User Database Schema', () => {
  test('should create users table with correct schema', async () => {
    // Verify table exists
    // Verify columns: id, email, password_hash, role, name, created_at, last_login
  });

  test('should enforce email uniqueness constraint', async () => {
    // Try to create two users with same email
    // Expect second to fail
  });

  test('should set default role to "user"', async () => {
    // Create user without specifying role
    // Expect role to be 'user'
  });
});
```

### Test Suite 1.2: User Model CRUD Operations
**File**: `backend/tests/models/user.test.js`

```javascript
describe('User Model', () => {
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
    });

    test('should reject user creation with duplicate email', async () => {
      await User.create({ email: 'test@example.com', password: 'pass123' });
      await expect(
        User.create({ email: 'test@example.com', password: 'pass456' })
      ).rejects.toThrow('Email already exists');
    });

    test('should reject user creation with invalid email', async () => {
      await expect(
        User.create({ email: 'invalid-email', password: 'pass123' })
      ).rejects.toThrow('Invalid email format');
    });

    test('should reject weak passwords', async () => {
      await expect(
        User.create({ email: 'test@example.com', password: '123' })
      ).rejects.toThrow('Password must be at least 8 characters');
    });
  });

  describe('findByEmail', () => {
    test('should find user by email', async () => {
      await User.create({ email: 'find@example.com', password: 'pass123' });
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
      const created = await User.create({ email: 'id@example.com', password: 'pass123' });
      const user = await User.findById(created.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(created.id);
    });
  });

  describe('updateUser', () => {
    test('should update user name', async () => {
      const user = await User.create({ email: 'update@example.com', password: 'pass123' });
      await User.update(user.id, { name: 'Updated Name' });

      const updated = await User.findById(user.id);
      expect(updated.name).toBe('Updated Name');
    });

    test('should not allow updating email to existing email', async () => {
      await User.create({ email: 'user1@example.com', password: 'pass123' });
      const user2 = await User.create({ email: 'user2@example.com', password: 'pass123' });

      await expect(
        User.update(user2.id, { email: 'user1@example.com' })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('updateLastLogin', () => {
    test('should update last_login timestamp', async () => {
      const user = await User.create({ email: 'login@example.com', password: 'pass123' });
      await User.updateLastLogin(user.id);

      const updated = await User.findById(user.id);
      expect(updated.last_login).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    test('should delete user by ID', async () => {
      const user = await User.create({ email: 'delete@example.com', password: 'pass123' });
      await User.delete(user.id);

      const deleted = await User.findById(user.id);
      expect(deleted).toBeNull();
    });
  });
});
```

**Implementation File**: `backend/src/models/user.js`

---

## Phase 2: Authentication Service

**Objective**: Implement password hashing, JWT generation, and validation

### Test Suite 2.1: Password Hashing
**File**: `backend/tests/services/authService.test.js`

```javascript
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
```

### Test Suite 2.2: JWT Token Generation and Validation
**File**: `backend/tests/services/authService.test.js`

```javascript
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
});
```

**Implementation File**: `backend/src/services/authService.js`

---

## Phase 3: Authentication Routes

**Objective**: Create registration, login, logout, and profile endpoints

### Test Suite 3.1: Registration Endpoint
**File**: `backend/tests/routes/auth.test.js`

```javascript
describe('POST /api/auth/register', () => {
  test('should register new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('newuser@example.com');
    expect(response.body.user.role).toBe('user');
    expect(response.body.token).toBeDefined();
    expect(response.body.user.password_hash).toBeUndefined(); // Should not expose hash
  });

  test('should reject registration with existing email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: 'pass123' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'existing@example.com', password: 'pass456' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('already exists');
  });

  test('should reject registration with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid-email', password: 'pass123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });

  test('should reject registration with weak password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: '123' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('password');
  });

  test('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('required');
  });
});
```

### Test Suite 3.2: Login Endpoint
**File**: `backend/tests/routes/auth.test.js`

```javascript
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@example.com', password: 'SecurePass123!' });
  });

  test('should login with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'SecurePass123!' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('login@example.com');
  });

  test('should reject login with incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPassword!' });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Invalid');
  });

  test('should reject login with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'pass123' });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Invalid');
  });

  test('should update last_login timestamp on successful login', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'SecurePass123!' });

    const user = await User.findByEmail('login@example.com');
    expect(user.last_login).toBeDefined();
  });
});
```

### Test Suite 3.3: Current User Endpoint
**File**: `backend/tests/routes/auth.test.js`

```javascript
describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'me@example.com', password: 'SecurePass123!', name: 'Me User' });
    token = response.body.token;
  });

  test('should return current user with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('me@example.com');
    expect(response.body.name).toBe('Me User');
    expect(response.body.password_hash).toBeUndefined();
  });

  test('should reject request without token', async () => {
    const response = await request(app)
      .get('/api/auth/me');

    expect(response.status).toBe(401);
  });

  test('should reject request with invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });
});
```

**Implementation File**: `backend/src/routes/auth.js`

---

## Phase 4: Authentication Middleware

**Objective**: Create middleware to protect routes and check roles

### Test Suite 4.1: requireAuth Middleware
**File**: `backend/tests/middleware/auth.test.js`

```javascript
describe('requireAuth Middleware', () => {
  test('should allow request with valid token', async () => {
    const { token } = await createTestUser();

    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).not.toBe(401);
  });

  test('should reject request without token', async () => {
    const response = await request(app)
      .get('/api/test/protected');

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('authentication');
  });

  test('should reject request with invalid token', async () => {
    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
  });

  test('should reject request with expired token', async () => {
    const expiredToken = authService.generateToken({ id: '123' }, { expiresIn: '0s' });

    const response = await request(app)
      .get('/api/test/protected')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('expired');
  });

  test('should attach user to request object', async () => {
    const { user, token } = await createTestUser();

    // Create test route that returns req.user
    const response = await request(app)
      .get('/api/test/current-user')
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.id).toBe(user.id);
    expect(response.body.email).toBe(user.email);
  });
});
```

### Test Suite 4.2: requireAdmin Middleware
**File**: `backend/tests/middleware/auth.test.js`

```javascript
describe('requireAdmin Middleware', () => {
  test('should allow admin user', async () => {
    const { token } = await createTestUser({ role: 'admin' });

    const response = await request(app)
      .get('/api/test/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).not.toBe(403);
  });

  test('should reject non-admin user', async () => {
    const { token } = await createTestUser({ role: 'user' });

    const response = await request(app)
      .get('/api/test/admin-only')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('admin');
  });

  test('should reject unauthenticated request', async () => {
    const response = await request(app)
      .get('/api/test/admin-only');

    expect(response.status).toBe(401);
  });
});
```

**Implementation Files**:
- `backend/src/middleware/requireAuth.js`
- `backend/src/middleware/requireAdmin.js`

---

## Phase 5: Protected Routes

**Objective**: Apply authentication middleware to admin routes

### Test Suite 5.1: GitHub RAG Routes Protection
**File**: `backend/tests/routes/github.protected.test.js`

```javascript
describe('GitHub RAG Routes - Authentication', () => {
  describe('POST /api/github/auth/token', () => {
    test('should reject without authentication', async () => {
      const response = await request(app)
        .post('/api/github/auth/token')
        .send({ token: 'ghp_test' });

      expect(response.status).toBe(401);
    });

    test('should reject non-admin user', async () => {
      const { token } = await createTestUser({ role: 'user' });

      const response = await request(app)
        .post('/api/github/auth/token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'ghp_test' });

      expect(response.status).toBe(403);
    });

    test('should allow admin user', async () => {
      const { token } = await createTestUser({ role: 'admin' });

      const response = await request(app)
        .post('/api/github/auth/token')
        .set('Authorization', `Bearer ${token}`)
        .send({ token: 'ghp_test' });

      expect(response.status).not.toBe(403);
    });
  });

  describe('POST /api/github/repos/index', () => {
    test('should require admin role', async () => {
      const { token } = await createTestUser({ role: 'user' });

      const response = await request(app)
        .post('/api/github/repos/index')
        .set('Authorization', `Bearer ${token}`)
        .send({ owner: 'test', repo: 'test' });

      expect(response.status).toBe(403);
    });
  });
});
```

### Test Suite 5.2: Settings Routes Protection
**File**: `backend/tests/routes/settings.protected.test.js`

```javascript
describe('Settings Routes - Authentication', () => {
  describe('PUT /api/settings', () => {
    test('should require admin role', async () => {
      const { token } = await createTestUser({ role: 'user' });

      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ ai_provider: 'openai' });

      expect(response.status).toBe(403);
    });

    test('should allow admin to update settings', async () => {
      const { token } = await createTestUser({ role: 'admin' });

      const response = await request(app)
        .put('/api/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ ai_provider: 'openai' });

      expect(response.status).toBe(200);
    });
  });
});
```

**Implementation**: Update existing route files to use middleware

---

## Phase 6: Frontend Authentication UI

**Objective**: Build registration, login, and protected route components

### Test Suite 6.1: Registration Component
**File**: `frontend/tests/components/auth/Register.test.jsx`

```javascript
describe('Register Component', () => {
  test('should render registration form', () => {
    render(<Register />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('should validate email format', async () => {
    render(<Register />);

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  test('should validate password strength', async () => {
    render(<Register />);

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    });
  });

  test('should submit registration form', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ success: true });
    render(<Register onRegister={mockRegister} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
    });
  });

  test('should display error message on registration failure', async () => {
    server.use(
      rest.post('/api/auth/register', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: 'Email already exists' }));
      })
    );

    render(<Register />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'existing@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'SecurePass123!' }
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
```

### Test Suite 6.2: Login Component
**File**: `frontend/tests/components/auth/Login.test.jsx`

```javascript
describe('Login Component', () => {
  test('should render login form', () => {
    render(<Login />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('should submit login form', async () => {
    const mockLogin = jest.fn().mockResolvedValue({ success: true, token: 'test-token' });
    render(<Login onLogin={mockLogin} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('should display error on invalid credentials', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.status(401), ctx.json({ error: 'Invalid credentials' }));
      })
    );

    render(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### Test Suite 6.3: Auth Context
**File**: `frontend/tests/context/AuthContext.test.jsx`

```javascript
describe('AuthContext', () => {
  test('should provide authentication state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  test('should update state on login', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.email).toBe('test@example.com');
  });

  test('should clear state on logout', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  test('should identify admin users', async () => {
    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          token: 'test-token',
          user: { email: 'admin@example.com', role: 'admin' }
        }));
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await act(async () => {
      await result.current.login('admin@example.com', 'password123');
    });

    expect(result.current.isAdmin).toBe(true);
  });
});
```

### Test Suite 6.4: Protected Route Component
**File**: `frontend/tests/components/auth/ProtectedRoute.test.jsx`

```javascript
describe('ProtectedRoute Component', () => {
  test('should render children when authenticated', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      user: { email: 'test@example.com', role: 'user' }
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('should redirect to login when not authenticated', () => {
    const mockAuthContext = {
      isAuthenticated: false,
      user: null
    };

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // Should redirect to /login
  });

  test('should render admin-only content for admin users', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      user: { email: 'admin@example.com', role: 'admin' },
      isAdmin: true
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProtectedRoute requireAdmin>
          <div>Admin Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  test('should show access denied for non-admin users', () => {
    const mockAuthContext = {
      isAuthenticated: true,
      user: { email: 'user@example.com', role: 'user' },
      isAdmin: false
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProtectedRoute requireAdmin>
          <div>Admin Content</div>
        </ProtectedRoute>
      </AuthContext.Provider>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText(/access denied/i)).toBeInTheDocument();
  });
});
```

**Implementation Files**:
- `frontend/src/components/auth/Register.jsx`
- `frontend/src/components/auth/Login.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`

---

## Phase 7: Integration & E2E Testing

**Objective**: Test complete authentication flow end-to-end

### Test Suite 7.1: Complete Registration Flow
**File**: `backend/tests/integration/auth-flow.test.js`

```javascript
describe('Complete Registration Flow', () => {
  test('should register, login, and access protected route', async () => {
    // Step 1: Register
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'complete@example.com',
        password: 'SecurePass123!',
        name: 'Complete User'
      });

    expect(registerResponse.status).toBe(201);
    const token = registerResponse.body.token;

    // Step 2: Access protected route
    const protectedResponse = await request(app)
      .get('/api/progress')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(200);

    // Step 3: Logout (clear token)
    // Step 4: Try to access protected route without token
    const unauthedResponse = await request(app)
      .get('/api/progress');

    expect(unauthedResponse.status).toBe(401);
  });
});
```

### Test Suite 7.2: Admin Workflow
**File**: `backend/tests/integration/admin-workflow.test.js`

```javascript
describe('Admin Workflow', () => {
  test('admin can configure AI and index GitHub repos', async () => {
    // Create admin user
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'AdminPass123!',
      role: 'admin'
    });

    const token = authService.generateToken(admin);

    // Configure AI settings
    const settingsResponse = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ ai_provider: 'openai', openai_api_key: 'test-key' });

    expect(settingsResponse.status).toBe(200);

    // Index GitHub repository
    const githubResponse = await request(app)
      .post('/api/github/repos/index')
      .set('Authorization', `Bearer ${token}`)
      .send({ owner: 'test', repo: 'test-repo' });

    expect(githubResponse.status).toBe(200);
  });

  test('regular user cannot access admin functions', async () => {
    const user = await User.create({
      email: 'user@example.com',
      password: 'UserPass123!',
      role: 'user'
    });

    const token = authService.generateToken(user);

    // Try to configure AI settings
    const settingsResponse = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ ai_provider: 'openai' });

    expect(settingsResponse.status).toBe(403);

    // Try to index GitHub repository
    const githubResponse = await request(app)
      .post('/api/github/repos/index')
      .set('Authorization', `Bearer ${token}`)
      .send({ owner: 'test', repo: 'test-repo' });

    expect(githubResponse.status).toBe(403);
  });
});
```

---

## Implementation Order

### Step 1: Backend Database & Models
**Agent**: `database-administrator`
**Files to create**:
- `backend/src/models/user.js`
- Update `backend/src/models/database.js`
**Tests**: `backend/tests/models/user.test.js`

### Step 2: Backend Authentication Service
**Agent**: `api-developer`
**Files to create**:
- `backend/src/services/authService.js`
**Tests**: `backend/tests/services/authService.test.js`

### Step 3: Backend Authentication Routes
**Agent**: `api-developer`
**Files to create**:
- `backend/src/routes/auth.js`
**Tests**: `backend/tests/routes/auth.test.js`

### Step 4: Backend Authentication Middleware
**Agent**: `api-developer`
**Files to create**:
- `backend/src/middleware/requireAuth.js`
- `backend/src/middleware/requireAdmin.js`
**Tests**: `backend/tests/middleware/auth.test.js`

### Step 5: Protect Existing Routes
**Agent**: `api-developer`
**Files to update**:
- `backend/src/routes/github.js`
- `backend/src/routes/settings.js`
- `backend/src/app.js`
**Tests**: `backend/tests/routes/*.protected.test.js`

### Step 6: Frontend Authentication Context
**Agent**: `frontend-developer`
**Files to create**:
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/hooks/useAuth.js`
**Tests**: `frontend/tests/context/AuthContext.test.jsx`

### Step 7: Frontend Auth Components
**Agent**: `frontend-developer`
**Files to create**:
- `frontend/src/components/auth/Register.jsx`
- `frontend/src/components/auth/Login.jsx`
- `frontend/src/components/auth/ProtectedRoute.jsx`
**Tests**: `frontend/tests/components/auth/*.test.jsx`

### Step 8: Integration Testing
**Agent**: `qa-test-engineer`
**Files to create**:
- `backend/tests/integration/auth-flow.test.js`
- `backend/tests/integration/admin-workflow.test.js`

---

## Dependencies to Install

### Backend
```bash
cd backend
npm install --save bcrypt jsonwebtoken
npm install --save-dev jest supertest @types/jest
```

### Frontend
```bash
cd frontend
npm install --save react-router-dom
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

---

## Success Criteria

### Backend
- [ ] All user model tests pass
- [ ] All auth service tests pass
- [ ] All auth route tests pass
- [ ] All middleware tests pass
- [ ] Protected routes reject unauthorized requests
- [ ] Admin routes reject non-admin users

### Frontend
- [ ] All auth component tests pass
- [ ] Auth context manages state correctly
- [ ] Protected routes redirect unauthenticated users
- [ ] Admin-only UI hidden for regular users

### Integration
- [ ] Complete registration → login → protected access flow works
- [ ] Admin can configure AI settings
- [ ] Admin can index GitHub repositories
- [ ] Regular users cannot access admin functions
- [ ] Token expiration handled gracefully

---

## Execution Commands

### Run Backend Tests
```bash
cd backend
npm test -- auth
npm test -- models/user
npm test -- services/authService
npm test -- routes/auth
npm test -- middleware/auth
npm test -- integration/auth
```

### Run Frontend Tests
```bash
cd frontend
npm test -- auth
npm test -- AuthContext
npm test -- Register
npm test -- Login
npm test -- ProtectedRoute
```

### Run All Tests
```bash
npm test
```

---

## Notes for Sub-Agents

1. **Follow TDD strictly**: Write tests BEFORE implementation
2. **Run tests frequently**: Ensure each test passes before moving on
3. **Use TypeScript types**: Add JSDoc comments for better IDE support
4. **Security first**: Never expose password hashes, always validate input
5. **Error handling**: Provide clear, actionable error messages
6. **Logging**: Log authentication events for security auditing
7. **Documentation**: Update API docs as you implement routes

---

## First Steps

To begin implementation:

1. Install dependencies (see Dependencies section)
2. Start with Phase 1 (Database Layer)
3. Run tests with: `npm test -- models/user.test.js`
4. Implement User model until all tests pass
5. Move to Phase 2 (Authentication Service)

Each phase builds on the previous one. Do not skip ahead until all tests in the current phase pass.
