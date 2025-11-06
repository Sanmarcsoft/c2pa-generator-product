# User Documents Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          user_documents                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ Primary Key                                                              │
│  • id (TEXT) - UUID                                                      │
│                                                                          │
│ Foreign Keys                                                             │
│  • user_id (TEXT) → users(id) ON DELETE CASCADE                         │
│                                                                          │
│ File Information                                                         │
│  • filename (TEXT) - Sanitized storage name                             │
│  • original_filename (TEXT) - User's original name                      │
│  • file_path (TEXT) - Storage location                                  │
│  • file_size (INTEGER) - Size in bytes                                  │
│  • mime_type (TEXT) - e.g., application/pdf                             │
│                                                                          │
│ C2PA Certification Context                                              │
│  • phase (INTEGER) - Certification phase [1-6] ✓                        │
│  • requirement_type (TEXT) - Requirement category                       │
│                                                                          │
│ Timestamps                                                               │
│  • upload_date (TEXT) - ISO 8601 timestamp                              │
│                                                                          │
│ Security Scanning                                                        │
│  • virus_scan_status (TEXT) - ['pending','clean','infected','error'] ✓  │
│  • virus_scan_date (TEXT) - Last scan timestamp                         │
│                                                                          │
│ Content Validation                                                       │
│  • content_validation_status (TEXT) - ['pending','valid','invalid',     │
│                                        'partial'] ✓                      │
│  • content_validation_date (TEXT) - Last validation timestamp           │
│  • extracted_text (TEXT) - OCR/extracted content for search             │
│                                                                          │
│ Review Workflow                                                          │
│  • status (TEXT) - ['pending','accepted','rejected'] ✓                  │
│  • rejection_reason (TEXT) - Reason if rejected                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ FK: user_id
                                    ↓
                            ┌───────────────┐
                            │     users     │
                            ├───────────────┤
                            │ id (PK)       │
                            │ email         │
                            │ password_hash │
                            │ role          │
                            │ name          │
                            │ created_at    │
                            │ last_login    │
                            └───────────────┘

✓ = CHECK constraint enforced
```

## Indexes Overview

```
Performance Optimization Strategy:

Single Column Indexes:
├── idx_user_documents_user_id (user_id)
│   Purpose: User-specific queries (most common access pattern)
│   Query Pattern: SELECT * WHERE user_id = ?
│
├── idx_user_documents_phase (phase)
│   Purpose: Phase-based filtering in certification workflow
│   Query Pattern: SELECT * WHERE phase = ?
│
├── idx_user_documents_requirement_type (requirement_type)
│   Purpose: Filter by requirement category
│   Query Pattern: SELECT * WHERE requirement_type = ?
│
├── idx_user_documents_status (status)
│   Purpose: Status filtering (pending reviews, etc.)
│   Query Pattern: SELECT * WHERE status = ?
│
├── idx_user_documents_virus_scan_status (virus_scan_status)
│   Purpose: Security monitoring and batch scanning
│   Query Pattern: SELECT * WHERE virus_scan_status = 'pending'
│
└── idx_user_documents_content_validation_status (content_validation_status)
    Purpose: Quality monitoring and batch validation
    Query Pattern: SELECT * WHERE content_validation_status = 'pending'

Composite Indexes:
├── idx_user_documents_user_phase_status (user_id, phase, status)
│   Purpose: Most common compound query pattern
│   Query Pattern: SELECT * WHERE user_id = ? AND phase = ? AND status = ?
│
└── idx_user_documents_upload_date (upload_date DESC)
    Purpose: Chronological sorting (newest first)
    Query Pattern: SELECT * ORDER BY upload_date DESC
```

## Data Flow Diagram

```
Document Upload Lifecycle:

1. UPLOAD
   ┌──────────────┐
   │   User       │
   │  Uploads     │
   │  Document    │
   └──────┬───────┘
          │
          ↓
   ┌──────────────────────────┐
   │ Create record:            │
   │ - id = UUID               │
   │ - status = 'pending'      │
   │ - virus_scan_status =     │
   │   'pending'               │
   │ - content_validation_     │
   │   status = 'pending'      │
   └──────┬───────────────────┘
          │
          ↓
2. VIRUS SCAN
   ┌──────────────────────────┐
   │ Security Service         │
   │ Scans file               │
   └──────┬───────────────────┘
          │
          ├─→ CLEAN ──→ virus_scan_status = 'clean'
          ├─→ INFECTED ──→ virus_scan_status = 'infected'
          └─→ ERROR ──→ virus_scan_status = 'error'
          │
          ↓
