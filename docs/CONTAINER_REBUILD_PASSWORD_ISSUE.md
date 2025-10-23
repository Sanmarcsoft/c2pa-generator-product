# Container Rebuild Password Reset Issue

## Problem

After running `docker-compose up -d --build`, admin login credentials stop working even though:
- The database file (`./data/app.db`) still exists
- User accounts still exist in the database
- Password hashes appear intact

## Root Cause

During container rebuild with `--build` flag, there's a race condition or database locking issue that can corrupt password hashes or cause them to be regenerated with different salt values.

## Symptoms

- Login works fine before rebuild
- After `docker-compose up -d --build`, same credentials fail with "Invalid credentials"
- Database shows users exist but password verification fails
- No error logs indicating obvious issues

## Solution

After any container rebuild, reset admin passwords using the environment variable method:

```bash
# Reset admin password after rebuild
docker exec -e ADMIN_EMAIL="matt@sanmarcsoft.com" \
  -e ADMIN_PASSWORD="NewPassword456" \
  -e ADMIN_NAME="Matt Stevens" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js
```

## Prevention Strategy

### Option 1: Don't Use --build for Minor Changes

For frontend-only changes, restart without rebuilding:

```bash
# Just restart container (no rebuild)
docker-compose restart
```

### Option 2: Backup Database Before Rebuild

```bash
# Backup database
cp ./data/app.db ./data/app.db.backup

# Rebuild container
docker-compose up -d --build

# If passwords fail, restore backup
cp ./data/app.db.backup ./data/app.db
docker-compose restart
```

### Option 3: Use Volume for Database (Already Configured)

The docker-compose.yml already has volume mount:
```yaml
volumes:
  - ./data:/app/data  # ✓ Already configured
```

This prevents data loss but doesn't prevent the password corruption issue.

## Quick Recovery

If you find yourself locked out after a rebuild:

```bash
# Method 1: Environment variables (recommended)
docker exec -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="YourPassword123" \
  -e ADMIN_NAME="Admin User" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js

# Method 2: Interactive mode
docker exec -it c2pa-generator-assistant node scripts/create-admin.js
# Then enter password when prompted

# Verify login works
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"YourPassword123"}' \
  | jq '.success'
# Should return: true
```

## Root Cause Investigation

The issue appears to be related to:

1. **SQLite file locking** - Database might be locked during container shutdown
2. **bcrypt salt rounds** - Password hashes regenerated with different salts
3. **Timing issues** - Database writes not fully committed before container stops
4. **Docker layer caching** - Old node_modules might have different bcrypt version

## Recommended Development Workflow

```bash
# 1. For frontend changes (CSS, JSX, etc.)
#    - No rebuild needed if using mounted volumes
docker-compose restart

# 2. For backend changes (routes, models, etc.)
#    - Rebuild required
docker-compose up -d --build
# Immediately reset passwords
docker exec -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="AdminPass2025" \
  -e ADMIN_NAME="Admin" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js

# 3. For dependency changes (package.json)
#    - Full rebuild with no cache
docker-compose build --no-cache
docker-compose up -d
# Reset passwords
```

## Permanent Fix (Future)

To prevent this issue in future versions, consider:

1. **Add database migration system** - Track schema and data versions
2. **Implement graceful shutdown** - Ensure database writes complete before container stops
3. **Add health checks** - Verify database integrity on startup
4. **Use connection pooling** - Reduce lock contention
5. **Store passwords separately** - Use external secret management

## Monitoring

Check if passwords need reset:

```bash
# Test login
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"YourKnownPassword"}' \
  | jq '.success'

# If returns `null` or `false`, passwords need reset
```

## Related Documentation

- `docs/ADMIN_PASSWORD_SPECIAL_CHARS.md` - Password special character handling
- `docs/TROUBLESHOOTING_LOGIN.md` - General login troubleshooting
- `scripts/set-admin.sh` - Admin password reset script

## Current Working Credentials (After Latest Reset)

**Last Updated**: 2025-10-20 17:10 UTC

```
Email: matt@sanmarcsoft.com
Password: NewPassword456
```

**Note**: These work immediately after the password reset script runs. If container is rebuilt, they may need to be reset again.

## Workaround Script

Create a helper script to always reset passwords after rebuild:

```bash
#!/bin/bash
# save as: reset-admin-after-rebuild.sh

echo "Rebuilding container..."
docker-compose up -d --build

echo "Waiting for container to start..."
sleep 10

echo "Resetting admin passwords..."
docker exec -e ADMIN_EMAIL="matt@sanmarcsoft.com" \
  -e ADMIN_PASSWORD="NewPassword456" \
  -e ADMIN_NAME="Matt Stevens" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js

echo "Testing login..."
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"matt@sanmarcsoft.com","password":"NewPassword456"}' \
  | jq '.success'

echo "Done! Login should work now."
```

Usage:
```bash
chmod +x reset-admin-after-rebuild.sh
./reset-admin-after-rebuild.sh
```

---

**Status**: Known Issue - Workaround Available
**Priority**: Medium (workaround exists but requires manual intervention)
**Target Fix**: v2.0
