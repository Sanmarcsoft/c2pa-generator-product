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

    // Chat messages table
    await runAsync(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        context TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
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
