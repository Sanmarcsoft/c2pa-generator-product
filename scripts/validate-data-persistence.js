#!/usr/bin/env node

/**
 * Data Persistence Validation Script
 *
 * This script validates that data persists correctly in the Docker volume.
 * It can be run manually to check database integrity and data consistency.
 *
 * Usage:
 *   node scripts/validate-data-persistence.js
 *   docker-compose exec backend node /app/scripts/validate-data-persistence.js
 */

const path = require('path');
const fs = require('fs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function banner(text) {
  const width = 60;
  const padding = Math.max(0, Math.floor((width - text.length - 2) / 2));
  log('╔' + '═'.repeat(width) + '╗', colors.cyan);
  log('║' + ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length) + '║', colors.cyan);
  log('╚' + '═'.repeat(width) + '╝', colors.cyan);
}

async function validateDataPersistence() {
  banner('DATA PERSISTENCE VALIDATION');
  log('');

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  try {
    // Check 1: Database file exists
    log('Checking database file...', colors.bright);
    const dbPath = process.env.DATABASE_PATH || path.join('/app', 'data', 'app.db');

    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      results.passed.push({
        check: 'Database File',
        message: `Database exists at ${dbPath}`,
        details: `Size: ${sizeMB} MB, Modified: ${stats.mtime.toISOString()}`
      });
    } else {
      results.failed.push({
        check: 'Database File',
        message: `Database NOT found at ${dbPath}`,
        details: 'This indicates a critical data persistence failure'
      });
      // Can't continue without database
      printResults(results);
      process.exit(1);
    }

    // Check 2: Database is readable
    log('Checking database accessibility...', colors.bright);
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        results.failed.push({
          check: 'Database Access',
          message: 'Cannot open database',
          details: err.message
        });
      }
    });

    // Promisify database operations
    const getAsync = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    const allAsync = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // Check 3: Required tables exist
    log('Checking database schema...', colors.bright);
    const requiredTables = ['users', 'github_repos', 'app_settings', 'chat_sessions', 'documents'];

    for (const table of requiredTables) {
      const result = await getAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [table]
      );

      if (result) {
        const count = await getAsync(`SELECT COUNT(*) as count FROM ${table}`);
        results.passed.push({
          check: `Table: ${table}`,
          message: 'Table exists',
          details: `${count.count} rows`
        });
      } else {
        results.failed.push({
          check: `Table: ${table}`,
          message: 'Table missing',
          details: 'Database schema is incomplete'
        });
      }
    }

    // Check 4: User data integrity
    log('Validating user data...', colors.bright);
    const users = await allAsync('SELECT id, email, role FROM users');
    const adminCount = users.filter(u => u.role === 'admin').length;

    if (adminCount === 0) {
      results.failed.push({
        check: 'Admin Users',
        message: 'No admin users found',
        details: 'At least one admin is required'
      });
    } else if (adminCount === 1) {
      results.warnings.push({
        check: 'Admin Users',
        message: 'Only 1 admin user found',
        details: 'Consider creating a backup admin account'
      });
    } else {
      results.passed.push({
        check: 'Admin Users',
        message: `${adminCount} admin users found`,
        details: 'Sufficient administrative access'
      });
    }

    // Check 5: GitHub repositories data
    log('Checking GitHub repository data...', colors.bright);
    const repos = await allAsync('SELECT repo_owner, repo_name, file_count FROM github_repos');

    if (repos.length > 0) {
      const totalFiles = repos.reduce((sum, r) => sum + (r.file_count || 0), 0);
      results.passed.push({
        check: 'GitHub Data',
        message: `${repos.length} repositories indexed`,
        details: `Total ${totalFiles} files indexed`
      });
    } else {
      results.warnings.push({
        check: 'GitHub Data',
        message: 'No repositories indexed',
        details: 'GitHub RAG features will not be available'
      });
    }

    // Check 6: Application settings
    log('Validating application settings...', colors.bright);
    const settings = await allAsync('SELECT key, value FROM app_settings');
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    const requiredSettings = ['onboarding_completed', 'ai_provider', 'github_configured'];
    const missingSettings = requiredSettings.filter(key => !settingsMap[key]);

    if (missingSettings.length === 0) {
      results.passed.push({
        check: 'App Settings',
        message: `${settings.length} settings configured`,
        details: `Provider: ${settingsMap.ai_provider || 'none'}, GitHub: ${settingsMap.github_configured}`
      });
    } else {
      results.warnings.push({
        check: 'App Settings',
        message: `${missingSettings.length} required settings missing`,
        details: `Missing: ${missingSettings.join(', ')}`
      });
    }

    // Check 7: Database indexes
    log('Checking database indexes...', colors.bright);
    const indexes = await allAsync(
      `SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND sql IS NOT NULL`
    );

    const requiredIndexes = [
      'idx_users_email',
      'idx_chat_sessions_user_id',
      'idx_github_files_content'
    ];

    const existingIndexNames = indexes.map(i => i.name);
    const missingIndexes = requiredIndexes.filter(idx => !existingIndexNames.includes(idx));

    if (missingIndexes.length === 0) {
      results.passed.push({
        check: 'Database Indexes',
        message: `${indexes.length} indexes found`,
        details: 'All required indexes present'
      });
    } else {
      results.warnings.push({
        check: 'Database Indexes',
        message: `${missingIndexes.length} indexes missing`,
        details: `Missing: ${missingIndexes.join(', ')}`
      });
    }

    // Check 8: Data directory permissions
    log('Checking data directory permissions...', colors.bright);
    const dataDir = path.dirname(dbPath);
    try {
      fs.accessSync(dataDir, fs.constants.R_OK | fs.constants.W_OK);
      results.passed.push({
        check: 'Directory Permissions',
        message: 'Data directory is readable and writable',
        details: `Path: ${dataDir}`
      });
    } catch (err) {
      results.failed.push({
        check: 'Directory Permissions',
        message: 'Insufficient permissions on data directory',
        details: err.message
      });
    }

    // Close database connection
    db.close();

    // Print results
    printResults(results);

    // Exit with appropriate code
    process.exit(results.failed.length > 0 ? 1 : 0);

  } catch (error) {
    log('');
    log('FATAL ERROR:', colors.red);
    log(error.message, colors.red);
    log(error.stack, colors.red);
    process.exit(1);
  }
}

