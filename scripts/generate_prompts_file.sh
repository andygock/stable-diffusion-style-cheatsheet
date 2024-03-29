#!/bin/bash
#
# Generate prompts for use with Automatic1111
#
# Example usage:
#
#   cat data/prompts-female.txt | bash ./scripts/generate_prompts_file.sh -female > data/prompts-full/female.txt
#   cat data/prompts-male.txt | bash ./scripts/generate_prompts_file.sh -male > data/prompts-full/male.txt
#
# Note: using "in bedroom" appears to generate a lot of nudity
# Starter negative prompt:
# worst quality, normal quality, low quality, low res, blurry, text, watermark, logo, banner, extra digits, cropped, jpeg artifacts, signature, username, error, sketch, duplicate, ugly, monochrome, horror, geometry, mutation, disgusting, nsfw, nude, censored

arrFemale[0]="highest quality photo of 40yo brunette woman indoors in lounge room"
arrFemale[1]="highest quality photo of 20yo blonde european woman indoors at home"
arrFemale[2]="highest quality photo of 30yo redhead american woman outdoors in city"
arrFemale[3]="highest quality photo of 60yo blonde woman indoors relaxing at home"

arrMale[0]="highest quality photo of 40yo european man indoors in lounge room"
arrMale[1]="highest quality photo of 20yo asian man indoors at home"
arrMale[2]="highest quality photo of 30yo african american man outdoors in city"
arrMale[3]="highest quality photo of 60yo nordic man indoors in workshop"

# Check for the argument passed to the script
if [ "$1" == "-female" ]; then
  arr=("${arrFemale[@]}")
elif [ "$1" == "-male" ]; then
  arr=("${arrMale[@]}")
else
  echo "Invalid argument. Please use -male or -female."
  exit 1
fi

# loop through each line from stdin
while read line; do
  # loop through each item in the selected array, get string, then append otherArgs
  for i in "${arr[@]}"; do
    echo "$i, $line"
  done
done
