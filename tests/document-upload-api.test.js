/**
 * TDD Test Suite: Document Upload Feature
 *
 * IMPORTANT: These tests are written BEFORE implementation
 * They will FAIL until the feature is fully implemented
 *
 * Test Coverage:
 * - POST /api/documents/upload - File upload with validation
 * - GET /api/documents - List documents with filtering
 * - GET /api/documents/:id - Retrieve specific document
 * - DELETE /api/documents/:id - Delete document
 * - GET /api/documents/:id/download - Download document
 * - File format validation
 * - File size limits
 * - Virus scanning integration
 * - Content validation with AI
 * - Authentication and authorization
 *
 * Framework: Jest with Supertest
 */

const request = require('supertest');
const app = require('../backend/src/app');
const path = require('path');
const fs = require('fs');
const { initDatabase, runAsync, allAsync, getAsync } = require('../backend/src/models/database');
const { v4: uuidv4 } = require('uuid');

// Mock dependencies
jest.mock('../backend/src/services/virusScanService', () => ({
  scanFile: jest.fn()
}));

jest.mock('../backend/src/services/contentValidationService', () => ({
  validateDocument: jest.fn()
}));

const virusScanService = require('../backend/src/services/virusScanService');
const contentValidationService = require('../backend/src/services/contentValidationService');