function printResults(results) {
  log('');
  banner('VALIDATION RESULTS');
  log('');

  if (results.passed.length > 0) {
    log('✓ PASSED CHECKS:', colors.green);
    results.passed.forEach(result => {
      log(`  ✓ ${result.check}: ${result.message}`, colors.green);
      if (result.details) {
        log(`    └─ ${result.details}`, colors.cyan);
      }
    });
    log('');
  }

  if (results.warnings.length > 0) {
    log('⚠ WARNINGS:', colors.yellow);
    results.warnings.forEach(result => {
      log(`  ⚠ ${result.check}: ${result.message}`, colors.yellow);
      if (result.details) {
        log(`    └─ ${result.details}`, colors.yellow);
      }
    });
    log('');
  }

  if (results.failed.length > 0) {
    log('✗ FAILED CHECKS:', colors.red);
    results.failed.forEach(result => {
      log(`  ✗ ${result.check}: ${result.message}`, colors.red);
      if (result.details) {
        log(`    └─ ${result.details}`, colors.red);
      }
    });
    log('');
  }

  log('═'.repeat(60), colors.cyan);
  log(`Summary: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failed.length} failed`, colors.bright);
  log('═'.repeat(60), colors.cyan);
  log('');

  if (results.failed.length > 0) {
    log('VALIDATION FAILED - Critical issues detected', colors.red);
  } else if (results.warnings.length > 0) {
    log('VALIDATION PASSED - Some warnings present', colors.yellow);
  } else {
    log('VALIDATION PASSED - All checks successful', colors.green);
  }
  log('');
}

// Run validation
validateDataPersistence();
