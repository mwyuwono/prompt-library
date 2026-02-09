// Admin Orchestration Logic for Prompts Library

// State
let prompts = [];
let categories = [];
let currentPromptId = null;

// DOM Elements
const editor = document.getElementById('editor');
const promptListItems = document.getElementById('prompt-list-items');
const toast = document.getElementById('toast');
const editorContainer = document.getElementById('editor-container');
const emptyState = document.getElementById('empty-state');

/**
 * Initialize admin interface
 */
async function init() {
    console.log('Initializing admin interface...');
    
    await loadPrompts();
    renderPromptList();
    setupEventListeners();

    // Load prompt from URL hash or show empty state
    const hashId = window.location.hash.slice(1);
    if (hashId && prompts.find(p => p.id === hashId)) {
        loadPrompt(hashId);
    } else {
        showEmptyState();
    }
}

/**
 * Show empty state (no prompt selected)
 */
function showEmptyState() {
    currentPromptId = null;
    editorContainer.classList.remove('active');
    emptyState.classList.remove('hidden');
    renderPromptList(); // Update sidebar to clear active state
}

/**
 * Hide empty state (prompt selected)
 */
function hideEmptyState() {
    emptyState.classList.add('hidden');
    editorContainer.classList.add('active');
}

/**
 * Load all prompts from API
 */
async function loadPrompts() {
    try {
        console.log('Loading prompts from /api/prompts...');
        console.log('Current URL:', window.location.href);
        
        const response = await fetch('/api/prompts');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        prompts = data.prompts;
        categories = data.categories;
        
        console.log(`Loaded ${prompts.length} prompts and ${categories.length} categories`);
    } catch (error) {
        console.error('Error loading prompts:', error);
        
        // Determine if this is a server connectivity issue
        const isServerDown = error.message.includes('Failed to fetch') || 
                            error.name === 'TypeError' ||
                            error.message.includes('NetworkError');
        
        if (isServerDown) {
            showServerNotRunningError();
        } else {
            showToast(`Failed to load prompts: ${error.message}`, 'error');
        }
    }
}

/**
 * Show server not running error message
 */
function showServerNotRunningError() {
    // Replace the prompt list with helpful error message
    promptListItems.innerHTML = `
        <div class="server-error-state">
            <span class="material-symbols-outlined">error</span>
            <h3>Admin Server Not Running</h3>
            <p>The admin panel requires the Node.js server.</p>
            
            <h4>Option 1 - Using alias (recommended):</h4>
            <ol>
                <li>Open terminal and run: <code>admin-prompts</code></li>
                <li>Refresh this page</li>
            </ol>
            
            <h4>Option 2 - Manual:</h4>
            <ol>
                <li>Open terminal in the project folder</li>
                <li>Run: <code>npm install</code> (first time only)</li>
                <li>Run: <code>node server.js</code></li>
                <li>Refresh this page</li>
            </ol>
            
            <p class="server-url">Server should start on <code>http://localhost:3001</code></p>
        </div>
    `;
    
    showToast('Server connection failed. See instructions.', 'error');
}

/**
 * Save prompt to API
 */
