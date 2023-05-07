#!/bin/bash

files=$(find dist -type f -name "*.d.ts");

# Loop through the files
for file in $files; do
    # Update lines matching the regular expression
    sed -E "s/(.*)from '([^']*)'/\1from '\2.cjs'/g" "$file" > "${file%.d.ts}.d.cts"
done