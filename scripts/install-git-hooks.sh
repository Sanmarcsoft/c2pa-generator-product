#!/bin/bash

###############################################################################
# Git Hooks Installer
#
# Installs pre-commit hooks to prevent accidental commit of secrets
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PRE_COMMIT_HOOK="$GIT_HOOKS_DIR/pre-commit"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Installing Git Hooks for Secret Protection              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo -e "${RED}✗ Not a git repository${NC}"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Create pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent committing secrets
# This runs automatically before every commit

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Patterns to detect
PATTERNS=(
    "sk-[a-zA-Z0-9]{48}"           # OpenAI API keys
    "ghp_[a-zA-Z0-9]{36}"          # GitHub Personal Access Tokens
    "github_pat_[a-zA-Z0-9_]{82}"  # GitHub Fine-grained tokens
    "gho_[a-zA-Z0-9]{36}"          # GitHub OAuth tokens
    "AIza[0-9A-Za-z_-]{35}"        # Google API keys
    "ya29\.[0-9A-Za-z_-]+"         # Google OAuth tokens
    "[0-9]+-[0-9A-Za-z_]{32}\.apps\.googleusercontent\.com"  # Google OAuth Client IDs
)

# Files to always block
BLOCKED_FILES=(
    "backend/config/secrets.json"
    ".env"
    ".env.local"
    ".env.production"
)

echo "🔍 Scanning for secrets..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Check blocked files
for BLOCKED_FILE in "${BLOCKED_FILES[@]}"; do
    if echo "$STAGED_FILES" | grep -q "^$BLOCKED_FILE$"; then
        echo -e "${RED}✗ Error: Attempting to commit blocked file: $BLOCKED_FILE${NC}"
        echo -e "${YELLOW}  This file contains secrets and should never be committed${NC}"
        exit 1
    fi
done

# Check for secret patterns in staged content
for PATTERN in "${PATTERNS[@]}"; do
    # Search in staged content
    if git diff --cached | grep -qE "$PATTERN"; then
        echo -e "${RED}✗ Error: Potential secret detected in staged changes${NC}"
        echo -e "${YELLOW}  Pattern matched: $PATTERN${NC}"
        echo
        echo "Matched content:"
        git diff --cached | grep -E "$PATTERN" | head -5
        echo
        echo "To bypass this check (only if you're CERTAIN it's not a secret):"
        echo "  git commit --no-verify"
        echo
        exit 1
    fi
done

# Check for common secret variable names
SECRET_VARS=(
    "OPENAI_API_KEY\s*=\s*['\"]sk-"
    "GITHUB_TOKEN\s*=\s*['\"]ghp_"
    "API_KEY\s*=\s*['\"][^'\"]{20,}"
    "SECRET\s*=\s*['\"][^'\"]{20,}"
    "PASSWORD\s*=\s*['\"][^'\"]{8,}"
)

for VAR_PATTERN in "${SECRET_VARS[@]}"; do
    if git diff --cached | grep -qiE "$VAR_PATTERN"; then
        echo -e "${RED}✗ Error: Potential secret variable detected${NC}"
        echo -e "${YELLOW}  Pattern: $VAR_PATTERN${NC}"
        echo
        echo "If this is a placeholder value, make sure it's clearly marked as such"
        echo "Otherwise, use environment variables or secrets management"
        exit 1
    fi
done

echo "✓ No secrets detected"
exit 0
EOF

chmod +x "$PRE_COMMIT_HOOK"

echo -e "${GREEN}✓ Pre-commit hook installed${NC}"
echo

# Test the hook
echo -e "${BLUE}Testing pre-commit hook...${NC}"
if [ -x "$PRE_COMMIT_HOOK" ]; then
    echo -e "${GREEN}✓ Hook is executable${NC}"
else
    echo -e "${RED}✗ Hook is not executable${NC}"
    exit 1
fi

echo
echo -e "${GREEN}Installation complete!${NC}"
echo
echo -e "${BLUE}The pre-commit hook will now:${NC}"
echo "  • Scan for API keys and tokens before each commit"
echo "  • Block commits of secrets.json and .env files"
echo "  • Detect common secret patterns"
echo
echo -e "${YELLOW}To bypass the hook (use with caution):${NC}"
echo "  git commit --no-verify"
echo
echo -e "${BLUE}To test the hook:${NC}"
echo "  echo 'OPENAI_API_KEY=sk-test123' > test.txt"
echo "  git add test.txt"
echo "  git commit -m 'test'"
echo "  (This should be blocked)"
echo