async function savePrompt(prompt) {
    try {
        const response = await fetch(`/api/prompts/${prompt.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prompt)
        });
        
        if (!response.ok) {
            throw new Error('Failed to save prompt');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving prompt:', error);
        throw error;
    }
}

/**
 * Upload image to server
 */
async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Delete image from server
 */
async function deleteImage(filename) {
    try {
        const response = await fetch(`/api/images/${filename}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete image');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Editor save event
    editor.addEventListener('save', async (e) => {
        try {
            const result = await savePrompt(e.detail.prompt);
            showToast('Prompt saved successfully', 'success');
            
            // Reload prompts and update list
            await loadPrompts();
            renderPromptList();
            
            // Reload current prompt to reflect saved changes
            if (currentPromptId) {
                loadPrompt(currentPromptId);
            }
        } catch (err) {
            console.error('Save error:', err);
            showToast('Error saving prompt', 'error');
        }
    });

    // Editor cancel event
    editor.addEventListener('cancel', () => {
        // Reload current prompt to discard changes
        if (currentPromptId) {
            loadPrompt(currentPromptId);
            showToast('Changes discarded', 'info');
        }
    });

    // Image upload event
    editor.addEventListener('image-upload', async (e) => {
        try {
            const { file, promptId } = e.detail;
            const result = await uploadImage(file);
            
            if (result.success) {
                // Update editor with new image path
                const currentPrompt = prompts.find(p => p.id === promptId);
                if (currentPrompt) {
                    currentPrompt.image = result.path;
                    editor.prompt = { ...currentPrompt };
                }
                showToast('Image uploaded successfully', 'success');
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Error uploading image', 'error');
        }
    });

    // Image remove event
    editor.addEventListener('image-remove', async (e) => {
        try {
            const { promptId } = e.detail;
            const currentPrompt = prompts.find(p => p.id === promptId);
            
            if (currentPrompt && currentPrompt.image) {
                const filename = currentPrompt.image.split('/').pop();
                await deleteImage(filename);
                
                currentPrompt.image = '';
                editor.prompt = { ...currentPrompt };
                showToast('Image removed successfully', 'success');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Error removing image', 'error');
        }
    });

    // Handle browser back/forward
    window.addEventListener('hashchange', () => {
        const hashId = window.location.hash.slice(1);
        if (hashId && prompts.find(p => p.id === hashId)) {
            loadPrompt(hashId);
        } else {
            showEmptyState();
        }
    });
}

/**
 * Render prompt list sidebar
 */
function renderPromptList() {
    promptListItems.innerHTML = prompts.map(p => {
        const iconName = p.icon || 'article';
        const archivedBadge = p.archived ? '<span class="badge">Archived</span>' : '';
        const activeClass = p.id === currentPromptId ? 'active' : '';
        const archivedClass = p.archived ? 'archived' : '';
        
        return `
            <div class="prompt-item ${activeClass} ${archivedClass}" data-id="${p.id}">
                <span class="material-symbols-outlined">${iconName}</span>
                <div class="prompt-item-content">
                    <div class="prompt-item-title">${p.title}</div>
                </div>
                ${archivedBadge}
            </div>
        `;
    }).join('');

    // Attach click handlers
    document.querySelectorAll('.prompt-item').forEach(item => {
        item.addEventListener('click', () => {
            const promptId = item.dataset.id;
            loadPrompt(promptId);
        });
    });
}

/**
 * Load prompt into editor
 */
function loadPrompt(id) {
    console.log('Loading prompt:', id);
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) {
        console.error('Prompt not found:', id);
        return;
    }

    console.log('Found prompt:', prompt.title);
    console.log('Editor element:', editor);
    console.log('Editor is defined:', !!editor);
    
    currentPromptId = id;
    
    // Set prompt data - create a deep copy to ensure Lit detects the change
    // This is important for "Discard Changes" to work correctly after conversions
    editor.prompt = JSON.parse(JSON.stringify(prompt));
    editor.categories = categories;
    
    console.log('Prompt set on editor');
    
    // Update URL hash
    window.location.hash = id;
    
    // Hide empty state, show editor
    hideEmptyState();
    
    console.log('Editor container classes:', editorContainer.classList.toString());
    console.log('Empty state classes:', emptyState.classList.toString());
    
    // Update active state in sidebar
    renderPromptList();
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    if (toast && typeof toast.show === 'function') {
        toast.show(message, type);
    } else {
        // Fallback if toast component not loaded
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message);
    }
}

// Wait for web components to load, then initialize
async function waitForWebComponents() {
    // Check if wy-prompt-editor is registered
    let attempts = 0;
    while (!customElements.get('wy-prompt-editor') && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!customElements.get('wy-prompt-editor')) {
        console.error('Web components failed to load after 5 seconds');
        alert('Error: Web components failed to load. Please refresh the page.');
        return false;
    }
    
    console.log('Web components loaded successfully');
    return true;
}

window.addEventListener('DOMContentLoaded', async () => {
    const loaded = await waitForWebComponents();
    if (loaded) {
        init();
    }
});
