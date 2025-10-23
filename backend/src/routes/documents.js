const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const logger = require('../utils/logger');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../data/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,docx,txt,md,json').split(',');
  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '50000000') // 50MB default
  }
});

// GET /api/documents - List all documents
router.get('/', async (req, res, next) => {
  try {
    const documents = await allAsync(
      'SELECT * FROM documents ORDER BY upload_date DESC'
    );

    res.json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id - Get document details
router.get('/:id', async (req, res, next) => {
  try {
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ?',
      [req.params.id]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Get annotations for this document
    const annotations = await allAsync(
      'SELECT * FROM annotations WHERE document_id = ? ORDER BY created_at',
      [req.params.id]
    );

    res.json({
      success: true,
      document: {
        ...document,
        annotations
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/documents/upload - Upload a document
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const documentId = uuidv4();
    const { category } = req.body;

    await runAsync(
      `INSERT INTO documents (id, filename, original_name, file_path, file_type, file_size, category, upload_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentId,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        path.extname(req.file.originalname).toLowerCase().slice(1),
        req.file.size,
        category || 'user-upload',
        new Date().toISOString(),
        'pending'
      ]
    );

    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ?',
      [documentId]
    );

    logger.info(`Document uploaded: ${req.file.originalname} (${documentId})`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      document
    });
  } catch (error) {
    // Clean up uploaded file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// GET /api/documents/:id/download - Download a document
router.get('/:id/download', async (req, res, next) => {
  try {
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ?',
      [req.params.id]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
    }

    res.download(document.file_path, document.original_name);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/documents/:id - Delete a document
router.delete('/:id', async (req, res, next) => {
  try {
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ?',
      [req.params.id]
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database (annotations will be deleted via CASCADE)
    await runAsync('DELETE FROM documents WHERE id = ?', [req.params.id]);

    logger.info(`Document deleted: ${document.original_name} (${req.params.id})`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/documents/:id/annotations - Save/update annotations
router.put('/:id/annotations', express.json(), async (req, res, next) => {
  try {
    const { annotations } = req.body;

    if (!Array.isArray(annotations)) {
      return res.status(400).json({
        success: false,
        error: 'Annotations must be an array'
      });
    }

    // Delete existing annotations
    await runAsync('DELETE FROM annotations WHERE document_id = ?', [req.params.id]);

    // Insert new annotations
    for (const annotation of annotations) {
      await runAsync(
        `INSERT INTO annotations (id, document_id, page_number, content, position)
         VALUES (?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          req.params.id,
          annotation.pageNumber || null,
          annotation.content,
          JSON.stringify(annotation.position || {})
        ]
      );
    }

    res.json({
      success: true,
      message: 'Annotations saved successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
