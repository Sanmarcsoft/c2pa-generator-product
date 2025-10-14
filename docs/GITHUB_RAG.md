# GitHub RAG Integration

This document explains how to use the GitHub RAG (Retrieval-Augmented Generation) component to search through GitHub repositories as part of the AI assistant's knowledge base.

## Overview

The GitHub RAG component allows you to:
- Authenticate with your GitHub account
- Index any GitHub repository (public or private)
- Search through code, documentation, and configuration files
- Get AI responses enhanced with relevant code snippets from your repositories

## Features

- **Automatic Authentication**: Uses your GitHub credentials to access repositories
- **Intelligent Indexing**: Only indexes relevant text-based files (code, markdown, configs)
- **Fast Search**: Indexed content is stored in SQLite for quick retrieval
- **RAG Enhancement**: Search results are automatically integrated into AI responses
- **Multiple Repos**: Index and search across multiple repositories

## Setup

### 1. Get a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "C2PA Assistant RAG")
4. Select scopes:
   - For **public repositories only**: Check `public_repo`
   - For **private repositories**: Check `repo` (full control)
5. Click "Generate token"
6. Copy the token (starts with `ghp_...`)

### 2. Configure the Application

Add your token to the `.env` file:

```bash
GITHUB_TOKEN=ghp_your_actual_token_here
```

## Usage

### Authentication

#### Using Personal Access Token (Recommended)

```bash
# Authenticate with your GitHub token
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_your_token_here"}'
```

Response:
```json
{
  "success": true,
  "message": "Successfully authenticated with GitHub",
  "user": {
    "login": "yourusername",
    "name": "Your Name",
    "email": "you@example.com",
    "avatarUrl": "https://avatars.githubusercontent.com/..."
  }
}
```

#### Check Authentication Status

```bash
curl http://localhost:8080/api/github/auth/status
```

### Indexing Repositories

#### Index a Repository

```bash
# Index a repository (default branch)
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "yourusername",
    "repo": "your-repo-name"
  }'

# Index a specific branch
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "yourusername",
    "repo": "your-repo-name",
    "branch": "develop"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Successfully indexed 127 files from yourusername/your-repo-name",
  "repoId": 1,
  "filesIndexed": 127
}
```

**Note**: Indexing a repository may take a few minutes depending on its size. The API will process files in batches.

#### View Indexed Repositories

```bash
curl http://localhost:8080/api/github/repos
```

Response:
```json
{
  "success": true,
  "count": 2,
  "repositories": [
    {
      "id": 1,
      "repository": "yourusername/your-repo",
      "owner": "yourusername",
      "name": "your-repo",
      "branch": "main",
      "fileCount": 127,
      "indexedAt": "2025-10-14T20:30:00Z",
      "url": "https://github.com/yourusername/your-repo"
    }
  ]
}
```

#### Delete an Indexed Repository

```bash
curl -X DELETE http://localhost:8080/api/github/repos/1
```

### Searching Repositories

```bash
curl -X POST http://localhost:8080/api/github/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication jwt token",
    "limit": 5
  }'
```

Response:
```json
{
  "success": true,
  "query": "authentication jwt token",
  "count": 3,
  "results": [
    {
      "fileId": 42,
      "fileName": "auth.js",
      "filePath": "src/services/auth.js",
      "repository": "yourusername/your-repo",
      "branch": "main",
      "score": 85,
      "excerpt": "...\nfunction verifyJWT(token) {\n  return jwt.verify(token, SECRET_KEY);\n}\n...",
      "url": "https://github.com/yourusername/your-repo/blob/main/src/services/auth.js"
    }
  ]
}
```

#### Search Within Specific Repository

```bash
curl -X POST http://localhost:8080/api/github/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database connection",
    "repoFilter": "yourusername/specific-repo",
    "limit": 3
  }'
```

## Integration with Chat

When you chat with the AI assistant, it automatically searches both:
1. **Uploaded documents** (C2PA specs, PDFs, etc.)
2. **Indexed GitHub repositories** (if any are indexed)

Example chat message:
```
"How do I implement JWT authentication in my application?"
```

The AI will:
1. Understand your question
2. Search through your indexed code for relevant authentication examples
3. Provide an answer enhanced with actual code snippets from your repositories

## File Types Indexed

The following file types are automatically indexed:

