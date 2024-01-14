#!/bin/bash
for file in *.jpg; do
  tempFile=$(mktemp)
  convert "$file" -resize 256x256 -filter Lanczos -sharpen 0x0.5 "$tempFile"
  cwebp -q 85 -o "${file%.*}.webp" "$tempFile"
  rm "$tempFile"
done
