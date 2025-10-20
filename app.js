/**
 * PromptLibrary - A vanilla JavaScript application for managing AI prompt templates
 */

class PromptLibrary {
    constructor() {
        this.prompts = [];
        this.filteredPrompts = [];
        this.searchTerm = '';
        this.selectedCategory = '';

        // DOM elements
        this.promptGrid = document.getElementById('promptGrid');
        this.searchInput = document.getElementById('searchInput');
        this.categoryChips = document.getElementById('categoryChips');
        this.emptyState = document.getElementById('emptyState');
        this.toast = document.getElementById('toast');

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.loadPrompts();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.populateCategoryFilter();
        this.renderPrompts();
    }

    /**
     * Load prompts from JSON file
     */
    async loadPrompts() {
        try {
            const response = await fetch('prompts.json');
            this.prompts = await response.json();

            // Load saved variable values and metadata from localStorage
            this.prompts.forEach(prompt => {
                if (prompt.variables) {
                    this.loadVariableValues(prompt.id, prompt.variables);
                }
                // Load metadata (usage count, favorites, last used)
                const metadata = this.loadPromptMetadata(prompt.id);
                if (metadata) {
                    Object.assign(prompt, metadata);
                }
            });

            this.filteredPrompts = [...this.prompts];
        } catch (error) {
            console.error('Error loading prompts:', error);
            this.prompts = [];
            this.filteredPrompts = [];
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Search input
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterPrompts();
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Update search hint based on platform
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const searchHint = document.getElementById('searchHint');
        if (searchHint && !isMac) {
            searchHint.innerHTML = 'Press <kbd>Ctrl+K</kbd> to search';
        }

        document.addEventListener('keydown', (e) => {
            // Escape - Collapse currently expanded card
            if (e.key === 'Escape') {
                const expandedIndex = this.filteredPrompts.findIndex(p => p.expanded);
                if (expandedIndex !== -1) {
                    this.toggleExpand(expandedIndex);
                }
            }

            // Cmd/Ctrl + K - Focus search input
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                this.searchInput.focus();
            }

            // Cmd/Ctrl + / - Show keyboard shortcuts modal
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                this.showShortcutsModal();
            }
        });
    }

    /**
     * Populate category filter chips
     */
    populateCategoryFilter() {
        const categories = [...new Set(this.prompts.map(p => p.category))].sort();

        // Clear existing chips
        this.categoryChips.innerHTML = '';

        // Add "All" chip
        const allChip = this.createCategoryChip('', 'All', true);
        this.categoryChips.appendChild(allChip);

        // Add category chips
        categories.forEach(category => {
            const chip = this.createCategoryChip(category, category, false);
            this.categoryChips.appendChild(chip);
        });
    }

    /**
     * Create a category filter chip
     */
    createCategoryChip(value, label, isActive) {
        const chip = document.createElement('button');
        chip.className = `category-chip ${isActive ? 'active' : ''}`;
        chip.textContent = label;
        chip.dataset.category = value;

        chip.addEventListener('click', () => {
            this.selectedCategory = value;
            this.updateActiveChip(chip);
            this.filterPrompts();
        });

        return chip;
    }

    /**
     * Update active chip styling
     */
    updateActiveChip(activeChip) {
        // Remove active class from all chips
        this.categoryChips.querySelectorAll('.category-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        // Add active class to clicked chip
        activeChip.classList.add('active');
    }

    /**
     * Filter prompts based on search term and category
     */
    filterPrompts() {
        this.filteredPrompts = this.prompts.filter(prompt => {
            const searchLower = this.searchTerm;

            const matchesSearch = !searchLower ||
                prompt.title.toLowerCase().includes(searchLower) ||
                prompt.description.toLowerCase().includes(searchLower) ||
                prompt.category.toLowerCase().includes(searchLower) ||
                prompt.template.toLowerCase().includes(searchLower);

            const matchesCategory = !this.selectedCategory ||
                prompt.category === this.selectedCategory;

            return matchesSearch && matchesCategory;
        });

        this.renderPrompts();
    }

    /**
     * Render all prompts to the grid
     */
    renderPrompts() {
        // Clear grid
        this.promptGrid.innerHTML = '';

        // Show/hide empty state
        if (this.filteredPrompts.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        } else {
            this.emptyState.style.display = 'none';
        }

        // Render each prompt card
        this.filteredPrompts.forEach((prompt, index) => {
            const card = this.createPromptCard(prompt, index);
            this.promptGrid.appendChild(card);
        });
    }

    /**
     * Create a prompt card element
     */
    createPromptCard(prompt, index) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.index = index;
        card.dataset.locked = prompt.locked !== false; // Default to locked
        card.dataset.expanded = prompt.expanded || false; // Default to collapsed

        card.innerHTML = this.getCardHTML(prompt, index);

        // Attach event listeners
        this.attachCardEventListeners(card, prompt, index);

        return card;
    }

    /**
     * Get HTML for a prompt card
     */
    getCardHTML(prompt, index) {
        const isLocked = prompt.locked !== false;
        const isExpanded = prompt.expanded || false;
        const variableCount = prompt.variables?.length || 0;

        return `
            <div class="card-header" data-action="toggle-expand">
                <div class="card-title-wrapper" data-action="toggle-expand">
                    <h3 class="card-title">${this.highlightText(prompt.title, this.searchTerm)}</h3>
                    <span class="card-category">${this.highlightText(prompt.category, this.searchTerm)}</span>
                    ${!isExpanded && variableCount > 0 ?
                        `<span class="variable-count-badge">${variableCount} variable${variableCount > 1 ? 's' : ''}</span>`
                        : ''}
                </div>
                <div class="card-header-actions" data-action="toggle-expand">
                    ${isExpanded ? `
                        <button class="lock-button" data-action="toggle-lock" onclick="event.stopPropagation()">
                            ${isLocked ? '🔒' : '🔓'}
                        </button>
                    ` : ''}
                    <span class="expand-button" data-action="toggle-expand">
                        ${isExpanded ? '▲' : '▼'}
                    </span>
                </div>
            </div>
            <p class="card-description" data-action="toggle-expand">${this.highlightText(prompt.description, this.searchTerm)}</p>

            <div class="card-content ${isExpanded ? 'expanded' : 'collapsed'}">
                ${isLocked ? this.getLockedViewHTML(prompt, index) : this.getEditorHTML(prompt)}

                <div class="card-actions">
                    ${isLocked ?
                        `<button class="btn btn-primary" data-action="copy">Copy to Clipboard</button>
                         <button class="btn btn-secondary" data-action="download">Download</button>` :
                        `<button class="btn btn-secondary" data-action="save">Save Changes</button>`
                    }
                </div>
            </div>
        `;
    }

    /**
     * Get HTML for locked view (tab interface with variables and preview)
     */
    getLockedViewHTML(prompt, index) {
        const compiledPrompt = this.compilePrompt(prompt);
        const hasVariables = prompt.variables && prompt.variables.length > 0;
        const activeTab = prompt.activeTab || 'variables';

        if (!hasVariables) {
            return this.getPreviewHTML(compiledPrompt);
        }

        return `
            <div class="tabs-container">
                <div class="tabs-header">
                    <button class="tab-button ${activeTab === 'variables' ? 'active' : ''}" data-action="switch-tab" data-tab="variables">
                        Variables
                    </button>
                    <button class="tab-button ${activeTab === 'preview' ? 'active' : ''}" data-action="switch-tab" data-tab="preview">
                        Preview
                    </button>
                    ${activeTab === 'variables' ? `
                        <button class="btn-text" data-action="clear-variables" onclick="event.stopPropagation()">Clear All</button>
                    ` : ''}
                </div>
                <div class="tabs-content">
                    <div class="tab-pane ${activeTab === 'variables' ? 'active' : ''}" data-tab="variables">
                        ${this.getVariablesHTML(prompt)}
                    </div>
                    <div class="tab-pane ${activeTab === 'preview' ? 'active' : ''}" data-tab="preview">
                        ${this.getPreviewContentHTML(compiledPrompt)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get HTML for preview content (inside tab)
     */
    getPreviewContentHTML(compiledPrompt) {
        return `
            <div class="preview-content">${this.escapeHTML(compiledPrompt)}</div>
        `;
    }

    /**
     * Get HTML for preview section (standalone, when no variables)
     */
    getPreviewHTML(compiledPrompt) {
        return `
            <div class="preview-section">
                <div class="preview-header">Preview</div>
                <div class="preview-content">${this.escapeHTML(compiledPrompt)}</div>
            </div>
        `;
    }

    /**
     * Get HTML for variables section (inside tab)
     */
    getVariablesHTML(prompt) {
        if (!prompt.variables || prompt.variables.length === 0) {
            return '';
        }

        return `
            <div class="variables-section">
                ${prompt.variables.map(variable => `
                    <div class="variable-group">
                        <label class="variable-label">${this.escapeHTML(variable.label)}</label>
                        <input
                            type="text"
                            class="variable-input ${variable.value ? 'has-value' : ''}"
                            data-variable="${this.escapeHTML(variable.name)}"
                            placeholder="${this.escapeHTML(variable.placeholder || '')}"
                            value="${this.escapeHTML(variable.value || '')}"
                        >
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Get HTML for template editor (unlocked state)
     */
    getEditorHTML(prompt) {
        return `
            <div class="template-editor">
                <textarea
                    class="template-textarea"
                    data-action="edit-template"
                >${this.escapeHTML(prompt.template)}</textarea>
            </div>
        `;
    }

    /**
     * Attach event listeners to card elements
     */
    attachCardEventListeners(card, prompt, index) {
        // Expand/collapse toggle - multiple elements can trigger it
        const expandElements = card.querySelectorAll('[data-action="toggle-expand"]');
        expandElements.forEach(element => {
            element.addEventListener('click', (e) => {
                // Don't expand if clicking on lock button
                if (e.target.dataset.action === 'toggle-lock') return;
                this.toggleExpand(index);
            });
        });

        // Lock/unlock toggle
        const lockButton = card.querySelector('[data-action="toggle-lock"]');
        if (lockButton) {
            lockButton.addEventListener('click', () => this.toggleLock(index));
        }

        // Copy button
        const copyButton = card.querySelector('[data-action="copy"]');
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyToClipboard(index));
        }

        // Download button
        const downloadButton = card.querySelector('[data-action="download"]');
        if (downloadButton) {
            downloadButton.addEventListener('click', () => this.downloadPrompt(index));
        }

        // Save button
        const saveButton = card.querySelector('[data-action="save"]');
        if (saveButton) {
            saveButton.addEventListener('click', () => this.saveChanges(index));
        }

        // Tab switching buttons
        const tabButtons = card.querySelectorAll('[data-action="switch-tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(index, tab);
            });
        });

        // Clear variables button
        const clearButton = card.querySelector('[data-action="clear-variables"]');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearVariables(index));
        }

        // Variable inputs - update values and preview in real-time
        const variableInputs = card.querySelectorAll('.variable-input');
        variableInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const variableName = e.target.dataset.variable;
                const variable = prompt.variables.find(v => v.name === variableName);
                if (variable) {
                    variable.value = e.target.value;
                    // Update preview tab content
                    this.updatePreview(card, prompt);
                    // Save to localStorage
                    this.saveVariableValues(prompt.id, prompt.variables);
                }
            });
        });

        // Template editor
        const templateEditor = card.querySelector('[data-action="edit-template"]');
        if (templateEditor) {
            templateEditor.addEventListener('input', (e) => {
                prompt.template = e.target.value;
                this.autoResizeTextarea(e.target);
            });

            // Initial resize
            this.autoResizeTextarea(templateEditor);
        }
    }

    /**
     * Toggle expand/collapse state of a prompt card
     */
    toggleExpand(index) {
        const prompt = this.filteredPrompts[index];
        prompt.expanded = !prompt.expanded;

        // Re-render the card
        const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
        if (card) {
            const newCard = this.createPromptCard(prompt, index);
            card.replaceWith(newCard);
        }
    }

    /**
     * Toggle lock/unlock state of a prompt card
     */
    toggleLock(index) {
        const prompt = this.filteredPrompts[index];
        prompt.locked = !prompt.locked;

        // Re-render the card
        const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
        if (card) {
            const newCard = this.createPromptCard(prompt, index);
            card.replaceWith(newCard);
        }
    }

    /**
     * Switch active tab
     */
    switchTab(index, tabName) {
        const prompt = this.filteredPrompts[index];
        prompt.activeTab = tabName;

        // Re-render the card
        const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
        if (card) {
            const newCard = this.createPromptCard(prompt, index);
            card.replaceWith(newCard);
        }
    }

    /**
     * Clear all variable values
     */
    clearVariables(index) {
        const prompt = this.filteredPrompts[index];
        if (prompt.variables) {
            prompt.variables.forEach(v => v.value = '');
            localStorage.removeItem(`prompt_vars_${prompt.id}`);
        }

        // Re-render the card
        const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
        if (card) {
            const newCard = this.createPromptCard(prompt, index);
            card.replaceWith(newCard);
        }

        this.showToast('Variables cleared');
    }

    /**
     * Update preview content when variables change
     */
    updatePreview(card, prompt) {
        const previewContent = card.querySelector('[data-tab="preview"] .preview-content');
        if (previewContent) {
            const compiledPrompt = this.compilePrompt(prompt);
            previewContent.textContent = compiledPrompt;
        }
    }

    /**
     * Save changes to template
     */
    saveChanges(index) {
        const prompt = this.filteredPrompts[index];
        prompt.locked = true;

        // Re-render the card
        const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
        if (card) {
            const newCard = this.createPromptCard(prompt, index);
            card.replaceWith(newCard);
        }

        this.showToast('Changes saved!');
    }

    /**
     * Copy compiled prompt to clipboard
     */
    async copyToClipboard(index) {
        const prompt = this.filteredPrompts[index];
        const compiledPrompt = this.compilePrompt(prompt);

        try {
            await navigator.clipboard.writeText(compiledPrompt);

            // Track usage
            prompt.lastUsed = Date.now();
            prompt.useCount = (prompt.useCount || 0) + 1;
            this.savePromptMetadata(prompt.id, {
                lastUsed: prompt.lastUsed,
                useCount: prompt.useCount,
                isFavorite: prompt.isFavorite || false
            });

            this.showToast('Copied!');
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            this.fallbackCopy(compiledPrompt);
        }
    }

    /**
     * Download compiled prompt as text file
     */
    downloadPrompt(index) {
        const prompt = this.filteredPrompts[index];
        const compiledPrompt = this.compilePrompt(prompt);

        // Create filename from prompt title (sanitize for filesystem)
        const filename = `${prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;

        // Create blob and download
        const blob = new Blob([compiledPrompt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('Downloaded!');
    }

    /**
     * Compile prompt template with variable values
     */
    compilePrompt(prompt) {
        let compiled = prompt.template;

        if (prompt.variables) {
            prompt.variables.forEach(variable => {
                const placeholder = `{{${variable.name}}}`;
                const value = variable.value || '';
                compiled = compiled.split(placeholder).join(value);
            });
        }

        return compiled;
    }

    /**
     * Fallback copy method for browsers without Clipboard API
     */
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showToast('Copied!');
        } catch (error) {
            console.error('Fallback copy failed:', error);
            this.showToast('Copy failed');
        }

        document.body.removeChild(textarea);
    }

    /**
     * Show toast notification
     */
    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 2000);
    }

    /**
     * Auto-resize textarea to fit content
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    /**
     * Save variable values to localStorage
     */
    saveVariableValues(promptId, variables) {
        const key = `prompt_vars_${promptId}`;
        const values = {};
        variables.forEach(v => {
            if (v.value) values[v.name] = v.value;
        });
        localStorage.setItem(key, JSON.stringify(values));
    }

    /**
     * Load variable values from localStorage
     */
    loadVariableValues(promptId, variables) {
        const key = `prompt_vars_${promptId}`;
        const saved = localStorage.getItem(key);
        if (!saved) return;

        try {
            const values = JSON.parse(saved);
            variables.forEach(v => {
                if (values[v.name]) v.value = values[v.name];
            });
        } catch (error) {
            console.error('Error loading variable values:', error);
        }
    }

    /**
     * Save prompt metadata to localStorage
     */
    savePromptMetadata(promptId, metadata) {
        const key = `prompt_meta_${promptId}`;
        localStorage.setItem(key, JSON.stringify(metadata));
    }

    /**
     * Load prompt metadata from localStorage
     */
    loadPromptMetadata(promptId) {
        const key = `prompt_meta_${promptId}`;
        const saved = localStorage.getItem(key);
        if (!saved) return null;

        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error('Error loading prompt metadata:', error);
            return null;
        }
    }

    /**
     * Show keyboard shortcuts modal
     */
    showShortcutsModal() {
        // Check if modal already exists
        let modal = document.getElementById('shortcutsModal');

        if (!modal) {
            // Detect platform for key display
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? '⌘' : 'Ctrl';

            // Create modal
            modal = document.createElement('div');
            modal.id = 'shortcutsModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-overlay" data-action="close-modal"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Keyboard Shortcuts</h2>
                        <button class="modal-close" data-action="close-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <span class="shortcut-keys"><kbd>Esc</kbd></span>
                                <span class="shortcut-description">Collapse expanded card</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>K</kbd></span>
                                <span class="shortcut-description">Focus search</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>/</kbd></span>
                                <span class="shortcut-description">Show this help</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add event listeners for closing
            modal.querySelectorAll('[data-action="close-modal"]').forEach(element => {
                element.addEventListener('click', () => this.hideShortcutsModal());
            });

            // Close on Escape key
            const closeOnEscape = (e) => {
                if (e.key === 'Escape') {
                    this.hideShortcutsModal();
                    document.removeEventListener('keydown', closeOnEscape);
                }
            };
            document.addEventListener('keydown', closeOnEscape);
        }

        // Show modal
        modal.classList.add('show');
    }

    /**
     * Hide keyboard shortcuts modal
     */
    hideShortcutsModal() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Highlight text matching search term
     */
    highlightText(text, searchTerm) {
        if (!searchTerm) return this.escapeHTML(text);

        const escapedText = this.escapeHTML(text);
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return escapedText.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PromptLibrary();
});
