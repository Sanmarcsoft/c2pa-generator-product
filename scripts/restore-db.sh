#!/bin/bash

#############################################################
# Database Restore Script
# Purpose: Restore SQLite database from backup
# Usage: ./scripts/restore-db.sh [backup-file]
#        If no backup file specified, uses latest backup
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
LATEST_BACKUP="${PROJECT_ROOT}/data/app.db.backup"
BACKUP_DIR="${PROJECT_ROOT}/data/backups"

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}  C2PA Generator - Database Restore Utility${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo ""

# Determine which backup to restore
RESTORE_FROM=""

if [ -n "$1" ]; then
    # Backup file specified as argument
    if [ -f "$1" ]; then
        RESTORE_FROM="$1"
        echo -e "${BLUE}Restoring from specified backup:${NC} $1"
    else
        echo -e "${RED}Error: Specified backup file not found: $1${NC}"
        exit 1
    fi
else
    # Use latest backup
    if [ -f "$LATEST_BACKUP" ]; then
        RESTORE_FROM="$LATEST_BACKUP"
        echo -e "${BLUE}Restoring from latest backup:${NC} $LATEST_BACKUP"
    else
        echo -e "${RED}Error: No backup file found at ${LATEST_BACKUP}${NC}"
        echo -e "${YELLOW}To see available backups, check:${NC} ${BACKUP_DIR}"

        if [ -d "$BACKUP_DIR" ]; then
            AVAILABLE_BACKUPS=$(ls -1t "$BACKUP_DIR"/app.db.* 2>/dev/null | head -5)
            if [ -n "$AVAILABLE_BACKUPS" ]; then
                echo ""
                echo -e "${BLUE}Available timestamped backups:${NC}"
                echo "$AVAILABLE_BACKUPS"
                echo ""
                echo -e "${YELLOW}To restore a specific backup, run:${NC}"
                echo -e "  ./scripts/restore-db.sh ${BACKUP_DIR}/app.db.TIMESTAMP"
            fi
        fi

        exit 1
    fi
fi

echo ""

# Check if current database exists
if [ -f "$DB_PATH" ]; then
    CURRENT_SIZE=$(du -h "$DB_PATH" | cut -f1)
    echo -e "${YELLOW}Warning: Current database will be overwritten${NC}"
    echo -e "${YELLOW}Current database size:${NC} $CURRENT_SIZE"
    echo ""

    # Create safety backup before restore
    SAFETY_BACKUP="${PROJECT_ROOT}/data/app.db.before-restore"
    echo -e "${YELLOW}Creating safety backup before restore...${NC}"
    cp "$DB_PATH" "$SAFETY_BACKUP"
    echo -e "${GREEN}✓ Safety backup created: ${SAFETY_BACKUP}${NC}"
    echo ""
fi

# Get backup file size
BACKUP_SIZE=$(du -h "$RESTORE_FROM" | cut -f1)
echo -e "${BLUE}Backup file size:${NC} $BACKUP_SIZE"
echo ""

# Confirm restore
read -p "$(echo -e ${YELLOW}Are you sure you want to restore the database? [y/N]: ${NC})" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Restore cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Restoring database...${NC}"

# Copy backup to database location
cp "$RESTORE_FROM" "$DB_PATH"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Failed to restore database${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}  Restore Summary${NC}"
echo -e "${GREEN}==================================================================${NC}"
echo -e "${GREEN}Restored from:${NC} $RESTORE_FROM ($BACKUP_SIZE)"
echo -e "${GREEN}Database location:${NC} $DB_PATH"
if [ -f "$SAFETY_BACKUP" ]; then
    echo -e "${GREEN}Safety backup:${NC} $SAFETY_BACKUP"
fi
echo ""

echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Restart the Docker container:"
echo -e "   ${YELLOW}docker-compose restart${NC}"
echo ""
echo -e "2. Reset admin passwords (may be needed after restore):"
echo -e "   ${YELLOW}./scripts/set-admin.sh admin@example.com 'YourPassword123' 'Admin Name'${NC}"
echo ""

echo -e "${GREEN}✓ Database restore completed successfully!${NC}"
echo ""

exit 0
