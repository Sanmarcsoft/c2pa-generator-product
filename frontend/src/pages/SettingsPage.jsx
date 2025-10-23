import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [githubRepos, setGithubRepos] = useState([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [indexing, setIndexing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success'|'error'|'info', message: string }

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'C2PA Generator Assistant',
    appDescription: '',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false
  });

  // AI Settings
  const [aiSettings, setAiSettings] = useState({
    provider: 'none',
    openwebuiUrl: '',
    aiModel: '',
    temperature: 0.7,
    maxTokens: 500,
    enableRag: true
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 3600,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true,
    enableTwoFactor: false
  });

  // Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    enableChat: true,
    enableDocuments: true,
    enableProgress: true,
    enableGitHubIntegration: false,
    enableAdventure: true,
    enablePhase1: true
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: false,
    enableInAppNotifications: true,
    notifyOnNewUser: true,
    notifyOnErrors: true
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSettings();
      loadGitHubRepos();
    }
  }, [user]);

  const loadGitHubRepos = async () => {
    try {
      const response = await fetch('/api/github/repos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setGithubRepos(data.repositories || []);
      }
    } catch (error) {
      console.error('Error loading GitHub repos:', error);
    }
  };

  const handleAddRepoFromUrl = async () => {
    if (!newRepoUrl) {
      setImportStatus({ type: 'error', message: 'Please enter a GitHub repository URL' });
      return;
    }

    // Validate URL starts with https://github.com or https://www.github.com
    const trimmedUrl = newRepoUrl.trim();
    if (!trimmedUrl.startsWith('https://github.com/') && !trimmedUrl.startsWith('https://www.github.com/')) {
      setImportStatus({
        type: 'error',
        message: 'URL must start with https://github.com/ or https://www.github.com/'
      });
      return;
    }

    // Parse GitHub URL to extract owner and repo
    let owner, repo;

    try {
      setValidating(true);
      setImportStatus({ type: 'info', message: 'Validating repository URL...' });

      const urlPattern = /https:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/\s#?]+)/;
      const urlMatch = trimmedUrl.match(urlPattern);

      if (urlMatch) {
        owner = urlMatch[1];
        repo = urlMatch[2].replace(/\.git$/, ''); // Remove .git suffix if present
      } else {
        setImportStatus({
          type: 'error',
          message: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo'
        });
        setValidating(false);
        return;
      }

      // Check if repository exists via backend
      setImportStatus({ type: 'info', message: `Checking if ${owner}/${repo} exists...` });

      const checkResponse = await fetch(`/api/admin/github/check/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.exists) {
        setImportStatus({
          type: 'error',
          message: `Repository ${owner}/${repo} not found or not accessible. Please check the URL and your GitHub token permissions.`
        });
        setValidating(false);
        return;
      }

      // Repository exists, index it (which also adds it)
      setImportStatus({ type: 'info', message: `Indexing ${owner}/${repo}... This may take a minute.` });
      setIndexing(true);

      const response = await fetch('/api/github/repos/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ owner, repo })
      });

      const data = await response.json();

      if (data.success) {
        setImportStatus({
          type: 'success',
          message: `✓ Repository ${owner}/${repo} indexed successfully! ${data.filesIndexed || 0} files indexed and ready for RAG.`
        });
        setNewRepoUrl('');
        await loadGitHubRepos();

        // Clear success message after 8 seconds
        setTimeout(() => setImportStatus(null), 8000);
      } else {
        setImportStatus({
          type: 'error',
          message: `Failed to index repository: ${data.error || data.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error adding repo:', error);
      setImportStatus({
        type: 'error',
        message: `Failed to add repository: ${error.message}`
      });
    } finally {
      setValidating(false);
      setIndexing(false);
    }
  };

  const handleRemoveRepo = async (repoId, repoName) => {
    if (!confirm(`Remove repository ${repoName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/github/repos/${repoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setImportStatus({
          type: 'success',
          message: `✓ Repository ${repoName} removed successfully!`
        });
        await loadGitHubRepos();
        setTimeout(() => setImportStatus(null), 5000);
      } else {
        setImportStatus({
          type: 'error',
          message: `Failed to remove repository: ${data.error || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error removing repo:', error);
      setImportStatus({
        type: 'error',
        message: `Failed to remove repository: ${error.message}`
      });
    }
  };

  const handleIndexRepo = async (owner, name) => {
    setIndexing(true);
    setImportStatus({ type: 'info', message: `Indexing ${owner}/${name}... This may take a minute.` });

    try {
      const response = await fetch('/api/github/repos/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ owner, repo: name })
      });

      const data = await response.json();

      if (data.success) {
        setImportStatus({
          type: 'success',
          message: `✓ Repository ${owner}/${name} indexed successfully! ${data.filesIndexed || 0} files indexed and ready for RAG.`
        });
        await loadGitHubRepos();

        // Clear success message after 7 seconds
        setTimeout(() => setImportStatus(null), 7000);
      } else {
        setImportStatus({
          type: 'error',
          message: `Failed to index ${owner}/${name}: ${data.error || data.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      console.error('Error indexing repo:', error);
      setImportStatus({
        type: 'error',
        message: `Indexing failed for ${owner}/${name}: ${error.message}`
      });
    } finally {
      setIndexing(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        const settings = data.settings;

        // Parse settings into categories
        setGeneralSettings({
          appName: settings.app_name || 'C2PA Generator Assistant',
          appDescription: settings.app_description || '',
          maintenanceMode: settings.maintenance_mode || false,
          allowRegistration: settings.allow_registration !== false,
          requireEmailVerification: settings.require_email_verification || false
        });

        setAiSettings({
          provider: settings.ai_provider || 'none',
          openwebuiUrl: settings.openwebui_url || '',
          aiModel: settings.ai_model || '',
          temperature: parseFloat(settings.ai_temperature) || 0.7,
          maxTokens: parseInt(settings.ai_max_tokens) || 500,
          enableRag: settings.enable_rag !== false
        });

        setSecuritySettings({
          sessionTimeout: parseInt(settings.session_timeout) || 3600,
          maxLoginAttempts: parseInt(settings.max_login_attempts) || 5,
          passwordMinLength: parseInt(settings.password_min_length) || 8,
          requireStrongPassword: settings.require_strong_password !== false,
          enableTwoFactor: settings.enable_two_factor || false
        });

        setFeatureFlags({
          enableChat: settings.enable_chat !== false,
          enableDocuments: settings.enable_documents !== false,
          enableProgress: settings.enable_progress !== false,
          enableGitHubIntegration: settings.github_configured || false,
          enableAdventure: settings.enable_adventure !== false,
          enablePhase1: settings.enable_phase1 !== false
        });

        setNotificationSettings({
          enableEmailNotifications: settings.enable_email_notifications || false,
          enableInAppNotifications: settings.enable_inapp_notifications !== false,
          notifyOnNewUser: settings.notify_on_new_user !== false,
          notifyOnErrors: settings.notify_on_errors !== false
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (category) => {
    setSaving(true);

    try {
      let settingsToSave = {};

      switch (category) {
        case 'general':
          settingsToSave = {
            app_name: generalSettings.appName,
            app_description: generalSettings.appDescription,
            maintenance_mode: generalSettings.maintenanceMode,
            allow_registration: generalSettings.allowRegistration,
            require_email_verification: generalSettings.requireEmailVerification
          };
          break;
        case 'ai':
          settingsToSave = {
            ai_provider: aiSettings.provider,
            openwebui_url: aiSettings.openwebuiUrl,
            ai_model: aiSettings.aiModel,
            ai_temperature: aiSettings.temperature.toString(),
            ai_max_tokens: aiSettings.maxTokens.toString(),
            enable_rag: aiSettings.enableRag
          };
          break;
        case 'security':
          settingsToSave = {
            session_timeout: securitySettings.sessionTimeout.toString(),
            max_login_attempts: securitySettings.maxLoginAttempts.toString(),
            password_min_length: securitySettings.passwordMinLength.toString(),
            require_strong_password: securitySettings.requireStrongPassword,
            enable_two_factor: securitySettings.enableTwoFactor
          };
          break;
        case 'features':
          settingsToSave = {
            enable_chat: featureFlags.enableChat,
            enable_documents: featureFlags.enableDocuments,
            enable_progress: featureFlags.enableProgress,
            github_configured: featureFlags.enableGitHubIntegration,
            enable_adventure: featureFlags.enableAdventure,
            enable_phase1: featureFlags.enablePhase1
          };
          break;
        case 'notifications':
          settingsToSave = {
            enable_email_notifications: notificationSettings.enableEmailNotifications,
            enable_inapp_notifications: notificationSettings.enableInAppNotifications,
            notify_on_new_user: notificationSettings.notifyOnNewUser,
            notify_on_errors: notificationSettings.notifyOnErrors
          };
          break;
      }

      // Save each setting individually
      for (const [key, value] of Object.entries(settingsToSave)) {
        await fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ value })
        });
      }

      alert(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully!`);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetOnboarding = async () => {
    if (!confirm('Are you sure you want to reset the onboarding wizard? Users will see it again on next login.')) {
      return;
    }

    try {
      const response = await fetch('/api/settings/onboarding/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Onboarding reset successfully!');
      } else {
        alert('Failed to reset onboarding: ' + data.error);
      }
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      alert('Failed to reset onboarding');
    }
  };

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="settings-page">
        <div className="error-box">
          <h2>🚫 Access Denied</h2>
          <p>You must be an administrator to access settings.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="pixel-text">⚙️ Application Settings</h1>
        <p className="subtitle">Configure your C2PA Generator Assistant</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI & Models
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={`tab-button ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Features
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <h2>🏠 General Settings</h2>
            <p className="section-description">Basic application configuration</p>

            <div className="form-group">
              <label>Application Name</label>
              <input
                type="text"
                value={generalSettings.appName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
              />
              <small>Displayed in the header and page titles</small>
            </div>

            <div className="form-group">
              <label>Application Description</label>
              <textarea
                value={generalSettings.appDescription}
                onChange={(e) => setGeneralSettings({ ...generalSettings, appDescription: e.target.value })}
                rows="3"
              />
              <small>Brief description of your application</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={generalSettings.maintenanceMode}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                />
                Maintenance Mode
              </label>
              <small>When enabled, only admins can access the application</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={generalSettings.allowRegistration}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, allowRegistration: e.target.checked })}
                />
                Allow User Registration
              </label>
              <small>Allow new users to register accounts</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={generalSettings.requireEmailVerification}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, requireEmailVerification: e.target.checked })}
                />
                Require Email Verification
              </label>
              <small>Users must verify their email before accessing the app</small>
            </div>

            <button
              onClick={() => saveSettings('general')}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save General Settings'}
            </button>
          </div>
        )}

        {/* AI Settings */}
        {activeTab === 'ai' && (
          <div className="settings-section">
            <h2>🤖 AI & Model Settings</h2>
            <p className="section-description">Configure AI behavior and parameters</p>

            <div className="form-group">
              <label>AI Provider</label>
              <select
                value={aiSettings.provider}
                onChange={(e) => setAiSettings({ ...aiSettings, provider: e.target.value })}
              >
                <option value="none">None (Fallback Mode)</option>
                <option value="openwebui">OpenWebUI (Local)</option>
                <option value="openai">OpenAI API</option>
              </select>
              <small>For detailed AI configuration, use the Admin Panel</small>
            </div>

            <div className="form-group">
              <label>Default AI Model</label>
              <input
                type="text"
                value={aiSettings.aiModel}
                onChange={(e) => setAiSettings({ ...aiSettings, aiModel: e.target.value })}
                placeholder="gpt-4, llama2, etc."
              />
              <small>Leave blank to use provider default</small>
            </div>

            <div className="form-group">
              <label>Temperature: {aiSettings.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={aiSettings.temperature}
                onChange={(e) => setAiSettings({ ...aiSettings, temperature: parseFloat(e.target.value) })}
              />
              <small>Lower = more focused, Higher = more creative (0.0 - 1.0)</small>
            </div>

            <div className="form-group">
              <label>Max Tokens</label>
              <input
                type="number"
                value={aiSettings.maxTokens}
                onChange={(e) => setAiSettings({ ...aiSettings, maxTokens: parseInt(e.target.value) })}
                min="100"
                max="4000"
              />
              <small>Maximum length of AI responses (100-4000)</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={aiSettings.enableRag}
                  onChange={(e) => setAiSettings({ ...aiSettings, enableRag: e.target.checked })}
                />
                Enable RAG (Retrieval-Augmented Generation)
              </label>
              <small>Enhance AI responses with document context</small>
            </div>

            <button
              onClick={() => saveSettings('ai')}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save AI Settings'}
            </button>

            {/* GitHub Repositories for RAG */}
            {user?.role === 'admin' && aiSettings.enableRag && (
              <div className="rag-repos-section">
                <h3>📚 GitHub Repositories for RAG</h3>
                <p className="section-description">
                  Add GitHub repositories to enhance AI responses with code examples and documentation.
                  Paste a GitHub repository URL below.
                </p>

                <div className="form-group">
                  <label>Repository URL</label>
                  <div className="repo-url-input">
                    <input
                      type="text"
                      value={newRepoUrl}
                      onChange={(e) => {
                        setNewRepoUrl(e.target.value);
                        setImportStatus(null); // Clear status when typing
                      }}
                      placeholder="https://github.com/contentauth/c2pa-js"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !validating) {
                          handleAddRepoFromUrl();
                        }
                      }}
                      disabled={validating}
                    />
                    <button
                      onClick={handleAddRepoFromUrl}
                      className="btn-secondary"
                      disabled={validating || !newRepoUrl.trim()}
                    >
                      {validating ? 'Validating...' : 'Add Repository'}
                    </button>
                  </div>
                  <small>Must start with https://github.com/ or https://www.github.com/</small>
                </div>

                {/* Import Status Messages */}
                {importStatus && (
                  <div className={`import-status ${importStatus.type}`}>
                    {importStatus.type === 'info' && <span className="status-icon">⏳</span>}
                    {importStatus.type === 'success' && <span className="status-icon">✓</span>}
                    {importStatus.type === 'error' && <span className="status-icon">✗</span>}
                    <span className="status-message">{importStatus.message}</span>
                  </div>
                )}

                {githubRepos.length > 0 && (
                  <div className="repos-list">
                    <h4>Configured Repositories:</h4>
                    {githubRepos.map((repo) => (
                      <div key={repo.id} className="repo-item">
                        <div className="repo-info">
                          <strong>
                            <a
                              href={repo.url || `https://github.com/${repo.owner}/${repo.name}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {repo.owner}/{repo.name}
                            </a>
                          </strong>
                          {repo.fileCount > 0 ? (
                            <span className="status-badge indexed">
                              ✓ Indexed ({repo.fileCount || 0} files)
                            </span>
                          ) : (
                            <span className="status-badge pending">
                              ⚠ Not indexed
                            </span>
                          )}
                        </div>
                        <div className="repo-actions">
                          <button
                            onClick={() => handleIndexRepo(repo.owner, repo.name)}
                            disabled={indexing}
                            className="btn-secondary btn-sm"
                          >
                            {indexing ? 'Indexing...' : (repo.fileCount > 0 ? 'Re-index' : 'Index Now')}
                          </button>
                          <button
                            onClick={() => handleRemoveRepo(repo.id, `${repo.owner}/${repo.name}`)}
                            className="btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {githubRepos.length === 0 && (
                  <div className="empty-repos">
                    <p>No repositories configured yet. Add a repository above to enable RAG features.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-section">
            <h2>🔒 Security Settings</h2>
            <p className="section-description">Configure authentication and security policies</p>

            <div className="form-group">
              <label>Session Timeout (seconds)</label>
              <input
                type="number"
                value={securitySettings.sessionTimeout}
                onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                min="300"
                max="86400"
              />
              <small>User sessions expire after this period of inactivity (300-86400)</small>
            </div>

            <div className="form-group">
              <label>Max Login Attempts</label>
              <input
                type="number"
                value={securitySettings.maxLoginAttempts}
                onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                min="3"
                max="10"
              />
              <small>Account locked after this many failed login attempts (3-10)</small>
            </div>

            <div className="form-group">
              <label>Minimum Password Length</label>
              <input
                type="number"
                value={securitySettings.passwordMinLength}
                onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                min="8"
                max="32"
              />
              <small>Minimum characters required for passwords (8-32)</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={securitySettings.requireStrongPassword}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, requireStrongPassword: e.target.checked })}
                />
                Require Strong Passwords
              </label>
              <small>Enforce uppercase, lowercase, numbers, and special characters</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={securitySettings.enableTwoFactor}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, enableTwoFactor: e.target.checked })}
                />
                Enable Two-Factor Authentication
              </label>
              <small>Require 2FA for all admin accounts (coming soon)</small>
            </div>

            <button
              onClick={() => saveSettings('security')}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Security Settings'}
            </button>
          </div>
        )}

        {/* Feature Flags */}
        {activeTab === 'features' && (
          <div className="settings-section">
            <h2>🎮 Feature Flags</h2>
            <p className="section-description">Enable or disable application features</p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-header">
                  <h3>💬 Chat Interface</h3>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={featureFlags.enableChat}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, enableChat: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>AI-powered chat assistant for C2PA guidance</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <h3>📄 Documents</h3>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={featureFlags.enableDocuments}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, enableDocuments: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Document upload and management features</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <h3>📊 Progress Tracking</h3>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={featureFlags.enableProgress}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, enableProgress: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Certification progress dashboard</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <h3>🐙 GitHub Integration</h3>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={featureFlags.enableGitHubIntegration}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, enableGitHubIntegration: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Code search and RAG features</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <h3>🎯 Adventure Mode</h3>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={featureFlags.enableAdventure}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, enableAdventure: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Gamified certification experience</p>
              </div>

              <div className="feature-card">
                <div className="feature-header">
                  <h3>1️⃣ Phase 1 Module</h3>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={featureFlags.enablePhase1}
                      onChange={(e) => setFeatureFlags({ ...featureFlags, enablePhase1: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <p>Introduction & Prerequisites phase</p>
              </div>
            </div>

            <button
              onClick={() => saveSettings('features')}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Feature Flags'}
            </button>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>🔔 Notification Settings</h2>
            <p className="section-description">Configure notification preferences</p>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableEmailNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, enableEmailNotifications: e.target.checked })}
                />
                Enable Email Notifications
              </label>
              <small>Send notifications via email (requires email configuration)</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableInAppNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, enableInAppNotifications: e.target.checked })}
                />
                Enable In-App Notifications
              </label>
              <small>Show notifications within the application</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.notifyOnNewUser}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnNewUser: e.target.checked })}
                />
                Notify on New User Registration
              </label>
              <small>Admins receive notifications when new users register</small>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={notificationSettings.notifyOnErrors}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnErrors: e.target.checked })}
                />
                Notify on System Errors
              </label>
              <small>Admins receive notifications about critical errors</small>
            </div>

            <button
              onClick={() => saveSettings('notifications')}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        )}

        {/* Advanced */}
        {activeTab === 'advanced' && (
          <div className="settings-section">
            <h2>⚡ Advanced Settings</h2>
            <p className="section-description">Advanced configuration and maintenance tasks</p>

            <div className="advanced-actions">
              <div className="action-card">
                <h3>🔄 Reset Onboarding</h3>
                <p>Reset the onboarding wizard for all users. They will see the setup wizard again on next login.</p>
                <button
                  onClick={resetOnboarding}
                  className="btn-secondary"
                >
                  Reset Onboarding
                </button>
              </div>

              <div className="action-card">
                <h3>🗑️ Clear Cache</h3>
                <p>Clear application cache and temporary data. This may improve performance.</p>
                <button
                  onClick={() => alert('Cache clearing not yet implemented')}
                  className="btn-secondary"
                  disabled
                >
                  Clear Cache (Coming Soon)
                </button>
              </div>

              <div className="action-card">
                <h3>📊 Export Settings</h3>
                <p>Export current settings as JSON for backup or migration purposes.</p>
                <button
                  onClick={() => alert('Settings export not yet implemented')}
                  className="btn-secondary"
                  disabled
                >
                  Export Settings (Coming Soon)
                </button>
              </div>

              <div className="action-card danger">
                <h3>⚠️ Reset All Settings</h3>
                <p>Reset all settings to default values. This cannot be undone!</p>
                <button
                  onClick={() => alert('This feature requires additional confirmation')}
                  className="btn-danger"
                  disabled
                >
                  Reset to Defaults (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
