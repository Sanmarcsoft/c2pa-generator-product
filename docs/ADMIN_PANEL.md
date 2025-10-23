# Admin Control Panel

The Admin Control Panel provides a web-based interface for administrators to configure AI providers, GitHub integration, and system settings without needing to modify configuration files directly.

## Accessing the Admin Panel

### Requirements
- Admin user account (role: `admin`)
- Logged into the application

### Access URL
Navigate to: **http://localhost:8080/admin**

The admin panel link will appear in the header navigation (⚙️ ADMIN) for users with admin privileges.

## Features

### 1. System Statistics Dashboard

View real-time system statistics including:
- Total users and admin users
- Current AI provider
- Onboarding status
- System uptime and Node.js version

### 2. AI Provider Configuration

Configure the AI assistant's backend provider:

#### Options:

**OpenWebUI (Recommended)**
- Run AI models locally using Ollama or other backends
- Free and private
- Configuration:
  - **OpenWebUI API URL**: e.g., `http://localhost:3000/api` or `http://host.docker.internal:3000/api`
  - **OpenWebUI API Key**: Optional, leave blank if not required
  - **AI Model**: Optional, specify model name (e.g., `llama2`, `mistral`)

**OpenAI API**
- Cloud-based AI from OpenAI
- Requires API key (costs apply)
- Configuration:
  - **OpenAI API Key**: Your OpenAI API key (starts with `sk-`)
  - **AI Model**: Optional, defaults to `gpt-4`

**Fallback Mode (None)**
- Rule-based responses without AI
- Good for testing or limited functionality
- No configuration required

#### Test Connection
- Use the "Test Connection" button to verify your AI provider setup
- Shows available models and connection status

### 3. GitHub Integration Configuration

Enable code search and RAG (Retrieval-Augmented Generation) features:

- **Enable/Disable Toggle**: Turn GitHub integration on or off
- **GitHub Personal Access Token**: Required for authentication
  - [Create a token](https://github.com/settings/tokens) with `repo` or `public_repo` scope
  - Token is stored securely in secrets

### 4. Configuration Management

All settings are:
- Saved to the database
- Applied immediately (some may require restart)
- Securely stored (API keys/tokens use secrets management)

## API Endpoints

### GET /api/admin/config
Get current admin configuration

**Auth**: Required (Admin only)

**Response**:
```json
{
  "success": true,
  "settings": {
    "ai_provider": "openwebui",
    "openwebui_url": "http://localhost:3000/api",
    "ai_model": "llama2",
    "github_configured": true
  },
  "secrets": {
    "hasOpenAIKey": false,
    "hasOpenWebUIKey": true,
    "hasGitHubToken": true
  }
}
```

### PUT /api/admin/config/ai
Update AI provider configuration

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "provider": "openwebui",
  "openwebuiUrl": "http://localhost:3000/api",
  "aiModel": "llama2",
  "openwebuiApiKey": "optional-api-key"
}
```

**Response**:
```json
{
  "success": true,
  "message": "AI configuration updated successfully",
  "requiresRestart": false
}
```

### PUT /api/admin/config/github
Update GitHub integration configuration

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "token": "ghp_xxxxxxxxxxxxx",
  "configured": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "GitHub configuration updated successfully"
}
```

### POST /api/admin/config/test-ai
Test AI provider connection

**Auth**: Required (Admin only)

**Request Body**:
```json
{
  "provider": "openwebui",
  "openwebuiUrl": "http://localhost:3000/api"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Connected successfully! Found 5 models.",
  "models": ["llama2", "mistral", "codellama", "vicuna", "phi"]
}
```

### GET /api/admin/stats
Get system statistics

**Auth**: Required (Admin only)

