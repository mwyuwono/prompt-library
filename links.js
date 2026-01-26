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
                // Modal is already closed by component, nothing to do
            });

            // Link click event - component handles navigation, we can track if needed
            this.modal.addEventListener('link-click', (e) => {
                // Close modal after link click (component handles navigation)
                this.closeModal();
            });
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
        
        // Use component's show method
        this.modal.show();
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
