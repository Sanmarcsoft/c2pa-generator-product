# C2PA Generator Product - Feature Summary

## Recent Additions (October 2025)

### 1. GitHub RAG (Retrieval-Augmented Generation) ✅

**Status**: Fully implemented and tested

**Description**: Integrates GitHub repositories as a knowledge source for AI-powered code search directly in the chat interface.

**Key Features**:
- GitHub authentication (Personal Access Token)
- Repository indexing (114 files indexed from c2pa-generator-product)
- Keyword-based search with scoring
- Code snippet extraction with line numbers
- Direct links to GitHub files
- Smart file filtering (ignores binaries, node_modules, etc.)

**Files Created/Modified**:
- `backend/src/services/githubAuthService.js` - GitHub authentication
- `backend/src/services/githubRagService.js` - Repository indexing and search
- `backend/src/routes/github.js` - GitHub API endpoints
- `backend/src/services/ragService.js` - Enhanced with GitHub search
- `backend/src/models/database.js` - Added github_repos and github_files tables
- `docs/GITHUB_RAG.md` - Complete documentation
- `docs/GITHUB_TOKEN_SETUP.md` - Security guide
- `docs/GITHUB_RAG_QUICKSTART.md` - Quick start guide

**API Endpoints**:
- `POST /api/github/auth/token` - Authenticate with GitHub
- `GET /api/github/auth/status` - Check authentication status
- `POST /api/github/repos/index` - Index a repository
- `GET /api/github/repos` - List indexed repositories
- `POST /api/github/search` - Search indexed code
- `DELETE /api/github/repos/:id` - Remove indexed repository

**Test Results**:
```bash
# Successfully indexed 114 files
# Search working correctly
# GitHub results appearing in chat responses
```

Example chat query:
```
User: "Show me the githubAuthService code"
Assistant: [Fallback response] + GitHub search results with code snippets and links
```

### 2. OpenWebUI Integration ✅

**Status**: Fully implemented

**Description**: Support for local AI inference using OpenWebUI, providing a free alternative to OpenAI API.

**Key Features**:
- OpenWebUI client initialization
- Priority-based AI provider selection (OpenWebUI > OpenAI > Fallback)
- Environment variable configuration
- Compatible with Ollama models (Llama, Mistral, Phi, etc.)
- No API key required for local instances

**Files Created/Modified**:
- `backend/src/services/aiService.js` - Added OpenWebUI support
- `.env.example` - Added OPENWEBUI_URL configuration
- `docker-compose.yml` - Added OPENWEBUI_URL environment variable
- `docs/OPENWEBUI_INTEGRATION.md` - Complete integration guide

**Configuration**:
```bash
# .env
OPENWEBUI_URL=http://localhost:3000/api
AI_MODEL=llama3.2:latest
```

**AI Provider Priority**:
1. OpenWebUI (if OPENWEBUI_URL is set)
2. OpenAI API (if OPENAI_API_KEY is set)
3. Fallback Mode (rule-based responses with GitHub RAG)

### 3. Onboarding Wizard ✅

**Status**: Fully implemented

**Description**: Interactive startup wizard that guides users through initial configuration on first launch.

**Key Features**:
- 4-step wizard interface
- AI provider setup (OpenWebUI/OpenAI/Fallback)
- GitHub integration configuration
- Repository indexing setup
- Skip option available
- Retro 8-bit Atari aesthetic
- Persistent settings storage

**Wizard Steps**:
1. **Welcome** - Introduction to setup process
2. **AI Provider** - Choose OpenWebUI, OpenAI, or Fallback mode
3. **GitHub Integration** - Optional GitHub token configuration
4. **Repository Indexing** - Add repositories to index

**Files Created**:
- `frontend/src/components/OnboardingWizard.jsx` - React component
- `frontend/src/components/OnboardingWizard.css` - Retro styling
- `frontend/src/App.jsx` - Modified to check onboarding status
- `backend/src/routes/settings.js` - Settings management API
- `backend/src/models/database.js` - Added app_settings table

**Database Schema**:
```sql
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  type TEXT DEFAULT 'string',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**API Endpoints**:
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `PUT /api/settings/:key` - Update setting
- `GET /api/settings/onboarding/status` - Check onboarding status
- `POST /api/settings/onboarding/complete` - Mark onboarding complete
- `POST /api/settings/onboarding/reset` - Reset onboarding (for testing)

**User Flow**:
1. User opens application for the first time
2. Onboarding wizard appears automatically
3. User configures AI provider (or skips)
4. User adds GitHub token (or skips)
5. User adds repositories to index (or skips)
6. Settings are saved to database
7. Wizard closes, user enters main application

## System Architecture

### Technology Stack
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: React + Vite
- **AI Integration**: OpenAI SDK (compatible with OpenWebUI)
- **GitHub Integration**: Octokit REST API
- **Containerization**: Docker + Docker Compose

### Database Tables
1. `documents` - Uploaded C2PA documents
2. `annotations` - User annotations on documents
3. `chat_messages` - Chat conversation history
4. `progress` - Certification phase progress
5. `checklist_items` - Task checklists
6. `github_repos` - Indexed GitHub repositories
7. `github_files` - Indexed file content (for RAG)
8. `app_settings` - Application configuration

### Service Layer
- `aiService.js` - AI response generation (OpenWebUI/OpenAI/Fallback)
- `ragService.js` - RAG enhancement with documents and GitHub code
- `githubAuthService.js` - GitHub authentication
- `githubRagService.js` - Repository indexing and search

### API Routes
- `/api/documents` - Document management
- `/api/chat` - AI chat interface
- `/api/progress` - Certification progress
- `/api/c2pa` - C2PA-specific features
- `/api/github` - GitHub RAG features
- `/api/settings` - Application settings

## Configuration Guide

### Environment Variables

```bash
# Application
NODE_ENV=development
PORT=8080

