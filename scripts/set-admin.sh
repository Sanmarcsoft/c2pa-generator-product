#!/bin/bash

###############################################################################
# Set Admin Credentials Script
#
# Easily create or update admin user credentials for the C2PA Generator app.
#
# Usage:
#   ./scripts/set-admin.sh                           # Interactive mode
#   ./scripts/set-admin.sh EMAIL PASSWORD [NAME]     # Command-line mode
#   ./scripts/set-admin.sh EMAIL PASSWORD [NAME] --force  # Force overwrite
#
# Examples:
#   ./scripts/set-admin.sh                           # Prompts for all info
#   ./scripts/set-admin.sh admin@company.com Pass123! "Admin User"
#   ./scripts/set-admin.sh admin@company.com Pass123!
#   ./scripts/set-admin.sh admin@company.com NewPass456! "Admin User" --force
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Container name
CONTAINER_NAME="c2pa-generator-assistant"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo ""
    echo "============================================================"
    echo -e "${CYAN}$1${NC}"
    echo "============================================================"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

check_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        print_error "Container '${CONTAINER_NAME}' is not running!"
        echo ""
        print_info "Start the application with:"
        echo "  cd $PROJECT_ROOT"
        echo "  docker-compose up -d"
        echo ""
        exit 1
    fi
}

validate_email() {
    local email="$1"
    if [[ ! "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 1
    fi
    return 0
}

validate_password() {
    local password="$1"
    if [ ${#password} -lt 8 ]; then
        return 1
    fi
    return 0
}

###############################################################################
# Main Script
###############################################################################

print_header "C2PA Generator - Set Admin Credentials"

# Check if container is running
print_info "Checking if application is running..."
check_container
print_success "Application is running"

# Change to project root directory
cd "$PROJECT_ROOT"

# Parse arguments
if [ $# -eq 0 ]; then
    # Interactive mode
    print_info "Running in interactive mode..."
    print_warning "You will be prompted for admin credentials."
    echo ""

    docker exec "$CONTAINER_NAME" node scripts/create-admin.js

elif [ $# -ge 2 ]; then
    # Command-line mode
    EMAIL="$1"
    PASSWORD="$2"

    # Check if third argument is --force or --yes
    if [ "$3" = "--force" ] || [ "$3" = "--yes" ]; then
        NAME="Admin User"
        FORCE_FLAG="$3"
    else
        NAME="${3:-Admin User}"
        FORCE_FLAG=""
    fi

    # Check if fourth argument is --force or --yes
    if [ "$4" = "--force" ] || [ "$4" = "--yes" ]; then
        FORCE_FLAG="$4"
    fi

    print_info "Running in command-line mode..."

    if [ -n "$FORCE_FLAG" ]; then
        print_warning "Force overwrite enabled - will not prompt for confirmation"
    fi

    # Validate email
    if ! validate_email "$EMAIL"; then
        print_error "Invalid email format: $EMAIL"
        exit 1
    fi

    # Validate password
    if ! validate_password "$PASSWORD"; then
        print_error "Password must be at least 8 characters long"
        exit 1
    fi

    print_info "Creating/updating admin user..."
    print_info "Email: $EMAIL"
    print_info "Name: $NAME"
    echo ""

    # Run create-admin script with arguments
    if [ -n "$FORCE_FLAG" ]; then
        docker exec "$CONTAINER_NAME" node scripts/create-admin.js \
            --email "$EMAIL" \
            --password "$PASSWORD" \
            --name "$NAME" \
            "$FORCE_FLAG"
    else
        docker exec "$CONTAINER_NAME" node scripts/create-admin.js \
            --email "$EMAIL" \
            --password "$PASSWORD" \
            --name "$NAME"
    fi

else
    # Invalid arguments
    print_error "Invalid number of arguments!"
    echo ""
    echo "Usage:"
    echo "  $0                                    # Interactive mode"
    echo "  $0 EMAIL PASSWORD [NAME] [--force]    # Command-line mode"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 admin@company.com SecurePass123! 'Admin User'"
    echo "  $0 admin@company.com SecurePass123!"
    echo "  $0 admin@company.com NewPass456! 'Admin User' --force"
    echo "  $0 admin@company.com NewPass456! --force"
    echo ""
    exit 1
fi

echo ""
print_header "Next Steps"
print_info "1. Visit http://localhost:8080/login"
print_info "2. Log in with your admin credentials"
print_info "3. Access admin-only features"
echo ""
