# OpenWebUI Integration

This guide explains how to integrate the C2PA Generator Product Certification Assistant with OpenWebUI for local AI inference.

## Overview

The application supports multiple AI providers in this priority order:
1. **OpenWebUI** (local, recommended for development)
2. **OpenAI API** (cloud-based, requires API key)
3. **Fallback Mode** (rule-based responses with GitHub RAG)

## Why OpenWebUI?

- **Free & Local**: Run powerful LLMs locally without API costs
- **Privacy**: Your data never leaves your machine
- **Multiple Models**: Support for Llama, Mistral, Phi, and more
- **Compatible API**: Uses OpenAI-compatible API format
- **Easy Setup**: Simple Docker-based installation

## Prerequisites

- Docker and Docker Compose installed
- At least 8GB RAM (16GB recommended for larger models)
- macOS, Linux, or Windows with WSL2

## Quick Setup

### 1. Install OpenWebUI

```bash
# Start OpenWebUI with Ollama backend
docker run -d \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:ollama
```

Alternatively, use the official installation script:
```bash
curl -fsSL https://openwebui.com/install.sh | sh
```

### 2. Access OpenWebUI

Open your browser and navigate to:
```
http://localhost:3000
```

Create an account (stored locally) and log in.

### 3. Install a Model

From the OpenWebUI interface:
1. Click **Settings** (gear icon)
2. Go to **Models**
3. Pull a model (e.g., `llama3.2:latest` or `llama3.2:3b` for faster inference)

Recommended models:
- **llama3.2:3b** - Fast, good for development (2GB)
- **llama3.2:latest** - Balanced performance (8GB)
- **mistral:latest** - Strong reasoning (4GB)
- **phi3:latest** - Efficient, Microsoft's model (2GB)

### 4. Configure C2PA Assistant

Add to your `.env` file:
```bash
# OpenWebUI Configuration
OPENWEBUI_URL=http://localhost:3000/api
AI_MODEL=llama3.2:latest
```

If you're running OpenWebUI in Docker, use the container's network address:
```bash
# For Docker-to-Docker communication
OPENWEBUI_URL=http://host.docker.internal:3000/api
```

### 5. Restart the Application

```bash
docker-compose up --build -d
```

Check the logs to confirm OpenWebUI is connected:
```bash
docker logs c2pa-generator-assistant | grep "AI Service"
```

You should see:
```
info: AI Service initialized with OpenWebUI at http://localhost:3000/api
```

## Configuration Options

### Environment Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `OPENWEBUI_URL` | OpenWebUI API endpoint | `http://localhost:3000/api` | (none) |
| `AI_MODEL` | Model to use for inference | `llama3.2:latest` | `gpt-4` |

### Docker Compose

For production deployments, add OpenWebUI as a service in `docker-compose.yml`:

```yaml
services:
  c2pa-assistant:
    # ... existing configuration ...
    depends_on:
      - openwebui
    environment:
      - OPENWEBUI_URL=http://openwebui:8080/api

  openwebui:
    image: ghcr.io/open-webui/open-webui:ollama
    ports:
      - "3000:8080"
    volumes:
      - openwebui-data:/app/backend/data
    restart: unless-stopped
    networks:
      - c2pa-network

volumes:
  openwebui-data:
```

## Testing the Integration

### 1. Check AI Provider Status

```bash
curl http://localhost:8080/health
```

Response should show the AI provider:
```json
{
  "status": "healthy",
  "aiProvider": "openwebui",
  "timestamp": "2025-10-14T14:30:00.000Z"
}
```

### 2. Test Chat Endpoint

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is C2PA?"}'
```

### 3. Test with GitHub RAG

```bash
# First, index a repository
curl -X POST http://localhost:8080/api/github/auth/token \
  -H "Content-Type: application/json" \
  -d '{"token": "ghp_YOUR_TOKEN"}'

curl -X POST http://localhost:8080/api/github/repos/index \
  -H "Content-Type: application/json" \
  -d '{"owner": "your-username", "repo": "your-repo"}'

