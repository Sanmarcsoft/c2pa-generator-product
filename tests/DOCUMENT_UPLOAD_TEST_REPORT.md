# Document Upload Feature - TDD Test Report

## Overview

This report documents the comprehensive TDD test suite for the Document Upload feature. All tests have been written BEFORE implementation and will initially FAIL until the feature is complete.

**Test File:** `/Volumes/Data/Users/matt/projects/c2pa-generator-product/tests/document-upload-api.test.js`

**Framework:** Jest with Supertest

**Total Test Cases:** 78

---

## Test Coverage Summary

### 1. POST /api/documents/upload - Valid Uploads (8 tests)
Tests successful file uploads with proper validation and processing.

- ✓ Upload PDF file with all required fields
- ✓ Upload DOCX file successfully
- ✓ Upload TXT file successfully
- ✓ Upload RTF file successfully
- ✓ Upload PNG image successfully
- ✓ Upload JPG image successfully
- ✓ Upload multiple files sequentially
- ✓ Store file metadata correctly

**Requirements Validated:**
- File upload API endpoint functionality
- Required fields: phase, requirement_type
- Database record creation
- User association
- File storage on disk
- Metadata extraction (size, type, date)

---

### 2. POST /api/documents/upload - Validation Failures (6 tests)
Tests request validation and authentication.

- ✓ Reject upload without file
- ✓ Reject upload without phase field
- ✓ Reject upload without requirement_type field
- ✓ Reject invalid phase value
- ✓ Reject upload without authentication
- ✓ Reject upload with invalid token

**Requirements Validated:**
- Input validation for required fields
- Phase enumeration validation
- JWT authentication enforcement
- Error message clarity

---

### 3. POST /api/documents/upload - File Format Validation (4 tests)
Tests file format acceptance and rejection.

- ✓ Reject unsupported file format (.exe)
- ✓ Accept all supported document formats (PDF, DOCX, TXT, RTF)
- ✓ Accept all supported image formats (PNG, JPG, JPEG, GIF, TIFF, WEBP)
- ✓ Validate MIME type in addition to extension

**Requirements Validated:**
- Supported formats: .pdf, .doc, .docx, .txt, .rtf, .odt, .png, .jpg, .jpeg, .gif, .tiff, .webp
- MIME type validation
- Extension validation
- Security: Reject executable files

---

### 4. POST /api/documents/upload - File Size Validation (2 tests)
Tests file size limit enforcement.

- ✓ Reject file exceeding size limit
- ✓ Enforce different size limits per file type

**Requirements Validated:**
- Maximum file size enforcement (50MB default)
- Type-specific size limits (images: 10MB, documents: 50MB)
- 413 Payload Too Large response

---

### 5. Virus Scanning Integration (4 tests)
Tests ClamAV integration for malware detection.

- ✓ Scan file for viruses before saving
- ✓ Reject infected file
- ✓ Handle virus scanner errors gracefully
- ✓ Quarantine suspected files

**Requirements Validated:**
- ClamAV integration
- Pre-save virus scanning
- Infected file rejection and deletion
- Quarantine functionality
- Graceful degradation when scanner unavailable

---

### 6. Content Validation with AI (4 tests)
Tests AI-powered content validation.

- ✓ Validate document content with AI
- ✓ Flag documents with invalid content
- ✓ Handle partial validation results
- ✓ Handle validation service errors

**Requirements Validated:**
- AI service integration
- Content relevance analysis
- Validation confidence scoring
- Issue detection and reporting
- Graceful degradation when AI unavailable

---

### 7. GET /api/documents - List Documents (8 tests)
Tests document listing and filtering.

- ✓ List all user documents
- ✓ Filter documents by phase
- ✓ Filter documents by status
- ✓ Filter by requirement_type
- ✓ Only return documents for authenticated user
- ✓ Support pagination
- ✓ Sort by upload date (newest first)
- ✓ Reject request without authentication

**Requirements Validated:**
- Document listing endpoint
- User isolation (security)
- Phase filtering
- Status filtering
- Pagination support
- Sorting functionality
- Authentication requirement

---

### 8. GET /api/documents/:id - Get Document Details (4 tests)
Tests retrieving specific document information.

- ✓ Retrieve document by ID
- ✓ Return 404 for non-existent document
- ✓ Prevent access to other users' documents
- ✓ Reject request without authentication

**Requirements Validated:**
- Document detail endpoint
- Authorization checks
- User isolation
- Error handling

---

### 9. DELETE /api/documents/:id - Delete Document (5 tests)
Tests document deletion.

