# Vercel deployment storage

Team: `weaver-yuwono` (`team_HSxbM1n9TThluD1tkS8MrfHF`). The Hobby threshold is 10 GB of Deployment Storage.

The repository controls both `prompts` and `rb-fabric-collection`. Fabric and prompt-preview media belongs under the existing immutable S3 prefixes, not in Vercel deployment source. Upload flows must write directly to object storage with correct media content types and `Cache-Control: public, max-age=31536000, immutable`.

Run `node scripts/vercel-deploy-byte-inventory.mjs` before a deployment to see the tracked source footprint. The scheduled GitHub Action runs daily and is scoped to this team. It defaults to dry-run when started manually; its scheduled run deletes only an unaliased deployment that is either an older successful production deployment, a preview older than 14 days, or a failed/canceled deployment older than 7 days. It preserves active aliases and the two newest successful production deployments per project.

Native Vercel retention is configured per project: canceled and errored after 7 days; previews and production after 14 days. Vercel keeps a larger native safety set and places successful deletions in a 30-day recovery window, so the action remains the authoritative exact-policy control for active deployments. Check Vercel Usage > Deployment Storage after a run; its chart can lag deployment-count changes.
