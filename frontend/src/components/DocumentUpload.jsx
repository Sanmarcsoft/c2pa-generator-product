import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './DocumentUpload.css';

const DocumentUpload = ({ onUploadSuccess, onUploadError, phaseRequirements }) => {
  const { token } = useAuth();
  const [selectedPhase, setSelectedPhase] = useState('1');
  const [selectedRequirements, setSelectedRequirements] = useState([]);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhaseChange = (e) => {
    const phase = e.target.value;
    setSelectedPhase(phase);
    setSelectedRequirements([]); // Reset requirements when phase changes
  };

  const handleRequirementToggle = (requirement) => {
    setSelectedRequirements(prev => {
      if (prev.includes(requirement)) {
        return prev.filter(r => r !== requirement);
      } else {
        return [...prev, requirement];
      }
    });
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      // Client-side validation
      const allowedTypes = [
        // Documents
        'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt',
        // Spreadsheets
        'xls', 'xlsx', 'csv',
        // Presentations
        'ppt', 'pptx',
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif',
        // Videos
        'mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm', 'm4v',
        // Other
        'md', 'json', 'xml', 'zip'
      ];
      const ext = file.name.split('.').pop().toLowerCase();
      const maxSize = 100 * 1024 * 1024; // 100MB

      if (!allowedTypes.includes(ext)) {
        onUploadError(`File type .${ext} not allowed. See supported formats below.`);
        return false;
      }

      if (file.size > maxSize) {
        onUploadError(`File ${file.name} is too large. Maximum size is 100MB.`);
        return false;
      }

      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      addFiles(newFiles);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      onUploadError('Please select at least one file');
      return;
    }

    if (selectedRequirements.length === 0) {
      onUploadError('Please select at least one requirement type');
      return;
    }

    setUploading(true);
    const progressTracker = {};

    try {
      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'certification');

        // Track progress for this file
        progressTracker[i] = 0;
        setUploadProgress({ ...progressTracker });

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          // Update document with phase and requirements
          const documentId = data.document.id;
          await updateDocumentMetadata(documentId, {
            phase: parseInt(selectedPhase),
            requirements: selectedRequirements,
            status: 'pending'
          });

          progressTracker[i] = 100;
          setUploadProgress({ ...progressTracker });

          onUploadSuccess(data.document);
        } else {
          onUploadError(data.error || `Failed to upload ${file.name}`);
        }
      }

      // Clear form after successful upload
      setFiles([]);
      setSelectedRequirements([]);
      setUploadProgress({});

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload error:', err);
      onUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const updateDocumentMetadata = async (documentId, metadata) => {
    // This would ideally be a PATCH endpoint, but we'll store in annotations for now
    try {
      await fetch(`/api/documents/${documentId}/annotations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          annotations: [{
            content: JSON.stringify(metadata),
            pageNumber: null,
            position: {}
          }]
        })
      });
    } catch (err) {
      console.error('Error updating document metadata:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="document-upload">
      {/* Phase Selection */}
      <div className="upload-form-group">
        <label htmlFor="phase-select">Select Phase:</label>
        <select
          id="phase-select"
          value={selectedPhase}
          onChange={handlePhaseChange}
          className="upload-select"
          disabled={uploading}
        >
          {Object.keys(phaseRequirements).map(phase => (
            <option key={phase} value={phase}>
              Phase {phase}
            </option>
          ))}
        </select>
      </div>

      {/* Requirement Type Checkboxes */}
      <div className={`upload-form-group ${files.length > 0 && selectedRequirements.length === 0 ? 'highlight-required' : ''}`}>
        <label>
          Requirement Types:
          {files.length > 0 && selectedRequirements.length === 0 && (
            <span className="required-indicator"> (Select at least one)</span>
          )}
        </label>
        <div className="requirements-grid">
          {phaseRequirements[selectedPhase]?.map((requirement) => (
            <label key={requirement} className="requirement-checkbox">
              <input
                type="checkbox"
                checked={selectedRequirements.includes(requirement)}
                onChange={() => handleRequirementToggle(requirement)}
                disabled={uploading}
              />
              <span>{requirement}</span>
            </label>
          ))}
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="drop-zone-icon">📁</div>
          <p className="drop-zone-text">
            Drag and drop files here, or click to browse
          </p>
          <p className="drop-zone-hint">
            Supported: Documents (PDF, DOCX, DOC, TXT, RTF, ODT), Spreadsheets (XLS, XLSX, CSV),
            Presentations (PPT, PPTX), Images (JPG, PNG, GIF, BMP, WEBP, SVG, TIFF),
            Videos (MP4, MOV, AVI, WMV, FLV, MKV, WEBM), and more (Max 100MB each)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg,.tiff,.tif,.mp4,.mov,.avi,.wmv,.flv,.mkv,.webm,.m4v,.md,.json,.xml,.zip"
          onChange={handleFileSelect}
          className="file-input-hidden"
          disabled={uploading}
        />
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({files.length}):</h3>
          <div className="files-list">
            {files.map((file, index) => (
              <div key={index} className="file-item">
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                {uploadProgress[index] !== undefined ? (
                  <div className="file-progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress[index]}%` }}
                    ></div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="remove-file-btn"
                    disabled={uploading}
                    title="Remove file"
                  >
                    ✗
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || files.length === 0 || selectedRequirements.length === 0}
        className="upload-btn"
        title={
          files.length === 0 ? 'Select files to upload' :
          selectedRequirements.length === 0 ? 'Select at least one requirement type' :
          uploading ? 'Upload in progress' : 'Click to upload files'
        }
      >
        {uploading ? '⏳ Uploading...' :
         files.length === 0 ? '📤 Select Files to Upload' :
         selectedRequirements.length === 0 ? '📤 Select Requirements to Upload' :
         `📤 Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
};

export default DocumentUpload;
