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
let gitAskPassPath = null;

// Middleware
app.use(cors());
app.use(express.json());
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

// Helper functions for prompt datasets
const PUBLIC_PROMPTS_FILE = path.join(__dirname, 'prompts.json');
const PRIVATE_PROMPTS_SOURCE_FILE = path.join(__dirname, 'private-prompts.source.json');
const PRIVATE_PROMPTS_ENCRYPTED_FILE = path.join(__dirname, 'private-prompts.enc.json');
const PRIVATE_PASSPHRASE_FILE = path.join(__dirname, 'private-passcode.txt');

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
        .trim();
}

async function runGit(args, { useAuth = false, timeout = GIT_TIMEOUT_MS } = {}) {
    const env = {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0'
    };

    if (!useAuth) {
        delete env.GITHUB_TOKEN;
    }

    if (useAuth && process.env.GITHUB_TOKEN) {
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
    status.auth.required = httpsGitHub;
    status.auth.configured = httpsGitHub ? Boolean(process.env.GITHUB_TOKEN) : true;
    status.auth.message = httpsGitHub
        ? 'GITHUB_TOKEN is configured for HTTPS GitHub operations.'
        : 'This remote does not use HTTPS GitHub token authentication.';

    if (httpsGitHub && !process.env.GITHUB_TOKEN) {
        status.auth.ok = false;
        status.auth.message = 'Set GITHUB_TOKEN in the server environment to use this HTTPS GitHub remote.';
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

// API Routes

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
