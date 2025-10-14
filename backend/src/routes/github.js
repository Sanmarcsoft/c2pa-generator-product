const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const githubAuthService = require('../services/githubAuthService');
const githubRagService = require('../services/githubRagService');
const logger = require('../utils/logger');

/**
 * GitHub RAG API Routes
 */

// Middleware to check validation errors
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/github/auth/token
 * Authenticate with GitHub using Personal Access Token
 */
router.post('/auth/token',
  [
    body('token').notEmpty().withMessage('GitHub token is required')
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { token } = req.body;

      const result = await githubAuthService.authenticateWithToken(token);

      if (result.success) {
        res.json({
          success: true,
          message: 'Successfully authenticated with GitHub',
          user: result.user
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error authenticating with GitHub:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/github/auth/device-flow
 * Initiate GitHub OAuth Device Flow
 */
router.post('/auth/device-flow',
  [
    body('clientId').notEmpty().withMessage('GitHub OAuth Client ID is required')
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { clientId } = req.body;

      const result = await githubAuthService.authenticateWithDeviceFlow(clientId);

      if (result.success) {
        res.json({
          success: true,
          message: 'Successfully authenticated with GitHub',
          user: result.user
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error with GitHub OAuth Device Flow:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during authentication',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/github/auth/status
 * Check GitHub authentication status
 */
router.get('/auth/status', (req, res) => {
  try {
    const isAuthenticated = githubAuthService.isAuthenticated();
    const user = isAuthenticated ? githubAuthService.getAuthenticatedUser() : null;

    res.json({
      authenticated: isAuthenticated,
      user: user ? {
        login: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatar_url
      } : null
    });
  } catch (error) {
    logger.error('Error checking GitHub auth status:', error);
    res.status(500).json({
      authenticated: false,
      error: error.message
    });
  }
});

/**
 * POST /api/github/auth/logout
 * Logout from GitHub
 */
router.post('/auth/logout', (req, res) => {
  try {
    githubAuthService.logout();
    res.json({
      success: true,
      message: 'Successfully logged out from GitHub'
    });
  } catch (error) {
    logger.error('Error logging out from GitHub:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/github/repos/index
 * Index a GitHub repository for RAG
 */
router.post('/repos/index',
  [
    body('owner').notEmpty().withMessage('Repository owner is required'),
    body('repo').notEmpty().withMessage('Repository name is required'),
    body('branch').optional().isString()
  ],
  checkValidation,
  async (req, res) => {
    try {
      if (!githubAuthService.isAuthenticated()) {
        return res.status(401).json({
          success: false,
          message: 'GitHub authentication required. Please authenticate first.'
        });
      }

      const { owner, repo, branch } = req.body;

      logger.info(`Indexing repository: ${owner}/${repo} (branch: ${branch || 'main'})`);

      const result = await githubRagService.indexRepository(owner, repo, branch);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          repoId: result.repoId,
          filesIndexed: result.filesIndexed
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to index repository',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error indexing repository:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during repository indexing',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/github/repos
 * Get list of indexed repositories
 */
router.get('/repos', async (req, res) => {
  try {
    const repos = await githubRagService.getIndexedRepositories();

    res.json({
      success: true,
      count: repos.length,
      repositories: repos
    });
  } catch (error) {
    logger.error('Error getting indexed repositories:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/github/repos/:repoId
 * Delete an indexed repository
 */
router.delete('/repos/:repoId',
  [
    param('repoId').isInt().withMessage('Invalid repository ID')
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { repoId } = req.params;

      const result = await githubRagService.deleteIndexedRepository(parseInt(repoId));

      if (result.success) {
        res.json({
          success: true,
          message: 'Repository index deleted successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to delete repository index',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error deleting repository index:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

/**
 * POST /api/github/search
 * Search indexed GitHub repositories
 */
router.post('/search',
  [
    body('query').notEmpty().withMessage('Search query is required'),
    body('repoFilter').optional().isString(),
    body('limit').optional().isInt({ min: 1, max: 20 })
  ],
  checkValidation,
  async (req, res) => {
    try {
      const { query, repoFilter, limit } = req.body;

      // Extract keywords from query (reuse from RAG service)
      const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);

      const results = await githubRagService.searchRepositories(
        keywords,
        repoFilter,
        limit || 5
      );

      res.json({
        success: true,
        query,
        count: results.length,
        results
      });
    } catch (error) {
      logger.error('Error searching GitHub repositories:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);

module.exports = router;
