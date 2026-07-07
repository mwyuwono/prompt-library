import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);

const app = express();
const PORT = process.env.PORT || 3001;
const PBKDF2_ITERATIONS = 250000;
const DEFAULT_REMOTE_URL = 'https://github.com/mwyuwono/prompt-library.git';
const DEFAULT_BRANCH = 'main';
const REMOTE_NAME = 'origin';
const GIT_TIMEOUT_MS = 30000;
const REFERENCE_ASSET_BUCKET = process.env.REFERENCE_ASSET_BUCKET || 'prompt-library-assets-009019643313';
const REFERENCE_ASSET_PREFIX = (process.env.REFERENCE_ASSET_PREFIX || 'reference-images').replace(/^\/+|\/+$/g, '');
const REFERENCE_ASSET_REGION = process.env.REFERENCE_ASSET_REGION || 'us-east-1';
const REFERENCE_ASSET_PROFILE = process.env.REFERENCE_ASSET_PROFILE || process.env.AWS_PROFILE || 'plots-s3-admin-bootstrap';
const REFERENCE_ASSET_PUBLIC_BASE_URL = (process.env.REFERENCE_ASSET_PUBLIC_BASE_URL ||
    `https://${REFERENCE_ASSET_BUCKET}.s3.amazonaws.com/${REFERENCE_ASSET_PREFIX}`).replace(/\/+$/g, '');
let gitAskPassPath = null;
let cachedGitHubToken = null;

function loadLocalEnvFile(filename) {
    const envPath = path.join(__dirname, filename);
    if (!fs.existsSync(envPath)) return;

    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;

        const equalsIndex = trimmed.indexOf('=');
        if (equalsIndex === -1) return;

        const key = trimmed.slice(0, equalsIndex).trim();
        let value = trimmed.slice(equalsIndex + 1).trim();
        if (!key || process.env[key]) return;

        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        if (value) {
            process.env[key] = value;
        }
    });
}

loadLocalEnvFile('.env.local');
loadLocalEnvFile('.env');

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.static('.')); // Serve static files from current directory

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'public', 'images');
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

const REFERENCE_ASSET_ALLOWED_MIME_PREFIXES = ['image/', 'audio/', 'video/', 'text/'];
const REFERENCE_ASSET_ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip'
];

const referenceAssetUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const mimetype = file.mimetype || '';
        const allowed = REFERENCE_ASSET_ALLOWED_MIME_PREFIXES.some(prefix => mimetype.startsWith(prefix)) ||
            REFERENCE_ASSET_ALLOWED_MIME_TYPES.includes(mimetype);
        if (!allowed) {
            return cb(new Error('This file type is not supported in the reference library'), false);
        }
        cb(null, true);
    }
});

// Helper functions for prompt datasets
const PUBLIC_PROMPTS_FILE = path.join(__dirname, 'prompts.json');
const PRIVATE_PROMPTS_SOURCE_FILE = path.join(__dirname, 'private-prompts.source.json');
const PRIVATE_PROMPTS_ENCRYPTED_FILE = path.join(__dirname, 'private-prompts.enc.json');
const PRIVATE_PASSPHRASE_FILE = path.join(__dirname, 'private-passcode.txt');
const ADMIN_SETTINGS_FILE = path.join(__dirname, 'admin-settings.json');
const PALETTES_FILE = path.join(__dirname, 'palettes.json');
const BULLFINCH_ROOT = process.env.BULLFINCH_ROOT ||
    '/Users/mwy/Library/CloudStorage/GoogleDrive-matt@weaver-yuwono.com/My Drive/Bullfinch';
const BULLFINCH_TOOLS_ROOT = path.join(BULLFINCH_ROOT, 'Tools');
const BULLFINCH_TOOLS_INDEX = path.join(BULLFINCH_TOOLS_ROOT, 'README.txt');
const DEFAULT_ADMIN_SETTINGS = {
    heroImage: {
        masterPrompt: ''
    }
};

function getDataset(req) {
    return req.query.dataset === 'private' ? 'private' : 'public';
}

function getPromptsFile(dataset) {
    return dataset === 'private' ? PRIVATE_PROMPTS_SOURCE_FILE : PUBLIC_PROMPTS_FILE;
}

function readPrompts(dataset = 'public') {
    try {
        const file = getPromptsFile(dataset);
        if (!fs.existsSync(file)) {
            return [];
        }

        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${dataset} prompts:`, error);
        return [];
    }
}

function writePrompts(dataset, prompts) {
    try {
        const file = getPromptsFile(dataset);
        // Atomic write using temp file + rename
        const tempFile = `${file}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(prompts, null, 2), 'utf8');
        fs.renameSync(tempFile, file);
        return true;
    } catch (error) {
        console.error(`Error writing ${dataset} prompts:`, error);
        return false;
    }
}

function normalizeAdminSettings(settings = {}) {
    return {
        ...DEFAULT_ADMIN_SETTINGS,
        ...settings,
        heroImage: {
            ...DEFAULT_ADMIN_SETTINGS.heroImage,
            ...(settings.heroImage || {})
        }
    };
}

function readAdminSettings() {
    try {
        if (!fs.existsSync(ADMIN_SETTINGS_FILE)) {
            return normalizeAdminSettings();
        }

        const data = fs.readFileSync(ADMIN_SETTINGS_FILE, 'utf8');
        return normalizeAdminSettings(JSON.parse(data));
    } catch (error) {
        console.error('Error reading admin settings:', error);
        return normalizeAdminSettings();
    }
}

function writeAdminSettings(settings) {
    try {
        const tempFile = `${ADMIN_SETTINGS_FILE}.tmp`;
        fs.writeFileSync(tempFile, `${JSON.stringify(normalizeAdminSettings(settings), null, 2)}\n`, 'utf8');
        fs.renameSync(tempFile, ADMIN_SETTINGS_FILE);
        return true;
    } catch (error) {
        console.error('Error writing admin settings:', error);
        return false;
    }
}

function validateHeroImageMasterPrompt(masterPrompt) {
    const normalized = String(masterPrompt || '').trim();
    if (!normalized) {
        return { ok: false, error: 'Master prompt is required.' };
    }

    if (!normalized.includes('{{subject_prompt}}')) {
        return { ok: false, error: 'Master prompt must include {{subject_prompt}}.' };
    }

    return { ok: true, value: normalized };
}

