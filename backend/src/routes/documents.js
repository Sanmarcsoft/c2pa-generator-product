const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { runAsync, getAsync, allAsync } = require('../models/database');
const requireAuth = require('../middleware/requireAuth');
const virusScanService = require('../services/virusScanService');
const contentValidationService = require('../services/contentValidationService');
const documentExtractionService = require('../services/documentExtractionService');
const ragContextService = require('../services/ragContextService');
const webSearchValidationService = require('../services/webSearchValidationService');
const { validateDocumentAgainstRequirements } = require('../knowledge/c2paRequirements');
const logger = require('../utils/logger');

// Helper function to sanitize filenames
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

// Helper function to get MIME type from extension
function getMimeType(ext) {
  const mimeTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'json': 'application/json',
    'xml': 'application/xml',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'csv': 'text/csv',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'rtf': 'application/rtf',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'tiff': 'image/tiff',
    'tif': 'image/tiff',
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'wmv': 'video/x-ms-wmv'
  };
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create upload directory structure: /app/data/uploads/{userId}/{YYYY-MM-DD}/
    const userId = req.user ? req.user.id : 'anonymous';
    const today = new Date().toISOString().split('T')[0];
    const uploadDir = path.join('/app', 'data', 'uploads', userId, today);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: {uuid}_{sanitized-original-name}
    const sanitized = sanitizeFilename(file.originalname);
    const uniqueName = `${uuidv4()}_${sanitized}`;
    cb(null, uniqueName);
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  // Allowed file types (comprehensive list)
  const allowedTypes = [
    'pdf', 'doc', 'docx', 'txt', 'md', 'rtf',
    'json', 'xml', 'xls', 'xlsx', 'csv',
    'ppt', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif',
    'mp4', 'mov', 'avi', 'wmv'
  ];

  const ext = path.extname(file.originalname).toLowerCase().slice(1);

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: .${ext}. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer with size limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds the maximum limit of 100MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};

/**
 * POST /api/documents/upload - Upload a document
 * Requires authentication
 */
