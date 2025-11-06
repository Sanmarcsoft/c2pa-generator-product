import { useState } from 'react';
import './DocumentList.css';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    color: 'yellow'
  },
  accepted: {
    label: 'Accepted',
    icon: '✓',
    color: 'green'
  },
  rejected: {
    label: 'Rejected',
    icon: '✗',
    color: 'red'
  },
  partial: {
    label: 'Partial',
    icon: '⚠',
    color: 'orange'
  }
};

const DocumentList = ({ documents, onDelete, onDownload, onRescan, phaseRequirements }) => {
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <span className={`status-badge status-${config.color}`}>
        <span className="status-icon">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const toggleExpanded = (docId) => {
    setExpandedDoc(expandedDoc === docId ? null : docId);
  };

  // Pagination
  const totalPages = Math.ceil(documents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDocuments = documents.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📄</div>
        <p>No documents found</p>
        <p className="empty-hint">Upload documents above to get started</p>
      </div>
    );
  }

  return (
    <div className="document-list">
      {/* Desktop Table View */}
      <div className="documents-table-container desktop-only">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Phase</th>
              <th>Requirement</th>
              <th>Status</th>
              <th>Date</th>
              <th>Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedDocuments.map((doc) => (
              <tr key={doc.id}>
                <td className="filename-cell">
                  <span className="file-icon">📄</span>
                  {doc.original_name || doc.filename}
                </td>
                <td>
                  <span className="phase-badge">
                    Phase {doc.phase || '-'}
                  </span>
                </td>
                <td className="requirement-cell">
                  {doc.requirement || '-'}
                </td>
                <td>
                  {getStatusBadge(doc.status || 'pending')}
                </td>
                <td className="date-cell">
                  {formatDate(doc.upload_date)}
                </td>
                <td>{formatFileSize(doc.file_size)}</td>
                <td className="actions-cell">
                  <button
                    onClick={() => onDownload(doc.id, doc.original_name)}
                    className="action-btn download-btn"
                    title="Download"
                  >
                    ⬇
                  </button>
                  <button
                    onClick={() => onRescan(doc.id)}
                    className="action-btn rescan-btn"
                    title="Rescan"
                  >
                    🔄
                  </button>
                  <button
                    onClick={() => onDelete(doc.id)}
                    className="action-btn delete-btn"
                    title="Delete"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="documents-cards mobile-only">
        {paginatedDocuments.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="card-header" onClick={() => toggleExpanded(doc.id)}>
              <div className="card-title">
                <span className="file-icon">📄</span>
                <span className="filename">{doc.original_name || doc.filename}</span>
              </div>
              <span className="expand-icon">{expandedDoc === doc.id ? '▼' : '▶'}</span>
            </div>

            <div className="card-body">
              <div className="card-info">
                <div className="info-row">
                  <span className="info-label">Phase:</span>
                  <span className="phase-badge">Phase {doc.phase || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  {getStatusBadge(doc.status || 'pending')}
                </div>
              </div>

              {expandedDoc === doc.id && (
                <div className="card-details">
                  <div className="info-row">
                    <span className="info-label">Requirement:</span>
                    <span>{doc.requirement || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date:</span>
                    <span>{formatDate(doc.upload_date)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Size:</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                </div>
              )}

              <div className="card-actions">
                <button
                  onClick={() => onDownload(doc.id, doc.original_name)}
                  className="action-btn download-btn"
                >
                  ⬇ Download
                </button>
                <button
                  onClick={() => onRescan(doc.id)}
                  className="action-btn rescan-btn"
                >
                  🔄 Rescan
                </button>
                <button
                  onClick={() => onDelete(doc.id)}
                  className="action-btn delete-btn"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ◀ Previous
          </button>

          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