function getAwsCliArgs(args = []) {
    const cliArgs = [];
    if (REFERENCE_ASSET_PROFILE) {
        cliArgs.push('--profile', REFERENCE_ASSET_PROFILE);
    }
    cliArgs.push(...args);
    return cliArgs;
}

function sanitizeReferenceFolderPath(input = '') {
    return String(input || '')
        .split('/')
        .map(segment => segment.trim().replace(/[^a-zA-Z0-9 _-]+/g, '').trim())
        .filter(Boolean)
        .join('/');
}

function normalizeReferenceAssetKey(filename = '', folderPath = '') {
    const parsed = path.parse(filename);
    const extension = parsed.ext.toLowerCase();
    const base = parsed.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'reference';
    const folder = sanitizeReferenceFolderPath(folderPath);
    const folderSegment = folder ? `${folder}/` : '';
    return `${REFERENCE_ASSET_PREFIX}/${folderSegment}${Date.now()}-${base}${extension}`;
}

function getReferenceAssetUrl(key) {
    const relativeKey = String(key || '').replace(new RegExp(`^${REFERENCE_ASSET_PREFIX}/?`), '');
    return `${REFERENCE_ASSET_PUBLIC_BASE_URL}/${relativeKey.split('/').map(encodeURIComponent).join('/')}`;
}

async function runAwsJson(args, options = {}) {
    const { stdout } = await execFileAsync('aws', getAwsCliArgs(args), {
        timeout: options.timeout || 30000,
        maxBuffer: options.maxBuffer || 10 * 1024 * 1024
    });
    return stdout ? JSON.parse(stdout) : {};
}

async function listReferenceAssets(folderPath = '') {
    const folder = sanitizeReferenceFolderPath(folderPath);
    const prefix = folder ? `${REFERENCE_ASSET_PREFIX}/${folder}/` : `${REFERENCE_ASSET_PREFIX}/`;

    const result = await runAwsJson([
        's3api',
        'list-objects-v2',
        '--bucket',
        REFERENCE_ASSET_BUCKET,
        '--prefix',
        prefix,
        '--delimiter',
        '/',
        '--output',
        'json'
    ]);

    const folders = (result.CommonPrefixes || [])
        .map(item => item.Prefix)
        .filter(Boolean)
        .map(fullPrefix => {
            const name = fullPrefix.slice(prefix.length).replace(/\/$/, '');
            return {
                name,
                path: folder ? `${folder}/${name}` : name
            };
        })
        .filter(item => item.name);

    const assets = (result.Contents || [])
        .filter(item => item.Key && item.Key !== prefix && !item.Key.endsWith('/') && !item.Key.endsWith('/.keep'))
        .map(item => {
            const filename = path.basename(item.Key);
            const contentType = getMimeTypeFromFilename(filename);
            return {
                key: item.Key,
                filename,
                url: getReferenceAssetUrl(item.Key),
                size: item.Size || 0,
                lastModified: item.LastModified || null,
                contentType,
                type: contentType.startsWith('image/') ? 'image' : 'file'
            };
        })
        .sort((a, b) => String(b.lastModified || '').localeCompare(String(a.lastModified || '')));

    return { path: folder, folders, assets };
}

