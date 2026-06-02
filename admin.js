// Admin Orchestration Logic for Prompts Library

// State
let prompts = [];
let categories = [];
let currentPromptId = null;
let sidebarSearch = '';
let currentDataset = 'public';
let privateVaultReady = false;
let backupStatus = null;
let backupBusy = false;
let startupPullPromptShown = false;
let heroImageStatus = null;

// DOM Elements
const editor = document.getElementById('editor');
const promptListItems = document.getElementById('prompt-list-items');
const sidebarSearchInput = document.getElementById('sidebar-search-input');
const toast = document.getElementById('toast');
const editorContainer = document.getElementById('editor-container');
const emptyState = document.getElementById('empty-state');
const publicDatasetButton = document.getElementById('publicDatasetButton');
const privateDatasetButton = document.getElementById('privateDatasetButton');
const datasetStatus = document.getElementById('datasetStatus');
const sidebarTitle = document.getElementById('sidebarTitle');
const newPromptButton = document.getElementById('newPromptButton');
const backupStatusButton = document.getElementById('backupStatusButton');
const backupStatusLabel = document.getElementById('backupStatusLabel');
const backupModal = document.getElementById('backupModal');
const backupModalClose = document.getElementById('backupModalClose');
const backupModalNotice = document.getElementById('backupModalNotice');
const backupModalStatus = document.getElementById('backupModalStatus');
const backupModalBranch = document.getElementById('backupModalBranch');
const backupModalLastBackup = document.getElementById('backupModalLastBackup');
const backupModalRemote = document.getElementById('backupModalRemote');
const backupModalChanges = document.getElementById('backupModalChanges');
const backupModalAheadBehind = document.getElementById('backupModalAheadBehind');
const backupWarnings = document.getElementById('backupWarnings');
const backupRemoteInput = document.getElementById('backupRemoteInput');
const backupRefreshButton = document.getElementById('backupRefreshButton');
const backupRemoveRemoteButton = document.getElementById('backupRemoveRemoteButton');
const backupSaveRemoteButton = document.getElementById('backupSaveRemoteButton');
const backupPullButton = document.getElementById('backupPullButton');
const backupNowButton = document.getElementById('backupNowButton');
const sidebarCollapseButton = document.getElementById('sidebarCollapseButton');
const sidebarRevealButton = document.getElementById('sidebarRevealButton');
const SIDEBAR_COLLAPSED_KEY = 'promptAdminSidebarCollapsed';

/**
 * Initialize admin interface
 */
async function init() {
    console.log('Initializing admin interface...');
    currentDataset = getDatasetFromUrl();
    updateDatasetUI();
    
    await loadPrompts();
    await loadHeroImageStatus();
    renderPromptList();
    setupEventListeners();
    restoreSidebarState();

    // Load prompt from URL hash or show empty state
    const hashId = window.location.hash.slice(1);
    if (hashId && prompts.find(p => p.id === hashId)) {
        loadPrompt(hashId);
    } else {
        showEmptyState();
    }

    await refreshBackupStatus({ showStartupPrompt: true });
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
        console.log(`Loading ${currentDataset} prompts from /api/prompts...`);
        console.log('Current URL:', window.location.href);
        
        const response = await fetch(`/api/prompts?dataset=${currentDataset}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        prompts = data.prompts;
        categories = data.categories;
        privateVaultReady = Boolean(data.encryptedVaultReady);
        updateDatasetUI();
        
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
        const response = await fetch(`/api/prompts/${prompt.id}?dataset=${currentDataset}`, {
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

async function createPrompt() {
    try {
        const response = await fetch(`/api/prompts?dataset=${currentDataset}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: currentDataset === 'private' ? 'Untitled Private Prompt' : 'Untitled Prompt',
                category: categories[0] || 'Productivity'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create prompt');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating prompt:', error);
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

async function loadHeroImageStatus() {
    try {
        const response = await fetch('/api/hero-image/status');
        if (!response.ok) {
            throw new Error('Failed to load hero image provider status');
        }

        heroImageStatus = await response.json();
        editor.heroImageStatus = heroImageStatus;
        editor.heroImageMasterPrompt = heroImageStatus.masterPrompt || null;
    } catch (error) {
        console.error('Error loading hero image status:', error);
        heroImageStatus = {
            success: false,
            providers: {
                google: { configured: false, label: 'Google Nano Banana 2', model: 'gemini-3.1-flash-image' },
                openai: { configured: false, label: 'OpenAI GPT Image', model: 'gpt-image-2' }
            },
            masterPrompt: null
        };
        editor.heroImageStatus = heroImageStatus;
        editor.heroImageMasterPrompt = null;
    }
}

async function generateHeroImage({ provider, quality, prompt }) {
    const response = await fetch('/api/hero-image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, quality, prompt })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate hero image');
    }

    return data;
}

