import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReactMarkdown from 'react-markdown';
import './ChatPage.css';

function ChatPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Don't render anything if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      message: 'Hello Sanmarcsoft LLC! 👾 I\'m your C2PA certification assistant. Ready to begin your journey?\n\nYou can upload documents directly here, or chat with me about the certification process!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [documentContext, setDocumentContext] = useState(null);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState('1');
  const [selectedRequirement, setSelectedRequirement] = useState('Company Information');
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      message: input
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setLoading(true);

    try {
      console.log('[ChatPage] Sending message:', messageText);
      console.log('[ChatPage] Token:', token ? 'Present' : 'Missing');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });

      console.log('[ChatPage] Response status:', response.status);
      const data = await response.json();
      console.log('[ChatPage] Response data:', data);

      if (data.success && data.response) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          message: data.response.message
        }]);

        // Update document context if provided
        if (data.documentContext) {
          setDocumentContext(data.documentContext);
          // Auto-show panel if documents are being used
          if (data.documentContext.hasContext && data.documentContext.totalDocuments > 0) {
            setShowContextPanel(true);
          }
        }
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          message: data.error || 'Failed to get response from AI'
        }]);
      }
    } catch (error) {
      console.error('[ChatPage] Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        message: `Error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);

    // Add user message about uploading
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      message: `📤 Uploading document: ${file.name} (Phase ${selectedPhase}, ${selectedRequirement})`
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('phase', `phase-${selectedPhase}`);
      formData.append('requirement_type', selectedRequirement);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Show upload success
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          message: `✅ Document uploaded successfully!\n\n**File**: ${data.document.original_name}\n**Phase**: ${data.document.phase}\n**Size**: ${(data.document.file_size / 1024).toFixed(2)} KB\n\n${data.document.has_extracted_content ? `I've extracted and analyzed the content. Let me tell you what I found...` : 'Processing document...'}`
        }]);

        // If content was extracted, show analysis
        if (data.document.extracted_key_info) {
          const keyInfo = data.document.extracted_key_info.extractedData;
          let analysisMessage = '📊 **Document Analysis**:\n\n';

          if (keyInfo.companyName) analysisMessage += `🏢 **Company**: ${keyInfo.companyName}\n`;
          if (keyInfo.email) analysisMessage += `📧 **Email**: ${keyInfo.email}\n`;
          if (keyInfo.website) analysisMessage += `🌐 **Website**: ${keyInfo.website}\n`;
          if (keyInfo.phone) analysisMessage += `📞 **Phone**: ${keyInfo.phone}\n`;

          if (data.document.business_validation) {
            const validation = data.document.business_validation;
            analysisMessage += `\n✓ **Validation Confidence**: ${validation.confidence.toUpperCase()}\n`;

            if (validation.warnings && validation.warnings.length > 0) {
              analysisMessage += '\n⚠️ **Warnings**:\n';
              validation.warnings.forEach(w => analysisMessage += `- ${w}\n`);
            }
          }

          setMessages(prev => [...prev, {
            id: Date.now() + 2,
            sender: 'assistant',
            message: analysisMessage
          }]);
        }

        // C2PA CONFORMANCE ASSESSMENT
        if (data.document.c2pa_conformance) {
          const conformance = data.document.c2pa_conformance;
          let conformanceMessage = `🎯 **C2PA Conformance Assessment**:\n\n`;
          conformanceMessage += `**Phase**: ${conformance.phaseDescription}\n`;
          conformanceMessage += `**Requirement**: ${conformance.requirement}\n`;
          conformanceMessage += `**Score**: ${(conformance.score * 100).toFixed(0)}% (${conformance.matchedFields}/${conformance.totalFields} requirements met)\n\n`;

          if (conformance.isSufficient) {
            conformanceMessage += `✅ **Status**: **SUFFICIENT** - This document meets the minimum requirements for ${conformance.phase} ${conformance.requirement}\n\n`;
            conformanceMessage += `💡 **Next Steps**:\n`;
            conformance.recommendations.forEach(rec => {
              conformanceMessage += `- ${rec}\n`;
            });
          } else {
            conformanceMessage += `⚠️ **Status**: **INSUFFICIENT** - This document does not fully meet the requirements\n\n`;

            if (conformance.issues && conformance.issues.length > 0) {
              conformanceMessage += `**Issues Found**:\n`;
              conformance.issues.forEach(issue => {
                conformanceMessage += `- ${issue}\n`;
              });
              conformanceMessage += `\n`;
            }

            if (conformance.missingFields && conformance.missingFields.length > 0) {
              conformanceMessage += `**Missing Required Information**:\n`;
              conformance.missingFields.forEach(field => {
                conformanceMessage += `- ${field}\n`;
              });
              conformanceMessage += `\n`;
            }

            conformanceMessage += `**Recommendations**:\n`;
            conformance.recommendations.forEach(rec => {
              conformanceMessage += `- ${rec}\n`;
            });
          }

          setMessages(prev => [...prev, {
            id: Date.now() + 3,
            sender: 'assistant',
            message: conformanceMessage
          }]);
        }

        // Reload document context
        const contextResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ message: '__GET_CONTEXT__' })
        });

        const contextData = await contextResponse.json();
        if (contextData.documentContext) {
          setDocumentContext(contextData.documentContext);
          setShowContextPanel(true);
        }

      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: 'assistant',
          message: `❌ Upload failed: ${data.error}`
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'assistant',
        message: `❌ Error uploading document: ${error.message}`
      }]);
    } finally {
      setUploadingFile(false);
      setShowUploadPanel(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="chat-page">
      <h1 className="page-title">AI ASSISTANT CHAT</h1>

      {/* Document Context Panel */}
      {documentContext && documentContext.hasContext && (
        <div className="document-context-panel retro-card">
          <div className="context-header" onClick={() => setShowContextPanel(!showContextPanel)}>
            <div className="context-title">
              <span className="context-icon">📄</span>
              <span>DOCUMENT CONTEXT ACTIVE</span>
              <span className="context-badge">{documentContext.totalDocuments} documents</span>
            </div>
            <button className="context-toggle" type="button">
              {showContextPanel ? '▼' : '▶'}
            </button>
          </div>

          {showContextPanel && (
            <div className="context-content">
              {documentContext.phase && (
                <div className="context-section">
                  <strong>Filtered Phase:</strong> Phase {documentContext.phase}
                </div>
              )}

              {Object.keys(documentContext.documentsByPhase || {}).length > 0 && (
                <div className="context-section">
                  <strong>Documents by Phase:</strong>
                  <div className="context-pills">
                    {Object.entries(documentContext.documentsByPhase).map(([phase, count]) => (
                      <span key={phase} className="context-pill">
                        Phase {phase}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {documentContext.keyInformation && (
                <>
                  {documentContext.keyInformation.companies?.length > 0 && (
                    <div className="context-section">
                      <strong>Companies:</strong>
                      <div className="context-pills">
                        {documentContext.keyInformation.companies.map((company, idx) => (
                          <span key={idx} className="context-pill info">{company}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {documentContext.keyInformation.emails?.length > 0 && (
                    <div className="context-section">
                      <strong>Emails:</strong>
                      <div className="context-pills">
                        {documentContext.keyInformation.emails.map((email, idx) => (
                          <span key={idx} className="context-pill info">{email}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {documentContext.keyInformation.websites?.length > 0 && (
                    <div className="context-section">
                      <strong>Websites:</strong>
                      <div className="context-pills">
                        {documentContext.keyInformation.websites.map((website, idx) => (
                          <span key={idx} className="context-pill info">{website}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {documentContext.keyInformation.technologies?.length > 0 && (
                    <div className="context-section">
                      <strong>Technologies:</strong>
                      <div className="context-pills">
                        {documentContext.keyInformation.technologies.map((tech, idx) => (
                          <span key={idx} className="context-pill">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="context-info">
                <small>
                  ℹ️ The AI assistant is using information from your uploaded documents to provide personalized guidance.
                </small>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="chat-container retro-card">
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              <div className="message-sender">
                {msg.sender === 'user' ? 'YOU' : 'AI ASSISTANT'}
              </div>
              <div className="message-content">
                <ReactMarkdown
                  components={{
                    a: ({node, ...props}) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chat-link"
                      />
                    )
                  }}
                >
                  {msg.message}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div className="message-sender">AI ASSISTANT</div>
              <div className="message-content">
                <div className="loading-spinner"></div>
              </div>
            </div>
          )}
        </div>

        {/* Document Upload Panel */}
        {showUploadPanel && (
          <div className="chat-upload-panel">
            <div className="upload-panel-header">
              <h3>📤 Upload Document</h3>
              <button
                type="button"
                onClick={() => setShowUploadPanel(false)}
                className="close-panel-btn"
              >
                ✕
              </button>
            </div>
            <div className="upload-panel-content">
              <div className="upload-panel-field">
                <label>Phase:</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="upload-panel-select"
                >
                  {[1, 2, 3, 4, 5, 6].map(p => (
                    <option key={p} value={p}>Phase {p}</option>
                  ))}
                </select>
              </div>
              <div className="upload-panel-field">
                <label>Requirement Type:</label>
                <select
                  value={selectedRequirement}
                  onChange={(e) => setSelectedRequirement(e.target.value)}
                  className="upload-panel-select"
                >
                  <option>Company Information</option>
                  <option>Technical Capability Statement</option>
                  <option>Development Environment</option>
                  <option>Requirements Analysis</option>
                  <option>Gap Assessment</option>
                  <option>Technical Documentation</option>
                </select>
              </div>
              <div className="upload-panel-field">
                <label htmlFor="chat-file-input" className="file-upload-label">
                  📁 Choose File
                </label>
                <input
                  id="chat-file-input"
                  type="file"
                  onChange={handleFileUpload}
                  className="file-input-hidden"
                  accept=".pdf,.doc,.docx,.txt,.md,.json,.csv,.rtf"
                  disabled={uploadingFile}
                />
              </div>
            </div>
          </div>
        )}

        <form className="chat-input-form" onSubmit={handleSend}>
          <button
            type="button"
            onClick={() => setShowUploadPanel(!showUploadPanel)}
            className="upload-toggle-btn"
            title="Upload document"
            disabled={loading || uploadingFile}
          >
            📎
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE YOUR MESSAGE..."
            className="chat-input"
            disabled={loading || uploadingFile}
          />
          <button type="submit" disabled={loading || uploadingFile || !input.trim()}>
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;
