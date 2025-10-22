# C2PA Generator Product Certification Assistant

An 8-bit Atari vector-styled web-based AI assistant designed to guide Sanmarcsoft LLC through the process of becoming a C2PA Generator Product Company.

## Overview

This application provides an interactive, retro-gaming-inspired interface to help companies navigate the C2PA (Coalition for Content Provenance and Authenticity) Generator Product certification process.

### Features

- **Retro 8-bit Atari Vector Graphics** - Nostalgic interface inspired by classic arcade games
- **AI-Powered Assistant** - Interactive guide through the certification process
- **Document Management** - Upload, review, annotate, and download certification documents
- **Progress Tracking** - Visual dashboard showing certification progress
- **6-Phase Workflow** - Structured approach from introduction to certification maintenance
- **GitHub RAG Integration** - Index and search your GitHub repositories for code-aware assistance

## Technology Stack

- **Frontend**: React/Vue.js with SVG animations
- **Backend**: Node.js (Express) or Python (FastAPI)
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI**: Ollama (local LLM - qwen3-coder:480b-cloud) or OpenAI GPT-4
- **Chat Persistence**: OpenWebUI integration
- **Deployment**: Docker, Google Cloud Platform

## Recent Updates

**🎉 October 2025 - Major Enhancements:**
- **OpenWebUI Integration** - Chat persistence and session management via OpenWebUI
- **Ollama AI Provider** - Local LLM support with qwen3-coder:480b-cloud model
- **Automatic Database Backup & Restore** - Data persistence across container rebuilds
- **Safe Rebuild Script** - Use `./scripts/rebuild-with-backup.sh` instead of `docker-compose up -d --build`
- **GitHub Repository Validation** - Strict URL validation with existence checking
- **Visual Feedback** - Real-time status messages for repository indexing

📚 See [Recent Updates](docs/RECENT_UPDATES.md) for complete details.

## Quick Start

### Local Development (Docker)

```bash
# Clone the repository
git clone https://github.com/smsmatt/c2pa-generator-product.git
cd c2pa-generator-product

# Run with Docker Compose (first time)
docker-compose up -d

# For rebuilds, use the safe rebuild script (recommended)
./scripts/rebuild-with-backup.sh

# The application will auto-detect an available port (8080-8090)
# Open http://localhost:8080 in your browser
```

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

## Deployment

### Production (Google Cloud)

The application automatically deploys to Google Cloud when pushed to the main branch via GitHub Actions.

**Production URL**: https://generator-product.trusteddit.com

## Documentation

### Getting Started
- **[Recent Updates](docs/RECENT_UPDATES.md)** - Latest features and changes
- **[Technical Specification](SPEC.md)** - Comprehensive technical documentation
- **[User Guide](docs/USER_GUIDE.md)** - End-user documentation
- **[API Documentation](docs/API.md)** - API endpoint reference

### Database & Deployment
- **[Database Backup & Restore](docs/DATABASE_BACKUP_RESTORE.md)** - Data persistence guide
- **[Container Rebuild Password Issue](docs/CONTAINER_REBUILD_PASSWORD_ISSUE.md)** - Password reset after rebuilds
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deployment instructions

### GitHub Integration
- **[GitHub Repository Validation](docs/GITHUB_REPO_VALIDATION.md)** - URL validation guide
- **[GitHub RAG Setup](docs/GITHUB_RAG_SETUP.md)** - Repository indexing for AI assistance
- **[GitHub Token Setup](docs/GITHUB_TOKEN_SETUP.md)** - Authentication configuration

### Troubleshooting
- **[Troubleshooting Login](docs/TROUBLESHOOTING_LOGIN.md)** - Login issues
- **[Admin Password Special Characters](docs/ADMIN_PASSWORD_SPECIAL_CHARS.md)** - Password handling

## Project Structure

```
c2pa-generator-product/
├── frontend/          # React/Vue.js frontend
├── backend/           # Node.js/Python backend
├── data/              # Data storage (gitignored)
├── docker/            # Docker configuration
├── .github/           # GitHub Actions workflows
└── docs/              # Documentation
```

## C2PA Certification Phases

The assistant guides users through six phases:

1. **Introduction & Prerequisites** - Eligibility and requirements
2. **Understanding Requirements** - C2PA standards and specifications
3. **Document Review** - Official C2PA documentation
4. **Application Preparation** - Forms and technical review
5. **Submission & Follow-up** - Application tracking
6. **Certification Maintenance** - Ongoing compliance

## Environment Variables

```bash
# Application
NODE_ENV=production
PORT=8080

# AI Configuration
OPENAI_API_KEY=your-api-key

# Database
DATABASE_URL=sqlite:///data/app.db

# Google Cloud
GCP_PROJECT_ID=your-project-id
```

## Security - Protecting Your API Keys

**⚠️ Important**: Never commit API keys to git! The application supports three secure methods for managing secrets:

### Option 1: File-Based Secrets (Recommended for Development)

```bash
# 1. Create secrets file
cp backend/config/secrets.example.json backend/config/secrets.json

# 2. Set secure permissions
chmod 600 backend/config/secrets.json

# 3. Edit with your actual keys
# backend/config/secrets.json:
{
  "OPENAI_API_KEY": "sk-your-actual-key-here"
}

# 4. Mount in docker-compose.yml (uncomment):
# volumes:
#   - ./backend/config/secrets.json:/app/config/secrets.json:ro
```

### Option 2: Docker Secrets (Recommended for Production)

```bash
# 1. Create secrets directory
mkdir -p secrets && chmod 700 secrets

# 2. Store key in file
echo "sk-your-actual-key" > secrets/openai_api_key.txt
chmod 600 secrets/openai_api_key.txt

# 3. Enable in docker-compose.yml (see commented sections)
```

### Option 3: Environment Variables (Development Only)

Currently using `.env` file - convenient but least secure. See [SECURITY.md](SECURITY.md) for complete security guidelines.

**Secret Priority**: Docker Secrets → File-Based Secrets → Environment Variables

## Contributing

This is a private project for Sanmarcsoft LLC. For questions or issues, please contact the development team.

## License

Copyright © 2025 Sanmarcsoft LLC. All rights reserved.

## Support

For support or questions about the C2PA certification process, please visit:
- [C2PA Official Website](https://c2pa.org)
- [C2PA Conformance Repository](https://github.com/Sanmarcsoft/c2pa-org-conformance-public)

---

Built with retro love by Sanmarcsoft LLC
