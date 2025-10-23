const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = path.join(__dirname, '../../../data/app.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error('Error opening database', err);
  } else {
    logger.info('Connected to SQLite database');
    // Enable foreign key constraints
    db.run('PRAGMA foreign_keys = ON');
  }
});

// Promisify database methods
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

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

// Initialize database schema
async function initDatabase() {
  try {
    logger.info('Starting database initialization...');
    // Users table (for authentication)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login TEXT
      )
    `);

    // Create index for email lookups
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email)
    `);

    // Documents table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        category TEXT,
        upload_date TEXT NOT NULL,
        last_reviewed TEXT,
        status TEXT DEFAULT 'pending',
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Annotations table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        page_number INTEGER,
        content TEXT NOT NULL,
        position TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
      )
    `);

    // Chat sessions table (for session persistence)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_message_at TEXT,
        message_count INTEGER DEFAULT 0,
        openwebui_chat_id TEXT,
        is_active INTEGER DEFAULT 1,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for chat_sessions
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
      ON chat_sessions(user_id)
    `);

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_is_active
      ON chat_sessions(is_active)
    `);

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at
      ON chat_sessions(updated_at)
    `);

    // Chat messages table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        context TEXT,
        metadata TEXT,
        user_id TEXT,
        session_id TEXT,
        openwebui_chat_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (session_id) REFERENCES chat_sessions (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for chat_messages
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id
      ON chat_messages(user_id)
    `);

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
      ON chat_messages(session_id)
    `);

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at
      ON chat_messages(created_at)
    `);

    // Progress tracking table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL DEFAULT 'sanmarcsoft-llc',
        company_name TEXT,
        current_phase TEXT,
        start_date TEXT,
        phases TEXT NOT NULL,
        notes TEXT,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Checklist items table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        phase_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        order_index INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      )
    `);

    // GitHub repositories table (for RAG)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS github_repos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo_owner TEXT NOT NULL,
        repo_name TEXT NOT NULL,
        branch TEXT NOT NULL DEFAULT 'main',
        file_count INTEGER DEFAULT 0,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(repo_owner, repo_name, branch)
      )
    `);

    // GitHub files table (for RAG)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS github_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repo_id INTEGER NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_extension TEXT,
        content TEXT NOT NULL,
        size INTEGER,
        indexed_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repo_id) REFERENCES github_repos (id) ON DELETE CASCADE,
        UNIQUE(repo_id, file_path)
      )
    `);

    // Create index for faster searches
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_github_files_content
      ON github_files(content)
    `);

    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_github_files_path
      ON github_files(file_path)
    `);

    // Migration: Add user_id, openwebui_chat_id, and session_id columns to chat_messages if they don't exist
    logger.info('Checking chat_messages table schema for migration...');
    const tableInfo = await allAsync('PRAGMA table_info(chat_messages)');
    logger.info(`chat_messages columns: ${tableInfo.map(c => c.name).join(', ')}`);
    const hasUserId = tableInfo.some(col => col.name === 'user_id');
    const hasOpenwebuiChatId = tableInfo.some(col => col.name === 'openwebui_chat_id');
    const hasSessionId = tableInfo.some(col => col.name === 'session_id');
    logger.info(`Has user_id: ${hasUserId}, Has openwebui_chat_id: ${hasOpenwebuiChatId}, Has session_id: ${hasSessionId}`);

    if (!hasUserId || !hasOpenwebuiChatId || !hasSessionId) {
      logger.info('Migrating chat_messages table: adding missing columns');
      if (!hasUserId) {
        await runAsync('ALTER TABLE chat_messages ADD COLUMN user_id TEXT');
        logger.info('Added user_id column to chat_messages');
      }
      if (!hasOpenwebuiChatId) {
        await runAsync('ALTER TABLE chat_messages ADD COLUMN openwebui_chat_id TEXT');
        logger.info('Added openwebui_chat_id column to chat_messages');
      }
      if (!hasSessionId) {
        await runAsync('ALTER TABLE chat_messages ADD COLUMN session_id TEXT REFERENCES chat_sessions(id) ON DELETE CASCADE');
        logger.info('Added session_id column to chat_messages');
      }
      logger.info('Chat messages table migration completed');
    }

    // Migration: Add description column to github_repos if it doesn't exist
    logger.info('Checking github_repos table schema for description column...');
    const reposTableInfo = await allAsync('PRAGMA table_info(github_repos)');
    const hasDescription = reposTableInfo.some(col => col.name === 'description');

    if (!hasDescription) {
      logger.info('Migrating github_repos table: adding description column');
      await runAsync('ALTER TABLE github_repos ADD COLUMN description TEXT');
      logger.info('Added description column to github_repos');
    }

    // Application settings table (for onboarding and configuration)
    await runAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        type TEXT DEFAULT 'string',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Initialize default settings if not exists
    const onboardingCompleted = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['onboarding_completed']
    );

    if (!onboardingCompleted) {
      // Auto-detect AI provider from environment
      const aiProvider = process.env.OPENWEBUI_URL ? 'openwebui' : 'none';
      const openwebuiUrl = process.env.OPENWEBUI_URL || '';

      await runAsync(`
        INSERT OR IGNORE INTO app_settings (key, value, type)
        VALUES
          ('onboarding_completed', 'false', 'boolean'),
          ('ai_provider', ?, 'string'),
          ('openwebui_url', ?, 'string'),
          ('github_configured', 'false', 'boolean')
      `, [aiProvider, openwebuiUrl]);

      logger.info(`Initialized app_settings with ai_provider=${aiProvider}`);
    } else {
      // Update ai_provider if OpenWebUI is configured but setting is still 'none'
      if (process.env.OPENWEBUI_URL) {
        const currentProvider = await getAsync(
          'SELECT value FROM app_settings WHERE key = ?',
          ['ai_provider']
        );

        if (currentProvider && currentProvider.value === 'none') {
          await runAsync(
            'UPDATE app_settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?',
            ['openwebui', 'ai_provider']
          );
          logger.info('Updated ai_provider from "none" to "openwebui" based on OPENWEBUI_URL environment variable');
        }

        // Also update openwebui_url setting if different
        const currentUrl = await getAsync(
          'SELECT value FROM app_settings WHERE key = ?',
          ['openwebui_url']
        );

        if (!currentUrl || currentUrl.value !== process.env.OPENWEBUI_URL) {
          await runAsync(
            'INSERT OR REPLACE INTO app_settings (key, value, type, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
            ['openwebui_url', process.env.OPENWEBUI_URL, 'string']
          );
          logger.info(`Updated openwebui_url setting to ${process.env.OPENWEBUI_URL}`);
        }
      }
    }

    // Initialize default progress if not exists
    const existingProgress = await getAsync(
      'SELECT id FROM progress WHERE user_id = ?',
      ['sanmarcsoft-llc']
    );

    if (!existingProgress) {
      const { v4: uuidv4 } = require('uuid');
      const defaultPhases = JSON.stringify([
        {
          id: 'phase-1',
          name: 'Introduction & Prerequisites',
          status: 'pending',
          tasks: []
        },
        {
          id: 'phase-2',
          name: 'Understanding Requirements',
          status: 'pending',
          tasks: []
        },
        {
          id: 'phase-3',
          name: 'Document Review',
          status: 'pending',
          tasks: []
        },
        {
          id: 'phase-4',
          name: 'Application Preparation',
          status: 'pending',
          tasks: []
        },
        {
          id: 'phase-5',
          name: 'Submission & Follow-up',
          status: 'pending',
          tasks: []
        },
        {
          id: 'phase-6',
          name: 'Certification Maintenance',
          status: 'pending',
          tasks: []
        }
      ]);

      await runAsync(
        `INSERT INTO progress (id, user_id, company_name, current_phase, start_date, phases)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          'sanmarcsoft-llc',
          'Sanmarcsoft LLC',
          'phase-1',
          new Date().toISOString(),
          defaultPhases
        ]
      );

      logger.info('Default progress initialized for Sanmarcsoft LLC');
    }

    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  db,
  runAsync,
  getAsync,
  allAsync,
  initDatabase
};
