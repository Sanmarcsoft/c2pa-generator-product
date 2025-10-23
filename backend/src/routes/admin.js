const express = require('express');
const router = express.Router();
const { getAsync, runAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const { setSecret, getSecret } = require('../utils/secrets');

/**
 * Admin Configuration Routes
 * Handles admin-only configuration for AI providers, GitHub, and system settings
 */

/**
 * GET /api/admin/config
 * Get all admin-configurable settings
 * ADMIN ONLY
 */
router.get('/config', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get settings from database
    const settings = await allAsync('SELECT * FROM app_settings');

    // Convert to key-value object
    const settingsObject = {};
    settings.forEach(setting => {
      let value = setting.value;

      if (setting.type === 'boolean') {
        value = value === 'true';
      } else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parse fails
        }
      }

      settingsObject[setting.key] = value;
    });

    // Get secret values (without exposing actual secrets)
    const hasOpenAIKey = !!getSecret('OPENAI_API_KEY');
    const hasOpenWebUIKey = !!getSecret('OPENWEBUI_API_KEY');

    // Check for GitHub token in database
    const githubTokenSetting = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['github_token']
    );
    const hasGitHubToken = !!(githubTokenSetting && githubTokenSetting.value);

    // Remove github_token from settings if it exists (never expose it)
    delete settingsObject.github_token;

    // Add hasGithubToken flag to config
    settingsObject.hasGithubToken = hasGitHubToken;

    res.json({
      success: true,
      config: settingsObject,
      secrets: {
        hasOpenAIKey,
        hasOpenWebUIKey,
        hasGitHubToken
      }
    });
  } catch (error) {
    logger.error('Error fetching admin config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin configuration'
    });
  }
});

/**
 * PUT /api/admin/config/ai
 * Update AI provider configuration
 * ADMIN ONLY
 */
router.put('/config/ai', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { provider, openwebuiUrl, openaiApiKey, openwebuiApiKey, aiModel } = req.body;

    // Update AI provider
    if (provider) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('ai_provider', ?, 'string', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [provider]);
    }

    // Update OpenWebUI URL
    if (openwebuiUrl !== undefined) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('openwebui_url', ?, 'string', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [openwebuiUrl]);

      // Also update environment variable for runtime
      process.env.OPENWEBUI_URL = openwebuiUrl;
    }

    // Update AI model
    if (aiModel !== undefined) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('ai_model', ?, 'string', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [aiModel]);

      // Also update environment variable for runtime
      process.env.AI_MODEL = aiModel;
    }

    // Update API keys in secrets if provided
    if (openaiApiKey) {
      setSecret('OPENAI_API_KEY', openaiApiKey);
      process.env.OPENAI_API_KEY = openaiApiKey;
      logger.info('OpenAI API key updated');
    }

    if (openwebuiApiKey !== undefined) {
      setSecret('OPENWEBUI_API_KEY', openwebuiApiKey);
      process.env.OPENWEBUI_API_KEY = openwebuiApiKey;
      logger.info('OpenWebUI API key updated');
    }

    logger.info(`AI configuration updated by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'AI configuration updated successfully',
      requiresRestart: !!(openaiApiKey || openwebuiApiKey) // Secrets may need restart
    });
  } catch (error) {
    logger.error('Error updating AI config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI configuration'
    });
  }
});

/**
 * PUT /api/admin/config/github
 * Update GitHub integration configuration
 * ADMIN ONLY
 */
router.put('/config/github', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { token, configured } = req.body;

    // Update GitHub token in secrets if provided
    if (token) {
      // Validate GitHub token before saving
      try {
        const { Octokit } = require('@octokit/rest');
        const octokit = new Octokit({ auth: token });
        const { data: user } = await octokit.rest.users.getAuthenticated();
        logger.info(`GitHub token validated for user: ${user.login}`);

        // Token is valid, save it
        setSecret('GITHUB_TOKEN', token);
        process.env.GITHUB_TOKEN = token;
        logger.info('GitHub token updated');
      } catch (error) {
        logger.error('GitHub token validation failed:', error);
        return res.status(401).json({
          success: false,
          error: 'Invalid GitHub token or insufficient permissions. Token needs "repo" or "public_repo" scope.'
        });
      }
    }

    // Update GitHub configured status
    if (configured !== undefined) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('github_configured', ?, 'boolean', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [configured ? 'true' : 'false']);
    }

    logger.info(`GitHub configuration updated by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'GitHub configuration updated successfully'
    });
  } catch (error) {
    logger.error('Error updating GitHub config:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update GitHub configuration'
    });
  }
});

