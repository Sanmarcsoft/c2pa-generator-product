#!/bin/bash

# C2PA Generator Product Certification Assistant
# Startup script with port detection

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   C2PA GENERATOR PRODUCT CERTIFICATION ASSISTANT           ║"
echo "║   Starting up...                                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Creating from .env.example..."
  cp .env.example .env
  echo "✅ Created .env file. Please configure it with your settings."
  echo ""
fi

# Find available port
echo "🔍 Finding available port..."
PORT=$(node scripts/find-port.js 8080 8090)

if [ $? -eq 0 ]; then
  echo "✅ Found available port: $PORT"
  export PORT=$PORT
else
  echo "❌ No available ports found in range 8080-8090"
  exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker Desktop."
  exit 1
fi

echo "✅ Docker is running"
echo ""

# Start with docker-compose
echo "🚀 Starting application with Docker Compose on port $PORT..."
echo ""

PORT=$PORT docker-compose up --build

echo ""
echo "✅ Application stopped"
