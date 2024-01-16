#!/bin/bash

# Check command-line arguments
if [[ "$1" == "-test" || "$1" == "-rename" ]]; then
  mode="$1"
else
  echo "Invalid argument. Use -test to only show the prompt, or -rename to rename the files."
  exit 1
fi

for file in *.jpg; do
  # this may need tweaking on a per set basis
  prompt=$(exiftool -UserComment "$file" | grep 'User Comment' | sed 's/^User Comment *: //' | sed 's/\.Steps:.*//' | sed 's/[^,]*, //' | sed 's/\.Negative prompt: .*//')

  # make first char lowercase
  prompt_clean="$(tr '[:upper:]' '[:lower:]' <<<${prompt:0:1})${prompt:1}"

  # don't show prompt if in rename mode
  [[ "$mode" != "-rename" ]] && echo "Prompt: $prompt_clean"

  if [[ "$mode" == "-rename" ]]; then
    # Initialize file counter and file name
    counter=1

    new_file="${prompt_clean}.${counter}.jpg"

    # Check if file already exists, and find an unused filename
    while [ -f "$new_file" ]; do
      ((counter++))
      new_file="${prompt_clean}.${counter}.jpg"
    done

    # Rename the file
    mv "$file" "$new_file"
    echo "Renamed $file to: $new_file"
  fi
done