/**
 * GET /api/admin/github/token
 * Get GitHub token status (masked preview only)
 * ADMIN ONLY
 */
router.get('/github/token', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tokenSetting = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['github_token']
    );

    if (!tokenSetting || !tokenSetting.value) {
      return res.json({
        success: true,
        hasToken: false
      });
    }

    // Return masked preview (first 4 + last 4 chars)
    const token = tokenSetting.value;
    const tokenPreview = token.length > 8
      ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
      : `${token.substring(0, 4)}...****`;

    res.json({
      success: true,
      hasToken: true,
      tokenPreview
    });
  } catch (error) {
    logger.error('Error fetching GitHub token status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch GitHub token status'
    });
  }
});

/**
 * POST /api/admin/github/token
 * Set GitHub token (only if no token exists)
 * ADMIN ONLY
 */
router.post('/github/token', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { token } = req.body;

    // Validate token is provided
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'GitHub token is required'
      });
    }

    // Validate token format (GitHub personal access tokens)
    const isValidFormat = token.startsWith('ghp_') || token.startsWith('github_pat_');
    if (!isValidFormat) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token format. GitHub tokens must start with "ghp_" or "github_pat_"'
      });
    }

    // Check if token already exists
    const existingToken = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['github_token']
    );

    if (existingToken && existingToken.value) {
      return res.status(409).json({
        success: false,
        error: 'A GitHub token already exists. Please delete the existing token first before setting a new one.'
      });
    }

    // Validate token with GitHub API
    try {
      const { Octokit } = require('@octokit/rest');
      const octokit = new Octokit({ auth: token });
      const { data: user } = await octokit.rest.users.getAuthenticated();
      logger.info(`GitHub token validated for user: ${user.login}`);
    } catch (error) {
      logger.error('GitHub token validation failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid GitHub token or insufficient permissions. Token needs "repo" or "public_repo" scope.'
      });
    }

    // Save token
    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES ('github_token', ?, 'secret', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `, [token]);

    // Update github_configured flag for backwards compatibility
    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES ('github_configured', 'true', 'boolean', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = 'true',
        updated_at = datetime('now')
    `);

    // Update environment variable for runtime use
    process.env.GITHUB_TOKEN = token;
    setSecret('GITHUB_TOKEN', token);

    logger.info(`GitHub token set by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'GitHub token set successfully'
    });
  } catch (error) {
    logger.error('Error setting GitHub token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set GitHub token'
    });
  }
});

/**
 * DELETE /api/admin/github/token
 * Delete GitHub token
 * ADMIN ONLY
 */
router.delete('/github/token', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Check if token exists
    const existingToken = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['github_token']
    );

    if (!existingToken || !existingToken.value) {
      return res.status(404).json({
        success: false,
        error: 'No token found to delete'
      });
    }

    // Delete token
    await runAsync('DELETE FROM app_settings WHERE key = ?', ['github_token']);

    // Update github_configured flag
    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES ('github_configured', 'false', 'boolean', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = 'false',
        updated_at = datetime('now')
    `);

    // Clear environment variable
    delete process.env.GITHUB_TOKEN;
    setSecret('GITHUB_TOKEN', '');

    logger.info(`GitHub token deleted by admin: ${req.user.email}`);

    res.json({
      success: true,
      message: 'GitHub token deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting GitHub token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete GitHub token'
    });
  }
});

