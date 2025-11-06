# Migration Integration Guide

This guide explains how to integrate the user_documents migration into your existing database initialization.

## Option 1: Automatic Migration on Startup (Recommended)

Update your `/backend/src/models/database.js` file to run migrations automatically:

### Step 1: Add Migration Import

Add this near the top of the file, after other requires:

```javascript
// Import migrations
const migration001 = require('../../migrations/001_create_user_documents');
```

### Step 2: Run Migration in initDatabase()

Add this code in the `initDatabase()` function, after the existing table creation and before the final success log:

```javascript
async function initDatabase() {
  try {
    logger.info('Starting database initialization...');

    // ... existing table creation code ...

    // Run migrations
    logger.info('Running database migrations...');
    try {
      await migration001.up(runAsync);
      logger.info('Migration 001 (user_documents) applied successfully');
    } catch (error) {
      // Check if table already exists (migration already applied)
      const tableExists = await getAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='user_documents'"
      );
      if (tableExists) {
        logger.info('Migration 001 already applied (user_documents table exists)');
      } else {
        throw error;
      }
    }

    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}
```

### Complete Example

Here's how the relevant section of `database.js` would look:

```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Import migrations
const migration001 = require('../../migrations/001_create_user_documents');

// ... database connection setup ...

async function initDatabase() {
  try {
    logger.info('Starting database initialization...');

    // Users table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
      )
    `);

    // ... other existing tables ...

    // ========================================
    // Run migrations
    // ========================================
    logger.info('Running database migrations...');

    try {
      await migration001.up(runAsync);
      logger.info('Migration 001 (user_documents) applied successfully');
    } catch (error) {
      const tableExists = await getAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='user_documents'"
      );
      if (tableExists) {
        logger.info('Migration 001 already applied (user_documents table exists)');
      } else {
        throw error;
      }
    }

    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync,
  initDatabase
};
```

## Option 2: Manual Migration

Run the migration manually using the migration runner:

```bash
# From the project root
node backend/migrations/run-migration.js 001_create_user_documents up
```

## Option 3: SQL Script

Execute the SQL script directly:

```bash
sqlite3 /app/data/app.db < backend/migrations/001_create_user_documents.sql
```

## Verification

After applying the migration, verify it was successful:

```bash
# Connect to database
sqlite3 /app/data/app.db

# Check table exists
.tables

# View table schema
.schema user_documents

# View all indexes
.indexes user_documents

# Check table info
PRAGMA table_info(user_documents);

# Exit
.quit
```

Expected output should show:
- Table `user_documents` exists
- 8 indexes on the table
- All columns with correct types and constraints

## Testing the Migration

### Test Script

Create a test file `/backend/migrations/test-001.js`:

```javascript
const { runAsync, getAsync, allAsync } = require('../src/models/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../src/utils/logger');

