#!/bin/bash

###############################################################################
# Unified Secrets Management Script
#
# Manages secrets across all environments:
# - Local Development (file-based secrets)
# - GitHub Actions (GitHub Secrets)
# - Google Cloud Run (GCP Secret Manager)
#
# Usage:
#   ./scripts/manage-secrets.sh <command> [options]
#
# Commands:
#   setup-local          Set up local development secrets
#   setup-github         Configure GitHub repository secrets
#   setup-gcp            Configure GCP Secret Manager
#   rotate               Rotate secrets across all environments
#   validate             Validate secrets configuration
#   sync                 Sync secrets from local to cloud
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_FILE="$PROJECT_ROOT/backend/config/secrets.json"

# Function to print headers
print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to read secrets from local file
read_local_secrets() {
    if [ -f "$SECRETS_FILE" ]; then
        cat "$SECRETS_FILE"
    else
        echo "{}"
    fi
}

# Function to get a secret value from JSON
get_secret_value() {
    local key="$1"
    read_local_secrets | jq -r ".$key // empty"
}

###############################################################################
# Command: setup-local
###############################################################################
setup_local() {
    print_header "Setting Up Local Development Secrets"

    echo -e "${CYAN}This will create a local secrets file for development.${NC}\n"

    # Check if secrets file exists
    if [ -f "$SECRETS_FILE" ]; then
        echo -e "${YELLOW}⚠️  Secrets file already exists${NC}"
        read -p "Overwrite existing secrets? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}Keeping existing secrets${NC}"
            return 0
        fi
    fi

    # Collect secrets
    echo -e "${YELLOW}Enter your API keys:${NC}\n"

    read -sp "OpenAI API Key (sk-...): " OPENAI_API_KEY
    echo
    read -sp "GitHub Token (ghp_...): " GITHUB_TOKEN
    echo
    read -p "OpenWebUI URL (optional): " OPENWEBUI_URL
    echo

    # Create secrets file
    mkdir -p "$(dirname "$SECRETS_FILE")"

    cat > "$SECRETS_FILE" << EOF
{
  "OPENAI_API_KEY": "$OPENAI_API_KEY",
  "GITHUB_TOKEN": "$GITHUB_TOKEN"
EOF

    if [ -n "$OPENWEBUI_URL" ]; then
        cat >> "$SECRETS_FILE" << EOF
,
  "OPENWEBUI_URL": "$OPENWEBUI_URL"
EOF
    fi

    cat >> "$SECRETS_FILE" << EOF

}
EOF

    chmod 600 "$SECRETS_FILE"

    echo -e "${GREEN}✓ Local secrets configured${NC}"
    echo -e "${GREEN}✓ File permissions set to 600${NC}"
    echo -e "\n${BLUE}Test your setup:${NC}"
    echo -e "  docker-compose up -d"
    echo -e "  docker logs c2pa-generator-assistant | grep 'Loaded secret'\n"
}