/**
 * POST /api/admin/config/test-ai
 * Test AI provider connection
 * ADMIN ONLY
 */
router.post('/config/test-ai', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { provider, openwebuiUrl, openaiApiKey } = req.body;

    let testResult = { success: false, message: '' };

    if (provider === 'openwebui') {
      // Test OpenWebUI connection
      try {
        const OpenAI = require('openai');
        const client = new OpenAI({
          baseURL: openwebuiUrl || process.env.OPENWEBUI_URL,
          apiKey: getSecret('OPENWEBUI_API_KEY') || 'not-needed'
        });

        // Try to list models as a connection test
        const response = await client.models.list();
        testResult = {
          success: true,
          message: `Connected successfully! Found ${response.data?.length || 0} models.`,
          models: response.data?.map(m => m.id) || []
        };
      } catch (error) {
        testResult = {
          success: false,
          message: `Connection failed: ${error.message}`
        };
      }
    } else if (provider === 'openai') {
      // Test OpenAI API connection
      try {
        const OpenAI = require('openai');
        const client = new OpenAI({
          apiKey: openaiApiKey || getSecret('OPENAI_API_KEY')
        });

        // Try to list models
        const response = await client.models.list();
        testResult = {
          success: true,
          message: 'Connected to OpenAI successfully!',
          models: response.data?.map(m => m.id).slice(0, 5) || []
        };
      } catch (error) {
        testResult = {
          success: false,
          message: `Connection failed: ${error.message}`
        };
      }
    } else {
      testResult = {
        success: true,
        message: 'Fallback mode - no AI provider configured'
      };
    }

    res.json(testResult);
  } catch (error) {
    logger.error('Error testing AI connection:', error);
    res.status(500).json({
      success: false,
      message: `Test failed: ${error.message}`
    });
  }
});

/**
 * GET /api/admin/github/check/:owner/:repo
 * Check if a GitHub repository exists and is accessible
 * ADMIN ONLY
 */
router.get('/github/check/:owner/:repo', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { owner, repo } = req.params;

    logger.info(`Checking repository existence: ${owner}/${repo}`);

    // Check if GitHub token is configured
    const githubToken = getSecret('GITHUB_TOKEN');
    if (!githubToken) {
      return res.json({
        success: false,
        exists: false,
        error: 'GitHub token not configured. Please configure GitHub integration first.'
      });
    }

    // Use GitHub API to check repository existence
    try {
      const { Octokit } = require('@octokit/rest');
      const octokit = new Octokit({ auth: githubToken });

      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo
      });

      logger.info(`Repository ${owner}/${repo} exists and is accessible`);

      res.json({
        success: true,
        exists: true,
        repository: {
          fullName: repoData.full_name,
          description: repoData.description,
          defaultBranch: repoData.default_branch,
          isPrivate: repoData.private,
          url: repoData.html_url
        }
      });
    } catch (error) {
      if (error.status === 404) {
        logger.info(`Repository ${owner}/${repo} not found`);
        return res.json({
          success: false,
          exists: false,
          error: 'Repository not found or not accessible'
        });
      }

      if (error.status === 403 || error.status === 401) {
        logger.warn(`Authentication/authorization failed for repository ${owner}/${repo}`);
        return res.json({
          success: false,
          exists: false,
          error: 'GitHub authentication failed. Check token permissions.'
        });
      }

      // Log the error but return a user-friendly message
      logger.error(`GitHub API error for ${owner}/${repo}:`, error.message);
      return res.json({
        success: false,
        exists: false,
        error: `GitHub API error: ${error.message || 'Unknown error'}`
      });
    }
  } catch (error) {
    logger.error('Error checking repository existence:', error);
    res.status(500).json({
      success: false,
      exists: false,
      error: 'Failed to check repository existence'
    });
  }
});