async function uploadReferenceAsset(file, folderPath = '') {
    const key = normalizeReferenceAssetKey(file.originalname, folderPath);
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-reference-'));
    const tempPath = path.join(tempDir, path.basename(key));

    try {
        fs.writeFileSync(tempPath, file.buffer);
        await execFileAsync('aws', getAwsCliArgs([
            's3',
            'cp',
            tempPath,
            `s3://${REFERENCE_ASSET_BUCKET}/${key}`,
            '--content-type',
            file.mimetype || getMimeTypeFromFilename(file.originalname),
            '--cache-control',
            'public, max-age=31536000, immutable',
            '--metadata-directive',
            'REPLACE',
            '--no-progress'
        ]), {
            timeout: 120000,
            maxBuffer: 10 * 1024 * 1024
        });

        const contentType = file.mimetype || getMimeTypeFromFilename(file.originalname);
        return {
            key,
            filename: path.basename(key),
            url: getReferenceAssetUrl(key),
            size: file.size,
            contentType,
            type: contentType.startsWith('image/') ? 'image' : 'file'
        };
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

async function listAllReferenceAssetKeys() {
    const result = await runAwsJson([
        's3api',
        'list-objects-v2',
        '--bucket',
        REFERENCE_ASSET_BUCKET,
        '--prefix',
        `${REFERENCE_ASSET_PREFIX}/`,
        '--output',
        'json'
    ]);
    return (result.Contents || []).map(item => item.Key).filter(Boolean);
}

async function listReferenceFolderPaths() {
    const keys = await listAllReferenceAssetKeys();
    const prefixLen = `${REFERENCE_ASSET_PREFIX}/`.length;
    const folderSet = new Set();

    keys.forEach(key => {
        const relative = key.slice(prefixLen);
        const segments = relative.split('/');
        segments.pop(); // drop the filename (or trailing empty segment for folder markers)
        const accum = [];
        segments.forEach(segment => {
            if (!segment) return;
            accum.push(segment);
            folderSet.add(accum.join('/'));
        });
    });

    return Array.from(folderSet).sort((a, b) => a.localeCompare(b));
}

async function moveReferenceAsset(sourceKey, destinationPath = '') {
    const prefix = `${REFERENCE_ASSET_PREFIX}/`;
    if (!sourceKey || !String(sourceKey).startsWith(prefix)) {
        throw new Error('Invalid source file');
    }

    const filename = path.basename(sourceKey);
    const destFolder = sanitizeReferenceFolderPath(destinationPath);
    const destKey = destFolder ? `${prefix}${destFolder}/${filename}` : `${prefix}${filename}`;

    if (destKey === sourceKey) {
        throw new Error('File is already in that folder');
    }

    await execFileAsync('aws', getAwsCliArgs([
        's3',
        'mv',
        `s3://${REFERENCE_ASSET_BUCKET}/${sourceKey}`,
        `s3://${REFERENCE_ASSET_BUCKET}/${destKey}`
    ]), {
        timeout: 60000
    });

    return {
        key: destKey,
        filename,
        url: getReferenceAssetUrl(destKey)
    };
}

async function createReferenceFolder(folderPath) {
    const folder = sanitizeReferenceFolderPath(folderPath);
    if (!folder) {
        throw new Error('Folder name is required');
    }

    const key = `${REFERENCE_ASSET_PREFIX}/${folder}/.keep`;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-reference-folder-'));
    const tempPath = path.join(tempDir, '.keep');

    try {
        fs.writeFileSync(tempPath, '');
        await execFileAsync('aws', getAwsCliArgs([
            's3',
            'cp',
            tempPath,
            `s3://${REFERENCE_ASSET_BUCKET}/${key}`,
            '--content-type',
            'text/plain',
            '--no-progress'
        ]), {
            timeout: 30000
        });

        return { path: folder, name: folder.split('/').pop() };
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}

function getPrivatePassphrase() {
    if (process.env.PRIVATE_PROMPTS_PASSPHRASE) {
        return process.env.PRIVATE_PROMPTS_PASSPHRASE;
    }

    if (fs.existsSync(PRIVATE_PASSPHRASE_FILE)) {
        const passphrase = fs.readFileSync(PRIVATE_PASSPHRASE_FILE, 'utf8').trim();
        return passphrase || null;
    }

    return null;
}

function encryptPrivatePrompts(prompts, passphrase) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ITERATIONS, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
        cipher.update(JSON.stringify(prompts, null, 2), 'utf8'),
        cipher.final()
    ]);
    const authTag = cipher.getAuthTag();

    const payload = {
        version: 1,
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        ciphertext: Buffer.concat([ciphertext, authTag]).toString('base64')
    };

    fs.writeFileSync(PRIVATE_PROMPTS_ENCRYPTED_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function syncPrivateEncryptedPayload(prompts) {
    const passphrase = getPrivatePassphrase();
    if (!passphrase) {
        return {
            ok: false,
            message: 'Private source saved, but encrypted vault was not updated because no passphrase is configured.'
        };
    }

    encryptPrivatePrompts(prompts, passphrase);
    return {
        ok: true,
        message: 'Private source and encrypted vault updated.'
    };
}

function createPromptShell({ title = 'Untitled Prompt', category = 'Productivity' } = {}) {
    const slugBase = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'untitled-prompt';

    return {
        id: `${slugBase}-${Date.now()}`,
        title,
        description: '',
        instructions: '',
        category,
        template: '',
        variables: []
    };
}

function slugFromToolHref(href = '') {
    return String(href)
        .replace(/\\/g, '/')
        .replace(/^Tools\//, '')
        .split('/')[0]
        .trim();
}

function stripMarkdown(value = '') {
    return String(value)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^[-*]\s+/gm, '')
        .trim();
}

function parseToolTypeAndStatus(indexBody = '', readmeBody = '') {
    const source = `${indexBody}\n${readmeBody}`;
    const typeLine = source.match(/\*\*Type:\*\*\s*([^\n]+)/)?.[1] || '';
    const statusOnTypeLine = typeLine.match(/[—-]\s+\*\*Status:\*\*\s*(.+)$/)?.[1] || '';
    const type = typeLine
        .replace(/[—-]\s+\*\*Status:\*\*.*$/, '')
        .trim();
    const statusMatch = source.match(/\*\*Status:\*\*\s*([^\n]+)/);

    return {
        type: stripMarkdown(type),
        status: stripMarkdown(statusOnTypeLine || statusMatch?.[1] || '')
    };
}

function parseReadmeSections(readme = '') {
    const sections = {};
    const headingRegex = /^##\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(readme)) !== null) {
        headings.push({
            title: match[1].trim(),
            start: match.index,
            contentStart: headingRegex.lastIndex
        });
    }

    headings.forEach((heading, index) => {
        const end = headings[index + 1]?.start ?? readme.length;
        sections[heading.title.toLowerCase()] = readme.slice(heading.contentStart, end).trim();
    });

    return sections;
}

function getSection(sections, names) {
    for (const name of names) {
        const section = sections[String(name).toLowerCase()];
        if (section) return section;
    }
    return '';
}

function parseKeySources(section = '') {
    return section
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => /^[-*]\s+/.test(line))
        .map(line => {
            const markdownLink = line.match(/^[-*]\s+\[([^\]]+)\]\(([^)]+)\)\s*(?:[—-]\s*(.*))?$/);
            if (markdownLink) {
                return {
                    label: markdownLink[1],
                    target: markdownLink[2],
                    note: stripMarkdown(markdownLink[3] || '')
                };
            }

            const plain = line.replace(/^[-*]\s+/, '');
            const [target, ...noteParts] = plain.split(/\s+[—-]\s+/);
            return {
                label: stripMarkdown(target),
                target: stripMarkdown(target),
                note: stripMarkdown(noteParts.join(' - '))
            };
        });
}

function getIndexSummary(indexBody = '') {
    return indexBody
        .split(/\r?\n/)
        .map(line => line.trim())
        .find(line => line &&
            !line.includes('**Type:**') &&
            !/^Key invocation:/i.test(line)
        ) || '';
}

function isMetadataOnlyOverview(value = '') {
    const cleaned = stripMarkdown(value);
    return !cleaned ||
        /^Type:\s*.+Status:\s*.+$/i.test(cleaned) ||
        /^Type:\s*.+$/i.test(cleaned);
}

