const { v4: uuidv4 } = require('uuid');
const logger = require('../src/utils/logger');

async function up(db) {
  logger.info('Running migration: 002_add_multi_product_support');

  // Step 1: Create products table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      product_type TEXT DEFAULT 'generator_product',
      status TEXT DEFAULT 'draft',
      current_phase TEXT DEFAULT 'phase-1',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT DEFAULT '{}',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)`);
  await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`);

  logger.info('Products table created successfully');

  // Step 2: Check and add product_id column to documents table
  const documentsTableInfo = await db.allAsync('PRAGMA table_info(documents)');
  const documentsHasProductId = documentsTableInfo.some(col => col.name === 'product_id');

  if (!documentsHasProductId) {
    logger.info('Adding product_id column to documents table');
    await db.runAsync(`ALTER TABLE documents ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_documents_product_id ON documents(product_id)`);
    logger.info('Added product_id to documents table');
  }

  // Step 3: Check and add product_id column to progress table
  const progressTableInfo = await db.allAsync('PRAGMA table_info(progress)');
  const progressHasProductId = progressTableInfo.some(col => col.name === 'product_id');

  if (!progressHasProductId) {
    logger.info('Adding product_id column to progress table');
    await db.runAsync(`ALTER TABLE progress ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_progress_product_id ON progress(product_id)`);
    logger.info('Added product_id to progress table');
  }

  // Step 4: Check and add product_id column to chat_sessions table
  const chatSessionsTableInfo = await db.allAsync('PRAGMA table_info(chat_sessions)');
  const chatSessionsHasProductId = chatSessionsTableInfo.some(col => col.name === 'product_id');

  if (!chatSessionsHasProductId) {
    logger.info('Adding product_id column to chat_sessions table');
    await db.runAsync(`ALTER TABLE chat_sessions ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE SET NULL`);
    await db.runAsync(`CREATE INDEX IF NOT EXISTS idx_chat_sessions_product_id ON chat_sessions(product_id)`);
    logger.info('Added product_id to chat_sessions table');
  }

  // Step 5: Backfill data - create default product for each user with existing data
  // Get valid user IDs from users table only
  const validUsers = await db.allAsync('SELECT id FROM users');
  const validUserIds = new Set(validUsers.map(user => user.id));

  // Get user IDs from documents and progress
  const usersWithDocuments = await db.allAsync('SELECT DISTINCT user_id FROM documents WHERE user_id IS NOT NULL');
  const usersWithProgress = await db.allAsync('SELECT DISTINCT user_id FROM progress WHERE user_id IS NOT NULL');

  // Combine user IDs from documents and progress, but only include valid ones
  const userIds = new Set([
    ...usersWithDocuments.map(row => row.user_id).filter(id => validUserIds.has(id)),
    ...usersWithProgress.map(row => row.user_id).filter(id => validUserIds.has(id))
  ]);

  logger.info(`Found ${userIds.size} valid users with existing data to backfill`);

  for (const userId of userIds) {
    const productId = uuidv4();
    const productName = 'Default Product'; // Default name

    logger.info(`Creating default product for user ${userId}`);

    // Create default product
    await db.runAsync(
      `INSERT INTO products (id, user_id, name, description, product_type, status, current_phase)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [productId, userId, productName, 'Primary Generator Product', 'generator_product', 'draft', 'phase-1']
    );

    // Link all existing documents to this product
    const docUpdateResult = await db.runAsync(
      `UPDATE documents SET product_id = ? WHERE user_id = ? AND product_id IS NULL`,
      [productId, userId]
    );
    logger.info(`Linked ${docUpdateResult.changes || 0} documents to product ${productId}`);

    // Link all existing progress records to this product
    const progressUpdateResult = await db.runAsync(
      `UPDATE progress SET product_id = ? WHERE user_id = ? AND product_id IS NULL`,
      [productId, userId]
    );
    logger.info(`Linked ${progressUpdateResult.changes || 0} progress records to product ${productId}`);

    // Link all existing chat sessions to this product
    const chatUpdateResult = await db.runAsync(
      `UPDATE chat_sessions SET product_id = ? WHERE user_id = ? AND product_id IS NULL`,
      [productId, userId]
    );
    logger.info(`Linked ${chatUpdateResult.changes || 0} chat sessions to product ${productId}`);
  }

  logger.info(`Migration complete: Created default products for ${userIds.size} users`);
}

async function down(db) {
  logger.warn('Rolling back migration: 002_add_multi_product_support');

  // Drop indexes
  await db.runAsync(`DROP INDEX IF EXISTS idx_documents_product_id`);
  await db.runAsync(`DROP INDEX IF EXISTS idx_progress_product_id`);
  await db.runAsync(`DROP INDEX IF EXISTS idx_chat_sessions_product_id`);
  await db.runAsync(`DROP INDEX IF EXISTS idx_products_user_id`);
  await db.runAsync(`DROP INDEX IF EXISTS idx_products_status`);

  // Drop products table
  await db.runAsync(`DROP TABLE IF EXISTS products`);

  logger.warn('Migration rollback complete. Note: product_id columns remain in other tables (SQLite limitation)');
}

module.exports = { up, down };