/**
 * GET /api/admin/stats
 * Get system statistics and health
 * ADMIN ONLY
 */
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    // Get user count
    const userCount = await getAsync('SELECT COUNT(*) as count FROM users');

    // Get admin count
    const adminCount = await getAsync("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");

    // Get settings count
    const settingsCount = await getAsync('SELECT COUNT(*) as count FROM app_settings');

    // Get onboarding status
    const onboarding = await getAsync("SELECT value FROM app_settings WHERE key = 'onboarding_completed'");

    // Get AI provider
    const aiProvider = await getAsync("SELECT value FROM app_settings WHERE key = 'ai_provider'");

    res.json({
      success: true,
      stats: {
        users: {
          total: userCount?.count || 0,
          admins: adminCount?.count || 0
        },
        settings: {
          total: settingsCount?.count || 0
        },
        system: {
          onboardingCompleted: onboarding?.value === 'true',
          aiProvider: aiProvider?.value || 'none',
          nodeVersion: process.version,
          uptime: process.uptime()
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system statistics'
    });
  }
});

/**
 * User Management Routes
 */

/**
 * GET /api/admin/users
 * Get all users
 * ADMIN ONLY
 */
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await allAsync(`
      SELECT
        id,
        email,
        name,
        role,
        created_at,
        last_login
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name || '',
        role: user.role,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }))
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

/**
 * POST /api/admin/users
 * Create a new user
 * ADMIN ONLY
 */
router.post('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Validate role
    const validRoles = ['user', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be "user" or "admin"'
      });
    }

    // Check if user already exists
    const existingUser = await getAsync('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate UUID
    const { v4: uuidv4 } = require('uuid');
    const userId = uuidv4();

    // Create user
    await runAsync(`
      INSERT INTO users (id, email, password_hash, name, role, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [userId, email.toLowerCase(), passwordHash, name || null, role || 'user']);

    logger.info(`User created by admin ${req.user.email}: ${email} (role: ${role || 'user'})`);

    // Fetch the created user (without password)
    const newUser = await getAsync(`
      SELECT id, email, name, role, created_at
      FROM users
      WHERE id = ?
    `, [userId]);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name || '',
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

/**
 * PUT /api/admin/users/:id
 * Update a user
 * ADMIN ONLY
 */
router.put('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;

    // Check if user exists
    const existingUser = await getAsync('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from removing their own admin role
    if (id === req.user.id && role && role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You cannot remove your own admin privileges'
      });
    }

    const updates = [];
    const params = [];

    // Update email
    if (email && email !== existingUser.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }

      // Check if email is already taken
      const emailExists = await getAsync('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use'
        });
      }

      updates.push('email = ?');
      params.push(email.toLowerCase());
    }

    // Update name
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name || null);
    }

    // Update role
    if (role) {
      const validRoles = ['user', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role. Must be "user" or "admin"'
        });
      }

      updates.push('role = ?');
      params.push(role);
    }

    // Update password
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 8 characters long'
        });
      }

      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash(password, 10);

      updates.push('password_hash = ?');
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Add user ID to params
    params.push(id);

    // Update user
    await runAsync(`
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = ?
    `, params);

    logger.info(`User updated by admin ${req.user.email}: ${existingUser.email} -> ${email || existingUser.email}`);

    // Fetch updated user
    const updatedUser = await getAsync(`
      SELECT id, email, name, role, created_at, last_login
      FROM users
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name || '',
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        lastLogin: updatedUser.last_login
      }
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 * ADMIN ONLY
 */
router.delete('/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await getAsync('SELECT * FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }

    // Check if this is the last admin
    if (existingUser.role === 'admin') {
      const adminCount = await getAsync("SELECT COUNT(*) as count FROM users WHERE role = 'admin'");
      if (adminCount.count <= 1) {
        return res.status(403).json({
          success: false,
          error: 'Cannot delete the last admin user'
        });
      }
    }

    // Delete user (cascading deletes will handle related records)
    await runAsync('DELETE FROM users WHERE id = ?', [id]);

    logger.info(`User deleted by admin ${req.user.email}: ${existingUser.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
});

module.exports = router;
