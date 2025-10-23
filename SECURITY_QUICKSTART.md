# 🔒 Security Quick Start

**⚠️ IMPORTANT: Your GitHub token was detected in a previous commit. Follow these steps immediately!**

## Immediate Actions Required

### 1. Revoke the Compromised Token

```bash
# Go to GitHub settings
open https://github.com/settings/tokens

# Find and revoke the exposed token
# Then generate a new one
```

### 2. Set Up Secure Secrets (5 minutes)

```bash
# Install git hooks to prevent future accidents
./scripts/install-git-hooks.sh

# Set up your secrets securely
./scripts/manage-secrets.sh setup-local

# Restart containers with new secrets
docker-compose restart

# Verify secrets are loaded correctly
docker logs c2pa-generator-assistant | grep "Loaded secret"
```

### 3. Sync to Cloud (if deploying)

```bash
# For GitHub Actions deployment
./scripts/manage-secrets.sh setup-github

# For Google Cloud Run deployment
./scripts/manage-secrets.sh setup-gcp
```

---

## How Secrets Are Managed Now

### ✅ Secure (What We Use)

1. **Local Development**: File-based secrets with 600 permissions
   ```
   backend/config/secrets.json  (gitignored, read-only in Docker)
   ```

2. **GitHub Actions**: GitHub Encrypted Secrets
   ```
   Repository Settings → Secrets and variables → Actions
   ```

3. **Google Cloud Run**: GCP Secret Manager
   ```
   Encrypted at rest, accessed via IAM permissions
   ```

### ❌ Insecure (What We Don't Use Anymore)

- ❌ API keys in environment variables
- ❌ Secrets in docker-compose.yml
- ❌ .env files (except for non-sensitive config)
- ❌ Hardcoded keys in code

---

## Protection Layers

| Layer | Protection | How |
|-------|------------|-----|
| **Git** | Pre-commit hook | Scans for API keys before commit |
| **File System** | 600 permissions | Only owner can read secrets file |
| **Ignore** | .gitignore | Prevents accidental git add |
| **Cloud** | Encryption | Secrets encrypted at rest & in transit |
| **Access** | IAM | Only authorized services can access |

---

## Quick Commands

```bash
# Set up everything (first time)
./scripts/manage-secrets.sh setup-local
./scripts/install-git-hooks.sh

# Validate your setup
./scripts/manage-secrets.sh validate

# Rotate secrets (every 90 days)
./scripts/manage-secrets.sh rotate

# Sync local → cloud
./scripts/manage-secrets.sh sync
```

---

## Getting API Keys

### OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it: "C2PA-Generator-Dev"
4. Copy immediately (shown only once!)
5. Paste into setup script

### GitHub Token
1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "C2PA Generator RAG"
4. Select scope: `repo` (or `public_repo` for public only)
5. Set expiration: 90 days
6. Copy and paste into setup script

---

## Security Checklist

Before deploying to production:

- [ ] Revoked old/compromised tokens
- [ ] Generated new API keys
- [ ] Ran `./scripts/manage-secrets.sh setup-local`
- [ ] Installed git hooks (`./scripts/install-git-hooks.sh`)
- [ ] Verified secrets file permissions are 600
- [ ] Configured GitHub secrets (if using Actions)
- [ ] Configured GCP Secret Manager (if using Cloud Run)
- [ ] Tested with `./scripts/manage-secrets.sh validate`
- [ ] Different keys for dev/staging/prod
- [ ] Documented key rotation schedule

---

## Need Help?

- **Full Documentation**: [docs/SECRETS_MANAGEMENT.md](docs/SECRETS_MANAGEMENT.md)
- **Security Guide**: [SECURITY.md](SECURITY.md)
- **Troubleshooting**: Run `./scripts/manage-secrets.sh validate`

---

**🚨 Remember**: Never commit API keys to git. Always use the secrets management system!
