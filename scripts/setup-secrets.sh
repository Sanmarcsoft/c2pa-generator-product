#!/bin/bash

###############################################################################
# Secure Secrets Setup Script
#
# This script helps you securely set up API keys and secrets for the
# C2PA Generator Product Certification Assistant.
#
# Usage:
#   ./scripts/setup-secrets.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_FILE="$PROJECT_ROOT/backend/config/secrets.json"
SECRETS_EXAMPLE="$PROJECT_ROOT/backend/config/secrets.example.json"
GITIGNORE_FILE="$PROJECT_ROOT/.gitignore"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}║   C2PA GENERATOR ASSISTANT - SECURE SECRETS SETUP         ║${NC}"
echo -e "${BLUE}║                                                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate file permissions
check_permissions() {
    local file="$1"
    local perms=$(stat -f "%A" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)
    echo "$perms"
}

# Step 1: Check if secrets file already exists
print_section "Step 1: Checking Existing Configuration"

if [ -f "$SECRETS_FILE" ]; then
    echo -e "${YELLOW}⚠️  Secrets file already exists:${NC} $SECRETS_FILE"

    # Check permissions
    PERMS=$(check_permissions "$SECRETS_FILE")
    if [ "$PERMS" = "600" ]; then
        echo -e "${GREEN}✓${NC} File permissions are secure (600)"
    else
        echo -e "${RED}✗${NC} File permissions are ${RED}${PERMS}${NC} (should be 600)"
        echo -e "${YELLOW}   Fixing permissions...${NC}"
        chmod 600 "$SECRETS_FILE"
        echo -e "${GREEN}✓${NC} Permissions fixed"
    fi

    echo
    read -p "Do you want to update the existing secrets? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Existing secrets preserved. Exiting.${NC}"
        exit 0
    fi
else
    echo -e "${GREEN}✓${NC} No existing secrets file found. Creating new one..."
fi

# Step 2: Collect secrets
print_section "Step 2: Collect API Keys and Secrets"

echo -e "${YELLOW}Enter your API keys below.${NC}"
echo -e "${YELLOW}Leave blank to skip optional keys.${NC}"
echo

# OpenAI API Key
echo -e "${BLUE}OpenAI API Key:${NC}"
echo "Get your key from: https://platform.openai.com/api-keys"
read -sp "Enter OPENAI_API_KEY (or press Enter to skip): " OPENAI_API_KEY
echo
if [ -z "$OPENAI_API_KEY" ]; then
    OPENAI_API_KEY="sk-your-openai-api-key-here"
    echo -e "${YELLOW}⚠️  Skipped OpenAI API Key${NC}"
else
    echo -e "${GREEN}✓${NC} OpenAI API Key set"
fi

echo

# GitHub Token
echo -e "${BLUE}GitHub Personal Access Token:${NC}"
echo "Get your token from: https://github.com/settings/tokens"
echo "Required scopes: repo (private) or public_repo (public only)"
read -sp "Enter GITHUB_TOKEN (or press Enter to skip): " GITHUB_TOKEN
echo
if [ -z "$GITHUB_TOKEN" ]; then
    GITHUB_TOKEN="ghp_your_github_personal_access_token_here"
    echo -e "${YELLOW}⚠️  Skipped GitHub Token${NC}"
else
    echo -e "${GREEN}✓${NC} GitHub Token set"
fi

echo

# OpenWebUI URL (optional)
echo -e "${BLUE}OpenWebUI URL (optional):${NC}"
echo "Example: http://localhost:3000/api"
read -p "Enter OPENWEBUI_URL (or press Enter to skip): " OPENWEBUI_URL
if [ -z "$OPENWEBUI_URL" ]; then
    OPENWEBUI_URL=""
    echo -e "${YELLOW}⚠️  Skipped OpenWebUI URL${NC}"
else
    echo -e "${GREEN}✓${NC} OpenWebUI URL set"
fi

# Step 3: Create secrets file
print_section "Step 3: Creating Secrets File"

# Create config directory if it doesn't exist
mkdir -p "$(dirname "$SECRETS_FILE")"

# Write secrets to file
cat > "$SECRETS_FILE" << EOF
{
  "OPENAI_API_KEY": "$OPENAI_API_KEY",
  "GITHUB_TOKEN": "$GITHUB_TOKEN"EOF

# Add optional OpenWebUI URL if provided
if [ -n "$OPENWEBUI_URL" ]; then
    cat >> "$SECRETS_FILE" << EOF
,
  "OPENWEBUI_URL": "$OPENWEBUI_URL"
EOF
fi

# Close JSON
cat >> "$SECRETS_FILE" << EOF

}
EOF