function parseToolsIndex() {
    if (!fs.existsSync(BULLFINCH_TOOLS_INDEX)) {
        return [];
    }

    const indexText = fs.readFileSync(BULLFINCH_TOOLS_INDEX, 'utf8');
    const toolsSectionEnd = indexText.search(/\n##\s+Open Items/);
    const toolsIndexText = toolsSectionEnd === -1 ? indexText : indexText.slice(0, toolsSectionEnd);
    const entryRegex = /^###\s+\[([^\]]+)\]\(([^)]+)\)/gm;
    const entries = [];
    const tools = [];
    let match;

    while ((match = entryRegex.exec(toolsIndexText)) !== null) {
        entries.push({
            title: match[1].trim(),
            href: match[2].trim(),
            headingEnd: entryRegex.lastIndex,
            start: match.index
        });
    }

    entries.forEach((entry, index) => {
        const title = entry.title;
        const href = entry.href;
        const nextStart = entries[index + 1]?.start ?? toolsIndexText.length;
        const indexBody = toolsIndexText.slice(entry.headingEnd, nextStart).trim();
        const slug = slugFromToolHref(href);

        if (!slug) return;

        const readmePath = path.join(BULLFINCH_TOOLS_ROOT, slug, 'README.txt');
        if (!fs.existsSync(readmePath)) return;

        const readme = fs.readFileSync(readmePath, 'utf8');
        const sections = parseReadmeSections(readme);
        const parsed = parseToolTypeAndStatus(indexBody, readme);
        const readmeOverview = getSection(sections, ['Overview', 'Summary']);
        const overview = isMetadataOnlyOverview(readmeOverview)
            ? stripMarkdown(getIndexSummary(indexBody))
            : readmeOverview;
        const keyInvocation = getSection(sections, ['Key Invocation', 'How to Invoke', 'Invocation']);
        const keySourcesSection = getSection(sections, ['Key Sources', 'Key Files']);
        const usageNotes = getSection(sections, ['Usage Notes', 'When to Use It', 'Policy']);
        const routing = getSection(sections, ['Tool Routing', 'Editable Source']);

        tools.push({
            slug,
            title,
            type: parsed.type || 'Tool',
            status: parsed.status || 'Active',
            overview,
            keyInvocation,
            keySources: parseKeySources(keySourcesSection),
            usageNotes,
            routing,
            readmePath,
            folderPath: path.dirname(readmePath),
            sourceIndexPath: BULLFINCH_TOOLS_INDEX
        });
    });

    return tools.filter(tool => /active/i.test(tool.status));
}

function getToolBySlug(slug) {
    return parseToolsIndex().find(tool => tool.slug === slug);
}

function getGitAskPassPath() {
    if (gitAskPassPath && fs.existsSync(gitAskPassPath)) {
        return gitAskPassPath;
    }

    gitAskPassPath = path.join(os.tmpdir(), `prompts-library-git-askpass-${process.pid}.sh`);
    const script = [
        '#!/bin/sh',
        'case "$1" in',
        '  *Username*) printf "%s\\n" "x-access-token" ;;',
        '  *) printf "%s\\n" "$GITHUB_TOKEN" ;;',
        'esac',
        ''
    ].join('\n');
    fs.writeFileSync(gitAskPassPath, script, { mode: 0o700 });
    return gitAskPassPath;
}

function isHttpsGitHubRemote(remoteUrl) {
    return /^https:\/\/github\.com\//i.test(remoteUrl || '');
}

function sanitizeGitError(error) {
    return String(error?.stderr || error?.stdout || error?.message || error || '')
        .replaceAll(process.env.GITHUB_TOKEN || '__NO_TOKEN__', '[redacted]')
        .replaceAll(cachedGitHubToken || '__NO_GH_TOKEN__', '[redacted]')
        .trim();
}

async function getGitHubToken() {
    if (process.env.GITHUB_TOKEN) {
        return process.env.GITHUB_TOKEN;
    }

    if (cachedGitHubToken) {
        return cachedGitHubToken;
    }

    try {
        const result = await execFileAsync('gh', ['auth', 'token'], {
            cwd: __dirname,
            env: {
                ...process.env,
                GIT_TERMINAL_PROMPT: '0'
            },
            timeout: 10000,
            maxBuffer: 1024 * 1024
        });

        cachedGitHubToken = result.stdout.trim() || null;
        return cachedGitHubToken;
    } catch (error) {
        return null;
    }
}

async function runGit(args, { useAuth = false, timeout = GIT_TIMEOUT_MS } = {}) {
    const env = {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0'
    };

    if (!useAuth) {
        delete env.GITHUB_TOKEN;
    }

    if (useAuth) {
        const token = await getGitHubToken();
        if (token) {
            env.GITHUB_TOKEN = token;
        }
        env.GIT_ASKPASS = getGitAskPassPath();
    }

    try {
        const result = await execFileAsync('git', args, {
            cwd: __dirname,
            env,
            timeout,
            maxBuffer: 1024 * 1024
        });

        return {
            stdout: result.stdout.trim(),
            stderr: result.stderr.trim()
        };
    } catch (error) {
        const sanitized = sanitizeGitError(error);
        const wrapped = new Error(sanitized || `git ${args.join(' ')} failed`);
        wrapped.code = error.code;
        wrapped.signal = error.signal;
        wrapped.stdout = String(error.stdout || '').trim();
        wrapped.stderr = sanitized;
        throw wrapped;
    }
}

async function tryGit(args, options) {
    try {
        return await runGit(args, options);
    } catch (error) {
        return null;
    }
}

function parseAheadBehind(output) {
    const [ahead = '0', behind = '0'] = String(output || '').trim().split(/\s+/);
    return {
        ahead: Number.parseInt(ahead, 10) || 0,
        behind: Number.parseInt(behind, 10) || 0
    };
}

function parsePorcelain(output) {
    return String(output || '')
        .split('\n')
        .map(line => line.trimEnd())
        .filter(Boolean);
}

async function getBackupStatus({ fetchRemote = true } = {}) {
    const warnings = [];
    const status = {
        branch: DEFAULT_BRANCH,
        upstream: null,
        remoteName: REMOTE_NAME,
        remoteUrl: null,
        defaultRemoteUrl: DEFAULT_REMOTE_URL,
        hasRemote: false,
        lastBackupTime: null,
        lastBackupCommit: null,
        changedFiles: [],
        hasWorkingTreeChanges: false,
        ahead: 0,
        behind: 0,
        auth: {
            ok: true,
            required: false,
            configured: false,
            message: 'Authentication is not required for this remote.'
        },
        warnings,
        statusKey: 'in-sync',
        statusLabel: 'In sync',
        canBackup: true,
        canPull: false,
        message: ''
    };

    const branchResult = await tryGit(['branch', '--show-current']);
    status.branch = branchResult?.stdout || DEFAULT_BRANCH;

    const remoteResult = await tryGit(['remote', 'get-url', REMOTE_NAME]);
    status.remoteUrl = remoteResult?.stdout || null;
    status.hasRemote = Boolean(status.remoteUrl);

    const changedResult = await tryGit(['status', '--porcelain']);
    status.changedFiles = parsePorcelain(changedResult?.stdout);
    status.hasWorkingTreeChanges = status.changedFiles.length > 0;

    const lastBackupResult = await tryGit([
        'log',
        '-1',
        '--grep=^Backup:',
        '--format=%H%x09%cI%x09%s'
    ]);
    if (lastBackupResult?.stdout) {
        const [hash, time, subject] = lastBackupResult.stdout.split('\t');
        status.lastBackupCommit = hash || null;
        status.lastBackupTime = time || null;
        status.lastBackupSubject = subject || null;
    }

    if (!status.hasRemote) {
        status.auth = {
            ok: false,
            required: false,
            configured: false,
            message: 'No origin remote is configured.'
        };
        warnings.push('Add an origin remote before backing up.');
        status.statusKey = 'missing-remote';
        status.statusLabel = 'Missing remote';
        status.canBackup = false;
        status.message = 'Add a GitHub remote to enable backups.';
        return status;
    }

    const httpsGitHub = isHttpsGitHubRemote(status.remoteUrl);
    const gitHubToken = httpsGitHub ? await getGitHubToken() : null;
    status.auth.required = httpsGitHub;
    status.auth.configured = httpsGitHub ? Boolean(gitHubToken) : true;
    status.auth.message = httpsGitHub
        ? 'GitHub authentication is configured for HTTPS operations.'
        : 'This remote does not use HTTPS GitHub token authentication.';

    if (httpsGitHub && !gitHubToken) {
        status.auth.ok = false;
        status.auth.message = 'Sign in with GitHub CLI or set GITHUB_TOKEN in the server environment to use this HTTPS GitHub remote.';
        warnings.push(status.auth.message);
    }

    if (fetchRemote && status.auth.ok) {
        try {
            await runGit(['fetch', REMOTE_NAME, '--prune'], { useAuth: httpsGitHub });
        } catch (error) {
            status.auth.ok = false;
            status.auth.message = sanitizeGitError(error) || 'GitHub authentication failed.';
            warnings.push(status.auth.message);
        }
    }

    const upstreamResult = await tryGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
    status.upstream = upstreamResult?.stdout || `${REMOTE_NAME}/${status.branch || DEFAULT_BRANCH}`;

    const compareRef = status.upstream || `${REMOTE_NAME}/${status.branch || DEFAULT_BRANCH}`;
    const aheadBehindResult = await tryGit(['rev-list', '--left-right', '--count', `HEAD...${compareRef}`]);
    if (aheadBehindResult?.stdout) {
        const counts = parseAheadBehind(aheadBehindResult.stdout);
        status.ahead = counts.ahead;
        status.behind = counts.behind;
    } else {
        warnings.push(`Could not compare HEAD with ${compareRef}.`);
    }

    if (!status.auth.ok) {
        status.statusKey = 'auth-required';
        status.statusLabel = 'Authentication required';
        status.canBackup = false;
    } else if (status.behind > 0) {
        status.statusKey = 'needs-pull';
        status.statusLabel = 'Needs pull';
        status.canBackup = false;
    } else if (status.hasWorkingTreeChanges || status.ahead > 0) {
        status.statusKey = 'changes-pending';
        status.statusLabel = 'Changes pending';
        status.canBackup = true;
    } else {
        status.statusKey = 'in-sync';
        status.statusLabel = 'In sync';
        status.canBackup = true;
    }

    status.canPull = status.hasRemote && status.auth.ok && status.behind > 0;
    status.message = warnings[0] || status.statusLabel;
    return status;
}

async function ensureBackupAllowed() {
    const status = await getBackupStatus({ fetchRemote: true });

    if (!status.hasRemote) {
        const error = new Error('Add an origin remote before backing up.');
        error.statusCode = 400;
        error.backupStatus = status;
        throw error;
    }

    if (!status.auth.ok) {
        const error = new Error(status.auth.message || 'GitHub authentication is required.');
        error.statusCode = 401;
        error.backupStatus = status;
        throw error;
    }

    if (status.behind > 0) {
        const error = new Error('Pull remote changes before backing up.');
        error.statusCode = 409;
        error.backupStatus = status;
        throw error;
    }

    return status;
}

function sendGitError(res, error, fallbackMessage = 'Git operation failed') {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: error.message || fallbackMessage,
        status: error.backupStatus || null
    });
}

