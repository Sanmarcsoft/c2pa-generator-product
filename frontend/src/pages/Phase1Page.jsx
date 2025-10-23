import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './Phase1Page.css';

const Phase1Page = () => {
  const [activeTab, setActiveTab] = useState('checklist');
  const [checklist, setChecklist] = useState([]);
  const [resources, setResources] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [phase1Status, setPhase1Status] = useState(null);
  const [eoiForm, setEoiForm] = useState({
    companyName: 'Sanmarcsoft LLC',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    companyWebsite: '',
    productDescription: '',
    intendedUseCase: '',
    estimatedTimeline: '3-6 months'
  });
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    fetchChecklist();
    fetchResources();
    fetchStatus();
  }, []);

  const fetchChecklist = async () => {
    try {
      const response = await fetch('/api/phase1/checklist');
      const data = await response.json();
      if (data.success) {
        setChecklist(data.checklist);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/phase1/resources');
      const data = await response.json();
      if (data.success) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/phase1/status');
      const data = await response.json();
      if (data.success) {
        setPhase1Status(data.status);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('documents', file);
    });
    formData.append('documentType', 'phase1-eligibility');
    formData.append('description', 'Phase 1 eligibility documents');

    try {
      const response = await fetch('/api/phase1/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();

      if (data.success) {
        setUploadedDocs([...uploadedDocs, ...data.documents]);
        fetchStatus(); // Refresh status
        alert(`Successfully uploaded ${data.documents.length} document(s)!`);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Upload failed. Please try again.');
    }
  }, [uploadedDocs]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleEoiSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/phase1/submit-eoi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eoiForm)
      });
      const data = await response.json();

      if (data.success) {
        setSubmissionResult(data);
        fetchStatus(); // Refresh status
      } else {
        alert('Submission failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting EOI:', error);
      alert('Submission failed. Please try again.');
    }
  };

  return (
    <div className="phase1-container">
      <header className="phase1-header">
        <h1>🚀 Phase 1: Introduction & Prerequisites</h1>
        <p className="phase1-subtitle">Let's get you started on the C2PA certification journey!</p>

        {phase1Status && (
          <div className="progress-indicator">
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${phase1Status.completionPercentage}%` }}
              />
            </div>
            <span className="progress-text">{phase1Status.completionPercentage}% Complete</span>
          </div>
        )}
      </header>

      <div className="phase1-tabs">
        <button
          className={`tab ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          📋 Checklist
        </button>
        <button
          className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          📚 Official Resources
        </button>
        <button
          className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Upload Documents
        </button>
        <button
          className={`tab ${activeTab === 'eoi' ? 'active' : ''}`}
          onClick={() => setActiveTab('eoi')}
        >
          ✍️ Expression of Interest
        </button>
      </div>

      <div className="phase1-content">
        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="checklist-section">
            <h2>Phase 1 Checklist</h2>
            <p className="section-description">
              Review these requirements to ensure you're ready to begin the certification process.
            </p>

            {checklist.map((section) => (
              <div key={section.id} className="checklist-card">
                <div className="card-header">
                  <h3>{section.title}</h3>
                  {section.required && <span className="badge required">Required</span>}
                </div>
                <p className="card-description">{section.description}</p>
                <ul className="checklist-items">
                  {section.items.map((item, idx) => (
                    <li key={idx}>
                      <input type="checkbox" id={`${section.id}-${idx}`} />
                      <label htmlFor={`${section.id}-${idx}`}>{item}</label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && resources && (
          <div className="resources-section">
            <h2>Official C2PA Resources</h2>
            <p className="section-description">
              Direct links to official C2PA resources, verification authorities, and tools.
            </p>

            <div className="resource-category">
              <h3>🏛️ Official C2PA Links</h3>
              <div className="resource-grid">
                {resources.official.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card"
                  >
                    <div className="resource-header">
                      <h4>{resource.title}</h4>
                      <span className="external-link">↗</span>
                    </div>
                    <p className="resource-description">{resource.description}</p>
                    <span className="resource-badge">{resource.category}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="resource-category">
              <h3>🔐 Certification Authorities</h3>
              <div className="resource-grid">
                {resources.certificationAuthorities.map((ca, idx) => (
                  <a
                    key={idx}
                    href={ca.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card ca-card"
                  >
                    <div className="resource-header">
                      <h4>{ca.name}</h4>
                      <span className={`status-badge ${ca.status.toLowerCase().replace(' ', '-')}`}>
                        {ca.status}
                      </span>
                    </div>
                    <p className="resource-description">{ca.description}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="resource-category">
              <h3>🛠️ Development Tools</h3>
              <div className="resource-grid">
                {resources.tools.map((tool, idx) => (
                  <a
                    key={idx}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card"
                  >
                    <div className="resource-header">
                      <h4>{tool.title}</h4>
                      <span className="external-link">↗</span>
                    </div>
                    <p className="resource-description">{tool.description}</p>
                    <span className="resource-badge">{tool.category}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="resource-category">
              <h3>📖 Learning Resources</h3>
              <div className="resource-grid">
                {resources.learning.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card"
                  >
                    <div className="resource-header">
                      <h4>{resource.title}</h4>
                      <span className="external-link">↗</span>
                    </div>
                    <p className="resource-description">{resource.description}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Upload Tab */}
        {activeTab === 'documents' && (
          <div className="documents-section">
            <h2>Upload Phase 1 Documents</h2>
            <p className="section-description">
              Drag and drop your eligibility documents here. Accepted formats: PDF, Word, Text, Images
            </p>

            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dropzone-content">
                <div className="upload-icon">📤</div>
                {isDragActive ? (
                  <p className="dropzone-text">Drop your files here...</p>
                ) : (
                  <>
                    <p className="dropzone-text">Drag & drop files here, or click to select</p>
                    <p className="dropzone-hint">PDF, Word, Text, or Image files (max 50MB)</p>
                  </>
                )}
              </div>
            </div>

            {uploadedDocs.length > 0 && (
              <div className="uploaded-docs">
                <h3>Uploaded Documents ({uploadedDocs.length})</h3>
                <ul className="docs-list">
                  {uploadedDocs.map((doc) => (
                    <li key={doc.id} className="doc-item">
                      <span className="doc-icon">📄</span>
                      <span className="doc-name">{doc.filename}</span>
                      <span className="doc-size">{(doc.size / 1024).toFixed(1)} KB</span>
                      <span className="doc-status">✓ Uploaded</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="info-box">
              <h4>📝 Recommended Documents:</h4>
              <ul>
                <li>Company registration/incorporation documents</li>
                <li>Business license</li>
                <li>Tax identification documents</li>
                <li>Proof of business address</li>
                <li>Technical capacity overview (team, infrastructure)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Expression of Interest Tab */}
        {activeTab === 'eoi' && (
          <div className="eoi-section">
            <h2>Submit Expression of Interest</h2>
            <p className="section-description">
              Prepare your Expression of Interest for the C2PA Conformance Program.
            </p>

            {!submissionResult ? (
              <form onSubmit={handleEoiSubmit} className="eoi-form">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    value={eoiForm.companyName}
                    onChange={(e) => setEoiForm({ ...eoiForm, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Name *</label>
                  <input
                    type="text"
                    value={eoiForm.contactName}
                    onChange={(e) => setEoiForm({ ...eoiForm, contactName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email *</label>
                  <input
                    type="email"
                    value={eoiForm.contactEmail}
                    onChange={(e) => setEoiForm({ ...eoiForm, contactEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={eoiForm.contactPhone}
                    onChange={(e) => setEoiForm({ ...eoiForm, contactPhone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Company Website</label>
                  <input
                    type="url"
                    value={eoiForm.companyWebsite}
                    onChange={(e) => setEoiForm({ ...eoiForm, companyWebsite: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Product Description *</label>
                  <textarea
                    value={eoiForm.productDescription}
                    onChange={(e) => setEoiForm({ ...eoiForm, productDescription: e.target.value })}
                    rows="4"
                    placeholder="Describe your product and its content generation capabilities..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Intended Use Case</label>
                  <textarea
                    value={eoiForm.intendedUseCase}
                    onChange={(e) => setEoiForm({ ...eoiForm, intendedUseCase: e.target.value })}
                    rows="4"
                    placeholder="How will you use C2PA content credentials?"
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Timeline</label>
                  <select
                    value={eoiForm.estimatedTimeline}
                    onChange={(e) => setEoiForm({ ...eoiForm, estimatedTimeline: e.target.value })}
                  >
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6-12 months">6-12 months</option>
                    <option value="12+ months">12+ months</option>
                  </select>
                </div>

                <button type="submit" className="submit-btn">
                  Prepare Expression of Interest
                </button>
              </form>
            ) : (
              <div className="submission-success">
                <div className="success-icon">✅</div>
                <h3>Expression of Interest Prepared!</h3>
                <p>Your EOI has been prepared and saved. Now you need to submit it to C2PA.</p>

                <div className="next-steps">
                  <div className="step-card primary-step">
                    <h4>📝 Official Submission</h4>
                    <p>Visit the C2PA Conformance page and fill out the official form:</p>
                    <a
                      href={submissionResult.nextSteps.manual.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn primary"
                    >
                      Go to C2PA Conformance Form ↗
                    </a>
                  </div>

                  <div className="step-card">
                    <h4>📄 Export Your Information</h4>
                    <p>Download your EOI information to help fill out the official form:</p>
                    <button
                      className="action-btn secondary"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(eoiForm, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `C2PA-EOI-${eoiForm.companyName.replace(/\s+/g, '-')}.json`;
                        a.click();
                      }}
                    >
                      Download EOI Data (JSON)
                    </button>
                  </div>
                </div>

                <button
                  className="reset-btn"
                  onClick={() => setSubmissionResult(null)}
                >
                  ← Back to Form
                </button>
              </div>
            )}

            <div className="info-box">
              <h4>ℹ️ About the Conformance Program</h4>
              <p>
                The C2PA Conformance Program is a transparent governance process that ensures
                Generator Products meet the Content Credentials specification and security requirements.
              </p>
              <p>
                After submitting your Expression of Interest, the C2PA team will review your application
                and provide next steps for the formal certification process.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Phase1Page;
