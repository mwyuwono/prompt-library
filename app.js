/**
 * PromptLibrary - A vanilla JavaScript application for managing AI prompt templates
 */

class PromptLibrary {
    constructor(options = {}) {
        this.options = options;
        this.prompts = [];
        this.filteredPrompts = [];
        this.searchTerm = '';
        this.selectedCategory = options.initialCategory || '';
        this.showDetails = true; // Default to visible on desktop
        this.currentView = 'grid'; // Default to grid view
        this.showFeaturedOnly = options.startFeaturedOnly ?? true;

        // DOM elements
        this.promptGrid = document.getElementById('promptGrid');
        this.promptList = document.getElementById('promptList');
        this.promptArea = document.querySelector('.prompt-area');
        this.controlsBar = document.getElementById('controlsBar');
        this.emptyState = document.getElementById('emptyState');
        this.toast = document.getElementById('toast');
        this.paletteLink = document.getElementById('paletteLink');
        this.headerTop = document.querySelector('.header-top');
        this.headerLogoGroup = document.querySelector('.header-logo-group');
        this.headerActions = document.querySelector('.header-actions');
        this.showDetailsToggle = null;
        this.viewToggleBtns = [];
        this.promptModal = null;
        this.activePromptIndex = null;
        this.activePromptId = null;
        this.floatingControlsObserver = null;
        this.floatingHeaderObserver = null;
        this.boundFloatingControlsUpdate = null;
        this.floatingControlsFrame = 0;

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.loadPrompts();
        await this.createPromptModal();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.populateCategoryFilter();
        this.syncControlsBar();
        this.filterPrompts();
        this.showAdminButtonIfLocal();
        this.setupFloatingControlsHeader();

        // Handle deep linking via URL hash
        window.addEventListener('hashchange', () => this.handleHashChange());
        this.handleHashChange();
    }

    setupFloatingControlsHeader() {
        if (!this.controlsBar || !this.headerTop || !this.headerLogoGroup || !this.headerActions) {
            return;
        }

        this.boundFloatingControlsUpdate = () => this.updateFloatingControlsHeader();

        this.floatingControlsObserver = new MutationObserver(this.boundFloatingControlsUpdate);
        this.floatingControlsObserver.observe(this.controlsBar, {
            attributes: true,
            attributeFilter: ['data-scrolled', 'data-scroll-state']
        });

        this.floatingHeaderObserver = new MutationObserver(this.boundFloatingControlsUpdate);
        this.floatingHeaderObserver.observe(this.headerTop, {
            attributes: true,
            childList: true,
            subtree: true
        });

        window.addEventListener('resize', this.boundFloatingControlsUpdate, { passive: true });
        this.updateFloatingControlsHeader();
    }

    updateFloatingControlsHeader() {
        if (!this.controlsBar) {
            return;
        }

        const isDesktop = window.matchMedia('(min-width: 769px)').matches;
        const isFloating = isDesktop && this.controlsBar.hasAttribute('data-scrolled');

        document.body.classList.toggle('controls-floating', isFloating);

        if (!isFloating) {
            this.clearFloatingControlsLayout();
            return;
        }

        if (this.floatingControlsFrame) {
            cancelAnimationFrame(this.floatingControlsFrame);
        }

        this.floatingControlsFrame = requestAnimationFrame(() => {
            this.floatingControlsFrame = 0;
            this.positionFloatingControlsBar();
        });
    }

    positionFloatingControlsBar() {
        if (!this.controlsBar || !this.headerTop || !this.headerLogoGroup || !this.headerActions) {
            return;
        }

        const isDesktop = window.matchMedia('(min-width: 769px)').matches;
        if (!isDesktop || !this.controlsBar.hasAttribute('data-scrolled')) {
            this.clearFloatingControlsLayout();
            return;
        }

        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const headerRect = this.headerTop.getBoundingClientRect();
        const logoRect = this.headerLogoGroup.getBoundingClientRect();
        const actionsRect = this.headerActions.getBoundingClientRect();
        const edgeGap = 12;
        const floatingLeft = Math.max(edgeGap, logoRect.right + edgeGap);
        const floatingRight = Math.max(edgeGap, viewportWidth - actionsRect.left + edgeGap);
        const controlsHeight = this.controlsBar.offsetHeight || 60;
        const top = Math.max(0, headerRect.top + ((headerRect.height - controlsHeight) / 2));

        this.controlsBar.style.setProperty('--wy-controls-floating-left', `${floatingLeft}px`);
        this.controlsBar.style.setProperty('--wy-controls-floating-right', `${floatingRight}px`);
        this.controlsBar.style.setProperty('--wy-controls-floating-top', `${top}px`);
        this.controlsBar.style.setProperty('--wy-controls-floating-width', 'auto');
        this.controlsBar.style.setProperty('--wy-controls-floating-max-width', 'none');
        this.controlsBar.style.setProperty('--wy-controls-floating-transform', 'none');
        this.controlsBar.style.setProperty('--wy-controls-floating-return-transform', 'translateY(-8px) scale(0.98)');
        this.controlsBar.style.setProperty('--wy-controls-floating-z-index', '1001');
    }

