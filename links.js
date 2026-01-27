/**
 * LinksManager - Manages the AI Tools links modal using wy-links-modal Web Component
 */
class LinksManager {
    constructor() {
        this.links = [];
        this.modal = null; // Will be set after component loads
        this.openButton = document.getElementById('openLinksModal');
        this.hamburger = document.getElementById('hamburgerMenu');

        this.init();
    }

    /**
     * Initialize the links manager
     */
    async init() {
        await this.loadLinks();
        // Wait for component to be registered
        await this.waitForComponent();
        this.setupEventListeners();
        this.updateModalLinks();
    }

    /**
     * Wait for wy-links-modal component to be registered
     */
    async waitForComponent() {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            this.modal = document.getElementById('linksModal');
            if (this.modal && this.modal.tagName === 'WY-LINKS-MODAL') {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.warn('wy-links-modal component not found after waiting');
    }

    /**
     * Load links from JSON file
     */
    async loadLinks() {
        try {
            const response = await fetch('links.json');
            this.links = await response.json();
        } catch (error) {
            console.error('Error loading links:', error);
            this.links = [];
        }
    }

    /**
     * Update modal with links data
     */
    updateModalLinks() {
        if (this.modal && this.links.length > 0) {
            // Set links data on component
            this.modal.links = this.links;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Open modal buttons
        if (this.openButton) {
            this.openButton.addEventListener('click', () => this.openModal());
        }

        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.openModal());
        }

        // Listen for component events
        if (this.modal) {
            // Close event - component handles ESC key internally
            this.modal.addEventListener('close', () => {
                // Restore body scroll when modal closes
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
                document.body.style.overscrollBehavior = '';
            });

            // Link click event - component handles navigation, we can track if needed
            this.modal.addEventListener('link-click', (e) => {
                // Close modal after link click (component handles navigation)
                this.closeModal();
            });

            // Listen for open attribute changes to apply mobile styles
            const observer = new MutationObserver(() => {
                if (this.modal.hasAttribute('open')) {
                    this.applyMobileStyles();
                    // Prevent body scroll on mobile
                    if (window.matchMedia('(max-width: 768px)').matches) {
                        document.body.style.overflow = 'hidden';
                        document.body.style.position = 'fixed';
                        document.body.style.width = '100%';
                        document.body.style.overscrollBehavior = 'none';
                    }
                }
            });
            observer.observe(this.modal, { attributes: true, attributeFilter: ['open'] });
        }
    }

    /**
     * Open the modal
     */
    openModal() {
        if (!this.modal) {
            console.warn('Modal component not available');
            return;
        }

        // Ensure links are up to date
        this.updateModalLinks();
        
        // Apply mobile styles if on mobile
        this.applyMobileStyles();
        
        // Use component's show method
        this.modal.show();
    }

    /**
     * Apply mobile-specific styles to modal
     */
    applyMobileStyles() {
        if (!this.modal || !this.modal.shadowRoot) {
            return;
        }

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        
        if (isMobile) {
            const overlay = this.modal.shadowRoot.querySelector('.modal-overlay');
            const container = this.modal.shadowRoot.querySelector('.modal-container');
            const content = this.modal.shadowRoot.querySelector('.modal-content');
            const closeButton = this.modal.shadowRoot.querySelector('.close-button');
            const chips = this.modal.shadowRoot.querySelectorAll('.link-chip');

            if (overlay) {
                overlay.style.padding = '0';
                overlay.style.alignItems = 'flex-start';
            }

            if (container) {
                container.style.width = '100%';
                container.style.maxWidth = '100%';
                container.style.height = '100vh';
                container.style.maxHeight = '100vh';
                container.style.borderRadius = '0';
                container.style.border = 'none';
                container.style.boxShadow = 'none';
            }

            if (content) {
                content.style.paddingTop = 'calc(var(--spacing-md) + env(safe-area-inset-top, 0px))';
                content.style.paddingRight = 'var(--spacing-md)';
                content.style.paddingBottom = 'calc(var(--spacing-md) + env(safe-area-inset-bottom, 0px))';
                content.style.paddingLeft = 'var(--spacing-md)';
                content.style.height = '100%';
                content.style.maxHeight = '100vh';
                content.style.overflowY = 'auto';
                content.style.webkitOverflowScrolling = 'touch';
                content.style.overscrollBehavior = 'contain';
            }

            if (closeButton) {
                closeButton.style.top = 'calc(var(--spacing-md) + env(safe-area-inset-top, 0px))';
                closeButton.style.right = 'var(--spacing-md)';
                closeButton.style.minWidth = '44px';
                closeButton.style.minHeight = '44px';
                closeButton.style.touchAction = 'manipulation';
            }

            // Ensure chips have proper touch targets
            chips.forEach(chip => {
                chip.style.minHeight = '44px';
                chip.style.touchAction = 'manipulation';
            });

            // Reduce chip gap
            const chipsContainer = this.modal.shadowRoot.querySelector('.chips-container');
            if (chipsContainer) {
                chipsContainer.style.gap = 'var(--spacing-sm)';
            }

            // Reduce section gap
            const sectionsContainer = this.modal.shadowRoot.querySelector('.sections-container');
            if (sectionsContainer) {
                sectionsContainer.style.gap = 'var(--spacing-lg)';
            }

            // Reduce title size
            const title = this.modal.shadowRoot.querySelector('.modal-title');
            if (title) {
                title.style.fontSize = 'var(--md-sys-typescale-headline-medium-size)';
            }
        }
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (!this.modal) {
            return;
        }

        // Use component's close method
        this.modal.close();
    }
}

// Initialize the links manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LinksManager();
});
