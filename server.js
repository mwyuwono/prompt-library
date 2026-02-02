import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

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

// Helper functions for prompts.json
const PROMPTS_FILE = path.join(__dirname, 'prompts.json');

function readPrompts() {
    try {
        const data = fs.readFileSync(PROMPTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading prompts.json:', error);
        return [];
    }
}

function writePrompts(prompts) {
    try {
        // Atomic write using temp file + rename
        const tempFile = `${PROMPTS_FILE}.tmp`;
        fs.writeFileSync(tempFile, JSON.stringify(prompts, null, 2), 'utf8');
        fs.renameSync(tempFile, PROMPTS_FILE);
        return true;
    } catch (error) {
        console.error('Error writing prompts.json:', error);
        return false;
    }
}

// API Routes

/**
 * GET /api/prompts
 * Returns all prompts (including archived) + unique categories array
 */
app.get('/api/prompts', (req, res) => {
    try {
        const prompts = readPrompts();
        const categories = [...new Set(prompts.map(p => p.category).filter(Boolean))].sort();
        
        res.json({
            prompts,
            categories
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
        const prompts = readPrompts();
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
        const prompts = readPrompts();
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
        
        if (!writePrompts(prompts)) {
            return res.status(500).json({ error: 'Failed to save prompts' });
        }
        
        res.json({
            success: true,
            prompt: updatedPrompt
        });
    } catch (error) {
        console.error('Error updating prompt:', error);
        res.status(500).json({ error: 'Failed to update prompt' });
    }
});

/**
 * POST /api/prompts/:id/archive
 * Toggles archive status
 */
app.post('/api/prompts/:id/archive', (req, res) => {
    try {
        const prompts = readPrompts();
        const prompt = prompts.find(p => p.id === req.params.id);
        
        if (!prompt) {
            return res.status(404).json({ error: 'Prompt not found' });
        }
        
        prompt.archived = !prompt.archived;
        
        if (!writePrompts(prompts)) {
            return res.status(500).json({ error: 'Failed to save prompts' });
        }
        
        res.json({
            success: true,
            archived: prompt.archived
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
