#!/bin/bash
#
# Convert images in current dir to 256x256 size and save as webp format.
#
# If -768 is passed as an argument, it will resize to 768x768 instead.
#

#!/bin/bash

# default size
size="256x256"

# check if argument is provided
if [ "$#" -eq 1 ]; then
  size="${1#-}x${1#-}"
fi

for file in *.jpg; do
  tempFile=$(mktemp)
  convert "$file" -resize $size -filter Lanczos -sharpen 0x0.5 "$tempFile"
  cwebp -q 85 -o "${file%.*}.webp" "$tempFile"
  rm "$tempFile"
done
