import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const PBKDF2_ITERATIONS = 250000;

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
        category,
        template: '',
        variables: []
    };
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

        if (updatedPrompt.variations?.length > 0 && !Object.prototype.hasOwnProperty.call(req.body, 'image')) {
            delete updatedPrompt.image;
        }
        
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
