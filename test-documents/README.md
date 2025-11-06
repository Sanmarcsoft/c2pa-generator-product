# Test Documents for C2PA Generator Product Document Upload Feature

## Overview
This directory contains a comprehensive set of test documents for validating the document upload feature of the C2PA Generator Product certification system. These documents are organized by certification phase and include various file types, sizes, and edge cases.

## Directory Structure

```
test-documents/
├── phase1-preparation/          # Phase 1: Preparation & Registration documents
├── phase2-analysis/             # Phase 2: Gap Analysis & Requirements documents
├── phase3-development/          # Phase 3: Development & Implementation documents
├── phase4-application/          # Phase 4: Application & Submission documents
├── phase5-submission/           # Phase 5: Submission & Review documents
├── phase6-maintenance/          # Phase 6: Certification & Maintenance documents
└── edge-cases/                  # Edge case testing documents
```

## Test Documents by Phase

### Phase 1: Preparation & Registration
| File | Type | Size | Requirement Type | Description |
|------|------|------|-----------------|-------------|
| `company_information.txt` | TXT | ~3KB | Company Information | Basic company details and registration info |
| `technical_capability_statement.md` | MD | ~9KB | Technical Capability Statement | Comprehensive technical capabilities document |
| `development_environment.json` | JSON | ~5KB | Development Environment | Structured data about dev environment |

**Phase 1 Requirements Covered:**
- Company Information
- Technical Capability Statement
- Development Environment

### Phase 2: Gap Analysis & Requirements
| File | Type | Size | Requirement Type | Description |
|------|------|------|-----------------|-------------|
| `requirements_analysis.md` | MD | ~18KB | Requirements Analysis | Detailed gap analysis and requirements document |

**Phase 2 Requirements Covered:**
- Requirements Analysis
- Gap Analysis
- Compliance Checklist

### Phase 3: Development & Implementation
| File | Type | Size | Requirement Type | Description |
|------|------|------|-----------------|-------------|
| `technical_specifications.txt` | TXT | ~12KB | Technical Specifications | Complete technical specifications document |

**Phase 3 Requirements Covered:**
- Technical Specifications
- Architecture Diagrams (referenced)
- Implementation Plan

### Phase 4: Application & Submission
| File | Type | Size | Requirement Type | Description |
|------|------|------|-----------------|-------------|
| `application_form.pdf` | PDF | ~2KB | Application Form | Official application form (mock PDF) |

**Phase 4 Requirements Covered:**
- Application Form
- Supporting Evidence
- Test Results (to be added)

### Phase 5: Submission & Review
**Note:** Phase 5 documents to be created during review process

**Phase 5 Requirements Covered:**
- Submission Confirmation (TBD)
- Review Feedback (TBD)
- Corrective Actions (TBD)

### Phase 6: Maintenance & Renewal
**Note:** Phase 6 documents created post-certification

**Phase 6 Requirements Covered:**
- Maintenance Logs (TBD)
- Update Documentation (TBD)
- Renewal Application (TBD)

## Edge Case Test Files

### Special Character Handling
| File | Description | Purpose |
|------|-------------|---------|
| `special-chars-test!@#$%.txt` | Filename with special characters | Tests filename sanitization and storage |

### File Size Testing
| File | Size | Purpose |
|------|------|---------|
| `large_file.txt` | ~150KB | Tests handling of larger files (within 100MB limit) |

### Content Validation
| File | Description | Purpose |
|------|-------------|---------|
| *To be added* | Empty file | Tests empty file rejection |
| *To be added* | Malformed PDF | Tests file format validation |
| *To be added* | Virus test file | Tests virus scanning (EICAR test file) |

## File Type Coverage

### Supported Document Types
✅ **Plain Text** (.txt) - 3 files
✅ **Markdown** (.md) - 2 files
✅ **JSON** (.json) - 1 file
✅ **PDF** (.pdf) - 1 file

### To Be Added
⏳ **Word Documents** (.doc, .docx)
⏳ **Spreadsheets** (.xls, .xlsx, .csv)
⏳ **Presentations** (.ppt, .pptx)
⏳ **Images** (.jpg, .png, .gif)
⏳ **Videos** (.mp4, .mov) - May use small test videos

## Testing Scenarios

### Functional Testing
1. **Valid Upload Tests**
   - Upload each document type
   - Verify phase and requirement associations
   - Confirm successful storage

2. **Validation Tests**
   - File type validation
   - File size validation (100MB limit)
   - Content validation against requirements

3. **Security Tests**
   - Virus scanning with clean files
   - EICAR test file (when added)
   - SQL injection attempts in filenames
   - XSS attempts in metadata

### Integration Testing
1. **API Tests**
   - POST /api/documents/upload
   - GET /api/documents (list with filters)
   - GET /api/documents/:id (retrieve single)
   - DELETE /api/documents/:id
   - GET /api/documents/:id/download

2. **Database Tests**
   - Document metadata storage
   - User association
   - Phase and requirement tracking
   - Status updates (pending → scanning → validated → accepted)

### UI Testing
1. **Upload Component**
   - Drag-and-drop functionality
   - Click to browse
   - Multiple file selection
   - Phase selector
   - Requirement checkboxes
   - Progress indicators

2. **Document List**
   - Filtering by phase
   - Filtering by status
   - Sorting options
   - Download functionality
   - Delete functionality

