# Database Backup and Restore System

## Overview

The C2PA Generator Product Certification Assistant includes an automated database backup and restore system to ensure data persistence across Docker container rebuilds. This system prevents data loss during development and production deployments.

## Features

- **Automatic Backup**: Backups created before every Docker rebuild
- **Automatic Restore**: Database restored from backup on container startup if needed
- **Timestamped Backups**: Multiple backup versions stored with timestamps
- **Safety Backups**: Pre-restore safety backups created automatically
- **Manual Tools**: Scripts for manual backup, restore, and rebuild operations

## Quick Start

### Safe Docker Rebuild (Recommended)

Use this script instead of `docker-compose up -d --build`:

```bash
./scripts/rebuild-with-backup.sh
```

This script will:
1. Automatically backup the database
2. Stop the container
3. Rebuild the container
4. Start the container
5. Prompt to reset admin passwords

### Full Rebuild (No Cache)

```bash
./scripts/rebuild-with-backup.sh --no-cache
```

## Manual Operations

### Manual Backup

Create a timestamped backup of the current database:

```bash
./scripts/backup-db.sh
```

Output:
- Timestamped backup: `data/backups/app.db.YYYYMMDD_HHMMSS`
- Latest backup: `data/app.db.backup` (used for auto-restore)

### Manual Restore

Restore database from the latest backup:

```bash
./scripts/restore-db.sh
```

Restore from a specific timestamped backup:

```bash
./scripts/restore-db.sh data/backups/app.db.20251020_153045
```

The restore script will:
1. Create a safety backup of the current database
2. Prompt for confirmation
3. Restore the backup
4. Provide instructions for restarting the container

## How It Works

### Automatic Backup System

The `rebuild-with-backup.sh` script performs these steps:

```
1. Run backup-db.sh
   └─> Create timestamped backup: data/backups/app.db.TIMESTAMP
   └─> Update latest backup: data/app.db.backup

2. Stop container
   └─> docker-compose stop

3. Rebuild container
   └─> docker-compose build [--no-cache]

4. Start container
   └─> docker-compose up -d
   └─> Auto-restore checks on startup

5. Optional: Reset admin passwords
   └─> ./scripts/set-admin.sh
```

### Automatic Restore System

The application checks for database restoration needs on every startup:

```javascript
// backend/scripts/auto-restore-db.js

1. Check if restore flag exists
   └─> data/.restore-from-backup

2. Check database status
   └─> Database missing + backup exists = Auto-restore
   └─> Database exists + restore flag = Auto-restore with safety backup
   └─> Database exists + no flag = Normal startup

3. Perform restore if needed
   └─> Create safety backup (if current database exists)
   └─> Copy backup to database location
   └─> Remove restore flag
```

Integrated into application startup in `backend/src/app.js`:

```javascript
async function startServer() {
  // Step 1: Auto-restore database from backup if needed
  const { checkAndRestore } = require('../scripts/auto-restore-db');
  await checkAndRestore();

  // Step 2: Initialize database
  await initDatabase();

  // Step 3: Start server
  // ...
}
```

## File Structure

```
data/
├── app.db                        # Main database
├── app.db.backup                 # Latest backup (used for auto-restore)
├── app.db.before-restore         # Safety backup created before restore
├── app.db.before-auto-restore    # Safety backup from automatic restore
└── backups/                      # Timestamped backup archive
    ├── app.db.20251020_143000
    ├── app.db.20251020_150000
    └── ... (keeps last 10 backups)
```

## Scripts Reference

### `scripts/backup-db.sh`

Creates database backups with timestamps.

**Usage:**
```bash
./scripts/backup-db.sh
```

**Output:**
- Creates timestamped backup in `data/backups/`
- Updates `data/app.db.backup` (latest backup reference)
- Maintains up to 10 timestamped backups (auto-cleanup)

**Exit Codes:**
- `0`: Backup successful
- `1`: Backup failed