**Response**:
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 3,
      "admins": 1
    },
    "settings": {
      "total": 8
    },
    "system": {
      "onboardingCompleted": true,
      "aiProvider": "openwebui",
      "nodeVersion": "v18.17.0",
      "uptime": 123456
    }
  }
}
```

## Security Considerations

### Secret Management
- API keys and tokens are stored using the secrets management system
- Secrets are never returned in API responses (only presence is indicated)
- Secrets are stored in `backend/config/secrets.json` (gitignored)

### Access Control
- All admin endpoints require authentication
- All admin endpoints require admin role (`requireAdmin` middleware)
- Non-admin users receive 403 Forbidden errors

### Environment Variables
- Configuration updates set runtime environment variables
- Some changes (especially secrets) may require container restart
- Production deployments should use Docker secrets or cloud secret managers

## Usage Examples

### Example 1: Configure OpenWebUI

1. Navigate to http://localhost:8080/admin
2. Select "OpenWebUI (Local)" as AI Provider
3. Enter API URL: `http://host.docker.internal:3000/api`
4. Leave API Key blank (if not required)
5. Click "Test Connection" to verify
6. Click "Save AI Configuration"

### Example 2: Switch to OpenAI API

1. Navigate to http://localhost:8080/admin
2. Select "OpenAI API" as AI Provider
3. Enter your OpenAI API Key
4. Optionally specify model (e.g., `gpt-3.5-turbo`)
5. Click "Save AI Configuration"

### Example 3: Enable GitHub Integration

1. Navigate to http://localhost:8080/admin
2. Check "Enable GitHub Integration"
3. Enter your GitHub Personal Access Token
4. Click "Save GitHub Configuration"
5. Go to the onboarding wizard or settings to index repositories

## Troubleshooting

### Cannot Access Admin Panel
- **Issue**: 403 Forbidden error
- **Solution**: Ensure your user account has `role: admin`
  - Use `/scripts/set-admin.sh` to create/update admin users
  - Check `ADMIN_SETUP.md` for detailed instructions

### AI Connection Test Fails
- **Issue**: "Connection failed" error
- **Solutions**:
  - Verify the API URL is correct and accessible from the container
  - For Docker: Use `host.docker.internal` instead of `localhost`
  - Check API key is valid (if required)
  - Ensure OpenWebUI/OpenAI service is running

### Settings Not Persisting
- **Issue**: Configuration resets after container restart
- **Solutions**:
  - Ensure database volume is properly mounted
  - Check `docker-compose.yml` for correct volume configuration
  - For secrets, may need to use environment variables or Docker secrets

### GitHub Integration Not Working
- **Issue**: Code search returns no results
- **Solutions**:
  - Verify token has correct permissions (`repo` or `public_repo`)
  - Check token hasn't expired
  - Ensure repositories are indexed (see onboarding wizard)
  - Check backend logs for API errors

## Development Notes

### File Structure
```
backend/src/routes/admin.js       # Admin API routes
frontend/src/pages/AdminPage.jsx  # Admin panel UI
frontend/src/pages/AdminPage.css  # Admin panel styles
```

### Adding New Settings

To add a new admin-configurable setting:

1. Add field to admin panel UI (`AdminPage.jsx`)
2. Add API endpoint or extend existing one (`admin.js`)
3. Update database schema if needed (`database.js`)
4. Update this documentation

### Testing

Test admin endpoints:
```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sanmarcsoft.com","password":"YourPassword"}' \
  | jq -r '.token')

# Get admin config
curl -X GET http://localhost:8080/api/admin/config \
  -H "Authorization: Bearer $TOKEN" | jq

# Update AI config
curl -X PUT http://localhost:8080/api/admin/config/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"provider":"openwebui","openwebuiUrl":"http://localhost:3000/api"}' | jq

# Test AI connection
curl -X POST http://localhost:8080/api/admin/config/test-ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"provider":"openwebui","openwebuiUrl":"http://localhost:3000/api"}' | jq
```

## Related Documentation

- [Admin Setup Guide](../ADMIN_SETUP.md) - Creating admin users
- [OpenWebUI Integration](./OPENWEBUI_INTEGRATION.md) - OpenWebUI setup
- [Secrets Management](./SECRETS_MANAGEMENT.md) - Managing secrets
- [Authentication Testing](./AUTH_TESTING.md) - Testing auth flows

---

**Need Help?** Contact the development team or refer to the [main documentation](../README.md).