# Then ask about the code
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me the authentication code from my repository"}'
```

## Troubleshooting

### OpenWebUI not responding

**Check if OpenWebUI is running:**
```bash
docker ps | grep open-webui
curl http://localhost:3000
```

**Check OpenWebUI logs:**
```bash
docker logs open-webui
```

### Model not found

**List available models in OpenWebUI:**
1. Open http://localhost:3000
2. Go to Settings > Models
3. Click "Pull a model" and enter model name

**Or use Ollama CLI:**
```bash
docker exec -it open-webui ollama list
docker exec -it open-webui ollama pull llama3.2:latest
```

### Slow responses

**Try a smaller model:**
```bash
# In .env
AI_MODEL=llama3.2:3b
```

**Or increase Docker resources:**
- Go to Docker Desktop > Settings > Resources
- Increase Memory to 16GB
- Increase CPUs to 4 or more

### Connection refused (Docker)

If running both services in Docker, use Docker's internal networking:

```bash
# In docker-compose.yml
OPENWEBUI_URL=http://openwebui:8080/api
```

Or use host.docker.internal:
```bash
# In .env
OPENWEBUI_URL=http://host.docker.internal:3000/api
```

## API Compatibility

OpenWebUI implements the OpenAI-compatible API format:

### Chat Completions
```javascript
POST /api/chat/completions
{
  "model": "llama3.2:latest",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ]
}
```

The C2PA Assistant automatically uses the correct endpoint based on configuration.

## Performance Tips

### 1. Choose the Right Model

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| llama3.2:3b | 2GB | ⚡⚡⚡ | ⭐⭐ | Quick testing |
| llama3.2:latest | 8GB | ⚡⚡ | ⭐⭐⭐ | Development |
| mistral:latest | 4GB | ⚡⚡ | ⭐⭐⭐ | Balanced |
| llama3.1:70b | 40GB | ⚡ | ⭐⭐⭐⭐⭐ | Production (GPU) |

### 2. Enable GPU Acceleration

For NVIDIA GPUs:
```bash
docker run -d \
  --gpus all \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:cuda
```

For Apple Silicon (M1/M2/M3):
```bash
# macOS uses Metal automatically, no extra configuration needed
docker run -d \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:ollama
```

### 3. Adjust Context Window

In OpenWebUI settings, reduce context length for faster responses:
- Navigate to Settings > Models > Advanced
- Set "Context Length" to 2048 or 4096 (default is often 8192)

## Advanced Configuration

### Custom System Prompt

The C2PA Assistant includes a specialized system prompt for certification guidance. To customize it, edit `backend/src/services/aiService.js`:

```javascript
const SYSTEM_PROMPT = `Your custom prompt here...`;
```

### Multiple Models

You can configure different models for different use cases:

```javascript
// In aiService.js
const chatModel = process.env.AI_MODEL || 'llama3.2:latest';
const analysisModel = process.env.AI_ANALYSIS_MODEL || 'mistral:latest';
```

### Streaming Responses

OpenWebUI supports streaming. To enable:

```javascript
const completion = await openai.chat.completions.create({
  model: process.env.AI_MODEL,
  messages,
  stream: true
});

for await (const chunk of completion) {
  // Handle streaming chunk
  console.log(chunk.choices[0]?.delta?.content || '');
}
```

## Security Considerations

### Network Isolation

For production, run OpenWebUI in an isolated network:

```yaml
networks:
  c2pa-network:
    driver: bridge
    internal: true  # Isolate from external access
```

### Authentication

OpenWebUI requires user authentication. Create admin credentials:

```bash
docker exec -it open-webui python manage.py createsuperuser
```

### Resource Limits

Prevent resource exhaustion:

```yaml
services:
  openwebui:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 16G
```

## Monitoring

### Check Model Performance

View OpenWebUI metrics:
```
http://localhost:3000/admin/models
```

### Application Logs

```bash
# C2PA Assistant logs
docker logs -f c2pa-generator-assistant | grep "AI Service"

# OpenWebUI logs
docker logs -f open-webui
```

## Fallback to OpenAI

To switch back to OpenAI:

1. Remove or comment out `OPENWEBUI_URL` in `.env`
2. Set `OPENAI_API_KEY` in `.env`
3. Restart: `docker-compose up --build -d`

## Resources

- **OpenWebUI Documentation**: https://docs.openwebui.com/
- **Ollama Models**: https://ollama.com/library
- **Model Comparison**: https://ollama.com/search
- **OpenWebUI GitHub**: https://github.com/open-webui/open-webui

## Next Steps

- [GitHub RAG Integration](GITHUB_RAG.md) - Add code search capabilities
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [API Reference](API_REFERENCE.md) - Complete API documentation