# AI Provider (choose one)
OPENWEBUI_URL=http://localhost:3000/api      # Local OpenWebUI
# OR
OPENAI_API_KEY=sk-your-api-key-here          # OpenAI API

AI_MODEL=llama3.2:latest                      # Model to use

# GitHub Integration
GITHUB_TOKEN=ghp_your_token_here              # For RAG code search

# Database
DATABASE_URL=sqlite:///data/app.db

# Security
CORS_ORIGIN=http://localhost:5173
```

### Docker Secrets (Production)

For production, use Docker secrets or file-based secrets:

```bash
# Create secrets directory
mkdir -p backend/config

# Create secrets.json with restricted permissions
cat > backend/config/secrets.json <<EOF
{
  "OPENAI_API_KEY": "your-api-key",
  "GITHUB_TOKEN": "ghp_your_token"
}
EOF

chmod 600 backend/config/secrets.json
```

## Testing

### 1. Test Server Health
```bash
curl http://localhost:8080/health
```

### 2. Test Onboarding Status
```bash
curl http://localhost:8080/api/settings/onboarding/status
```

### 3. Test GitHub RAG

```bash
# Authenticate
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_YOUR_TOKEN"}'

# Index repository
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{"owner": "smsmatt", "repo": "c2pa-generator-product"}'

# Search code
curl -X POST http://localhost:8080/api/github/search \
  -H "Content-Type: application/json" \
  -d '{"query": "githubAuthService", "limit": 3}'
```

### 4. Test Chat with RAG

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me the authentication code from my repository"}'
```

## Deployment

### Development
```bash
docker-compose up --build -d
```

### Production
1. Set environment variables in `.env`
2. Configure secrets in `backend/config/secrets.json`
3. Set file permissions: `chmod 600 backend/config/secrets.json`
4. Build and deploy: `docker-compose up -d`

### Scaling Considerations
- Use external database (PostgreSQL) for production
- Deploy OpenWebUI separately for better resource management
- Use Redis for caching GitHub search results
- Implement rate limiting for GitHub API calls
- Add CDN for frontend assets

## Security

### GitHub Token
- Stored in secrets file with 600 permissions
- Never committed to git (.gitignore)
- Supports Docker secrets for production
- Minimum required scope: `public_repo` (or `repo` for private repos)

### OpenWebUI
- Runs locally, no external API calls
- Data never leaves your machine
- No API key required

### OpenAI API
- API key stored in secrets file
- Environment variable fallback
- Not committed to version control

## Performance

### GitHub RAG
- Indexes 114 files in ~7 seconds
- Batch processing (10 files at a time)
- Smart file filtering (excludes binaries, node_modules)
- SQLite full-text search with scoring

### OpenWebUI
- Model-dependent performance:
  - llama3.2:3b - Fast (2GB RAM)
  - llama3.2:latest - Balanced (8GB RAM)
  - mistral:latest - Good reasoning (4GB RAM)
- GPU acceleration supported
- Adjustable context window

## Known Issues

### 1. GitHub API Rate Limits
- **Issue**: GitHub API has rate limits (5000/hour for authenticated requests)
- **Solution**: Batch file fetching, implement caching

### 2. Large Repositories
- **Issue**: Indexing very large repos (>1000 files) may be slow
- **Solution**: Implement incremental indexing, file type filters

### 3. OpenWebUI Connection
- **Issue**: Docker-to-Docker networking may require `host.docker.internal`
- **Solution**: Use `OPENWEBUI_URL=http://host.docker.internal:3000/api`

## Future Enhancements

### Short-term
- [ ] Incremental repository updates (detect changes)
- [ ] GitHub webhooks for automatic re-indexing
- [ ] Multi-repository search (search across all indexed repos)
- [ ] Code syntax highlighting in search results
- [ ] Search history and saved searches

### Medium-term
- [ ] Vector embeddings for semantic code search
- [ ] Support for GitLab and Bitbucket
- [ ] Pull request integration
- [ ] Code review assistance
- [ ] Jupyter notebook support

### Long-term
- [ ] Fine-tuned models for C2PA-specific code
- [ ] Automated code generation from requirements
- [ ] Integration with CI/CD pipelines
- [ ] Multi-language support
- [ ] Enterprise SSO integration

## Documentation

Complete documentation available in `/docs`:
- `GITHUB_RAG.md` - GitHub RAG feature guide
- `GITHUB_TOKEN_SETUP.md` - Security configuration
- `GITHUB_RAG_QUICKSTART.md` - Quick start guide
- `OPENWEBUI_INTEGRATION.md` - OpenWebUI setup and usage
- `GITHUB_RAG_IMPLEMENTATION.md` - Technical implementation details

## Support

For issues or questions:
1. Check documentation in `/docs`
2. Review environment configuration
3. Check Docker logs: `docker logs c2pa-generator-assistant`
4. Verify API connectivity: `curl http://localhost:8080/health`

## License

Copyright © 2025 Sanmarcsoft LLC