###############################################################################
# Command: setup-github
###############################################################################
setup_github() {
    print_header "Configuring GitHub Repository Secrets"

    if ! command_exists gh; then
        echo -e "${RED}✗ GitHub CLI (gh) is not installed${NC}"
        echo -e "${YELLOW}Install it from: https://cli.github.com/${NC}"
        exit 1
    fi

    echo -e "${CYAN}This will set GitHub repository secrets for CI/CD.${NC}\n"

    # Check if we have local secrets to sync
    if [ ! -f "$SECRETS_FILE" ]; then
        echo -e "${RED}✗ No local secrets file found${NC}"
        echo -e "${YELLOW}Run: ./scripts/manage-secrets.sh setup-local first${NC}"
        exit 1
    fi

    # Get repo name
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
    echo -e "${BLUE}Repository: $REPO${NC}\n"

    # Read secrets from local file
    OPENAI_API_KEY=$(get_secret_value "OPENAI_API_KEY")
    GITHUB_TOKEN=$(get_secret_value "GITHUB_TOKEN")

    if [ -z "$OPENAI_API_KEY" ] || [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}✗ Missing required secrets in local file${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Setting GitHub repository secrets...${NC}\n"

    # Set secrets
    echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY
    echo -e "${GREEN}✓ Set OPENAI_API_KEY${NC}"

    echo "$GITHUB_TOKEN" | gh secret set GITHUB_DEPLOYMENT_TOKEN
    echo -e "${GREEN}✓ Set GITHUB_DEPLOYMENT_TOKEN${NC}"

    # Prompt for GCP configuration
    echo
    read -p "Configure GCP secrets? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "GCP Project ID: " GCP_PROJECT_ID
        read -p "Workload Identity Provider: " WIF_PROVIDER
        read -p "Service Account: " WIF_SERVICE_ACCOUNT

        echo "$GCP_PROJECT_ID" | gh secret set GCP_PROJECT_ID
        echo "$WIF_PROVIDER" | gh secret set WIF_PROVIDER
        echo "$WIF_SERVICE_ACCOUNT" | gh secret set WIF_SERVICE_ACCOUNT

        echo -e "${GREEN}✓ GCP secrets configured${NC}"
    fi

    echo -e "\n${GREEN}✓ GitHub secrets configured successfully${NC}"
    echo -e "\n${BLUE}View your secrets:${NC}"
    echo -e "  gh secret list\n"
}

###############################################################################
# Command: setup-gcp
###############################################################################
setup_gcp() {
    print_header "Configuring GCP Secret Manager"

    if ! command_exists gcloud; then
        echo -e "${RED}✗ Google Cloud SDK (gcloud) is not installed${NC}"
        echo -e "${YELLOW}Install it from: https://cloud.google.com/sdk/docs/install${NC}"
        exit 1
    fi

    echo -e "${CYAN}This will create secrets in GCP Secret Manager.${NC}\n"

    # Get project ID
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        read -p "Enter GCP Project ID: " PROJECT_ID
        gcloud config set project "$PROJECT_ID"
    fi

    echo -e "${BLUE}Project: $PROJECT_ID${NC}\n"

    # Check if we have local secrets
    if [ ! -f "$SECRETS_FILE" ]; then
        echo -e "${RED}✗ No local secrets file found${NC}"
        echo -e "${YELLOW}Run: ./scripts/manage-secrets.sh setup-local first${NC}"
        exit 1
    fi

    # Enable Secret Manager API
    echo -e "${YELLOW}Enabling Secret Manager API...${NC}"
    gcloud services enable secretmanager.googleapis.com --project="$PROJECT_ID"
    echo -e "${GREEN}✓ API enabled${NC}\n"

    # Read secrets
    OPENAI_API_KEY=$(get_secret_value "OPENAI_API_KEY")
    GITHUB_TOKEN=$(get_secret_value "GITHUB_TOKEN")

    # Create or update OpenAI secret
    echo -e "${YELLOW}Creating OpenAI API Key secret...${NC}"
    if gcloud secrets describe openai-api-key --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo "$OPENAI_API_KEY" | gcloud secrets versions add openai-api-key \
            --data-file=- \
            --project="$PROJECT_ID"
        echo -e "${GREEN}✓ Updated openai-api-key (new version)${NC}"
    else
        echo "$OPENAI_API_KEY" | gcloud secrets create openai-api-key \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
        echo -e "${GREEN}✓ Created openai-api-key${NC}"
    fi

    # Create or update GitHub token secret
    echo -e "${YELLOW}Creating GitHub Token secret...${NC}"
    if gcloud secrets describe github-token --project="$PROJECT_ID" >/dev/null 2>&1; then
        echo "$GITHUB_TOKEN" | gcloud secrets versions add github-token \
            --data-file=- \
            --project="$PROJECT_ID"
        echo -e "${GREEN}✓ Updated github-token (new version)${NC}"
    else
        echo "$GITHUB_TOKEN" | gcloud secrets create github-token \
            --data-file=- \
            --replication-policy="automatic" \
            --project="$PROJECT_ID"
        echo -e "${GREEN}✓ Created github-token${NC}"
    fi

    # Grant access to Cloud Run service account
    echo
    read -p "Grant access to Cloud Run service account? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        SERVICE_ACCOUNT="${PROJECT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

        gcloud secrets add-iam-policy-binding openai-api-key \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID"

        gcloud secrets add-iam-policy-binding github-token \
            --member="serviceAccount:$SERVICE_ACCOUNT" \
            --role="roles/secretmanager.secretAccessor" \
            --project="$PROJECT_ID"

        echo -e "${GREEN}✓ Permissions granted to $SERVICE_ACCOUNT${NC}"
    fi

    echo -e "\n${GREEN}✓ GCP secrets configured successfully${NC}"
    echo -e "\n${BLUE}View your secrets:${NC}"
    echo -e "  gcloud secrets list --project=$PROJECT_ID\n"
}

###############################################################################
# Command: rotate
###############################################################################
rotate() {
    print_header "Rotating Secrets Across All Environments"

    echo -e "${RED}⚠️  Warning: This will update secrets in all environments${NC}"
    echo -e "${RED}   Make sure you have generated new keys before proceeding${NC}\n"

    read -p "Continue with rotation? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Rotation cancelled"
        exit 0
    fi

    # Collect new secrets
    echo -e "\n${YELLOW}Enter NEW API keys:${NC}\n"

    read -sp "New OpenAI API Key: " NEW_OPENAI_KEY
    echo
    read -sp "New GitHub Token: " NEW_GITHUB_TOKEN
    echo

    # Update local
    echo -e "\n${YELLOW}Updating local secrets...${NC}"
    OPENWEBUI_URL=$(get_secret_value "OPENWEBUI_URL")

    cat > "$SECRETS_FILE" << EOF
{
  "OPENAI_API_KEY": "$NEW_OPENAI_KEY",
  "GITHUB_TOKEN": "$NEW_GITHUB_TOKEN"
EOF

    if [ -n "$OPENWEBUI_URL" ]; then
        cat >> "$SECRETS_FILE" << EOF
,
  "OPENWEBUI_URL": "$OPENWEBUI_URL"
EOF
    fi

    cat >> "$SECRETS_FILE" << EOF

}
EOF

    chmod 600 "$SECRETS_FILE"
    echo -e "${GREEN}✓ Local secrets updated${NC}"

    # Update GitHub
    if command_exists gh; then
        echo -e "\n${YELLOW}Updating GitHub secrets...${NC}"
        echo "$NEW_OPENAI_KEY" | gh secret set OPENAI_API_KEY
        echo "$NEW_GITHUB_TOKEN" | gh secret set GITHUB_DEPLOYMENT_TOKEN
        echo -e "${GREEN}✓ GitHub secrets updated${NC}"
    fi

    # Update GCP
    if command_exists gcloud; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -n "$PROJECT_ID" ]; then
            echo -e "\n${YELLOW}Updating GCP secrets...${NC}"

            echo "$NEW_OPENAI_KEY" | gcloud secrets versions add openai-api-key \
                --data-file=- \
                --project="$PROJECT_ID"

            echo "$NEW_GITHUB_TOKEN" | gcloud secrets versions add github-token \
                --data-file=- \
                --project="$PROJECT_ID"

            echo -e "${GREEN}✓ GCP secrets updated${NC}"
        fi
    fi

    echo -e "\n${GREEN}✓ Secrets rotated across all environments${NC}"
    echo -e "\n${BLUE}Next steps:${NC}"
    echo -e "  1. Restart local containers: docker-compose restart"
    echo -e "  2. Revoke old keys from provider dashboards"
    echo -e "  3. Monitor for any issues\n"
}

###############################################################################
# Command: validate
###############################################################################
validate() {
    print_header "Validating Secrets Configuration"

    echo -e "${CYAN}Checking all environments...${NC}\n"

    # Check local
    echo -e "${BLUE}Local Development:${NC}"
    if [ -f "$SECRETS_FILE" ]; then
        PERMS=$(stat -f "%A" "$SECRETS_FILE" 2>/dev/null || stat -c "%a" "$SECRETS_FILE" 2>/dev/null)
        if [ "$PERMS" = "600" ]; then
            echo -e "  ${GREEN}✓${NC} Secrets file exists with secure permissions ($PERMS)"
        else
            echo -e "  ${YELLOW}⚠${NC} Secrets file exists but permissions are $PERMS (should be 600)"
        fi

        OPENAI_KEY=$(get_secret_value "OPENAI_API_KEY")
        GITHUB_TOKEN=$(get_secret_value "GITHUB_TOKEN")

        if [[ "$OPENAI_KEY" == sk-* ]]; then
            echo -e "  ${GREEN}✓${NC} OpenAI API Key is set"
        else
            echo -e "  ${YELLOW}⚠${NC} OpenAI API Key is missing or invalid"
        fi

        if [[ "$GITHUB_TOKEN" == ghp_* ]] || [[ "$GITHUB_TOKEN" == github_pat_* ]]; then
            echo -e "  ${GREEN}✓${NC} GitHub Token is set"
        else
            echo -e "  ${YELLOW}⚠${NC} GitHub Token is missing or invalid"
        fi
    else
        echo -e "  ${RED}✗${NC} No secrets file found"
    fi

    # Check GitHub
    echo -e "\n${BLUE}GitHub Secrets:${NC}"
    if command_exists gh; then
        REPO_SECRETS=$(gh secret list 2>/dev/null | awk '{print $1}')
        if echo "$REPO_SECRETS" | grep -q "OPENAI_API_KEY"; then
            echo -e "  ${GREEN}✓${NC} OPENAI_API_KEY is set"
        else
            echo -e "  ${YELLOW}⚠${NC} OPENAI_API_KEY is not set"
        fi
        if echo "$REPO_SECRETS" | grep -q "GITHUB_DEPLOYMENT_TOKEN"; then
            echo -e "  ${GREEN}✓${NC} GITHUB_DEPLOYMENT_TOKEN is set"
        else
            echo -e "  ${YELLOW}⚠${NC} GITHUB_DEPLOYMENT_TOKEN is not set"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} GitHub CLI not installed (cannot check)"
    fi

    # Check GCP
    echo -e "\n${BLUE}GCP Secret Manager:${NC}"
    if command_exists gcloud; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -n "$PROJECT_ID" ]; then
            if gcloud secrets describe openai-api-key --project="$PROJECT_ID" >/dev/null 2>&1; then
                echo -e "  ${GREEN}✓${NC} openai-api-key exists"
            else
                echo -e "  ${YELLOW}⚠${NC} openai-api-key not found"
            fi
            if gcloud secrets describe github-token --project="$PROJECT_ID" >/dev/null 2>&1; then
                echo -e "  ${GREEN}✓${NC} github-token exists"
            else
                echo -e "  ${YELLOW}⚠${NC} github-token not found"
            fi
        else
            echo -e "  ${YELLOW}⚠${NC} No GCP project configured"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} gcloud CLI not installed (cannot check)"
    fi

    echo
}

