const request = require('supertest');
const app = require('../src/app');
const { initDatabase, runAsync, getAsync, allAsync } = require('../src/models/database');
const crypto = require('crypto');

describe('Products API Routes', () => {
  let authToken;
  let userId;
  let testProductId;

  // Initialize database before all tests
  beforeAll(async () => {
    await initDatabase();
  });

  // Clean up database and create test user before each test
  beforeEach(async () => {
    // Delete all products, documents, progress, chat_sessions, chat_messages, and users
    await runAsync('DELETE FROM documents');
    await runAsync('DELETE FROM progress');
    await runAsync('DELETE FROM chat_messages');
    await runAsync('DELETE FROM chat_sessions');
    await runAsync('DELETE FROM products');
    await runAsync('DELETE FROM users');

    // Create test user and get token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@example.com',
        password: 'SecurePass123!',
        name: 'Test User'
      });

    authToken = response.body.token;
    userId = response.body.user.id;
  });

  /**
   * Test Suite: POST /api/products - Create Product
   */
  describe('POST /api/products', () => {
    test('should create new product successfully', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product for C2PA certification'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.id).toBeDefined();
      expect(response.body.product.name).toBe('Test Product');
      expect(response.body.product.description).toBe('A test product for C2PA certification');
      expect(response.body.product.user_id).toBe(userId);
      expect(response.body.product.status).toBe('draft');
      expect(response.body.product.current_phase).toBe('phase-1');
      expect(response.body.product.product_type).toBe('generator_product');
      expect(response.body.product.created_at).toBeDefined();
      expect(response.body.product.updated_at).toBeDefined();

      // Store for later tests
      testProductId = response.body.product.id;
    });

    test('should create product without optional description', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Minimal Product'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product.name).toBe('Minimal Product');
      expect(response.body.product.description).toBeNull();
    });

    test('should create product with custom product_type', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Custom Type Product',
          product_type: 'custom_product'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.product.product_type).toBe('custom_product');
    });

    test('should reject creation without authentication', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Unauthorized Product'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject creation with invalid token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          name: 'Invalid Token Product'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject creation without name', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Product without name'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toContain('name');
    });

    test('should reject creation with empty name', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject creation with name exceeding max length', async () => {
      const longName = 'a'.repeat(256);
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: longName
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: GET /api/products - List Products
   */
  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create multiple test products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Product Alpha', description: 'First product' });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Product Beta', description: 'Second product' });

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Product Gamma', description: 'Third product' });
    });

    test('should list all products for authenticated user', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products).toBeDefined();
      expect(response.body.products).toBeInstanceOf(Array);
      expect(response.body.products.length).toBe(3);
      expect(response.body.count).toBe(3);
    });

    test('should return empty list when no products exist', async () => {
      // Delete all products
      await runAsync('DELETE FROM products');

      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    test('should filter products by status', async () => {
      // Update one product to 'active' status
      const product = await getAsync('SELECT id FROM products WHERE user_id = ? LIMIT 1', [userId]);
      await runAsync('UPDATE products SET status = ? WHERE id = ?', ['active', product.id]);

      const response = await request(app)
        .get('/api/products?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products.length).toBe(1);
      expect(response.body.products[0].status).toBe('active');
    });

    test('should sort products by name', async () => {
      const response = await request(app)
        .get('/api/products?sort=name')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products[0].name).toBe('Product Alpha');
      expect(response.body.products[1].name).toBe('Product Beta');
      expect(response.body.products[2].name).toBe('Product Gamma');
    });

    test('should sort products by created_at (default)', async () => {
      const response = await request(app)
        .get('/api/products?sort=created_at')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.products).toHaveLength(3);
    });

    test('should reject list without authentication', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should only return products owned by the user', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'SecurePass123!',
          name: 'Other User'
        });

      const otherToken = otherUserResponse.body.token;

      // Create product for other user
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Other User Product' });

      // Get products for original user
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.products.length).toBe(3); // Should not see other user's product
      expect(response.body.products.every(p => p.user_id === userId)).toBe(true);
    });
  });

  /**
   * Test Suite: GET /api/products/:productId - Get Single Product
   */
  describe('GET /api/products/:productId', () => {
    let productId;

    beforeEach(async () => {
      // Create a test product
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'Product for getting details'
        });

      productId = response.body.product.id;
    });

    test('should get single product with details', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.id).toBe(productId);
      expect(response.body.product.name).toBe('Test Product');
      expect(response.body.documents_count).toBeDefined();
      expect(response.body.overall_progress).toBeDefined();
      expect(typeof response.body.documents_count).toBe('number');
      expect(typeof response.body.overall_progress).toBe('number');
    });

    test('should calculate documents count correctly', async () => {
      // Add product_id column to documents if not exists (migration)
      const tableInfo = await allAsync('PRAGMA table_info(documents)');
      const hasProductId = tableInfo.some(col => col.name === 'product_id');

      if (!hasProductId) {
        await runAsync('ALTER TABLE documents ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE');
      }

      // Create some documents for this product
      await runAsync(
        'INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, user_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'doc1.pdf', 'Document 1', '/path/doc1.pdf', 'pdf', 1000, 'phase-1', new Date().toISOString(), userId, productId]
      );
      await runAsync(
        'INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, user_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'doc2.pdf', 'Document 2', '/path/doc2.pdf', 'pdf', 2000, 'phase-2', new Date().toISOString(), userId, productId]
      );

      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.documents_count).toBe(2);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = crypto.randomUUID();
      const response = await request(app)
        .get(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject access to other user\'s product', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'SecurePass123!',
          name: 'Other User'
        });

      const otherToken = otherUserResponse.body.token;

      // Try to access first user's product
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: PUT /api/products/:productId - Update Product
   */
  describe('PUT /api/products/:productId', () => {
    let productId;

    beforeEach(async () => {
      // Create a test product
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Original Product',
          description: 'Original description'
        });

      productId = response.body.product.id;
    });

    test('should update product name successfully', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Product Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product).toBeDefined();
      expect(response.body.product.name).toBe('Updated Product Name');
      expect(response.body.product.description).toBe('Original description'); // Unchanged
    });

    test('should update product description', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated description'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.description).toBe('Updated description');
      expect(response.body.product.name).toBe('Original Product'); // Unchanged
    });

    test('should update product status', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'active'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.status).toBe('active');
    });

    test('should update multiple fields at once', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Name',
          description: 'New Description',
          status: 'completed'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.product.name).toBe('New Name');
      expect(response.body.product.description).toBe('New Description');
      expect(response.body.product.status).toBe('completed');
    });

    test('should update updated_at timestamp', async () => {
      const originalProduct = await getAsync('SELECT updated_at FROM products WHERE id = ?', [productId]);

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.product.updated_at).not.toBe(originalProduct.updated_at);
    });

    test('should reject update with empty name', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: ''
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject update for non-existent product', async () => {
      const fakeId = crypto.randomUUID();
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject update for other user\'s product', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'SecurePass123!',
          name: 'Other User'
        });

      const otherToken = otherUserResponse.body.token;

      // Try to update first user's product
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Hacked Name'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject update without authentication', async () => {
      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send({
          name: 'Unauthorized Update'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: DELETE /api/products/:productId - Delete Product
   */
  describe('DELETE /api/products/:productId', () => {
    let productId;

    beforeEach(async () => {
      // Create a test product
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Product to Delete',
          description: 'This will be deleted'
        });

      productId = response.body.product.id;
    });

    test('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Verify product is deleted
      const product = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);
      expect(product).toBeUndefined();
    });

    test('should cascade delete related documents', async () => {
      // Add product_id column to documents if not exists (migration)
      const tableInfo = await allAsync('PRAGMA table_info(documents)');
      const hasProductId = tableInfo.some(col => col.name === 'product_id');

      if (!hasProductId) {
        await runAsync('ALTER TABLE documents ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE');
      }

      // Create document for this product
      const docId = crypto.randomUUID();
      await runAsync(
        'INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, user_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [docId, 'doc.pdf', 'Document', '/path/doc.pdf', 'pdf', 1000, 'phase-1', new Date().toISOString(), userId, productId]
      );

      // Delete product
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify document is also deleted
      const document = await getAsync('SELECT * FROM documents WHERE id = ?', [docId]);
      expect(document).toBeUndefined();
    });

    test('should cascade delete related progress records', async () => {
      // Add product_id column to progress if not exists (migration)
      const tableInfo = await allAsync('PRAGMA table_info(progress)');
      const hasProductId = tableInfo.some(col => col.name === 'product_id');

      if (!hasProductId) {
        await runAsync('ALTER TABLE progress ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE');
      }

      // Create progress for this product
      const progressId = crypto.randomUUID();
      await runAsync(
        'INSERT INTO progress (id, user_id, current_phase, phases, product_id) VALUES (?, ?, ?, ?, ?)',
        [progressId, userId, 'phase-1', '[]', productId]
      );

      // Delete product
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Verify progress is also deleted
      const progress = await getAsync('SELECT * FROM progress WHERE id = ?', [progressId]);
      expect(progress).toBeUndefined();
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = crypto.randomUUID();
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject delete for other user\'s product', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'SecurePass123!',
          name: 'Other User'
        });

      const otherToken = otherUserResponse.body.token;

      // Try to delete first user's product
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject delete without authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite: GET /api/products/:productId/progress - Get Product Progress
   */
  describe('GET /api/products/:productId/progress', () => {
    let productId;

    beforeEach(async () => {
      // Create a test product
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Progress Test Product',
          description: 'Product for testing progress'
        });

      productId = response.body.product.id;
    });

    test('should get product progress successfully', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.overall_percentage).toBeDefined();
      expect(typeof response.body.progress.overall_percentage).toBe('number');
      expect(response.body.progress.by_phase).toBeDefined();
      expect(Array.isArray(response.body.progress.by_phase)).toBe(true);
    });

    test('should calculate progress by phase correctly', async () => {
      // Add product_id column to documents if not exists (migration)
      const tableInfo = await allAsync('PRAGMA table_info(documents)');
      const hasProductId = tableInfo.some(col => col.name === 'product_id');

      if (!hasProductId) {
        await runAsync('ALTER TABLE documents ADD COLUMN product_id TEXT REFERENCES products(id) ON DELETE CASCADE');
      }

      // Create documents in different phases
      await runAsync(
        'INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, user_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'doc1.pdf', 'Doc 1', '/path/doc1.pdf', 'pdf', 1000, 'phase-1', new Date().toISOString(), userId, productId]
      );
      await runAsync(
        'INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, user_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'doc2.pdf', 'Doc 2', '/path/doc2.pdf', 'pdf', 2000, 'phase-1', new Date().toISOString(), userId, productId]
      );
      await runAsync(
        'INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, user_id, product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), 'doc3.pdf', 'Doc 3', '/path/doc3.pdf', 'pdf', 3000, 'phase-2', new Date().toISOString(), userId, productId]
      );

      const response = await request(app)
        .get(`/api/products/${productId}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.progress.by_phase).toHaveLength(6); // 6 phases

      const phase1 = response.body.progress.by_phase.find(p => p.phase === 'phase-1');
      const phase2 = response.body.progress.by_phase.find(p => p.phase === 'phase-2');

      expect(phase1.document_count).toBe(2);
      expect(phase2.document_count).toBe(1);
    });

    test('should return 404 for non-existent product', async () => {
      const fakeId = crypto.randomUUID();
      const response = await request(app)
        .get(`/api/products/${fakeId}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject access to other user\'s product progress', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'otheruser@example.com',
          password: 'SecurePass123!',
          name: 'Other User'
        });

      const otherToken = otherUserResponse.body.token;

      // Try to access first user's product progress
      const response = await request(app)
        .get(`/api/products/${productId}/progress`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}/progress`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