### `scripts/restore-db.sh`

Restores database from backup.

**Usage:**
```bash
# Restore from latest backup
./scripts/restore-db.sh

# Restore from specific backup
./scripts/restore-db.sh data/backups/app.db.20251020_143000
```

**Safety Features:**
- Creates safety backup before restore
- Prompts for confirmation
- Shows file sizes for verification

**Exit Codes:**
- `0`: Restore successful
- `1`: Restore failed or cancelled

### `scripts/rebuild-with-backup.sh`

Safe Docker container rebuild with automatic backup.

**Usage:**
```bash
# Standard rebuild
./scripts/rebuild-with-backup.sh

# Full rebuild (no cache)
./scripts/rebuild-with-backup.sh --no-cache
```

**Process:**
1. Automatic database backup
2. Container stop
3. Container rebuild
4. Container start
5. Health check monitoring
6. Optional password reset

**Exit Codes:**
- `0`: Rebuild successful
- `1`: Backup, build, or startup failed

### `backend/scripts/auto-restore-db.js`

Automatic database restore on application startup.

**Usage:**
```bash
# Manual execution (for testing)
node backend/scripts/auto-restore-db.js
```

**Automatic Execution:**
- Runs automatically during application startup
- Integrated into `backend/src/app.js`

**Behavior:**
- Checks for backup availability
- Restores if database missing or restore requested
- Creates safety backups
- Logs detailed status information

## Docker Compose Integration

The database is persisted using Docker volumes:

```yaml
services:
  c2pa-assistant:
    volumes:
      - ./data:/app/data   # Database persistence
      - ./logs:/app/logs   # Log persistence
```

This ensures that:
- Database survives container restarts
- Backups are accessible from host machine
- Data persists across container rebuilds

## Best Practices

### Development Workflow

1. **For frontend-only changes (CSS, JSX):**
   ```bash
   docker-compose restart
   # No rebuild needed, no backup needed
   ```

2. **For backend changes (routes, API):**
   ```bash
   ./scripts/rebuild-with-backup.sh
   # Automatic backup + rebuild + restore if needed
   ```

3. **For dependency changes (package.json):**
   ```bash
   ./scripts/rebuild-with-backup.sh --no-cache
   # Full rebuild with backup
   ```

### Production Workflow

1. **Before deployment:**
   ```bash
   ./scripts/backup-db.sh
   ```

2. **Deploy with rebuild:**
   ```bash
   ./scripts/rebuild-with-backup.sh
   ```

3. **Verify deployment:**
   ```bash
   docker logs -f c2pa-generator-assistant
   # Check for auto-restore success messages
   ```

4. **Reset passwords (if needed):**
   ```bash
   ./scripts/set-admin.sh admin@example.com 'SecurePass123' 'Admin Name'
   ```

## Troubleshooting

### Database Not Restoring

**Symptom:** Container starts but database is empty or old

**Solution:**
```bash
# Stop container
docker-compose stop

# Manually restore from latest backup
./scripts/restore-db.sh

# Start container
docker-compose start
```

### Backup Failed During Rebuild

**Symptom:** `rebuild-with-backup.sh` exits with backup error

**Solution:**
```bash
# Check if database file exists and is readable
ls -lah data/app.db

# Check permissions
chmod 644 data/app.db

# Try manual backup
./scripts/backup-db.sh

# If successful, retry rebuild
./scripts/rebuild-with-backup.sh
```

### Multiple Restore Attempts

**Symptom:** Auto-restore runs on every startup

**Solution:**
```bash
# Remove restore flag manually
rm -f data/.restore-from-backup

# Restart container
docker-compose restart
```

### Backup Directory Full

**Symptom:** Too many timestamped backups

**Note:** System automatically keeps only last 10 backups

**Manual cleanup:**
```bash
# Remove old backups (keep last 5)
cd data/backups/
ls -t app.db.* | tail -n +6 | xargs rm -f
```

