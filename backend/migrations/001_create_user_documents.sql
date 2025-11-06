-- Migration: Create user_documents table for C2PA certification document uploads
-- Version: 001
-- Created: 2025-11-04
-- Description: Adds comprehensive document upload tracking with security scanning,
--              content validation, and certification phase management

-- ============================================================================
-- UP MIGRATION
-- ============================================================================

-- Create user_documents table
CREATE TABLE IF NOT EXISTS user_documents (
    -- Primary identification
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- File identification and storage
    filename TEXT NOT NULL,              -- Sanitized filename for storage
    original_filename TEXT NOT NULL,     -- User's original filename
    file_path TEXT NOT NULL,             -- Path to stored file (relative to uploads directory)
    file_size INTEGER NOT NULL,          -- Size in bytes
    mime_type TEXT NOT NULL,             -- MIME type (e.g., application/pdf, image/jpeg)

    -- C2PA certification context
    phase INTEGER NOT NULL CHECK(phase >= 1 AND phase <= 6),  -- Certification phase (1-6)
    requirement_type TEXT NOT NULL,      -- Which requirement this document fulfills

    -- Timestamps
    upload_date TEXT NOT NULL DEFAULT (datetime('now')),

    -- Security scanning
    virus_scan_status TEXT NOT NULL DEFAULT 'pending'
        CHECK(virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
    virus_scan_date TEXT,                -- Timestamp of last virus scan

    -- Content validation
    content_validation_status TEXT NOT NULL DEFAULT 'pending'
        CHECK(content_validation_status IN ('pending', 'valid', 'invalid', 'partial')),
    content_validation_date TEXT,        -- Timestamp of last validation
    extracted_text TEXT,                 -- OCR or extracted content for search/analysis

    -- Review status
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK(status IN ('pending', 'accepted', 'rejected')),
    rejection_reason TEXT,               -- Reason if status is 'rejected'

    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for user-specific queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_user_documents_user_id
    ON user_documents(user_id);

-- Index for phase-based filtering (essential for C2PA workflow)
CREATE INDEX IF NOT EXISTS idx_user_documents_phase
    ON user_documents(phase);

-- Index for requirement type filtering
CREATE INDEX IF NOT EXISTS idx_user_documents_requirement_type
    ON user_documents(requirement_type);

-- Index for status filtering (pending reviews, accepted docs, etc.)
CREATE INDEX IF NOT EXISTS idx_user_documents_status
    ON user_documents(status);

-- Index for virus scan status (security monitoring)
CREATE INDEX IF NOT EXISTS idx_user_documents_virus_scan_status
    ON user_documents(virus_scan_status);

-- Index for content validation status (quality monitoring)
CREATE INDEX IF NOT EXISTS idx_user_documents_content_validation_status
    ON user_documents(content_validation_status);

-- Composite index for common query pattern: user + phase + status
CREATE INDEX IF NOT EXISTS idx_user_documents_user_phase_status
    ON user_documents(user_id, phase, status);

-- Index for upload date sorting and filtering
CREATE INDEX IF NOT EXISTS idx_user_documents_upload_date
    ON user_documents(upload_date DESC);

-- Full-text search index on extracted text (if SQLite FTS is enabled)
-- Note: This is commented out by default. Enable if you need full-text search.
-- CREATE VIRTUAL TABLE IF NOT EXISTS user_documents_fts USING fts5(
--     id UNINDEXED,
--     original_filename,
--     extracted_text,
--     content='user_documents',
--     content_rowid='rowid'
-- );

-- ============================================================================
-- DOWN MIGRATION
-- ============================================================================

-- To revert this migration, run the following commands:
-- DROP INDEX IF EXISTS idx_user_documents_upload_date;
-- DROP INDEX IF EXISTS idx_user_documents_user_phase_status;
-- DROP INDEX IF EXISTS idx_user_documents_content_validation_status;
-- DROP INDEX IF EXISTS idx_user_documents_virus_scan_status;
-- DROP INDEX IF EXISTS idx_user_documents_status;
-- DROP INDEX IF EXISTS idx_user_documents_requirement_type;
-- DROP INDEX IF EXISTS idx_user_documents_phase;
-- DROP INDEX IF EXISTS idx_user_documents_user_id;
-- DROP TABLE IF EXISTS user_documents;
