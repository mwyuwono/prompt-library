# Robert Brown Fabric Collection

React, TypeScript, and Vite site for `https://rb.weaver-yuwono.com`.

## Development

```bash
npm install
npm run dev
npm run build
```

The local-only admin is available at `/admin`. Production returns 404 for that route.

## Content and assets

- Collection content: `src/data/content.json`.
- Small, essential local site assets: `public/fabrics/`.
- Uploaded fabric images: `https://prompt-library-assets-009019643313.s3.amazonaws.com/rb-fabric-collection/fabrics/uploads/`.

`content.json` must store the public S3 URL for uploaded fabric images. The local Vite admin upload route writes to that S3 prefix. Do not add or retain a duplicate upload under `public/fabrics/uploads/`.

## Deployment storage

Vercel deploys this subdirectory as its own `rb-fabric-collection` project and retains full deployment artifacts. `dist/` is ignored. Keep generated, bulk, or user-uploaded assets in the registered S3 prefix, not in `public/` or build output.

Before media-heavy work, inventory deployable bytes and confirm `.vercelignore` excludes generated output, dependencies, caches, and local data. After deployment, confirm live image URLs load from S3 and inspect Vercel Deployment Storage. Team budget: 10 GB; project retention: 30 days.
