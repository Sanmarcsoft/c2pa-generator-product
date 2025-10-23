# GitHub Repository URL Validation

## Overview

The GitHub repository management interface includes strict URL validation, existence checking, and visual feedback to ensure reliable repository indexing for RAG (Retrieval-Augmented Generation).

## Features

- **Strict URL Format:** Only accepts `https://github.com/` or `https://www.github.com/` URLs
- **Existence Verification:** Checks if repository exists before adding
- **Real-time Feedback:** Visual status messages during validation and indexing
- **Error Handling:** Clear error messages for invalid or inaccessible repositories
- **Progress Tracking:** Shows indexing progress and completion status

## URL Format Requirements

### Valid URL Formats

✓ **Accepted:**
```
https://github.com/contentauth/c2pa-js
https://www.github.com/contentauth/c2pa-js
https://github.com/owner/repository
https://www.github.com/owner/repo-name
```

✗ **Rejected:**
```
github.com/owner/repo              # Missing protocol
http://github.com/owner/repo       # Must be HTTPS
git@github.com:owner/repo.git      # SSH format not supported
owner/repo                         # Incomplete format
https://gitlab.com/owner/repo      # Not GitHub
```

### URL Parsing

The system extracts owner and repository name from valid URLs:

```
URL: https://github.com/contentauth/c2pa-js
     └─> Owner: contentauth
     └─> Repo: c2pa-js

URL: https://github.com/owner/repo.git
     └─> Owner: owner
     └─> Repo: repo (automatically strips .git extension)
```

## User Interface

### Settings → AI & Models → Repository Management

**Input Field:**
- Single text input for repository URL
- Placeholder: `https://github.com/contentauth/c2pa-js`
- Real-time validation on input
- Disabled during validation/indexing

**Add Button:**
- Enabled only when URL is present
- Shows "Validating..." during checks
- Shows "Add Repository" when ready

**Status Messages:**

1. **Info State (Blue):**
   - ⏳ "Validating repository URL..."
   - ⏳ "Checking if owner/repo exists..."
   - ⏳ "Adding owner/repo..."
   - ⏳ "Indexing owner/repo... This may take a minute."

2. **Success State (Green):**
   - ✓ "Repository owner/repo indexed successfully! X files indexed and ready for RAG."

3. **Error State (Red):**
   - ✗ "Please enter a GitHub repository URL"
   - ✗ "URL must start with https://github.com/ or https://www.github.com/"
   - ✗ "Invalid GitHub URL format. Expected: https://github.com/owner/repo"
   - ✗ "Repository owner/repo not found or not accessible"
   - ✗ "GitHub token not configured. Please configure GitHub integration first."

## Validation Workflow

### Step-by-Step Process

```
User enters URL
    ↓
1. Format Validation
   ├─> Check if URL starts with https://github.com/ or https://www.github.com/
   ├─> If invalid: Show format error
   └─> If valid: Continue to step 2
    ↓
2. URL Parsing
   ├─> Extract owner and repo from URL using regex
   ├─> Remove .git extension if present
   ├─> If parsing fails: Show format error
   └─> If parsing succeeds: Continue to step 3
    ↓
3. Existence Check (Backend API)
   ├─> Call: GET /api/admin/github/check/:owner/:repo
   ├─> Backend checks GitHub API
   ├─> Returns: { success, exists, repository, error }
   ├─> If exists: Continue to step 4
   └─> If not exists or error: Show error message
    ↓
4. Add Repository
   ├─> Call: POST /api/github/repos/index
   ├─> Backend indexes repository files
   ├─> Returns: { success, filesIndexed, error }
   ├─> If successful: Show success message
   └─> If failed: Show error message
    ↓
5. Update Repository List
   └─> Refresh list of indexed repositories
```

## Backend API Endpoints

### Check Repository Existence

**Endpoint:** `GET /api/admin/github/check/:owner/:repo`

**Purpose:** Verify that a GitHub repository exists and is accessible

**Authentication:** Admin only (JWT token required)

**Parameters:**
- `:owner` - Repository owner (GitHub username or organization)
- `:repo` - Repository name

