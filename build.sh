npx esbuild \
    notes/server.ts \
    --bundle \
    --minify \
    --format=esm \
    --platform=node \
    --target=es2020 \
    --sourcemap=inline \
    --outfile=notes/server.mjs \
    --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"

npx esbuild \
    notes/client.tsx \
    --bundle \
    --minify \
    --format=esm \
    --platform=browser \
    --target=es2022 \
    --sourcemap=inline \
    --outfile=notes/client.js

sam validate

sam build