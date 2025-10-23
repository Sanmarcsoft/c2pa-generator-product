# GitHub RAG Setup Guide

## Overview

This guide explains how to configure GitHub repositories for Retrieval-Augmented Generation (RAG) to enable code-aware AI assistance.

## What is RAG?

RAG (Retrieval-Augmented Generation) enhances AI responses by pulling relevant context from your codebase. When you ask questions about your code, the AI can search through indexed GitHub repositories and provide accurate, context-aware answers.

## Prerequisites

1. **Admin Access**: You must be an administrator to configure GitHub integration
2. **GitHub Personal Access Token**: Create a token with `repo` or `public_repo` scope
3. **Repositories**: Public or private GitHub repositories you want to index

## Step 1: Enable GitHub Integration

1. Log in as an admin at http://localhost:8080/login
2. Navigate to **Admin Panel** from the user menu
3. Scroll to the **GitHub Integration** section
4. Check the box: **Enable GitHub Integration**
5. Enter your **GitHub Personal Access Token**
   - Create one at: https://github.com/settings/tokens
   - Required scopes:
     - `repo` for private repositories
     - `public_repo` for public repositories only
6. Click **Save GitHub Configuration**

## Step 2: Add Repositories

Once GitHub integration is enabled and the token is saved, you'll see the **Repositories for RAG** section:

### Add a New Repository

1. Enter the **Owner** name (e.g., `contentauth`)
2. Enter the **Repository** name (e.g., `c2pa-js`)
3. Click **Add Repository**

**Example repositories**:
- `contentauth/c2pa-js` - C2PA JavaScript SDK
- `contentauth/c2pa-rs` - C2PA Rust SDK
- `facebook/react` - React framework
- Your organization's private repositories

### Repository Status

Each added repository shows:
- **Owner/Repo name** in cyan
- **Index status**:
  - ✓ **Indexed** (green) - Repository has been indexed and is ready for RAG
  - ⚠ **Not indexed** (yellow) - Repository added but not yet indexed
- **File count** - Number of files indexed
- **Last indexed** - Timestamp of last indexing operation

## Step 3: Index Repositories

After adding a repository, you must index it before the AI can use it:

1. Find the repository in the list
2. Click the **Index Now** button
3. Wait for indexing to complete (this may take a few minutes for large repos)
4. Status will change from "Not indexed" to "Indexed"

**What gets indexed**:
- Source code files (`.js`, `.ts`, `.py`, `.rs`, `.go`, etc.)
- Documentation files (`.md`, `.txt`)
- Configuration files (`.json`, `.yaml`, `.toml`)

**What gets excluded**:
- Binary files
- Large files (>1MB)
- Common build artifacts (`node_modules`, `target`, `dist`, etc.)

## Step 4: Enable RAG in Settings

1. Navigate to **Settings** from the user menu
2. Go to the **AI & Models** tab
3. Check the box: **Enable RAG (Retrieval-Augmented Generation)**
4. Click **Save AI Settings**

## Using RAG in Chat

Once repositories are indexed and RAG is enabled:

1. Go to the **Chat** page
2. Ask code-related questions:
   - "How do I create a C2PA manifest in JavaScript?"
   - "Show me examples of embedding C2PA data in images"
   - "What are the required dependencies for c2pa-js?"
3. The AI will search indexed repositories and provide code examples

**Example Chat Queries**:
```
User: "How do I verify a C2PA signature in JavaScript?"
AI: [Searches c2pa-js repository and provides relevant code snippets]

User: "What's the structure of a C2PA manifest?"
AI: [References documentation from indexed repos with examples]
```

## Managing Repositories

### Re-index a Repository

Repositories should be re-indexed when:
- New code has been pushed to the repository
- You want to capture recent changes
- Initial indexing failed or was incomplete

To re-index:
1. Find the repository in the list
2. Click **Re-index**
3. Wait for completion

### Remove a Repository

To stop using a repository for RAG:
1. Find the repository in the list
2. Click **Remove**
3. Confirm the deletion

**Note**: Removing a repository deletes its indexed data. The AI will no longer reference this code.

## Troubleshooting

### "Failed to add repository"

**Causes**:
- GitHub token is invalid or expired
- Repository doesn't exist
- No access to private repository
- Network connectivity issues

**Solutions**:
1. Verify the owner and repository name are correct
2. Check your GitHub token permissions
3. Generate a new token if expired
4. Verify repository access in GitHub

### "Indexing failed"

**Causes**:
- GitHub API rate limit exceeded
- Repository is too large (>10,000 files)
- Network timeout
- Invalid GitHub token

**Solutions**:
1. Wait a few minutes and try again (rate limit resets)
2. Use a more specific repository (not monorepos)
3. Verify token has correct permissions
4. Check application logs: `docker logs c2pa-generator-assistant`

### "AI not using indexed code"

**Causes**:
- RAG not enabled in Settings
- Repository not indexed
- Query doesn't match indexed content

