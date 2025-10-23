const express = require('express');
const router = express.Router();
const { runAsync, getAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');

// GET /api/progress - Get certification progress
router.get('/', async (req, res, next) => {
  try {
    const progress = await getAsync(
      'SELECT * FROM progress WHERE user_id = ?',
      ['sanmarcsoft-llc']
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found'
      });
    }

    // Parse JSON fields
    const progressData = {
      ...progress,
      phases: JSON.parse(progress.phases),
      notes: progress.notes ? JSON.parse(progress.notes) : []
    };

    res.json({
      success: true,
      progress: progressData
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/progress/phase/:phaseId - Update phase status
router.put('/phase/:phaseId', express.json(), async (req, res, next) => {
  try {
    const { phaseId } = req.params;
    const { status, completedDate } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: pending, in_progress, or completed'
      });
    }

    // Get current progress
    const progress = await getAsync(
      'SELECT * FROM progress WHERE user_id = ?',
      ['sanmarcsoft-llc']
    );

    if (!progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found'
      });
    }

    // Update phase
    const phases = JSON.parse(progress.phases);
    const phaseIndex = phases.findIndex(p => p.id === phaseId);

    if (phaseIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Phase not found'
      });
    }

    phases[phaseIndex].status = status;
    if (status === 'completed' && completedDate) {
      phases[phaseIndex].completedDate = completedDate;
    }

    // If marking as in_progress, update current_phase
    let currentPhase = progress.current_phase;
    if (status === 'in_progress') {
      currentPhase = phaseId;
    }

    // Update database
    await runAsync(
      `UPDATE progress
       SET phases = ?, current_phase = ?, updated_at = ?
       WHERE user_id = ?`,
      [
        JSON.stringify(phases),
        currentPhase,
        new Date().toISOString(),
        'sanmarcsoft-llc'
      ]
    );

    logger.info(`Phase ${phaseId} updated to ${status}`);

    res.json({
      success: true,
      message: 'Phase updated successfully',
      phase: phases[phaseIndex]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/checklist - Get checklist items
router.get('/checklist', async (req, res, next) => {
  try {
    const { phaseId } = req.query;

    let query = 'SELECT * FROM checklist_items';
    let params = [];

    if (phaseId) {
      query += ' WHERE phase_id = ?';
      params.push(phaseId);
    }

    query += ' ORDER BY order_index ASC';

    const items = await allAsync(query, params);

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/progress/checklist/:itemId - Update checklist item
router.put('/checklist/:itemId', express.json(), async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    if (!['pending', 'in_progress', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const completedAt = status === 'completed' ? new Date().toISOString() : null;

    await runAsync(
      `UPDATE checklist_items
       SET status = ?, completed_at = ?
       WHERE id = ?`,
      [status, completedAt, itemId]
    );

    const item = await getAsync(
      'SELECT * FROM checklist_items WHERE id = ?',
      [itemId]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Checklist item not found'
      });
    }

    logger.info(`Checklist item ${itemId} updated to ${status}`);

    res.json({
      success: true,
      message: 'Checklist item updated successfully',
      item
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/checklist - Create checklist item
router.post('/checklist', express.json(), async (req, res, next) => {
  try {
    const { phaseId, title, description, orderIndex } = req.body;

    if (!phaseId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Phase ID and title are required'
      });
    }

    const { v4: uuidv4 } = require('uuid');
    const itemId = uuidv4();

    await runAsync(
      `INSERT INTO checklist_items (id, phase_id, title, description, order_index)
       VALUES (?, ?, ?, ?, ?)`,
      [itemId, phaseId, title, description || null, orderIndex || 0]
    );

    const item = await getAsync(
      'SELECT * FROM checklist_items WHERE id = ?',
      [itemId]
    );

    logger.info(`Checklist item created: ${title}`);

    res.status(201).json({
      success: true,
      message: 'Checklist item created successfully',
      item
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/progress/checklist/:itemId - Delete checklist item
router.delete('/checklist/:itemId', async (req, res, next) => {
  try {
    const { itemId } = req.params;

    await runAsync('DELETE FROM checklist_items WHERE id = ?', [itemId]);

    logger.info(`Checklist item deleted: ${itemId}`);

    res.json({
      success: true,
      message: 'Checklist item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
