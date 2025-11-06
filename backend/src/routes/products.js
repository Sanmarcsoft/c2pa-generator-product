const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const productService = require('../services/productService');
const logger = require('../utils/logger');

/**
 * POST /api/products - Create a new product
 * Requires authentication
 */
router.post('/', requireAuth, express.json(), async (req, res, next) => {
  try {
    const { name, description, product_type } = req.body;

    // Create product
    const product = await productService.createProduct(req.user.id, {
      name,
      description,
      product_type
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    logger.error('Error creating product:', error);

    // Handle validation errors
    if (error.message.includes('required') || error.message.includes('cannot be empty') || error.message.includes('must not exceed')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    next(error);
  }
});

/**
 * GET /api/products - List all products for authenticated user
 * Query params: status, sort (created_at, updated_at, name)
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { status, sort } = req.query;

    const result = await productService.getProducts(req.user.id, {
      status,
      sort
    });

    res.json({
      success: true,
      products: result.products,
      count: result.count
    });
  } catch (error) {
    logger.error('Error listing products:', error);
    next(error);
  }
});

/**
 * GET /api/products/:productId - Get single product details
 * Includes overall progress percentage and document count
 */
router.get('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const result = await productService.getProductById(productId, req.user.id);

    res.json({
      success: true,
      product: result.product,
      documents_count: result.documents_count,
      overall_progress: result.overall_progress
    });
  } catch (error) {
    logger.error('Error getting product:', error);

    // Handle not found
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Handle access denied
    if (error.message === 'Access denied') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to access this product'
      });
    }

    next(error);
  }
});

/**
 * PUT /api/products/:productId - Update product
 * Updates name, description, status, etc.
 */
router.put('/:productId', requireAuth, express.json(), async (req, res, next) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await productService.updateProduct(productId, req.user.id, updates);

    res.json({
      success: true,
      product
    });
  } catch (error) {
    logger.error('Error updating product:', error);

    // Handle validation errors
    if (error.message.includes('cannot be empty') || error.message.includes('must not exceed') || error.message.includes('No valid fields')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    // Handle not found
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Handle access denied
    if (error.message === 'Access denied') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to update this product'
      });
    }

    next(error);
  }
});

/**
 * DELETE /api/products/:productId - Delete product
 * Hard delete with cascade (deletes documents, progress, chat_sessions)
 */
router.delete('/:productId', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;

    await productService.deleteProduct(productId, req.user.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);

    // Handle not found
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Handle access denied
    if (error.message === 'Access denied') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to delete this product'
      });
    }

    next(error);
  }
});

/**
 * GET /api/products/:productId/progress - Get detailed progress for product
 * Returns phase-by-phase breakdown
 */
router.get('/:productId/progress', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.params;

    const progress = await productService.getProductProgress(productId, req.user.id);

    res.json({
      success: true,
      progress
    });
  } catch (error) {
    logger.error('Error getting product progress:', error);

    // Handle not found
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    // Handle access denied
    if (error.message === 'Access denied') {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to access this product'
      });
    }

    next(error);
  }
});

module.exports = router;
