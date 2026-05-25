#!/bin/bash
# AURALIS Pre-Deploy Checklist (Task UU)
# Runs 10 checks before production deploy.
# Usage: bash scripts/pre-deploy-check.sh
#
# Exit code: 0 = all pass, 1 = failures found

set -e
cd "$(dirname "$0")/.."

PASS=0
FAIL=0
WARN=0

pass() { echo "  ✓ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ✗ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠ $1"; WARN=$((WARN + 1)); }

echo "═══════════════════════════════════════════"
echo "AURALIS Pre-Deploy Checklist"
echo "═══════════════════════════════════════════"
echo ""

# 1. Manifest JSON valid
echo "[1/10] manifest.json validity"
if python3 -c "import json; json.load(open('manifest.json'))" 2>/dev/null; then
  pass "manifest.json is valid JSON"
elif python -c "import json; json.load(open('manifest.json'))" 2>/dev/null; then
  pass "manifest.json is valid JSON"
else
  fail "manifest.json is NOT valid JSON"
fi

# 2. Service worker version check
echo "[2/10] Service Worker version"
SW_VER=$(grep -oP "VERSION = '[^']+'" service-worker.js 2>/dev/null || echo "")
if [ -n "$SW_VER" ]; then
  pass "SW version found: $SW_VER"
else
  warn "Could not detect SW VERSION"
fi

# 3. console.log count in production code
echo "[3/10] console.log statements"
LOG_COUNT=$(grep -r "console\.\(log\|warn\|error\)" js/ --include="*.js" 2>/dev/null | grep -v "debug\|Debug\|DEBUG" | wc -l || echo "0")
if [ "$LOG_COUNT" -lt 20 ]; then
  pass "console.* count: $LOG_COUNT (acceptable)"
else
  warn "console.* count: $LOG_COUNT (consider removing for production)"
fi

# 4. TODO markers
echo "[4/10] TODO markers"
TODO_COUNT=$(grep -ri "TODO\|FIXME\|HACK\|XXX" js/ css/ --include="*.js" --include="*.css" 2>/dev/null | wc -l || echo "0")
if [ "$TODO_COUNT" -lt 10 ]; then
  pass "TODO count: $TODO_COUNT"
else
  warn "TODO count: $TODO_COUNT (review before release)"
fi

# 5. CSS size
echo "[5/10] CSS bundle size"
CSS_SIZE=$(cat css/*.css css/components/*.css 2>/dev/null | wc -c || echo "0")
CSS_KB=$((CSS_SIZE / 1024))
if [ "$CSS_KB" -lt 500 ]; then
  pass "CSS total: ${CSS_KB}KB (< 500KB limit)"
else
  fail "CSS total: ${CSS_KB}KB (exceeds 500KB limit)"
fi

# 6. JS size
echo "[6/10] JS bundle size"
JS_SIZE=$(cat js/*.js js/components/*.js 2>/dev/null | wc -c || echo "0")
JS_KB=$((JS_SIZE / 1024))
if [ "$JS_KB" -lt 1024 ]; then
  pass "JS total: ${JS_KB}KB (< 1MB limit)"
else
  fail "JS total: ${JS_KB}KB (exceeds 1MB limit)"
fi

# 7. Icons exist
echo "[7/10] PWA icons"
ICONS_OK=true
for icon in icons/icon-192.png icons/icon-512.png; do
  if [ ! -f "$icon" ]; then
    fail "Missing: $icon"
    ICONS_OK=false
  fi
done
if [ "$ICONS_OK" = true ]; then
  pass "PWA icons present"
fi

# 8. i18n BG file exists
echo "[8/10] i18n files"
if [ -f "i18n/bg.json" ]; then
  pass "bg.json exists"
else
  warn "bg.json not found (check i18n/ directory)"
fi

# 9. Audio directory check
echo "[9/10] Audio files"
AUDIO_COUNT=$(find audio/ -name "*.mp3" -o -name "*.wav" -o -name "*.ogg" 2>/dev/null | wc -l || echo "0")
if [ "$AUDIO_COUNT" -gt 0 ]; then
  pass "Audio files found: $AUDIO_COUNT"
else
  warn "No audio files found in audio/"
fi

# 10. Image size check (no >500KB images)
echo "[10/10] Image optimization"
BIG_IMAGES=$(find . -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | while read f; do
  SIZE=$(wc -c < "$f" 2>/dev/null || echo "0")
  if [ "$SIZE" -gt 512000 ]; then echo "$f ($((SIZE/1024))KB)"; fi
done)
if [ -z "$BIG_IMAGES" ]; then
  pass "All images < 500KB"
else
  warn "Large images found:"
  echo "$BIG_IMAGES" | while read line; do echo "    $line"; done
fi

# Summary
echo ""
echo "═══════════════════════════════════════════"
echo "Results: $PASS passed, $FAIL failed, $WARN warnings"
echo "═══════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo "STATUS: FAIL — fix issues before deploy"
  exit 1
else
  echo "STATUS: PASS"
  exit 0
fi
