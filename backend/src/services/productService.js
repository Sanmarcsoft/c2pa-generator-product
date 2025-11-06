const crypto = require('crypto');
const { runAsync, getAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');

/**
 * Product Service
 * Business logic for managing products
 */

/**
 * Create a new product
 * @param {string} userId - User ID
 * @param {Object} data - Product data
 * @returns {Promise<Object>} Created product
 */
async function createProduct(userId, data) {
  const { name, description, product_type } = data;

  // Validate required fields
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new Error('Product name is required');
  }

  // Validate name length
  if (name.length > 255) {
    throw new Error('Product name must not exceed 255 characters');
  }

  // Generate product ID
  const productId = crypto.randomUUID();

  // Prepare values with defaults
  const productType = product_type || 'generator_product';
  const status = 'draft';
  const currentPhase = 'phase-1';
  const metadata = JSON.stringify({});

  // Insert product
  await runAsync(
    `INSERT INTO products (
      id, user_id, name, description, product_type, status, current_phase, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      productId,
      userId,
      name.trim(),
      description ? description.trim() : null,
      productType,
      status,
      currentPhase,
      metadata
    ]
  );

  // Create initial progress record for this product
  const progressId = crypto.randomUUID();
  const defaultPhases = JSON.stringify([
    { id: 'phase-1', number: 1, name: 'Preparation & Registration', status: 'pending', tasks: [] },
    { id: 'phase-2', number: 2, name: 'Technical Assessment', status: 'pending', tasks: [] },
    { id: 'phase-3', number: 3, name: 'Implementation & Testing', status: 'pending', tasks: [] },
    { id: 'phase-4', number: 4, name: 'Documentation & Review', status: 'pending', tasks: [] },
    { id: 'phase-5', number: 5, name: 'Certification & Validation', status: 'pending', tasks: [] },
    { id: 'phase-6', number: 6, name: 'Deployment & Maintenance', status: 'pending', tasks: [] }
  ]);

  await runAsync(
    `INSERT INTO progress (id, user_id, product_id, company_name, current_phase, start_date, phases)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [progressId, userId, productId, name.trim(), 'phase-1', new Date().toISOString(), defaultPhases]
  );

  // Retrieve and return the created product
  const product = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);

  logger.info(`Product created: ${productId} by user ${userId}`);

  return product;
}

/**
 * Get all products for a user with optional filtering and sorting
 * @param {string} userId - User ID
 * @param {Object} filters - Filter options (status, sort)
 * @returns {Promise<Object>} Products list with count
 */
async function getProducts(userId, filters = {}) {
  const { status, sort } = filters;

  // Build query with filters
  let sql = 'SELECT * FROM products WHERE user_id = ?';
  const params = [userId];

  // Add status filter
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  // Add sorting
  const sortColumn = sort === 'name' ? 'name' :
                     sort === 'updated_at' ? 'updated_at' :
                     'created_at';
  const sortOrder = sortColumn === 'name' ? 'ASC' : 'DESC';
  sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

  // Execute query
  const products = await allAsync(sql, params);

  logger.info(`Retrieved ${products.length} products for user ${userId}`);

  return {
    products,
    count: products.length
  };
}

/**
 * Get a single product by ID
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Product with additional details
 */
async function getProductById(productId, userId) {
  // Get product
  const product = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);

  if (!product) {
    throw new Error('Product not found');
  }

  // Check ownership
  if (product.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Get document count for this product
  const docCountResult = await getAsync(
    'SELECT COUNT(*) as count FROM documents WHERE product_id = ?',
    [productId]
  );
  const documentsCount = docCountResult ? docCountResult.count : 0;

  // Calculate overall progress (simple percentage based on documents per phase)
  // 6 phases total, each phase should have at least 1 document to be considered "complete"
  const phaseCountResult = await getAsync(
    `SELECT COUNT(DISTINCT category) as phase_count
     FROM documents
     WHERE product_id = ? AND category IS NOT NULL`,
    [productId]
  );
  const completedPhases = phaseCountResult ? phaseCountResult.phase_count : 0;
  const overallProgress = Math.round((completedPhases / 6) * 100);

  logger.info(`Retrieved product ${productId} for user ${userId}`);

  return {
    product,
    documents_count: documentsCount,
    overall_progress: overallProgress
  };
}

/**
 * Update a product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (for authorization)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated product
 */
async function updateProduct(productId, userId, updates) {
  // Get product
  const product = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);

  if (!product) {
    throw new Error('Product not found');
  }

  // Check ownership
  if (product.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Valid options for validation
  const validStatuses = ['draft', 'in_progress', 'submitted', 'certified', 'active', 'completed'];
  const validPhases = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'];

  // Validate updates
  if (updates.name !== undefined) {
    if (typeof updates.name !== 'string' || updates.name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }
    if (updates.name.length > 255) {
      throw new Error('Product name must not exceed 255 characters');
    }
  }

  if (updates.status !== undefined && !validStatuses.includes(updates.status)) {
    throw new Error(`Invalid status. Valid options are: ${validStatuses.join(', ')}`);
  }

  if (updates.current_phase !== undefined && !validPhases.includes(updates.current_phase)) {
    throw new Error(`Invalid phase. Valid options are: ${validPhases.join(', ')}`);
  }

  // Build update query dynamically
  const allowedFields = ['name', 'description', 'status', 'current_phase', 'product_type'];
  const updateFields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      params.push(value !== undefined && value !== null && typeof value === 'string' ? value.trim() : value);
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  // Add updated_at timestamp
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(productId);

  // Execute update
  const sql = `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`;
  await runAsync(sql, params);

  // Retrieve and return updated product
  const updatedProduct = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);

  logger.info(`Product updated: ${productId} by user ${userId}`);

  return updatedProduct;
}