function getHeroImageProviders() {
    return {
        google: {
            configured: Boolean(process.env.GEMINI_API_KEY),
            label: 'Google Nano Banana 2',
            model: 'gemini-3.1-flash-image'
        },
        openai: {
            configured: Boolean(process.env.OPENAI_API_KEY),
            label: 'OpenAI GPT Image',
            model: 'gpt-image-2'
        }
    };
}

function getHeroImageMasterPrompt() {
    const settings = readAdminSettings();

    return {
        title: 'Hero Image Master Prompt',
        template: settings.heroImage.masterPrompt || ''
    };
}

function getHeroImageSettings(provider, quality = 'draft') {
    const normalizedQuality = ['draft', 'standard', 'final'].includes(quality) ? quality : 'draft';

    if (provider === 'openai') {
        return {
            quality: normalizedQuality === 'final' ? 'high' : normalizedQuality === 'standard' ? 'medium' : 'low',
            size: normalizedQuality === 'final' ? '2048x1152' : '1536x1024',
            outputFormat: 'jpeg',
            outputCompression: normalizedQuality === 'final' ? 92 : 86
        };
    }

    return {
        imageSize: normalizedQuality === 'final' ? '2K' : '1K',
        aspectRatio: '16:9'
    };
}

function getImageExtension(mimeType = '') {
    const normalized = mimeType.toLowerCase();
    if (normalized.includes('jpeg') || normalized.includes('jpg')) return '.jpg';
    if (normalized.includes('webp')) return '.webp';
    return '.png';
}

function getMimeTypeFromFilename(filename = '') {
    const extension = path.extname(filename).toLowerCase();
    if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
    if (extension === '.png') return 'image/png';
    if (extension === '.webp') return 'image/webp';
    if (extension === '.gif') return 'image/gif';
    if (extension === '.svg') return 'image/svg+xml';
    if (extension === '.pdf') return 'application/pdf';
    if (extension === '.txt' || extension === '.md') return 'text/plain';
    if (extension === '.json') return 'application/json';
    return 'application/octet-stream';
}

function normalizeBase64Image(imageData, fallbackMimeType = 'image/png') {
    const match = String(imageData || '').match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
    if (match) {
        return {
            mimeType: match[1],
            base64: match[2]
        };
    }

    return {
        mimeType: fallbackMimeType,
        base64: String(imageData || '')
    };
}

function extractGoogleImage(responseJson) {
    const parts = responseJson?.candidates?.flatMap(candidate => candidate?.content?.parts || []) || [];
    const imagePart = parts.find(part => part?.inlineData?.data || part?.inline_data?.data);
    const inlineData = imagePart?.inlineData || imagePart?.inline_data;

    if (!inlineData?.data) {
        throw new Error('Google did not return image data.');
    }

    return {
        base64: inlineData.data,
        mimeType: inlineData.mimeType || inlineData.mime_type || 'image/png'
    };
}

