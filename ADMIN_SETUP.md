# Admin Setup Guide

This guide explains how to set up admin credentials for the C2PA Generator Product Certification Assistant.

## Quick Start

### Option 1: Using the Setup Script (Recommended)

We provide a convenient script to create or update admin credentials:

```bash
# Interactive mode (prompts for credentials)
./scripts/set-admin.sh

# Command-line mode (provide credentials directly)
./scripts/set-admin.sh admin@company.com "SecurePassword123!" "Admin Name"

# Minimal (uses default name "Admin User")
./scripts/set-admin.sh admin@company.com "SecurePassword123!"

# Force overwrite without confirmation (useful for automation)
./scripts/set-admin.sh admin@company.com "NewPassword456!" "Admin Name" --force
./scripts/set-admin.sh admin@company.com "NewPassword456!" --force
```

**Important**: The script requires the Docker container to be running.

**Note**: If a user with the email already exists, the script will:
1. Show the current user information
2. Show the new information that will be set
3. Ask for confirmation to overwrite (unless `--force` is used)
4. Update the user account with admin role and new credentials if confirmed

### Option 2: Manual Docker Command

If you prefer to use the Docker command directly:

```bash
# Interactive mode
docker exec c2pa-generator-assistant node scripts/create-admin.js

# With command-line arguments
docker exec c2pa-generator-assistant node scripts/create-admin.js \
  --email admin@company.com \
  --password "SecurePassword123!" \
  --name "Admin User"

# Force overwrite without confirmation
docker exec c2pa-generator-assistant node scripts/create-admin.js \
  --email admin@company.com \
  --password "NewPassword456!" \
  --name "Admin User" \
  --force

# Using environment variables
docker exec -e ADMIN_EMAIL=admin@company.com \
  -e ADMIN_PASSWORD="SecurePassword123!" \
  -e ADMIN_NAME="Admin User" \
  c2pa-generator-assistant node scripts/create-admin.js

# Using environment variables with force
docker exec -e ADMIN_EMAIL=admin@company.com \
  -e ADMIN_PASSWORD="NewPassword456!" \
  -e ADMIN_NAME="Admin User" \
  -e ADMIN_FORCE=true \
  c2pa-generator-assistant node scripts/create-admin.js
```

## Password Requirements

- Minimum 8 characters
- Recommended: Include uppercase, lowercase, numbers, and special characters
- Examples of strong passwords:
  - `Admin123!`
  - `SecureP@ss2024`
  - `C2PA!GeneratorAdmin99`

## After Creating Admin Account

1. **Visit the Login Page**
   ```
   http://localhost:8080/login
   ```

2. **Log in with your admin credentials**
   - Enter the email and password you just created
   - Click "LOGIN"

3. **Verify Admin Access**
   - Once logged in, you should have access to admin-only features
   - The system will recognize your admin role automatically

## Admin Capabilities

Admin users can:

- ✅ Complete onboarding process
- ✅ Configure AI provider settings (OpenWebUI, OpenAI API)
- ✅ Index GitHub repositories for code-aware assistance
- ✅ Update application settings
- ✅ Access all API endpoints (both public and admin-protected)

Regular users will see "Admin access required" errors when attempting to access admin features.

## Examples

### Example 1: Create Initial Admin

```bash
./scripts/set-admin.sh admin@sanmarcsoft.com "MySecurePass123!" "Matthew Stevens"
```

### Example 2: Update Existing Admin Password

If an admin user already exists, the script will show you the existing account details and ask if you want to overwrite:

```bash
./scripts/set-admin.sh admin@sanmarcsoft.com "NewPassword456!" "Matthew Stevens"
```

The script will display:
- Current user information (email, name, role, etc.)
- New information that will be set
- Confirmation prompt to proceed

### Example 3: Force Overwrite (No Confirmation)

For automation or scripting purposes, use the `--force` flag:

```bash
./scripts/set-admin.sh admin@sanmarcsoft.com "AutomatedPass123!" "Admin User" --force
```

This will immediately overwrite the existing user without prompting for confirmation.

## Troubleshooting

### Container Not Running

If you see "Container is not running" error:

```bash
# Start the application
docker-compose up -d

# Wait a few seconds, then run the script again
./scripts/set-admin.sh
```

### Permission Denied

If you get "permission denied" on the script:

```bash
chmod +x ./scripts/set-admin.sh
```

### Forgot Admin Password

Simply run the script again with the same email but a new password. The script will show you the existing account and ask if you want to overwrite it with the new credentials.

**Quick reset**:
```bash
# Interactive - will prompt for confirmation
./scripts/set-admin.sh admin@sanmarcsoft.com "NewSecurePass123!" "System Administrator"

# Non-interactive - immediate reset
./scripts/set-admin.sh admin@sanmarcsoft.com "NewSecurePass123!" "System Administrator" --force
```

## Security Best Practices

1. **Use Strong Passwords**: At least 8 characters with mixed case, numbers, and symbols
2. **Don't Share Credentials**: Each admin should have their own account
3. **Change Default Passwords**: If you used a simple password initially, change it later
4. **Limit Admin Accounts**: Only create admin accounts for users who truly need admin access
5. **Regular Password Updates**: Update admin passwords periodically

## API Testing (For Developers)

You can test admin authentication via API:

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sanmarcsoft.com","password":"YourPassword"}' \
  | jq -r '.token')

# Test admin endpoint
curl -X POST http://localhost:8080/api/settings/onboarding/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

## Related Documentation

- **Main README**: [README.md](README.md)
- **Backend Scripts**: [backend/scripts/README.md](backend/scripts/README.md)
- **Security Guide**: [SECURITY.md](SECURITY.md)
- **API Documentation**: [docs/API.md](docs/API.md)

---

## Current Admin Credentials (As Set)

**Email**: `admin@sanmarcsoft.com`
**Password**: `MySecurePass123!`
**Name**: `System Administrator`
**Role**: `admin`

**⚠️ Important**: Change these credentials in production!

---

**Need Help?** Contact the development team or refer to the [main documentation](README.md).