    clearFloatingControlsLayout() {
        if (this.floatingControlsFrame) {
            cancelAnimationFrame(this.floatingControlsFrame);
            this.floatingControlsFrame = 0;
        }

        if (!this.controlsBar) {
            return;
        }

        [
            '--wy-controls-floating-top',
            '--wy-controls-floating-right',
            '--wy-controls-floating-left',
            '--wy-controls-floating-width',
            '--wy-controls-floating-max-width',
            '--wy-controls-floating-transform',
            '--wy-controls-floating-return-transform',
            '--wy-controls-floating-z-index'
        ].forEach(property => this.controlsBar.style.removeProperty(property));
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
        
        adminButton.style.display = 'inline-block';

        if (serverAvailable) {
            adminButton.addEventListener('click', () => {
                window.location.href = 'http://localhost:3001/admin.html';
            }, { once: true });
        } else {
            // Still show button but with click handler that shows error
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
            const configuredPrompts = Array.isArray(this.options.prompts) ? this.options.prompts : null;
            if (configuredPrompts) {
                this.initializePrompts(configuredPrompts);
                return;
            }

            const sourceUrl = this.options.sourceUrl || 'prompts.json';
            const response = await fetch(sourceUrl);
            const allPrompts = await response.json();
            this.initializePrompts(allPrompts);
        } catch (error) {
            console.error('Error loading prompts:', error);
            this.prompts = [];
            this.filteredPrompts = [];
        }
    }

