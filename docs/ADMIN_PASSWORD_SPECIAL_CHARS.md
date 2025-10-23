# Admin Password Reset - Special Characters Issue

## Problem

The `./scripts/set-admin.sh` script has difficulty handling passwords with special characters (`!`, `@`, `#`, `$`, etc.) due to bash shell escaping issues.

### Symptoms
- Script reports success but login fails with "Invalid credentials"
- Passwords WITHOUT special characters work fine
- Passwords WITH special characters don't match after reset

### Root Cause
Bash history expansion and special character interpretation causes the password to be altered before it reaches the Node.js script, even when using quotes.

## Workarounds

### Option 1: Use Simple Passwords (Recommended for CLI)

Use alphanumeric passwords with no special characters:

```bash
./scripts/set-admin.sh admin@example.com MySecurePass2025 "Admin Name" --yes
```

**Works with**:
- ✅ Letters: `a-z`, `A-Z`
- ✅ Numbers: `0-9`
- ✅ Underscores: `_`
- ✅ Hyphens: `-`

**Avoid in CLI**:
- ❌ Exclamation: `!`
- ❌ At sign: `@`
- ❌ Hash/Pound: `#`
- ❌ Dollar: `$`
- ❌ Percent: `%`
- ❌ Ampersand: `&`
- ❌ Asterisk: `*`

### Option 2: Use Environment Variables

Set the password via environment variable to avoid shell escaping:

```bash
export ADMIN_EMAIL="admin@example.com"
export ADMIN_PASSWORD="MyP@ssw0rd!2025"
export ADMIN_NAME="Admin User"
export ADMIN_FORCE="true"

docker exec c2pa-generator-assistant node scripts/create-admin.js
```

This bypasses the shell script entirely.

### Option 3: Use the Web Interface (After Initial Setup)

Once you have one working admin account:

1. Log in at http://localhost:8080/login
2. Go to Settings page
3. Use the user management interface (future feature)

### Option 4: Direct Docker Exec with Environment Variables

```bash
docker exec -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="MyP@ssw0rd!2025" \
  -e ADMIN_NAME="Admin User" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js
```

### Option 5: Interactive Mode

Run the script without arguments and enter the password interactively:

```bash
./scripts/set-admin.sh
```

Then paste the password when prompted (terminal input doesn't have the same escaping issues).

## Verification

After setting a password, verify it works:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"YourPassword"}' | jq '.success'
```

Should return: `true`

If it returns `null`, the password wasn't set correctly.

## Examples

### ✅ Working Examples

```bash
# Simple alphanumeric password
./scripts/set-admin.sh admin@example.com SecurePass2025 "Admin" --yes

# With underscore and hyphen
./scripts/set-admin.sh admin@example.com My_Secure-Pass2025 "Admin" --yes

# Using environment variables with special chars
export ADMIN_PASSWORD="MyP@ss!2025"
export ADMIN_EMAIL="admin@example.com"
export ADMIN_NAME="Admin"
export ADMIN_FORCE="true"
docker exec c2pa-generator-assistant node scripts/create-admin.js
```

### ❌ Problematic Examples (Don't Use)

```bash
# These will fail due to shell escaping
./scripts/set-admin.sh admin@example.com 'MyP@ss!2025' "Admin" --yes
./scripts/set-admin.sh admin@example.com "MyP@ss!2025" "Admin" --yes
./scripts/set-admin.sh admin@example.com MyP@ss!2025 "Admin" --yes
```

## Technical Details

### What's Happening

1. Bash interprets special characters even in quoted strings in certain contexts
2. History expansion (`!`) is particularly problematic
3. Docker exec adds another layer of shell interpretation
4. The password arrives at the Node.js script already modified

### Why Simple Passwords Work

Alphanumeric passwords don't trigger bash's special character handling:
- No history expansion
- No variable substitution
- No glob expansion
- No command substitution

## Recommended Password Policy

For CLI-based password resets, use passwords that:
- Are at least 12 characters long
- Mix uppercase and lowercase letters
- Include numbers
- Use underscores or hyphens for "special" characters
- **Example**: `My_Secure_Pass_2025`

For complex passwords with special characters:
- Use environment variable method
- Or set via web interface after initial setup
- Or use interactive mode

## Future Improvements

Potential fixes for a future release:
1. Modify `set-admin.sh` to use `printf '%s' "$PASSWORD"` piping
2. Add a `--password-file` option to read from a file
3. Add a `--password-stdin` option to read from stdin
4. Improve the web-based user management interface

## Current Working Credentials

**IMPORTANT**: These credentials work ONLY if you set them using the environment variable method shown above. If you used the `set-admin.sh` script with special characters, the password in the database may differ from what you typed.

**Last Verified**: 2025-10-20 16:58 UTC

```
Email: matt@sanmarcsoft.com
Password: NewPassword456
```

```
Email: admin@sanmarcsoft.com
Password: AdminPass2025
```

### How These Were Set

Both accounts were successfully set using the environment variable method:

```bash
docker exec -e ADMIN_EMAIL="matt@sanmarcsoft.com" \
  -e ADMIN_PASSWORD="NewPassword456" \
  -e ADMIN_NAME="Matt Stevens" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js
```

**Why This Matters**: If you previously tried to set passwords using `./scripts/set-admin.sh` and they didn't work, it's because bash escaped the special characters. The environment variable method bypasses bash shell escaping entirely.

## Quick Fix Script

Use this helper script for setting passwords with special characters:

```bash
#!/bin/bash
# save as: set-admin-safe.sh

EMAIL="$1"
PASSWORD="$2"
NAME="${3:-Admin User}"

docker exec -e ADMIN_EMAIL="$EMAIL" \
  -e ADMIN_PASSWORD="$PASSWORD" \
  -e ADMIN_NAME="$NAME" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js
```

Usage:
```bash
chmod +x set-admin-safe.sh
./set-admin-safe.sh admin@example.com 'MyP@ss!2025' "Admin Name"
```

## Support

If you continue to have issues:
1. Verify the container is running: `docker ps | grep c2pa`
2. Check logs: `docker logs c2pa-generator-assistant --tail 50`
3. Try the environment variable method (most reliable)
4. Use a simple password temporarily, then change it via web interface

---

**Last Updated**: 2025-10-20
**Status**: Known Issue - Workarounds Available
**Priority**: Medium (workarounds exist)