###############################################################################
# Command: sync
###############################################################################
sync() {
    print_header "Syncing Secrets from Local to Cloud"

    if [ ! -f "$SECRETS_FILE" ]; then
        echo -e "${RED}✗ No local secrets file found${NC}"
        exit 1
    fi

    echo -e "${CYAN}This will sync local secrets to GitHub and GCP.${NC}\n"
    read -p "Continue? (y/N): " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi

    # Sync to GitHub
    if command_exists gh; then
        echo -e "\n${YELLOW}Syncing to GitHub...${NC}"
        OPENAI_API_KEY=$(get_secret_value "OPENAI_API_KEY")
        GITHUB_TOKEN=$(get_secret_value "GITHUB_TOKEN")

        echo "$OPENAI_API_KEY" | gh secret set OPENAI_API_KEY
        echo "$GITHUB_TOKEN" | gh secret set GITHUB_DEPLOYMENT_TOKEN

        echo -e "${GREEN}✓ GitHub secrets synced${NC}"
    fi

    # Sync to GCP
    if command_exists gcloud; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -n "$PROJECT_ID" ]; then
            echo -e "\n${YELLOW}Syncing to GCP...${NC}"

            OPENAI_API_KEY=$(get_secret_value "OPENAI_API_KEY")
            GITHUB_TOKEN=$(get_secret_value "GITHUB_TOKEN")

            echo "$OPENAI_API_KEY" | gcloud secrets versions add openai-api-key \
                --data-file=- \
                --project="$PROJECT_ID" 2>/dev/null || \
            echo "$OPENAI_API_KEY" | gcloud secrets create openai-api-key \
                --data-file=- \
                --replication-policy="automatic" \
                --project="$PROJECT_ID"

            echo "$GITHUB_TOKEN" | gcloud secrets versions add github-token \
                --data-file=- \
                --project="$PROJECT_ID" 2>/dev/null || \
            echo "$GITHUB_TOKEN" | gcloud secrets create github-token \
                --data-file=- \
                --replication-policy="automatic" \
                --project="$PROJECT_ID"

            echo -e "${GREEN}✓ GCP secrets synced${NC}"
        fi
    fi

    echo -e "\n${GREEN}✓ Secrets synchronized${NC}\n"
}

###############################################################################
# Main
###############################################################################

if [ $# -eq 0 ]; then
    echo "Usage: $0 <command>"
    echo
    echo "Commands:"
    echo "  setup-local    Set up local development secrets"
    echo "  setup-github   Configure GitHub repository secrets"
    echo "  setup-gcp      Configure GCP Secret Manager"
    echo "  rotate         Rotate secrets across all environments"
    echo "  validate       Validate secrets configuration"
    echo "  sync           Sync secrets from local to cloud"
    echo
    exit 1
fi

COMMAND=$1
shift

case "$COMMAND" in
    setup-local)
        setup_local "$@"
        ;;
    setup-github)
        setup_github "$@"
        ;;
    setup-gcp)
        setup_gcp "$@"
        ;;
    rotate)
        rotate "$@"
        ;;
    validate)
        validate "$@"
        ;;
    sync)
        sync "$@"
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        exit 1
        ;;
esac
