# Login Access Guide

## Overview

This guide explains how to access the C2PA Generator Product Certification Assistant web application, including login, admin features, and settings management.

## Access URLs

### Main Application
- **URL**: http://localhost:8080
- **Description**: Home page with application overview

### Login Page
- **URL**: http://localhost:8080/login
- **Description**: Authentication page for all users

### Admin Areas (Requires Admin Role)
- **Settings Page**: http://localhost:8080/settings
  - Configure webapp settings (AI, security, features, etc.)
- **Admin Panel**: http://localhost:8080/admin
  - Configure AI providers, GitHub integration, view system stats

## Current Admin Credentials

### Primary Admin Account
```
Email:    admin@sanmarcsoft.com
Password: AdminPass2025
Name:     System Administrator
Role:     admin
```

### Additional Admin Account
```
Email:    matt@sanmarcsoft.com
Password: [Contact administrator]
Role:     admin
```

## Login Flow

### Step 1: Navigate to Login Page
```
http://localhost:8080/login
```

### Step 2: Enter Credentials
- **Email**: `admin@sanmarcsoft.com`
- **Password**: `AdminPass2025`

### Step 3: Click LOGIN Button
- On successful authentication:
  - JWT token is generated and stored
  - Redirected to home page
  - Admin navigation links appear in header

### Step 4: Access Admin Features
After login, the header shows additional links for admin users:
- **⚙️ SETTINGS** - Webapp configuration
- **👑 ADMIN** - AI and GitHub configuration

## Features by User Role

### All Authenticated Users
- ✅ Home page access
- ✅ Chat interface (if enabled)
- ✅ Document management (if enabled)
- ✅ Progress tracking (if enabled)

### Admin Users Only
- ✅ Settings page (webapp configuration)
- ✅ Admin panel (AI/GitHub setup)
- ✅ User management capabilities
- ✅ System statistics view
- ✅ Feature flag management

## No Onboarding Wizard Blocking

**Important**: As of the latest update, the onboarding wizard no longer blocks access to the login page. You can proceed directly to login without completing setup.

The onboarding wizard can be triggered manually from the admin panel if needed for initial configuration.

## API Authentication

### Login API Endpoint
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@sanmarcsoft.com",
    "password": "AdminPass2025"
  }'
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "a0be7df3-c342-4341-b217-39e528765746",
    "email": "admin@sanmarcsoft.com",
    "role": "admin",
    "name": "System Administrator",
    "created_at": "2025-10-20T15:37:02.224Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using JWT Token for API Requests
```bash
# Store token
TOKEN="your_jwt_token_here"

# Use in requests
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/auth/me
```

## Database Persistence

### Data Storage
The application database is persisted in:
```
./data/app.db
```

This directory is mounted as a Docker volume, so data persists across:
- ✅ Container restarts
- ✅ Container rebuilds
- ✅ System reboots

### Users in Database
Current users (as of latest check):
1. `admin@sanmarcsoft.com` (admin)
2. `matt@sanmarcsoft.com` (admin)

## Resetting Admin Credentials

If you need to reset or create new admin credentials:

### Using the Setup Script
```bash
./scripts/set-admin.sh <email> <password> "<name>" --yes
```

### Examples

**Create new admin**:
```bash
./scripts/set-admin.sh newadmin@example.com SecurePass123 "New Admin" --yes
```

**Reset existing admin password**:
```bash
./scripts/set-admin.sh admin@sanmarcsoft.com NewPassword456 "System Administrator" --yes
```

**Interactive mode (with confirmation)**:
```bash
./scripts/set-admin.sh admin@sanmarcsoft.com NewPassword456
```

## Troubleshooting

### Issue: "Invalid credentials" on Login
**Cause**: Password doesn't match database hash
**Solution**:
```bash
# Reset the password
./scripts/set-admin.sh admin@sanmarcsoft.com NewPassword "Admin Name" --yes

# Test login
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@sanmarcsoft.com","password":"NewPassword"}'
```

### Issue: "Access Denied" on Settings Page
**Cause**: User role is not 'admin'
**Solution**: Ensure user has admin role:
```bash
# Check user role
docker exec c2pa-generator-assistant node -e "
const { getAsync } = require('/app/src/models/database');
(async () => {
  const user = await getAsync('SELECT email, role FROM users WHERE email = ?', ['your@email.com']);
  console.log(user);
  process.exit(0);
})();
"

# If role is 'user', update to 'admin'
./scripts/set-admin.sh your@email.com YourPassword "Your Name" --yes
```

### Issue: Login Page Shows Onboarding Wizard
**Cause**: Old version of frontend code
**Solution**: Rebuild the container
```bash
docker-compose build
docker-compose up -d
```

### Issue: Database Empty After Rebuild
**Cause**: Data directory not properly mounted
**Solution**: Verify volume mount in `docker-compose.yml`:
```yaml
volumes:
  - ./data:/app/data  # Should be present and uncommented
```

Then rebuild:
```bash
docker-compose down
docker-compose up -d
```

## Security Best Practices

### 1. Change Default Password
After first login, change the default admin password:
```bash
./scripts/set-admin.sh admin@sanmarcsoft.com YourStrongPassword123 "System Administrator" --yes
```

### 2. Use Strong Passwords
- Minimum 8 characters (enforced)
- Recommended: 12+ characters with mixed case, numbers, symbols

### 3. Secure the JWT Secret
The JWT secret is used to sign authentication tokens. In production:
```bash
# Generate a strong secret
openssl rand -base64 32

# Set as environment variable
export JWT_SECRET="your_generated_secret"
```

### 4. Enable HTTPS in Production
For production deployments, configure a reverse proxy (nginx, Caddy) with SSL/TLS certificates.

### 5. Regular Credential Rotation
Rotate admin passwords periodically (e.g., every 90 days).

## Next Steps After Login

### 1. Configure AI Provider (Admin Panel)
Visit http://localhost:8080/admin and configure:
- OpenWebUI URL (if using local LLM)
- OpenAI API Key (if using OpenAI)
- Test connection to verify setup

### 2. Configure Webapp Settings (Settings Page)
Visit http://localhost:8080/settings and configure:
- General settings (app name, maintenance mode)
- AI behavior (temperature, max tokens)
- Security policies (session timeout, password requirements)
- Feature flags (enable/disable features)
- Notifications preferences

### 3. Set Up GitHub Integration (Optional)
If using RAG with GitHub repositories:
1. Go to http://localhost:8080/admin
2. Enter GitHub personal access token
3. Add repositories to index
4. Test code search functionality

### 4. Create Additional Users
If needed, create additional admin or regular users:
```bash
# Admin user
./scripts/set-admin.sh user@example.com Password123 "User Name" --yes

# Regular user (via registration page or API)
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "name": "Regular User"
  }'
```

## Support

### Documentation
- [Admin Setup Guide](./ADMIN_SETUP.md)
- [Admin Panel Documentation](./ADMIN_PANEL.md)
- [Settings Page Documentation](./SETTINGS_PAGE.md)
- [API Documentation](./API.md)

### Common Operations
- **View logs**: `docker logs c2pa-generator-assistant`
- **Restart service**: `docker-compose restart`
- **Check health**: `curl http://localhost:8080/health`

### Getting Help
- Check the [main README](../README.md)
- Review [troubleshooting guides](./TROUBLESHOOTING.md)
- Contact the development team

---

**Last Updated**: 2025-10-20
**Application Version**: 1.0.0
**Status**: ✅ Fully Operational