echo -e "${GREEN}✓${NC} Secrets file created: $SECRETS_FILE"

# Step 4: Set secure permissions
print_section "Step 4: Setting Secure Permissions"

chmod 600 "$SECRETS_FILE"
PERMS=$(check_permissions "$SECRETS_FILE")
echo -e "${GREEN}✓${NC} File permissions set to ${GREEN}$PERMS${NC} (owner read/write only)"

# Step 5: Verify gitignore
print_section "Step 5: Verifying Git Protection"

if grep -q "secrets.json" "$GITIGNORE_FILE"; then
    echo -e "${GREEN}✓${NC} secrets.json is already in .gitignore"
else
    echo -e "${YELLOW}⚠️  Adding secrets.json to .gitignore${NC}"
    echo "backend/config/secrets.json" >> "$GITIGNORE_FILE"
    echo -e "${GREEN}✓${NC} Added secrets.json to .gitignore"
fi

# Step 6: Remove environment variables from docker-compose (if they exist)
print_section "Step 6: Securing Docker Configuration"

DOCKER_COMPOSE="$PROJECT_ROOT/docker-compose.yml"
if [ -f "$DOCKER_COMPOSE" ]; then
    # Check if environment variables are still exposed
    if grep -q "OPENAI_API_KEY=\${OPENAI_API_KEY}" "$DOCKER_COMPOSE"; then
        echo -e "${YELLOW}⚠️  Warning: docker-compose.yml still exposes OPENAI_API_KEY as environment variable${NC}"
        echo -e "${YELLOW}   Consider commenting out the OPENAI_API_KEY line in docker-compose.yml${NC}"
        echo -e "${YELLOW}   The app will automatically use the secrets file instead${NC}"
    else
        echo -e "${GREEN}✓${NC} Docker Compose is not exposing API keys directly"
    fi

    # Check if secrets file is mounted
    if grep -q "backend/config/secrets.json:/app/config/secrets.json" "$DOCKER_COMPOSE"; then
        echo -e "${GREEN}✓${NC} Secrets file is already mounted in Docker"
    else
        echo -e "${YELLOW}⚠️  Secrets file is not mounted in docker-compose.yml${NC}"
        echo -e "${YELLOW}   Add this to the volumes section:${NC}"
        echo -e "${YELLOW}   - ./backend/config/secrets.json:/app/config/secrets.json:ro${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  docker-compose.yml not found${NC}"
fi

# Step 7: Install git-secrets (optional)
print_section "Step 7: Optional - Install Git Secrets Scanner"

if command_exists git-secrets; then
    echo -e "${GREEN}✓${NC} git-secrets is already installed"
else
    echo -e "${YELLOW}⚠️  git-secrets is not installed${NC}"
    echo
    echo "git-secrets prevents you from committing secrets to git."
    echo "Install it with:"
    echo
    echo "  macOS:   brew install git-secrets"
    echo "  Linux:   See https://github.com/awslabs/git-secrets"
    echo
    read -p "Would you like installation instructions? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo
        echo "Installation instructions:"
        echo "1. Visit: https://github.com/awslabs/git-secrets#installing-git-secrets"
        echo "2. After installing, run: ./scripts/install-git-hooks.sh"
    fi
fi

# Summary
print_section "Setup Complete! 🎉"

echo -e "${GREEN}✓${NC} Secrets file created and secured"
echo -e "${GREEN}✓${NC} File permissions set to 600"
echo -e "${GREEN}✓${NC} Protected from git commits"
echo

echo -e "${BLUE}Security Recommendations:${NC}"
echo "1. Never commit secrets.json to version control"
echo "2. Rotate your API keys regularly (every 90 days)"
echo "3. Use different keys for development and production"
echo "4. Install git-secrets to prevent accidental commits"
echo "5. Review SECURITY.md for more best practices"
echo

echo -e "${BLUE}Next Steps:${NC}"
echo "1. Restart your Docker containers:"
echo -e "   ${GREEN}docker-compose restart${NC}"
echo
echo "2. Verify secrets are loaded:"
echo -e "   ${GREEN}docker logs c2pa-generator-assistant | grep \"Loaded secret\"${NC}"
echo
echo "3. (Optional) Set up git-secrets:"
echo -e "   ${GREEN}./scripts/install-git-hooks.sh${NC}"
echo

echo -e "${GREEN}Done! Your secrets are now securely configured.${NC}"
echo