**Response (Success):**
```json
{
  "success": true,
  "exists": true,
  "repository": {
    "fullName": "contentauth/c2pa-js",
    "description": "JavaScript SDK for C2PA",
    "defaultBranch": "main",
    "isPrivate": false,
    "url": "https://github.com/contentauth/c2pa-js"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "exists": false,
  "error": "Repository not found or not accessible"
}
```

**Response (No Token):**
```json
{
  "success": false,
  "exists": false,
  "error": "GitHub token not configured. Please configure GitHub integration first."
}
```

**Implementation:**
```javascript
// backend/src/routes/admin.js

router.get('/github/check/:owner/:repo', requireAuth, requireAdmin, async (req, res) => {
  const { owner, repo } = req.params;
  const githubToken = getSecret('GITHUB_TOKEN');

  if (!githubToken) {
    return res.json({
      success: false,
      exists: false,
      error: 'GitHub token not configured...'
    });
  }

  try {
    const { Octokit } = require('@octokit/rest');
    const octokit = new Octokit({ auth: githubToken });

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });

    res.json({
      success: true,
      exists: true,
      repository: {
        fullName: repoData.full_name,
        description: repoData.description,
        defaultBranch: repoData.default_branch,
        isPrivate: repoData.private,
        url: repoData.html_url
      }
    });
  } catch (error) {
    if (error.status === 404) {
      return res.json({
        success: false,
        exists: false,
        error: 'Repository not found or not accessible'
      });
    }
    throw error;
  }
});
```

### Index Repository

**Endpoint:** `POST /api/github/repos/index`

**Purpose:** Index repository files for RAG

**Authentication:** Admin only (JWT token required)

**Request Body:**
```json
{
  "owner": "contentauth",
  "repo": "c2pa-js",
  "branch": "main"  // optional, defaults to main
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully indexed 156 files from contentauth/c2pa-js",
  "repoId": 1,
  "filesIndexed": 156
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to index repository",
  "error": "Authentication required"
}
```

## Frontend Implementation

### Component: SettingsPage.jsx

**Key State Variables:**
```javascript
const [newRepoUrl, setNewRepoUrl] = useState('');
const [validating, setValidating] = useState(false);
const [indexing, setIndexing] = useState(false);
const [importStatus, setImportStatus] = useState(null);
```

**URL Validation Function:**
```javascript
const handleAddRepoFromUrl = async () => {
  if (!newRepoUrl) {
    setImportStatus({
      type: 'error',
      message: 'Please enter a GitHub repository URL'
    });
    return;
  }

  // Validate URL format
  const trimmedUrl = newRepoUrl.trim();
  if (!trimmedUrl.startsWith('https://github.com/') &&
      !trimmedUrl.startsWith('https://www.github.com/')) {
    setImportStatus({
      type: 'error',
      message: 'URL must start with https://github.com/ or https://www.github.com/'
    });
    return;
  }

  try {
    setValidating(true);
    setImportStatus({
      type: 'info',
      message: 'Validating repository URL...'
    });

    // Parse URL to extract owner and repo
    const urlPattern = /https:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/\s#?]+)/;
    const urlMatch = trimmedUrl.match(urlPattern);

    if (!urlMatch) {
      setImportStatus({
        type: 'error',
        message: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo'
      });
      return;
    }

    const owner = urlMatch[1];
    const repo = urlMatch[2].replace(/\.git$/, '');

    // Check if repository exists
    setImportStatus({
      type: 'info',
      message: `Checking if ${owner}/${repo} exists...`
    });

    const checkResponse = await fetch(`/api/admin/github/check/${owner}/${repo}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const checkData = await checkResponse.json();

    if (!checkData.success || !checkData.exists) {
      setImportStatus({
        type: 'error',
        message: checkData.error || `Repository ${owner}/${repo} not found`
      });
      return;
    }

    // Repository exists, add it
    setImportStatus({
      type: 'info',
      message: `Adding ${owner}/${repo}...`
    });

    const addResponse = await fetch('/api/github/repos/index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ owner, repo })
    });

    const addData = await addResponse.json();

    if (addData.success) {
      setImportStatus({
        type: 'success',
        message: `✓ Repository ${owner}/${repo} added! Indexing files...`
      });

      // Trigger indexing
      await handleIndexRepo(owner, repo);
    } else {
      setImportStatus({
        type: 'error',
        message: addData.error || 'Failed to add repository'
      });
    }
  } catch (error) {
    setImportStatus({
      type: 'error',
      message: error.message || 'An error occurred'
    });
  } finally {
    setValidating(false);
  }
};
```

**Styling (SettingsPage.css):**
```css
/* Repository URL Input */
.repo-url-input {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.repo-url-input input {
  flex: 1;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--cyan);
  border-radius: 4px;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
}