**Code Files:**
- JavaScript/TypeScript: `.js`, `.ts`, `.jsx`, `.tsx`
- Python: `.py`
- Java: `.java`
- Go: `.go`
- Rust: `.rs`
- C/C++: `.c`, `.cpp`, `.h`
- Ruby: `.rb`
- PHP: `.php`
- Swift: `.swift`
- Kotlin: `.kt`
- Scala: `.scala`
- R: `.r`

**Configuration & Documentation:**
- Markdown: `.md`
- Text: `.txt`
- JSON: `.json`
- YAML: `.yml`, `.yaml`
- TOML: `.toml`
- XML: `.xml`
- HTML/CSS: `.html`, `.css`, `.scss`
- Shell: `.sh`, `.bash`
- SQL: `.sql`
- Config files: `.ini`, `.cfg`, `.conf`
- Docker: `Dockerfile`
- Make: `Makefile`
- Special files: `README`, `LICENSE`, `CHANGELOG`, `.gitignore`, `.env.example`

**Files Ignored:**
- `node_modules/`
- `vendor/`
- `.git/`
- `dist/`, `build/`, `target/`
- `.next/`, `__pycache__/`
- IDE folders: `.idea/`, `.vscode/`
- Minified files: `*.min.js`, `*.min.css`
- Lock files: `package-lock.json`, `yarn.lock`

## Use Cases

### 1. C2PA Implementation Examples

If you're implementing C2PA in your application and have reference implementations:

```bash
# Index the C2PA reference repository
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "contentauth",
    "repo": "c2pa-js"
  }'
```

Then ask: "Show me how to create a C2PA manifest in JavaScript"

### 2. Your Company's Codebase

Index your own repositories to get AI assistance based on your actual code:

```bash
# Index your company's repository
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "sanmarcsoft",
    "repo": "your-app"
  }'
```

Then ask: "How is authentication handled in our application?"

### 3. Learning from Open Source

Index popular open-source projects to learn best practices:

```bash
# Index React for learning patterns
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "facebook",
    "repo": "react"
  }'
```

## Best Practices

1. **Start Small**: Index smaller repositories first to test the feature
2. **Use Specific Branches**: Index the branch you're actively working on
3. **Re-index When Needed**: If the repository changes significantly, re-index it
4. **Manage Your Indexes**: Delete repositories you no longer need indexed
5. **Token Scope**: Use the minimum required scope (public_repo for public repos)
6. **Rate Limits**: GitHub API has rate limits; indexing large repos may take time

## Troubleshooting

### Authentication Failed
- Verify your token is correct and not expired
- Check that the token has the required scopes
- Tokens expire after a set period - generate a new one if needed

### Indexing Fails
- Ensure you have access to the repository
- Check that the repository and branch names are correct
- For private repos, ensure your token has `repo` scope
- Large repositories may take longer - be patient

### No Search Results
- Verify repositories are indexed (check `/api/github/repos`)
- Try broader search terms
- Check that the files you expect are in the indexable file types list

### Slow Performance
- Too many indexed repositories can slow searches
- Delete unused repository indexes
- Consider indexing only the most relevant branches

## API Reference

### Authentication Endpoints

- `POST /api/github/auth/token` - Authenticate with Personal Access Token
- `POST /api/github/auth/device-flow` - Authenticate with OAuth Device Flow
- `GET /api/github/auth/status` - Check authentication status
- `POST /api/github/auth/logout` - Logout from GitHub

### Repository Management Endpoints

- `POST /api/github/repos/index` - Index a repository
- `GET /api/github/repos` - List indexed repositories
- `DELETE /api/github/repos/:repoId` - Delete an indexed repository

### Search Endpoint

- `POST /api/github/search` - Search indexed repositories

## Security Considerations

1. **Token Storage**: Tokens are kept in memory only (not persisted to database)
2. **Token Scope**: Only request the minimum required permissions
3. **Private Repos**: Be careful when indexing private repositories
4. **Sharing**: Don't share your authentication token
5. **Rotation**: Rotate tokens regularly for security

## Limitations

- Maximum file size indexed: 1MB per file (larger files are skipped)
- GitHub API rate limits apply (5,000 requests/hour for authenticated users)
- Binary files are not indexed
- Very large repositories (10,000+ files) may take significant time to index

## Future Enhancements

Planned features for future releases:
- [ ] Automatic re-indexing on repository updates via webhooks
- [ ] Semantic search using embeddings
- [ ] Multi-repository search with priority weighting
- [ ] Support for GitLab and Bitbucket
- [ ] File content caching for offline searches

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the application logs at `logs/app.log`
3. Contact the development team

---

Built with ❤️ by Sanmarcsoft LLC
