# Database Migrations

This directory contains database migration scripts for the C2PA Generator Product application.

## Directory Structure

```
backend/migrations/
├── README.md                           # This file
├── run-migration.js                    # Migration runner utility
├── 001_create_user_documents.sql      # SQL version of migration
└── 001_create_user_documents.js       # JavaScript version of migration
```

## Migration 001: User Documents Table

**Purpose:** Create a comprehensive document upload tracking system for C2PA certification workflow.

**Features:**
- Document file storage tracking with sanitized and original filenames
- C2PA certification phase tracking (phases 1-6)
- Requirement type categorization
- Security scanning (virus detection) with status tracking
- Content validation with status tracking
- OCR/text extraction storage for search and analysis
- Document review workflow (pending, accepted, rejected)
- Performance-optimized indexes

### Schema Details

#### user_documents Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique document identifier (UUID) |
| user_id | TEXT | NOT NULL, FK to users | Owner of the document |
| filename | TEXT | NOT NULL | Sanitized filename for storage |
| original_filename | TEXT | NOT NULL | User's original filename |
| file_path | TEXT | NOT NULL | Path to stored file |
| file_size | INTEGER | NOT NULL | Size in bytes |
| mime_type | TEXT | NOT NULL | MIME type (e.g., application/pdf) |
| phase | INTEGER | NOT NULL, 1-6 | C2PA certification phase |
| requirement_type | TEXT | NOT NULL | Which requirement this fulfills |
| upload_date | TEXT | NOT NULL, DEFAULT now | Upload timestamp |
| virus_scan_status | TEXT | NOT NULL, DEFAULT 'pending' | 'pending', 'clean', 'infected', 'error' |
| virus_scan_date | TEXT | NULL | Timestamp of last virus scan |
| content_validation_status | TEXT | NOT NULL, DEFAULT 'pending' | 'pending', 'valid', 'invalid', 'partial' |
| content_validation_date | TEXT | NULL | Timestamp of last validation |
| extracted_text | TEXT | NULL | OCR or extracted content |
| status | TEXT | NOT NULL, DEFAULT 'pending' | 'pending', 'accepted', 'rejected' |
| rejection_reason | TEXT | NULL | Reason if status is 'rejected' |

#### Indexes

The following indexes are created for optimal query performance:

1. **idx_user_documents_user_id** - User-specific queries (most common)
2. **idx_user_documents_phase** - Phase-based filtering
3. **idx_user_documents_requirement_type** - Requirement filtering
4. **idx_user_documents_status** - Status filtering
5. **idx_user_documents_virus_scan_status** - Security monitoring
6. **idx_user_documents_content_validation_status** - Quality monitoring
7. **idx_user_documents_user_phase_status** - Composite index for common query pattern
8. **idx_user_documents_upload_date** - Date sorting and filtering

## Running Migrations

### Using the Migration Runner (Recommended)

```bash
# Apply migration (UP)
node backend/migrations/run-migration.js 001_create_user_documents up

# Revert migration (DOWN)
node backend/migrations/run-migration.js 001_create_user_documents down
```

### Using SQLite CLI

```bash
# Apply migration
sqlite3 /app/data/app.db < backend/migrations/001_create_user_documents.sql

# Revert migration (manual)
sqlite3 /app/data/app.db
sqlite> DROP INDEX IF EXISTS idx_user_documents_upload_date;
sqlite> DROP INDEX IF EXISTS idx_user_documents_user_phase_status;
sqlite> -- ... (see DOWN MIGRATION section in SQL file)
sqlite> DROP TABLE IF EXISTS user_documents;
```

### Integration with Application Startup

To automatically run migrations on application startup, add this to your `initDatabase()` function in `/backend/src/models/database.js`:

```javascript
// Run migrations
const migration001 = require('../../migrations/001_create_user_documents');
await migration001.up(runAsync);
```

## Example Queries

### Insert a new document

```sql
INSERT INTO user_documents (
    id, user_id, filename, original_filename, file_path, file_size,
    mime_type, phase, requirement_type
) VALUES (
    'doc-123e4567-e89b-12d3-a456-426614174000',
    'user-456',
    'sanitized_business_license.pdf',
    'Business License 2024.pdf',
    '/uploads/2024/11/sanitized_business_license.pdf',
    2048576,
    'application/pdf',
    1,
    'business_documentation'
);
```

### Get all documents for a user in a specific phase

```sql
SELECT *
FROM user_documents
WHERE user_id = 'user-456'
  AND phase = 1
  AND status = 'pending'
ORDER BY upload_date DESC;
```

### Find documents pending virus scan

```sql
SELECT id, filename, upload_date
FROM user_documents
WHERE virus_scan_status = 'pending'
ORDER BY upload_date ASC
LIMIT 100;
```

### Get document statistics by phase

```sql
SELECT
    phase,
    COUNT(*) as total_documents,
    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM user_documents
WHERE user_id = 'user-456'
GROUP BY phase
ORDER BY phase;
```

### Search extracted text

```sql
SELECT id, original_filename, phase
FROM user_documents
WHERE user_id = 'user-456'
  AND extracted_text LIKE '%business registration%'
ORDER BY upload_date DESC;
```

## Data Integrity

### Foreign Key Constraints

- `user_id` references `users(id)` with `ON DELETE CASCADE`
  - When a user is deleted, all their documents are automatically deleted

### Check Constraints

- `phase` must be between 1 and 6 (inclusive)
- `virus_scan_status` must be one of: 'pending', 'clean', 'infected', 'error'
- `content_validation_status` must be one of: 'pending', 'valid', 'invalid', 'partial'
- `status` must be one of: 'pending', 'accepted', 'rejected'

## Best Practices

1. **File Storage:**
   - Store files outside the database in a dedicated uploads directory
   - Use `file_path` to reference the file location
   - Generate sanitized filenames to prevent security issues

2. **Virus Scanning:**
   - Update `virus_scan_status` immediately after scanning
   - Always record `virus_scan_date` when updating status
   - Handle 'infected' files appropriately (quarantine/delete)

3. **Content Validation:**
   - Validate document content matches the requirement type
   - Store extracted text for searchability
   - Update validation status and date together

4. **Document Review:**
   - When rejecting a document, always provide a `rejection_reason`
   - Notify users when their documents are accepted or rejected

## Security Considerations

1. **File Uploads:**
   - Validate MIME types on upload
   - Sanitize filenames before storage
   - Limit file sizes (enforce at application level)
   - Store files in a non-executable directory

2. **Access Control:**
   - Always filter by `user_id` to prevent unauthorized access
   - Implement proper authentication and authorization
   - Use prepared statements to prevent SQL injection

3. **Virus Scanning:**
   - Scan all uploads before marking as 'clean'
   - Quarantine or delete infected files immediately
   - Log all virus detection events

## Future Enhancements

1. **Full-Text Search:**
   - Enable SQLite FTS5 virtual table for advanced text search
   - Index `extracted_text` and `original_filename`

2. **Document Versioning:**
   - Add version tracking for document updates
   - Link document versions together

3. **Audit Trail:**
   - Track all status changes with timestamps
   - Record who approved/rejected documents

4. **File Metadata:**
   - Extract and store PDF metadata
   - Store image EXIF data
   - Track document page counts
