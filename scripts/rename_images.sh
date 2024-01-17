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

  # remove double quotes entirely
  prompt="${prompt//\"/}"

  # remove last char if it's a period
  prompt="${prompt%.}"

  # make first char lowercase
  prompt="$(tr '[:upper:]' '[:lower:]' <<<${prompt:0:1})${prompt:1}"

  # remove leading and trailing spaces
  prompt="$(echo -e "${prompt}" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"

  # remove trailing ':' if it exists
  prompt="${prompt%:}"

  # don't show prompt if in rename mode
  [[ "$mode" != "-rename" ]] && echo "Prompt: $prompt"

  if [[ "$mode" == "-rename" ]]; then
    # Initialize file counter and file name
    counter=1

    new_file="${prompt}.${counter}.jpg"

    # Check if file already exists, and find an unused filename
    while [ -f "$new_file" ]; do
      ((counter++))
      new_file="${prompt}.${counter}.jpg"
    done

    # Rename the file
    mv "$file" "$new_file"
    echo "Renamed $file to: $new_file"
  fi
done
