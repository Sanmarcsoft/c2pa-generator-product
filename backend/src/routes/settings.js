const express = require('express');
const router = express.Router();
const { getAsync, runAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

/**
 * Settings Management Routes
 * Handles application configuration and onboarding
 */

/**
 * GET /api/settings
 * Get all application settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await allAsync('SELECT * FROM app_settings');

    // Convert to key-value object
    const settingsObject = {};
    settings.forEach(setting => {
      let value = setting.value;

      // Parse boolean values
      if (setting.type === 'boolean') {
        value = value === 'true';
      }
      // Parse JSON values
      else if (setting.type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if JSON parse fails
        }
      }

      settingsObject[setting.key] = value;
    });

    res.json({
      success: true,
      settings: settingsObject
    });
  } catch (error) {
    logger.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

/**
 * GET /api/settings/onboarding/status
 * Check if onboarding is completed
 * IMPORTANT: This specific route must be defined BEFORE the generic /:key route
 */
router.get('/onboarding/status', async (req, res) => {
  try {
    const onboarding = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['onboarding_completed']
    );

    const isCompleted = onboarding ? onboarding.value === 'true' : false;

    // Get additional onboarding-related settings
    const aiProvider = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['ai_provider']
    );

    const githubConfigured = await getAsync(
      'SELECT value FROM app_settings WHERE key = ?',
      ['github_configured']
    );

    res.json({
      success: true,
      onboardingCompleted: isCompleted,
      aiProvider: aiProvider ? aiProvider.value : 'none',
      githubConfigured: githubConfigured ? githubConfigured.value === 'true' : false
    });
  } catch (error) {
    logger.error('Error checking onboarding status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check onboarding status'
    });
  }
});

/**
 * POST /api/settings/onboarding/complete
 * Mark onboarding as completed
 * ADMIN ONLY
 */
router.post('/onboarding/complete', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { aiProvider, openwebuiUrl, githubConfigured } = req.body;

    // Update onboarding completion status
    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES ('onboarding_completed', 'true', 'boolean', datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = 'true',
        updated_at = datetime('now')
    `);

    // Update AI provider if provided
    if (aiProvider) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('ai_provider', ?, 'string', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [aiProvider]);
    }

    // Update OpenWebUI URL if provided
    if (openwebuiUrl) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('openwebui_url', ?, 'string', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [openwebuiUrl]);
    }

    // Update GitHub configuration status if provided
    if (githubConfigured !== undefined) {
      await runAsync(`
        INSERT INTO app_settings (key, value, type, updated_at)
        VALUES ('github_configured', ?, 'boolean', datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `, [githubConfigured ? 'true' : 'false']);
    }

    logger.info('Onboarding completed');

    res.json({
      success: true,
      message: 'Onboarding completed successfully'
    });
  } catch (error) {
    logger.error('Error completing onboarding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete onboarding'
    });
  }
});

/**
 * POST /api/settings/onboarding/reset
 * Reset onboarding (useful for testing)
 * ADMIN ONLY
 */
router.post('/onboarding/reset', requireAuth, requireAdmin, async (req, res) => {
  try {
    await runAsync(`
      UPDATE app_settings
      SET value = 'false', updated_at = datetime('now')
      WHERE key = 'onboarding_completed'
    `);

    logger.info('Onboarding reset');

    res.json({
      success: true,
      message: 'Onboarding reset successfully'
    });
  } catch (error) {
    logger.error('Error resetting onboarding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset onboarding'
    });
  }
});

/**
 * GET /api/settings/:key
 * Get a specific setting by key
 * IMPORTANT: This parameterized route must be defined AFTER all specific routes
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await getAsync('SELECT * FROM app_settings WHERE key = ?', [key]);

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Setting not found'
      });
    }

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

    res.json({
      success: true,
      key: setting.key,
      value,
      type: setting.type
    });
  } catch (error) {
    logger.error('Error fetching setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch setting'
    });
  }
});

/**
 * PUT /api/settings/:key
 * Update a setting
 * ADMIN ONLY
 * IMPORTANT: This parameterized route must be defined AFTER all specific routes
 */
router.put('/:key', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Value is required'
      });
    }

    // Determine type and convert value
    let type = 'string';
    let valueString = value;

    if (typeof value === 'boolean') {
      type = 'boolean';
      valueString = value ? 'true' : 'false';
    } else if (typeof value === 'object') {
      type = 'json';
      valueString = JSON.stringify(value);
    }

    await runAsync(`
      INSERT INTO app_settings (key, value, type, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        type = excluded.type,
        updated_at = datetime('now')
    `, [key, valueString, type]);

    logger.info(`Setting updated: ${key} = ${valueString}`);

    res.json({
      success: true,
      message: 'Setting updated successfully',
      key,
      value
    });
  } catch (error) {
    logger.error('Error updating setting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update setting'
    });
  }
});

module.exports = router;