async function generateGoogleHeroImage(prompt, quality) {
    const settings = getHeroImageSettings('google', quality);
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent', {
        method: 'POST',
        headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                responseModalities: ['IMAGE'],
                imageConfig: {
                    aspectRatio: settings.aspectRatio,
                    imageSize: settings.imageSize
                }
            }
        })
    });

    const responseJson = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(responseJson?.error?.message || `Google image generation failed with HTTP ${response.status}`);
    }

    return {
        ...extractGoogleImage(responseJson),
        metadata: {
            provider: 'google',
            model: 'gemini-3.1-flash-image',
            quality,
            imageSize: settings.imageSize,
            aspectRatio: settings.aspectRatio
        }
    };
}

async function generateOpenAIHeroImage(prompt, quality) {
    const settings = getHeroImageSettings('openai', quality);
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-image-2',
            prompt,
            size: settings.size,
            quality: settings.quality,
            output_format: settings.outputFormat,
            output_compression: settings.outputCompression
        })
    });

    const responseJson = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(responseJson?.error?.message || `OpenAI image generation failed with HTTP ${response.status}`);
    }

    const image = responseJson?.data?.[0];
    if (!image?.b64_json) {
        throw new Error('OpenAI did not return image data.');
    }

    return {
        base64: image.b64_json,
        mimeType: `image/${settings.outputFormat}`,
        metadata: {
            provider: 'openai',
            model: 'gpt-image-2',
            quality: settings.quality,
            requestedQuality: quality,
            size: settings.size,
            outputFormat: settings.outputFormat
        }
    };
}

// API Routes

/**
 * GET /api/tools
 * Returns active Bullfinch tools from the Bullfinch tool registry.
 */
app.get('/api/tools', (req, res) => {
    try {
        const tools = parseToolsIndex();
        const types = [...new Set(tools.map(tool => tool.type).filter(Boolean))].sort();
        const statuses = [...new Set(tools.map(tool => tool.status).filter(Boolean))].sort();

        res.json({
            success: true,
            tools,
            types,
            statuses,
            bullfinchRoot: BULLFINCH_ROOT,
            sourceIndexPath: BULLFINCH_TOOLS_INDEX
        });
    } catch (error) {
        console.error('Error loading Bullfinch tools:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to load Bullfinch tools'
        });
    }
});

/**
 * GET /api/tools/:slug
 * Returns one active Bullfinch tool by slug.
 */
app.get('/api/tools/:slug', (req, res) => {
    try {
        const tool = getToolBySlug(req.params.slug);

        if (!tool) {
            return res.status(404).json({
                success: false,
                error: 'Tool not found'
            });
        }

        res.json({
            success: true,
            tool
        });
    } catch (error) {
        console.error('Error loading Bullfinch tool:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to load Bullfinch tool'
        });
    }
});

/**
 * GET /api/prompts
 * Returns all prompts (including archived) + unique categories array
 */
app.get('/api/prompts', (req, res) => {
    try {
        const dataset = getDataset(req);
        const prompts = readPrompts(dataset);
        const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))].sort();
        
        res.json({
            prompts,
            categories,
            dataset,
            encryptedVaultReady: dataset === 'private' ? Boolean(getPrivatePassphrase()) : true
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load prompts' });
    }
});

/**
 * GET /api/prompts/:id
 * Returns single prompt by ID
 */
app.get('/api/prompts/:id', (req, res) => {
    try {
        const dataset = getDataset(req);
        const prompts = readPrompts(dataset);
        const prompt = prompts.find(p => p.id === req.params.id);
        
        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }
        
        res.json({ prompt });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load prompt' });
    }
});

/**
 * GET /api/palettes
 * Returns all color palettes for admin use.
 */