## Usage Instructions

### For QA Engineers
1. **Manual Testing**
   ```bash
   # Navigate to Documents page in the webapp
   # For each phase:
   - Select the phase (1-6)
   - Check appropriate requirement types
   - Upload corresponding test documents
   - Verify upload success and status
   ```

2. **Automated Testing**
   ```bash
   # Run the test suite
   npm test -- tests/document-upload-api.test.js

   # With coverage
   npm test -- tests/document-upload-api.test.js --coverage
   ```

### For Developers
1. **Backend Implementation**
   ```bash
   # Implement API endpoints using test documents
   # Test with:
   curl -X POST http://localhost:8080/api/documents/upload \
     -H "Authorization: Bearer <token>" \
     -F "file=@test-documents/phase1-preparation/company_information.txt" \
     -F "phase=1" \
     -F "requirement_type=Company Information"
   ```

2. **Integration with Virus Scanner**
   ```bash
   # Test with ClamAV
   clamscan test-documents/phase1-preparation/company_information.txt
   ```

### For End Users
1. **Acceptance Testing**
   - Use documents to simulate real certification workflow
   - Test each phase sequentially
   - Verify document tracking and status updates
   - Validate download and review functionality

## Test Data Characteristics

### Realistic Content
All test documents contain realistic content that:
- Matches actual C2PA certification requirements
- Includes appropriate technical details
- Follows proper document formatting
- Contains credible company and project information

### Variety
Documents include:
- Different file formats (TXT, MD, JSON, PDF)
- Different file sizes (2KB - 150KB)
- Different content structures (plain text, markdown, structured data, PDF)
- Different metadata requirements

### Edge Cases
Special test files for:
- Large file sizes (approaching 100MB limit)
- Special characters in filenames
- Various file encodings
- Malformed files (to be added)

## Expected Test Results

### Valid Uploads
All documents in phase directories should:
- ✅ Pass file type validation
- ✅ Pass file size validation
- ✅ Pass virus scanning (return "clean" status)
- ✅ Be stored successfully in database
- ✅ Be retrievable via API
- ✅ Be downloadable via UI

### Content Validation
Documents should be analyzed for:
- Phase-appropriate content
- Requirement-specific information
- Completeness and quality

**Note:** Content validation is AI-powered and may return:
- `valid` - Content matches requirements
- `partial` - Some requirements met, others missing
- `invalid` - Content doesn't match requirements

### Status Flow
Expected document status progression:
1. Upload → `pending`
2. Virus scan → `scanning`
3. Scan complete → `clean` or `infected`
4. Content validation → `validating`
5. Validation complete → `valid`, `partial`, or `invalid`
6. Final status → `accepted` or `rejected`

## Maintenance

### Adding New Test Documents
1. Create document in appropriate phase directory
2. Update this README with document details
3. Add to test cases if needed
4. Commit with descriptive message

### Updating Existing Documents
1. Modify document content
2. Update README if metadata changes
3. Re-run affected tests
4. Document changes in commit message

## Notes for Implementers

### File Storage
- Original files stored in `/app/data/uploads/`
- Organized by user and date: `{userId}/{YYYY-MM-DD}/`
- Filenames sanitized to remove special characters

### Database Fields
Key fields to implement:
- `id` (UUID)
- `user_id` (foreign key to users table)
- `filename` (sanitized)
- `original_filename` (as uploaded)
- `file_path` (storage location)
- `file_size` (bytes)
- `mime_type` (detected MIME type)
- `phase` (1-6)
- `requirement_type` (from checkboxes)
- `virus_scan_status` (pending, clean, infected, error)
- `content_validation_status` (pending, valid, partial, invalid)
- `status` (pending, accepted, rejected)

### Virus Scanning
- Use ClamAV or similar
- Scan before saving to permanent location
- Quarantine infected files
- Alert administrators of infections

### Content Validation
- Extract text from documents
- Send to AI service with validation prompt
- Parse structured response
- Store validation results in database

## Security Considerations

### Input Validation
- Whitelist allowed file extensions
- Verify MIME types match extensions
- Sanitize filenames
- Limit file sizes (100MB)
- Rate limiting on uploads

### Storage Security
- Secure file permissions (0600)
- Separate storage from web root
- Signed URLs for downloads
- Time-limited access

### Database Security
- Parameterized queries (prevent SQL injection)
- User isolation (users can only access their own documents)
- Audit logging of all operations

## Performance Expectations

### Upload Performance
- Small files (< 1MB): < 1 second
- Medium files (1-10MB): < 5 seconds
- Large files (10-100MB): < 30 seconds

### Virus Scanning
- Add ~2-5 seconds per file
- Queue-based processing for multiple files

### Content Validation
- Add ~5-10 seconds per file (AI processing)
- Async processing with status updates

## Troubleshooting

### Common Issues
1. **Upload fails**: Check file size, type, authentication
2. **Virus scan stuck**: Check ClamAV service status
3. **Content validation fails**: Check AI service connection
4. **Download fails**: Check file permissions, storage path

### Debug Mode
Enable verbose logging:
```bash
DEBUG=documents:* npm start
```

## License
These test documents are provided for testing purposes only as part of the C2PA Generator Product development project.

---

**Created:** November 5, 2025
**Last Updated:** November 5, 2025
**Maintained By:** QA and Development Teams
**Version:** 1.0