router.post('/upload', requireAuth, upload.single('file'), handleMulterError, async (req, res, next) => {
  let uploadedFilePath = null;

  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    uploadedFilePath = req.file.path;

    // Validate required fields
    const { phase, requirement_type } = req.body;

    if (!phase) {
      // Clean up uploaded file
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        success: false,
        error: 'Phase is required'
      });
    }

    if (!requirement_type) {
      // Clean up uploaded file
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        success: false,
        error: 'Requirement type is required'
      });
    }

    // Validate phase value
    const validPhases = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6'];
    if (!validPhases.includes(phase)) {
      // Clean up uploaded file
      if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
      }
      return res.status(400).json({
        success: false,
        error: `Invalid phase value. Must be one of: ${validPhases.join(', ')}`
      });
    }

    // Perform virus scan
    let virusScanResult;
    let warnings = [];

    try {
      virusScanResult = await virusScanService.scanFile(uploadedFilePath);

      if (!virusScanResult.clean) {
        // File is infected - delete it and reject upload
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }

        const errorMsg = virusScanResult.quarantined
          ? 'File has been quarantined due to security threats'
          : 'File contains virus or malware';

        return res.status(400).json({
          success: false,
          error: errorMsg,
          threats: virusScanResult.threats
        });
      }
    } catch (scanError) {
      logger.warn('Virus scan failed:', scanError.message);
      warnings.push('virus scan unavailable');
    }

    // Extract document content for RAG
    let extractedText = null;
    let extractedKeyInfo = null;
    let businessValidation = null;

    try {
      // Get MIME type for extraction
      const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
      const mimeType = getMimeType(fileType);

      // Extract text content from document
      extractedText = await documentExtractionService.extractContent(
        uploadedFilePath,
        mimeType
      );

      logger.info(`Extracted ${extractedText ? extractedText.length : 0} characters from ${req.file.originalname}`);

      // Convert phase string to number (e.g., "phase-1" -> 1)
      const phaseNumber = parseInt(phase.split('-')[1]);

      // Extract key information based on phase
      if (extractedText && phaseNumber) {
        extractedKeyInfo = documentExtractionService.extractKeyInformation(
          extractedText,
          phaseNumber
        );

        logger.info(`Extracted key information for phase ${phaseNumber}`);

        // For Phase 1 documents, validate business information
        if (phaseNumber === 1 && extractedKeyInfo.extractedData) {
          const businessInfo = extractedKeyInfo.extractedData;

          // Only validate if we have company name, website, or email
          if (businessInfo.companyName || businessInfo.website || businessInfo.email) {
            businessValidation = await webSearchValidationService.validateBusinessInfo(businessInfo);
            logger.info(`Business validation complete: ${businessValidation.confidence} confidence`);
          }
        }
      }

    } catch (extractionError) {
      logger.warn('Document extraction failed:', extractionError.message);
      warnings.push('content extraction unavailable');
    }

    // Perform content validation
    let validationResult;
    let validationStatus = 'pending';
    let validationIssues = [];
    let validationConfidence = null;

    try {
      validationResult = await contentValidationService.validateDocument(
        uploadedFilePath,
        { phase, requirement_type }
      );

      // Determine validation status based on result
      if (validationResult.valid && validationResult.confidence >= 0.8) {
        validationStatus = 'approved';
      } else if (!validationResult.valid) {
        validationStatus = 'flagged';
        validationIssues = validationResult.issues || [];
      } else if (validationResult.confidence < 0.8) {
        validationStatus = 'needs-review';
      }

      validationConfidence = validationResult.confidence;

    } catch (validationError) {
      logger.warn('Content validation failed:', validationError.message);
      warnings.push('content validation unavailable');
      validationStatus = 'pending';
    }

    // C2PA CONFORMANCE VALIDATION
    // Validate document against C2PA Generator Product requirements
    let c2paConformanceValidation = null;
    try {
      c2paConformanceValidation = validateDocumentAgainstRequirements(
        phase,
        requirement_type,
        extractedText,
        { extractedKeyInfo, businessValidation }
      );

      logger.info(`C2PA Conformance Validation for ${req.file.originalname}:`, {
        phase: c2paConformanceValidation.phase,
        requirement: c2paConformanceValidation.requirement,
        score: c2paConformanceValidation.score,
        isSufficient: c2paConformanceValidation.isSufficient,
        issues: c2paConformanceValidation.issues
      });

      // Add conformance issues to warnings
      if (!c2paConformanceValidation.isSufficient) {
        warnings.push(`C2PA conformance check: Document may not fully meet ${phase} ${requirement_type} requirements`);
        c2paConformanceValidation.issues.forEach(issue => {
          warnings.push(`  - ${issue}`);
        });
      }
    } catch (conformanceError) {
      logger.warn('C2PA conformance validation failed:', conformanceError.message);
      warnings.push('C2PA conformance validation unavailable');
    }

    // Generate document ID
    const documentId = uuidv4();

    // Get file metadata
    const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
    const mimeType = getMimeType(fileType);

    // Build metadata object with RAG data and C2PA conformance
    const metadata = {
      phase,
      requirement_type,
      validation_status: validationStatus,
      validation_issues: validationIssues,
      validation_confidence: validationConfidence,
      mime_type: mimeType,
      // RAG data
      extracted_text: extractedText,
      extracted_key_info: extractedKeyInfo,
      business_validation: businessValidation,
      // C2PA conformance validation
      c2pa_conformance: c2paConformanceValidation
    };

    // Insert document into database
    await runAsync(
      `INSERT INTO documents (
        id, filename, original_name, file_path, file_type, file_size,
        category, upload_date, status, metadata, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        documentId,
        req.file.filename,
        req.file.originalname,
        req.file.path,
        fileType,
        req.file.size,
        phase, // Store phase in category field for backwards compatibility
        new Date().toISOString(),
        'pending',
        JSON.stringify(metadata),
        req.user.id
      ]
    );

    // Retrieve the saved document
    const document = await getAsync(
      'SELECT * FROM documents WHERE id = ?',
      [documentId]
    );

    // Parse metadata for response
    const documentMetadata = document.metadata ? JSON.parse(document.metadata) : {};

    // Build response document object
    const responseDocument = {
      id: document.id,
      filename: document.filename,
      original_name: document.original_name,
      file_path: document.file_path,
      file_type: document.file_type,
      file_size: document.file_size,
      mime_type: documentMetadata.mime_type,
      phase: documentMetadata.phase,
      requirement_type: documentMetadata.requirement_type,
      status: document.status,
      upload_date: document.upload_date,
      created_at: document.created_at,
      user_id: document.user_id,
      validation_status: documentMetadata.validation_status,
      validation_issues: documentMetadata.validation_issues,
      validation_confidence: documentMetadata.validation_confidence,
      // RAG data
      extracted_text_length: documentMetadata.extracted_text ? documentMetadata.extracted_text.length : 0,
      has_extracted_content: !!documentMetadata.extracted_text,
      extracted_key_info: documentMetadata.extracted_key_info,
      business_validation: documentMetadata.business_validation,
      // C2PA conformance validation
      c2pa_conformance: documentMetadata.c2pa_conformance
    };

    logger.info(`Document uploaded successfully: ${req.file.originalname} by user ${req.user.id}`);

    // Build response
    const response = {
      success: true,
      message: 'File uploaded successfully',
      document: responseDocument
    };

    // Add warnings if any
    if (warnings.length > 0) {
      response.warnings = warnings;
    }

    res.status(201).json(response);

  } catch (error) {
    logger.error('Document upload error:', error);

    // Clean up uploaded file on error
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch (unlinkError) {
        logger.error('Failed to clean up file:', unlinkError);
      }
    }

    next(error);
  }
});

/**
 * GET /api/documents - List documents
 * Supports filtering by phase, status, requirement_type, and user
 * Supports pagination with limit and offset
 */
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const {
      phase,
      status,
      requirement_type,
      limit = 50,
      offset = 0
    } = req.query;

    // Build query with filters
    let sql = 'SELECT * FROM documents WHERE user_id = ?';
    const params = [req.user.id];

    // Add phase filter
    if (phase) {
      sql += ' AND category = ?';
      params.push(phase);
    }

    // Add status filter
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Add requirement_type filter (stored in metadata)
    if (requirement_type) {
      sql += ' AND metadata LIKE ?';
      params.push(`%"requirement_type":"${requirement_type}"%`);
    }

    // Add sorting and pagination
    sql += ' ORDER BY upload_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    // Execute query
    const documents = await allAsync(sql, params);

    // Parse metadata for each document
    const parsedDocuments = documents.map(doc => {
      const metadata = doc.metadata ? JSON.parse(doc.metadata) : {};
      return {
        id: doc.id,
        filename: doc.filename,
        original_name: doc.original_name,
        file_path: doc.file_path,
        file_type: doc.file_type,
        file_size: doc.file_size,
        mime_type: metadata.mime_type,
        phase: metadata.phase || doc.category,
        requirement_type: metadata.requirement_type,
        status: doc.status,
        upload_date: doc.upload_date,
        created_at: doc.created_at,
        user_id: doc.user_id,
        validation_status: metadata.validation_status,
        validation_issues: metadata.validation_issues,
        validation_confidence: metadata.validation_confidence
      };
    });

    res.json({
      success: true,
      count: parsedDocuments.length,
      documents: parsedDocuments,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    logger.error('Error listing documents:', error);
    next(error);
  }
});

/**
 * GET /api/documents/:id - Get document details
 * Requires authentication and ownership check
 */
router.get('/:id', requireAuth, async (req, res, next) => {
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

    // Check ownership
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to access this document'
      });
    }

    // Parse metadata
    const metadata = document.metadata ? JSON.parse(document.metadata) : {};

    // Get annotations for this document
    const annotations = await allAsync(
      'SELECT * FROM annotations WHERE document_id = ? ORDER BY created_at',
      [req.params.id]
    );

    // Build response document object
    const responseDocument = {
      id: document.id,
      filename: document.filename,
      original_name: document.original_name,
      file_path: document.file_path,
      file_type: document.file_type,
      file_size: document.file_size,
      mime_type: metadata.mime_type,
      phase: metadata.phase || document.category,
      requirement_type: metadata.requirement_type,
      status: document.status,
      upload_date: document.upload_date,
      created_at: document.created_at,
      user_id: document.user_id,
      validation_status: metadata.validation_status,
      validation_issues: metadata.validation_issues,
      validation_confidence: metadata.validation_confidence,
      annotations
    };

    res.json({
      success: true,
      document: responseDocument
    });

  } catch (error) {
    logger.error('Error getting document:', error);
    next(error);
  }
});

/**
 * DELETE /api/documents/:id - Delete document
 * Requires authentication and ownership check
 */
router.delete('/:id', requireAuth, async (req, res, next) => {
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

    // Check ownership
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to delete this document'
      });
    }

    // Delete file from disk
    if (fs.existsSync(document.file_path)) {
      try {
        fs.unlinkSync(document.file_path);
        logger.info(`Deleted file from disk: ${document.file_path}`);
      } catch (fileError) {
        logger.warn(`Failed to delete file from disk: ${fileError.message}`);
      }
    }

    // Delete from database (annotations will be deleted via CASCADE)
    await runAsync('DELETE FROM documents WHERE id = ?', [req.params.id]);

    logger.info(`Document deleted: ${document.original_name} (${req.params.id}) by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    logger.error('Error deleting document:', error);
    next(error);
  }
});