app.get('/api/palettes', (req, res) => {
    try {
        const data = fs.existsSync(PALETTES_FILE)
            ? JSON.parse(fs.readFileSync(PALETTES_FILE, 'utf8'))
            : [];
        res.json({ palettes: data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load palettes' });
    }
});

/**
 * PUT /api/palettes
 * Replaces the entire palettes array (admin save).
 */
app.put('/api/palettes', (req, res) => {
    try {
        const { palettes } = req.body;
        if (!Array.isArray(palettes)) {
            return res.status(400).json({ error: 'palettes must be an array' });
        }
        const tempFile = `${PALETTES_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(palettes, null, 2), 'utf8');
        fs.renameSync(tempFile, PALETTES_FILE);
        res.json({ success: true, palettes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save palettes' });
    }
});

/**
 * PUT /api/prompts/:id
 * Updates a prompt in prompts.json
 */
app.put('/api/prompts/:id', (req, res) => {
    try {
        const dataset = getDataset(req);
        const prompts = readPrompts(dataset);
        const index = prompts.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Prompt not found' });
        }
        
        // Validate required fields
        const { title, category, description } = req.body;
        if (!title || !category) {
            return res.status(400).json({ error: 'Title and category are required' });
        }
        
        // Update prompt while preserving structure
        const updatedPrompt = {
            ...prompts[index],
            ...req.body,
            // Ensure variations structure is preserved
            variations: req.body.variations || prompts[index].variations,
            // Ensure variables structure is preserved
            variables: req.body.variables || prompts[index].variables || []
        };

        prompts[index] = updatedPrompt;
        
        if (!writePrompts(dataset, prompts)) {
            return res.status(500).json({ error: 'Failed to save prompts' });
        }

        const encryption = dataset === 'private'
            ? syncPrivateEncryptedPayload(prompts)
            : { ok: true, message: 'Public prompts saved.' };
        
        res.json({
            success: true,
            prompt: updatedPrompt,
            dataset,
            encryption
        });
    } catch (error) {
        console.error('Error updating prompt:', error);
        res.status(500).json({ error: 'Failed to update prompt' });
    }
});

/**
 * POST /api/prompts
 * Creates a new prompt shell in the selected dataset
 */
app.post('/api/prompts', (req, res) => {
    try {
        const dataset = getDataset(req);
        const prompts = readPrompts(dataset);
        const prompt = createPromptShell(req.body || {});

        prompts.push(prompt);

        if (!writePrompts(dataset, prompts)) {
            return res.status(500).json({ error: 'Failed to create prompt' });
        }

        const encryption = dataset === 'private'
            ? syncPrivateEncryptedPayload(prompts)
            : { ok: true, message: 'Public prompts updated.' };

        res.status(201).json({
            success: true,
            prompt,
            dataset,
            encryption
        });
    } catch (error) {
        console.error('Error creating prompt:', error);
        res.status(500).json({ error: 'Failed to create prompt' });
    }
});

/**
 * POST /api/prompts/:id/archive
 * Toggles archive status
 */
app.post('/api/prompts/:id/archive', (req, res) => {
    try {
        const dataset = getDataset(req);
        const prompts = readPrompts(dataset);
        const prompt = prompts.find(p => p.id === req.params.id);
        
        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }
        
        prompt.archived = !prompt.archived;
        
        if (!writePrompts(dataset, prompts)) {
            return res.status(500).json({ error: 'Failed to save prompts' });
        }

        const encryption = dataset === 'private'
            ? syncPrivateEncryptedPayload(prompts)
            : { ok: true, message: 'Public prompts updated.' };
        
        res.json({
            success: true,
            archived: prompt.archived,
            dataset,
            encryption
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle archive' });
    }
});

/**
 * GET /api/backup/status
 * Returns local Git/GitHub backup readiness.
 */
app.get('/api/backup/status', async (req, res) => {
    try {
        const status = await getBackupStatus({ fetchRemote: true });
        res.json({ success: true, status });
    } catch (error) {
        console.error('Error reading backup status:', error);
        sendGitError(res, error, 'Failed to read backup status');
    }
});

/**
 * POST /api/backup/run
 * Stages all changes, creates a timestamped backup commit when needed, and pushes.
 */
app.post('/api/backup/run', async (req, res) => {
    try {
        const statusBeforeBackup = await ensureBackupAllowed();
        const useAuth = isHttpsGitHubRemote(statusBeforeBackup.remoteUrl);

        if (!statusBeforeBackup.hasWorkingTreeChanges && statusBeforeBackup.ahead === 0) {
            return res.json({
                success: true,
                message: 'Already in sync. No backup commit was needed.',
                status: statusBeforeBackup
            });
        }

        let commitCreated = false;
        let commitMessage = null;

        if (statusBeforeBackup.hasWorkingTreeChanges) {
            await runGit(['add', '-A']);

            const stagedResult = await runGit(['diff', '--cached', '--name-only']);
            if (stagedResult.stdout) {
                const timestamp = new Date().toISOString();
                commitMessage = `Backup: ${timestamp}`;
                await runGit(['commit', '-m', commitMessage]);
                commitCreated = true;
            }
        }

        await runGit(['push', REMOTE_NAME, statusBeforeBackup.branch || DEFAULT_BRANCH], { useAuth });

        const status = await getBackupStatus({ fetchRemote: true });
        res.json({
            success: true,
            message: commitCreated
                ? `Backup pushed with commit "${commitMessage}".`
                : 'Local commits pushed to GitHub.',
            commitCreated,
            commitMessage,
            status
        });
    } catch (error) {
        console.error('Error running backup:', error);
        sendGitError(res, error, 'Backup failed');
    }
});

/**
 * POST /api/backup/pull
 * Pulls remote changes with normal merge behavior.
 */
app.post('/api/backup/pull', async (req, res) => {
    try {
        const statusBeforePull = await getBackupStatus({ fetchRemote: true });
        const useAuth = isHttpsGitHubRemote(statusBeforePull.remoteUrl);

        if (!statusBeforePull.hasRemote) {
            const error = new Error('Add an origin remote before pulling.');
            error.statusCode = 400;
            error.backupStatus = statusBeforePull;
            throw error;
        }

        if (!statusBeforePull.auth.ok) {
            const error = new Error(statusBeforePull.auth.message || 'GitHub authentication is required.');
            error.statusCode = 401;
            error.backupStatus = statusBeforePull;
            throw error;
        }

        const branch = statusBeforePull.branch || DEFAULT_BRANCH;
        await runGit(['pull', REMOTE_NAME, branch], { useAuth });

        const status = await getBackupStatus({ fetchRemote: true });
        res.json({
            success: true,
            message: 'Pulled remote changes from GitHub.',
            status
        });
    } catch (error) {
        console.error('Error pulling backup remote:', error);
        sendGitError(res, error, 'Pull failed');
    }
});

/**
 * PUT /api/backup/remote
 * Adds or updates the origin remote URL.
 */
app.put('/api/backup/remote', async (req, res) => {
    try {
        const remoteUrl = String(req.body?.remoteUrl || DEFAULT_REMOTE_URL).trim();
        if (!remoteUrl) {
            return res.status(400).json({ success: false, error: 'Remote URL is required.' });
        }

        const existingRemote = await tryGit(['remote', 'get-url', REMOTE_NAME]);
        if (existingRemote?.stdout) {
            await runGit(['remote', 'set-url', REMOTE_NAME, remoteUrl]);
        } else {
            await runGit(['remote', 'add', REMOTE_NAME, remoteUrl]);
        }

        const status = await getBackupStatus({ fetchRemote: false });
        res.json({
            success: true,
            message: 'Origin remote saved.',
            status
        });
    } catch (error) {
        console.error('Error saving backup remote:', error);
        sendGitError(res, error, 'Failed to save remote');
    }
});

/**
 * DELETE /api/backup/remote
 * Removes the origin remote.
 */
app.delete('/api/backup/remote', async (req, res) => {
    try {
        const existingRemote = await tryGit(['remote', 'get-url', REMOTE_NAME]);
        if (existingRemote?.stdout) {
            await runGit(['remote', 'remove', REMOTE_NAME]);
        }

        const status = await getBackupStatus({ fetchRemote: false });
        res.json({
            success: true,
            message: 'Origin remote removed.',
            status
        });
    } catch (error) {
        console.error('Error removing backup remote:', error);
        sendGitError(res, error, 'Failed to remove remote');
    }
});

/**
 * GET /api/admin-settings
 * Returns local admin settings.
 */
app.get('/api/admin-settings', (req, res) => {
    res.json({
        success: true,
        settings: readAdminSettings()
    });
});

/**
 * PUT /api/admin-settings/hero-image
 * Updates persistent hero image generation settings.
 */
app.put('/api/admin-settings/hero-image', (req, res) => {
    const validation = validateHeroImageMasterPrompt(req.body?.masterPrompt);
    if (!validation.ok) {
        return res.status(400).json({
            success: false,
            error: validation.error
        });
    }

    const settings = readAdminSettings();
    const updatedSettings = {
        ...settings,
        heroImage: {
            ...settings.heroImage,
            masterPrompt: validation.value
        }
    };

    if (!writeAdminSettings(updatedSettings)) {
        return res.status(500).json({
            success: false,
            error: 'Failed to save admin settings.'
        });
    }

    res.json({
        success: true,
        settings: updatedSettings
    });
});

/**
 * GET /api/hero-image/status
 * Returns configured image generation providers.
 */
app.get('/api/hero-image/status', (req, res) => {
    res.json({
        success: true,
        providers: getHeroImageProviders(),
        masterPrompt: getHeroImageMasterPrompt()
    });
});

/**
 * POST /api/hero-image/generate
 * Generates a temporary hero image preview without saving it.
 */
app.post('/api/hero-image/generate', async (req, res) => {
    try {
        const provider = req.body?.provider === 'openai' ? 'openai' : 'google';
        const prompt = String(req.body?.prompt || '').trim();
        const quality = String(req.body?.quality || 'draft');
        const providers = getHeroImageProviders();

        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt text is required.' });
        }

        if (!providers[provider]?.configured) {
            return res.status(400).json({
                success: false,
                error: provider === 'openai'
                    ? 'OPENAI_API_KEY is not configured.'
                    : 'GEMINI_API_KEY is not configured.'
            });
        }

        const result = provider === 'openai'
            ? await generateOpenAIHeroImage(prompt, quality)
            : await generateGoogleHeroImage(prompt, quality);

        res.json({
            success: true,
            image: result.base64,
            mimeType: result.mimeType,
            metadata: result.metadata
        });
    } catch (error) {
        console.error('Error generating hero image:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to generate hero image'
        });
    }
});

/**
 * POST /api/images/generated
 * Saves an approved generated image preview to public/images/.
 */
app.post('/api/images/generated', (req, res) => {
    try {
        const { mimeType, base64 } = normalizeBase64Image(req.body?.image, req.body?.mimeType || 'image/png');

        if (!base64 || !/^[a-z0-9+/=\s]+$/i.test(base64)) {
            return res.status(400).json({ success: false, error: 'Valid base64 image data is required.' });
        }

        const buffer = Buffer.from(base64.replace(/\s/g, ''), 'base64');
        if (!buffer.length || buffer.length > 10 * 1024 * 1024) {
            return res.status(400).json({ success: false, error: 'Generated image is empty or too large.' });
        }

        const uploadDir = path.join(__dirname, 'public', 'images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `generated-hero-${Date.now()}${getImageExtension(mimeType)}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        res.json({
            success: true,
            path: `public/images/${filename}`
        });
    } catch (error) {
        console.error('Error saving generated image:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to save generated image' });
    }
});

/**
 * POST /api/images/upload
 * Uploads image file to public/images/
 */
app.post('/api/images/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Return relative path for storage in prompts.json
        const imagePath = `public/images/${req.file.filename}`;
        
        res.json({
            success: true,
            path: imagePath
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: error.message || 'Failed to upload image' });
    }
});