**Solutions**:
1. Verify **Enable RAG** is checked in Settings → AI & Models
2. Confirm repository shows "✓ Indexed" status
3. Re-index the repository
4. Try more specific queries that match your codebase

### Rate Limits

GitHub API has rate limits:
- **Authenticated requests**: 5,000 per hour
- **Unauthenticated requests**: 60 per hour

**Tips**:
- Use a personal access token (required)
- Index repositories during off-peak hours
- Don't re-index too frequently

## Best Practices

### Repository Selection

**Do index**:
- ✅ Core SDKs and libraries you use
- ✅ Internal documentation repositories
- ✅ Example code repositories
- ✅ API reference documentation

**Don't index**:
- ❌ Extremely large monorepos (>10,000 files)
- ❌ Repositories with mostly binary files
- ❌ Archived or deprecated projects
- ❌ Unrelated codebases

### Indexing Strategy

1. **Start small**: Index 2-3 core repositories first
2. **Test RAG**: Verify AI provides useful answers
3. **Add more**: Gradually add relevant repositories
4. **Re-index monthly**: Keep code up to date
5. **Monitor usage**: Remove unused repositories

### Query Optimization

**Good queries**:
- "Show me how to create a C2PA claim in JavaScript"
- "What's the API for embedding metadata?"
- "Give me an example of verifying signatures"

**Bad queries**:
- "Write my entire application" (too broad)
- "What is C2PA?" (use general knowledge, not RAG)
- Queries about unindexed repositories

## Advanced Configuration

### Multiple Repositories

You can index multiple repositories. The AI will search across all indexed repos:

```
Indexed repos:
1. contentauth/c2pa-js
2. contentauth/c2pa-rs
3. myorg/internal-c2pa-tools

Query: "How do I sign a manifest?"
AI searches all 3 repositories and synthesizes answers
```

### Private Repositories

To index private repositories:
1. Ensure your GitHub token has `repo` scope (not just `public_repo`)
2. Verify you have read access to the repository
3. Add and index as normal

### Organization Repositories

To index all repos from an organization:
1. Add each repository individually
2. Use consistent naming: `org/repo1`, `org/repo2`, etc.
3. Index each separately

## API Endpoints

The repository management uses these API endpoints:

```bash
# List repositories
GET /api/admin/github/repos
Authorization: Bearer <token>

# Add repository
POST /api/admin/github/repos
Content-Type: application/json
Authorization: Bearer <token>
Body: {"owner": "contentauth", "repo": "c2pa-js"}

# Remove repository
DELETE /api/admin/github/repos/:owner/:repo
Authorization: Bearer <token>

# Index repository
POST /api/admin/github/index
Content-Type: application/json
Authorization: Bearer <token>
Body: {"owner": "contentauth", "repo": "c2pa-js"}
```

## Security Considerations

1. **Token Security**:
   - Tokens are stored encrypted in `/app/config/secrets.json`
   - File permissions set to 600 (owner read/write only)
   - Never commit tokens to version control

2. **Access Control**:
   - Only admins can configure repositories
   - All users benefit from indexed repositories
   - Indexed data is stored in application database

3. **Data Privacy**:
   - Indexed code stored locally (not sent to external services)
   - Only code content is indexed (no commit history)
   - Remove repositories to delete indexed data

## Monitoring

Check indexing status:

```bash
# View application logs
docker logs c2pa-generator-assistant --tail 50

# Look for:
[32minfo[39m: Repository indexed successfully {"owner":"contentauth","repo":"c2pa-js","files":142}
```

## Example Workflow

**Complete setup from scratch**:

1. **Generate GitHub Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` or `public_repo`
   - Generate and copy token

2. **Configure Integration**:
   ```
   Login → Admin Panel → GitHub Integration
   ✓ Enable GitHub Integration
   Paste token: ghp_xxxxxxxxxxxx
   Save GitHub Configuration
   ```

3. **Add C2PA JavaScript SDK**:
   ```
   Owner: contentauth
   Repo: c2pa-js
   Click: Add Repository
   ```

4. **Index Repository**:
   ```
   Find: contentauth/c2pa-js
   Click: Index Now
   Wait for: ✓ Indexed (142 files)
   ```

5. **Enable RAG**:
   ```
   Settings → AI & Models
   ✓ Enable RAG
   Save AI Settings
   ```

6. **Test in Chat**:
   ```
   Chat → "How do I create a C2PA manifest?"
   AI provides code examples from c2pa-js
   ```

## Support

If you encounter issues:

1. Check application logs: `docker logs c2pa-generator-assistant`
2. Verify GitHub token permissions at https://github.com/settings/tokens
3. Ensure repository exists and you have access
4. Check rate limits: https://docs.github.com/en/rest/rate-limit

---

**Last Updated**: 2025-10-20
**Status**: Production Ready
**Feature**: GitHub RAG Integration v1.0
