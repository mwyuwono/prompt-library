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

        this.modal.classList.add('show');
        document.body.classList.add('modal-open');

        // Set body top position to preserve scroll appearance
        document.body.style.top = `-${scrollY}px`;
    }

    /**
     * Close the modal
     */
    closeModal() {
        this.modal.classList.remove('show');
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