.repo-url-input input::placeholder {
  color: #888;
  opacity: 0.7;
}

.repo-url-input input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Import Status Messages */
.import-status {
  padding: 1rem 1.25rem;
  border-radius: 4px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideIn 0.3s ease-out;
}

.import-status.info {
  background: rgba(0, 191, 255, 0.1);
  border: 2px solid #00bfff;
  color: #00bfff;
}

.import-status.success {
  background: rgba(0, 255, 0, 0.1);
  border: 2px solid var(--green);
  color: var(--green);
}

.import-status.error {
  background: rgba(255, 68, 68, 0.1);
  border: 2px solid #ff4444;
  color: #ff4444;
}

.import-status .status-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.import-status.info .status-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Error Handling

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| "URL must start with https://github.com/" | Invalid URL format | Enter full GitHub URL with HTTPS |
| "Invalid GitHub URL format" | URL parsing failed | Check URL structure (owner/repo) |
| "Repository not found" | Repo doesn't exist or is private | Verify repository name and permissions |
| "GitHub token not configured" | No token in admin settings | Configure GitHub integration first |
| "Access forbidden" | Token lacks permissions | Update token with repo read permissions |
| "Failed to index repository" | Network or API error | Check logs, retry operation |

### Debugging

**Check Frontend Console:**
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// View validation status
console.log('Validation state:', validating);
console.log('Import status:', importStatus);
```

**Check Backend Logs:**
```bash
# View admin route logs
docker logs c2pa-generator-assistant | grep "admin/github/check"

# View indexing logs
docker logs c2pa-generator-assistant | grep "Indexing repository"
```

## Configuration Requirements

### GitHub Token Setup

1. **Generate Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (full control of private repositories)
   - Copy token

2. **Configure in Admin Panel:**
   - Navigate to: Settings → Admin Panel → GitHub Integration
   - Paste token in "GitHub Personal Access Token" field
   - Click "Save GitHub Configuration"

3. **Verify Configuration:**
   - Status should show "GitHub token is configured"
   - Try adding a public repository to test

### Database Storage

Repository metadata stored in `github_repos` table:

```sql
CREATE TABLE github_repos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  file_count INTEGER DEFAULT 0,
  indexed_at DATETIME,
  UNIQUE(repo_owner, repo_name, branch)
);
```

Indexed files stored in `github_files` table:

```sql
CREATE TABLE github_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_extension TEXT,
  content TEXT,
  size INTEGER,
  indexed_at DATETIME,
  FOREIGN KEY (repo_id) REFERENCES github_repos(id) ON DELETE CASCADE,
  UNIQUE(repo_id, file_path)
);
```

## Best Practices

### For Users

1. **Always use full HTTPS URLs** - Copy-paste from browser address bar
2. **Verify repository exists** - Open in browser before adding
3. **Wait for indexing to complete** - Can take 1-2 minutes for large repos
4. **Check feedback messages** - Read success/error messages carefully
5. **Configure GitHub token first** - Required for private and rate-limited access

### For Developers

1. **Validate early** - Check URL format before API calls
2. **Show progress** - Update status messages at each step
3. **Handle errors gracefully** - Provide actionable error messages
4. **Log everything** - Backend logs help debug issues
5. **Rate limit awareness** - GitHub API has rate limits (5000/hour with auth)

## Related Documentation

- [GitHub RAG Setup](./GITHUB_RAG_SETUP.md) - Complete setup guide
- [Database Backup Restore](./DATABASE_BACKUP_RESTORE.md) - Data persistence
- [Admin Password Special Chars](./ADMIN_PASSWORD_SPECIAL_CHARS.md) - Authentication

---

**Last Updated:** 2025-10-20
**Version:** 1.0
**Status:** Production Ready
