#!/bin/bash

files=$(find dist -type f -name "*.d.ts");

# Loop through the declaration files
for file in $files; do
    # Update imports to include the '.cjs' extension
    sed -E "s/(.*)from '([^']*)'/\1from '\2.cjs'/g" "$file" > "${file%.d.ts}.d.cts"
    # add `.js` extensions to .d.ts files
    sed -i '' -e "s/\(.*\)from '\([^']*\)'/\1from '\2.js'/g" "$file"
done