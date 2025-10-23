# Authentication Testing Guide

Quick reference for testing the authentication system after Docker rebuild.

## Prerequisites

- Docker container rebuilt with authentication code
- Admin user created (matt@sanmarcsoft.com)
- Server running on http://localhost:8080

## Authentication Flow Testing

### 1. Test Health Endpoint (No Auth Required)

```bash
curl http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-20T09:51:09.203Z",
  "service": "C2PA Generator Assistant API"
}
```

### 2. Test Login with Admin Credentials

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "matt@sanmarcsoft.com",
    "password": "YOUR_PASSWORD_HERE"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "matt@sanmarcsoft.com",
    "role": "admin",
    "name": "Matt",
    "created_at": "2025-10-20T09:23:53.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoibWF0dEBzYW5tYXJjc29mdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjA5NDk0ODMsImV4cCI6MTc2MTU1NDI4M30..."
}
```

Save the token from the response for the next steps!

### 3. Test Current User Endpoint (Requires Auth)

```bash
# Replace YOUR_TOKEN_HERE with the token from login response
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "matt@sanmarcsoft.com",
  "role": "admin",
  "name": "Matt",
  "created_at": "2025-10-20T09:23:53.000Z"
}
```

### 4. Test Admin Route: Index GitHub Repository (Requires Admin)

```bash
# First, set GitHub token (admin only)
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_GITHUB_TOKEN_HERE"
  }'

# Then index a repository (admin only)
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "contentauth",
    "repo": "c2pa-js",
    "branch": "main"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Repository indexed successfully",
  "repoId": 1,
  "filesIndexed": 42
}
```

### 5. Test Admin Route: Update Settings (Requires Admin)

```bash
curl -X PUT http://localhost:8080/api/settings/ai_provider \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "openwebui"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "key": "ai_provider",
  "value": "openwebui"
}
```

### 6. Test Registration (Create Regular User)

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "Regular User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "email": "user@example.com",
    "role": "user",
    "name": "Regular User",
    "created_at": "2025-10-20T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Note: Regular users get `role: "user"`, not `"admin"`

### 7. Test Regular User Cannot Access Admin Routes

```bash
# Login as regular user
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# Try to access admin route (should fail)
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Authorization: Bearer REGULAR_USER_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "contentauth",
    "repo": "c2pa-js"
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "error": "Admin access required"
}
```

### 8. Test Unauthenticated Access to Protected Route

```bash
# Try to access protected route without token
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "contentauth",
    "repo": "c2pa-js"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "No authentication token provided"
}
```

### 9. Test Invalid Token

```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer invalid-token-123"
```

**Expected Response (401 Unauthorized):**
```json
{
  "error": "Invalid or expired token"
}
```

## Error Responses

### 400 Bad Request
- Missing required fields
- Invalid email format
- Password too short
- Email already exists

```json
{
  "error": "Email and password are required"
}
```

### 401 Unauthorized
- No token provided
- Invalid token
- Expired token
- Wrong password

```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
- Valid token but insufficient permissions
- Regular user trying to access admin route

```json
{
  "error": "Admin access required"
}
```

### 500 Internal Server Error
- Database errors
- Server crashes
- Unexpected failures

```json
{
  "error": "Login failed"
}
```

## Complete Test Script

Save this as `test-auth.sh` and make it executable:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:8080"
ADMIN_EMAIL="matt@sanmarcsoft.com"
ADMIN_PASSWORD="your-password-here"

echo "======================================"
echo " Authentication System Test"
echo "======================================"

# Test 1: Health Check
echo -e "\n1. Testing health endpoint..."
curl -s $BASE_URL/health | jq .

# Test 2: Admin Login
echo -e "\n2. Testing admin login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

echo $LOGIN_RESPONSE | jq .

# Extract token
ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Login failed! Check your credentials."
  exit 1
fi

echo "✅ Login successful! Token: ${ADMIN_TOKEN:0:20}..."

# Test 3: Get Current User
echo -e "\n3. Testing /api/auth/me endpoint..."
curl -s -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Test 4: Test Admin Route (Settings)
echo -e "\n4. Testing admin route (read settings)..."
curl -s -X GET $BASE_URL/api/settings \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Test 5: Register New User
echo -e "\n5. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }')

echo $REGISTER_RESPONSE | jq .

USER_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

# Test 6: Test Regular User Cannot Access Admin Routes
if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
  echo -e "\n6. Testing regular user access to admin route (should fail)..."
  curl -s -X PUT $BASE_URL/api/settings/test_key \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"value": "test"}' | jq .
fi

# Test 7: Test Unauthenticated Access
echo -e "\n7. Testing unauthenticated access (should fail)..."
curl -s -X GET $BASE_URL/api/auth/me | jq .

echo -e "\n======================================"
echo " Test Complete!"
echo "======================================"
```

## JWT Token Structure

When decoded, the JWT token contains:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "matt@sanmarcsoft.com",
  "role": "admin",
  "iat": 1760949483,
  "exp": 1761554283
}
```

- **id**: User UUID
- **email**: User email address
- **role**: User role (admin or user)
- **iat**: Issued at timestamp
- **exp**: Expiration timestamp (default: 7 days)

## Token Expiration

- Default expiration: 7 days
- Expired tokens return 401 Unauthorized
- Users must login again to get a new token
- No refresh token mechanism (stateless JWT)

## Security Notes

- Tokens are signed with JWT_SECRET from config/secrets.json
- Passwords are hashed with bcrypt (10 salt rounds)
- password_hash is never exposed in API responses
- Generic error messages prevent user enumeration
- Rate limiting: 100 requests per 15 minutes per IP

## Troubleshooting

### "Cannot POST /api/auth/login"
- Server not running or not restarted after adding auth routes
- Docker image needs to be rebuilt

### "Invalid credentials"
- Wrong email or password
- Check admin user was created successfully

### "No authentication token provided"
- Missing Authorization header
- Check header format: `Authorization: Bearer <token>`

### "Invalid or expired token"
- Token expired (7 days)
- Token malformed
- JWT_SECRET changed after token was issued

### "Admin access required"
- User role is not "admin"
- Check user.role in /api/auth/me response

## Next Steps

After successful authentication testing:

1. Build frontend authentication UI
2. Implement token storage (localStorage or httpOnly cookies)
3. Create protected route components
4. Add token refresh mechanism (optional)
5. Implement logout functionality
6. Add user profile management
