/**
 * PromptLibrary - A vanilla JavaScript application for managing AI prompt templates
 */

class PromptLibrary {
    constructor() {
        this.prompts = [];
        this.filteredPrompts = [];
        this.searchTerm = '';
        this.selectedCategory = ''; // Default to Featured (no category selected)
        this.showDetails = true; // Default to visible on desktop
        this.currentView = 'grid'; // Default to grid view
        this.showFeaturedOnly = true; // Default to Featured tab

        // DOM elements
        this.promptGrid = document.getElementById('promptGrid');
        this.promptList = document.getElementById('promptList');
        this.promptArea = document.querySelector('.prompt-area');
        this.controlsBar = document.getElementById('controlsBar');
        this.emptyState = document.getElementById('emptyState');
        this.toast = document.getElementById('toast');
        this.paletteLink = document.getElementById('paletteLink');
        this.showDetailsToggle = null;
        this.viewToggleBtns = [];
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
        this.syncControlsBar();
        this.filterPrompts();
        this.showAdminButtonIfLocal();
    }

    /**
     * Show admin button only when running on localhost
     */
    async showAdminButtonIfLocal() {
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '';
        
        if (!isLocalhost) return;
        
        const adminButton = document.getElementById('adminButton');
        if (!adminButton) return;
        
        // Check if admin server is running on port 3001
        const serverAvailable = await this.checkAdminServer();
        
        if (serverAvailable) {
            // Link to admin server port
            adminButton.href = 'http://localhost:3001/admin.html';
            adminButton.style.display = 'flex';
        } else {
            // Still show button but with click handler that shows error
            adminButton.href = '#';
            adminButton.style.display = 'flex';
            adminButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAdminServerError();
            });
        }
    }

    /**
     * Check if admin server is running on port 3001
     */
    async checkAdminServer() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
            
            const response = await fetch('http://localhost:3001/api/prompts', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Show error message when admin server is not running
     */
    showAdminServerError() {
        const message = `Admin server not running.

Option 1 - Using alias (recommended):
1. Open terminal and run: admin-prompts

Option 2 - Manual:
1. Open terminal
2. Navigate to project folder
3. Run: npm install (first time only)
4. Run: node server.js

Then click the admin button again.
Server will start on http://localhost:3001`;
        
        alert(message);
    }

    /**
     * Load prompts from JSON file
     */
    async loadPrompts() {
        try {
            const response = await fetch('prompts.json');
            const allPrompts = await response.json();
            
            // Filter out archived prompts from public site
            this.prompts = allPrompts.filter(p => !p.archived);

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
        if (this.controlsBar) {
            this.controlsBar.addEventListener('filter-change', (e) => {
                const { search, searchValue, viewMode, showDetails, category, showFeaturedOnly } = e.detail;
                // Support both 'search' and 'searchValue' for compatibility with controls bar component
                this.searchTerm = (search || searchValue || '').toLowerCase();
                this.showDetails = Boolean(showDetails);
                this.showFeaturedOnly = Boolean(showFeaturedOnly);
                
                // When Featured filter is active, ignore category selection
                if (this.showFeaturedOnly) {
                    this.selectedCategory = '';
                } else {
                    this.selectedCategory = category === 'all' ? '' : category;
                }
                
                if (viewMode && viewMode !== this.currentView) {
                    this.switchView(viewMode);
                }
                this.updateCardDetailsVisibility();
                this.updatePaletteVisibility();
                this.filterPrompts();
            });
        }

        // Mobile filters toggle
        const toggleFiltersBtn = document.getElementById('toggleFiltersBtn');
        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener('click', () => {
                this.toggleMobileFilters();
            });
        }

    }

    /**
     * Switch between list and grid views
     */
    switchView(view) {
        this.currentView = view;

        if (this.controlsBar) {
            this.controlsBar.viewMode = view;
        }

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
            const searchInput = this.getControlsSearchInput();
            const isSearchFocused = searchInput &&
                (document.activeElement === searchInput ||
                    this.controlsBar?.shadowRoot?.activeElement === searchInput);

            // Escape while search is focused clears query
            if (e.key === 'Escape' && isSearchFocused) {
                if (this.searchTerm) {
                    this.searchTerm = '';
                    if (this.controlsBar) {
                        this.controlsBar.searchValue = '';
                    } else if (searchInput) {
                        searchInput.value = '';
                    }
                    this.filterPrompts();
                }
                if (searchInput) {
                    searchInput.blur();
                }
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
                if (searchInput) {
                    searchInput.focus();
                }
            }

            // Cmd/Ctrl + / - Show keyboard shortcuts modal
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                this.showShortcutsModal();
            }
        });
    }

    getControlsSearchInput() {
        return this.controlsBar?.shadowRoot?.querySelector('.search-input');
    }

    /**
     * Populate category filters via design system controls bar.
     */
    populateCategoryFilter() {
        const categories = [...new Set(this.prompts.map(p => p.category))].sort();
        if (this.controlsBar) {
            this.controlsBar.categories = categories;
            this.controlsBar.activeCategory = this.selectedCategory || 'all';
        }
    }

    syncControlsBar() {
        if (!this.controlsBar) {
            return;
        }
        this.controlsBar.viewMode = this.currentView;
        this.controlsBar.showDetails = this.showDetails;
        this.controlsBar.searchValue = this.searchTerm;
        this.controlsBar.activeCategory = this.selectedCategory || 'all';
        this.controlsBar.showFeaturedOnly = this.showFeaturedOnly;
    }

    /**
     * Filter prompts based on search term, category, and featured status
     */
    filterPrompts() {
        this.filteredPrompts = this.prompts.filter(prompt => {
            const searchLower = this.searchTerm;

            // Check if search term matches title, description, or category
            let matchesSearch = !searchLower ||
                prompt.title.toLowerCase().includes(searchLower) ||
                prompt.description.toLowerCase().includes(searchLower) ||
                prompt.category.toLowerCase().includes(searchLower);

            // Also check template content (handle both single template and variations)
            if (!matchesSearch && searchLower) {
                if (prompt.template) {
                    matchesSearch = prompt.template.toLowerCase().includes(searchLower);
                }
                // Search within all variation templates
                if (!matchesSearch && prompt.variations) {
                    matchesSearch = prompt.variations.some(v =>
                        v.template && v.template.toLowerCase().includes(searchLower)
                    );
                }
            }

            // Featured filter is EXCLUSIVE - when active, show ONLY featured prompts
            if (this.showFeaturedOnly) {
                return matchesSearch && (prompt.featured === true);
            }

            // Otherwise apply category filter as before
            let matchesCategory = true;
            if (this.selectedCategory) {
                matchesCategory = prompt.category === this.selectedCategory;
            }

            return matchesSearch && matchesCategory;
        });

        // Sort: Featured prompts first, then the rest
        this.filteredPrompts.sort((a, b) => {
            const aFeatured = a.featured === true ? 1 : 0;
            const bFeatured = b.featured === true ? 1 : 0;
            // Sort descending (featured first)
            return bFeatured - aFeatured;
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
     * Show or hide the Fabric Palette link based on category filter
     */
    updatePaletteVisibility() {
        if (this.paletteLink) {
            // Show palette link only when Fabric category is active
            this.paletteLink.style.display =
                this.selectedCategory === 'Fabric' ? 'inline-block' : 'none';
        }
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
        if (this.filteredPrompts.length === 0 && this.selectedCategory !== 'Fabric') {
            this.emptyState.classList.remove('hidden');
            return;
        } else {
            this.emptyState.classList.add('hidden');
        }

        // Prepend colorizer card when Fabric category is active
        if (this.selectedCategory === 'Fabric') {
            this.promptGrid.appendChild(this.createColorizerCard());
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
        if (this.filteredPrompts.length === 0 && this.selectedCategory !== 'Fabric') {
            this.emptyState.classList.remove('hidden');
            return;
        } else {
            this.emptyState.classList.add('hidden');
        }

        // When Fabric is selected but no prompts match, still show colorizer in its own section
        if (this.filteredPrompts.length === 0 && this.selectedCategory === 'Fabric') {
            const section = document.createElement('div');
            section.className = 'category-section';
            const header = document.createElement('h2');
            header.className = 'category-section-header';
            header.textContent = 'Fabric';
            section.appendChild(header);
            const itemsContainer = document.createElement('div');
            itemsContainer.className = 'category-items';
            itemsContainer.appendChild(this.createColorizerCard('list'));
            section.appendChild(itemsContainer);
            this.promptList.appendChild(section);
            return;
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

            // Prepend colorizer card in the Fabric section
            if (category === 'Fabric') {
                itemsContainer.appendChild(this.createColorizerCard('list'));
            }

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
     * Create a card linking to the Fabric Colorizer feature.
     * Matches the visual structure of regular prompt cards.
     * @param {string} viewMode - 'grid' (default) or 'list'
     */
    createColorizerCard(viewMode = 'grid') {
        const url = './fabric-colorizer/colorizer.html';
        const title = 'Fabric Colorizer';
        const description = 'Recolor any fabric design with AI-powered palette suggestions';
        const hiddenClass = this.showDetails ? '' : 'hidden';

        if (viewMode === 'list') {
            const item = document.createElement('div');
            item.className = 'prompt-list-item';
            item.setAttribute('role', 'link');
            item.setAttribute('aria-label', `Open ${title}`);
            item.tabIndex = 0;
            item.innerHTML = `
                <div class="prompt-list-item-content">
                    <div class="prompt-list-item-header">
                        <h3 class="prompt-list-item-title">${this.escapeHTML(title)}</h3>
                    </div>
                    <p class="prompt-list-item-description ${hiddenClass}">${this.escapeHTML(description)}</p>
                </div>
                <div class="prompt-list-item-meta">
                    <span class="variable-count-badge ${hiddenClass}">Interactive tool</span>
                </div>
            `;
            const navigate = () => window.open(url, '_blank', 'noopener,noreferrer');
            item.addEventListener('click', navigate);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
            });
            return item;
        }

        const card = document.createElement('div');
        card.className = 'prompt-card neutral-icon';
        card.dataset.category = 'Fabric';
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', `Open ${title}`);
        card.tabIndex = 0;

        card.innerHTML = `
            <div class="card-content">
                <div>
                    <div class="card-header-row">
                        <div class="card-icon-container icon-neutral">
                            <span class="material-symbols-outlined">palette</span>
                        </div>
                        <div class="card-badge">FABRIC</div>
                    </div>
                    <h3 class="card-title">${this.escapeHTML(title)}</h3>
                    <p class="card-description ${hiddenClass}">${this.escapeHTML(description)}</p>
                </div>
                <div class="card-footer">
                    <div class="card-arrow-button">
                        <span class="material-symbols-outlined">open_in_new</span>
                    </div>
                </div>
            </div>
        `;

        const navigate = () => window.open(url, '_blank', 'noopener,noreferrer');
        card.addEventListener('click', navigate);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
        });

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
        if (!prompt.image) {
            // For featured prompts, show heart icon in circular container
            if (prompt.featured) {
                iconHTML = `
                    <div class="card-icon-container icon-featured">
                        <span class="material-symbols-outlined">favorite</span>
                    </div>
                `;
            } else if (prompt.icon) {
                // For non-featured prompts with custom icon
                iconHTML = `
                    <div class="card-icon-container icon-neutral">
                        <span class="material-symbols-outlined">${prompt.icon}</span>
                    </div>
                `;
            }
        }

        // Tag/Badge section (Category badge for non-image cards only, unless featured)
        // When featured, don't show category badge (heart icon replaces it)
        const badgeHTML = !prompt.image && !prompt.featured && prompt.category ? `
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
                <div class="tabs-header-container">
                    <wy-tabs active-tab="${activeTab}">
                        <button role="tab" data-tab="variables">Variables</button>
                        <button role="tab" data-tab="preview">Preview</button>
                    </wy-tabs>
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
                        <button class="btn btn-link" data-action="download" aria-label="Download as text file">Download .txt</button>
                        <button class="btn btn-primary" data-action="copy">Copy Prompt</button>
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
            <div class="variation-selector-container">
                <wy-dropdown
                    label="STYLE"
                    value="${activeId}"
                    variant="subtle"
                    data-variation-dropdown
                ></wy-dropdown>
                <wy-info-panel 
                    class="variation-description-panel" 
                    data-variation-description
                >${activeVariation?.description ? this.escapeHTML(activeVariation.description) : ''}</wy-info-panel>
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
     * Uses wy-form-field web component for text/textarea inputs
     */
    getVariablesHTML(variables) {
        if (!variables || variables.length === 0) {
            return '';
        }

        return `
            <div class="variables-section">
                ${variables.map(variable => this.getVariableInputHTML(variable)).join('')}
            </div>
        `;
    }

    /**
     * Render variable input element based on configuration
     * Uses wy-form-field web component - properties set programmatically in attachModalEventListeners
     */
    getVariableInputHTML(variable) {
        const inputType = variable.inputType || 'text';
        const dataAttr = `data-variable="${this.escapeHTML(variable.name)}"`;
        const placeholder = this.escapeHTML(variable.placeholder || '');
        const label = this.escapeHTML(variable.label);

        // Toggle inputs use custom implementation (design system doesn't have toggle component)
        if (inputType === 'toggle') {
            // Prepare options for Web Component (supports both options pattern and simple boolean)
            const hasOptions = variable.options && Array.isArray(variable.options) && variable.options.length >= 2;
            const optionsJSON = hasOptions ? JSON.stringify(variable.options).replace(/"/g, '&quot;') : '';
            const currentValue = this.escapeHTML(variable.value || '');
            
            // Use description as helper text if available
            const description = variable.description ? `description="${this.escapeHTML(variable.description)}"` : '';
            
            return `
                <wy-toggle-field
                    ${dataAttr}
                    label="${label}"
                    ${description}
                    ${hasOptions ? `options='${optionsJSON}'` : ''}
                    value="${currentValue}"
                ></wy-toggle-field>
            `;
        }

        // Textarea inputs wrapped in wy-form-field
        // data-label attribute used for programmatic property setting
        if (inputType === 'textarea') {
            const value = this.escapeHTML(variable.value || '');
            return `
                <wy-form-field data-label="${label}">
                    <textarea ${dataAttr} placeholder="${placeholder}" rows="${variable.rows || 6}">${value}</textarea>
                </wy-form-field>
            `;
        }

        // Text inputs wrapped in wy-form-field
        return `
            <wy-form-field data-label="${label}">
                <input type="text" ${dataAttr} placeholder="${placeholder}" value="${this.escapeHTML(variable.value || '')}">
            </wy-form-field>
        `;
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
     * Create/get modal container for prompt details (web component)
     */
    createPromptModal() {
        if (this.promptModal) return;

        // Get the web component from the DOM
        this.promptModal = document.getElementById('promptModal');
        if (!this.promptModal) {
            this.promptModal = document.createElement('wy-prompt-modal');
            this.promptModal.id = 'promptModal';
            document.body.appendChild(this.promptModal);
        }

        // Wire up event handlers
        this.promptModal.addEventListener('close', () => this.closePromptModal());

        this.promptModal.addEventListener('copy', (e) => {
            // Copy is handled by the component, just show toast
            this.showToast('Copied to clipboard!');
        });

        this.promptModal.addEventListener('download', (e) => {
            // Use the existing downloadPrompt method for consistency
            this.downloadPrompt(this.activePromptIndex);
        });

        this.promptModal.addEventListener('save', (e) => {
            this.saveTemplateChanges(this.activePromptIndex);
        });

        this.promptModal.addEventListener('variation-change', (e) => {
            const { index, variation } = e.detail;
            const prompt = this.filteredPrompts[this.activePromptIndex];
            if (prompt && variation) {
                prompt.activeVariationId = variation.id;
                // Update variables if variation has its own
                if (variation.variables) {
                    this.promptModal.variables = variation.variables;
                }
            }
        });

        this.promptModal.addEventListener('variable-change', (e) => {
            const { name, value, values } = e.detail;
            const prompt = this.filteredPrompts[this.activePromptIndex];
            
            if (prompt) {
                if (prompt.steps && prompt.steps.length > 0) {
                    // Multi-step mode: save to current step
                    const step = prompt.steps[this.promptModal.activeStepIndex];
                    const variable = step.variables.find(v => v.name === name);
                    if (variable) {
                        variable.value = value;
                        this.saveStepVariableValues(prompt.id, step.id, step.variables);
                    }
                } else {
                    // Standard mode: existing behavior
                    const variables = this.getActiveVariables(prompt);
                    const variable = variables.find(v => v.name === name);
                    if (variable) {
                        variable.value = value;
                        this.saveVariableValues(prompt.id, variables);
                    }
                }
            }
        });

        this.promptModal.addEventListener('step-change', (e) => {
            const { stepIndex } = e.detail;
            const prompt = this.filteredPrompts[this.activePromptIndex];
            
            if (prompt) {
                // Save current step index
                this.saveStepIndex(prompt.id, stepIndex);
            }
        });

        this.promptModal.addEventListener('variables-cleared', () => {
            this.clearVariables(this.activePromptIndex);
        });

        this.promptModal.addEventListener('toast', (e) => {
            this.showToast(e.detail.message);
        });
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

        // Reset all modal properties to prevent state leakage between prompt types
        this.resetPromptModal();

        // Check if prompt has steps (multi-step mode)
        if (prompt.steps && prompt.steps.length > 0) {
            // Restore saved step index
            const savedStepIndex = this.loadStepIndex(prompt.id);
            
            // Load saved variable values for each step
            prompt.steps.forEach(step => {
                const savedValues = this.loadStepVariableValues(prompt.id, step.id);
                if (savedValues) {
                    step.variables.forEach(v => {
                        if (savedValues[v.name] !== undefined) {
                            v.value = savedValues[v.name];
                        }
                    });
                }
            });

            Object.assign(this.promptModal, {
                title: prompt.title,
                category: prompt.category,
                description: prompt.description || '',
                steps: prompt.steps,
                activeStepIndex: savedStepIndex || 0,
                open: true
            });
        } else {
            // Standard prompt (existing code)
            // Map variation ID to index
            const variationIndex = prompt.variations?.findIndex(v => v.id === prompt.activeVariationId) ?? 0;

            // Get the active variables and restore saved values
            const variables = this.getActiveVariables(prompt);
            const savedValues = this.loadVariableValues(prompt.id);
            if (savedValues) {
                variables.forEach(v => {
                    if (savedValues[v.name] !== undefined) {
                        v.value = savedValues[v.name];
                    }
                });
            }

            // Set all properties on the web component
            Object.assign(this.promptModal, {
                title: prompt.title,
                category: prompt.category,
                description: prompt.description || '',
                template: this.getActiveTemplate(prompt),
                variables: variables,
                variations: prompt.variations || [],
                activeVariationIndex: variationIndex >= 0 ? variationIndex : 0,
                mode: prompt.locked !== false ? 'locked' : 'edit',
                activeTab: prompt.activeTab || 'variables',
                open: true
            });
        }

        // Store current scroll position before locking body
        const scrollY = window.scrollY;
        this.bodyScrollPosition = scrollY;

        document.body.classList.add('modal-open');
        document.body.style.top = `-${scrollY}px`;

        // Handle keyboard visibility on mobile
        this.setupKeyboardHandling();
    }

    /**
     * Close prompt modal and reset active prompt
     */
    closePromptModal() {
        if (!this.promptModal) return;

        // Check for unsaved changes (only in edit mode)
        const prompt = this.filteredPrompts[this.activePromptIndex];
        if (prompt && this.promptModal.mode === 'edit') {
            if (this.hasUnsavedChanges()) {
                if (!confirm('You have unsaved changes. Discard them?')) {
                    this.promptModal.open = true; // Re-open if cancelled
                    return;
                }
                // Restore original template if discarding changes
                if (prompt._originalTemplate) {
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
        }

        this.promptModal.open = false;

        // Restore scroll position - IMPORTANT: Order matters for mobile Safari
        // 1. Get the saved scroll position
        const scrollY = this.bodyScrollPosition || 0;
        // 2. Clear ALL inline styles BEFORE removing modal-open class
        //    This prevents the page from jumping when position changes from fixed to static
        document.body.style.top = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.overscrollBehavior = '';
        // 3. Remove the class (which would otherwise set these properties)
        document.body.classList.remove('modal-open');
        // 4. Restore scroll position
        window.scrollTo(0, scrollY);

        this.activePromptIndex = null;
        this.activePromptId = null;

        // Cleanup keyboard handling
        this.cleanupKeyboardHandling();
    }

    /**
     * Reset prompt modal to clean state
     * Prevents state leakage when switching between prompt types
     */
    resetPromptModal() {
        if (!this.promptModal) return;
        
        Object.assign(this.promptModal, {
            // Core content
            title: '',
            category: '',
            description: '',
            template: '',
            variables: [],
            variations: [],
            steps: [],
            
            // Indices
            activeVariationIndex: 0,
            activeStepIndex: 0,
            
            // UI state
            mode: 'locked',
            activeTab: 'variables'
            
            // Note: Don't set 'open' here - caller controls modal visibility
        });
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
        this.initializeFormFields(modalBody);
        this.bindPromptInteractions(modalBody, prompt, index);
        this.initializeVariableTextareas(modalBody);
        this.updateDependentVariables(modalBody, prompt, this.getActiveVariables(prompt));

        if (prompt.locked !== false) {
            // Find first input - either inside wy-form-field or toggle's variable-input
            const firstInput = modalBody.querySelector('wy-form-field input, wy-form-field textarea, wy-toggle-field');
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

        // Listen for wy-tabs tab-change event
        const wyTabs = container.querySelector('wy-tabs');
        if (wyTabs) {
            wyTabs.addEventListener('tab-change', (event) => {
                event.stopPropagation();
                this.switchTab(index, event.detail.tab);
            });
        }

        const clearButton = container.querySelector('[data-action="clear-variables"]');
        if (clearButton) {
            clearButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                this.clearVariables(index);
            });
        }

        const variationDropdown = container.querySelector('[data-variation-dropdown]');
        if (variationDropdown) {
            // Set options array programmatically (can't be done in HTML attribute)
            variationDropdown.options = prompt.variations.map(v => ({
                value: v.id,
                label: v.name
            }));
            
            // Listen for web component change event
            variationDropdown.addEventListener('change', (event) => {
                this.switchVariation(index, event.detail.value);
            });
        }

        // Handle text/textarea inputs (inside wy-form-field)
        const variableInputs = container.querySelectorAll('wy-form-field input[data-variable], wy-form-field textarea[data-variable]');
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
        // Handle wy-toggle-field Web Component changes
        const toggleFields = container.querySelectorAll('wy-toggle-field');
        toggleFields.forEach(toggleField => {
            toggleField.addEventListener('change', (event) => {
                const variableName = event.target.dataset.variable;
                const variables = this.getActiveVariables(prompt);
                const variable = variables.find(v => v.name === variableName);
                if (variable) {
                    // Web Component emits { checked, value } where value is the string value (options[0] or options[1])
                    variable.value = event.detail.value !== undefined ? event.detail.value : 
                                   (event.detail.checked ? 'true' : '');

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
     * Initialize wy-form-field components by setting label property programmatically
     * HTML attributes don't bind properly to Lit component properties
     */
    initializeFormFields(container) {
        container.querySelectorAll('wy-form-field[data-label]').forEach(formField => {
            const label = formField.dataset.label;
            if (label) {
                // Set property directly on the Lit element
                formField.label = label;
            }
        });
    }

    /**
     * Ensure variable textareas size to content on initial render
     */
    initializeVariableTextareas(container) {
        container.querySelectorAll('textarea').forEach(textarea => {
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

        // Update web component modal if open
        if (this.activePromptId && this.promptModal && this.promptModal.open) {
            const modalIndex = this.filteredPrompts.findIndex(p => p.id === this.activePromptId);
            if (modalIndex === -1) {
                this.closePromptModal();
                return;
            }

            this.activePromptIndex = modalIndex;
            const prompt = this.filteredPrompts[modalIndex];

            // Update web component properties
            Object.assign(this.promptModal, {
                title: prompt.title,
                category: prompt.category,
                description: prompt.description || '',
                template: this.getActiveTemplate(prompt),
                variables: this.getActiveVariables(prompt),
                variations: prompt.variations || [],
                mode: prompt.locked !== false ? 'locked' : 'edit',
                activeTab: prompt.activeTab || 'variables'
            });
        }
    }
    /**
     * Toggle lock/unlock state of a prompt card
     */
    toggleLock(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        // Store original template when entering edit mode
        if (prompt.locked !== false) {
            prompt._originalTemplate = this.getActiveTemplate(prompt);
        }

        prompt.locked = !prompt.locked;
        if (prompt.locked && !prompt.activeTab) {
            prompt.activeTab = 'variables';
        }

        // Update web component mode directly
        if (this.promptModal && this.promptModal.open) {
            this.promptModal.mode = prompt.locked !== false ? 'locked' : 'edit';
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

        // Update web component if it's managing the modal
        if (this.promptModal && this.promptModal.tagName === 'WY-PROMPT-MODAL') {
            this.promptModal.activeTab = tabName;
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
            // Update wy-info-panel via innerHTML (uses slot content)
            if (variation.description) {
                descriptionEl.innerHTML = `<p>${this.escapeHTML(variation.description)}</p>`;
                descriptionEl.style.display = 'block';
            } else {
                descriptionEl.innerHTML = '';
                descriptionEl.style.display = 'none';
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

        // Update web component with cleared variables
        if (this.promptModal && this.promptModal.open) {
            this.promptModal.variables = activeVariables;
        }

        this.updatePromptCard(index);
        this.showToast('Variables cleared');
    }

    /**
     * Save template changes
     */
    saveTemplateChanges(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        // Get the edited template from the web component
        if (this.promptModal && this.promptModal.mode === 'edit') {
            const newTemplate = this.promptModal.template;

            // Save to the right location (variation or main template)
            if (prompt.variations && prompt.variations.length > 0) {
                const activeId = prompt.activeVariationId || prompt.variations[0].id;
                const variation = prompt.variations.find(v => v.id === activeId);
                if (variation) {
                    variation.template = newTemplate;
                }
            } else {
                prompt.template = newTemplate;
            }
        }

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
        if (!prompt || !prompt._originalTemplate) return false;

        // Get current template from web component if in edit mode
        let currentTemplate;
        if (this.promptModal && this.promptModal.mode === 'edit') {
            currentTemplate = this.promptModal.template;
        } else {
            currentTemplate = this.getActiveTemplate(prompt);
        }

        return prompt._originalTemplate !== currentTemplate;
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
     * Show toast notification (using wy-toast Web Component from design system)
     */
    showToast(message) {
        this.toast.message = message;
        this.toast.duration = 2000; // 2 seconds (design system default is 3000ms)
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
     * Save current step index to localStorage
     */
    saveStepIndex(promptId, stepIndex) {
        localStorage.setItem(`prompt_step_${promptId}`, stepIndex.toString());
    }

    /**
     * Load saved step index from localStorage
     */
    loadStepIndex(promptId) {
        const saved = localStorage.getItem(`prompt_step_${promptId}`);
        return saved ? parseInt(saved, 10) : 0;
    }

    /**
     * Save step-specific variable values
     */
    saveStepVariableValues(promptId, stepId, variables) {
        const key = `prompt_vars_${promptId}_${stepId}`;
        const values = {};
        variables.forEach(v => {
            if (v.value) values[v.name] = v.value;
        });
        localStorage.setItem(key, JSON.stringify(values));
    }

    /**
     * Load step-specific variable values
     */
    loadStepVariableValues(promptId, stepId) {
        const key = `prompt_vars_${promptId}_${stepId}`;
        const saved = localStorage.getItem(key);
        if (!saved) return null;
        
        try {
            return JSON.parse(saved);
        } catch (error) {
            console.error('Error loading step variables:', error);
            return null;
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
     * Show keyboard shortcuts modal (uses wy-modal web component)
     */
    showShortcutsModal() {
        const modal = document.getElementById('shortcutsModal');
        if (!modal) return;

        // Populate content if not already done
        if (!modal.hasAttribute('data-initialized')) {
            // Detect platform for key display
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modKey = isMac ? '⌘' : 'Ctrl';

            modal.innerHTML = `
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
            `;
            modal.setAttribute('data-initialized', 'true');

            // Listen for close event from wy-modal
            modal.addEventListener('close', () => this.hideShortcutsModal());
        }

        // Show modal using wy-modal API
        modal.open = true;
    }

    /**
     * Hide keyboard shortcuts modal
     */
    hideShortcutsModal() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.open = false;
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
