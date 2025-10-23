#!/bin/bash

#############################################################
# Safe Docker Rebuild Script
# Purpose: Rebuild Docker container with automatic database backup
# Usage: ./scripts/rebuild-with-backup.sh [--no-cache]
#############################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  C2PA Generator - Safe Docker Rebuild${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo ""

# Check if --no-cache flag is provided
NO_CACHE=""
if [ "$1" == "--no-cache" ]; then
    NO_CACHE="--no-cache"
    echo -e "${YELLOW}Building with --no-cache flag (full rebuild)${NC}"
    echo ""
fi

# Step 1: Backup database
echo -e "${BLUE}Step 1: Backing up database...${NC}"
echo -e "${YELLOW}Running backup script...${NC}"
bash "${SCRIPT_DIR}/backup-db.sh"

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Database backup failed. Aborting rebuild.${NC}"
    exit 1
fi

echo ""

# Step 2: Stop container
echo -e "${BLUE}Step 2: Stopping container...${NC}"
docker-compose stop

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to stop container${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Container stopped${NC}"
echo ""

# Step 3: Rebuild container
echo -e "${BLUE}Step 3: Rebuilding container...${NC}"
if [ -n "$NO_CACHE" ]; then
    docker-compose build --no-cache
else
    docker-compose build
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Container build failed${NC}"
    echo ""
    echo -e "${YELLOW}Database backup is available at: data/app.db.backup${NC}"
    echo -e "${YELLOW}To restore, run:${NC}"
    echo -e "  ./scripts/restore-db.sh"
    exit 1
fi

echo -e "${GREEN}✓ Container built successfully${NC}"
echo ""

# Step 4: Start container
echo -e "${BLUE}Step 4: Starting container...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to start container${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Container started${NC}"
echo ""

# Step 5: Wait for container to be ready
echo -e "${BLUE}Step 5: Waiting for container to be ready...${NC}"
echo -e "${YELLOW}This may take up to 30 seconds...${NC}"

# Wait for health check
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' c2pa-generator-assistant 2>/dev/null || echo "not-ready")

    if [ "$HEALTH" == "healthy" ]; then
        echo -e "${GREEN}✓ Container is healthy${NC}"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    echo -n "."
    sleep 1
done

echo ""

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${YELLOW}Warning: Container health check timed out${NC}"
    echo -e "${YELLOW}Check logs with: docker logs c2pa-generator-assistant${NC}"
    echo ""
fi

# Step 6: Reset admin passwords (recommended after rebuild)
echo -e "${BLUE}Step 6: Admin password reset (recommended)${NC}"
echo -e "${YELLOW}After container rebuilds, admin passwords may need to be reset.${NC}"
echo ""

read -p "$(echo -e ${YELLOW}Do you want to reset admin passwords now? [Y/n]: ${NC})" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo ""
    echo -e "${BLUE}Resetting admin passwords...${NC}"
    echo ""

    # Check if set-admin.sh exists
    if [ -f "${SCRIPT_DIR}/set-admin.sh" ]; then
        bash "${SCRIPT_DIR}/set-admin.sh"
    else
        echo -e "${YELLOW}Admin password reset script not found.${NC}"
        echo -e "${YELLOW}You can manually reset passwords using:${NC}"
        echo -e "  docker exec -e ADMIN_EMAIL='admin@example.com' \\"
        echo -e "    -e ADMIN_PASSWORD='YourPassword123' \\"
        echo -e "    -e ADMIN_NAME='Admin User' \\"
        echo -e "    -e ADMIN_FORCE='true' \\"
        echo -e "    c2pa-generator-assistant node scripts/create-admin.js"
    fi
else
    echo ""
    echo -e "${YELLOW}Skipping password reset.${NC}"
    echo -e "${YELLOW}If you need to reset passwords later, run:${NC}"
    echo -e "  ./scripts/set-admin.sh"
fi

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}  Rebuild Complete!${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo ""
echo -e "${GREEN}✓ Container rebuilt successfully${NC}"
echo -e "${GREEN}✓ Database backed up and persisted${NC}"
echo ""
echo -e "${BLUE}Application is now running at:${NC}"
echo -e "  ${YELLOW}http://localhost:8080${NC}"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo -e "  ${YELLOW}docker logs -f c2pa-generator-assistant${NC}"
echo ""
echo -e "${BLUE}Database backup location:${NC}"
echo -e "  ${YELLOW}${PROJECT_ROOT}/data/app.db.backup${NC}"
echo -e "  ${YELLOW}${PROJECT_ROOT}/data/backups/${NC} (timestamped backups)"
echo ""

exit 0
