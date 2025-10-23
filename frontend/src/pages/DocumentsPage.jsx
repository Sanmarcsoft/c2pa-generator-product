import { useState } from 'react';
import './DocumentsPage.css';

function DocumentsPage() {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'user-upload');

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Document uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="documents-page">
      <h1 className="page-title">DOCUMENT MANAGEMENT</h1>

      <div className="upload-section retro-card">
        <h2>UPLOAD DOCUMENT</h2>
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.docx,.txt,.md,.json"
        />
        {uploading && <div className="loading-spinner"></div>}
      </div>

      <div className="documents-list">
        <div className="retro-card">
          <h2>YOUR DOCUMENTS</h2>
          <p>Documents will appear here after uploading.</p>
          <p className="text-cyan">Backend API: /api/documents</p>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