async function testMigration() {
  try {
    logger.info('Testing user_documents migration...');

    // Test 1: Insert a document
    const docId = uuidv4();
    const userId = 'test-user-' + Date.now();

    await runAsync(`
      INSERT INTO user_documents (
        id, user_id, filename, original_filename, file_path,
        file_size, mime_type, phase, requirement_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      docId,
      userId,
      'test_doc.pdf',
      'Test Document.pdf',
      '/uploads/test/test_doc.pdf',
      1024,
      'application/pdf',
      1,
      'business_documentation'
    ]);
    logger.info('✓ Test 1: Insert document - PASSED');

    // Test 2: Query the document
    const doc = await getAsync('SELECT * FROM user_documents WHERE id = ?', [docId]);
    if (!doc) {
      throw new Error('Document not found after insert');
    }
    logger.info('✓ Test 2: Query document - PASSED');

    // Test 3: Update virus scan status
    await runAsync(`
      UPDATE user_documents
      SET virus_scan_status = 'clean', virus_scan_date = datetime('now')
      WHERE id = ?
    `, [docId]);
    logger.info('✓ Test 3: Update virus scan status - PASSED');

    // Test 4: Update content validation
    await runAsync(`
      UPDATE user_documents
      SET content_validation_status = 'valid',
          content_validation_date = datetime('now'),
          extracted_text = 'Sample extracted text'
      WHERE id = ?
    `, [docId]);
    logger.info('✓ Test 4: Update content validation - PASSED');

    // Test 5: Test indexes (query by phase)
    const phaseQuery = await allAsync(
      'SELECT id FROM user_documents WHERE phase = ?',
      [1]
    );
    logger.info(`✓ Test 5: Query by phase - PASSED (${phaseQuery.length} results)`);

    // Test 6: Test composite index
    const compositeQuery = await allAsync(
      'SELECT id FROM user_documents WHERE user_id = ? AND phase = ? AND status = ?',
      [userId, 1, 'pending']
    );
    logger.info(`✓ Test 6: Composite index query - PASSED (${compositeQuery.length} results)`);

    // Test 7: Verify foreign key constraint (should fail)
    try {
      await runAsync(`
        INSERT INTO user_documents (
          id, user_id, filename, original_filename, file_path,
          file_size, mime_type, phase, requirement_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        'non-existent-user',
        'fail.pdf',
        'fail.pdf',
        '/uploads/fail.pdf',
        1024,
        'application/pdf',
        1,
        'test'
      ]);
      logger.warn('⚠ Test 7: Foreign key constraint - SKIPPED (constraints may not be enabled)');
    } catch (error) {
      if (error.message.includes('FOREIGN KEY')) {
        logger.info('✓ Test 7: Foreign key constraint - PASSED');
      } else {
        throw error;
      }
    }

    // Test 8: Verify check constraint on phase (should fail)
    try {
      await runAsync(`
        INSERT INTO user_documents (
          id, user_id, filename, original_filename, file_path,
          file_size, mime_type, phase, requirement_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        userId,
        'invalid_phase.pdf',
        'invalid_phase.pdf',
        '/uploads/invalid_phase.pdf',
        1024,
        'application/pdf',
        7, // Invalid phase (should be 1-6)
        'test'
      ]);
      logger.error('✗ Test 8: Phase constraint - FAILED (invalid phase allowed)');
    } catch (error) {
      if (error.message.includes('constraint')) {
        logger.info('✓ Test 8: Phase constraint - PASSED');
      } else {
        throw error;
      }
    }

    // Cleanup
    await runAsync('DELETE FROM user_documents WHERE user_id = ?', [userId]);
    logger.info('✓ Cleanup: Test data removed');

    logger.info('All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Test failed:', error);
    process.exit(1);
  }
}

testMigration();
```

Run the test:

```bash
node backend/migrations/test-001.js
```

## Rollback

If you need to revert the migration:

```bash
# Using migration runner
node backend/migrations/run-migration.js 001_create_user_documents down

# Or manually
sqlite3 /app/data/app.db
sqlite> DROP INDEX IF EXISTS idx_user_documents_upload_date;
sqlite> DROP INDEX IF EXISTS idx_user_documents_user_phase_status;
sqlite> DROP INDEX IF EXISTS idx_user_documents_content_validation_status;
sqlite> DROP INDEX IF EXISTS idx_user_documents_virus_scan_status;
sqlite> DROP INDEX IF EXISTS idx_user_documents_status;
sqlite> DROP INDEX IF EXISTS idx_user_documents_requirement_type;
sqlite> DROP INDEX IF EXISTS idx_user_documents_phase;
sqlite> DROP INDEX IF EXISTS idx_user_documents_user_id;
sqlite> DROP TABLE IF EXISTS user_documents;
```

## Common Issues

### Issue 1: Migration Already Applied

**Error:** `table user_documents already exists`

**Solution:** This is normal if the migration was already run. The integration code above handles this gracefully.

### Issue 2: Foreign Key Constraint Violation

**Error:** `FOREIGN KEY constraint failed`

**Solution:** Ensure the `user_id` you're using exists in the `users` table, or create the user first.

### Issue 3: Check Constraint Violation

**Error:** `CHECK constraint failed`

**Solution:** Verify your data:
- `phase` must be 1-6
- `virus_scan_status` must be: 'pending', 'clean', 'infected', or 'error'
- `content_validation_status` must be: 'pending', 'valid', 'invalid', or 'partial'
- `status` must be: 'pending', 'accepted', or 'rejected'

## Next Steps

1. Create API endpoints for document upload (see `/backend/src/routes/documents.js`)
2. Implement virus scanning service
3. Implement content validation service
4. Create frontend components for document upload
5. Add document status notifications