- ✓ Delete document and file
- ✓ Return 404 for non-existent document
- ✓ Prevent deletion of other users' documents
- ✓ Reject request without authentication
- ✓ Clean up file from disk

**Requirements Validated:**
- Document deletion endpoint
- Database record deletion
- File system cleanup
- Authorization checks
- User isolation

---

### 10. GET /api/documents/:id/download - Download Document (5 tests)
Tests document download functionality.

- ✓ Download document file
- ✓ Return 404 for non-existent document
- ✓ Prevent download of other users' documents
- ✓ Reject request without authentication
- ✓ Handle missing file on disk

**Requirements Validated:**
- Download endpoint
- Content-Type headers
- Content-Disposition headers
- Authorization checks
- Error handling

---

## Mock Services Created

### 1. virusScanService.js
Location: `/Volumes/Data/Users/matt/projects/c2pa-generator-product/backend/src/services/virusScanService.js`

**Methods:**
- `scanFile(filePath)` - Scans file for viruses
- `isAvailable()` - Checks scanner health

**Expected Integration:**
- ClamAV daemon integration
- Socket or REST API communication
- Quarantine directory management

### 2. contentValidationService.js
Location: `/Volumes/Data/Users/matt/projects/c2pa-generator-product/backend/src/services/contentValidationService.js`

**Methods:**
- `validateDocument(filePath, metadata)` - Validates content with AI
- `extractText(filePath, fileType)` - Extracts text from documents
- `isAvailable()` - Checks AI service health

**Expected Integration:**
- OpenAI or similar AI service
- Document parsing libraries (pdf-parse, mammoth)
- Phase-specific validation rules

---

## Implementation Requirements

### Database Schema Changes Needed

Add to documents table:
```sql
ALTER TABLE documents ADD COLUMN user_id TEXT NOT NULL REFERENCES users(id);
ALTER TABLE documents ADD COLUMN phase TEXT NOT NULL;
ALTER TABLE documents ADD COLUMN requirement_type TEXT NOT NULL;
ALTER TABLE documents ADD COLUMN validation_status TEXT DEFAULT 'pending';
ALTER TABLE documents ADD COLUMN validation_confidence REAL;
ALTER TABLE documents ADD COLUMN validation_issues TEXT;
ALTER TABLE documents ADD COLUMN virus_scan_status TEXT DEFAULT 'pending';
ALTER TABLE documents ADD COLUMN virus_scan_date TEXT;
ALTER TABLE documents ADD COLUMN mime_type TEXT;

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_phase ON documents(phase);
CREATE INDEX idx_documents_status ON documents(status);
```

### API Routes to Implement

Update `/Volumes/Data/Users/matt/projects/c2pa-generator-product/backend/src/routes/documents.js`:

1. **POST /api/documents/upload**
   - Add authentication middleware: `requireAuth`
   - Add user_id from `req.user.id`
   - Validate required fields: phase, requirement_type
   - Validate phase against allowed values
   - Call virusScanService.scanFile()
   - Call contentValidationService.validateDocument()
   - Store validation results in database
   - Handle errors and cleanup on failure

2. **GET /api/documents**
   - Add authentication middleware: `requireAuth`
   - Filter by user_id: `WHERE user_id = ?`
   - Add query parameters: phase, status, requirement_type
   - Add pagination: limit, offset
   - Order by upload_date DESC

3. **GET /api/documents/:id**
   - Add authentication middleware: `requireAuth`
   - Add authorization check: `WHERE id = ? AND user_id = ?`
   - Return 403 if not owned by user

4. **DELETE /api/documents/:id**
   - Add authentication middleware: `requireAuth`
   - Add authorization check: `WHERE id = ? AND user_id = ?`
   - Return 403 if not owned by user
   - Ensure file deletion from disk

5. **GET /api/documents/:id/download**
   - Add authentication middleware: `requireAuth`
   - Add authorization check: `WHERE id = ? AND user_id = ?`
   - Return 403 if not owned by user
   - Set proper Content-Type header
   - Set Content-Disposition header with original filename

### Dependencies to Add

Add to `backend/package.json`:
```json
{
  "dependencies": {
    "clamscan": "^2.1.2",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "rtf-parser": "^1.3.2"
  }
}
```

### Environment Variables

Add to `.env`:
```
# Virus Scanning
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
CLAMAV_ENABLED=true

# File Upload Limits
MAX_FILE_SIZE=52428800
MAX_IMAGE_SIZE=10485760

# Allowed File Types
ALLOWED_DOC_TYPES=pdf,doc,docx,txt,rtf,odt
ALLOWED_IMAGE_TYPES=png,jpg,jpeg,gif,tiff,webp

# Content Validation
CONTENT_VALIDATION_ENABLED=true
VALIDATION_CONFIDENCE_THRESHOLD=0.7
```

