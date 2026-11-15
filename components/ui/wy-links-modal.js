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
        <div class="modal-container" @click="${this._handleContainerClick}">
          <button 
            class="close-button" 
            @click="${this._handleClose}"
            aria-label="Close modal"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
          
          <div class="modal-content">
            <div class="title-wrapper">
              <h1 class="modal-title">${this.title}</h1>
            </div>
            
            <div class="sections-container">
              ${this.showPaletteEntry ? html`
                <div class="palette-entry-section">
                  <button class="palette-entry-btn" @click="${this._handlePaletteClick}" aria-label="Open color palettes">
                    <span class="material-symbols-outlined">palette</span>
                    Color Palettes
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

    return html`
      <button
        class="link-chip"
        @click="${(e) => this._handleLinkClick(e, link)}"
        aria-label="Open ${link.name}"
      >
        ${link.name}
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
