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
    const hasGitHubToken = !!getSecret('GITHUB_TOKEN');

    res.json({
      success: true,
      settings: settingsObject,
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
      setSecret('GITHUB_TOKEN', token);
      process.env.GITHUB_TOKEN = token;
      logger.info('GitHub token updated');
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

      if (error.status === 403) {
        logger.warn(`Access forbidden to repository ${owner}/${repo}`);
        return res.json({
          success: false,
          exists: false,
          error: 'Access forbidden. Check GitHub token permissions.'
        });
      }

      throw error;
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

module.exports = router;