/**
 * GET /api/documents/:id/download - Download a document
 * Requires authentication and ownership check
 */
router.get('/:id/download', requireAuth, async (req, res, next) => {
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

    // Check ownership
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to download this document'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    // Get MIME type
    const metadata = document.metadata ? JSON.parse(document.metadata) : {};
    const mimeType = metadata.mime_type || getMimeType(document.file_type);

    // Set headers and send file
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);

    // Stream the file
    const fileStream = fs.createReadStream(document.file_path);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      logger.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Error downloading file'
        });
      }
    });

  } catch (error) {
    logger.error('Error downloading document:', error);
    next(error);
  }
});

/**
 * POST /api/documents/:id/analyze - Analyze document with RAG validation
 * Requires authentication and ownership check
 */
router.post('/:id/analyze', requireAuth, express.json(), async (req, res, next) => {
  try {
    // Get document
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

    // Check ownership
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to analyze this document'
      });
    }

    // Parse metadata
    const metadata = document.metadata ? JSON.parse(document.metadata) : {};

    // Extract content if not already extracted
    let extractedText = metadata.extracted_text;
    let extractedKeyInfo = metadata.extracted_key_info;

    if (!extractedText) {
      try {
        const mimeType = metadata.mime_type || getMimeType(document.file_type);
        extractedText = await documentExtractionService.extractContent(
          document.file_path,
          mimeType
        );

        const phaseNumber = parseInt(metadata.phase.split('-')[1]);
        if (extractedText && phaseNumber) {
          extractedKeyInfo = documentExtractionService.extractKeyInformation(
            extractedText,
            phaseNumber
          );
        }

        // Update metadata with extracted content
        metadata.extracted_text = extractedText;
        metadata.extracted_key_info = extractedKeyInfo;
        await runAsync(
          'UPDATE documents SET metadata = ? WHERE id = ?',
          [JSON.stringify(metadata), req.params.id]
        );

        logger.info(`Extracted content for document ${req.params.id} during analysis`);
      } catch (extractionError) {
        return res.status(500).json({
          success: false,
          error: 'Failed to extract document content',
          details: extractionError.message
        });
      }
    }

    // Build user document context
    const phaseNumber = parseInt(metadata.phase.split('-')[1]);
    const documentContext = await ragContextService.buildUserDocumentContext(
      req.user.id,
      phaseNumber
    );

    // Get user profile
    const userProfile = await ragContextService.getUserProfileContext(req.user.id);

    // Validate against profile if we have key info
    let profileValidation = null;
    if (extractedKeyInfo) {
      profileValidation = ragContextService.validateAgainstProfile(
        extractedKeyInfo,
        userProfile,
        documentContext
      );
    }

    // Perform business validation for Phase 1 documents
    let businessValidation = metadata.business_validation;
    if (phaseNumber === 1 && extractedKeyInfo && extractedKeyInfo.extractedData) {
      const businessInfo = extractedKeyInfo.extractedData;

      if (businessInfo.companyName || businessInfo.website || businessInfo.email) {
        businessValidation = await webSearchValidationService.validateBusinessInfo(businessInfo);

        // Update metadata with validation results
        metadata.business_validation = businessValidation;
        await runAsync(
          'UPDATE documents SET metadata = ? WHERE id = ?',
          [JSON.stringify(metadata), req.params.id]
        );

        logger.info(`Business validation complete for document ${req.params.id}`);
      }
    }

    // Format validation summary for AI
    let validationSummary = '';
    if (businessValidation) {
      validationSummary = webSearchValidationService.formatValidationForAI(businessValidation);
    }

    // Build analysis response
    const analysis = {
      document_id: document.id,
      filename: document.original_name,
      phase: metadata.phase,
      requirement_type: metadata.requirement_type,
      extracted_content: {
        text_length: extractedText ? extractedText.length : 0,
        has_content: !!extractedText,
        key_information: extractedKeyInfo
      },
      profile_validation: profileValidation,
      business_validation: businessValidation,
      validation_summary: validationSummary,
      document_context_summary: {
        total_documents: documentContext.totalDocuments,
        documents_by_phase: documentContext.summary.byPhase,
        key_information: documentContext.summary.keyInformation
      },
      analysis_date: new Date().toISOString()
    };

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    logger.error('Error analyzing document:', error);
    next(error);
  }
});

/**
 * PUT /api/documents/:id/annotations - Save/update annotations
 * Requires authentication and ownership check
 */
router.put('/:id/annotations', requireAuth, express.json(), async (req, res, next) => {
  try {
    // Check if document exists and user owns it
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

    // Check ownership
    if (document.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: you do not have permission to modify this document'
      });
    }

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
    logger.error('Error saving annotations:', error);
    next(error);
  }
});

module.exports = router;