3. CONTENT VALIDATION (if clean)
   ┌──────────────────────────┐
   │ Validation Service       │
   │ - Extract text (OCR)     │
   │ - Validate content       │
   └──────┬───────────────────┘
          │
          ├─→ VALID ──→ content_validation_status = 'valid'
          ├─→ INVALID ──→ content_validation_status = 'invalid'
          └─→ PARTIAL ──→ content_validation_status = 'partial'
          │
          ↓
4. REVIEW
   ┌──────────────────────────┐
   │ Admin/System Review      │
   └──────┬───────────────────┘
          │
          ├─→ ACCEPT ──→ status = 'accepted'
          └─→ REJECT ──→ status = 'rejected'
                         + rejection_reason
```

## Sample Queries by Use Case

### Use Case 1: User Dashboard - Show My Documents
```sql
SELECT
    id,
    original_filename,
    phase,
    requirement_type,
    status,
    upload_date
FROM user_documents
WHERE user_id = ?
ORDER BY upload_date DESC;

-- Uses: idx_user_documents_user_id, idx_user_documents_upload_date
```

### Use Case 2: Phase Progress - Show Documents for Current Phase
```sql
SELECT
    COUNT(*) as total,
    SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
FROM user_documents
WHERE user_id = ? AND phase = ?;

-- Uses: idx_user_documents_user_phase_status
```

### Use Case 3: Security Dashboard - Pending Virus Scans
```sql
SELECT
    id,
    filename,
    upload_date,
    CAST((julianday('now') - julianday(upload_date)) * 24 AS INTEGER) as hours_waiting
FROM user_documents
WHERE virus_scan_status = 'pending'
ORDER BY upload_date ASC
LIMIT 100;

-- Uses: idx_user_documents_virus_scan_status
```

### Use Case 4: Validation Queue - Pending Content Validation
```sql
SELECT
    id,
    filename,
    mime_type,
    phase,
    requirement_type
FROM user_documents
WHERE virus_scan_status = 'clean'
  AND content_validation_status = 'pending'
ORDER BY upload_date ASC
LIMIT 50;

-- Uses: idx_user_documents_virus_scan_status,
--       idx_user_documents_content_validation_status
```

### Use Case 5: Search - Find Documents by Content
```sql
SELECT
    id,
    original_filename,
    phase,
    status
FROM user_documents
WHERE user_id = ?
  AND extracted_text LIKE ?
ORDER BY upload_date DESC;

-- Uses: idx_user_documents_user_id
-- Note: For better performance, consider FTS5 full-text search
```

### Use Case 6: Admin Review - Documents Needing Review
```sql
SELECT
    d.id,
    d.original_filename,
    d.phase,
    d.requirement_type,
    d.upload_date,
    u.email as user_email
FROM user_documents d
JOIN users u ON d.user_id = u.id
WHERE d.status = 'pending'
  AND d.virus_scan_status = 'clean'
  AND d.content_validation_status IN ('valid', 'partial')
ORDER BY d.upload_date ASC;

-- Uses: idx_user_documents_status,
--       idx_user_documents_virus_scan_status,
--       idx_user_documents_content_validation_status
```

## Storage Size Estimates

Assuming average document record:
- Text fields: ~500 bytes (filenames, paths, statuses)
- Extracted text: ~5KB (varies by document)
- Total per record: ~6KB

Storage projections:
- 1,000 documents = ~6 MB
- 10,000 documents = ~60 MB
- 100,000 documents = ~600 MB

Note: These estimates do NOT include the actual file storage, only database records.

## Performance Considerations

### Index Selectivity

High selectivity (efficient):
- user_id (many unique values)
- id (primary key, unique)

Medium selectivity:
- phase (6 possible values)
- status (3 possible values)
- requirement_type (varies by application)

Low selectivity (less efficient for large tables):
- virus_scan_status (4 possible values)
- content_validation_status (4 possible values)

### Query Optimization Tips

1. Always include user_id in WHERE clause when possible (best index usage)
2. Use composite index for multi-column filters (user_id + phase + status)
3. Limit result sets with pagination
4. Use covering indexes when querying only indexed columns
5. Consider FTS5 for full-text search on extracted_text

### Maintenance

Regular maintenance tasks:
```sql
-- Analyze table statistics for query optimizer
ANALYZE user_documents;

-- Check index usage (requires SQLite 3.30+)
EXPLAIN QUERY PLAN
SELECT * FROM user_documents WHERE user_id = 'test' AND phase = 1;

-- Vacuum to reclaim space (run periodically)
VACUUM;
```
