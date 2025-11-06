/**
 * Migration: Create user_documents table for C2PA certification document uploads
 * Version: 001
 * Created: 2025-11-04
 *
 * This migration adds comprehensive document upload tracking with:
 * - Security scanning (virus detection)
 * - Content validation
 * - Certification phase management (1-6)
 * - Requirement type tracking
 * - Document status workflow
 */

const logger = require('../src/utils/logger');

/**
 * Apply the migration (UP)
 * @param {object} db - Database connection with runAsync method
 */
async function up(runAsync) {
  try {
    logger.info('Running migration 001: Create user_documents table');

    // Create user_documents table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS user_documents (
        -- Primary identification
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,

        -- File identification and storage
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,

        -- C2PA certification context
        phase INTEGER NOT NULL CHECK(phase >= 1 AND phase <= 6),
        requirement_type TEXT NOT NULL,

        -- Timestamps
        upload_date TEXT NOT NULL DEFAULT (datetime('now')),

        -- Security scanning
        virus_scan_status TEXT NOT NULL DEFAULT 'pending'
            CHECK(virus_scan_status IN ('pending', 'clean', 'infected', 'error')),
        virus_scan_date TEXT,

        -- Content validation
        content_validation_status TEXT NOT NULL DEFAULT 'pending'
            CHECK(content_validation_status IN ('pending', 'valid', 'invalid', 'partial')),
        content_validation_date TEXT,
        extracted_text TEXT,

        -- Review status
        status TEXT NOT NULL DEFAULT 'pending'
            CHECK(status IN ('pending', 'accepted', 'rejected')),
        rejection_reason TEXT,

        -- Foreign key constraint
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    logger.info('Created user_documents table');

    // Create indexes for performance
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_user_id
      ON user_documents(user_id)
    `);
    logger.info('Created index: idx_user_documents_user_id');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_phase
      ON user_documents(phase)
    `);
    logger.info('Created index: idx_user_documents_phase');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_requirement_type
      ON user_documents(requirement_type)
    `);
    logger.info('Created index: idx_user_documents_requirement_type');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_status
      ON user_documents(status)
    `);
    logger.info('Created index: idx_user_documents_status');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_virus_scan_status
      ON user_documents(virus_scan_status)
    `);
    logger.info('Created index: idx_user_documents_virus_scan_status');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_content_validation_status
      ON user_documents(content_validation_status)
    `);
    logger.info('Created index: idx_user_documents_content_validation_status');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_user_phase_status
      ON user_documents(user_id, phase, status)
    `);
    logger.info('Created index: idx_user_documents_user_phase_status');

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_user_documents_upload_date
      ON user_documents(upload_date DESC)
    `);
    logger.info('Created index: idx_user_documents_upload_date');

    logger.info('Migration 001 completed successfully');
  } catch (error) {
    logger.error('Migration 001 failed:', error);
    throw error;
  }
}

/**
 * Revert the migration (DOWN)
 * @param {object} db - Database connection with runAsync method
 */
async function down(runAsync) {
  try {
    logger.info('Reverting migration 001: Drop user_documents table');

    // Drop indexes
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_upload_date');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_user_phase_status');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_content_validation_status');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_virus_scan_status');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_status');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_requirement_type');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_phase');
    await runAsync('DROP INDEX IF EXISTS idx_user_documents_user_id');
    logger.info('Dropped all user_documents indexes');

    // Drop table
    await runAsync('DROP TABLE IF EXISTS user_documents');
    logger.info('Dropped user_documents table');

    logger.info('Migration 001 reverted successfully');
  } catch (error) {
    logger.error('Migration 001 revert failed:', error);
    throw error;
  }
}

module.exports = {
  up,
  down
};