/**
 * GET /api/reference-assets
 * Lists reusable prompt reference assets from S3.
 */
app.get('/api/reference-assets', async (req, res) => {
    try {
        const { path: folderPath, folders, assets } = await listReferenceAssets(req.query.path);
        res.json({
            success: true,
            bucket: REFERENCE_ASSET_BUCKET,
            prefix: REFERENCE_ASSET_PREFIX,
            publicBaseUrl: REFERENCE_ASSET_PUBLIC_BASE_URL,
            profile: REFERENCE_ASSET_PROFILE,
            path: folderPath,
            folders,
            assets
        });
    } catch (error) {
        console.error('Error listing reference assets:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to list reference assets',
            profile: REFERENCE_ASSET_PROFILE,
            bucket: REFERENCE_ASSET_BUCKET
        });
    }
});

/**
 * GET /api/reference-assets/folders
 * Lists every folder path in the reference assets bucket (full tree, not
 * just the current level) for use in the "move to folder" picker.
 */
app.get('/api/reference-assets/folders', async (req, res) => {
    try {
        const folders = await listReferenceFolderPaths();
        res.json({ success: true, folders });
    } catch (error) {
        console.error('Error listing reference folders:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to list folders' });
    }
});

/**
 * POST /api/reference-assets/move
 * Moves an existing reference asset into a different folder.
 */
app.post('/api/reference-assets/move', async (req, res) => {
    try {
        const asset = await moveReferenceAsset(req.body?.key, req.body?.destinationPath || '');
        res.json({ success: true, asset });
    } catch (error) {
        console.error('Error moving reference asset:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to move file' });
    }
});

/**
 * POST /api/reference-assets/folders
 * Creates a folder (zero-byte marker object) inside the reference assets bucket.
 */
app.post('/api/reference-assets/folders', async (req, res) => {
    try {
        const parentPath = sanitizeReferenceFolderPath(req.body?.parentPath || '');
        const name = sanitizeReferenceFolderPath(req.body?.name || '');
        if (!name) {
            return res.status(400).json({ success: false, error: 'Folder name is required' });
        }

        const folderPath = parentPath ? `${parentPath}/${name}` : name;
        const folder = await createReferenceFolder(folderPath);
        res.json({ success: true, folder });
    } catch (error) {
        console.error('Error creating reference folder:', error);
        res.status(400).json({ success: false, error: error.message || 'Failed to create folder' });
    }
});

/**
 * POST /api/reference-assets/upload
 * Uploads a reusable prompt reference asset to S3, optionally into a subfolder.
 */
app.post('/api/reference-assets/upload', referenceAssetUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const asset = await uploadReferenceAsset(req.file, req.body?.path);
        res.json({ success: true, asset, url: asset.url });
    } catch (error) {
        console.error('Error uploading reference asset:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to upload reference asset' });
    }
});

/**
 * DELETE /api/images/:filename
 * Deletes image file from public/images/
 */
app.delete('/api/images/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(__dirname, 'public', 'images', filename);
        
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        fs.unlinkSync(filepath);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ error: 'Failed to delete image' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Prompts Library Admin Server running on http://localhost:${PORT}`);
    console.log(`📝 Admin panel: http://localhost:${PORT}/admin.html`);
    console.log(`🌐 Public site: http://localhost:${PORT}/index.html\n`);
});