async function saveGeneratedImage({ image, mimeType }) {
    const response = await fetch('/api/images/generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, mimeType })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save generated image');
    }

    return data;
}

function getVariationByTarget(prompt, { variationId = null, variationIndex = null } = {}) {
    if (!prompt?.variations?.length) return null;

    if (variationId) {
        const variation = prompt.variations.find(item => item.id === variationId);
        if (variation) return variation;
    }

    if (Number.isInteger(variationIndex)) {
        return prompt.variations[variationIndex] || null;
    }

    return null;
}

function getPromptImagePath(prompt, { target = 'prompt', variationId = null, variationIndex = null } = {}) {
    if (!prompt) return '';

    if (target === 'variation') {
        return getVariationByTarget(prompt, { variationId, variationIndex })?.image || '';
    }

    return prompt.image || '';
}

function setPromptImagePath(prompt, { target = 'prompt', variationId = null, variationIndex = null } = {}, imagePath = '') {
    if (!prompt) return;

    if (target === 'variation') {
        const variation = getVariationByTarget(prompt, { variationId, variationIndex });
        if (variation) {
            variation.image = imagePath;
        }
        return Boolean(variation);
    }

    prompt.image = imagePath;
    return true;
}

function getAllImagePaths(prompt) {
    const imagePaths = [];

    if (prompt?.image) {
        imagePaths.push(prompt.image);
    }

    if (prompt?.variations?.length) {
        prompt.variations.forEach(variation => {
            if (variation.image) {
                imagePaths.push(variation.image);
            }
            if (variation.referenceImages?.length) {
                variation.referenceImages.forEach(ref => {
                    if (ref.path) imagePaths.push(ref.path);
                });
            }
        });
    }

    if (prompt?.referenceImages?.length) {
        prompt.referenceImages.forEach(ref => {
            if (ref.path) imagePaths.push(ref.path);
        });
    }

    return imagePaths;
}

