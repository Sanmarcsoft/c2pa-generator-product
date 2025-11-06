/**
 * Migration: Add products table and product_id to related tables
 *
 * This migration adds multi-product support to the platform, allowing users
 * to manage certifications for multiple Generator Products simultaneously.
 *
 * Changes:
 * 1. Create products table
 * 2. Add product_id to documents table
 * 3. Add product_id to progress table
 * 4. Add product_id to chat_sessions table (if exists)
 * 5. Create default product for each existing user
 * 6. Migrate existing data to default products
 */

const crypto = require('crypto');

/**
 * Generate UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Run migration
 * @param {Function} runAsync - Database run function from database.js
 */
async function up(runAsync) {
  // Load database helpers
  const { allAsync, getAsync } = require('../src/models/database');

  console.log('[Migration 001] Starting: Add products table');

  // Step 1: Create products table
  console.log('[Migration 001] Creating products table...');
  await runAsync(`
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
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for products table
  await runAsync(`
    CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id)
  `);
  await runAsync(`
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)
  `);
  await runAsync(`
    CREATE INDEX IF NOT EXISTS idx_products_current_phase ON products(current_phase)
  `);

  console.log('[Migration 001] Products table created successfully');

  // Step 2: Add product_id to documents table
  console.log('[Migration 001] Adding product_id to documents table...');

  // Check if column already exists
  const documentsColumns = await allAsync(`PRAGMA table_info(documents)`);
  const hasDocumentsProductId = documentsColumns.some(col => col.name === 'product_id');

  if (!hasDocumentsProductId) {
    await runAsync(`
      ALTER TABLE documents ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE
    `);
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_documents_product_id ON documents(product_id)
    `);
    console.log('[Migration 001] Added product_id to documents table');
  } else {
    console.log('[Migration 001] product_id column already exists in documents table');
  }

  // Step 3: Add product_id to progress table
  console.log('[Migration 001] Adding product_id to progress table...');

  const progressColumns = await allAsync(`PRAGMA table_info(progress)`);
  const hasProgressProductId = progressColumns.some(col => col.name === 'product_id');

  if (!hasProgressProductId) {
    await runAsync(`
      ALTER TABLE progress ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE
    `);
    await runAsync(`
      CREATE INDEX IF NOT EXISTS idx_progress_product_id ON progress(product_id)
    `);
    console.log('[Migration 001] Added product_id to progress table');
  } else {
    console.log('[Migration 001] product_id column already exists in progress table');
  }

  // Step 4: Add product_id to chat_sessions table (if it exists)
  console.log('[Migration 001] Checking for chat_sessions table...');

  const tables = await allAsync(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='chat_sessions'
  `);

  if (tables.length > 0) {
    const chatColumns = await allAsync(`PRAGMA table_info(chat_sessions)`);
    const hasChatProductId = chatColumns.some(col => col.name === 'product_id');

    if (!hasChatProductId) {
      await runAsync(`
        ALTER TABLE chat_sessions ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE
      `);
      await runAsync(`
        CREATE INDEX IF NOT EXISTS idx_chat_sessions_product_id ON chat_sessions(product_id)
      `);
      console.log('[Migration 001] Added product_id to chat_sessions table');
    } else {
      console.log('[Migration 001] product_id column already exists in chat_sessions table');
    }
  } else {
    console.log('[Migration 001] chat_sessions table does not exist, skipping');
  }

  // Step 5: Create default product for each existing user
  console.log('[Migration 001] Creating default products for existing users...');

  // Check if company_name column exists
  const userColumns = await allAsync(`PRAGMA table_info(users)`);
  const hasCompanyName = userColumns.some(col => col.name === 'company_name');

  const selectQuery = hasCompanyName
    ? `SELECT id, email, company_name FROM users`
    : `SELECT id, email, name FROM users`;

  const users = await allAsync(selectQuery);
  console.log(`[Migration 001] Found ${users.length} existing users`);

  for (const user of users) {
    const productId = generateUUID();
    const companyOrName = hasCompanyName ? user.company_name : user.name;
    const productName = companyOrName
      ? `${companyOrName} - Default Certification Project`
      : 'Default Certification Project';

    // Get current phase from progress table if exists
    let currentPhase = 'phase-1';
    try {
      const progressData = await getAsync(`
        SELECT current_phase FROM progress WHERE user_id = ? LIMIT 1
      `, [user.id]);

      if (progressData && progressData.current_phase) {
        currentPhase = progressData.current_phase;
      }
    } catch (error) {
      console.log(`[Migration 001] No progress data for user ${user.email}, using default phase`);
    }

    // Insert default product
    await runAsync(`
      INSERT INTO products (id, user_id, name, description, status, current_phase, created_at, updated_at, metadata)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), ?)
    `, [
      productId,
      user.id,
      productName,
      'Automatically created during migration from single-product to multi-product system',
      'in_progress',
      currentPhase,
      JSON.stringify({ migrated: true, migration_date: new Date().toISOString() })
    ]);

    console.log(`[Migration 001] Created default product for user: ${user.email} (${productId})`);

    // Step 6: Migrate existing documents to default product
    const documentCount = await getAsync(`
      SELECT COUNT(*) as count FROM documents WHERE user_id = ? AND product_id IS NULL
    `, [user.id]);

    if (documentCount && documentCount.count > 0) {
      await runAsync(`
        UPDATE documents SET product_id = ? WHERE user_id = ? AND product_id IS NULL
      `, [productId, user.id]);
      console.log(`[Migration 001] Migrated ${documentCount.count} documents to default product for user: ${user.email}`);
    }

    // Migrate existing progress records to default product
    const progressCount = await getAsync(`
      SELECT COUNT(*) as count FROM progress WHERE user_id = ? AND product_id IS NULL
    `, [user.id]);

    if (progressCount && progressCount.count > 0) {
      await runAsync(`
        UPDATE progress SET product_id = ? WHERE user_id = ? AND product_id IS NULL
      `, [productId, user.id]);
      console.log(`[Migration 001] Migrated ${progressCount.count} progress records to default product for user: ${user.email}`);
    }

    // Migrate chat_sessions if table exists
    if (tables.length > 0) {
      const chatCount = await getAsync(`
        SELECT COUNT(*) as count FROM chat_sessions WHERE user_id = ? AND product_id IS NULL
      `, [user.id]);

      if (chatCount && chatCount.count > 0) {
        await runAsync(`
          UPDATE chat_sessions SET product_id = ? WHERE user_id = ? AND product_id IS NULL
        `, [productId, user.id]);
        console.log(`[Migration 001] Migrated ${chatCount.count} chat sessions to default product for user: ${user.email}`);
      }
    }
  }

  console.log('[Migration 001] Migration completed successfully');
  console.log('[Migration 001] Summary:');
  console.log(`  - Products table created: ✓`);
  console.log(`  - Documents table updated: ✓`);
  console.log(`  - Progress table updated: ✓`);
  console.log(`  - Default products created: ${users.length}`);
}

/**
 * Rollback migration
 */
async function down(db) {
  console.log('[Migration 001] Rolling back: Add products table');

  // Remove product_id columns (SQLite requires recreate table approach)
  console.log('[Migration 001] Rolling back schema changes...');

  // Drop indexes first
  await db.exec(`DROP INDEX IF EXISTS idx_products_user_id`);
  await db.exec(`DROP INDEX IF EXISTS idx_products_status`);
  await db.exec(`DROP INDEX IF EXISTS idx_products_current_phase`);
  await db.exec(`DROP INDEX IF EXISTS idx_documents_product_id`);
  await db.exec(`DROP INDEX IF EXISTS idx_progress_product_id`);
  await db.exec(`DROP INDEX IF EXISTS idx_chat_sessions_product_id`);

  // Drop products table
  await db.exec(`DROP TABLE IF EXISTS products`);

  console.log('[Migration 001] Rollback completed');
  console.log('[Migration 001] WARNING: product_id columns remain in documents/progress tables');
  console.log('[Migration 001] Manual cleanup may be required if needed');
}

module.exports = { up, down };