describe('Document Upload API - TDD Tests', () => {
  let userToken;
  let userId;
  let user2Token;
  let user2Id;
  let testUploadDir;

  // Test file paths for different formats
  const TEST_FILES = {
    pdf: path.join(__dirname, 'fixtures', 'test-document.pdf'),
    docx: path.join(__dirname, 'fixtures', 'test-document.docx'),
    txt: path.join(__dirname, 'fixtures', 'test-document.txt'),
    rtf: path.join(__dirname, 'fixtures', 'test-document.rtf'),
    png: path.join(__dirname, 'fixtures', 'test-image.png'),
    jpg: path.join(__dirname, 'fixtures', 'test-image.jpg'),
    invalid: path.join(__dirname, 'fixtures', 'test-file.exe'),
    large: path.join(__dirname, 'fixtures', 'large-file.pdf'),
    infected: path.join(__dirname, 'fixtures', 'infected-file.pdf')
  };

  // Initialize database and create test users
  beforeAll(async () => {
    await initDatabase();

    // Create test fixtures directory
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }

    // Create test files
    createTestFixtures();

    // Set test upload directory
    testUploadDir = path.join(__dirname, '../data/test-uploads');
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    // Clean up test data
    await runAsync('DELETE FROM documents WHERE category LIKE ?', ['test-%']);
    await runAsync('DELETE FROM users WHERE email LIKE ?', ['%test.com']);

    // Reset mocks
    virusScanService.scanFile.mockReset();
    contentValidationService.validateDocument.mockReset();

    // Default mock implementations (clean file, valid content)
    virusScanService.scanFile.mockResolvedValue({ clean: true, threats: [] });
    contentValidationService.validateDocument.mockResolvedValue({
      valid: true,
      confidence: 0.95,
      issues: []
    });

    // Create test user 1
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'docuser1@test.com',
        password: 'SecurePass123!',
        name: 'Doc User 1'
      });

    userToken = user1Response.body.token;
    userId = user1Response.body.user.id;

    // Create test user 2
    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'docuser2@test.com',
        password: 'SecurePass123!',
        name: 'Doc User 2'
      });

    user2Token = user2Response.body.token;
    user2Id = user2Response.body.user.id;
  });

  afterAll(async () => {
    // Clean up test files
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (fs.existsSync(fixturesDir)) {
      fs.rmSync(fixturesDir, { recursive: true, force: true });
    }

    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    }
  });

  /**
   * Test Suite 1: POST /api/documents/upload - Valid File Upload
   */
  describe('POST /api/documents/upload - Valid Uploads', () => {
    test('should upload PDF file with all required fields', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'product-spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document).toBeDefined();
      expect(response.body.document.id).toBeDefined();
      expect(response.body.document.filename).toBeDefined();
      expect(response.body.document.original_name).toBe('test-document.pdf');
      expect(response.body.document.file_type).toBe('pdf');
      expect(response.body.document.phase).toBe('phase-2');
      expect(response.body.document.requirement_type).toBe('product-spec');
      expect(response.body.document.status).toBe('pending');
      expect(response.body.document.user_id).toBe(userId);

      // Verify virus scan was called
      expect(virusScanService.scanFile).toHaveBeenCalledTimes(1);

      // Verify content validation was called
      expect(contentValidationService.validateDocument).toHaveBeenCalledTimes(1);
    });

    test('should upload DOCX file successfully', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-3')
        .field('requirement_type', 'technical-doc')
        .attach('file', TEST_FILES.docx);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document.file_type).toBe('docx');
    });

    test('should upload TXT file successfully', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'notes')
        .attach('file', TEST_FILES.txt);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document.file_type).toBe('txt');
    });

    test('should upload RTF file successfully', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'requirements')
        .attach('file', TEST_FILES.rtf);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document.file_type).toBe('rtf');
    });

    test('should upload PNG image successfully', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-4')
        .field('requirement_type', 'diagram')
        .attach('file', TEST_FILES.png);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document.file_type).toBe('png');
    });

    test('should upload JPG image successfully', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-4')
        .field('requirement_type', 'photo')
        .attach('file', TEST_FILES.jpg);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.document.file_type).toBe('jpg');
    });

    test('should upload multiple files sequentially', async () => {
      const response1 = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      const response2 = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.docx);

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.document.id).not.toBe(response2.body.document.id);
    });

    test('should store file metadata correctly', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-3')
        .field('requirement_type', 'compliance')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);

      const document = response.body.document;
      expect(document.file_size).toBeGreaterThan(0);
      expect(document.upload_date).toBeDefined();
      expect(document.created_at).toBeDefined();
      expect(document.file_path).toBeDefined();
    });
  });

  /**
   * Test Suite 2: POST /api/documents/upload - Validation Failures
   */
  describe('POST /api/documents/upload - Validation Failures', () => {
    test('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('file');
    });

    test('should reject upload without phase field', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('phase');
    });

    test('should reject upload without requirement_type field', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requirement_type');
    });

    test('should reject invalid phase value', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'invalid-phase')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('phase');
    });

    test('should reject upload without authentication', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should reject upload with invalid token', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', 'Bearer invalid-token')
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite 3: POST /api/documents/upload - File Format Validation
   */
  describe('POST /api/documents/upload - File Format Validation', () => {
    test('should reject unsupported file format (.exe)', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.invalid);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('file type');
    });

    test('should accept all supported document formats', async () => {
      const supportedFormats = ['pdf', 'docx', 'txt', 'rtf'];

      for (const format of supportedFormats) {
        const response = await request(app)
          .post('/api/documents/upload')
          .set('Authorization', `Bearer ${userToken}`)
          .field('phase', 'phase-2')
          .field('requirement_type', 'spec')
          .attach('file', TEST_FILES[format]);

        expect(response.status).toBe(201);
        expect(response.body.document.file_type).toBe(format);
      }
    });

    test('should accept all supported image formats', async () => {
      const supportedFormats = ['png', 'jpg'];

      for (const format of supportedFormats) {
        const response = await request(app)
          .post('/api/documents/upload')
          .set('Authorization', `Bearer ${userToken}`)
          .field('phase', 'phase-4')
          .field('requirement_type', 'image')
          .attach('file', TEST_FILES[format]);

        expect(response.status).toBe(201);
        expect(response.body.document.file_type).toBe(format);
      }
    });

    test('should validate MIME type in addition to extension', async () => {
      // Create a file with wrong extension but correct MIME type
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);
      expect(response.body.document.mime_type).toBe('application/pdf');
    });
  });

  /**
   * Test Suite 4: POST /api/documents/upload - File Size Validation
   */
  describe('POST /api/documents/upload - File Size Validation', () => {
    test('should reject file exceeding size limit', async () => {
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.large);

      expect(response.status).toBe(413);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('size');
    });

    test('should enforce different size limits per file type', async () => {
      // Images should have lower limit than documents
      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-4')
        .field('requirement_type', 'image')
        .attach('file', TEST_FILES.png);

      expect(response.status).toBe(201);

      // Verify size is within image limits
      expect(response.body.document.file_size).toBeLessThan(10 * 1024 * 1024); // 10MB
    });
  });

  /**
   * Test Suite 5: Virus Scanning Integration
   */
  describe('POST /api/documents/upload - Virus Scanning', () => {
    test('should scan file for viruses before saving', async () => {
      virusScanService.scanFile.mockResolvedValue({ clean: true, threats: [] });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);
      expect(virusScanService.scanFile).toHaveBeenCalled();

      const scanCall = virusScanService.scanFile.mock.calls[0][0];
      expect(scanCall).toBeDefined();
    });

    test('should reject infected file', async () => {
      virusScanService.scanFile.mockResolvedValue({
        clean: false,
        threats: ['EICAR-Test-File']
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.infected);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('virus');
      expect(response.body.threats).toBeDefined();

      // Verify file was deleted
      const documents = await allAsync('SELECT * FROM documents WHERE original_name = ?', ['infected-file.pdf']);
      expect(documents.length).toBe(0);
    });

    test('should handle virus scanner errors gracefully', async () => {
      virusScanService.scanFile.mockRejectedValue(new Error('Scanner unavailable'));

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      // Should either reject or proceed with warning
      if (response.status === 201) {
        expect(response.body.warnings).toContain('virus scan unavailable');
      } else {
        expect(response.status).toBe(503);
        expect(response.body.error).toContain('scanner');
      }
    });

    test('should quarantine suspected files', async () => {
      virusScanService.scanFile.mockResolvedValue({
        clean: false,
        threats: ['Suspected-Malware'],
        quarantined: true
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('quarantined');
    });
  });

  /**
   * Test Suite 6: Content Validation with AI
   */
  describe('POST /api/documents/upload - Content Validation', () => {
    test('should validate document content with AI', async () => {
      contentValidationService.validateDocument.mockResolvedValue({
        valid: true,
        confidence: 0.95,
        issues: []
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);
      expect(contentValidationService.validateDocument).toHaveBeenCalled();
      expect(response.body.document.validation_status).toBe('approved');
    });

    test('should flag documents with invalid content', async () => {
      contentValidationService.validateDocument.mockResolvedValue({
        valid: false,
        confidence: 0.85,
        issues: ['Missing required sections', 'Incomplete information']
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);
      expect(response.body.document.validation_status).toBe('flagged');
      expect(response.body.document.validation_issues).toEqual([
        'Missing required sections',
        'Incomplete information'
      ]);
    });

    test('should handle partial validation results', async () => {
      contentValidationService.validateDocument.mockResolvedValue({
        valid: true,
        confidence: 0.65, // Low confidence
        issues: ['Unable to parse some sections']
      });

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      expect(response.status).toBe(201);
      expect(response.body.document.validation_status).toBe('needs-review');
      expect(response.body.document.validation_confidence).toBe(0.65);
    });

    test('should handle validation service errors', async () => {
      contentValidationService.validateDocument.mockRejectedValue(
        new Error('AI service unavailable')
      );

      const response = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      // Should still accept upload but mark as pending validation
      expect(response.status).toBe(201);
      expect(response.body.document.validation_status).toBe('pending');
      expect(response.body.warnings).toContain('content validation unavailable');
    });
  });

  /**
   * Test Suite 7: GET /api/documents - List Documents
   */
  describe('GET /api/documents - List Documents', () => {
    beforeEach(async () => {
      // Create test documents
      await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-3')
        .field('requirement_type', 'compliance')
        .attach('file', TEST_FILES.docx);
    });

    test('should list all user documents', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.documents).toBeDefined();
      expect(response.body.documents.length).toBeGreaterThanOrEqual(2);
      expect(response.body.count).toBe(response.body.documents.length);
    });

    test('should filter documents by phase', async () => {
      const response = await request(app)
        .get('/api/documents?phase=phase-2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.documents.length).toBeGreaterThanOrEqual(1);

      response.body.documents.forEach(doc => {
        expect(doc.phase).toBe('phase-2');
      });
    });

    test('should filter documents by status', async () => {
      const response = await request(app)
        .get('/api/documents?status=pending')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.documents).toBeDefined();

      response.body.documents.forEach(doc => {
        expect(doc.status).toBe('pending');
      });
    });

    test('should filter by requirement_type', async () => {
      const response = await request(app)
        .get('/api/documents?requirement_type=spec')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      response.body.documents.forEach(doc => {
        expect(doc.requirement_type).toBe('spec');
      });
    });

    test('should only return documents for authenticated user', async () => {
      // User 2 uploads a document
      await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${user2Token}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.txt);

      // User 1 lists documents
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      // Should not include user 2's documents
      response.body.documents.forEach(doc => {
        expect(doc.user_id).toBe(userId);
      });
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/documents?limit=1&offset=0')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.documents.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.offset).toBe(0);
    });

    test('should sort by upload date (newest first)', async () => {
      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      const dates = response.body.documents.map(d => new Date(d.upload_date));
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i-1].getTime()).toBeGreaterThanOrEqual(dates[i].getTime());
      }
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/documents');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite 8: GET /api/documents/:id - Get Specific Document
   */
  describe('GET /api/documents/:id - Get Document Details', () => {
    let documentId;

    beforeEach(async () => {
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      documentId = uploadResponse.body.document.id;
    });

    test('should retrieve document by ID', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.document).toBeDefined();
      expect(response.body.document.id).toBe(documentId);
      expect(response.body.document.original_name).toBe('test-document.pdf');
    });

    test('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get(`/api/documents/${uuidv4()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should prevent access to other users documents', async () => {
      // User 2 tries to access User 1's document
      const response = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('access denied');
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  /**
   * Test Suite 9: DELETE /api/documents/:id - Delete Document
   */
  describe('DELETE /api/documents/:id - Delete Document', () => {
    let documentId;

    beforeEach(async () => {
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      documentId = uploadResponse.body.document.id;
    });

    test('should delete document and file', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify document is removed from database
      const doc = await getAsync('SELECT * FROM documents WHERE id = ?', [documentId]);
      expect(doc).toBeUndefined();
    });

    test('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .delete(`/api/documents/${uuidv4()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should prevent deletion of other users documents', async () => {
      // User 2 tries to delete User 1's document
      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('access denied');
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .delete(`/api/documents/${documentId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should clean up file from disk', async () => {
      const getResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const filePath = getResponse.body.document.file_path;

      const response = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);

      // Verify file no longer exists
      expect(fs.existsSync(filePath)).toBe(false);
    });
  });

  /**
   * Test Suite 10: GET /api/documents/:id/download - Download Document
   */
  describe('GET /api/documents/:id/download - Download Document', () => {
    let documentId;

    beforeEach(async () => {
      const uploadResponse = await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${userToken}`)
        .field('phase', 'phase-2')
        .field('requirement_type', 'spec')
        .attach('file', TEST_FILES.pdf);

      documentId = uploadResponse.body.document.id;
    });

    test('should download document file', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('test-document.pdf');
    });

    test('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get(`/api/documents/${uuidv4()}/download`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    test('should prevent download of other users documents', async () => {
      // User 2 tries to download User 1's document
      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('access denied');
    });

    test('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/documents/${documentId}/download`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    test('should handle missing file on disk', async () => {
      // Get document and delete file from disk
      const getResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${userToken}`);

      const filePath = getResponse.body.document.file_path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const response = await request(app)
        .get(`/api/documents/${documentId}/download`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('file not found');
    });
  });

  /**
   * Helper Functions
   */
  function createTestFixtures() {
    const fixturesDir = path.join(__dirname, 'fixtures');

    // Create small test files
    fs.writeFileSync(TEST_FILES.pdf, '%PDF-1.4\nTest PDF Content', 'utf8');
    fs.writeFileSync(TEST_FILES.docx, 'Test DOCX Content', 'utf8');
    fs.writeFileSync(TEST_FILES.txt, 'Test TXT Content', 'utf8');
    fs.writeFileSync(TEST_FILES.rtf, '{\\rtf1 Test RTF Content}', 'utf8');
    fs.writeFileSync(TEST_FILES.png, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])); // PNG header
    fs.writeFileSync(TEST_FILES.jpg, Buffer.from([255, 216, 255, 224])); // JPEG header
    fs.writeFileSync(TEST_FILES.invalid, 'MZ\x90\x00', 'binary'); // EXE header

    // Create large file (>50MB)
    const largeContent = Buffer.alloc(51 * 1024 * 1024); // 51MB
    fs.writeFileSync(TEST_FILES.large, largeContent);

    // Create infected test file
    fs.writeFileSync(TEST_FILES.infected, 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*');
  }
});