function isImageReferenced(imagePath) {
    if (!imagePath) return false;

    return prompts.some(prompt => getAllImagePaths(prompt).includes(imagePath));
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    publicDatasetButton.addEventListener('click', () => switchDataset('public'));
    privateDatasetButton.addEventListener('click', () => switchDataset('private'));
    sidebarCollapseButton?.addEventListener('click', () => setSidebarCollapsed(true));
    sidebarRevealButton?.addEventListener('click', () => setSidebarCollapsed(false));

    newPromptButton.addEventListener('click', async () => {
        try {
            const result = await createPrompt();
            await loadPrompts();
            renderPromptList();
            loadPrompt(result.prompt.id);
            showSaveResult(result, 'Prompt created');
            refreshBackupStatus();
        } catch (error) {
            showToast('Error creating prompt', 'error');
        }
    });

    // Sidebar search
    sidebarSearchInput.addEventListener('input', () => {
        sidebarSearch = sidebarSearchInput.value.toLowerCase();
        renderPromptList();
    });

    // Editor save event
    editor.addEventListener('save', async (e) => {
        try {
            const result = await savePrompt(e.detail.prompt);
            showSaveResult(result, 'Prompt saved');
            
            // Reload prompts and update list
            await loadPrompts();
            await loadHeroImageStatus();
            renderPromptList();
            
            // Reload current prompt to reflect saved changes
            if (currentPromptId) {
                loadPrompt(currentPromptId);
            }

            refreshBackupStatus();
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
            const { file, promptId, target = 'prompt', variationIndex = null, variationId = null } = e.detail;
            const result = await uploadImage(file);
            
            if (result.success) {
                // Update editor with new image path
                const currentPrompt = prompts.find(p => p.id === promptId);
                if (currentPrompt) {
                    const imageTarget = { target, variationIndex, variationId };
                    const imageWasSet = setPromptImagePath(currentPrompt, imageTarget, result.path);
                    if (!imageWasSet) {
                        throw new Error('Variation image target was not found');
                    }

                    if (typeof editor.setImageValue === 'function') {
                        editor.setImageValue(imageTarget, result.path);
                    } else {
                        editor.prompt = JSON.parse(JSON.stringify(currentPrompt));
                    }
                }
                showToast('Image uploaded successfully', 'success');
                refreshBackupStatus();
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Error uploading image', 'error');
        }
    });

    // Image remove event
    editor.addEventListener('image-remove', async (e) => {
        try {
            const { promptId, target = 'prompt', variationIndex = null, variationId = null } = e.detail;
            const currentPrompt = prompts.find(p => p.id === promptId);
            const imageTarget = { target, variationIndex, variationId };
            const imagePath = getPromptImagePath(currentPrompt, imageTarget);
            
            if (currentPrompt && imagePath) {
                const imageWasCleared = setPromptImagePath(currentPrompt, imageTarget, '');
                if (!imageWasCleared) {
                    throw new Error('Variation image target was not found');
                }

                if (typeof editor.setImageValue === 'function') {
                    editor.setImageValue(imageTarget, '');
                } else {
                    editor.prompt = JSON.parse(JSON.stringify(currentPrompt));
                }

                if (!isImageReferenced(imagePath)) {
                    const filename = imagePath.split('/').pop();
                    await deleteImage(filename);
                }

                showToast('Image removed successfully', 'success');
                refreshBackupStatus();
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('Error removing image', 'error');
        }
    });

    // Reference image upload event
    editor.addEventListener('reference-image-upload', async (e) => {
        try {
            const { file, promptId, index, variationIndex = null, variationId = null } = e.detail;
            const result = await uploadImage(file);
            if (result.success) {
                const p = prompts.find(p => p.id === promptId);
                if (p) {
                    if (variationIndex !== null || variationId !== null) {
                        const variation = getVariationByTarget(p, { variationIndex, variationId });
                        if (variation) {
                            if (!variation.referenceImages) variation.referenceImages = [];
                            if (variation.referenceImages[index]) {
                                variation.referenceImages[index].path = result.path;
                            }
                            const resolvedIndex = variationId
                                ? p.variations.findIndex(v => v.id === variationId)
                                : variationIndex;
                            if (typeof editor.setVariationReferenceImageValue === 'function') {
                                editor.setVariationReferenceImageValue(resolvedIndex, index, result.path);
                            } else {
                                editor.prompt = JSON.parse(JSON.stringify(p));
                            }
                        }
                    } else if (p?.referenceImages?.[index]) {
                        p.referenceImages[index].path = result.path;
                        if (typeof editor.setReferenceImageValue === 'function') {
                            editor.setReferenceImageValue(index, result.path);
                        } else {
                            editor.prompt = JSON.parse(JSON.stringify(p));
                        }
                    }
                }
                showToast('Reference image uploaded', 'success');
                refreshBackupStatus();
            }
        } catch (err) {
            console.error('Reference image upload error:', err);
            showToast('Error uploading reference image', 'error');
        }
    });

    // Reference image remove event
    editor.addEventListener('reference-image-remove', async (e) => {
        try {
            const { promptId, index, path, variationIndex = null, variationId = null } = e.detail;
            const p = prompts.find(p => p.id === promptId);
            if (p) {
                if (variationIndex !== null || variationId !== null) {
                    const variation = getVariationByTarget(p, { variationIndex, variationId });
                    if (variation?.referenceImages?.[index]) {
                        variation.referenceImages[index].path = '';
                        const resolvedIndex = variationId
                            ? p.variations.findIndex(v => v.id === variationId)
                            : variationIndex;
                        if (typeof editor.setVariationReferenceImageValue === 'function') {
                            editor.setVariationReferenceImageValue(resolvedIndex, index, '');
                        } else {
                            editor.prompt = JSON.parse(JSON.stringify(p));
                        }
                        if (path && !isImageReferenced(path)) {
                            await deleteImage(path.split('/').pop());
                        }
                        showToast('Reference image removed', 'success');
                        refreshBackupStatus();
                    }
                } else if (p?.referenceImages?.[index]) {
                    p.referenceImages[index].path = '';
                    if (typeof editor.setReferenceImageValue === 'function') {
                        editor.setReferenceImageValue(index, '');
                    } else {
                        editor.prompt = JSON.parse(JSON.stringify(p));
                    }
                    if (path && !isImageReferenced(path)) {
                        await deleteImage(path.split('/').pop());
                    }
                    showToast('Reference image removed', 'success');
                    refreshBackupStatus();
                }
            }
        } catch (err) {
            console.error('Reference image remove error:', err);
            showToast('Error removing reference image', 'error');
        }
    });

    editor.addEventListener('hero-image-generate', async (e) => {
        try {
            const result = await generateHeroImage(e.detail);
            if (typeof editor.setHeroImagePreview === 'function') {
                editor.setHeroImagePreview({
                    image: result.image,
                    mimeType: result.mimeType,
                    metadata: result.metadata
                });
            }
            showToast('Hero image preview generated', 'success');
        } catch (err) {
            console.error('Hero image generation error:', err);
            if (typeof editor.setHeroImageError === 'function') {
                editor.setHeroImageError(err.message);
            }
            showToast('Error generating hero image', 'error');
        }
    });

    editor.addEventListener('hero-image-use', async (e) => {
        try {
            const { promptId, image, mimeType } = e.detail;
            const currentPrompt = prompts.find(p => p.id === promptId);
            if (!currentPrompt) {
                throw new Error('Prompt not found');
            }

            const result = await saveGeneratedImage({ image, mimeType });
            setPromptImagePath(currentPrompt, { target: 'prompt' }, result.path);

            if (typeof editor.setHeroImageAccepted === 'function') {
                editor.setHeroImageAccepted(result.path);
            } else {
                editor.prompt = JSON.parse(JSON.stringify(currentPrompt));
            }

            showToast('Generated image attached. Save the prompt to keep it.', 'success');
            refreshBackupStatus();
        } catch (err) {
            console.error('Hero image save error:', err);
            if (typeof editor.setHeroImageError === 'function') {
                editor.setHeroImageError(err.message);
            }
            showToast('Error attaching generated image', 'error');
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

    backupStatusButton.addEventListener('click', () => openBackupModal());
    backupModalClose.addEventListener('click', () => closeBackupModal());
    backupModal.addEventListener('click', (event) => {
        if (event.target === backupModal) {
            closeBackupModal();
        }
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !backupModal.hidden) {
            closeBackupModal();
        }
    });
    backupRefreshButton.addEventListener('click', () => refreshBackupStatus({ showToastOnSuccess: true }));
    backupSaveRemoteButton.addEventListener('click', saveBackupRemote);
    backupRemoveRemoteButton.addEventListener('click', removeBackupRemote);
    backupPullButton.addEventListener('click', pullBackupRemote);
    backupNowButton.addEventListener('click', runBackupNow);
}

function restoreSidebarState() {
    setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true', { persist: false });
}

function setSidebarCollapsed(collapsed, { persist = true } = {}) {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    sidebarCollapseButton?.setAttribute('aria-expanded', String(!collapsed));
    sidebarRevealButton?.setAttribute('aria-expanded', String(!collapsed));

    if (persist) {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    }
}

async function switchDataset(dataset) {
    if (dataset === currentDataset) return;

    currentDataset = dataset;
    currentPromptId = null;
    sidebarSearch = '';
    sidebarSearchInput.value = '';
    window.location.hash = '';
    updateDatasetUrl();
    updateDatasetUI();
    showEmptyState();

    await loadPrompts();
    renderPromptList();
}

/**
 * Render prompt list sidebar
 */
function renderPromptList() {
    const filtered = sidebarSearch
        ? prompts.filter(p => p.title.toLowerCase().includes(sidebarSearch))
        : prompts;

    promptListItems.innerHTML = filtered.map(p => {
        const iconName = p.icon || 'article';
        const archivedBadge = p.archived ? '<span class="badge">Archived</span>' : '';
        const privateBadge = currentDataset === 'private' ? '<span class="badge neutral">Private</span>' : '';
        const activeClass = p.id === currentPromptId ? 'active' : '';
        const archivedClass = p.archived ? 'archived' : '';
        
        return `
            <div class="prompt-item ${activeClass} ${archivedClass}" data-id="${p.id}">
                <span class="material-symbols-outlined">${iconName}</span>
                <div class="prompt-item-content">
                    <div class="prompt-item-title">${p.title}</div>
                    <div class="prompt-item-category">${p.category || 'Uncategorized'}</div>
                </div>
                ${archivedBadge}
                ${privateBadge}
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
    editor.heroImageStatus = heroImageStatus;
    editor.heroImageMasterPrompt = heroImageStatus?.masterPrompt || null;
    
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

function showSaveResult(result, successMessage) {
    if (!result?.encryption || result.encryption.ok) {
        showToast(successMessage, 'success');
        return;
    }

    showToast(result.encryption.message || `${successMessage}, but encrypted vault was not updated`, 'warning');
}

async function fetchBackupStatus() {
    const response = await fetch('/api/backup/status');
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.error || 'Failed to load backup status');
        error.status = data.status || null;
        throw error;
    }

    return data.status;
}

async function refreshBackupStatus({ showStartupPrompt = false, showToastOnSuccess = false } = {}) {
    try {
        setBackupBusy(true);
        backupStatus = await fetchBackupStatus();
        renderBackupStatus();

        if (showToastOnSuccess) {
            showToast('Backup status refreshed', 'success');
        }

        if (showStartupPrompt && !startupPullPromptShown && backupStatus?.statusKey === 'needs-pull') {
            startupPullPromptShown = true;
            openBackupModal('GitHub has newer commits. Pull before backing up.');
        }
    } catch (error) {
        console.error('Backup status error:', error);
        backupStatus = error.status || {
            statusKey: 'auth-required',
            statusLabel: 'Authentication required',
            warnings: [error.message],
            canBackup: false,
            canPull: false
        };
        renderBackupStatus();
    } finally {
        setBackupBusy(false);
    }
}

function renderBackupStatus() {
    const status = backupStatus || {
        statusKey: 'loading',
        statusLabel: 'Checking backup…',
        warnings: []
    };
    const iconByStatus = {
        'in-sync': 'cloud_done',
        'changes-pending': 'cloud_upload',
        'needs-pull': 'cloud_download',
        'missing-remote': 'link_off',
        'auth-required': 'lock',
        loading: 'sync'
    };

    backupStatusLabel.textContent = status.statusLabel || 'Checking backup…';
    backupStatusButton.className = `backup-status-button status-${status.statusKey || 'loading'}`;
    backupStatusButton.querySelector('.material-symbols-outlined').textContent = iconByStatus[status.statusKey] || 'sync';

    backupModalStatus.textContent = status.statusLabel || '-';
    backupModalBranch.textContent = status.branch || 'main';
    backupModalLastBackup.textContent = formatBackupTime(status.lastBackupTime);
    backupModalRemote.textContent = status.remoteUrl || 'No origin remote';
    backupModalChanges.textContent = status.hasWorkingTreeChanges
        ? `${status.changedFiles?.length || 0} file${status.changedFiles?.length === 1 ? '' : 's'} changed`
        : 'No working tree changes';
    backupModalAheadBehind.textContent = `${status.ahead || 0} ahead, ${status.behind || 0} behind`;
    backupRemoteInput.value = status.remoteUrl || status.defaultRemoteUrl || 'https://github.com/mwyuwono/prompt-library.git';

    renderBackupWarnings(status.warnings || []);

    backupPullButton.hidden = !status.canPull;
    backupNowButton.disabled = backupBusy || !status.canBackup;
    backupRemoveRemoteButton.disabled = backupBusy || !status.hasRemote;
    backupSaveRemoteButton.disabled = backupBusy;
    backupRefreshButton.disabled = backupBusy;
    backupPullButton.disabled = backupBusy || !status.canPull;
}

function renderBackupWarnings(warnings) {
    backupWarnings.replaceChildren();
    backupWarnings.hidden = warnings.length === 0;

    warnings.forEach(warning => {
        const item = document.createElement('p');
        item.textContent = warning;
        backupWarnings.appendChild(item);
    });
}

function formatBackupTime(value) {
    if (!value) return 'No backup commits yet';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

function openBackupModal(notice = '') {
    if (notice) {
        backupModalNotice.textContent = notice;
        backupModalNotice.hidden = false;
    } else {
        backupModalNotice.textContent = '';
        backupModalNotice.hidden = true;
    }

    backupModal.hidden = false;
    backupStatusButton.setAttribute('aria-expanded', 'true');
    backupNowButton.focus();
}

function closeBackupModal() {
    backupModal.hidden = true;
    backupStatusButton.setAttribute('aria-expanded', 'false');
    backupStatusButton.focus();
}

function setBackupBusy(isBusy) {
    backupBusy = isBusy;
    document.body.classList.toggle('backup-busy', isBusy);

    if (backupStatus) {
        renderBackupStatus();
    }
}

async function postBackupAction(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.error || 'Backup action failed');
        error.status = data.status || null;
        throw error;
    }

    return data;
}

async function runBackupNow() {
    try {
        setBackupBusy(true);
        const data = await postBackupAction('/api/backup/run', { method: 'POST' });
        backupStatus = data.status;
        renderBackupStatus();
        showToast(data.message || 'Backup complete', 'success');
    } catch (error) {
        console.error('Backup failed:', error);
        if (error.status) {
            backupStatus = error.status;
            renderBackupStatus();
        }
        showToast(error.message || 'Backup failed', 'error');
    } finally {
        setBackupBusy(false);
    }
}

async function pullBackupRemote() {
    try {
        setBackupBusy(true);
        const data = await postBackupAction('/api/backup/pull', { method: 'POST' });
        backupStatus = data.status;
        renderBackupStatus();
        showToast(data.message || 'Pull complete', 'success');
    } catch (error) {
        console.error('Pull failed:', error);
        if (error.status) {
            backupStatus = error.status;
            renderBackupStatus();
        }
        showToast(error.message || 'Pull failed', 'error');
    } finally {
        setBackupBusy(false);
    }
}

async function saveBackupRemote() {
    try {
        setBackupBusy(true);
        const data = await postBackupAction('/api/backup/remote', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remoteUrl: backupRemoteInput.value.trim() })
        });
        backupStatus = data.status;
        renderBackupStatus();
        await refreshBackupStatus();
        showToast(data.message || 'Remote saved', 'success');
    } catch (error) {
        console.error('Remote save failed:', error);
        if (error.status) {
            backupStatus = error.status;
            renderBackupStatus();
        }
        showToast(error.message || 'Failed to save remote', 'error');
    } finally {
        setBackupBusy(false);
    }
}

async function removeBackupRemote() {
    try {
        setBackupBusy(true);
        const data = await postBackupAction('/api/backup/remote', { method: 'DELETE' });
        backupStatus = data.status;
        renderBackupStatus();
        showToast(data.message || 'Remote removed', 'success');
    } catch (error) {
        console.error('Remote remove failed:', error);
        if (error.status) {
            backupStatus = error.status;
            renderBackupStatus();
        }
        showToast(error.message || 'Failed to remove remote', 'error');
    } finally {
        setBackupBusy(false);
    }
}

function getDatasetFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('dataset') === 'private' ? 'private' : 'public';
}

function updateDatasetUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('dataset', currentDataset);
    history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

function updateDatasetUI() {
    const isPrivate = currentDataset === 'private';

    publicDatasetButton.classList.toggle('active', !isPrivate);
    privateDatasetButton.classList.toggle('active', isPrivate);
    sidebarTitle.textContent = isPrivate ? 'Private Prompts' : 'Prompts';

    if (isPrivate) {
        datasetStatus.innerHTML = privateVaultReady
            ? 'Editing local private prompts in <code>private-prompts.source.json</code>. Saves also refresh the encrypted vault.'
            : 'Editing local private prompts in <code>private-prompts.source.json</code>. Add <code>PRIVATE_PROMPTS_PASSPHRASE</code> or <code>private-passcode.txt</code> to refresh the encrypted vault on save.';
    } else {
        datasetStatus.innerHTML = 'Editing public prompts in <code>prompts.json</code>.';
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
