# Document Upload Feature - Implementation Guide

## Quick Start

This guide provides code snippets and examples to implement the document upload feature according to the TDD test specifications.

---

## 1. Database Migration

Add to `/Volumes/Data/Users/matt/projects/c2pa-generator-product/backend/src/models/database.js`:

```javascript
// Inside initDatabase() function, after documents table creation:

// Migration: Add new columns for document upload feature
logger.info('Checking documents table schema for upload feature columns...');
const documentsTableInfo = await allAsync('PRAGMA table_info(documents)');

const hasUserId = documentsTableInfo.some(col => col.name === 'user_id');
const hasPhase = documentsTableInfo.some(col => col.name === 'phase');
const hasRequirementType = documentsTableInfo.some(col => col.name === 'requirement_type');
const hasValidationStatus = documentsTableInfo.some(col => col.name === 'validation_status');
const hasVirusScanStatus = documentsTableInfo.some(col => col.name === 'virus_scan_status');

if (!hasUserId) {
  await runAsync('ALTER TABLE documents ADD COLUMN user_id TEXT REFERENCES users(id)');
  logger.info('Added user_id column to documents');
}

if (!hasPhase) {
  await runAsync('ALTER TABLE documents ADD COLUMN phase TEXT');
  logger.info('Added phase column to documents');
}

if (!hasRequirementType) {
  await runAsync('ALTER TABLE documents ADD COLUMN requirement_type TEXT');
  logger.info('Added requirement_type column to documents');
}

if (!hasValidationStatus) {
  await runAsync('ALTER TABLE documents ADD COLUMN validation_status TEXT DEFAULT "pending"');
  await runAsync('ALTER TABLE documents ADD COLUMN validation_confidence REAL');
  await runAsync('ALTER TABLE documents ADD COLUMN validation_issues TEXT');
  logger.info('Added validation columns to documents');
}

if (!hasVirusScanStatus) {
  await runAsync('ALTER TABLE documents ADD COLUMN virus_scan_status TEXT DEFAULT "pending"');
  await runAsync('ALTER TABLE documents ADD COLUMN virus_scan_date TEXT');
  await runAsync('ALTER TABLE documents ADD COLUMN mime_type TEXT');
  logger.info('Added virus scan columns to documents');
}

// Create indexes
await runAsync('CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id)');
await runAsync('CREATE INDEX IF NOT EXISTS idx_documents_phase ON documents(phase)');
await runAsync('CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status)');
```

---

## 2. Update Document Routes

Update `/Volumes/Data/Users/matt/projects/c2pa-generator-product/backend/src/routes/documents.js`:

### Add Required Imports

```javascript
const requireAuth = require('../middleware/requireAuth');
const virusScanService = require('../services/virusScanService');
const contentValidationService = require('../services/contentValidationService');
const { body, validationResult } = require('express-validator');

// Valid phase values
const VALID_PHASES = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'];

// Updated file filter
const fileFilter = (req, file, cb) => {
  const allowedDocTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const allowedImageTypes = ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'webp'];
  const allowedTypes = [...allowedDocTypes, ...allowedImageTypes];

  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${ext} not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Update multer limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 52428800 // 50MB
  }
});
```

### Update POST /api/documents/upload