### Password Issues After Restore

**Symptom:** Cannot login after database restore

**Solution:**
```bash
# Reset admin passwords
./scripts/set-admin.sh matt@sanmarcsoft.com 'NewPassword456' 'Matt Stevens'

# Or use environment variable method
docker exec -e ADMIN_EMAIL="matt@sanmarcsoft.com" \
  -e ADMIN_PASSWORD="NewPassword456" \
  -e ADMIN_NAME="Matt Stevens" \
  -e ADMIN_FORCE="true" \
  c2pa-generator-assistant node scripts/create-admin.js
```

## Monitoring and Logs

### Check Backup Status

```bash
# View backup directory
ls -lth data/backups/

# Check latest backup
ls -lh data/app.db.backup

# View backup creation times
stat -f "%Sm %N" -t "%Y-%m-%d %H:%M:%S" data/backups/app.db.*
```

### Check Auto-Restore Logs

```bash
# View application startup logs
docker logs c2pa-generator-assistant | grep -i "restore\|backup"

# Real-time monitoring
docker logs -f c2pa-generator-assistant
```

Expected log messages:

```
Checking for database backup...
==================================================================
  C2PA Generator - Auto Database Restore
==================================================================
✓ Database exists and is ready
==================================================================
  Database Status
==================================================================
Database path: /app/data/app.db
Database size: 0.15 MB
Backup available: Yes
Backup size: 0.15 MB
==================================================================
✓ Auto-restore check completed successfully
```

## Related Documentation

- [Container Rebuild Password Issue](./CONTAINER_REBUILD_PASSWORD_ISSUE.md) - Password reset after rebuilds
- [Admin Password Special Characters](./ADMIN_PASSWORD_SPECIAL_CHARS.md) - Password handling
- [Troubleshooting Login](./TROUBLESHOOTING_LOGIN.md) - Login issues
- [GitHub RAG Setup](./GITHUB_RAG_SETUP.md) - Repository indexing persistence

## Technical Details

### Backup Format

- **Format:** SQLite database file (binary)
- **Size:** Typically 100-500 KB
- **Compression:** Not compressed (SQLite is already compact)
- **Verification:** File size and existence checks

### Restore Strategy

1. **Detection:** Check for missing database or restore flag
2. **Safety:** Create backup before overwriting
3. **Execution:** Direct file copy (fast, reliable)
4. **Verification:** Check database size after restore
5. **Cleanup:** Remove temporary flags

### Performance Impact

- **Backup time:** < 1 second for typical databases
- **Restore time:** < 1 second
- **Startup delay:** ~ 2-3 seconds for auto-restore check
- **Disk space:** ~ 1-5 MB for 10 timestamped backups

## Security Considerations

### Backup Security

- Backups stored in `data/` directory (same permissions as database)
- Not included in Git (see `.gitignore`)
- Should be included in system backups
- Consider encrypting backups for production

### Access Control

- Scripts require filesystem access
- No network exposure of backup files
- Restore requires container restart (admin privilege)

### Sensitive Data

Database contains:
- User credentials (hashed passwords)
- GitHub tokens (encrypted)
- API keys (in `config/secrets.json`)
- User content and files

**Recommendation:** Store backups securely and limit access.

## Future Enhancements

Planned improvements for future versions:

1. **Automatic Scheduled Backups**
   - Cron job for daily backups
   - Configurable backup retention policy

2. **Remote Backup Storage**
   - S3/cloud storage integration
   - Encrypted remote backups

3. **Incremental Backups**
   - SQLite VACUUM and incremental backup
   - Reduced storage usage

4. **Backup Verification**
   - Checksum verification
   - Integrity checks before restore

5. **Web UI for Backup Management**
   - View backup history
   - Trigger manual backups
   - Restore from UI

---

**Last Updated:** 2025-10-20
**Version:** 1.0
**Status:** Production Ready
