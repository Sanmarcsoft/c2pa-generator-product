const express = require('express');
const router = express.Router();
const { getAsync, runAsync } = require('../models/database');
const requireAuth = require('../middleware/requireAuth');
const logger = require('../utils/logger');

/**
 * GET /api/user/theme
 * Get user's theme preferences
 */
router.get('/theme', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's theme preferences from database
    const user = await getAsync(
      'SELECT theme, theme_mode FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      theme: user.theme || 'tech-savvy-trustworthy',
      themeMode: user.theme_mode || 'system'
    });
  } catch (error) {
    logger.error('Error fetching user theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch theme preferences'
    });
  }
});

/**
 * PUT /api/user/theme
 * Update user's theme preferences
 */
router.put('/theme', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, themeMode } = req.body;

    // Validate theme
    const validThemes = [
      'elegant',
      'retro',
      'modern-minimalist',
      'friendly-approachable',
      'tech-savvy-trustworthy'
    ];

    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid theme'
      });
    }

    // Validate theme mode
    const validModes = ['light', 'dark', 'system'];
    if (themeMode && !validModes.includes(themeMode)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid theme mode. Must be light, dark, or system'
      });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (theme !== undefined) {
      updates.push('theme = ?');
      values.push(theme);
    }

    if (themeMode !== undefined) {
      updates.push('theme_mode = ?');
      values.push(themeMode);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No theme preferences provided'
      });
    }

    // Add userId to values for WHERE clause
    values.push(userId);

    // Update user's theme preferences
    await runAsync(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated preferences
    const user = await getAsync(
      'SELECT theme, theme_mode FROM users WHERE id = ?',
      [userId]
    );

    logger.info(`Updated theme preferences for user ${userId}: theme=${user.theme}, mode=${user.theme_mode}`);

    res.json({
      success: true,
      theme: user.theme,
      themeMode: user.theme_mode
    });
  } catch (error) {
    logger.error('Error updating user theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update theme preferences'
    });
  }
});

/**
 * GET /api/user/profile
 * Get user profile information
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await getAsync(
      'SELECT id, email, name, role, theme, theme_mode, created_at, last_login FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        theme: user.theme || 'tech-savvy-trustworthy',
        themeMode: user.theme_mode || 'system',
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

module.exports = router;
