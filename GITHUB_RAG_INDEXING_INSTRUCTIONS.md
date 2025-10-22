# GitHub RAG Indexing Instructions

## Overview

A script has been created to index C2PA GitHub repositories into the RAG (Retrieval-Augmented Generation) system for code-aware AI assistance.

**Script Location:** `backend/scripts/index-c2pa-repos.js`

## What This Will Do

The script will automatically index these C2PA repositories:

1. **c2pa-org/specifications** - Public C2PA specifications
2. **c2pa-org/conformance-public** - C2PA Conformance Program documentation
3. **c2pa-org/public-draft** - Public drafts of C2PA Specifications
4. **c2pa-org/public-testfiles** - Test files for C2PA implementations
5. **c2pa-org/softbinding-algorithm-list** - C2PA approved soft binding algorithms

Once indexed, the AI assistant will have access to all C2PA specification files, conformance documentation, and technical references to provide more accurate, code-aware assistance.

## Prerequisites

### Required: GitHub Personal Access Token

You need a GitHub Personal Access Token to access the repositories (even though they're public, the GitHub API requires authentication for bulk operations).

### How to Generate a GitHub Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Or navigate: GitHub profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Click "Generate new token":**
   - Select "Generate new token (classic)"

3. **Configure the token:**
   - **Note:** "C2PA RAG Indexing for Sanmarcsoft"
   - **Expiration:** Choose "90 days" or "No expiration"
   - **Select scopes:** Check only `public_repo` (Read/write access to public repositories)
     - This is all you need for public C2PA repos

4. **Generate and copy the token:**
   - Click "Generate token" at the bottom
   - **IMPORTANT:** Copy the token immediately - you won't be able to see it again!
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Add token to .env file:**
   ```bash
   # Open the .env file
   nano .env

   # Find the line with GITHUB_TOKEN and replace the placeholder:
   GITHUB_TOKEN=ghp_your_actual_token_here

   # Save and exit (Ctrl+X, then Y, then Enter)
   ```

## Running the Indexing Script

Once you have added the GitHub token to your `.env` file:

```bash
# Navigate to the backend directory
cd /Volumes/Data/Users/matt/projects/c2pa-generator-product/backend

# Run the indexing script
node scripts/index-c2pa-repos.js
```

## What to Expect

The script will:

1. ✅ Authenticate with GitHub using your token
2. 📦 Index each repository one by one
3. 📄 Download and store indexable files (code, markdown, documentation)
4. 💾 Save everything to the SQLite database
5. 📊 Display a summary of indexed files

**Estimated time:** 5-10 minutes depending on repository sizes

## Expected Output

```
======================================================================
C2PA REPOSITORY INDEXING SCRIPT
======================================================================

🔐 Authenticating with GitHub...
✅ Authenticated as: your-github-username

📦 Indexing c2pa-org/specifications
   Public C2PA specifications

✅ SUCCESS: Successfully indexed 127 files from c2pa-org/specifications
   Files indexed: 127

----------------------------------------------------------------------

📦 Indexing c2pa-org/conformance-public
   C2PA Conformance Program documentation

✅ SUCCESS: Successfully indexed 45 files from c2pa-org/conformance-public
   Files indexed: 45

... (continues for all repositories) ...

======================================================================
INDEXING SUMMARY
======================================================================

✅ Successful: 5
❌ Failed: 0

Successfully indexed repositories:
  - c2pa-org/specifications (127 files)
  - c2pa-org/conformance-public (45 files)
  - c2pa-org/public-draft (23 files)
  - c2pa-org/public-testfiles (89 files)
  - c2pa-org/softbinding-algorithm-list (12 files)

Total repositories in RAG system: 5
```

## Verification

After successful indexing, you can verify via the API:

```bash
# Check indexed repositories
curl http://localhost:8080/api/github/repos

# Search indexed content
curl -X POST http://localhost:8080/api/github/search \
  -H "Content-Type: application/json" \
  -d '{"query": "manifest", "limit": 5}'
```

## Troubleshooting

### Error: "Invalid credentials" or "Bad credentials"
- Your GitHub token may be expired or invalid
- Generate a new token and update `.env`
- Make sure you copied the entire token (starts with `ghp_`)

### Error: "API rate limit exceeded"
- GitHub has rate limits (5,000 requests/hour for authenticated users)
- Wait an hour and try again
- Or use a different GitHub account's token

### Error: "Repository not found"
- The repository may have been renamed or made private
- Check if the repository exists: https://github.com/c2pa-org
- Remove that repository from the script if no longer available

### Script runs but no files indexed
- Check backend logs: `docker logs c2pa-generator-assistant`
- Ensure database has write permissions: `ls -la data/app.db`
- Try restarting the container: `docker-compose restart`

## Security Note

**IMPORTANT:** Never commit your GitHub token to git!

- The `.env` file is already in `.gitignored`
- Keep your token secure and don't share it
- If you accidentally expose it, revoke it immediately at https://github.com/settings/tokens

## Next Steps

After successful indexing:

1. **Test the RAG system** - Ask the AI assistant questions about C2PA specifications
2. **Admin interface** - View indexed repositories at `/admin/github` (requires admin login fix)
3. **Re-index updates** - Run the script periodically to update with latest C2PA changes

## Status

- [x] Script created: `backend/scripts/index-c2pa-repos.js`
- [ ] GitHub token configured in `.env`
- [ ] Script executed successfully
- [ ] Repositories verified in database

---

**Created:** October 22, 2025
**Last Updated:** October 22, 2025