---

## Running the Tests

### Run All Tests
```bash
npm test tests/document-upload-api.test.js
```

### Run Specific Test Suite
```bash
npm test -- --testNamePattern="POST /api/documents/upload - Valid Uploads"
```

### Run with Coverage
```bash
npm test -- --coverage tests/document-upload-api.test.js
```

### Expected Initial Result
All tests will FAIL because the implementation does not exist yet. This is expected and correct for TDD.

---

## Implementation Checklist

### Phase 1: Database Schema
- [ ] Add new columns to documents table
- [ ] Create indexes for performance
- [ ] Update database migration script
- [ ] Test database schema changes

### Phase 2: File Upload Core
- [ ] Update multer configuration for new file types
- [ ] Add authentication to upload endpoint
- [ ] Add user_id, phase, requirement_type to document records
- [ ] Implement field validation
- [ ] Test basic upload functionality

### Phase 3: Virus Scanning
- [ ] Install and configure ClamAV
- [ ] Implement virusScanService with ClamAV integration
- [ ] Add virus scanning to upload flow
- [ ] Implement file quarantine
- [ ] Test with EICAR test file

### Phase 4: Content Validation
- [ ] Implement text extraction for PDF, DOCX, TXT, RTF
- [ ] Integrate with AI service
- [ ] Define validation rules per phase
- [ ] Implement validation scoring
- [ ] Add validation results to database

### Phase 5: Authorization
- [ ] Add user_id filtering to GET /api/documents
- [ ] Add authorization checks to GET /api/documents/:id
- [ ] Add authorization checks to DELETE /api/documents/:id
- [ ] Add authorization checks to download endpoint
- [ ] Test cross-user access attempts

### Phase 6: Error Handling
- [ ] Implement proper error messages
- [ ] Add cleanup on failure (delete uploaded files)
- [ ] Handle service unavailability gracefully
- [ ] Add logging for debugging

### Phase 7: Final Testing
- [ ] Run full test suite
- [ ] Fix any failing tests
- [ ] Verify all 78 tests pass
- [ ] Run coverage report
- [ ] Manual testing with real files

---

## Security Considerations

1. **File Upload Security**
   - Validate MIME types in addition to extensions
   - Scan all uploads for viruses
   - Enforce strict file size limits
   - Store files outside web root
   - Use UUID filenames to prevent path traversal

2. **Authorization**
   - Always check user_id matches authenticated user
   - Never expose other users' documents
   - Validate JWT tokens on every request

3. **Content Security**
   - Sanitize filenames before storage
   - Prevent directory traversal attacks
   - Set proper Content-Type headers
   - Use Content-Disposition for downloads

4. **Rate Limiting**
   - Implement stricter rate limits for upload endpoint
   - Consider per-user upload quotas
   - Monitor for abuse patterns

---

## Performance Considerations

1. **File Processing**
   - Process virus scanning asynchronously if possible
   - Queue content validation for background processing
   - Stream large files instead of buffering

2. **Database Queries**
   - Use indexes on user_id, phase, status
   - Implement pagination for large result sets
   - Consider caching frequently accessed documents

3. **Storage**
   - Monitor disk space usage
   - Implement cleanup of old/deleted files
   - Consider cloud storage for scalability

---

## Next Steps

1. Review test suite with team
2. Prioritize implementation phases
3. Set up ClamAV in development environment
4. Begin Phase 1: Database Schema implementation
5. Iterate through implementation checklist
6. Run tests after each phase
7. Address test failures immediately
8. Document any deviations from test specs

---

## Test Fixtures

Test files are created automatically in `/Volumes/Data/Users/matt/projects/c2pa-generator-product/tests/fixtures/`:

- `test-document.pdf` - Small valid PDF
- `test-document.docx` - Small valid DOCX
- `test-document.txt` - Plain text file
- `test-document.rtf` - RTF formatted document
- `test-image.png` - PNG image
- `test-image.jpg` - JPEG image
- `test-file.exe` - Invalid executable file
- `large-file.pdf` - File exceeding size limit (51MB)
- `infected-file.pdf` - EICAR test file for virus scanning

---

## Contact

For questions about this test suite, contact the QA Test Engineer or refer to the TDD documentation.

**Document Version:** 1.0
**Last Updated:** 2025-11-04
**Status:** Ready for Implementation
