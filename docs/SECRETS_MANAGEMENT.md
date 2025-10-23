# Unified Secrets Management Guide

This guide explains how to securely manage API keys and secrets across all environments: **local development**, **GitHub Actions**, and **Google Cloud Run**.

## 🎯 Quick Start

### For Local Development

```bash
# 1. Set up local secrets
./scripts/manage-secrets.sh setup-local

# 2. Install git hooks to prevent accidental commits
./scripts/install-git-hooks.sh

# 3. Start your containers
docker-compose up -d

# 4. Verify secrets are loaded
docker logs c2pa-generator-assistant | grep "Loaded secret"
```

### For GitHub Actions Deployment

```bash
# Configure GitHub repository secrets (requires GitHub CLI)
./scripts/manage-secrets.sh setup-github
```

### For Google Cloud Run Deployment

```bash
# Configure GCP Secret Manager (requires gcloud CLI)
./scripts/manage-secrets.sh setup-gcp
```

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment-Specific Setup](#environment-specific-setup)
3. [Secrets Management Commands](#secrets-management-commands)
4. [Security Best Practices](#security-best-practices)
5. [Troubleshooting](#troubleshooting)
6. [FAQ](#faq)

---

## 🏗️ Architecture Overview

### How It Works

The application uses a **priority-based secrets loading system**:

```
Priority 1: Docker Secrets     (/run/secrets/*)
Priority 2: File-based Secrets (backend/config/secrets.json)
Priority 3: Environment Variables (process.env.*)
```

The first available source is used automatically.

### Environment Matrix

| Environment | Method | File/Location | Protected By |
|------------|---------|---------------|--------------|
| **Local Dev** | File-based | `backend/config/secrets.json` | File permissions (600), .gitignore |
| **GitHub Actions** | GitHub Secrets | Repository settings | GitHub's encrypted secrets |
| **Cloud Run** | GCP Secret Manager | Google Cloud project | IAM permissions, encryption at rest |

---

## 🔧 Environment-Specific Setup

### Local Development

#### Initial Setup

```bash
# Run the setup script
./scripts/manage-secrets.sh setup-local
```

This will:
1. Prompt you for your API keys
2. Create `backend/config/secrets.json`
3. Set secure file permissions (600)
4. Verify the file is in .gitignore

#### Manual Setup (Alternative)

1. Copy the example file:
   ```bash
   cp backend/config/secrets.example.json backend/config/secrets.json
   ```

2. Edit with your actual keys:
   ```bash
   nano backend/config/secrets.json
   ```

3. Set secure permissions:
   ```bash
   chmod 600 backend/config/secrets.json
   ```

#### Docker Compose Configuration

The `docker-compose.yml` automatically mounts the secrets file:

```yaml
volumes:
  - ./backend/config/secrets.json:/app/config/secrets.json:ro
```

The `:ro` flag makes it read-only inside the container for added security.

---

### GitHub Actions

#### Prerequisites

- GitHub CLI installed: https://cli.github.com/
- Authenticated with GitHub: `gh auth login`

#### Setup

```bash
./scripts/manage-secrets.sh setup-github
```

This will:
1. Read your local secrets
2. Set them as GitHub repository secrets
3. Optionally configure GCP deployment secrets

#### Manual Setup (Alternative)

Via GitHub CLI:
```bash
# Set secrets
echo "sk-your-key" | gh secret set OPENAI_API_KEY
echo "ghp_your-token" | gh secret set GITHUB_DEPLOYMENT_TOKEN

# Verify
gh secret list
```

Via GitHub Web UI:
1. Go to: https://github.com/YOUR-ORG/YOUR-REPO/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret:
   - `OPENAI_API_KEY`
   - `GITHUB_DEPLOYMENT_TOKEN`
   - `GCP_PROJECT_ID` (for Cloud Run deployment)
   - `WIF_PROVIDER` (Workload Identity Federation)
   - `WIF_SERVICE_ACCOUNT`

#### GitHub Workflow

The workflow `.github/workflows/deploy-cloud-run.yml` automatically uses these secrets:

```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy $SERVICE_NAME \
      --set-secrets="OPENAI_API_KEY=openai-api-key:latest" \
      --set-secrets="GITHUB_TOKEN=github-token:latest"
```

---

### Google Cloud Run

#### Prerequisites

- Google Cloud SDK installed: https://cloud.google.com/sdk/docs/install
- Authenticated with GCP: `gcloud auth login`
- Project selected: `gcloud config set project YOUR-PROJECT-ID`

#### Setup

```bash
./scripts/manage-secrets.sh setup-gcp
```

This will:
1. Enable Secret Manager API
2. Create secrets from your local configuration
3. Optionally grant access to Cloud Run service account

#### Manual Setup (Alternative)

```bash
# Enable API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo "sk-your-key" | gcloud secrets create openai-api-key \
  --data-file=- \
  --replication-policy="automatic"

echo "ghp_your-token" | gcloud secrets create github-token \
  --data-file=- \
  --replication-policy="automatic"

# Grant access to Cloud Run
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="${PROJECT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding github-token \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

#### Cloud Run Configuration

Secrets are mounted as environment variables:

```bash
gcloud run deploy c2pa-generator-assistant \
  --set-secrets="OPENAI_API_KEY=openai-api-key:latest" \
  --set-secrets="GITHUB_TOKEN=github-token:latest"
```

---

## 🎮 Secrets Management Commands

### Available Commands

```bash
./scripts/manage-secrets.sh <command>
```

| Command | Description | Use When |
|---------|-------------|----------|
| `setup-local` | Set up local development secrets | First time setup or new developer |
| `setup-github` | Configure GitHub repository secrets | Deploying via GitHub Actions |
| `setup-gcp` | Configure GCP Secret Manager | Deploying to Cloud Run |
| `rotate` | Rotate secrets across all environments | Security incident or periodic rotation |
| `validate` | Check secrets configuration | Debugging or security audit |
| `sync` | Sync local secrets to cloud | After updating local secrets |

### Command Details

#### setup-local

Interactive setup for local development:

```bash
./scripts/manage-secrets.sh setup-local
```

Prompts for:
- OpenAI API Key
- GitHub Token
- OpenWebUI URL (optional)

Creates: `backend/config/secrets.json` with 600 permissions

#### setup-github

Sync secrets to GitHub repository:

```bash
./scripts/manage-secrets.sh setup-github
```

Requires:
- Local secrets file exists
- GitHub CLI authenticated
- Write access to repository

#### setup-gcp

Create secrets in GCP Secret Manager:

```bash
./scripts/manage-secrets.sh setup-gcp
```

Requires:
- Local secrets file exists
- gcloud CLI authenticated
- Project selected

#### rotate

Rotate all secrets across environments:

```bash
./scripts/manage-secrets.sh rotate
```

Workflow:
1. Generate new keys from provider dashboards
2. Run rotate command
3. Enter new keys
4. Automatically updates all environments
5. Revoke old keys from dashboards

#### validate

Check secrets configuration:

```bash
./scripts/manage-secrets.sh validate
```

Checks:
- Local file exists and has correct permissions
- GitHub secrets are set
- GCP secrets exist
- Key formats are valid

Output example:
```
Local Development:
  ✓ Secrets file exists with secure permissions (600)
  ✓ OpenAI API Key is set
  ✓ GitHub Token is set

GitHub Secrets:
  ✓ OPENAI_API_KEY is set
  ✓ GITHUB_DEPLOYMENT_TOKEN is set

GCP Secret Manager:
  ✓ openai-api-key exists
  ✓ github-token exists
```

#### sync

Sync local secrets to all cloud environments:

```bash
./scripts/manage-secrets.sh sync
```

Use after:
- Updating local secrets file
- Generating new API keys locally
- Want to propagate changes to cloud

---

## 🔒 Security Best Practices

### Key Generation

#### OpenAI API Keys

1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a descriptive name (e.g., "C2PA-Generator-Production")
4. Copy the key immediately (shown only once)
5. Set appropriate permissions and limits

#### GitHub Personal Access Tokens

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name
4. Select scopes:
   - For public repos: `public_repo`
   - For private repos: `repo`
5. Set expiration (90 days recommended)
6. Copy the token

### Key Rotation Schedule

| Key Type | Rotation Frequency | Reason |
|----------|-------------------|---------|
| **Production Keys** | Every 90 days | Security best practice |
| **Staging Keys** | Every 180 days | Lower risk environment |
| **Development Keys** | On developer change | Team member turnover |

### Rotation Workflow

```bash
# 1. Generate new keys from provider dashboards
# 2. Rotate using the script
./scripts/manage-secrets.sh rotate

# 3. Restart services
docker-compose restart

# 4. Verify new keys work
./scripts/manage-secrets.sh validate

# 5. Revoke old keys from dashboards
```

### File Permissions

The secrets file **MUST** have `600` permissions (owner read/write only):

```bash
# Check permissions
ls -l backend/config/secrets.json

# Fix if needed
chmod 600 backend/config/secrets.json
```

### Git Protection

#### Pre-commit Hooks

Install the pre-commit hook to prevent accidental commits:

```bash
./scripts/install-git-hooks.sh
```

The hook detects:
- OpenAI API keys (`sk-...`)
- GitHub tokens (`ghp_...`, `github_pat_...`)
- Google API keys
- Common secret patterns

#### .gitignore

Verify these entries exist in `.gitignore`:

```
backend/config/secrets.json
.env
.env.local
.env.production
secrets/
```

### What NOT to Do

❌ **Never**:
- Commit secrets to git
- Share secrets via email/chat
- Include secrets in screenshots
- Log secrets in application logs
- Expose secrets in error messages
- Use the same key across environments
- Store secrets in unencrypted files with open permissions

✅ **Always**:
- Use secrets management systems
- Set file permissions to 600
- Rotate keys regularly
- Use different keys per environment
- Monitor key usage
- Revoke unused keys
- Use fine-grained permissions

---

## 🐛 Troubleshooting

### Secrets Not Loading

#### Check Priority Order

```bash
docker logs c2pa-generator-assistant | grep "Loaded secret"
```

Expected output:
```
info: Loaded secret 'OPENAI_API_KEY' from secrets file
info: Loaded secret 'GITHUB_TOKEN' from secrets file
```

#### Verify File Exists

```bash
ls -l backend/config/secrets.json
```

Should show:
```
-rw------- 1 user user 179 Jan 15 10:30 backend/config/secrets.json
```

#### Check File Contents

```bash
cat backend/config/secrets.json | jq '.'
```

Should show valid JSON with your keys.

### Permission Errors

```bash
# Error: Permission denied reading secrets file
chmod 600 backend/config/secrets.json

# Verify
./scripts/manage-secrets.sh validate
```

### GitHub Actions Failing

#### Check Secrets Are Set

```bash
gh secret list
```

#### View Workflow Logs

```bash
gh run list
gh run view <run-id> --log
```

#### Common Issues

1. **Secret not found**: Run `./scripts/manage-secrets.sh setup-github`
2. **Permission denied**: Check repository settings → Actions → General → Workflow permissions
3. **Invalid key format**: Regenerate key from provider dashboard

### GCP Secret Manager Issues

#### Check Secret Exists

```bash
gcloud secrets list
gcloud secrets describe openai-api-key
```

#### Check Permissions

```bash
gcloud secrets get-iam-policy openai-api-key
```

#### Grant Access

```bash
PROJECT_ID=$(gcloud config get-value project)
SERVICE_ACCOUNT="${PROJECT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud secrets add-iam-policy-binding openai-api-key \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

### Key Format Validation

#### OpenAI

```bash
# Valid formats
sk-proj-[48 characters]
sk-[48 characters]

# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" | jq .
```

#### GitHub

```bash
# Valid formats
ghp_[36 characters]              # Classic token
github_pat_[82 characters]       # Fine-grained token

# Test token
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user | jq .login
```

---

## ❓ FAQ

### Q: How do I get an OpenAI API key?

A: Visit https://platform.openai.com/api-keys and create a new secret key. Copy it immediately as it's only shown once.

### Q: Do I need different keys for dev/staging/prod?

A: **Yes!** Always use separate keys for each environment. This allows you to:
- Track usage per environment
- Revoke keys without affecting other environments
- Set different rate limits
- Maintain security isolation

### Q: What if I accidentally commit a secret?

A:
1. **Immediately** revoke the key from the provider dashboard
2. Remove it from git history:
   ```bash
   # Using BFG Repo-Cleaner
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```
3. Generate a new key
4. Update with `./scripts/manage-secrets.sh rotate`
5. Notify your security team

### Q: How often should I rotate keys?

A:
- **Production**: Every 90 days
- **Staging**: Every 180 days
- **Development**: On team changes
- **Emergency**: Immediately if compromised

### Q: Can I use environment variables instead?

A: **Not recommended** for production. Environment variables:
- Are visible in process listings (`ps aux`)
- Can be logged accidentally
- Are exposed in error dumps
- Are less secure than file-based or cloud secrets

Only use environment variables for local development.

### Q: How do I sync secrets to a new developer?

A:
1. Generate new API keys (don't share your keys!)
2. Send them the setup instructions:
   ```bash
   git clone <repo>
   ./scripts/manage-secrets.sh setup-local
   ```
3. They enter their own keys

### Q: What's the difference between GitHub Secrets and GCP Secret Manager?

A:
- **GitHub Secrets**: Used during GitHub Actions workflows (CI/CD)
- **GCP Secret Manager**: Used by the running application in Cloud Run

Both are needed for a complete deployment pipeline.

### Q: How do I debug secret loading?

A:
```bash
# Check logs
docker logs c2pa-generator-assistant | grep -i secret

# Validate configuration
./scripts/manage-secrets.sh validate

# Check file permissions
ls -l backend/config/secrets.json

# Test in container
docker exec c2pa-generator-assistant cat /app/config/secrets.json
```

---

## 📚 Additional Resources

- [SECURITY.md](../SECURITY.md) - Complete security guide
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GCP Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

---

**Last Updated**: 2025-10-14
**Version**: 2.0.0
