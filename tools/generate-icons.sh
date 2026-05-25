#!/bin/bash
# AURALIS Icon Generator (Task TT)
# Generates PWA icons from SVG source.
# Requires: ImageMagick (convert/magick) or Inkscape.
#
# Usage: bash tools/generate-icons.sh
#
# Input:  icons/icon-source.svg (create manually or use placeholder below)
# Output: icons/icon-192.png, icon-512.png, icon-180.png, favicon.ico

set -e
cd "$(dirname "$0")/.."

ICONS_DIR="icons"
SOURCE="$ICONS_DIR/icon-source.svg"

# Generate placeholder SVG if not exists
if [ ! -f "$SOURCE" ]; then
  echo "Creating placeholder SVG..."
  cat > "$SOURCE" << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0a0a0f"/>
  <circle cx="256" cy="240" r="120" fill="none" stroke="#F1E6C8" stroke-width="4" opacity="0.15"/>
  <circle cx="256" cy="240" r="80" fill="none" stroke="#F1E6C8" stroke-width="3" opacity="0.1"/>
  <text x="256" y="280" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="200" fill="#F1E6C8">A</text>
  <text x="256" y="440" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="40" fill="#F1E6C8" opacity="0.5">AURALIS</text>
</svg>
SVGEOF
fi

# Try ImageMagick first, then Inkscape
if command -v magick &> /dev/null; then
  CMD="magick"
elif command -v convert &> /dev/null; then
  CMD="convert"
elif command -v inkscape &> /dev/null; then
  echo "Using Inkscape..."
  inkscape "$SOURCE" -w 512 -h 512 -o "$ICONS_DIR/icon-512.png"
  inkscape "$SOURCE" -w 192 -h 192 -o "$ICONS_DIR/icon-192.png"
  inkscape "$SOURCE" -w 180 -h 180 -o "$ICONS_DIR/icon-180.png"
  inkscape "$SOURCE" -w 32 -h 32 -o "$ICONS_DIR/favicon-32.png"
  inkscape "$SOURCE" -w 16 -h 16 -o "$ICONS_DIR/favicon-16.png"
  echo "Done (Inkscape). Note: favicon.ico needs manual conversion."
  exit 0
else
  echo "ERROR: Neither ImageMagick nor Inkscape found."
  echo "Install: sudo apt install imagemagick  OR  brew install imagemagick"
  exit 1
fi

echo "Generating icons with $CMD..."

$CMD -background none -density 300 "$SOURCE" -resize 512x512 "$ICONS_DIR/icon-512.png"
$CMD -background none -density 300 "$SOURCE" -resize 192x192 "$ICONS_DIR/icon-192.png"
$CMD -background none -density 300 "$SOURCE" -resize 180x180 "$ICONS_DIR/icon-180.png"
$CMD -background none -density 300 "$SOURCE" -resize 512x512 "$ICONS_DIR/icon-maskable-512.png"

# Favicon (multi-resolution .ico)
$CMD -background none -density 300 "$SOURCE" -resize 16x16 "$ICONS_DIR/favicon-16.png"
$CMD -background none -density 300 "$SOURCE" -resize 32x32 "$ICONS_DIR/favicon-32.png"
$CMD "$ICONS_DIR/favicon-16.png" "$ICONS_DIR/favicon-32.png" "$ICONS_DIR/favicon.ico"

# Cleanup temp
rm -f "$ICONS_DIR/favicon-16.png" "$ICONS_DIR/favicon-32.png"

echo "Icons generated:"
ls -la "$ICONS_DIR/"
echo "Done."