```javascript
router.post('/upload',
  requireAuth, // Add authentication
  upload.single('file'),
  [
    body('phase')
      .notEmpty().withMessage('Phase is required')
      .isIn(VALID_PHASES).withMessage('Invalid phase value'),
    body('requirement_type')
      .notEmpty().withMessage('Requirement type is required')
  ],
  async (req, res, next) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      const documentId = uuidv4();
      const { phase, requirement_type } = req.body;
      const userId = req.user.id;

      let virusScanResult = { clean: true, threats: [] };
      let validationResult = { valid: true, confidence: 1.0, issues: [] };
      let warnings = [];

      // Step 1: Virus Scanning
      try {
        virusScanResult = await virusScanService.scanFile(req.file.path);

        if (!virusScanResult.clean) {
          // Delete infected file
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }

          return res.status(400).json({
            success: false,
            error: 'File failed virus scan and has been rejected',
            threats: virusScanResult.threats
          });
        }
      } catch (scanError) {
        logger.warn(`Virus scan failed: ${scanError.message}`);
        warnings.push('virus scan unavailable');
      }

      // Step 2: Content Validation
      try {
        validationResult = await contentValidationService.validateDocument(
          req.file.path,
          { phase, requirement_type }
        );
      } catch (validationError) {
        logger.warn(`Content validation failed: ${validationError.message}`);
        warnings.push('content validation unavailable');
      }

      // Determine validation status
      let validationStatus = 'pending';
      if (validationResult.valid && validationResult.confidence >= 0.8) {
        validationStatus = 'approved';
      } else if (!validationResult.valid) {
        validationStatus = 'flagged';
      } else if (validationResult.confidence < 0.8 && validationResult.confidence >= 0.6) {
        validationStatus = 'needs-review';
      }

      // Insert into database
      await runAsync(
        `INSERT INTO documents (
          id, filename, original_name, file_path, file_type, file_size,
          category, upload_date, status, user_id, phase, requirement_type,
          validation_status, validation_confidence, validation_issues,
          virus_scan_status, virus_scan_date, mime_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          documentId,
          req.file.filename,
          req.file.originalname,
          req.file.path,
          path.extname(req.file.originalname).toLowerCase().slice(1),
          req.file.size,
          `${phase}-${requirement_type}`,
          new Date().toISOString(),
          'pending',
          userId,
          phase,
          requirement_type,
          validationStatus,
          validationResult.confidence,
          JSON.stringify(validationResult.issues),
          virusScanResult.clean ? 'clean' : 'infected',
          new Date().toISOString(),
          req.file.mimetype
        ]
      );

      const document = await getAsync(
        'SELECT * FROM documents WHERE id = ?',
        [documentId]
      );

      logger.info(`Document uploaded: ${req.file.originalname} (${documentId}) by user ${userId}`);

      const response = {
        success: true,
        message: 'File uploaded successfully',
        document: {
          ...document,
          validation_issues: JSON.parse(document.validation_issues || '[]')
        }
      };

      if (warnings.length > 0) {
        response.warnings = warnings;
      }

      res.status(201).json(response);
    } catch (error) {
      // Clean up uploaded file if database insert fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);
```

### Update GET /api/documents

```javascript
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { phase, status, requirement_type, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM documents WHERE user_id = ?';
    const params = [userId];

    // Add filters
    if (phase) {
      query += ' AND phase = ?';
      params.push(phase);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (requirement_type) {
      query += ' AND requirement_type = ?';
      params.push(requirement_type);
    }

    // Add ordering and pagination
    query += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const documents = await allAsync(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM documents WHERE user_id = ?';
    const countParams = [userId];

    if (phase) {
      countQuery += ' AND phase = ?';
      countParams.push(phase);
    }

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (requirement_type) {
      countQuery += ' AND requirement_type = ?';
      countParams.push(requirement_type);
    }

    const countResult = await getAsync(countQuery, countParams);

    res.json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        ...doc,
        validation_issues: JSON.parse(doc.validation_issues || '[]')
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: countResult.total,
        hasMore: (parseInt(offset) + documents.length) < countResult.total
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### Update GET /api/documents/:id

```javascript
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (!document) {
      // Check if document exists but belongs to another user
      const anyDocument = await getAsync(
        'SELECT id FROM documents WHERE id = ?',
        [req.params.id]
      );

      if (anyDocument) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You do not have permission to access this document'
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      document: {
        ...document,
        validation_issues: JSON.parse(document.validation_issues || '[]')
      }
    });
  } catch (error) {
    next(error);
  }
});
```

### Update DELETE /api/documents/:id

```javascript
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (!document) {
      // Check if document exists but belongs to another user
      const anyDocument = await getAsync(
        'SELECT id FROM documents WHERE id = ?',
        [req.params.id]
      );

      if (anyDocument) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You cannot delete this document'
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete from database
    await runAsync('DELETE FROM documents WHERE id = ?', [req.params.id]);

    logger.info(`Document deleted: ${document.original_name} (${req.params.id}) by user ${userId}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});
```

### Update GET /api/documents/:id/download

```javascript
router.get('/:id/download', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    );

    if (!document) {
      // Check if document exists but belongs to another user
      const anyDocument = await getAsync(
        'SELECT id FROM documents WHERE id = ?',
        [req.params.id]
      );

      if (anyDocument) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You cannot download this document'
        });
      }

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
```

---

## 3. Implement Virus Scanning (Optional but Recommended)

### Install ClamAV

```bash
# macOS
brew install clamav

# Ubuntu/Debian
sudo apt-get install clamav clamav-daemon

# Start daemon
sudo systemctl start clamav-daemon
```

### Update virusScanService.js

```javascript
const NodeClam = require('clamscan');
const logger = require('../utils/logger');

let clamScan = null;

async function initializeScanner() {
  try {
    clamScan = await new NodeClam().init({
      clamdscan: {
        host: process.env.CLAMAV_HOST || 'localhost',
        port: process.env.CLAMAV_PORT || 3310,
        timeout: 60000
      },
      preference: 'clamdscan'
    });
    logger.info('ClamAV scanner initialized');
  } catch (error) {
    logger.error('Failed to initialize ClamAV:', error);
  }
}

async function scanFile(filePath) {
  if (!clamScan) {
    await initializeScanner();
  }

  if (!clamScan) {
    throw new Error('Scanner unavailable');
  }

  const { isInfected, viruses } = await clamScan.isInfected(filePath);

  return {
    clean: !isInfected,
    threats: viruses || [],
    quarantined: false
  };
}

async function isAvailable() {
  try {
    if (!clamScan) {
      await initializeScanner();
    }
    return clamScan !== null;
  } catch {
    return false;
  }
}

module.exports = {
  scanFile,
  isAvailable
};
```

---

## 4. Running Tests

### Install Dependencies

```bash
cd /Volumes/Data/Users/matt/projects/c2pa-generator-product
npm install
```

### Run Tests

```bash
# Run all document upload tests
npm test tests/document-upload-api.test.js

# Run with verbose output
npm test -- --verbose tests/document-upload-api.test.js

# Run specific test suite
npm test -- --testNamePattern="POST /api/documents/upload" tests/document-upload-api.test.js
```

---

## 5. Troubleshooting

### Tests Failing with "Cannot find module"
```bash
# Ensure all dependencies are installed
cd backend && npm install
cd ../tests && npm install
```

### Database Issues
```bash
# Reset database
rm data/app.db
# Restart server to reinitialize
npm run dev
```

### File Upload Errors
Check directory permissions:
```bash
mkdir -p data/uploads
chmod 755 data/uploads
```

---

## Summary

This implementation guide provides all the code needed to pass the TDD test suite. Follow these steps:

1. Update database schema with migration
2. Update document routes with authentication and validation
3. Optionally implement real virus scanning
4. Run tests and fix any issues
5. Verify all 78 tests pass

The test suite is comprehensive and will guide the implementation. Any failing test indicates what needs to be fixed or implemented.
