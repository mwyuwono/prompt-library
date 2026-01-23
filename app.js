/**
 * PromptLibrary - A vanilla JavaScript application for managing AI prompt templates
 */

class PromptLibrary {
    constructor() {
        this.prompts = [];
        this.filteredPrompts = [];
        this.searchTerm = '';
        this.selectedCategory = 'Creativity'; // Default to Creativity
        this.showDetails = true; // Default to visible on desktop
        this.currentView = 'grid'; // Default to grid view

        // DOM elements
        this.promptGrid = document.getElementById('promptGrid');
        this.promptList = document.getElementById('promptList');
        this.promptArea = document.querySelector('.prompt-area');
        this.searchInput = document.getElementById('searchInput');
        this.categoryChips = document.getElementById('categoryChips');
        this.emptyState = document.getElementById('emptyState');
        this.toast = document.getElementById('toast');
        this.showDetailsToggle = document.getElementById('showDetailsToggle');
        this.viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
        this.promptModal = null;
        this.promptModalBody = null;
        this.promptModalTitle = null;
        this.promptModalCategory = null;
        this.promptModalLockButton = null;
        this.activePromptIndex = null;
        this.activePromptId = null;
        this.modalBodyAnimationCleanup = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.loadPrompts();
        this.createPromptModal();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.populateCategoryFilter();
        this.filterPrompts();
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
                // Process prompt-level variables
                if (prompt.variables) {
                    this.applyVariableDisplayHints(prompt);
                    this.loadVariableValues(prompt.id, prompt.variables);
                }

                // Process variation-level variables
                if (prompt.variations) {
                    prompt.variations.forEach(variation => {
                        if (variation.variables) {
                            this.applyVariableDisplayHintsToArray(variation.variables);
                            this.loadVariableValues(prompt.id, variation.variables);
                        }
                    });
                }
                // Load metadata (usage count, last used)
                const metadata = this.loadPromptMetadata(prompt.id);
                if (metadata) {
                    Object.assign(prompt, metadata);
                }
                // Initialize active variation ID (defaults to first variation)
                if (prompt.variations && prompt.variations.length > 0) {
                    prompt.activeVariationId = prompt.variations[0].id;
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

        // Show details toggle
        if (this.showDetailsToggle) {
            this.showDetailsToggle.addEventListener('change', (e) => {
                this.showDetails = e.target.checked;
                this.updateCardDetailsVisibility();
            });
        }

        // View toggle buttons
        this.viewToggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });

