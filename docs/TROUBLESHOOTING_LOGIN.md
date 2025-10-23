# Login Troubleshooting Guide

## Problem: "Invalid Credentials" Error

If you're seeing "Invalid credentials" when trying to log in, even with passwords you just set, follow these steps:

### Step 1: Verify Container is Running

```bash
docker ps | grep c2pa-generator-assistant
```

If not running:
```bash
cd /path/to/c2pa-generator-product
docker-compose up -d
```

### Step 2: Check Recent Password Resets

If you recently used `./scripts/set-admin.sh` with a password containing special characters (!, @, #, $, %, etc.), the password in the database may NOT match what you typed due to bash escaping issues.

**Symptoms**:
- Script reported success
- Login fails with "Invalid credentials"
- Password contains special characters

**Root Cause**: Bash shell escapes special characters before they reach the Node.js script, so a different password was actually stored.

### Step 3: Reset Password Using Safe Method

Use the environment variable method which bypasses shell escaping:

```bash
docker exec -e ADMIN_EMAIL="your-email@example.com" \
  -e ADMIN_PASSWORD="YourNewPassword123" \
  -e ADMIN_NAME="Your Name" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js
```

**Important**: Replace `your-email@example.com`, `YourNewPassword123`, and `Your Name` with your actual values.

### Step 4: Verify Password Works

Test the login with curl:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"your-email@example.com","password":"YourNewPassword123"}' \
  | jq '.success'
```

Should return: `true`

If it returns `null` or you get an error, the password still doesn't match.

### Step 5: Check Application Logs

If login still fails, check the logs for errors:

```bash
docker logs c2pa-generator-assistant --tail 50
```

Look for:
- Authentication errors
- Database connection issues
- JWT token generation errors

## Verified Working Credentials

**Last Updated**: 2025-10-20 16:58 UTC

These credentials are confirmed working (set via environment variable method):

### Account 1: Matt Stevens
```
Email: matt@sanmarcsoft.com
Password: NewPassword456
```

### Account 2: System Admin
```
Email: admin@sanmarcsoft.com
Password: AdminPass2025
```

## Common Issues

### Issue 1: Password Contains Special Characters

**Problem**: Used `./scripts/set-admin.sh` with password like `P@ssw0rd!2025`

**Solution**: Use environment variable method (Step 3 above) or use simple alphanumeric password

**Safe password characters for CLI**:
- ✅ Letters: a-z, A-Z
- ✅ Numbers: 0-9
- ✅ Underscore: _
- ✅ Hyphen: -

**Problematic characters for CLI**:
- ❌ Exclamation: !
- ❌ At sign: @
- ❌ Hash: #
- ❌ Dollar: $
- ❌ Others: %, &, *, etc.

### Issue 2: Container Not Running

**Symptoms**:
- Cannot connect to http://localhost:8080
- curl commands fail with "Connection refused"

**Solution**:
```bash
cd /path/to/c2pa-generator-product
docker-compose up -d
```

### Issue 3: Database Cleared

**Symptoms**:
- Was working before
- Now says "Invalid credentials" for all accounts
- Recent container rebuild or restart

**Cause**: Volume mount issue or database file deleted

**Solution**: Check if database exists:
```bash
ls -la ./data/app.db
```

If missing, recreate admin accounts using environment variable method (Step 3).

### Issue 4: Token Expired

**Symptoms**:
- Was logged in before
- Now getting logged out automatically
- "Token expired" errors in browser console

**Solution**: Clear browser storage and log in again:
1. Open browser DevTools (F12)
2. Go to Application → Storage
3. Click "Clear site data"
4. Refresh page and log in

### Issue 5: Wrong URL

Make sure you're using the correct URL:

**Login page**: `http://localhost:8080/login`

**NOT**:
- ❌ `http://localhost:8080` (redirects to home)
- ❌ `http://localhost:5173` (development server, may not be running)
- ❌ `https://localhost:8080` (HTTPS not configured)

## Quick Recovery Procedure

If everything is broken and you need to start fresh:

```bash
# 1. Stop container
docker-compose down

# 2. Keep database (data persists) or remove it (fresh start)
# Optional: rm -rf ./data/app.db

# 3. Start container
docker-compose up -d

# 4. Wait for container to be ready
sleep 10

# 5. Create admin account using safe method
docker exec -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="SecurePass2025" \
  -e ADMIN_NAME="Admin User" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js

# 6. Verify login works
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"SecurePass2025"}' \
  | jq '.success'
```

## Testing Login from Browser

1. Open http://localhost:8080/login
2. Enter credentials:
   - Email: `matt@sanmarcsoft.com`
   - Password: `NewPassword456`
3. Click "Login"
4. Should redirect to home page with user menu visible

## Testing Login from Command Line

```bash
# Test login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"matt@sanmarcsoft.com","password":"NewPassword456"}' \
  | jq -r '.token')

# Verify token was received
echo "Token: $TOKEN"

# Test authenticated request
curl -s http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'
```

Should return your user information.

## Additional Resources

- **Password Special Characters Issue**: See `docs/ADMIN_PASSWORD_SPECIAL_CHARS.md`
- **UI Contrast Fixes**: See `docs/UI_CONTRAST_FIXES.md`
- **Application Logs**: `docker logs c2pa-generator-assistant`
- **Container Shell**: `docker exec -it c2pa-generator-assistant sh`

## Support

If you continue having issues:

1. Check application logs for specific errors
2. Verify database file exists and has content
3. Try creating a new test account
4. Check browser console for JavaScript errors
5. Verify you're using the correct URL

---

**Last Updated**: 2025-10-20
**Status**: Working - Credentials Verified
