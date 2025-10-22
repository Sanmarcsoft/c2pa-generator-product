# Security Guidelines

## 🔒 Secrets Management

This project uses strict security practices to ensure **NO SECRETS ARE EVER COMMITTED TO GIT**.

### Files That Should NEVER Be Committed

The following files contain sensitive information and are excluded via `.gitignore`:

1. **Environment Files**
   - `.env` (local configuration with secrets)
   - `.env.local`
   - `.env.*.local`
   - `step-ca.env`

2. **Secret Configuration Files**
   - `backend/config/secrets.json` (API keys, tokens)
   - Any file matching `*secret*.csv`, `*secret*.gexf`, `*_secret_*.png`
   - `secrets/` directory

3. **Cryptographic Keys**
   - `*.pem` (private keys)
   - `*.key` (private keys)

### Safe Files (Can Be Committed)

These files are safe to commit as they only contain examples/templates:

- `.env.example` - Template with placeholder values
- `backend/config/secrets.example.json` - Template structure
- `backend/src/utils/secrets.js` - Secrets loading utility (no actual secrets)

## 🛡️ Setting Up Secrets Locally

1. **Copy the example files:**
   ```bash
   cp .env.example .env
   cp backend/config/secrets.example.json backend/config/secrets.json
   ```

2. **Edit the files with your actual secrets:**
   ```bash
   # Edit .env with your values
   nano .env

   # Edit secrets.json with your API keys
   nano backend/config/secrets.json
   ```

3. **Never commit these files:**
   - Git is configured to ignore them automatically
   - Double-check with: `git status`

## 🚨 What To Do If You Accidentally Commit Secrets

If you accidentally commit secrets to git:

1. **Immediately revoke the compromised credentials:**
   - GitHub tokens: https://github.com/settings/tokens
   - OpenAI API keys: https://platform.openai.com/api-keys
   - Other services: Check their security settings

2. **Remove from git history:**
   ```bash
   # Remove the file from git (keeps local copy)
   git rm --cached <filename>

   # Commit the removal
   git commit -m "Remove secret file from git"
   ```

3. **For already pushed commits:**
   - Contact repository admin immediately
   - Consider using tools like `git-filter-repo` or BFG Repo-Cleaner
   - Force push after cleaning (coordinate with team)

## 📋 Pre-Commit Checklist

Before committing, always verify:

- [ ] No `.env` files (only `.env.example` is allowed)
- [ ] No `secrets.json` files (only `secrets.example.json` is allowed)
- [ ] No hardcoded API keys, tokens, or passwords
- [ ] No private keys (`.pem`, `.key` files)
- [ ] Run `git status` to check what's being committed

## 🔑 Environment Variables Reference

### Required Secrets

These must be set in `.env` or `backend/config/secrets.json`:

- `GITHUB_TOKEN` - Personal access token for GitHub RAG integration
- `OPENAI_API_KEY` - (Optional) OpenAI API key for AI features

### Optional Secrets

- `OPENWEBUI_URL` - URL for OpenWebUI integration
- `GITHUB_OAUTH_CLIENT_ID` - For GitHub OAuth device flow

## 🐳 Docker Security

When using Docker, secrets are passed via:

1. **Environment variables** in `docker-compose.yml`:
   ```yaml
   environment:
     - GITHUB_TOKEN=${GITHUB_TOKEN}
   ```

2. **Docker secrets** (for production):
   ```yaml
   secrets:
     - github_token
   ```

**Never hardcode secrets in docker-compose.yml!**

## 📚 Additional Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [OWASP: Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App: Config](https://12factor.net/config)

## 🚀 CI/CD Security

When setting up CI/CD pipelines:

- Use GitHub Secrets or equivalent for sensitive values
- Never echo secrets in logs
- Use environment-specific credentials
- Rotate secrets regularly

---

**Remember: When in doubt, don't commit it! It's easier to add secrets later than to remove them from git history.**
