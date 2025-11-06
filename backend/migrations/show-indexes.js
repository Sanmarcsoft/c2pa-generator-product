/**
 * Display detailed index information for user_documents table
 */

const { allAsync } = require('../src/models/database');
const logger = require('../src/utils/logger');

async function showIndexes() {
  try {
    logger.info('Retrieving index details for user_documents table...\n');

    // Get all indexes for the table
    const indexes = await allAsync(`
      SELECT name FROM sqlite_master
      WHERE type='index' AND tbl_name='user_documents'
      AND name NOT LIKE 'sqlite_%'
    `);

    logger.info('=== INDEX DETAILS ===\n');

    for (const index of indexes) {
      // Get detailed information about each index
      const indexInfo = await allAsync(`PRAGMA index_info(${index.name})`);

      const columns = indexInfo.map(info => info.name).join(', ');
      logger.info(`Index: ${index.name}`);
      logger.info(`  Columns: ${columns}`);
      logger.info(`  Column count: ${indexInfo.length}\n`);
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error retrieving index information:', error);
    process.exit(1);
  }
}

showIndexes();