/**
 * Delete a product (hard delete with cascade)
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<void>}
 */
async function deleteProduct(productId, userId) {
  // Get product
  const product = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);

  if (!product) {
    throw new Error('Product not found');
  }

  // Check ownership
  if (product.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Delete product (cascade will handle related records)
  await runAsync('DELETE FROM products WHERE id = ?', [productId]);

  logger.info(`Product deleted: ${productId} by user ${userId}`);
}

/**
 * Get detailed progress for a product
 * @param {string} productId - Product ID
 * @param {string} userId - User ID (for authorization)
 * @returns {Promise<Object>} Detailed progress breakdown
 */
async function getProductProgress(productId, userId) {
  // Get product
  const product = await getAsync('SELECT * FROM products WHERE id = ?', [productId]);

  if (!product) {
    throw new Error('Product not found');
  }

  // Check ownership
  if (product.user_id !== userId) {
    throw new Error('Access denied');
  }

  // Import C2PA requirements for phase completion criteria
  const { C2PA_REQUIREMENTS } = require('../knowledge/c2paRequirements');

  // Define all phases
  const phases = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'];

  // Get all documents for this product with metadata
  const documents = await allAsync(
    'SELECT id, original_name, category, file_path, metadata, created_at FROM documents WHERE product_id = ? ORDER BY created_at DESC',
    [productId]
  );

  // Parse document metadata and organize by phase
  const documentsByPhase = {};
  let totalDocuments = 0;

  for (const doc of documents) {
    let metadata = {};
    try {
      metadata = typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata;
    } catch (e) {
      logger.warn(`Failed to parse metadata for document ${doc.id}`);
    }

    const phase = doc.category || metadata.phase;
    if (phase) {
      if (!documentsByPhase[phase]) {
        documentsByPhase[phase] = [];
      }
      documentsByPhase[phase].push({
        id: doc.id,
        name: doc.original_name,
        requirement_type: metadata.requirement_type,
        validation_status: metadata.validation_status,
        c2pa_conformance: metadata.c2pa_conformance,
        created_at: doc.created_at
      });
      totalDocuments++;
    }
  }

  // Calculate progress for each phase
  const byPhase = [];
  let completedPhases = 0;

  for (const phase of phases) {
    const phaseDocs = documentsByPhase[phase] || [];
    const phaseReq = C2PA_REQUIREMENTS[phase];

    // Get completion criteria for this phase
    const minDocuments = phaseReq ? phaseReq.completionCriteria.minDocuments : 1;
    const mandatoryRequirements = phaseReq
      ? phaseReq.requirements.filter(r => r.mandatory).map(r => r.type)
      : [];

    // Check which mandatory requirements are covered
    const submittedRequirementTypes = [...new Set(phaseDocs.map(d => d.requirement_type))];
    const missingRequirements = mandatoryRequirements.filter(
      req => !submittedRequirementTypes.includes(req)
    );

    // Check if documents meet quality standards
    const approvedDocs = phaseDocs.filter(d =>
      d.validation_status === 'approved' &&
      d.c2pa_conformance &&
      d.c2pa_conformance.isSufficient
    );

    // Determine phase status
    let status = 'pending';
    let statusReason = 'No documents uploaded';

    if (phaseDocs.length > 0) {
      status = 'in-progress';
      statusReason = 'Documents uploaded, validation in progress';

      // Check if phase is complete
      const hasMinDocuments = phaseDocs.length >= minDocuments;
      const hasAllMandatory = missingRequirements.length === 0;
      const hasQualityDocs = approvedDocs.length >= minDocuments;

      if (hasMinDocuments && hasAllMandatory && hasQualityDocs) {
        status = 'completed';
        statusReason = 'All requirements met';
        completedPhases++;
      } else {
        // Provide specific reason for incomplete status
        const reasons = [];
        if (!hasMinDocuments) {
          reasons.push(`Need ${minDocuments - phaseDocs.length} more document(s)`);
        }
        if (!hasAllMandatory) {
          reasons.push(`Missing: ${missingRequirements.join(', ')}`);
        }
        if (!hasQualityDocs) {
          reasons.push(`Need ${minDocuments - approvedDocs.length} more approved document(s)`);
        }
        statusReason = reasons.join('; ');
      }
    }

    byPhase.push({
      phase,
      phase_name: phaseReq ? phaseReq.name : phase,
      document_count: phaseDocs.length,
      approved_count: approvedDocs.length,
      required_count: minDocuments,
      mandatory_requirements: mandatoryRequirements,
      submitted_requirements: submittedRequirementTypes,
      missing_requirements: missingRequirements,
      status,
      status_reason: statusReason,
      documents: phaseDocs.map(d => ({
        id: d.id,
        name: d.name,
        requirement_type: d.requirement_type,
        validation_status: d.validation_status,
        conformance_sufficient: d.c2pa_conformance ? d.c2pa_conformance.isSufficient : false
      }))
    });
  }

  // Calculate overall percentage based on completed phases
  const overallPercentage = Math.round((completedPhases / phases.length) * 100);

  logger.info(`Retrieved progress for product ${productId}: ${completedPhases}/${phases.length} phases completed`);

  return {
    overall_percentage: overallPercentage,
    total_documents: totalDocuments,
    completed_phases: completedPhases,
    total_phases: phases.length,
    by_phase: byPhase,
    current_phase: product.current_phase
  };
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductProgress
};
