import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DocumentUpload from '../components/DocumentUpload';
import DocumentList from '../components/DocumentList';
import './DocumentsPage.css';

const PHASE_REQUIREMENTS = {
  1: ['Company Information', 'Technical Capability Statement', 'Development Environment'],
  2: ['Requirements Analysis', 'Gap Analysis', 'Compliance Checklist'],
  3: ['Technical Specifications', 'Architecture Diagrams', 'Implementation Plan'],
  4: ['Application Form', 'Supporting Evidence', 'Test Results'],
  5: ['Submission Confirmation', 'Review Feedback', 'Corrective Actions'],
  6: ['Maintenance Logs', 'Update Documentation', 'Renewal Application']
};

const DocumentsPage = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPhase, setFilterPhase] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setError(data.error || 'Failed to load documents');
      }
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (document) => {
    showNotification('Document uploaded successfully!', 'success');
    loadDocuments();
  };

  const handleUploadError = (error) => {
    showNotification(error, 'error');
  };

  const handleDelete = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Document deleted successfully!', 'success');
        loadDocuments();
      } else {
        showNotification(data.error || 'Failed to delete document', 'error');
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      showNotification('Failed to delete document', 'error');
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showNotification('Document downloaded!', 'success');
    } catch (err) {
      console.error('Error downloading document:', err);
      showNotification('Failed to download document', 'error');
    }
  };

  const handleRescan = async (documentId) => {
    showNotification('Rescan feature coming soon!', 'info');
    // TODO: Implement rescan functionality when RAG pipeline is ready
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      if (filterPhase !== 'all' && doc.phase?.toString() !== filterPhase) {
        return false;
      }
      if (filterStatus !== 'all' && doc.status !== filterStatus) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.upload_date) - new Date(a.upload_date);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'name':
          return (a.original_name || '').localeCompare(b.original_name || '');
        default:
          return 0;
      }
    });

  return (
    <div className="documents-page">
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span>
            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✗' : 'ℹ'}
          </span>
          {notification.message}
        </div>
      )}

      <div className="documents-header">
        <h1 className="pixel-text">📄 Document Management</h1>
        <p className="subtitle">
          Upload and manage certification documents by phase
        </p>
      </div>

      {/* Upload Section */}
      <div className="documents-section">
        <h2>📤 Upload Documents</h2>
        <DocumentUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          phaseRequirements={PHASE_REQUIREMENTS}
        />
      </div>

      {/* C2PA Conformance Explorer */}
      <section className="conformance-explorer-section">
        <div className="explorer-card featured-card">
          <div className="explorer-header">
            <span className="explorer-badge">🔍 C2PA OFFICIAL TOOL</span>
            <h2 className="explorer-title">Conformance Explorer</h2>
          </div>
          <p className="explorer-description">
            Test and validate C2PA implementations with the official conformance testing tool.
            Verify that your content credentials meet C2PA technical specifications.
          </p>
          <a
            href="https://spec.c2pa.org/conformance-explorer/"
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-button"
          >
            <span>Launch Conformance Explorer</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>
          </a>
          <div className="explorer-features">
            <span className="explorer-feature">✓ Validate C2PA Manifests</span>
            <span className="explorer-feature">✓ Test Implementation Compliance</span>
            <span className="explorer-feature">✓ Official C2PA Specifications</span>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <div className="documents-section">
        <div className="filters-container">
          <h2>🔍 Filter Documents</h2>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Phase:</label>
              <select
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Phases</option>
                {[1, 2, 3, 4, 5, 6].map(phase => (
                  <option key={phase} value={phase}>Phase {phase}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="partial">Partial</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="date">Upload Date</option>
                <option value="name">File Name</option>
                <option value="size">File Size</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List Section */}
      <div className="documents-section">
        <h2>📋 Document Library</h2>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading documents...</p>
          </div>
        ) : error ? (
          <div className="error-box">
            <p>{error}</p>
            <button onClick={loadDocuments} className="btn-primary">
              Retry
            </button>
          </div>
        ) : (
          <DocumentList
            documents={filteredDocuments}
            onDelete={handleDelete}
            onDownload={handleDownload}
            onRescan={handleRescan}
            phaseRequirements={PHASE_REQUIREMENTS}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
