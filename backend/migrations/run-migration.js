/**
 * Database Migration Runner
 *
 * Usage:
 *   node run-migration.js <migration-name> [up|down]
 *
 * Example:
 *   node run-migration.js 001_create_user_documents up
 *   node run-migration.js 001_create_user_documents down
 */

const path = require('path');
const { runAsync } = require('../src/models/database');
const logger = require('../src/utils/logger');

async function runMigration(migrationName, direction = 'up') {
  try {
    // Validate direction
    if (!['up', 'down'].includes(direction)) {
      throw new Error('Direction must be either "up" or "down"');
    }

    // Load migration file
    const migrationPath = path.join(__dirname, `${migrationName}.js`);
    logger.info(`Loading migration: ${migrationPath}`);

    const migration = require(migrationPath);

    // Validate migration has required methods
    if (typeof migration[direction] !== 'function') {
      throw new Error(`Migration does not export a "${direction}" function`);
    }

    // Run migration
    logger.info(`Running migration ${migrationName} (${direction})...`);
    await migration[direction](runAsync);
    logger.info(`Migration ${migrationName} (${direction}) completed successfully`);

    process.exit(0);
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`, error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('Usage: node run-migration.js <migration-name> [up|down]');
  console.error('Example: node run-migration.js 001_create_user_documents up');
  process.exit(1);
}

const migrationName = args[0];
const direction = args[1] || 'up';

runMigration(migrationName, direction);
