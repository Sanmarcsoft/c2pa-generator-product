import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AdminPage.css';

const AdminPage = () => {
  const { user, token } = useAuth();
  const [config, setConfig] = useState({
    aiProvider: 'none',
    openwebuiUrl: '',
    aiModel: '',
    openaiApiKey: '',
    openwebuiApiKey: '',
    githubToken: '',
    githubConfigured: false
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [secrets, setSecrets] = useState({});
  const [showSecrets, setShowSecrets] = useState({
    openaiApiKey: false,
    openwebuiApiKey: false,
    githubToken: false
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadConfig();
      loadStats();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setConfig({
          aiProvider: data.settings.ai_provider || 'none',
          openwebuiUrl: data.settings.openwebui_url || '',
          aiModel: data.settings.ai_model || '',
          openaiApiKey: '',
          openwebuiApiKey: '',
          githubToken: '',
          githubConfigured: data.settings.github_configured || false
        });
        setSecrets(data.secrets);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveAI = async () => {
    setSaving(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/config/ai', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: config.aiProvider,
          openwebuiUrl: config.openwebuiUrl,
          aiModel: config.aiModel,
          openaiApiKey: config.openaiApiKey || undefined,
          openwebuiApiKey: config.openwebuiApiKey || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('AI configuration saved successfully!' +
          (data.requiresRestart ? '\n\nNote: Server restart may be required for secrets to take effect.' : ''));

        // Clear password fields
        setConfig({
          ...config,
          openaiApiKey: '',
          openwebuiApiKey: ''
        });

        // Reload config
        await loadConfig();
      } else {
        alert('Failed to save AI configuration: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      alert('Failed to save AI configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGitHub = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/admin/config/github', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token: config.githubToken || undefined,
          configured: config.githubConfigured
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('GitHub configuration saved successfully!');

        // Clear token field
        setConfig({
          ...config,
          githubToken: ''
        });

        // Reload config
        await loadConfig();
      } else {
        alert('Failed to save GitHub configuration: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving GitHub config:', error);
      alert('Failed to save GitHub configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAI = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/config/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: config.aiProvider,
          openwebuiUrl: config.openwebuiUrl,
          openaiApiKey: config.openaiApiKey || undefined
        })
      });

      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Error testing AI:', error);
      setTestResult({
        success: false,
        message: 'Test failed: ' + error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets({
      ...showSecrets,
      [field]: !showSecrets[field]
    });
  };

  // Redirect if not admin
  if (user && user.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="error-box">
          <h2>🚫 Access Denied</h2>
          <p>You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="pixel-text">⚙️ Admin Control Panel</h1>
        <p className="subtitle">Configure AI providers, GitHub integration, and system settings</p>
      </div>

      {/* System Statistics */}
      {stats && (
        <div className="admin-section">
          <h2>📊 System Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats.users.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Admin Users</div>
              <div className="stat-value">{stats.users.admins}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">AI Provider</div>
              <div className="stat-value">{stats.system.aiProvider}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Onboarding</div>
              <div className="stat-value">{stats.system.onboardingCompleted ? '✓' : '✗'}</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Configuration */}
      <div className="admin-section">
        <h2>🤖 AI Provider Configuration</h2>

        <div className="form-group">
          <label>AI Provider</label>
          <select
            value={config.aiProvider}
            onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
          >
            <option value="none">None (Fallback Mode)</option>
            <option value="openwebui">OpenWebUI (Local)</option>
            <option value="openai">OpenAI API (Cloud)</option>
          </select>
        </div>

        {config.aiProvider === 'openwebui' && (
          <>
            <div className="form-group">
              <label>OpenWebUI API URL</label>
              <input
                type="text"
                value={config.openwebuiUrl}
                onChange={(e) => setConfig({ ...config, openwebuiUrl: e.target.value })}
                placeholder="http://localhost:3000/api"
              />
              <small>Example: http://localhost:3000/api or http://host.docker.internal:3000/api</small>
            </div>

            <div className="form-group">
              <label>OpenWebUI API Key (Optional)</label>
              <div className="secret-input">
                <input
                  type={showSecrets.openwebuiApiKey ? "text" : "password"}
                  value={config.openwebuiApiKey}
                  onChange={(e) => setConfig({ ...config, openwebuiApiKey: e.target.value })}
                  placeholder={secrets.hasOpenWebUIKey ? "••••••••••••" : "Leave blank if not required"}
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('openwebuiApiKey')}
                  className="toggle-visibility"
                >
                  {showSecrets.openwebuiApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              {secrets.hasOpenWebUIKey && (
                <small className="text-success">✓ API key configured</small>
              )}
            </div>
          </>
        )}

        {config.aiProvider === 'openai' && (
          <div className="form-group">
            <label>OpenAI API Key</label>
            <div className="secret-input">
              <input
                type={showSecrets.openaiApiKey ? "text" : "password"}
                value={config.openaiApiKey}
                onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                placeholder={secrets.hasOpenAIKey ? "••••••••••••" : "sk-..."}
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('openaiApiKey')}
                className="toggle-visibility"
              >
                {showSecrets.openaiApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            {secrets.hasOpenAIKey && (
              <small className="text-success">✓ API key configured</small>
            )}
          </div>
        )}

        {config.aiProvider !== 'none' && (
          <div className="form-group">
            <label>AI Model (Optional)</label>
            <input
              type="text"
              value={config.aiModel}
              onChange={(e) => setConfig({ ...config, aiModel: e.target.value })}
              placeholder="gpt-4, gpt-3.5-turbo, llama2, etc."
            />
            <small>Leave blank to use default model for your provider</small>
          </div>
        )}

        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <strong>{testResult.success ? '✓' : '✗'}</strong> {testResult.message}
            {testResult.models && testResult.models.length > 0 && (
              <div className="models-list">
                <small>Available models: {testResult.models.join(', ')}</small>
              </div>
            )}
          </div>
        )}

        <div className="button-group">
          <button
            onClick={handleTestAI}
            disabled={testing || config.aiProvider === 'none'}
            className="btn-secondary"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={handleSaveAI}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save AI Configuration'}
          </button>
        </div>
      </div>

      {/* GitHub Configuration */}
      <div className="admin-section">
        <h2>🐙 GitHub Integration</h2>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={config.githubConfigured}
              onChange={(e) => setConfig({ ...config, githubConfigured: e.target.checked })}
            />
            {' '}Enable GitHub Integration
          </label>
        </div>

        {config.githubConfigured && (
          <div className="form-group">
            <label>GitHub Personal Access Token</label>
            <div className="secret-input">
              <input
                type={showSecrets.githubToken ? "text" : "password"}
                value={config.githubToken}
                onChange={(e) => setConfig({ ...config, githubToken: e.target.value })}
                placeholder={secrets.hasGitHubToken ? "••••••••••••" : "ghp_..."}
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('githubToken')}
                className="toggle-visibility"
              >
                {showSecrets.githubToken ? '🙈' : '👁️'}
              </button>
            </div>
            {secrets.hasGitHubToken && (
              <small className="text-success">✓ Token configured</small>
            )}
            <small>
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                Create a token
              </a>{' '}
              with 'repo' or 'public_repo' scope
            </small>
          </div>
        )}

        <button
          onClick={handleSaveGitHub}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save GitHub Configuration'}
        </button>

        {/* Repository Management Link */}
        {config.githubConfigured && secrets.hasGitHubToken && (
          <div className="info-box" style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(0, 255, 255, 0.05)', border: '2px solid var(--cyan)', borderRadius: '4px' }}>
            <h3 style={{ marginTop: 0 }}>📚 GitHub Repositories for RAG</h3>
            <p>
              To add and manage GitHub repositories for Retrieval-Augmented Generation,
              please use the repository management interface in the Settings page.
            </p>
            <a href="/settings" className="btn-secondary" style={{ display: 'inline-block', marginTop: '1rem' }}>
              Go to Settings → AI & Models
            </a>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="admin-section help-section">
        <h2>📚 Configuration Help</h2>
        <div className="help-content">
          <h3>AI Provider Options:</h3>
          <ul>
            <li><strong>OpenWebUI:</strong> Run AI models locally using Ollama or other backends. Free and private.</li>
            <li><strong>OpenAI API:</strong> Cloud-based AI from OpenAI. Requires API key and usage costs apply.</li>
            <li><strong>Fallback Mode:</strong> Rule-based responses without AI. Good for testing or limited functionality.</li>
          </ul>

          <h3>GitHub Integration:</h3>
          <ul>
            <li>Enables code search directly from the chat interface</li>
            <li>Provides context-aware responses using your codebase</li>
            <li>Requires a GitHub Personal Access Token with repo access</li>
          </ul>

          <h3>Need Help?</h3>
          <p>
            See the <a href="https://docs.openwebui.com/" target="_blank" rel="noopener noreferrer">OpenWebUI docs</a> or
            check <code>ADMIN_SETUP.md</code> in the project root.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
