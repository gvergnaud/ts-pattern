#!/bin/bash

# TypeScript projects using `moduleResolution: nodenext` expect
# explicit extensions to be included in declaration files,
# and to have a different set of declarations for commonjs
# modules (.d.cts) and ES modules (.d.ts). `tsc` unfortunately
# doesn't provide a way to generate these declarations files,
# so I'm manually creating them in this script.

files=$(find dist -type f -name "*.d.ts");

# Loop through the declaration files
for file in $files; do
    # Update imports to include the '.cjs' extension
    sed -E "s/(.*)from '([^']*)'/\1from '\2.cjs'/g" "$file" > "${file%.d.ts}.d.cts"
    # add `.js` extensions to .d.ts files
    sed -i '' -e "s/\(.*\)from '\([^']*\)'/\1from '\2.js'/g" "$file"
done