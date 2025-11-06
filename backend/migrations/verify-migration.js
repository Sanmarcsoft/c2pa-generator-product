/**
 * Verification script for user_documents table migration
 * Checks table structure, columns, indexes, and foreign key constraints
 */

const { allAsync } = require('../src/models/database');
const logger = require('../src/utils/logger');

async function verifyMigration() {
  try {
    logger.info('Starting migration verification...');

    // 1. Check if table exists
    const tables = await allAsync(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='user_documents'
    `);

    if (tables.length === 0) {
      logger.error('VERIFICATION FAILED: user_documents table does not exist');
      process.exit(1);
    }

    logger.info('✓ Table user_documents exists');

    // 2. Get table schema
    const columns = await allAsync('PRAGMA table_info(user_documents)');

    logger.info('\n=== TABLE SCHEMA ===');
    logger.info(`Total columns: ${columns.length}`);
    columns.forEach(col => {
      logger.info(`  ${col.name}: ${col.type}${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
    });

    // 3. Verify required columns exist
    const requiredColumns = [
      'id', 'user_id', 'filename', 'original_filename', 'file_path',
      'file_size', 'mime_type', 'phase', 'requirement_type', 'upload_date',
      'virus_scan_status', 'virus_scan_date', 'content_validation_status',
      'content_validation_date', 'extracted_text', 'status', 'rejection_reason'
    ];

    const columnNames = columns.map(c => c.name);
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
      logger.error(`VERIFICATION FAILED: Missing columns: ${missingColumns.join(', ')}`);
      process.exit(1);
    }

    logger.info('✓ All required columns present');

    // 4. Get indexes
    const indexes = await allAsync(`
      SELECT name FROM sqlite_master
      WHERE type='index' AND tbl_name='user_documents'
      AND name NOT LIKE 'sqlite_%'
    `);

    logger.info('\n=== INDEXES ===');
    logger.info(`Total indexes: ${indexes.length}`);
    indexes.forEach(idx => {
      logger.info(`  ${idx.name}`);
    });

    // 5. Verify required indexes
    const requiredIndexes = [
      'idx_user_documents_user_id',
      'idx_user_documents_phase',
      'idx_user_documents_requirement_type',
      'idx_user_documents_status',
      'idx_user_documents_virus_scan_status',
      'idx_user_documents_content_validation_status',
      'idx_user_documents_user_phase_status',
      'idx_user_documents_upload_date'
    ];

    const indexNames = indexes.map(i => i.name);
    const missingIndexes = requiredIndexes.filter(idx => !indexNames.includes(idx));

    if (missingIndexes.length > 0) {
      logger.error(`VERIFICATION FAILED: Missing indexes: ${missingIndexes.join(', ')}`);
      process.exit(1);
    }

    logger.info('✓ All required indexes present');

    // 6. Check foreign key constraints
    const foreignKeys = await allAsync('PRAGMA foreign_key_list(user_documents)');

    logger.info('\n=== FOREIGN KEY CONSTRAINTS ===');
    logger.info(`Total foreign keys: ${foreignKeys.length}`);
    foreignKeys.forEach(fk => {
      logger.info(`  ${fk.from} -> ${fk.table}(${fk.to}) ON DELETE ${fk.on_delete}`);
    });

    if (foreignKeys.length === 0) {
      logger.error('VERIFICATION FAILED: No foreign key constraints found');
      process.exit(1);
    }

    // Verify user_id foreign key exists
    const userIdFk = foreignKeys.find(fk => fk.from === 'user_id' && fk.table === 'users');
    if (!userIdFk) {
      logger.error('VERIFICATION FAILED: user_id foreign key to users table not found');
      process.exit(1);
    }

    logger.info('✓ Foreign key constraint on user_id -> users(id) exists');

    // 7. Verify CHECK constraints by attempting to insert invalid data
    logger.info('\n=== VERIFYING CHECK CONSTRAINTS ===');

    // Try inserting with invalid phase (should fail)
    try {
      await allAsync(`
        INSERT INTO user_documents (
          id, user_id, filename, original_filename, file_path,
          file_size, mime_type, phase, requirement_type
        ) VALUES (
          'test-invalid-phase', 'test-user', 'test.pdf', 'test.pdf', '/test/test.pdf',
          1000, 'application/pdf', 7, 'test'
        )
      `);
      logger.error('VERIFICATION FAILED: CHECK constraint on phase not working (accepted invalid value 7)');
      process.exit(1);
    } catch (error) {
      logger.info('✓ CHECK constraint on phase (1-6) working correctly');
    }

    // Try inserting with invalid virus_scan_status (should fail)
    try {
      await allAsync(`
        INSERT INTO user_documents (
          id, user_id, filename, original_filename, file_path,
          file_size, mime_type, phase, requirement_type, virus_scan_status
        ) VALUES (
          'test-invalid-virus', 'test-user', 'test.pdf', 'test.pdf', '/test/test.pdf',
          1000, 'application/pdf', 1, 'test', 'invalid_status'
        )
      `);
      logger.error('VERIFICATION FAILED: CHECK constraint on virus_scan_status not working');
      process.exit(1);
    } catch (error) {
      logger.info('✓ CHECK constraint on virus_scan_status working correctly');
    }

    logger.info('\n=== VERIFICATION COMPLETE ===');
    logger.info('All checks passed! user_documents table is properly configured.');
    logger.info('\nSUMMARY:');
    logger.info(`  - ${columns.length} columns`);
    logger.info(`  - ${indexes.length} indexes`);
    logger.info(`  - ${foreignKeys.length} foreign key constraint(s)`);
    logger.info('  - CHECK constraints validated');

    process.exit(0);
  } catch (error) {
    logger.error('Verification error:', error);
    process.exit(1);
  }
}

verifyMigration();
