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
            const matchesSearch = !this.searchTerm ||
                prompt.title.toLowerCase().includes(this.searchTerm) ||
                prompt.description.toLowerCase().includes(this.searchTerm) ||
                prompt.category.toLowerCase().includes(this.searchTerm);

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

        return `
            <div class="card-header">
                <div class="card-title-wrapper">
                    <h3 class="card-title">${this.escapeHTML(prompt.title)}</h3>
                    <span class="card-category">${this.escapeHTML(prompt.category)}</span>
                </div>
                <button class="lock-button" data-action="toggle-lock">
                    ${isLocked ? '🔒' : '🔓'}
                </button>
            </div>
            <p class="card-description">${this.escapeHTML(prompt.description)}</p>

            ${isLocked ? this.getLockedViewHTML(prompt, index) : this.getEditorHTML(prompt)}

            <div class="card-actions">
                ${isLocked ?
                    `<button class="btn btn-primary" data-action="copy">Copy to Clipboard</button>` :
                    `<button class="btn btn-secondary" data-action="save">Save Changes</button>`
                }
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
                            class="variable-input"
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
        // Lock/unlock toggle
        const lockButton = card.querySelector('[data-action="toggle-lock"]');
        lockButton.addEventListener('click', () => this.toggleLock(index));

        // Copy button
        const copyButton = card.querySelector('[data-action="copy"]');
        if (copyButton) {
            copyButton.addEventListener('click', () => this.copyToClipboard(index));
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
            this.showToast('Copied!');
        } catch (error) {
            console.error('Failed to copy:', error);
            // Fallback for older browsers
            this.fallbackCopy(compiledPrompt);
        }
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
