const { getAsync, allAsync } = require('../models/database');
const logger = require('./logger');

/**
 * Database Integrity Checker
 * Validates database state and data consistency on startup
 */

class DatabaseIntegrityChecker {
  constructor() {
    this.checks = [];
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  /**
   * Run all integrity checks
   */
  async runAllChecks() {
    logger.info('╔════════════════════════════════════════════════════════════╗');
    logger.info('║        DATABASE INTEGRITY CHECK                            ║');
    logger.info('╚════════════════════════════════════════════════════════════╝');

    await this.checkDatabasePath();
    await this.checkTableExists('users');
    await this.checkTableExists('github_repos');
    await this.checkTableExists('app_settings');
    await this.checkTableExists('chat_sessions');
    await this.checkUserData();
    await this.checkGitHubRepos();
    await this.checkAppSettings();
    await this.checkIndexes();

    this.printResults();
    return this.results;
  }

  /**
   * Check if database is at the correct path
   */
  async checkDatabasePath() {
    const fs = require('fs');
    const path = require('path');

    const expectedPath = process.env.DATABASE_PATH || path.join('/app', 'data', 'app.db');

    if (fs.existsSync(expectedPath)) {
      const stats = fs.statSync(expectedPath);
      this.results.passed.push({
        check: 'Database Path',
        message: `Database exists at ${expectedPath}`,
        details: `Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`
      });
    } else {
      this.results.failed.push({
        check: 'Database Path',
        message: `Database NOT found at expected path: ${expectedPath}`,
        details: 'This will cause data loss!'
      });
    }
  }

  /**
   * Check if a table exists
   */
  async checkTableExists(tableName) {
    try {
      const result = await getAsync(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName]
      );

      if (result) {
        // Get row count
        const count = await getAsync(`SELECT COUNT(*) as count FROM ${tableName}`);
        this.results.passed.push({
          check: `Table: ${tableName}`,
          message: `Table exists`,
          details: `${count.count} rows`
        });
      } else {
        this.results.failed.push({
          check: `Table: ${tableName}`,
          message: `Table does not exist`,
          details: 'Database schema may be incomplete'
        });
      }
    } catch (error) {
      this.results.failed.push({
        check: `Table: ${tableName}`,
        message: `Error checking table: ${error.message}`,
        details: error.stack
      });
    }
  }

  /**
   * Check user data integrity
   */
  async checkUserData() {
    try {
      const users = await allAsync('SELECT id, email, role FROM users');
      const adminCount = users.filter(u => u.role === 'admin').length;

      if (adminCount === 0) {
        this.results.failed.push({
          check: 'User Data',
          message: 'No admin users found!',
          details: 'At least one admin user is required for system operation'
        });
      } else if (adminCount === 1) {
        this.results.warnings.push({
          check: 'User Data',
          message: `Only ${adminCount} admin user found`,
          details: 'Consider creating a backup admin account'
        });
      } else {
        this.results.passed.push({
          check: 'User Data',
          message: `${users.length} users found (${adminCount} admins)`,
          details: users.map(u => `${u.email} (${u.role})`).join(', ')
        });
      }
    } catch (error) {
      this.results.failed.push({
        check: 'User Data',
        message: `Error checking users: ${error.message}`,
        details: error.stack
      });
    }
  }

  /**
   * Check GitHub repositories data
   */
  async checkGitHubRepos() {
    try {
      const repos = await allAsync('SELECT repo_owner, repo_name, file_count FROM github_repos');

      if (repos.length > 0) {
        const totalFiles = repos.reduce((sum, r) => sum + (r.file_count || 0), 0);
        this.results.passed.push({
          check: 'GitHub Repositories',
          message: `${repos.length} repositories indexed`,
          details: `Total ${totalFiles} files indexed`
        });
      } else {
        this.results.warnings.push({
          check: 'GitHub Repositories',
          message: 'No repositories indexed',
          details: 'GitHub RAG features will not be available'
        });
      }
    } catch (error) {
      this.results.failed.push({
        check: 'GitHub Repositories',
        message: `Error checking repos: ${error.message}`,
        details: error.stack
      });
    }
  }

  /**
   * Check application settings
   */
  async checkAppSettings() {
    try {
      const settings = await allAsync('SELECT key, value FROM app_settings');
      const settingsMap = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      const requiredSettings = ['onboarding_completed', 'ai_provider', 'github_configured'];
      const missingSettings = requiredSettings.filter(key => !settingsMap[key]);

      if (missingSettings.length > 0) {
        this.results.warnings.push({
          check: 'App Settings',
          message: `Missing ${missingSettings.length} required settings`,
          details: `Missing: ${missingSettings.join(', ')}`
        });
      } else {
        this.results.passed.push({
          check: 'App Settings',
          message: `${settings.length} settings configured`,
          details: `AI Provider: ${settingsMap.ai_provider || 'none'}`
        });
      }
    } catch (error) {
      this.results.failed.push({
        check: 'App Settings',
        message: `Error checking settings: ${error.message}`,
        details: error.stack
      });
    }
  }

  /**
   * Check database indexes
   */
  async checkIndexes() {
    try {
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

      if (missingIndexes.length > 0) {
        this.results.warnings.push({
          check: 'Database Indexes',
          message: `${missingIndexes.length} recommended indexes missing`,
          details: `Missing: ${missingIndexes.join(', ')}`
        });
      } else {
        this.results.passed.push({
          check: 'Database Indexes',
          message: `${indexes.length} indexes found`,
          details: 'All required indexes present'
        });
      }
    } catch (error) {
      this.results.warnings.push({
        check: 'Database Indexes',
        message: `Error checking indexes: ${error.message}`,
        details: 'Non-critical error'
      });
    }
  }

  /**
   * Print results to console
   */
  printResults() {
    logger.info('');
    logger.info('╔════════════════════════════════════════════════════════════╗');
    logger.info('║        INTEGRITY CHECK RESULTS                             ║');
    logger.info('╚════════════════════════════════════════════════════════════╝');

    if (this.results.passed.length > 0) {
      logger.info('');
      logger.info('✓ PASSED CHECKS:');
      this.results.passed.forEach(result => {
        logger.info(`  ✓ ${result.check}: ${result.message}`);
        if (result.details) {
          logger.info(`    └─ ${result.details}`);
        }
      });
    }

    if (this.results.warnings.length > 0) {
      logger.info('');
      logger.warn('⚠ WARNINGS:');
      this.results.warnings.forEach(result => {
        logger.warn(`  ⚠ ${result.check}: ${result.message}`);
        if (result.details) {
          logger.warn(`    └─ ${result.details}`);
        }
      });
    }

    if (this.results.failed.length > 0) {
      logger.info('');
      logger.error('✗ FAILED CHECKS:');
      this.results.failed.forEach(result => {
        logger.error(`  ✗ ${result.check}: ${result.message}`);
        if (result.details) {
          logger.error(`    └─ ${result.details}`);
        }
      });
    }

    logger.info('');
    logger.info('═'.repeat(60));
    logger.info(`Summary: ${this.results.passed.length} passed, ${this.results.warnings.length} warnings, ${this.results.failed.length} failed`);
    logger.info('═'.repeat(60));
    logger.info('');

    // Throw error if critical checks failed
    if (this.results.failed.length > 0) {
      throw new Error(`Database integrity check failed with ${this.results.failed.length} critical error(s)`);
    }
  }
}

module.exports = DatabaseIntegrityChecker;
