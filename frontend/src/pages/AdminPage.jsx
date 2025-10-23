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
    openwebuiApiKey: ''
  });
  const [githubToken, setGithubToken] = useState({
    hasToken: false,
    tokenPreview: '',
    newToken: ''
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
  const [notification, setNotification] = useState(null);
  const [githubRepos, setGithubRepos] = useState([]);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [indexing, setIndexing] = useState(false);
  const [validating, setValidating] = useState(false);

  // User Management state
  const [users, setUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [userModalLoading, setUserModalLoading] = useState(false);

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadConfig();
      loadStats();
      loadGitHubToken();
      loadGitHubRepos();
      loadUsers();
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
          aiProvider: data.config.ai_provider || 'none',
          openwebuiUrl: data.config.openwebui_url || '',
          aiModel: data.config.ai_model || '',
          openaiApiKey: '',
          openwebuiApiKey: ''
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

  // GitHub Token Management functions
  const loadGitHubToken = async () => {
    try {
      const response = await fetch('/api/admin/github/token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setGithubToken({
          hasToken: data.hasToken || false,
          tokenPreview: data.tokenPreview || '',
          newToken: ''
        });
      }
    } catch (error) {
      console.error('Error loading GitHub token:', error);
    }
  };

  const handleSetToken = async () => {
    if (!githubToken.newToken || githubToken.newToken.trim().length === 0) {
      showNotification('Please enter a GitHub token', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/github/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: githubToken.newToken })
      });

      const data = await response.json();

      if (data.success) {
        showNotification('GitHub token set successfully!', 'success');
        setGithubToken({ hasToken: false, tokenPreview: '', newToken: '' });
        await loadGitHubToken();
        await loadGitHubRepos();
      } else {
        showNotification(data.error || 'Failed to set token', 'error');
      }
    } catch (error) {
      console.error('Error setting GitHub token:', error);
      showNotification('Failed to set GitHub token', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteToken = async () => {
    if (!confirm('Are you sure you want to delete the GitHub token? This will disable GitHub RAG features.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/github/token', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('GitHub token deleted successfully', 'success');
        await loadGitHubToken();
        await loadGitHubRepos();
      } else {
        showNotification(data.error || 'Failed to delete token', 'error');
      }
    } catch (error) {
      console.error('Error deleting GitHub token:', error);
      showNotification('Failed to delete GitHub token', 'error');
    } finally {
      setSaving(false);
    }
  };

  // User Management functions
  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleOpenUserModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setUserForm({
        email: userToEdit.email,
        password: '',
        name: userToEdit.name || '',
        role: userToEdit.role
      });
    } else {
      setEditingUser(null);
      setUserForm({
        email: '',
        password: '',
        name: '',
        role: 'user'
      });
    }
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({
      email: '',
      password: '',
      name: '',
      role: 'user'
    });
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserModalLoading(true);

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users';

      const method = editingUser ? 'PUT' : 'POST';

      const body = {
        email: userForm.email,
        name: userForm.name,
        role: userForm.role
      };

      // Only include password if it's set (required for new users, optional for updates)
      if (userForm.password) {
        body.password = userForm.password;
      } else if (!editingUser) {
        showNotification('Password is required for new users', 'error');
        setUserModalLoading(false);
        return;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        showNotification(
          editingUser ? 'User updated successfully!' : 'User created successfully!',
          'success'
        );
        handleCloseUserModal();
        await loadUsers();
        await loadStats(); // Reload stats to update user count
      } else {
        showNotification('Failed to save user: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showNotification('Failed to save user', 'error');
    } finally {
      setUserModalLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('User deleted successfully!', 'success');
        await loadUsers();
        await loadStats(); // Reload stats to update user count
      } else {
        showNotification('Failed to delete user: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Failed to delete user', 'error');
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
        showNotification(
          'AI configuration saved successfully!' +
          (data.requiresRestart ? ' Note: Server restart may be required for secrets to take effect.' : ''),
          'success'
        );

        // Clear password fields
        setConfig({
          ...config,
          openaiApiKey: '',
          openwebuiApiKey: ''
        });

        // Reload config
        await loadConfig();
      } else {
        showNotification('Failed to save AI configuration: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Error saving AI config:', error);
      showNotification('Failed to save AI configuration', 'error');
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

  const handleAddRepoFromUrl = async () => {
    if (!newRepoUrl) {
      showNotification('Please enter a GitHub repository URL', 'error');
      return;
    }

    const trimmedUrl = newRepoUrl.trim();
    if (!trimmedUrl.startsWith('https://github.com/') && !trimmedUrl.startsWith('https://www.github.com/')) {
      showNotification('URL must start with https://github.com/ or https://www.github.com/', 'error');
      return;
    }

    let owner, repo;

    try {
      setValidating(true);

      const urlPattern = /https:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/\s#?]+)/;
      const urlMatch = trimmedUrl.match(urlPattern);

      if (urlMatch) {
        owner = urlMatch[1];
        repo = urlMatch[2].replace(/\.git$/, '');
      } else {
        showNotification('Invalid GitHub URL format. Expected: https://github.com/owner/repo', 'error');
        setValidating(false);
        return;
      }

      const checkResponse = await fetch(`/api/admin/github/check/${owner}/${repo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const checkData = await checkResponse.json();

      if (!checkData.success || !checkData.exists) {
        showNotification(`Repository ${owner}/${repo} not found or not accessible. Please check the URL and your GitHub token permissions.`, 'error');
        setValidating(false);
        return;
      }

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
        showNotification(`✓ Repository ${owner}/${repo} indexed successfully! ${data.filesIndexed || 0} files indexed and ready for RAG.`, 'success');
        setNewRepoUrl('');
        await loadGitHubRepos();
      } else {
        showNotification(`Failed to index repository: ${data.error || data.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error adding repo:', error);
      showNotification(`Failed to add repository: ${error.message}`, 'error');
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
        showNotification(`✓ Repository ${repoName} removed successfully!`, 'success');
        await loadGitHubRepos();
      } else {
        showNotification(`Failed to remove repository: ${data.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error removing repo:', error);
      showNotification(`Failed to remove repository: ${error.message}`, 'error');
    }
  };

  const handleIndexRepo = async (owner, name) => {
    setIndexing(true);

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
        showNotification(`✓ Repository ${owner}/${name} indexed successfully! ${data.filesIndexed || 0} files indexed and ready for RAG.`, 'success');
        await loadGitHubRepos();
      } else {
        showNotification(`Failed to index ${owner}/${name}: ${data.error || data.message || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error indexing repo:', error);
      showNotification(`Indexing failed for ${owner}/${name}: ${error.message}`, 'error');
    } finally {
      setIndexing(false);
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
      {/* Toast Notification */}
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          <span>{notification.type === 'success' ? '✓' : '✗'}</span>
          {notification.message}
        </div>
      )}

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

      {/* GitHub Token Management */}
      <div className="admin-section">
        <h2>🐙 GitHub Integration</h2>
        <p className="section-description">
          Configure a GitHub Personal Access Token to enable RAG (Retrieval-Augmented Generation)
          features with your repositories.
        </p>

        {githubToken.hasToken ? (
          <>
            {/* Token Exists - Show Preview and Delete */}
            <div className="form-group">
              <label>Current GitHub Token</label>
              <div className="token-display">
                <code className="token-preview">{githubToken.tokenPreview}</code>
                <button
                  onClick={handleDeleteToken}
                  disabled={saving}
                  className="btn-danger btn-small"
                >
                  {saving ? 'DELETING...' : 'DELETE TOKEN'}
                </button>
              </div>
              <small>To change the token, you must first delete the existing one.</small>
            </div>
          </>
        ) : (
          <>
            {/* No Token - Show Input to Set New Token */}
            <div className="form-group">
              <label>GitHub Personal Access Token</label>
              <div className="secret-input">
                <input
                  type={showSecrets.githubToken ? "text" : "password"}
                  value={githubToken.newToken}
                  onChange={(e) => setGithubToken({ ...githubToken, newToken: e.target.value })}
                  placeholder="ghp_... or github_pat_..."
                  disabled={saving}
                />
                <button
                  type="button"
                  onClick={() => toggleSecretVisibility('githubToken')}
                  className="toggle-visibility"
                >
                  {showSecrets.githubToken ? '🙈' : '👁️'}
                </button>
              </div>
              <small>
                <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
                  Create a token
                </a>{' '}
                with 'repo' or 'public_repo' scope
              </small>
            </div>

            <button
              onClick={handleSetToken}
              disabled={!githubToken.newToken || saving}
              className="btn-primary"
            >
              {saving ? 'SETTING TOKEN...' : 'SET GITHUB TOKEN'}
            </button>
          </>
        )}
      </div>

      {/* GitHub RAG Repository Management */}
      <div className="admin-section">
        <div className="github-repos-section">
            <h3>📚 GitHub Repositories for RAG</h3>
            <p className="section-description">
              Add GitHub repositories to enhance AI responses with code examples and documentation. Paste a GitHub repository URL below.
            </p>

            <div className="add-repo-form">
              <label>Repository URL</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="text"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  placeholder="https://github.com/contentauth/c2pa-js"
                  disabled={validating || indexing}
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleAddRepoFromUrl}
                  disabled={!newRepoUrl || validating || indexing}
                  className="btn-primary"
                >
                  {validating ? 'VALIDATING...' : indexing ? 'INDEXING...' : 'ADD REPOSITORY'}
                </button>
              </div>
              <small>Must start with https://github.com/ or https://www.github.com/</small>
            </div>

            {githubRepos.length > 0 ? (
              <div>
                <h4>Configured Repositories:</h4>
                <div className="repos-list">
                  {githubRepos.map(repo => (
                    <div key={repo.id} className="repo-card">
                      <div className="repo-info">
                        <strong>
                          <a href={repo.url} target="_blank" rel="noopener noreferrer">
                            {repo.owner}/{repo.name}
                          </a>
                          <span className="repo-status indexed">
                            ✓ Indexed ({repo.fileCount || 0} files)
                          </span>
                        </strong>
                        {repo.description && (
                          <p className="repo-description">{repo.description}</p>
                        )}
                        {repo.indexedAt && (
                          <span className="last-indexed">
                            Last indexed: {new Date(repo.indexedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="repo-actions">
                        <button
                          onClick={() => handleIndexRepo(repo.owner, repo.name)}
                          disabled={indexing}
                          className="btn-secondary btn-small"
                        >
                          RE-INDEX
                        </button>
                        <button
                          onClick={() => handleRemoveRepo(repo.id, `${repo.owner}/${repo.name}`)}
                          className="btn-danger btn-small"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                No repositories configured yet. Add a repository above to enable RAG features.
              </div>
            )}
        </div>
      </div>

      {/* User Management Section */}
      <div className="admin-section">
        <h2>👥 User Management</h2>
        <p className="section-description">
          Manage user accounts, roles, and permissions. Create new users or modify existing accounts.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => handleOpenUserModal()} className="btn-primary">
            + CREATE NEW USER
          </button>
        </div>

        {users.length > 0 ? (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name || '-'}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td className="actions-cell">
                      <button
                        onClick={() => handleOpenUserModal(u)}
                        className="btn-secondary btn-small"
                        title="Edit user"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.email)}
                        className="btn-danger btn-small"
                        disabled={u.id === user.id}
                        title={u.id === user.id ? "Can't delete yourself" : "Delete user"}
                      >
                        DELETE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No users found. This shouldn't happen - at least one admin should exist.
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal-overlay" onClick={handleCloseUserModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                  disabled={userModalLoading}
                />
              </div>

              <div className="form-group">
                <label>Name (Optional)</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  disabled={userModalLoading}
                />
              </div>

              <div className="form-group">
                <label>Password {editingUser ? '(Leave blank to keep current)' : '*'}</label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  required={!editingUser}
                  disabled={userModalLoading}
                  minLength={8}
                />
                <small>Password must be at least 8 characters long</small>
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  disabled={userModalLoading || (editingUser && editingUser.id === user.id)}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {editingUser && editingUser.id === user.id && (
                  <small>You cannot change your own role</small>
                )}
              </div>

              <div className="button-group">
                <button type="submit" className="btn-primary" disabled={userModalLoading}>
                  {userModalLoading ? 'SAVING...' : 'SAVE USER'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseUserModal}
                  className="btn-secondary"
                  disabled={userModalLoading}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
