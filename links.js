/**
 * LinksManager - Manages the AI Tools links modal
 */
class LinksManager {
    constructor() {
        this.links = [];
        this.modal = document.getElementById('linksModal');
        this.linksContainer = document.getElementById('linksContainer');
        this.openButton = document.getElementById('openLinksModal');
        this.hamburger = document.getElementById('hamburgerMenu');
        this.isClosing = false;
        this.closeTimeout = null;

        this.init();
    }

    /**
     * Initialize the links manager
     */
    async init() {
        await this.loadLinks();
        this.renderLinks();
        this.setupEventListeners();
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

        // Close modal
        if (this.modal) {
            const closeElements = this.modal.querySelectorAll('[data-action="close-links"]');
            closeElements.forEach(element => {
                element.addEventListener('click', () => this.closeModal());
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('show')) {
                    this.closeModal();
                }
            });
        }

        // Close modal when a link inside the modal is activated
        if (this.linksContainer) {
            this.linksContainer.addEventListener('click', (event) => {
                const link = event.target.closest('.link-card');
                if (link) {
                    this.closeModal();
                }
            });

            this.linksContainer.addEventListener('keydown', (event) => {
                if ((event.key === 'Enter' || event.key === ' ') && event.target.closest('.link-card')) {
                    this.closeModal();
                }
            });
        }
    }

    /**
     * Render all links categories
     */
    renderLinks() {
        if (!this.links.length) {
            this.linksContainer.innerHTML = '<p class="empty-state">No links available.</p>';
            return;
        }

        this.linksContainer.innerHTML = this.links.map(category => `
            <div class="links-category">
                <h3 class="links-category-title">
                    <span class="links-category-icon material-symbols-outlined">${category.icon}</span>
                    ${category.category}
                </h3>
                <div class="links-grid">
                    ${category.links.map(link => this.renderLinkCard(link)).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render a single link card
     */
    renderLinkCard(link) {
        return `
            <a href="${link.url}" class="link-card" target="_blank" rel="noopener noreferrer">
                <div class="link-card-header">
                    <h4 class="link-card-name">${this.escapeHTML(link.name)}</h4>
                    <div class="link-card-company">${this.escapeHTML(link.company)}</div>
                </div>
                <span class="link-card-arrow material-symbols-outlined">arrow_forward</span>
            </a>
        `;
    }

    /**
     * Open the modal
     */
    openModal() {
        // Store current scroll position before locking body
        const scrollY = window.scrollY;
        this.bodyScrollPosition = scrollY;

        if (!this.modal) {
            return;
        }

        if (this.closeTimeout) {
            clearTimeout(this.closeTimeout);
            this.closeTimeout = null;
        }

        this.isClosing = false;
        this.modal.classList.remove('closing');
        this.modal.classList.add('show');
        document.body.classList.add('modal-open');

        // Set body top position to preserve scroll appearance
        document.body.style.top = `-${scrollY}px`;
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (!this.modal || this.isClosing) {
            return;
        }

        if (!this.modal.classList.contains('show')) {
            this.cleanupBodyScroll();
            return;
        }

        const finishClose = () => {
            this.modal.classList.remove('show', 'closing');
            this.modal.removeEventListener('transitionend', handleTransitionEnd);
            this.cleanupBodyScroll();
            this.isClosing = false;
            if (this.closeTimeout) {
                clearTimeout(this.closeTimeout);
                this.closeTimeout = null;
            }
        };

        const handleTransitionEnd = (event) => {
            if (event.target === this.modal) {
                finishClose();
                this.modal.removeEventListener('transitionend', handleTransitionEnd);
            }
        };

        this.isClosing = true;
        this.modal.addEventListener('transitionend', handleTransitionEnd);
        this.modal.classList.add('closing');

        // Fallback in case transitionend doesn't fire
        this.closeTimeout = setTimeout(finishClose, 500);
    }

    /**
     * Cleanup body scroll state after modal closes
     */
    cleanupBodyScroll() {
        document.body.classList.remove('modal-open');

        // Restore scroll position
        const scrollY = this.bodyScrollPosition || 0;
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
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

// Initialize the links manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new LinksManager();
});