        // Mobile filters toggle
        const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener('click', () => {
                this.toggleMobileFilters();
            });
        }

        // Category chip selection (wy-filter-chip Web Components)
        this.categoryChips.addEventListener('chip-select', (e) => {
            this.selectedCategory = e.detail.value;
            this.updateActiveChip(e.target);
            this.filterPrompts();
        });
    }

    /**
     * Switch between list and grid views
     */
    switchView(view) {
        this.currentView = view;

        // Update button states
        this.viewToggleBtns.forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update prompt area class
        this.promptArea.classList.remove('view-list', 'view-grid');
        this.promptArea.classList.add(`view-${view}`);

        // Re-render with current view
        this.renderPrompts();
    }

    /**
     * Toggle mobile filters visibility
     */
    toggleMobileFilters() {
        const controlsBar = document.querySelector('.controls-bar');
        if (controlsBar) {
            controlsBar.classList.toggle('show');
        }
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
            // Escape while search is focused clears query
            if (e.key === 'Escape' && document.activeElement === this.searchInput) {
                if (this.searchTerm) {
                    this.searchTerm = '';
                    this.searchInput.value = '';
                    this.filterPrompts();
                }
                this.searchInput.blur();
                return;
            }

            // Escape - Close prompt modal or shortcuts modal
            if (e.key === 'Escape') {
                if (this.promptModal && this.promptModal.classList.contains('show')) {
                    this.closePromptModal();
                    return;
                }
                this.hideShortcutsModal();
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
     * Populate category filter chips (using wy-filter-chip Web Components)
     */
    populateCategoryFilter() {
        const categories = [...new Set(this.prompts.map(p => p.category))].sort();

        // Clear existing chips
        this.categoryChips.innerHTML = '';

        // Add "All" chip
        const allChip = this.createCategoryChip('', 'All', this.selectedCategory === '');
        this.categoryChips.appendChild(allChip);

        // Add category chips
        categories.forEach(category => {
            const chip = this.createCategoryChip(category, category, category === this.selectedCategory);
            this.categoryChips.appendChild(chip);
        });
    }

    /**
     * Create a category filter chip (wy-filter-chip Web Component)
     */
    createCategoryChip(value, label, isActive) {
        const chip = document.createElement('wy-filter-chip');
        chip.setAttribute('label', label);
        chip.setAttribute('value', value);
        if (isActive) {
            chip.setAttribute('active', '');
        }
        return chip;
    }

    /**
     * Update active chip styling
     */
    updateActiveChip(activeChip) {
        // Remove active attribute from all chips
        this.categoryChips.querySelectorAll('wy-filter-chip').forEach(chip => {
            chip.removeAttribute('active');
        });

        // Add active attribute to clicked chip
        activeChip.setAttribute('active', '');
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

            let matchesCategory = true;
            if (this.selectedCategory) {
                matchesCategory = prompt.category === this.selectedCategory;
            }

            return matchesSearch && matchesCategory;
        });

        this.renderPrompts();
    }

    /**
     * Update card details visibility based on toggle state
     */
    updateCardDetailsVisibility() {
        const descriptions = document.querySelectorAll('.card-description, .prompt-list-item-description');
        const variableCounts = document.querySelectorAll('.variable-count-badge');

        descriptions.forEach(desc => {
            this.animateDetailVisibility(desc, this.showDetails);
        });

        variableCounts.forEach(badge => {
            if (this.showDetails) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        });
    }

    /**
     * Smoothly animate show/hide for collapsible descriptions
     */
    animateDetailVisibility(element, shouldShow) {
        if (!element) {
            return;
        }

        const prefersReducedMotion = typeof window !== 'undefined' &&
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (element.__detailToggleHandler) {
            element.removeEventListener('transitionend', element.__detailToggleHandler);
            element.__detailToggleHandler = null;
        }

        if (prefersReducedMotion) {
            if (shouldShow) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
            element.style.height = '';
            element.style.opacity = '';
            return;
        }

        if (shouldShow) {
            if (!element.classList.contains('hidden')) {
                element.style.height = '';
                element.style.opacity = '';
                return;
            }

            element.classList.remove('hidden');
            element.style.transition = 'none';
            const targetHeight = element.scrollHeight;
            element.style.height = '0px';
            element.style.opacity = '0';
            element.offsetHeight; // force reflow at height 0
            element.style.transition = '';

            requestAnimationFrame(() => {
                element.style.height = `${targetHeight}px`;
                element.style.opacity = '1';
            });

            const onEnd = (event) => {
                if (event.propertyName !== 'height') {
                    return;
                }
                element.style.height = '';
                element.style.opacity = '';
                element.__detailToggleHandler = null;
                element.removeEventListener('transitionend', onEnd);
            };

            element.__detailToggleHandler = onEnd;
            element.addEventListener('transitionend', onEnd);
        } else {
            if (element.classList.contains('hidden')) {
                element.style.height = '';
                element.style.opacity = '';
                return;
            }

            const startHeight = element.scrollHeight;
            element.style.height = `${startHeight}px`;
            element.style.opacity = '1';
            element.offsetHeight; // force reflow with current height

            requestAnimationFrame(() => {
                element.style.height = '0px';
                element.style.opacity = '0';
            });

            const onEnd = (event) => {
                if (event.propertyName !== 'height') {
                    return;
                }
                element.classList.add('hidden');
                element.style.height = '';
                element.style.opacity = '';
                element.__detailToggleHandler = null;
                element.removeEventListener('transitionend', onEnd);
            };

            element.__detailToggleHandler = onEnd;
            element.addEventListener('transitionend', onEnd);
        }
    }

    /**
     * Render all prompts (list or grid view)
     */
    renderPrompts() {
        if (this.currentView === 'list') {
            this.renderListView();
        } else {
            this.renderGridView();
        }
    }

    /**
     * Render prompts in grid view
     */
    renderGridView() {
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
     * Render prompts in list view organized by category
     */
    renderListView() {
        // Clear list
        this.promptList.innerHTML = '';

        // Show/hide empty state
        if (this.filteredPrompts.length === 0) {
            this.emptyState.style.display = 'block';
            return;
        } else {
            this.emptyState.style.display = 'none';
        }

        // Group prompts by category
        const promptsByCategory = this.filteredPrompts.reduce((acc, prompt, index) => {
            const category = prompt.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({ prompt, index });
            return acc;
        }, {});

        // Render each category section
        Object.keys(promptsByCategory).sort().forEach(category => {
            const section = document.createElement('div');
            section.className = 'category-section';

            const header = document.createElement('h2');
            header.className = 'category-section-header';
            header.textContent = category;
            section.appendChild(header);

            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'category-items';

            promptsByCategory[category].forEach(({ prompt, index }) => {
                const item = this.createListItem(prompt, index);
                itemsContainer.appendChild(item);
            });

            section.appendChild(itemsContainer);
            this.promptList.appendChild(section);
        });
    }

    /**
     * Create a list item for list view
     */
    createListItem(prompt, index) {
        const item = document.createElement('div');
        item.className = 'prompt-list-item';
        item.dataset.index = index;
        // Add data-has-image for font switching
        if (prompt.image) {
            item.dataset.hasImage = 'true';
            item.classList.add('has-image');
        }
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `Open prompt ${prompt.title}`);
        item.tabIndex = 0;

        const variableCount = prompt.variables?.length || 0;
        const hiddenClass = this.showDetails ? '' : 'hidden';

        item.innerHTML = `
            <div class="prompt-list-item-content">
                <div class="prompt-list-item-header">
                    <h3 class="prompt-list-item-title">${this.highlightText(prompt.title, this.searchTerm)}</h3>
                </div>
                <p class="prompt-list-item-description ${hiddenClass}">${this.highlightText(prompt.description, this.searchTerm)}</p>
            </div>
            <div class="prompt-list-item-meta">
                <span class="variable-count-badge ${hiddenClass}">${variableCount > 0 ? `${variableCount} variable${variableCount > 1 ? 's' : ''}` : 'No variables'}</span>
            </div>
        `;

        // Attach event listeners
        this.attachListItemEventListeners(item, index);

        return item;
    }

    /**
     * Attach event listeners to a list item
     */
    attachListItemEventListeners(item, index) {
        const openModal = () => {
            this.openPromptModal(index);
        };

        item.addEventListener('click', openModal);

        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal();
            }
        });
    }

    /**
     * Create a prompt card element
     */
    createPromptCard(prompt, index) {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.dataset.index = index;
        card.dataset.category = prompt.category; // Add category for color coding
        card.dataset.locked = prompt.locked !== false;

        // Handle variants based on prompt data
        if (prompt.image) {
            card.dataset.hasImage = 'true';
            card.classList.add('has-image');
        } else if (prompt.featured) {
            card.classList.add('featured-olive');
        } else if (prompt.icon) {
            card.classList.add('neutral-icon');
        }

        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Open prompt ${prompt.title}`);
        card.tabIndex = 0;

        card.innerHTML = this.getCardSummaryHTML(prompt);

        // Attach event listeners
        this.attachCardEventListeners(card, index);

        return card;
    }

    /**
     * Get HTML for a prompt summary card
     */
    getCardSummaryHTML(prompt) {
        const hiddenClass = this.showDetails ? '' : 'hidden';

        // Image Thumbnail
        const imageHTML = prompt.image ? `<div class="card-thumbnail"><img src="${prompt.image}" alt="${prompt.title}"></div>` : '';

        // Icon section for non-image cards
        let iconHTML = '';
        if (!prompt.image && (prompt.icon || prompt.featured)) {
            const variantClass = prompt.featured ? 'icon-featured' : 'icon-neutral';
            const iconName = prompt.featured ? 'auto_fix_high' : (prompt.icon || 'star');
            iconHTML = `
                <div class="card-icon-container ${variantClass}">
                    <span class="material-symbols-outlined">${iconName}</span>
                </div>
            `;
        }

        // Tag/Badge section (Category badge for non-image cards only)
        const badgeHTML = !prompt.image && prompt.category ? `
            <div class="card-badge">${this.escapeHTML(prompt.category).toUpperCase()}</div>
        ` : '';

        // Header row for non-image cards (contains icon and badge)
        const headerRowHTML = !prompt.image ? `
            <div class="card-header-row">
                ${iconHTML}
                ${badgeHTML}
            </div>
        ` : '';

        return `
            ${imageHTML}
            <div class="card-content">
                <div>
                    ${headerRowHTML}
                    <h3 class="card-title">${this.highlightText(prompt.title, this.searchTerm)}</h3>
                    <p class="card-description ${hiddenClass}">${this.highlightText(prompt.description, this.searchTerm)}</p>
                </div>
                <div class="card-footer">
                    <div class="card-arrow-button">
                        <span class="material-symbols-outlined">arrow_forward</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get HTML for modal prompt content
     */
    getPromptDetailHTML(prompt, index) {
        const isLocked = prompt.locked !== false;
        const activeVariables = this.getActiveVariables(prompt);
        const hasVariables = activeVariables && activeVariables.length > 0;
        const activeTab = prompt.activeTab || 'variables';

        return `
            <p class="prompt-modal-description">${this.escapeHTML(prompt.description)}</p>
            ${this.getVariationSelectorHTML(prompt)}
            ${isLocked && hasVariables ? `
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
            ` : ''}
            <div class="modal-body-content">
                <div class="modal-scroll-area">
                    ${isLocked ? this.getLockedViewContent(prompt, index) : this.getEditorHTML(prompt)}
                </div>
                <div class="modal-actions card-actions">
                    ${isLocked ? `
                        <button class="btn btn-primary" data-action="copy">Copy to Clipboard</button>
                        <button class="btn btn-outlined" data-action="download" aria-label="Download as text file">
                            <span class="material-symbols-outlined" aria-hidden="true">download</span>
                            Download .txt
                        </button>
                    ` : `
                        <button class="btn btn-secondary" data-action="cancel-edit">Cancel</button>
                        <button class="btn btn-primary" data-action="save-template">Save Changes</button>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * Get HTML for locked view content (tab content only, tabs-header is outside scroll area)
     */
    /**
     * Get variables for the currently active variation
     * Returns variation-specific variables if they exist, otherwise prompt-level variables
     */
    getActiveVariables(prompt) {
        // If prompt has variations, check if active variation has its own variables
        if (prompt.variations && prompt.variations.length > 0) {
            const activeId = prompt.activeVariationId || prompt.variations[0].id;
            const variation = prompt.variations.find(v => v.id === activeId);

            // If variation has its own variables array, use that
            if (variation && variation.variables) {
                return variation.variables;
            }
        }

        // Otherwise return prompt-level variables
        return prompt.variables || [];
    }

    /**
     * Get the active variation object
     */
    getActiveVariation(prompt) {
        if (!prompt.variations || prompt.variations.length === 0) {
            return null;
        }

        const activeId = prompt.activeVariationId || prompt.variations[0].id;
        return prompt.variations.find(v => v.id === activeId);
    }

    getLockedViewContent(prompt, index) {
        const compiledPrompt = this.compilePrompt(prompt);
        const activeVariables = this.getActiveVariables(prompt);
        const hasVariables = activeVariables && activeVariables.length > 0;
        const activeTab = prompt.activeTab || 'variables';

        if (!hasVariables) {
            return this.getPreviewHTML(compiledPrompt);
        }

        return `
            <div class="tabs-content">
                <div class="tab-pane ${activeTab === 'variables' ? 'active' : ''}" data-tab="variables">
                    ${this.getVariablesHTML(activeVariables)}
                </div>
                <div class="tab-pane ${activeTab === 'preview' ? 'active' : ''}" data-tab="preview">
                    ${this.getPreviewContentHTML(compiledPrompt)}
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
     * Get HTML for variation selector dropdown (if prompt has multiple variations)
     */
    getVariationSelectorHTML(prompt) {
        if (!prompt.variations || prompt.variations.length <= 1) return '';

        const activeId = prompt.activeVariationId || prompt.variations[0].id;
        const activeVariation = prompt.variations.find(v => v.id === activeId);

        return `
            <div class="variation-selector-wrapper">
                <label class="variation-selector-label">Style</label>
                <select class="variation-selector" data-action="switch-variation">
                    ${prompt.variations.map(v => `
                        <option value="${v.id}" ${v.id === activeId ? 'selected' : ''}>
                            ${this.escapeHTML(v.name)}
                        </option>
                    `).join('')}
                </select>
                ${activeVariation && activeVariation.description ? `
                    <div class="variation-description visible" data-variation-description>
                        ${this.escapeHTML(activeVariation.description)}
                    </div>
                ` : '<div class="variation-description" data-variation-description></div>'}
            </div>
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
    getVariablesHTML(variables) {
        if (!variables || variables.length === 0) {
            return '';
        }

        return `
            <div class="variables-section">
                ${variables.map(variable => `
                    <div class="variable-group">
                        <label class="variable-label">${this.escapeHTML(variable.label)}</label>
                        ${this.getVariableInputHTML(variable)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render variable input element based on configuration
     */
    getVariableInputHTML(variable) {
        const inputType = variable.inputType || 'text';
        const baseClasses = ['variable-input'];
        if (inputType === 'textarea') {
            baseClasses.push('variable-textarea');
        }
        if (variable.value) {
            baseClasses.push('has-value');
        }

        const className = baseClasses.join(' ');
        const dataAttr = `data-variable="${this.escapeHTML(variable.name)}"`;
        const placeholder = this.escapeHTML(variable.placeholder || '');

        if (inputType === 'toggle') {
            const isChecked = (variable.options && variable.value === variable.options[1]) || variable.value === 'true' || variable.value === true;
            const usesDefaultToggleLabels = !variable.options || variable.options.length < 2;
            const option1 = this.escapeHTML(variable.options?.[0] || 'Disabled');
            const option2 = this.escapeHTML(variable.options?.[1] || 'Enabled');
            const offLabel = usesDefaultToggleLabels && isChecked ? option2 : option1;
            const onLabel = usesDefaultToggleLabels ? option2 : option2;
            return `
                <div class="variable-toggle-wrapper">
                    <label class="variable-toggle-label">
                        <div class="variable-toggle-labels">
                            <span class="variable-toggle-option ${!isChecked ? 'active' : ''}">${offLabel}</span>
                            <span class="variable-toggle-option ${isChecked ? 'active' : ''}">${onLabel}</span>
                        </div>
                        <input
                            type="checkbox"
                            class="variable-toggle-input"
                            ${dataAttr}
                            data-default-toggle="${usesDefaultToggleLabels ? 'true' : 'false'}"
                            ${isChecked ? 'checked' : ''}
                        >
                        <span class="variable-toggle-slider"></span>
                    </label>
                </div>
            `;
        }

        if (inputType === 'textarea') {
            const value = this.escapeHTML(variable.value || '');
            return `<textarea class="${className}" ${dataAttr} placeholder="${placeholder}" rows="${variable.rows || 6}">${value}</textarea>`;
        }

        return `<input type="text" class="${className}" ${dataAttr} placeholder="${placeholder}" value="${this.escapeHTML(variable.value || '')}">`;
    }

    /**
     * Get HTML for template editor (unlocked state)
     */
    getEditorHTML(prompt) {
        // Get the active template (handles both single template and variations)
        const currentTemplate = this.getActiveTemplate(prompt);

        // Store original template for cancel functionality
        if (!prompt._originalTemplate) {
            prompt._originalTemplate = currentTemplate;
        }

        return `
            <div class="template-editor">
                <textarea
                    class="template-textarea"
                    data-action="edit-template"
                >${this.escapeHTML(currentTemplate)}</textarea>
            </div>
        `;
    }

    /**
     * Attach event listeners to card elements
     */
    attachCardEventListeners(card, index) {
        const openPrompt = () => this.openPromptModal(index);

        card.addEventListener('click', (event) => {
            event.preventDefault();
            openPrompt();
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openPrompt();
            }
        });
    }

    /**
     * Create modal container for prompt details
     */
    createPromptModal() {
        if (this.promptModal) return;

        this.promptModal = document.createElement('div');
        this.promptModal.id = 'promptModal';
        this.promptModal.className = 'modal prompt-modal';
        this.promptModal.innerHTML = `
            <div class="modal-overlay" data-action="close-prompt"></div>
            <div class="modal-content prompt-modal-content">
                <div class="modal-header">
                    <div class="modal-header-text">
                        <h2 id="promptModalTitle"></h2>
                        <div class="modal-subtitle">
                            <span class="card-category" id="promptModalCategory"></span>
                        </div>
                    </div>
                    <div class="modal-header-actions">
                        <button class="btn btn-outlined btn-sm lock-button" id="promptModalLockButton" data-action="toggle-lock">
                            <span class="material-symbols-outlined">mode_edit</span>
                            Edit Prompt
                        </button>
                        <button class="modal-close" data-action="close-prompt" aria-label="Close prompt dialog">&times;</button>
                    </div>
                </div>
                <div class="modal-body"></div>
            </div>
        `;

        document.body.appendChild(this.promptModal);
        this.promptModalBody = this.promptModal.querySelector('.modal-body');
        this.promptModalTitle = this.promptModal.querySelector('#promptModalTitle');
        this.promptModalCategory = this.promptModal.querySelector('#promptModalCategory');
        this.promptModalLockButton = this.promptModal.querySelector('#promptModalLockButton');

        this.promptModal.querySelectorAll('[data-action="close-prompt"]').forEach(element => {
            element.addEventListener('click', () => this.closePromptModal());
        });

        if (this.promptModalLockButton) {
            this.promptModalLockButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.handleLockButtonClick();
            });
        }
    }

    /**
     * Open prompt modal with selected prompt details
     */
    openPromptModal(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        if (!this.promptModal) {
            this.createPromptModal();
        }

        this.activePromptIndex = index;
        this.activePromptId = prompt.id;

        if (this.promptModalTitle) {
            this.promptModalTitle.textContent = prompt.title;
        }
        if (this.promptModalCategory) {
            this.promptModalCategory.textContent = prompt.category;
        }

        this.updateLockButton(prompt);

        this.renderPromptModalContent(prompt, index);

        // Store current scroll position before locking body
        const scrollY = window.scrollY;
        this.bodyScrollPosition = scrollY;

        this.promptModal.classList.add('show');
        document.body.classList.add('modal-open');

        // Set body top position to preserve scroll appearance
        document.body.style.top = `-${scrollY}px`;

        // Handle keyboard visibility on mobile
        this.setupKeyboardHandling();
    }

    /**
     * Close prompt modal and reset active prompt
     */
    closePromptModal() {
        if (!this.promptModal) return;

        // Check for unsaved changes
        if (this.hasUnsavedChanges()) {
            if (!confirm('You have unsaved changes. Discard them?')) {
                return; // Don't close if user cancels
            }
            // Restore original template if discarding changes
            const prompt = this.filteredPrompts[this.activePromptIndex];
            if (prompt && prompt._originalTemplate) {
                // Restore to the right location
                if (prompt.variations && prompt.variations.length > 0) {
                    const activeId = prompt.activeVariationId || prompt.variations[0].id;
                    const variation = prompt.variations.find(v => v.id === activeId);
                    if (variation) {
                        variation.template = prompt._originalTemplate;
                    }
                } else {
                    prompt.template = prompt._originalTemplate;
                }
                delete prompt._originalTemplate;
            }
        }

        this.promptModal.classList.remove('show');
        document.body.classList.remove('modal-open');

        // Restore scroll position
        const scrollY = this.bodyScrollPosition || 0;
        document.body.style.top = '';
        window.scrollTo(0, scrollY);

        this.activePromptIndex = null;
        this.activePromptId = null;
        this.cancelModalBodyAnimation();
        this.resetModalBodyAnimation(this.promptModalBody);

        // Cleanup keyboard handling
        this.cleanupKeyboardHandling();
    }

    /**
     * Render modal body content for selected prompt
     */
    renderPromptModalContent(prompt, index) {
        if (!this.promptModalBody) return;

        this.updateLockButton(prompt);

        const modalBody = this.promptModalBody;
        const isModalVisible = this.promptModal?.classList.contains('show');
        const shouldAnimate = isModalVisible && modalBody.childElementCount > 0;
        const previousHeight = modalBody.offsetHeight;

        if (shouldAnimate) {
            this.prepareModalBodyForAnimation(modalBody, previousHeight);
        } else {
            this.cancelModalBodyAnimation();
            this.resetModalBodyAnimation(modalBody);
        }

        modalBody.innerHTML = this.getPromptDetailHTML(prompt, index);
        this.bindPromptInteractions(modalBody, prompt, index);
        this.initializeVariableTextareas(modalBody);
        this.updateDependentVariables(modalBody, prompt, this.getActiveVariables(prompt));

        if (prompt.locked !== false) {
            const firstInput = modalBody.querySelector('.variable-input');
            if (firstInput) {
                firstInput.focus({ preventScroll: false });
            }
        } else {
            const textarea = modalBody.querySelector('[data-action="edit-template"]');
            if (textarea) {
                this.autoResizeTextarea(textarea);
                textarea.focus({ preventScroll: false });
            }
        }

        if (shouldAnimate) {
            this.animateModalBodyHeight(modalBody);
        }
    }

    handleLockButtonClick() {
        if (this.activePromptIndex === null || this.activePromptIndex === undefined) return;
        const prompt = this.filteredPrompts[this.activePromptIndex];
        if (!prompt) return;

        if (prompt.locked !== false) {
            this.toggleLock(this.activePromptIndex);
        } else {
            this.saveChanges(this.activePromptIndex);
        }
    }

    updateLockButton(prompt) {
        if (!this.promptModalLockButton || !prompt) return;

        const isLocked = prompt.locked !== false;

        // Hide button entirely when in edit mode
        if (!isLocked) {
            this.promptModalLockButton.style.display = 'none';
            return;
        }

        // Show and update for locked state
        this.promptModalLockButton.style.display = '';
        const icon = 'mode_edit';
        const label = 'Edit Prompt';
        const ariaLabel = 'Enable editing for this prompt';

        this.promptModalLockButton.innerHTML = `
            <span class="material-symbols-outlined">${icon}</span>
            ${label}
        `;

        this.promptModalLockButton.classList.remove('btn-primary', 'btn-secondary', 'btn-sm');
        this.promptModalLockButton.classList.add('btn-sm', 'btn-primary');
        this.promptModalLockButton.setAttribute('aria-label', ariaLabel);
    }

    /**
     * Bind prompt interaction handlers within a container (card or modal)
     */
    bindPromptInteractions(container, prompt, index) {
        if (!container || !prompt) return;

        const copyButton = container.querySelector('[data-action="copy"]');
        if (copyButton) {
            copyButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.copyToClipboard(index);
            });
        }

        const downloadButton = container.querySelector('[data-action="download"]');
        if (downloadButton) {
            downloadButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.downloadPrompt(index);
            });
        }

        const saveButton = container.querySelector('[data-action="save"]');
        if (saveButton) {
            saveButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.saveChanges(index);
            });
        }

        const saveTemplateButton = container.querySelector('[data-action="save-template"]');
        if (saveTemplateButton) {
            saveTemplateButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.saveTemplateChanges(index);
            });
        }

        const cancelEditButton = container.querySelector('[data-action="cancel-edit"]');
        if (cancelEditButton) {
            cancelEditButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.cancelEdit(index);
            });
        }

        const tabButtons = container.querySelectorAll('[data-action="switch-tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const tab = event.currentTarget.dataset.tab;
                this.switchTab(index, tab);
            });
        });

        const clearButton = container.querySelector('[data-action="clear-variables"]');
        if (clearButton) {
            clearButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.clearVariables(index);
            });
        }

        const variationSelector = container.querySelector('[data-action="switch-variation"]');
        if (variationSelector) {
            variationSelector.addEventListener('change', (event) => {
                this.switchVariation(index, event.target.value);
            });
        }

        const variableInputs = container.querySelectorAll('.variable-input');
        variableInputs.forEach(input => {
            if (input.tagName === 'TEXTAREA') {
                this.autoResizeTextarea(input);
            }

            input.addEventListener('input', (event) => {
                const variableName = event.target.dataset.variable;
                const variables = this.getActiveVariables(prompt);
                const variable = variables.find(v => v.name === variableName);
                if (variable) {
                    variable.value = event.target.value;
                    this.updatePreview(container, prompt);
                    this.saveVariableValues(prompt.id, variables);
                }

                if (event.target.tagName === 'TEXTAREA') {
                    this.autoResizeTextarea(event.target);
                }
            });
        });

        // Handle toggle inputs
        const toggleInputs = container.querySelectorAll('.variable-toggle-input');
        toggleInputs.forEach(input => {
            input.addEventListener('change', (event) => {
                const variableName = event.target.dataset.variable;
                const variables = this.getActiveVariables(prompt);
                const variable = variables.find(v => v.name === variableName);
                if (variable) {
                    variable.value = event.target.checked ? (variable.options?.[1] || 'true') : (variable.options?.[0] || '');

                    // Update toggle label highlighting
                    const wrapper = event.target.closest('.variable-toggle-wrapper');
                    if (wrapper) {
                        const options = wrapper.querySelectorAll('.variable-toggle-option');
                        const isDefaultToggle = event.target.dataset.defaultToggle === 'true';
                        options.forEach((option, i) => {
                            if (i === 0) {
                                option.classList.toggle('active', !event.target.checked);
                                if (isDefaultToggle) {
                                    option.textContent = event.target.checked ? 'Enabled' : 'Disabled';
                                }
                            } else {
                                option.classList.toggle('active', event.target.checked);
                                if (isDefaultToggle) {
                                    option.textContent = 'Enabled';
                                }
                            }
                        });
                    }

                    // Handle conditional visibility for dependent variables
                    this.updateDependentVariables(container, prompt, variables);

                    this.updatePreview(container, prompt);
                    this.saveVariableValues(prompt.id, variables);
                }
            });
        });

        const templateEditor = container.querySelector('[data-action="edit-template"]');
        if (templateEditor) {
            templateEditor.addEventListener('input', (event) => {
                // Update the active template (either prompt.template or active variation)
                if (prompt.variations && prompt.variations.length > 0) {
                    const activeId = prompt.activeVariationId || prompt.variations[0].id;
                    const variation = prompt.variations.find(v => v.id === activeId);
                    if (variation) {
                        variation.template = event.target.value;
                    }
                } else {
                    prompt.template = event.target.value;
                }
                this.autoResizeTextarea(event.target);
            });

            this.autoResizeTextarea(templateEditor);
        }
    }

    /**
     * Apply display hints to an array of variables
     */
    applyVariableDisplayHintsToArray(variables) {
        if (!variables) return;

        const longTextPattern = /(paste|text|notes|email|message|context|description|details|outline|summary|topic|prompt|instructions|content)/i;

        variables.forEach(variable => {
            if (variable.inputType) return;
            const label = variable.label || '';
            const placeholder = variable.placeholder || '';
            if (longTextPattern.test(label) || longTextPattern.test(placeholder)) {
                variable.inputType = 'textarea';
                if (!variable.rows) {
                    variable.rows = 2; // Start small and expand
                }
            }
        });
    }

    /**
     * Apply display hints for variables that expect long-form text
     */
    applyVariableDisplayHints(prompt) {
        if (!prompt.variables) return;
        this.applyVariableDisplayHintsToArray(prompt.variables);
    }

    /**
     * Ensure variable textareas size to content on initial render
     */
    initializeVariableTextareas(container) {
        container.querySelectorAll('.variable-textarea').forEach(textarea => {
            this.autoResizeTextarea(textarea);
        });
    }

    /**
     * Update visibility of dependent variables based on toggle state
     */
    updateDependentVariables(container, prompt, variables) {
        if (!variables || variables.length === 0) return;

        // Find all variable groups in the container
        const variableGroups = container.querySelectorAll('.variable-group');

        variables.forEach((variable, index) => {
            if (variable.dependsOn) {
                const dependency = variables.find(v => v.name === variable.dependsOn);
                if (dependency && dependency.inputType === 'toggle') {
                    const shouldHide = dependency.value === variable.hideWhen ||
                        (!dependency.value && variable.hideWhen === '');

                    // Find the corresponding variable group element
                    const variableGroup = variableGroups[index];
                    if (variableGroup) {
                        if (shouldHide) {
                            variableGroup.style.display = 'none';
                        } else {
                            variableGroup.style.display = '';
                        }
                    }
                }
            }
        });
    }

    /**
     * Prepare modal body for height animation
     */
    prepareModalBodyForAnimation(modalBody, previousHeight) {
        this.cancelModalBodyAnimation();
        modalBody.style.height = `${previousHeight}px`;
        modalBody.style.overflow = 'hidden';
        modalBody.style.transition = '';
    }

    /**
     * Animate modal body height to fit new content
     */
    animateModalBodyHeight(modalBody) {
        const targetHeight = modalBody.scrollHeight;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            this.resetModalBodyAnimation(modalBody);
            this.modalBodyAnimationCleanup = null;
            return;
        }

        requestAnimationFrame(() => {
            modalBody.style.transition = 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
            const currentHeight = parseFloat(modalBody.style.height) || modalBody.offsetHeight;

            if (Math.abs(targetHeight - currentHeight) < 1) {
                this.resetModalBodyAnimation(modalBody);
                this.modalBodyAnimationCleanup = null;
                return;
            }

            modalBody.style.height = `${targetHeight}px`;

            const cleanup = (event) => {
                if (event.target !== modalBody) return;
                this.resetModalBodyAnimation(modalBody);
                modalBody.removeEventListener('transitionend', cleanup);
                this.modalBodyAnimationCleanup = null;
            };

            modalBody.addEventListener('transitionend', cleanup, { once: true });
            this.modalBodyAnimationCleanup = () => {
                modalBody.removeEventListener('transitionend', cleanup);
                this.resetModalBodyAnimation(modalBody);
                this.modalBodyAnimationCleanup = null;
            };
        });
    }

    /**
     * Cancel in-flight modal body animation
     */
    cancelModalBodyAnimation() {
        if (typeof this.modalBodyAnimationCleanup === 'function') {
            this.modalBodyAnimationCleanup();
        }
        this.modalBodyAnimationCleanup = null;
    }

    /**
     * Clear inline animation styles from modal body
     */
    resetModalBodyAnimation(modalBody) {
        if (!modalBody) return;
        modalBody.style.height = '';
        modalBody.style.overflow = '';
        modalBody.style.transition = '';
    }

    /**
     * Replace a prompt card in the grid
     */
    updatePromptCard(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        const card = this.promptGrid.querySelector(`[data-index="${index}"]`);
        if (!card) return;

        const newCard = this.createPromptCard(prompt, index);
        card.replaceWith(newCard);
    }

    /**
     * Refresh card and modal views when prompt state updates
     */
    refreshPromptViews(index) {
        if (index !== null && index !== undefined) {
            this.updatePromptCard(index);
        }

        if (this.activePromptId && this.promptModal && this.promptModal.classList.contains('show')) {
            const modalIndex = this.filteredPrompts.findIndex(p => p.id === this.activePromptId);
            if (modalIndex === -1) {
                this.closePromptModal();
                return;
            }

            this.activePromptIndex = modalIndex;
            this.renderPromptModalContent(this.filteredPrompts[modalIndex], modalIndex);
        }
    }
    /**
     * Toggle lock/unlock state of a prompt card
     */
    toggleLock(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        prompt.locked = !prompt.locked;
        if (prompt.locked && !prompt.activeTab) {
            prompt.activeTab = 'variables';
        }

        this.refreshPromptViews(index);
    }

    /**
     * Switch active tab
     */
    switchTab(index, tabName) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        // Update the prompt's active tab
        prompt.activeTab = tabName;

        // Update tab buttons and panes directly in the DOM instead of re-rendering
        if (this.promptModalBody) {
            const tabButtons = this.promptModalBody.querySelectorAll('.tab-button');
            const tabPanes = this.promptModalBody.querySelectorAll('.tab-pane');
            const clearButton = this.promptModalBody.querySelector('[data-action="clear-variables"]');

            // Update button active states
            tabButtons.forEach(button => {
                const buttonTab = button.dataset.tab;
                if (buttonTab === tabName) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });

            // Update pane active states
            tabPanes.forEach(pane => {
                const paneTab = pane.dataset.tab;
                if (paneTab === tabName) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });

            // Show/hide Clear All button based on active tab
            if (clearButton) {
                clearButton.style.display = tabName === 'variables' ? '' : 'none';
            }
        }

        // Update the card if needed
        this.updatePromptCard(index);
    }

    /**
     * Switch active variation
     */
    switchVariation(index, variationId) {
        const prompt = this.filteredPrompts[index];
        if (!prompt || !prompt.variations) return;

        const variation = prompt.variations.find(v => v.id === variationId);
        if (!variation) return;

        // Update active variation
        prompt.activeVariationId = variationId;

        // Update description in UI (if modal is open)
        const descriptionEl = document.querySelector('[data-variation-description]');
        if (descriptionEl) {
            if (variation.description) {
                descriptionEl.textContent = variation.description;
                descriptionEl.classList.add('visible');
            } else {
                descriptionEl.textContent = '';
                descriptionEl.classList.remove('visible');
            }
        }

        // Preserve variable values (already in memory)
        // Preview will auto-update with new template

        // Re-render modal content to show new template in preview
        this.refreshPromptViews(index);
    }

    /**
     * Clear all variable values
     */
    clearVariables(index) {
        const prompt = this.filteredPrompts[index];
        const activeVariables = this.getActiveVariables(prompt);
        if (activeVariables && activeVariables.length > 0) {
            activeVariables.forEach(v => v.value = '');
            localStorage.removeItem(`prompt_vars_${prompt.id}`);
        }

        this.refreshPromptViews(index);
        this.showToast('Variables cleared');
    }

    /**
     * Save template changes
     */
    saveTemplateChanges(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        // Clear the original template marker since changes are saved
        delete prompt._originalTemplate;
        prompt.locked = true;

        this.refreshPromptViews(index);
        this.showToast('Changes saved');
    }

    /**
     * Cancel template editing
     */
    cancelEdit(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        // Get current template value
        const currentTemplate = this.getActiveTemplate(prompt);

        // Check if there are unsaved changes
        const hasChanges = prompt._originalTemplate && prompt._originalTemplate !== currentTemplate;

        if (hasChanges) {
            if (confirm('Discard unsaved changes?')) {
                // Restore original template to the right location
                if (prompt.variations && prompt.variations.length > 0) {
                    const activeId = prompt.activeVariationId || prompt.variations[0].id;
                    const variation = prompt.variations.find(v => v.id === activeId);
                    if (variation) {
                        variation.template = prompt._originalTemplate;
                    }
                } else {
                    prompt.template = prompt._originalTemplate;
                }
                delete prompt._originalTemplate;
                prompt.locked = true;
                this.refreshPromptViews(index);
            }
        } else {
            // No changes, just cancel edit mode
            delete prompt._originalTemplate;
            prompt.locked = true;
            this.refreshPromptViews(index);
        }
    }

    /**
     * Check for unsaved changes before closing modal
     */
    hasUnsavedChanges() {
        if (this.activePromptIndex === null || this.activePromptIndex === undefined) return false;
        const prompt = this.filteredPrompts[this.activePromptIndex];
        if (!prompt) return false;

        const currentTemplate = this.getActiveTemplate(prompt);
        return prompt._originalTemplate && prompt._originalTemplate !== currentTemplate;
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
        if (!prompt) return;

        prompt.locked = true;
        this.refreshPromptViews(index);

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
                useCount: prompt.useCount
            });

            this.showToast('Copied!');

            // Auto-open AI Tools modal
            setTimeout(() => {
                const aiToolsButton = document.getElementById('openLinksModal');
                if (aiToolsButton) {
                    aiToolsButton.click();
                }
            }, 500); // Small delay to let the toast appear first
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

        // Build filename with variation name if applicable
        let filename = prompt.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        if (prompt.variations && prompt.activeVariationId) {
            const variation = prompt.variations.find(v => v.id === prompt.activeVariationId);
            if (variation) {
                filename += `--${variation.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
            }
        }

        filename += '.txt';

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
     * Get the active template for a prompt (from variation or fallback to single template)
     */
    getActiveTemplate(prompt) {
        if (prompt.variations && prompt.variations.length > 0) {
            const activeId = prompt.activeVariationId || prompt.variations[0].id;
            const variation = prompt.variations.find(v => v.id === activeId);
            return variation?.template || prompt.template || '';
        }
        return prompt.template || '';
    }

    /**
     * Compile prompt template with variable values
     */
    compilePrompt(prompt) {
        // Get template from active variation or fallback to single template
        let compiled = this.getActiveTemplate(prompt);

        // Get variables for active variation
        const activeVariables = this.getActiveVariables(prompt);

        if (activeVariables && activeVariables.length > 0) {
            activeVariables.forEach(variable => {
                const placeholder = `{{${variable.name}}}`;
                // Skip variables that should be hidden in preview
                if (variable.hideInPreview) {
                    compiled = compiled.split(placeholder).join('');
                } else {
                    const value = variable.value || '';
                    compiled = compiled.split(placeholder).join(value);
                }
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
     * Show toast notification (using wy-toast Web Component)
     */
    showToast(message) {
        this.toast.message = message;
        this.toast.show = true;
    }

    /**
     * Auto-resize textarea to fit content
     */
    autoResizeTextarea(textarea) {
        if (!textarea) return;

        textarea.style.height = 'auto';

        const computedStyle = window.getComputedStyle(textarea);
        const maxHeightValue = computedStyle.maxHeight;
        let maxHeight = parseInt(maxHeightValue, 10);
        if (Number.isNaN(maxHeight) || maxHeight <= 0) {
            maxHeight = Math.floor(window.innerHeight * 0.5);
        }
        const scrollHeight = textarea.scrollHeight;

        if (!Number.isNaN(maxHeight) && maxHeight > 0) {
            const clampedHeight = Math.min(scrollHeight, maxHeight);
            textarea.style.height = `${clampedHeight}px`;
        } else {
            textarea.style.height = `${scrollHeight}px`;
        }
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
                                <span class="shortcut-description">Close open dialogs</span>
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

    /**
     * Setup keyboard handling for mobile devices
     * Adjusts modal position when keyboard appears
     */
    setupKeyboardHandling() {
        // Only setup if visualViewport is supported (modern mobile browsers)
        if (!window.visualViewport) return;

        this.keyboardHandler = () => {
            if (!this.promptModal || !this.promptModal.classList.contains('show')) return;

            const viewport = window.visualViewport;
            const modalContent = this.promptModal.querySelector('.modal-content');
            if (!modalContent) return;

            // Calculate how much the viewport has been reduced by the keyboard
            const keyboardHeight = window.innerHeight - viewport.height;
            const isKeyboardVisible = keyboardHeight > 100; // Threshold to detect keyboard

            if (isKeyboardVisible) {
                // Keyboard is visible - adjust modal
                modalContent.style.maxHeight = `${viewport.height * 0.9}px`;
                modalContent.style.transform = `translateY(${viewport.offsetTop}px)`;

                // Ensure active input is visible
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    // Small delay to let keyboard settle
                    setTimeout(() => {
                        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                }
            } else {
                // Keyboard is hidden - reset
                modalContent.style.maxHeight = '';
                modalContent.style.transform = '';
            }
        };

        // Listen for viewport changes
        window.visualViewport.addEventListener('resize', this.keyboardHandler);
        window.visualViewport.addEventListener('scroll', this.keyboardHandler);

        // Also handle focus events on inputs
        this.focusHandler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                setTimeout(this.keyboardHandler, 300);
            }
        };
        document.addEventListener('focusin', this.focusHandler);
    }

    /**
     * Cleanup keyboard handling when modal closes
     */
    cleanupKeyboardHandling() {
        if (!window.visualViewport || !this.keyboardHandler) return;

        window.visualViewport.removeEventListener('resize', this.keyboardHandler);
        window.visualViewport.removeEventListener('scroll', this.keyboardHandler);

        if (this.focusHandler) {
            document.removeEventListener('focusin', this.focusHandler);
        }

        // Reset modal content styles
        const modalContent = this.promptModal?.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.maxHeight = '';
            modalContent.style.transform = '';
        }

        this.keyboardHandler = null;
        this.focusHandler = null;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PromptLibrary();
});
