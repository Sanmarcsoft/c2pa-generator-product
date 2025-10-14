# GitHub RAG Quick Start Guide

Get started with GitHub RAG integration in 5 minutes!

## Step 1: Get GitHub Token (2 minutes)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "C2PA Assistant"
4. Select scope: `repo` (or `public_repo` for public repos only)
5. Click "Generate token"
6. **Copy the token** (starts with `ghp_...`)

## Step 2: Add Token to Server (1 minute)

Choose the easiest method for your setup:

### Quick Method (Environment Variable)

1. Edit `.env` file:
   ```bash
   nano .env
   ```

2. Add this line:
   ```
   GITHUB_TOKEN=ghp_your_actual_token_here
   ```

3. Restart server:
   ```bash
   docker-compose restart backend
   ```

### Secure Method (Secrets File)

1. Create secrets file:
   ```bash
   cp backend/config/secrets.example.json backend/config/secrets.json
   nano backend/config/secrets.json
   ```

2. Add your token:
   ```json
   {
     "GITHUB_TOKEN": "ghp_your_actual_token_here"
   }
   ```

3. Set permissions:
   ```bash
   chmod 600 backend/config/secrets.json
   ```

4. Restart:
   ```bash
   docker-compose restart backend
   ```

## Step 3: Test Authentication (30 seconds)

```bash
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_your_token_here"}'
```

You should see:
```json
{
  "success": true,
  "user": { "login": "yourusername", ... }
}
```

## Step 4: Index a Repository (1-5 minutes)

```bash
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "yourusername",
    "repo": "your-repo-name"
  }'
```

Example with the C2PA reference implementation:
```bash
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "contentauth",
    "repo": "c2pa-js"
  }'
```

Wait for indexing to complete. You'll see:
```json
{
  "success": true,
  "filesIndexed": 127,
  "message": "Successfully indexed 127 files..."
}
```

## Step 5: Search Your Code (30 seconds)

```bash
curl -X POST http://localhost:8080/api/github/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "authentication",
    "limit": 3
  }'
```

You'll get relevant code snippets with links to GitHub!

## Common Use Cases

### Index Your Company's Repo

```bash
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "your-company",
    "repo": "your-app"
  }'
```

### Index a Specific Branch

```bash
curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "yourusername",
    "repo": "your-repo",
    "branch": "develop"
  }'
```

### View All Indexed Repos

```bash
curl http://localhost:8080/api/github/repos
```

### Search Within One Repo

```bash
curl -X POST http://localhost:8080/api/github/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "database connection",
    "repoFilter": "yourusername/your-repo"
  }'
```

## Integration with Chat

Once repositories are indexed, the AI assistant automatically searches them when you ask questions!

Try asking:
- "How do I create a C2PA manifest?" (if you indexed c2pa-js)
- "Show me authentication examples" (if you indexed your app)
- "How is error handling done in our code?"

The AI will include relevant code snippets from your GitHub repos in its responses!

## Troubleshooting

### "Authentication required"
- Make sure you added the token to `.env` or `secrets.json`
- Restart the backend: `docker-compose restart backend`

### "Repository not found"
- Check spelling of owner/repo names
- For private repos, ensure token has `repo` scope (not just `public_repo`)

### Slow indexing
- Large repos take longer (1000+ files = 2-5 minutes)
- Check progress in logs: `docker-compose logs -f backend`

## Next Steps

- Read the [Full Documentation](GITHUB_RAG.md) for advanced features
- See [Token Setup Guide](GITHUB_TOKEN_SETUP.md) for production deployment
- Check the [API Reference](GITHUB_RAG.md#api-reference) for all endpoints

---

That's it! You're now using GitHub RAG to enhance your AI assistant with your actual codebase. 🚀
