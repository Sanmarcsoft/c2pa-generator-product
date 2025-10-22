# Adding GitHub Token to Running Server

This guide shows you how to add your GitHub Personal Access Token to the C2PA Generator Assistant application.

## Quick Start (3 Methods)

There are three ways to add your GitHub token, listed from most to least secure:

### Method 1: Docker Secrets (Production - Most Secure)

**Best for:** Production deployments using Docker

1. **Create secrets directory:**
   ```bash
   mkdir -p secrets
   chmod 700 secrets
   ```

2. **Add your GitHub token to a file:**
   ```bash
   echo "ghp_your_actual_token_here" > secrets/GITHUB_TOKEN
   chmod 600 secrets/GITHUB_TOKEN
   ```

3. **Update docker-compose.yml** (uncomment the secrets section):
   ```yaml
   secrets:
     github_token:
       file: ./secrets/GITHUB_TOKEN

   services:
     backend:
       secrets:
         - github_token
   ```

4. **Restart the application:**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Method 2: File-Based Secrets (Development - Secure)

**Best for:** Local development with multiple team members

1. **Create secrets.json file:**
   ```bash
   cd backend/config
   cp secrets.example.json secrets.json
   ```

2. **Edit the secrets.json file:**
   ```bash
   nano secrets.json
   ```

   Update it with your actual token:
   ```json
   {
     "OPENAI_API_KEY": "sk-your-openai-key",
     "GITHUB_TOKEN": "ghp_your_actual_github_token_here"
   }
   ```

3. **Set secure permissions:**
   ```bash
   chmod 600 secrets.json
   ```

4. **For Docker users, update docker-compose.yml:**

   Uncomment the volume mount:
   ```yaml
   services:
     backend:
       volumes:
         - ./backend/config/secrets.json:/app/config/secrets.json:ro
   ```

5. **Restart the application:**
   ```bash
   docker-compose restart backend
   ```

### Method 3: Environment Variable (Development Only)

**Best for:** Quick testing (least secure)

#### Option A: Add to .env file

1. **Edit your .env file:**
   ```bash
   nano .env
   ```

2. **Add your GitHub token:**
   ```bash
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

3. **Restart the application:**
   ```bash
   docker-compose restart backend
   ```

#### Option B: Set directly in shell (temporary)

```bash
export GITHUB_TOKEN=ghp_your_actual_token_here
npm run dev
```

**Note:** This only lasts for the current terminal session.

## Getting Your GitHub Token

If you don't have a GitHub Personal Access Token yet:

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a name: "C2PA Assistant"
4. Set expiration (recommended: 90 days or less)
5. Select scopes:
   - For **public repos only**: Check `public_repo`
   - For **private repos**: Check `repo` (full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token immediately** (starts with `ghp_...`) - you won't see it again!

## Verifying It Works

After adding your token, test the authentication:

### Using curl:

```bash
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_your_token_here"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully authenticated with GitHub",
  "user": {
    "login": "yourusername",
    "name": "Your Name",
    "email": "your@email.com"
  }
}
```

### Check auth status:

```bash
curl http://localhost:8080/api/github/auth/status
```

## Security Best Practices

1. **Never commit tokens to git**
   - `.env`, `secrets.json`, and `secrets/` are already in `.gitignore`
   - Double-check before committing: `git status`

2. **Use minimum required permissions**
   - Public repos only → `public_repo` scope
   - Private repos → `repo` scope
   - Don't grant unnecessary permissions

3. **Rotate tokens regularly**
   - Generate new tokens every 90 days
   - Delete old tokens from GitHub settings

4. **Use file permissions**
   - Secrets files should be `chmod 600` (read/write by owner only)
   - Secrets directory should be `chmod 700`

5. **Different tokens for different environments**
   - Development: Personal token with limited scope
   - Production: Organization token with restricted access

## Troubleshooting

### Token not recognized

**Problem:** API returns "GitHub authentication required"

**Solutions:**
1. Verify token is in the correct file/environment variable
2. Check for typos in token (copy-paste it fresh)
3. Restart the backend: `docker-compose restart backend`
4. Check logs: `docker-compose logs backend`

### Permission denied errors

**Problem:** "secrets.json has insecure permissions"

**Solution:**
```bash
chmod 600 backend/config/secrets.json
```

### Token expired

**Problem:** "Bad credentials" error from GitHub API

**Solution:**
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Check if your token is expired
3. Generate a new token
4. Update your secrets file/environment variable

### Can't access private repositories

**Problem:** "Repository not found" for private repos

**Solution:**
- Ensure your token has `repo` scope (not just `public_repo`)
- Regenerate token with correct permissions

## For Different Environments

### Local Development (Your Machine)

Use **Method 2** (File-Based Secrets):
- Easy to manage
- Secure enough for local dev
- Not committed to git

### CI/CD (GitHub Actions, etc.)

Use GitHub Secrets:
```yaml
- name: Set GitHub Token
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Production Server

Use **Method 1** (Docker Secrets):
- Most secure
- Token never in environment variables
- Separate file with restricted permissions

### Docker Desktop / Local Docker

Use **Method 2** or **Method 3**:
- Mount secrets.json as volume
- Or use .env file for simplicity

## Complete Example

Here's a complete setup for local development:

```bash
# 1. Get token from GitHub
# https://github.com/settings/tokens

# 2. Create secrets file
cd c2pa-generator-product/backend/config
cp secrets.example.json secrets.json

# 3. Edit secrets.json (use your actual token)
cat > secrets.json << EOF
{
  "OPENAI_API_KEY": "sk-your-openai-key",
  "GITHUB_TOKEN": "ghp_your_github_token_here"
}
EOF

# 4. Set permissions
chmod 600 secrets.json

# 5. Verify
ls -la secrets.json
# Should show: -rw------- (600)

# 6. Update docker-compose.yml to mount secrets.json
# Uncomment this line:
#   - ./backend/config/secrets.json:/app/config/secrets.json:ro

# 7. Restart
cd ../..
docker-compose restart backend

# 8. Test
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$(cat backend/config/secrets.json | grep GITHUB_TOKEN | cut -d'"' -f4)\"}"
```

## Next Steps

Once your token is configured:

1. **Authenticate** with the API (see above)
2. **Index a repository**:
   ```bash
   curl -X POST http://localhost:8080/api/github/repos/index \
     -H "Content-Type: application/json" \
     -d '{"owner": "yourusername", "repo": "your-repo"}'
   ```
3. **Start asking questions** that reference your code!

For complete usage instructions, see [GITHUB_RAG.md](./GITHUB_RAG.md).

---

Need help? Check the logs: `docker-compose logs -f backend`
