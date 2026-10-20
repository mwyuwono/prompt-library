import { LitElement, html } from 'lit';

/**
 * wy-links-modal Component
 * 
 * Modal dialog displaying categorized AI tool links as interactive chips.
 * Rebuilt from scratch to match design mockup exactly.
 * 
 * @example
 * ```html
 * <wy-links-modal 
 *   open 
 *   title="AI Tools"
 *   .links="${linksData}"
 *   @close="${handleClose}"
 *   @link-click="${handleLinkClick}"
 * ></wy-links-modal>
 * ```
 */
export class WyLinksModal extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String },
    links: { type: Array },
    showPaletteEntry: { type: Boolean, attribute: 'show-palette-entry' },
    openDropdownId: { type: String, state: true }
  };

  constructor() {
    super();
    this.open = false;
    this.title = 'AI Tools';
    this.links = [];
    this.showPaletteEntry = false;
    this.openDropdownId = '';
  }

  connectedCallback() {
    super.connectedCallback();
    this._escKeyHandler = this._handleEscKey.bind(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._escKeyHandler) {
      document.removeEventListener('keydown', this._escKeyHandler);
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('open')) {
      if (this.open) {
        document.addEventListener('keydown', this._escKeyHandler);
        this._focusFirstElement();
      } else {
        document.removeEventListener('keydown', this._escKeyHandler);
      }
    }
  }

  _focusFirstElement() {
    requestAnimationFrame(() => {
      const closeButton = this.querySelector('.close-button');
      if (closeButton) {
        // Flush styles first: the overlay leaves visibility:hidden only once [open] is applied.
        void closeButton.offsetHeight;
        closeButton.focus();
      }
    });
  }

  _handleEscKey(e) {
    if (e.key === 'Escape' && this.open) {
      if (this.openDropdownId) {
        this.openDropdownId = '';
        return;
      }
      this._handleClose();
    }
  }

  render() {
    return html`
      <div class="modal-overlay" @click="${this._handleOverlayClick}">
        <div
          class="modal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wy-links-modal-title"
          @click="${this._handleContainerClick}"
        >
          <span class="handle" aria-hidden="true"></span>
          <div class="modal-content">
            <div class="title-wrapper">
              <h1 class="modal-title" id="wy-links-modal-title">${this.title}</h1>
              <button
                class="close-button"
                type="button"
                @click="${this._handleClose}"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
              </button>
            </div>

            <div class="sections-container">
              ${this.showPaletteEntry ? html`
                <div class="palette-entry-section">
                  <h2 class="section-header section-header--mobile">Tools</h2>
                  <button class="link-chip palette-entry-btn" @click="${this._handlePaletteClick}" aria-label="Open color palettes">
                    <svg class="palette-entry-btn__icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.6-.8 1.4-1.6-.3-1.2.5-2.4 1.8-2.4H18a3 3 0 0 0 3-3c0-4.9-4-9-9-9Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/></svg>
                    <span class="link-chip__label">Color palettes</span>
                  </button>
                </div>
              ` : ''}
              ${!this.links || this.links.length === 0
                ? html`<p class="empty-state">No links available.</p>`
                : this.links.map((category, categoryIndex) => html`
                  <section class="section">
                    <h2 class="section-header">${category.category}</h2>
                    <div class="chips-container">
                      ${category.links && category.links.length > 0 
                        ? category.links.map((link, linkIndex) => this._renderLink(link, `link-${categoryIndex}-${linkIndex}`))
                        : ''}
                    </div>
                  </section>
                `)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _handlePaletteClick() {
    this._handleClose();
    this.dispatchEvent(new CustomEvent('palette-open', {
      bubbles: true,
      composed: true
    }));
  }

  _handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      this._handleClose();
    }
  }

  _handleContainerClick(e) {
    if (!e.composedPath().some(element => element?.classList?.contains('link-dropdown'))) {
      this.openDropdownId = '';
    }
    e.stopPropagation();
  }

  _handleClose() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true
    }));
  }

  _handleLinkClick(e, link) {
    // Navigate to URL (buttons don't navigate by default)
    window.open(link.url, '_blank', 'noopener,noreferrer');
    
    this.dispatchEvent(new CustomEvent('link-click', {
      detail: { link },
      bubbles: true,
      composed: true
    }));
  }

  _renderLink(link, dropdownId) {
    if (Array.isArray(link.options) && link.options.length > 0) {
      const isOpen = this.openDropdownId === dropdownId;

      return html`
        <div class="link-dropdown">
          <button
            class="link-chip link-chip--dropdown"
            @click="${(e) => this._handleDropdownToggle(e, dropdownId)}"
            aria-label="Open ${link.name} options"
            aria-haspopup="menu"
            aria-expanded="${isOpen ? 'true' : 'false'}"
            aria-controls="link-menu-${dropdownId}"
          >
            <span class="link-chip__label">${link.name}</span>
            <span class="material-symbols-outlined link-chip__icon" aria-hidden="true">expand_more</span>
          </button>
          ${isOpen ? html`
            <div class="link-menu" id="link-menu-${dropdownId}" role="menu">
              ${link.options.map(option => html`
                <button
                  class="link-menu__item"
                  role="menuitem"
                  @click="${(e) => this._handleLinkClick(e, option)}"
                  aria-label="Open ${option.name}"
                >
                  ${option.name}
                </button>
              `)}
            </div>
          ` : ''}
        </div>
      `;
    }

    const isFavorite = link.active === true;

    return html`
      <button
        class="link-chip${isFavorite ? ' link-chip--fav' : ''}"
        @click="${(e) => this._handleLinkClick(e, link)}"
        aria-label="Open ${link.name}"
      >
        ${isFavorite ? html`<svg class="link-chip__fav" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-7.4-4.5-9.4-8.9C1.3 8.2 3.3 4.8 6.6 4.8c2.1 0 3.6 1.2 4.6 2.7 1-1.5 2.5-2.7 4.6-2.7 3.3 0 5.3 3.4 4 6.5-2 4.4-9.4 8.9-9.4 8.9z" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>` : ''}
        <span class="link-chip__label">${link.name}</span>
      </button>
    `;
  }

  _handleDropdownToggle(e, dropdownId) {
    e.stopPropagation();
    this.openDropdownId = this.openDropdownId === dropdownId ? '' : dropdownId;
  }

  show() {
    this.open = true;
  }

  close() {
    this._handleClose();
  }
}

// Verify class exists before defining
if (!WyLinksModal) {
  console.error('[wy-links-modal] Component class is undefined');
  throw new Error('WyLinksModal class is undefined');
}

// Verify customElements API is available
if (!customElements) {
  console.error('[wy-links-modal] customElements API not available');
  throw new Error('customElements API not available');
}

try {
  customElements.define('wy-links-modal', WyLinksModal);
  console.log('[wy-links-modal] Component registered successfully');
} catch (error) {
  console.error('[wy-links-modal] Failed to register component:', error);
  console.error('[wy-links-modal] Error stack:', error.stack);
  console.error('[wy-links-modal] WyLinksModal type:', typeof WyLinksModal);
  console.error('[wy-links-modal] WyLinksModal value:', WyLinksModal);
  throw error; // Re-throw to prevent silent failure
}
