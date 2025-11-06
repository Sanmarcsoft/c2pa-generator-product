import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './EmbeddedDocumentUpload.css';

/**
 * EmbeddedDocumentUpload - Compact document upload interface
 *
 * Embedded version of document upload designed for the Progress page.
 * Allows users to upload and validate C2PA documents.
 */
function EmbeddedDocumentUpload({ productId, currentPhase, onUploadSuccess }) {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [requirementType, setRequirementType] = useState('technical_documentation');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type - accept documents, images, videos, and common office formats
    const validTypes = [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff',
      // Videos
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo', 'video/webm',
      // Documents
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint', // .ppt
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      // Text files
      'text/plain', 'text/csv', 'text/html', 'text/markdown',
      // Other
      'application/json', 'application/xml', 'application/zip',
      'application/vnd.oasis.opendocument.text', // .odt
      'application/vnd.oasis.opendocument.spreadsheet', // .ods
      'application/rtf'
    ];

    // Also check file extension as a fallback
    const fileName = selectedFile.name.toLowerCase();
    const validExtensions = [
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff',
      '.mp4', '.mov', '.avi', '.webm',
      '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
      '.txt', '.csv', '.md', '.json', '.xml', '.zip',
      '.odt', '.ods', '.rtf', '.html'
    ];

    const hasValidType = validTypes.includes(selectedFile.type);
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      setError('Invalid file type. Please upload a document, image, or video file.');
      return;
    }

    // Validate file size (max 100MB for documents)
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('File too large. Maximum size is 100MB.');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setValidationResult(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentPhase) return;

    setUploading(true);
    setError(null);

    // Normalize phase value - handle both number (1) and string ("phase-1") formats
    let phaseValue;
    if (typeof currentPhase === 'string' && currentPhase.startsWith('phase-')) {
      phaseValue = currentPhase; // Already in correct format
    } else {
      phaseValue = `phase-${currentPhase}`; // Convert number to phase string
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('phase', phaseValue);
    formData.append('requirement_type', requirementType);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult(data.validation || data.document);
        setFile(null);
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!currentPhase) {
    return (
      <div className="embedded-document-upload">
        <div className="upload-empty">
          <p>Loading progress information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="embedded-document-upload">
      <div className="upload-header">
        <h3>Document Upload</h3>
        <span className="upload-info">C2PA Validation</span>
      </div>

      <div
        className={`upload-dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="dropzone-icon">📄</div>
            <p className="dropzone-text">
              Drag & drop a file here, or click to browse
            </p>
            <p className="dropzone-hint">
              Supports: Documents (PDF, Word, Excel, etc.), Images, Videos, Text files (max 100MB)
            </p>
            <input
              type="file"
              id="file-input"
              className="file-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.md,.json,.xml,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi"
            />
            <label htmlFor="file-input" className="browse-btn">
              Browse Files
            </label>
          </>
        ) : (
          <div className="file-preview">
            <div className="file-icon">
              {file.type.startsWith('image/') ? '🖼️' :
               file.type.startsWith('video/') ? '🎬' :
               file.type === 'application/pdf' ? '📕' :
               file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx') ? '📘' :
               file.type.includes('excel') || file.type.includes('spreadsheet') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx') ? '📗' :
               file.type.includes('powerpoint') || file.type.includes('presentation') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx') ? '📙' :
               file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') ? '📝' : '📄'}
            </div>
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">{formatFileSize(file.size)}</p>
            </div>
            <button
              className="remove-file-btn"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {file && !validationResult && (
        <>
          <div className="requirement-type-selector">
            <label htmlFor="requirement-type">Document Type:</label>
            <select
              id="requirement-type"
              value={requirementType}
              onChange={(e) => setRequirementType(e.target.value)}
              className="requirement-type-dropdown"
            >
              <option value="technical_documentation">Technical Documentation</option>
              <option value="business_documentation">Business Documentation</option>
              <option value="compliance_documentation">Compliance Documentation</option>
              <option value="security_documentation">Security Documentation</option>
              <option value="testing_documentation">Testing Documentation</option>
              <option value="user_documentation">User Documentation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            className="upload-btn"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload & Validate'}
          </button>
        </>
      )}

      {validationResult && (
        <div className="validation-result">
          <div className="result-header">
            <span className="result-icon">
              {validationResult.isValid || validationResult.c2pa_compliant ? '✓' : '⚠️'}
            </span>
            <h4>Validation Result</h4>
          </div>
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Status:</span>
              <span className={`result-status ${validationResult.isValid || validationResult.c2pa_compliant ? 'valid' : 'invalid'}`}>
                {validationResult.isValid || validationResult.c2pa_compliant ? 'Valid' : 'Invalid'}
              </span>
            </div>
            {validationResult.manifestCount !== undefined && (
              <div className="result-item">
                <span className="result-label">Manifests:</span>
                <span className="result-value">{validationResult.manifestCount}</span>
              </div>
            )}
            {validationResult.message && (
              <p className="result-message">{validationResult.message}</p>
            )}
          </div>
          <button
            className="upload-another-btn"
            onClick={() => {
              setValidationResult(null);
              setFile(null);
            }}
          >
            Upload Another
          </button>
        </div>
      )}
    </div>
  );
}

export default EmbeddedDocumentUpload;
