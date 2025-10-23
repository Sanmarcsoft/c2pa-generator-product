# GitHub Token Management Refactor - Implementation Plan

## Summary

Remove the "Enable GitHub Integration" checkbox and replace with a simplified token management system where:
- Admins can set a single system-level GitHub token
- Token is masked in UI (shows only preview)
- To change token, admin must first delete the existing one
- Token-only approach (no enable/disable checkbox)

## Backend Implementation (COMPLETED ✅)

### New API Endpoints

1. **GET /api/admin/github/token**
   - Returns: `{ success, hasToken, tokenPreview? }`
   - tokenPreview format: `ghp_...cdef` (first 4 + last 4 chars)
   - Never returns full token

2. **POST /api/admin/github/token**
   - Body: `{ token }`
   - Validates token format (ghp_ or github_pat_ prefix)
   - Validates with GitHub API
   - Returns 409 if token already exists
   - Saves to `app_settings` table with key `github_token`

3. **DELETE /api/admin/github/token**
   - Deletes token from database
   - Updates `github_configured` flag to false
   - Returns 404 if no token exists

### Updated Endpoints

**GET /api/admin/config**
- Now returns `hasGithubToken` flag in config
- Never exposes actual token value
- Removes `github_token` from response if present

## Frontend Implementation (IN PROGRESS)

### State Changes

```javascript
// Remove
const [config, setConfig] = useState({
  githubConfigured: false,
  githubToken: ''
});

// Add
const [githubToken, setGithubToken] = useState({
  hasToken: false,
  tokenPreview: '',
  newToken: ''
});
```

### New Functions

```javascript
// Load token status
const loadGitHubToken = async () => {
  const response = await fetch('/api/admin/github/token', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  setGithubToken({
    hasToken: data.hasToken,
    tokenPreview: data.tokenPreview || '',
    newToken: ''
  });
};

// Set new token
const handleSetToken = async () => {
  if (!githubToken.newToken) {
    showNotification('Please enter a token', 'error');
    return;
  }

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
      setGithubToken({ ...githubToken, newToken: '' });
      await loadGitHubToken();
      await loadGitHubRepos();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Failed to set token', 'error');
  }
};

// Delete token
const handleDeleteToken = async () => {
  if (!confirm('Are you sure you want to delete the GitHub token? This will disable GitHub RAG features.')) {
    return;
  }

  try {
    const response = await fetch('/api/admin/github/token', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.success) {
      showNotification('GitHub token deleted successfully', 'success');
      await loadGitHubToken();
      await loadGitHubRepos();
    } else {
      showNotification(data.error, 'error');
    }
  } catch (error) {
    showNotification('Failed to delete token', 'error');
  }
};
```

### UI Changes

**Replace this section (lines 690-742):**

```jsx
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
      // ... token input
    </div>
  )}

  <button onClick={handleSaveGitHub}>
    Save GitHub Configuration
  </button>
</div>
```

**With:**

```jsx
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
            className="btn-danger btn-small"
          >
            DELETE TOKEN
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
        disabled={!githubToken.newToken}
        className="btn-primary"
      >
        SET GITHUB TOKEN
      </button>
    </>
  )}
</div>

{/* GitHub RAG Repository Management */}
{githubToken.hasToken && (
  <div className="github-repos-section">
    {/* Repository management UI - unchanged */}
  </div>
)}
```

### CSS Changes (AdminPage.css)

Add these styles:

```css
.token-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid rgba(0, 255, 255, 0.3);
  border-radius: 4px;
}

.token-preview {
  flex: 1;
  font-family: 'Courier New', monospace;
  color: var(--cyan);
  font-size: 0.9rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.btn-danger.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}
```

## Testing Checklist

### Backend Tests (TDD)
- [x] GET /api/admin/github/token - 401 for unauthenticated
- [x] GET /api/admin/github/token - 403 for non-admin
- [x] GET /api/admin/github/token - returns hasToken=false when no token
- [x] GET /api/admin/github/token - returns tokenPreview when token exists
- [x] POST /api/admin/github/token - sets new token when none exists
- [x] POST /api/admin/github/token - returns 409 when token exists
- [x] POST /api/admin/github/token - validates token format
- [x] POST /api/admin/github/token - validates with GitHub API
- [x] DELETE /api/admin/github/token - deletes existing token
- [x] DELETE /api/admin/github/token - returns 404 when no token
- [x] Token never exposed in any response
- [x] Config endpoint includes hasGithubToken flag

### Frontend Manual Tests
- [ ] Admin page loads without errors
- [ ] When no token: shows input field and "SET GITHUB TOKEN" button
- [ ] Setting valid token shows success notification
- [ ] After setting token: shows token preview and DELETE button
- [ ] Token preview is masked (ghp_...xxxx format)
- [ ] Delete button shows confirmation dialog
- [ ] After deleting token: UI returns to "set token" state
- [ ] Attempting to set invalid format shows error
- [ ] Attempting to set while token exists shows error with clear message
- [ ] Repository management section only visible when token exists
- [ ] Non-admin users cannot access token management endpoints

### Integration Tests
- [ ] Setting token enables GitHub RAG features
- [ ] Deleting token disables GitHub RAG features
- [ ] Token persists across container restarts
- [ ] Multiple admins can view token status but not the actual token
- [ ] Token validation with GitHub API works correctly

## Migration Notes

### Backwards Compatibility
- Old `github_configured` flag is maintained for backwards compatibility
- Automatically set to `true` when token is set
- Automatically set to `false` when token is deleted
- Old PUT /api/admin/config/github endpoint still works but deprecated

### Data Migration
No migration needed. Existing tokens (if any) stored via old method should work.
New tokens stored in `app_settings` table with key `github_token` and type `secret`.

## Rollout Plan

1. ✅ Write TDD tests
2. ✅ Implement backend API endpoints
3. 🔄 Update frontend UI (IN PROGRESS)
4. ⏳ Test functionality
5. ⏳ Update documentation
6. ⏳ Commit changes
7. ⏳ Deploy and verify

## Security Considerations

1. ✅ Token never exposed in API responses (only preview)
2. ✅ Token validation with GitHub API before saving
3. ✅ Admin-only access enforced
4. ✅ Token stored in database with type='secret'
5. ✅ Environment variable updated for runtime use
6. ✅ Delete-first-to-change prevents accidental overwrites
