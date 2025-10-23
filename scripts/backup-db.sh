#!/bin/bash

#############################################################
# Database Backup Script
# Purpose: Backup SQLite database before Docker rebuild
# Usage: ./scripts/backup-db.sh
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

# Paths
DB_PATH="${PROJECT_ROOT}/data/app.db"
BACKUP_DIR="${PROJECT_ROOT}/data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PATH="${BACKUP_DIR}/app.db.${TIMESTAMP}"
LATEST_BACKUP="${PROJECT_ROOT}/data/app.db.backup"

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  C2PA Generator - Database Backup Utility${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo ""

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory: ${BACKUP_DIR}${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo -e "${YELLOW}Warning: Database file not found at ${DB_PATH}${NC}"
    echo -e "${YELLOW}Nothing to backup. This might be a fresh installation.${NC}"
    exit 0
fi

# Get database file size
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)

echo -e "${BLUE}Database file:${NC} $DB_PATH"
echo -e "${BLUE}Database size:${NC} $DB_SIZE"
echo -e "${BLUE}Backup location:${NC} $BACKUP_PATH"
echo ""

# Perform backup with timestamp
echo -e "${YELLOW}Creating timestamped backup...${NC}"
cp "$DB_PATH" "$BACKUP_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Timestamped backup created successfully${NC}"
else
    echo -e "${RED}✗ Failed to create timestamped backup${NC}"
    exit 1
fi

# Also create/update the latest backup (used for automatic restore)
echo -e "${YELLOW}Creating latest backup reference...${NC}"
cp "$DB_PATH" "$LATEST_BACKUP"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Latest backup updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to update latest backup${NC}"
    exit 1
fi

# Count total backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/app.db.* 2>/dev/null | wc -l)

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}  Backup Summary${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}Original database:${NC} $DB_PATH ($DB_SIZE)"
echo -e "${GREEN}Timestamped backup:${NC} $BACKUP_PATH"
echo -e "${GREEN}Latest backup:${NC} $LATEST_BACKUP"
echo -e "${GREEN}Total backups:${NC} $BACKUP_COUNT"
echo ""

# Clean old backups (keep last 10)
if [ "$BACKUP_COUNT" -gt 10 ]; then
    echo -e "${YELLOW}Cleaning old backups (keeping last 10)...${NC}"
    cd "$BACKUP_DIR"
    ls -t app.db.* | tail -n +11 | xargs rm -f
    echo -e "${GREEN}✓ Old backups cleaned${NC}"
    echo ""
fi

echo -e "${GREEN}✓ Database backup completed successfully!${NC}"
echo ""
echo -e "${BLUE}To restore this backup, run:${NC}"
echo -e "  docker-compose stop"
echo -e "  cp ${LATEST_BACKUP} ${DB_PATH}"
echo -e "  docker-compose start"
echo ""

exit 0
