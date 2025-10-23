# Bug Fix: Admin Credential Reset Password Not Updating

## Issue Summary

**Problem**: The admin credential reset script (`create-admin.js` and `set-admin.sh`) was failing to update passwords for existing users. When attempting to overwrite an existing admin account with a new password, the old password would continue to work and the new password would fail.

**Error Reported**: "Account exists" error and subsequent login failures with new credentials.

## Root Causes

### 1. Missing Password Hashing in `User.update()` Method

**File**: `backend/src/models/user.js`

**Issue**: The `User.update()` method did not include logic to hash passwords when updating existing users. While the `User.create()` method properly hashed passwords during user creation, the update method was missing this critical functionality.

**Impact**: When the admin script tried to update an existing user's password, it would attempt to store the plain text password directly in the database, which would fail validation or be ignored.

### 2. Docker Image Not Reflecting Code Changes

**File**: `docker-compose.yml`

**Issue**: The source code volume mount was commented out (line 14):
```yaml
# - ./backend/src:/app/src
```

This meant that code changes made to the User model were not being reflected in the running container. The container was using the code baked into the Docker image at build time.

**Impact**: Even after fixing the password hashing code, the container continued to run the old buggy code until the image was rebuilt.

## The Fix

### Part 1: Add Password Hashing to `User.update()`

**File**: `backend/src/models/user.js` (lines 158-166)

Added password validation and bcrypt hashing to the update method:

```javascript
// If updating password, validate and hash it
let password_hash = undefined;
if (password !== undefined) {
  if (!this.isValidPassword(password)) {
    throw new Error('Password must be at least 8 characters');
  }
  password_hash = await bcrypt.hash(password, SALT_ROUNDS);
}
```

And included `password_hash` in the dynamic UPDATE query (lines 176-179):

```javascript
if (password_hash !== undefined) {
  updateFields.push('password_hash = ?');
  updateValues.push(password_hash);
}
```

### Part 2: Rebuild Docker Container

Since the source code volume mount is commented out in production mode, we needed to rebuild the Docker image to include the fixed code:

```bash
docker-compose build --no-cache
docker-compose up -d
```

## Verification

After applying both fixes, the credential update functionality works correctly:

1. **Create new admin user**:
```bash
./scripts/set-admin.sh freshtest@example.com FreshPass999 "Fresh Test" --yes
# Login works with FreshPass999 ✓
```

2. **Update existing admin user**:
```bash
./scripts/set-admin.sh freshtest@example.com UpdatedPass999 "Fresh Test Updated" --yes
# Old password (FreshPass999) fails ✓
# New password (UpdatedPass999) works ✓
```

3. **Main admin credentials**:
```bash
./scripts/set-admin.sh admin@sanmarcsoft.com AdminPass2025 "System Administrator" --yes
# Login successful ✓
# JWT token generated ✓
# Admin role confirmed ✓
```

## Testing Commands

### Test User Creation
```bash
./scripts/set-admin.sh test@example.com TestPass123 "Test User" --yes
```

### Test Password Update
```bash
# Create user
./scripts/set-admin.sh test@example.com OldPass123 "Test User" --yes

# Update password
./scripts/set-admin.sh test@example.com NewPass456 "Test User" --yes

# Verify old password fails
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"OldPass123"}' \
  -s | jq '.success'
# Should return: null (failed)

# Verify new password works
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"NewPass456"}' \
  -s | jq '.success'
# Should return: true (success)
```

## Lessons Learned

### 1. Database Model Completeness
When implementing user authentication systems, ensure that **all** CRUD operations (Create, Read, Update, Delete) handle passwords securely:
- ✅ Create: Hash passwords during user creation
- ✅ Update: Hash passwords during user updates
- ✅ Verify: Compare plain text against hash during login
- ✅ Never store or log plain text passwords

### 2. Docker Development vs Production
Be aware of the difference between development mode (with volume mounts) and production mode (with baked-in code):

**Development** (`docker-compose.yml` with volume mount enabled):
```yaml
volumes:
  - ./backend/src:/app/src  # Hot reload - sees code changes immediately
```

**Production** (`docker-compose.yml` with volume mount disabled):
```yaml
# volumes:
#   - ./backend/src:/app/src  # Code baked into image at build time
```

In production mode, you **must rebuild** the Docker image after code changes:
```bash
docker-compose build
docker-compose up -d
```

### 3. Debugging Methodology
The debugging process followed this logical sequence:
1. ✅ Verify script creates users successfully
2. ✅ Verify database contains user records
3. ✅ Verify password hashes are in correct format (bcrypt)
4. ❌ Discover passwords don't match expected values
5. ✅ Test direct SQL update - works
6. ❌ Test User.update() - doesn't work
7. ✅ Identify missing password hashing in User.update()
8. ✅ Add password hashing code
9. ❌ Still doesn't work after code change
10. ✅ Realize container is running old code
11. ✅ Rebuild Docker image
12. ✅ Verify fix works end-to-end

### 4. Testing Strategy
Always test both creation AND update paths:
- ✅ Test creating new users
- ✅ Test updating existing users
- ✅ Test that old passwords are invalidated after update
- ✅ Test that new passwords work after update
- ✅ Test with and without `--force` flag
- ✅ Test interactive and non-interactive modes

## Related Files Modified

- `backend/src/models/user.js` - Added password hashing to update method
- `backend/src/routes/auth.js` - (Temporarily added debug logging, then removed)
- `docker-compose.yml` - (No changes, but critical to understanding deployment)

## Impact

**Before Fix**:
- ❌ Could not update admin passwords
- ❌ Script appeared to succeed but passwords didn't change
- ❌ Login failures with "Invalid credentials" error

**After Fix**:
- ✅ Can create new admin users
- ✅ Can update existing admin passwords
- ✅ Old passwords properly invalidated
- ✅ New passwords work immediately
- ✅ Proper bcrypt hashing on all password operations

## Deployment Notes

When deploying this fix to production:

1. **Pull latest code** with the User.update() fix
2. **Rebuild Docker image**:
   ```bash
   docker-compose build
   ```
3. **Deploy with recreate**:
   ```bash
   docker-compose up -d --force-recreate
   ```
4. **Reset admin credentials** using the script:
   ```bash
   ./scripts/set-admin.sh admin@yourdomain.com YourSecurePassword "Admin Name" --yes
   ```
5. **Verify login** via web interface or API

## Status

✅ **RESOLVED** - As of 2025-10-20

- Password hashing properly implemented in User.update()
- Docker container rebuilt with latest code
- All test cases passing
- Admin credential reset fully functional
- Documentation updated
