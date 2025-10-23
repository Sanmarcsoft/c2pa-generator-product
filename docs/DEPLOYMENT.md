# Deployment Guide

This guide covers deploying the C2PA Generator Product Certification Assistant both locally and to Google Cloud Platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Desktop Deployment](#docker-desktop-deployment)
4. [Google Cloud Platform Deployment](#google-cloud-platform-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: >= 20.0.0
- **npm**: >= 9.0.0
- **Docker Desktop**: Latest version
- **Git**: For version control
- **Google Cloud SDK** (for production deployment)

### Required Accounts

- **OpenAI Account**: For AI functionality (optional - has fallback)
- **Google Cloud Account**: For production deployment
- **GitHub Account**: For repository access

---

## Local Development

### 1. Clone the Repository

```bash
git clone https://github.com/smsmatt/c2pa-generator-product.git
cd c2pa-generator-product
```

### 2. Install Dependencies

#### Option A: Install All at Once
```bash
npm run install:all
```

#### Option B: Install Individually
```bash
# Backend
npm run install:backend

# Frontend
npm run install:frontend
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required Configuration:**
```env
NODE_ENV=development
PORT=8080
OPENAI_API_KEY=sk-your-api-key-here  # Optional
```

### 4. Run in Development Mode

#### Frontend Only (Vite Dev Server)
```bash
cd frontend
npm run dev
```
Opens at `http://localhost:5173`

#### Backend Only
```bash
cd backend
npm run dev
```
Runs at `http://localhost:8080`

#### Both (Separate Terminals)
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

---

## Docker Desktop Deployment

### Quick Start

The easiest way to run the full application:

```bash
npm start
```

This script will:
1. Check if Docker is running
2. Find an available port (8080-8090)
3. Build and start the Docker containers
4. Display access URL

### Manual Docker Commands

#### Build and Start
```bash
docker-compose up --build
```

#### Start (without rebuilding)
```bash
docker-compose up
```

#### Run in Background
```bash
docker-compose up -d
```

#### View Logs
```bash
docker-compose logs -f
```

#### Stop Containers
```bash
docker-compose down
```

#### Clean Everything (including volumes)
```bash
docker-compose down -v
rm -rf data/*.db logs/*.log
```

### Custom Port

```bash
PORT=8085 docker-compose up
```

### Accessing the Application

Once running:
- **Frontend + Backend**: `http://localhost:8080`
- **API**: `http://localhost:8080/api`
- **Health Check**: `http://localhost:8080/health`

### Docker Troubleshooting

#### Port Already in Use
```bash
# Find available port
npm run find-port

# Or specify custom port
PORT=8085 docker-compose up
```

#### Permission Errors
```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/ logs/
```

#### Image Build Fails
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

---

## Google Cloud Platform Deployment

### Prerequisites

1. **Install Google Cloud SDK**
```bash
# macOS
brew install --cask google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install
```

2. **Authenticate**
```bash
gcloud auth login
gcloud auth application-default login
```

3. **Set Project**
```bash
gcloud config set project YOUR_PROJECT_ID
```

### Deployment Methods

#### Method 1: Cloud Run (Recommended)

**Advantages:**
- Automatic scaling
- Pay per use
- Simple deployment
- Built-in HTTPS

**Steps:**

1. **Enable Required APIs**
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

2. **Build and Push Image**
```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export IMAGE_NAME=c2pa-generator-assistant
export REGION=us-central1

# Build image using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME

# Or build locally and push
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME .
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME
```

3. **Deploy to Cloud Run**
```bash
gcloud run deploy c2pa-generator-assistant \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-env-vars PORT=8080 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

4. **Set Environment Variables**
```bash
gcloud run services update c2pa-generator-assistant \
  --update-env-vars OPENAI_API_KEY=your-key-here \
  --region $REGION
```

5. **Map Custom Domain**
```bash
# First, verify domain ownership in Google Cloud Console
# Then map the domain
gcloud run domain-mappings create \
  --service c2pa-generator-assistant \
  --domain generator-product.trusteddit.com \
  --region $REGION
```

6. **Update DNS Records**

Add the DNS records provided by Cloud Run to your domain registrar:
- Type: `CNAME`
- Name: `generator-product`
- Value: `ghs.googlehosted.com`

#### Method 2: Google Kubernetes Engine (GKE)

**Advantages:**
- More control
- Better for complex deployments
- Multi-container orchestration

**Basic Steps:**

1. **Create GKE Cluster**
```bash
gcloud container clusters create c2pa-cluster \
  --region $REGION \
  --num-nodes 2 \
  --machine-type n1-standard-1
```

2. **Get Credentials**
```bash
gcloud container clusters get-credentials c2pa-cluster --region $REGION
```

3. **Deploy Using Kubernetes**
```bash
# Create deployment.yaml and service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

4. **Setup Ingress for HTTPS**
```bash
kubectl apply -f k8s/ingress.yaml
```

### GitHub Actions CI/CD

The repository includes a GitHub Actions workflow template. To enable:

1. **Create Service Account**
```bash
gcloud iam service-accounts create github-actions \
  --display-name "GitHub Actions"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin" \
  --role="roles/storage.admin" \
  --role="roles/iam.serviceAccountUser"
```

2. **Create Key**
```bash
gcloud iam service-accounts keys create key.json \
  --iam-account github-actions@$PROJECT_ID.iam.gserviceaccount.com
```

3. **Add GitHub Secrets**

Go to your GitHub repository settings → Secrets and add:
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_SA_KEY`: Contents of key.json
- `GCP_REGION`: Deployment region (e.g., us-central1)

4. **Push to Main Branch**

The workflow will automatically deploy on push to main branch.

---

## Environment Configuration

### Development Environment

```env
NODE_ENV=development
PORT=8080
OPENAI_API_KEY=sk-your-key
DATABASE_URL=sqlite:///app/data/app.db
CORS_ORIGIN=http://localhost:5173
```

### Production Environment

```env
NODE_ENV=production
PORT=8080
OPENAI_API_KEY=sk-your-production-key
DATABASE_URL=sqlite:///app/data/app.db
CORS_ORIGIN=https://generator-product.trusteddit.com
MAX_FILE_SIZE=50000000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

### Using Local LLM (Alternative to OpenAI)

```env
USE_LOCAL_LLM=true
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

---

## Monitoring and Maintenance

### Health Checks

```bash
# Local
curl http://localhost:8080/health

# Production
curl https://generator-product.trusteddit.com/health
```

### View Logs

#### Local Docker
```bash
docker-compose logs -f
```

#### Cloud Run
```bash
gcloud run services logs read c2pa-generator-assistant \
  --region $REGION \
  --limit 100
```

### Database Backup

```bash
# Backup SQLite database
cp data/app.db data/app.db.backup.$(date +%Y%m%d)

# Restore
cp data/app.db.backup.20251014 data/app.db
```

### Update Deployment

```bash
# Rebuild and redeploy
docker-compose up --build -d

# Or for Cloud Run
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME
gcloud run deploy c2pa-generator-assistant \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION
```

---

## Security Considerations

### 1. Environment Variables

Never commit `.env` files. Use:
- Google Secret Manager for production
- GitHub Secrets for CI/CD
- Local .env files for development

### 2. HTTPS

Always use HTTPS in production:
- Cloud Run provides automatic HTTPS
- Use custom domain with SSL certificate

### 3. Rate Limiting

Configure appropriate rate limits in production:
```env
RATE_LIMIT_WINDOW=15  # minutes
RATE_LIMIT_MAX_REQUESTS=100  # per window
```

### 4. CORS

Restrict CORS to your production domain:
```env
CORS_ORIGIN=https://generator-product.trusteddit.com
```

---

## Troubleshooting

### Port Conflicts

```bash
# Find process using port
lsof -ti:8080 | xargs kill -9

# Or use different port
PORT=8085 npm start
```

### Docker Issues

```bash
# Restart Docker Desktop
# On macOS: Restart from menu bar

# Clean everything
docker system prune -a -f --volumes
```

### Database Locked

```bash
# Stop all services
docker-compose down

# Remove lock file
rm data/app.db-shm data/app.db-wal

# Restart
docker-compose up
```

### Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Cloud Run Errors

```bash
# View recent errors
gcloud run services logs read c2pa-generator-assistant \
  --region $REGION \
  --limit 50

# Check service status
gcloud run services describe c2pa-generator-assistant \
  --region $REGION
```

---

## Cost Estimation

### Cloud Run (Estimated Monthly Cost)

**Low Traffic (< 1000 requests/day):**
- Compute: ~$5-10/month
- Networking: ~$1-2/month
- **Total: ~$6-12/month**

**Medium Traffic (10,000 requests/day):**
- Compute: ~$20-40/month
- Networking: ~$5-10/month
- **Total: ~$25-50/month**

### Additional Costs

- OpenAI API: Variable based on usage
- Cloud Storage (if needed): ~$0.02/GB/month
- Domain: ~$12/year

---

## Support

For deployment issues:
1. Check logs first
2. Review this guide
3. Open issue on GitHub: https://github.com/smsmatt/c2pa-generator-product/issues

---

**Last Updated:** October 2025
**Version:** 1.0.0
