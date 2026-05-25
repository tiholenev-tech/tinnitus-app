#!/bin/bash
# AURALIS Deploy Prep (Task UU)
# Prepares production build: version bump, optional minification.
# Usage: bash scripts/deploy-prep.sh [version]
#   e.g.: bash scripts/deploy-prep.sh 1.0.1

set -e
cd "$(dirname "$0")/.."

NEW_VERSION="${1:-}"

if [ -z "$NEW_VERSION" ]; then
  # Auto-increment patch from service-worker.js
  CURRENT=$(grep -oP "VERSION = '([^']+)'" service-worker.js | grep -oP "'[^']+'" | tr -d "'")
  if [ -z "$CURRENT" ]; then
    CURRENT="1.0.0"
  fi
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  PATCH=$((PATCH + 1))
  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
fi

echo "═══════════════════════════════════════════"
echo "AURALIS Deploy Prep"
echo "Version: $NEW_VERSION"
echo "═══════════════════════════════════════════"
echo ""

# 1. Update SW version
echo "[1] Updating service-worker.js VERSION..."
sed -i "s/VERSION = '[^']*'/VERSION = '$NEW_VERSION'/" service-worker.js
echo "  → VERSION = '$NEW_VERSION'"

# 2. Update app version in settings.js
echo "[2] Updating APP_VERSION in settings.js..."
sed -i "s/APP_VERSION = '[^']*'/APP_VERSION = '$NEW_VERSION'/" js/settings.js 2>/dev/null || echo "  (skipped — pattern not found)"

# 3. Run pre-deploy checks
echo ""
echo "[3] Running pre-deploy checks..."
bash scripts/pre-deploy-check.sh || true

echo ""
echo "═══════════════════════════════════════════"
echo "Deploy prep complete."
echo "Version: $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. git add -A && git commit -m 'RELEASE: v$NEW_VERSION'"
echo "  2. git tag v$NEW_VERSION"
echo "  3. git push && git push --tags"
echo "  4. Deploy to server / Capacitor build"
echo "═══════════════════════════════════════════"
