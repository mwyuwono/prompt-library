/**
 * One-time migration: moves existing top-level objects in the reference
 * assets bucket (reference-images/*) into reference-images/Images/Matt/.
 *
 * Requires local AWS credentials (the same profile server.js uses). Run once,
 * locally, after pulling the folder-aware reference-library changes:
 *
 *   node scripts/migrate-reference-library.mjs
 *   node scripts/migrate-reference-library.mjs --dry-run
 *
 * Safe to re-run: skips anything already inside a subfolder.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const BUCKET = process.env.REFERENCE_ASSET_BUCKET || 'prompt-library-assets-009019643313';
const PREFIX = (process.env.REFERENCE_ASSET_PREFIX || 'reference-images').replace(/^\/+|\/+$/g, '');
const PROFILE = process.env.REFERENCE_ASSET_PROFILE || process.env.AWS_PROFILE || 'plots-s3-admin-bootstrap';
const DEST_FOLDER = 'Images/Matt';

const dryRun = process.argv.includes('--dry-run');

function getAwsCliArgs(args = []) {
    const cliArgs = [];
    if (PROFILE) cliArgs.push('--profile', PROFILE);
    cliArgs.push(...args);
    return cliArgs;
}

async function runAwsJson(args) {
    const { stdout } = await execFileAsync('aws', getAwsCliArgs(args), {
        maxBuffer: 10 * 1024 * 1024
    });
    return stdout ? JSON.parse(stdout) : {};
}

async function listTopLevelObjects() {
    const result = await runAwsJson([
        's3api',
        'list-objects-v2',
        '--bucket',
        BUCKET,
        '--prefix',
        `${PREFIX}/`,
        '--delimiter',
        '/',
        '--output',
        'json'
    ]);
    return (result.Contents || [])
        .map(item => item.Key)
        .filter(Boolean)
        .filter(key => key !== `${PREFIX}/` && !key.endsWith('/.keep'));
}

async function moveObject(key) {
    const filename = key.split('/').pop();
    const destKey = `${PREFIX}/${DEST_FOLDER}/${filename}`;
    const source = `s3://${BUCKET}/${key}`;
    const dest = `s3://${BUCKET}/${destKey}`;

    if (dryRun) {
        console.log(`[dry-run] ${source} -> ${dest}`);
        return;
    }

    await execFileAsync('aws', getAwsCliArgs(['s3', 'mv', source, dest]));
    console.log(`moved ${key} -> ${destKey}`);
}

async function main() {
    console.log(`Listing top-level objects under s3://${BUCKET}/${PREFIX}/ ...`);
    const keys = await listTopLevelObjects();

    if (!keys.length) {
        console.log('Nothing to migrate — no top-level files found.');
        return;
    }

    console.log(`Found ${keys.length} file(s) to move into ${PREFIX}/${DEST_FOLDER}/`);
    for (const key of keys) {
        await moveObject(key);
    }
    console.log(dryRun ? 'Dry run complete.' : 'Migration complete.');
}

main().catch(error => {
    console.error('Migration failed:', error.message || error);
    process.exit(1);
});
