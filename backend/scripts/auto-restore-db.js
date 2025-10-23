#!/usr/bin/env node

/**
 * Automatic Database Restore Script
 * Runs on application startup to restore database from backup if needed
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');
const DB_PATH = path.join(PROJECT_ROOT, 'data/app.db');
const BACKUP_PATH = path.join(PROJECT_ROOT, 'data/app.db.backup');
const RESTORE_FLAG = path.join(PROJECT_ROOT, 'data/.restore-from-backup');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function checkAndRestore() {
  log('\n==================================================================', colors.blue);
  log('  C2PA Generator - Auto Database Restore', colors.blue);
  log('==================================================================\n', colors.blue);

  // Check if restore flag exists (indicates rebuild happened)
  const shouldRestore = fs.existsSync(RESTORE_FLAG);

  if (shouldRestore) {
    log('Restore flag detected. Attempting automatic restore...', colors.yellow);
  }

  // Check if database exists
  const dbExists = fs.existsSync(DB_PATH);
  const backupExists = fs.existsSync(BACKUP_PATH);

  if (!dbExists && backupExists) {
    log('Database not found but backup exists. Restoring...', colors.yellow);

    try {
      // Create data directory if it doesn't exist
      const dataDir = path.dirname(DB_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        log(`✓ Created data directory: ${dataDir}`, colors.green);
      }

      // Copy backup to database location
      fs.copyFileSync(BACKUP_PATH, DB_PATH);
      log('✓ Database restored from backup successfully', colors.green);

      // Remove restore flag
      if (fs.existsSync(RESTORE_FLAG)) {
        fs.unlinkSync(RESTORE_FLAG);
      }

      return true;
    } catch (error) {
      log(`✗ Failed to restore database: ${error.message}`, colors.red);
      return false;
    }
  } else if (!dbExists && !backupExists) {
    log('No database or backup found. Fresh installation detected.', colors.yellow);
    log('Database will be initialized on first run.', colors.yellow);
    return true;
  } else if (dbExists && backupExists && shouldRestore) {
    log('Database exists but restore requested. Creating safety backup...', colors.yellow);

    try {
      // Create safety backup
      const safetyBackup = path.join(PROJECT_ROOT, 'data/app.db.before-auto-restore');
      fs.copyFileSync(DB_PATH, safetyBackup);
      log(`✓ Safety backup created: ${safetyBackup}`, colors.green);

      // Restore from backup
      fs.copyFileSync(BACKUP_PATH, DB_PATH);
      log('✓ Database restored from backup successfully', colors.green);

      // Remove restore flag
      if (fs.existsSync(RESTORE_FLAG)) {
        fs.unlinkSync(RESTORE_FLAG);
      }

      return true;
    } catch (error) {
      log(`✗ Failed to restore database: ${error.message}`, colors.red);
      return false;
    }
  } else {
    log('✓ Database exists and is ready', colors.green);

    // Remove restore flag if it exists
    if (fs.existsSync(RESTORE_FLAG)) {
      fs.unlinkSync(RESTORE_FLAG);
    }

    return true;
  }
}

// Get database file size
function getFileSizeInMB(filePath) {
  if (!fs.existsSync(filePath)) {
    return 'N/A';
  }
  const stats = fs.statSync(filePath);
  const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  return `${sizeInMB} MB`;
}

// Main execution
async function main() {
  try {
    const restored = await checkAndRestore();

    log('\n==================================================================', colors.blue);
    log('  Database Status', colors.blue);
    log('==================================================================', colors.blue);
    log(`Database path: ${DB_PATH}`, colors.blue);
    log(`Database size: ${getFileSizeInMB(DB_PATH)}`, colors.blue);
    log(`Backup available: ${fs.existsSync(BACKUP_PATH) ? 'Yes' : 'No'}`, colors.blue);

    if (fs.existsSync(BACKUP_PATH)) {
      log(`Backup size: ${getFileSizeInMB(BACKUP_PATH)}`, colors.blue);
    }

    log('==================================================================\n', colors.blue);

    if (restored) {
      log('✓ Auto-restore check completed successfully\n', colors.green);
      process.exit(0);
    } else {
      log('✗ Auto-restore check failed\n', colors.red);
      process.exit(1);
    }
  } catch (error) {
    log(`Error during auto-restore: ${error.message}`, colors.red);
    log(error.stack, colors.red);
    process.exit(1);
  }
}

// Run only if called directly
if (require.main === module) {
  main();
}

module.exports = { checkAndRestore };