    initializePrompts(allPrompts) {
        const shouldFilterArchived = this.options.filterArchived !== false;

        this.prompts = shouldFilterArchived
            ? allPrompts.filter(prompt => !prompt.archived)
            : [...allPrompts];

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
                    this.updatePaletteVisibility();
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

            // Cmd/Ctrl + Shift + C - Copy prompt link (when modal is open)
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
                if (this.promptModal?.open && this.activePromptId) {
                    e.preventDefault();
                    this.copyPromptLink();
                }
            }
        });
    }

    getControlsSearchInput() {
        return this.controlsBar?.shadowRoot?.querySelector('.search-input');
    }

    isSearchActive() {
        return Boolean(this.searchTerm && this.searchTerm.trim());
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
        const isSearchActive = this.isSearchActive();

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

            if (isSearchActive) {
                return matchesSearch;
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
            const isSearchActive = this.isSearchActive();
            // Show palette link only when Fabric category is active
            this.paletteLink.style.display =
                this.selectedCategory === 'Fabric' && !isSearchActive ? 'inline-block' : 'none';
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
        const isFabricCategoryMode = this.selectedCategory === 'Fabric' && !this.isSearchActive();

        // Clear grid
        this.promptGrid.innerHTML = '';

        // Show/hide empty state
        if (this.filteredPrompts.length === 0 && !isFabricCategoryMode) {
            this.emptyState.classList.remove('hidden');
            return;
        } else {
            this.emptyState.classList.add('hidden');
        }

        // Prepend colorizer card when Fabric category is active
        if (isFabricCategoryMode) {
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
        const isFabricCategoryMode = this.selectedCategory === 'Fabric' && !this.isSearchActive();

        // Clear list
        this.promptList.innerHTML = '';

        // Show/hide empty state
        if (this.filteredPrompts.length === 0 && !isFabricCategoryMode) {
            this.emptyState.classList.remove('hidden');
            return;
        } else {
            this.emptyState.classList.add('hidden');
        }

        // When Fabric is selected but no prompts match, still show colorizer in its own section
        if (this.filteredPrompts.length === 0 && isFabricCategoryMode) {
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
                <div class="prompt-list-item-description ${hiddenClass}">${this.renderDescription(prompt.description, this.searchTerm)}</div>
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
                    <div class="card-description ${hiddenClass}">${this.renderDescription(prompt.description, this.searchTerm)}</div>
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
    async createPromptModal() {
        if (this.promptModal && customElements.get('wy-prompt-modal')) return;

        await customElements.whenDefined('wy-prompt-modal');

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
                // Always update variables using helper that handles fallback logic
                this.promptModal.variables = this.getActiveVariables(prompt);
                // Update URL hash to reflect new variation
                this.updateUrlHash(prompt.id, variation.id);
            }
        });

        this.promptModal.addEventListener('copy-link', () => {
            this.copyPromptLink();
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
    async openPromptModal(index) {
        const prompt = this.filteredPrompts[index];
        if (!prompt) return;

        if (!this.promptModal || !customElements.get('wy-prompt-modal')) {
            await this.createPromptModal();
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
            this.loadVariableValues(prompt.id, variables);

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

        // Update URL hash for deep linking
        this.updateUrlHash(prompt.id, prompt.activeVariationId);
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

        // Clear URL hash (use replaceState to avoid adding history entry)
        if (window.location.hash) {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }

    /**
     * Open a prompt by its ID (and optionally a specific variation)
     * Used for deep linking via URL hash
     */
    openPromptById(promptId, variationId = null) {
        // Find prompt in full prompts array (not filtered)
        const prompt = this.prompts.find(p => p.id === promptId);
        if (!prompt) return false;

        // Set active variation if specified
        if (variationId && prompt.variations) {
            const variation = prompt.variations.find(v => v.id === variationId);
            if (variation) {
                prompt.activeVariationId = variationId;
            }
        }

        // Clear filters to ensure prompt is visible, then find its index
        this.searchTerm = '';
        this.selectedCategory = '';
        this.showFeaturedOnly = false;
        this.filterPrompts();
        this.syncControlsBar();

        const index = this.filteredPrompts.findIndex(p => p.id === promptId);
        if (index >= 0) {
            this.openPromptModal(index);
            return true;
        }
        return false;
    }

    /**
     * Handle URL hash changes for deep linking
     */
    handleHashChange() {
        const hash = window.location.hash.slice(1); // Remove leading #
        if (!hash) return;

        // Parse hash: "prompt-id" or "prompt-id/variation-id"
        const [promptId, variationId] = hash.split('/');
        if (promptId) {
            this.openPromptById(promptId, variationId);
        }
    }

    /**
     * Update URL hash when modal opens
     */
    updateUrlHash(promptId, variationId = null) {
        const hash = variationId ? `${promptId}/${variationId}` : promptId;
        history.replaceState(null, '', `#${hash}`);
    }

    /**
     * Copy shareable link for current prompt to clipboard
     */
    copyPromptLink() {
        const prompt = this.filteredPrompts[this.activePromptIndex];
        if (!prompt) return;

        const variationId = prompt.activeVariationId;
        const hash = variationId ? `${prompt.id}/${variationId}` : prompt.id;
        const url = `${window.location.origin}${window.location.pathname}#${hash}`;

        navigator.clipboard.writeText(url).then(() => {
            this.showToast('Link copied to clipboard!');
        });
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
    loadVariableValues(promptId, variables = null) {
        const key = `prompt_vars_${promptId}`;
        const saved = localStorage.getItem(key);
        if (!saved) return null;

        try {
            const values = JSON.parse(saved);
            if (Array.isArray(variables)) {
                variables.forEach(v => {
                    if (values[v.name] !== undefined) v.value = values[v.name];
                });
            }
            return values;
        } catch (error) {
            console.error('Error loading variable values:', error);
            return null;
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
        if (!customElements.get('wy-modal')) {
            console.warn('wy-modal is not registered yet');
            return;
        }

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
                    <div class="shortcut-item">
                        <span class="shortcut-keys"><kbd>${modKey}</kbd> + <kbd>Shift</kbd> + <kbd>C</kbd></span>
                        <span class="shortcut-description">Copy prompt link (in modal)</span>
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
     * Render description text as lightweight markdown (ordered/unordered lists, bold).
     * Plain-text descriptions are returned unchanged.
     */
    renderDescription(text, searchTerm) {
        if (!text) return '';

        const processInline = (str) => {
            let escaped = this.escapeHTML(str);
            escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                escaped = escaped.replace(regex, '<mark>$1</mark>');
            }
            return escaped;
        };

        // Fast path: no list syntax — return plain highlighted text (existing behaviour)
        if (!/^(\d+\.|-|\*) /m.test(text)) {
            return processInline(text);
        }

        const lines = text.split('\n');
        const parts = [];
        let listItems = null;
        let listType = null;

        const flushList = () => {
            if (listItems) {
                const tag = listType === 'ol' ? 'ol' : 'ul';
                parts.push(`<${tag}>${listItems.join('')}</${tag}>`);
                listItems = null;
                listType = null;
            }
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
            if (orderedMatch) {
                if (listType === 'ul') flushList();
                if (!listItems) { listItems = []; listType = 'ol'; }
                listItems.push(`<li>${processInline(orderedMatch[2])}</li>`);
                return;
            }
            const unorderedMatch = trimmed.match(/^[-*]\s+(.+)/);
            if (unorderedMatch) {
                if (listType === 'ol') flushList();
                if (!listItems) { listItems = []; listType = 'ul'; }
                listItems.push(`<li>${processInline(unorderedMatch[1])}</li>`);
                return;
            }
            flushList();
            if (trimmed) parts.push(processInline(trimmed));
        });

        flushList();
        return parts.join('');
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

window.PromptLibrary = PromptLibrary;

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const config = window.PROMPT_LIBRARY_CONFIG || {};
    if (config.autoInit === false) {
        return;
    }

    new PromptLibrary(config);
});
