# Quick Installation Guide

Get the C2PA Generator Product Certification Assistant up and running in minutes!

## System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL2
- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Docker Desktop**: Latest version
- **RAM**: Minimum 4GB, 8GB recommended
- **Disk Space**: 2GB free space

## Installation Methods

Choose one of the following installation methods:

---

## Method 1: Quick Start (Recommended)

**Time:** 5 minutes

### Step 1: Clone Repository

```bash
git clone https://github.com/smsmatt/c2pa-generator-product.git
cd c2pa-generator-product
```

### Step 2: Start with Docker

```bash
npm start
```

That's it! The application will:
- Check Docker is running
- Find an available port (8080-8090)
- Build and start containers
- Display the access URL

**Access:** `http://localhost:8080`

---

## Method 2: Manual Setup

**Time:** 10 minutes

### Step 1: Clone and Install

```bash
# Clone repository
git clone https://github.com/smsmatt/c2pa-generator-product.git
cd c2pa-generator-product

# Install dependencies
npm run install:all
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Optional: Edit .env with your settings
nano .env
```

### Step 3: Start with Docker

```bash
docker-compose up --build
```

**Access:** `http://localhost:8080`

---

## Method 3: Development Mode

**Time:** 15 minutes (for developers)

### Step 1: Clone and Install

```bash
git clone https://github.com/smsmatt/c2pa-generator-product.git
cd c2pa-generator-product
npm run install:all
```

### Step 2: Configure Environment

```bash
cp .env.example .env
# Add your OpenAI API key (optional)
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

Backend runs at: `http://localhost:8080`

### Step 4: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Verification

### 1. Check Backend Health

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T12:00:00.000Z",
  "service": "C2PA Generator Assistant API"
}
```

### 2. Access Frontend

Open browser and navigate to:
- Docker: `http://localhost:8080`
- Dev Mode: `http://localhost:5173`

You should see the retro 8-bit interface!

### 3. Test AI Assistant

1. Click on "CHAT" in navigation
2. Type "Hello" in the chat input
3. Press Send
4. You should receive a response from the AI assistant

---

## Common Issues

### Docker Not Running

**Problem:** `Docker is not running` error

**Solution:**
```bash
# macOS: Start Docker Desktop from Applications
# Windows: Start Docker Desktop from Start Menu
# Linux:
sudo systemctl start docker
```

### Port Already in Use

**Problem:** Port 8080 is already in use

**Solution:**
```bash
# Option 1: Use different port
PORT=8085 docker-compose up

# Option 2: Find and kill process using port
lsof -ti:8080 | xargs kill -9
```

### Permission Errors

**Problem:** Permission denied errors

**Solution:**
```bash
# Fix directory permissions
chmod +x scripts/*.sh scripts/*.js

# Fix data directory permissions
sudo chown -R $USER:$USER data/ logs/
```

### NPM Install Fails

**Problem:** npm install errors

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# If still failing, check Node version
node --version  # Should be >= 20.0.0
```

### OpenAI API Errors

**Problem:** AI assistant not responding or API errors

**Solution:**

The AI assistant has a fallback mode that works without OpenAI:

1. It will automatically use fallback responses
2. Or configure local LLM (optional):

```bash
# In .env file:
USE_LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

---

## Next Steps

After successful installation:

1. **Read the User Guide**
   - Open `docs/USER_GUIDE.md`
   - Understand the 6-phase process
   - Learn how to use features

2. **Explore the Interface**
   - Navigate through HOME, CHAT, DOCUMENTS, PROGRESS
   - Get familiar with the retro design
   - Try uploading a test document

3. **Start Your Certification Journey**
   - Begin with Phase 1: Introduction & Prerequisites
   - Ask the AI assistant questions
   - Track your progress

4. **Configure for Your Needs**
   - Add your OpenAI API key for enhanced AI features
   - Customize environment variables
   - Set up your preferred workflow

---

## Updating

### Update to Latest Version

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm run install:all

# Rebuild Docker containers
docker-compose up --build
```

---

## Uninstalling

### Remove Application

```bash
# Stop and remove containers
docker-compose down -v

# Remove repository
cd ..
rm -rf c2pa-generator-product
```

### Clean Docker

```bash
# Remove all unused Docker resources
docker system prune -a
```

---

## Getting Help

### Documentation

- [User Guide](docs/USER_GUIDE.md) - How to use the application
- [API Documentation](docs/API.md) - API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [Contributing](docs/CONTRIBUTING.md) - Development guide

### Support Channels

- **GitHub Issues**: https://github.com/smsmatt/c2pa-generator-product/issues
- **Email**: support@sanmarcsoft.com
- **Documentation**: Full technical spec in `SPEC.md`

---

## Quick Command Reference

```bash
# Start application
npm start

# Build and run with Docker
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Install dependencies
npm run install:all

# Find available port
npm run find-port

# Clean everything
npm run clean
```

---

## System Check

Run this to verify your system is ready:

```bash
# Check Node version
node --version  # Should be >= 20.0.0

# Check npm version
npm --version   # Should be >= 9.0.0

# Check Docker
docker --version

# Check Docker Compose
docker-compose --version

# Check Docker is running
docker ps
```

All commands should return version numbers without errors.

---

## Success Criteria

You've successfully installed when:

✅ Docker containers are running
✅ Backend health check returns "healthy"
✅ Frontend loads in browser
✅ You can see the retro 8-bit interface
✅ AI assistant responds to messages
✅ You can navigate between pages

**Welcome aboard! Level up your content provenance game! 🎮**

---

**Last Updated:** October 2025
**Version:** 1.0.0
