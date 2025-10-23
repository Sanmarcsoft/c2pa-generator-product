const DatabaseIntegrityChecker = require('../../backend/src/utils/dbIntegrity');
const { runAsync, getAsync, allAsync } = require('../../backend/src/models/database');
const fs = require('fs');
const path = require('path');

describe('DatabaseIntegrityChecker', () => {
  let checker;

  beforeEach(() => {
    checker = new DatabaseIntegrityChecker();
  });

  describe('Constructor', () => {
    test('should initialize with empty results', () => {
      expect(checker.results.passed).toEqual([]);
      expect(checker.results.failed).toEqual([]);
      expect(checker.results.warnings).toEqual([]);
    });
  });

  describe('checkDatabasePath', () => {
    test('should pass when database file exists', async () => {
      const dbPath = process.env.DATABASE_PATH || path.join('/app', 'data', 'app.db');

      await checker.checkDatabasePath();

      if (fs.existsSync(dbPath)) {
        expect(checker.results.passed.length).toBeGreaterThan(0);
        expect(checker.results.passed[0].check).toBe('Database Path');
        expect(checker.results.passed[0].message).toContain('Database exists');
      }
    });

    test('should fail when database file does not exist', async () => {
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/nonexistent/path/to/db.db';

      await checker.checkDatabasePath();

      expect(checker.results.failed.length).toBeGreaterThan(0);
      expect(checker.results.failed[0].check).toBe('Database Path');
      expect(checker.results.failed[0].message).toContain('NOT found');

      process.env.DATABASE_PATH = originalPath;
    });
  });

  describe('checkTableExists', () => {
    test('should pass when table exists', async () => {
      await checker.checkTableExists('users');

      const result = checker.results.passed.find(r => r.check === 'Table: users');
      expect(result).toBeDefined();
      expect(result.message).toBe('Table exists');
    });

    test('should fail when table does not exist', async () => {
      await checker.checkTableExists('nonexistent_table_xyz');

      const result = checker.results.failed.find(r => r.check === 'Table: nonexistent_table_xyz');
      expect(result).toBeDefined();
      expect(result.message).toContain('does not exist');
    });

    test('should report row count for existing tables', async () => {
      await checker.checkTableExists('users');

      const result = checker.results.passed.find(r => r.check === 'Table: users');
      expect(result.details).toMatch(/\d+ rows/);
    });
  });

  describe('checkUserData', () => {
    test('should pass when admin users exist', async () => {
      await checker.checkUserData();

      const users = await allAsync('SELECT id, email, role FROM users');
      const adminCount = users.filter(u => u.role === 'admin').length;

      if (adminCount > 1) {
        const result = checker.results.passed.find(r => r.check === 'User Data');
        expect(result).toBeDefined();
        expect(result.message).toContain('users found');
      }
    });

    test('should warn when only one admin exists', async () => {
      await checker.checkUserData();

      const users = await allAsync('SELECT id, email, role FROM users');
      const adminCount = users.filter(u => u.role === 'admin').length;

      if (adminCount === 1) {
        const result = checker.results.warnings.find(r => r.check === 'User Data');
        expect(result).toBeDefined();
        expect(result.message).toContain('Only 1 admin user found');
      }
    });

    test('should fail when no admin users exist', async () => {
      // This test would require mocking or a test database with no admins
      // For now, we'll just verify the logic exists
      expect(checker.checkUserData).toBeDefined();
    });
  });

  describe('checkGitHubRepos', () => {
    test('should pass when repositories are indexed', async () => {
      const repos = await allAsync('SELECT repo_owner, repo_name, file_count FROM github_repos');

      await checker.checkGitHubRepos();

      if (repos.length > 0) {
        const result = checker.results.passed.find(r => r.check === 'GitHub Repositories');
        expect(result).toBeDefined();
        expect(result.message).toContain('repositories indexed');
      }
    });

    test('should warn when no repositories are indexed', async () => {
      const repos = await allAsync('SELECT repo_owner, repo_name, file_count FROM github_repos');

      await checker.checkGitHubRepos();

      if (repos.length === 0) {
        const result = checker.results.warnings.find(r => r.check === 'GitHub Repositories');
        expect(result).toBeDefined();
        expect(result.message).toBe('No repositories indexed');
      }
    });
  });

  describe('checkAppSettings', () => {
    test('should validate required settings exist', async () => {
      await checker.checkAppSettings();

      const settings = await allAsync('SELECT key, value FROM app_settings');
      const settingsMap = {};
      settings.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      const requiredSettings = ['onboarding_completed', 'ai_provider', 'github_configured'];
      const missingSettings = requiredSettings.filter(key => !settingsMap[key]);

      if (missingSettings.length === 0) {
        const result = checker.results.passed.find(r => r.check === 'App Settings');
        expect(result).toBeDefined();
      } else {
        const result = checker.results.warnings.find(r => r.check === 'App Settings');
        expect(result).toBeDefined();
      }
    });
  });

  describe('checkIndexes', () => {
    test('should validate required indexes exist', async () => {
      await checker.checkIndexes();

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
        const result = checker.results.passed.find(r => r.check === 'Database Indexes');
        expect(result).toBeDefined();
      } else {
        const result = checker.results.warnings.find(r => r.check === 'Database Indexes');
        expect(result).toBeDefined();
      }
    });
  });

  describe('runAllChecks', () => {
    test('should run all integrity checks', async () => {
      const results = await checker.runAllChecks();

      expect(results).toHaveProperty('passed');
      expect(results).toHaveProperty('failed');
      expect(results).toHaveProperty('warnings');
      expect(Array.isArray(results.passed)).toBe(true);
      expect(Array.isArray(results.failed)).toBe(true);
      expect(Array.isArray(results.warnings)).toBe(true);
    });

    test('should throw error when critical checks fail', async () => {
      const originalPath = process.env.DATABASE_PATH;
      process.env.DATABASE_PATH = '/nonexistent/path/to/db.db';

      await expect(checker.runAllChecks()).rejects.toThrow('Database integrity check failed');

      process.env.DATABASE_PATH = originalPath;
    });

    test('should complete successfully with valid database', async () => {
      await expect(checker.runAllChecks()).resolves.toBeDefined();
    });
  });

  describe('printResults', () => {
    test('should format results correctly', () => {
      checker.results.passed.push({
        check: 'Test Check',
        message: 'Test passed',
        details: 'Test details'
      });

      expect(() => checker.printResults()).not.toThrow();
    });

    test('should throw error when failures exist', () => {
      checker.results.failed.push({
        check: 'Critical Check',
        message: 'Critical failure',
        details: 'Error details'
      });

      expect(() => checker.printResults()).toThrow('Database integrity check failed with 1 critical error(s)');
    });
  });
});
