
npx esbuild \
    notes/server.ts \
    --bundle \
    --format=esm \
    --platform=node \
    --target=es2020 \
    --sourcemap=inline \
    --outfile=notes/server.mjs \
    --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"

npx esbuild \
    notes/client.tsx \
    --bundle \
    --format=esm \
    --platform=browser \
    --target=es2022 \
    --sourcemap=inline \
    --outfile=notes/client.js

sam build
sam local start-api