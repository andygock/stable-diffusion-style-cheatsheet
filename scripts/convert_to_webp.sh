#!/bin/bash
#
# e.g
# ./convert_to_webp2.sh /mnt/r/ComfyUI_windows_portable/ComfyUI/output/flux1.female.1/ ../images/female-flux1dev/256/ 256 ".1"

# Check minimum required arguments
if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <source_dir|source_file> <target_dir> <target_size> [prefix]"
  exit 1
fi

# Assign arguments
SRC="$1"
DST_DIR="$2"
SIZE="$3"
PREFIX="${4:-}"

# Compression quality (0-100), adjust as needed
QUALITY=85

# check ImageMagick installation
if ! command -v convert &>/dev/null; then
  echo "Error: ImageMagick is not installed. Please install it to use this script."
  exit 1
fi

# Ensure target directory exists
mkdir -p "$DST_DIR"

# Check if source is a file or directory
if [ -f "$SRC" ]; then
  # Source is a single file
  BASENAME=$(basename "$SRC" .webp)
  OUTFILE="$DST_DIR/${BASENAME}${PREFIX}.webp"

  convert "$SRC" -resize "${SIZE}x${SIZE}" -filter Lanczos -sharpen 0x0.5 -quality "$QUALITY" "$OUTFILE"
  echo "Resized: $SRC -> $OUTFILE"
elif [ -d "$SRC" ]; then
  # Source is a directory
  for IMG in "$SRC"/*.webp; do
    [ -e "$IMG" ] || continue # Skip if no matching files
    BASENAME=$(basename "$IMG" .webp)
    OUTFILE="$DST_DIR/${BASENAME}${PREFIX}.webp"

    convert "$IMG" -resize "${SIZE}x${SIZE}" -filter Lanczos -sharpen 0x0.5 -quality "$QUALITY" "$OUTFILE"
    echo "Resized: $IMG -> $OUTFILE"
  done
else
  echo "Error: Source $SRC is neither a file nor a directory."
  exit 1
fi
