import { LitElement, html, css } from 'lit';

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
    this._loadFonts();
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
      const closeButton = this.shadowRoot?.querySelector('.close-button');
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

  _loadFonts() {
    const existingLinks = document.querySelectorAll('link[data-wy-links-modal-fonts]');
    if (existingLinks.length >= 3) {
      return; // All fonts already loaded
    }

    if (!document.querySelector('link[href*="Playfair+Display"][data-wy-links-modal-fonts]')) {
      const playfairLink = document.createElement('link');
      playfairLink.rel = 'stylesheet';
      playfairLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
      playfairLink.setAttribute('data-wy-links-modal-fonts', 'playfair');
      document.head.appendChild(playfairLink);
    }

    if (!document.querySelector('link[href*="Material+Symbols"][data-wy-links-modal-fonts]')) {
      const materialLink = document.createElement('link');
      materialLink.rel = 'stylesheet';
      materialLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
      materialLink.setAttribute('data-wy-links-modal-fonts', 'material');
      document.head.appendChild(materialLink);
    }

    // Load DM Sans font
    if (!document.querySelector('link[href*="DM+Sans"][data-wy-links-modal-fonts]')) {
      const dmSansLink = document.createElement('link');
      dmSansLink.rel = 'stylesheet';
      dmSansLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap';
      dmSansLink.setAttribute('data-wy-links-modal-fonts', 'dm-sans');
      document.head.appendChild(dmSansLink);
    }
  }

  static styles = css`
    :host {
      display: block;
      position: relative;
    }

    /* Material Symbols */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-feature-settings: 'liga';
    }

    /* Modal overlay - matches mockup backdrop */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: color-mix(in srgb, var(--md-sys-color-on-surface) 9%, transparent);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem; /* p-4 from mockup */
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transition: opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard),
                  visibility var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
    }

    :host([open]) .modal-overlay {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }

    :host([open]) {
      display: block;
    }

    /* Modal container - matches mockup exactly */
    .modal-container {
      position: relative;
      width: 100%;
      max-width: 56rem; /* max-w-4xl = 896px */
      max-height: 90vh; /* Constrain height to enable scrolling */
      background: var(--paper, #F7F4EE);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: 0;
      box-shadow: var(--shadow-modal); /* shadow-2xl */
      overflow: hidden;
      border: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 5%, transparent); /* border-black/5 */
      transform: scale(0.95) translateY(20px);
      opacity: 0;
      transition: transform var(--md-sys-motion-duration-long2) var(--md-sys-motion-easing-spring),
                  opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
      display: flex;
      flex-direction: column;
    }

    :host([open]) .modal-container {
      transform: scale(1) translateY(0);
      opacity: 1;
    }

    /* Content wrapper with padding - matches mockup p-8 */
    .modal-content {
      padding: var(--spacing-xl, 2rem);
      padding-bottom: calc(var(--spacing-xl, 2rem) + env(safe-area-inset-bottom, 0px));
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0; /* Allow shrinking below content size for scroll */
      overflow-y: auto;
      overflow-x: hidden;
    }

    @media (max-width: 600px) {
      .modal-overlay {
        padding: 0;
        align-items: flex-end;
      }

      .modal-container {
        max-width: 100%;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
      }

      .modal-content {
        padding: var(--spacing-lg, 1.5rem);
        /* Extra padding for mobile browser controls (toolbar, home indicator) */
        padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
        height: 100%;
        box-sizing: border-box;
      }

      .close-button {
        top: var(--spacing-lg, 1.5rem);
        right: var(--spacing-lg, 1.5rem);
      }

      .modal-title {
        font-size: 1.75rem;
      }

      .title-wrapper {
        margin-bottom: var(--spacing-xl, 2rem);
      }

      .sections-container {
        gap: 2rem;
      }
    }

    /* Close button - matches mockup exactly */
    .close-button {
      position: absolute;
      top: var(--spacing-xl, 2rem);
      right: var(--spacing-xl, 2rem);
      background: none;
      border: none;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--wy-links-modal-close-color, #A8A29E); /* stone-400 from reference */
      transition: color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
      overflow: hidden;
      z-index: 10;
      border-radius: 50%;
    }

    .close-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: var(--md-sys-color-primary);
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
    }

    .close-button:hover::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .close-button:hover {
      color: var(--md-sys-color-text-heading); /* hover:text-primary */
    }

    .close-button:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .close-button .material-symbols-outlined {
      font-size: 2rem; /* text-2xl */
      position: relative;
      z-index: 1;
    }

    /* Title wrapper with mb-12 */
    .title-wrapper {
      margin-bottom: var(--spacing-2xl, 3rem);
      flex-shrink: 0; /* Title stays fixed, doesn't shrink */
    }

    /* Title - matches mockup exactly */
    .modal-title {
      font-family: var(--font-serif); /* playfair */
      font-size: 2.25rem; /* text-4xl = 36px */
      font-weight: 500; /* font-medium */
      line-height: 1.2;
      color: var(--wy-links-modal-title-color, #1C1917); /* stone-900 from reference */
      margin: 0;
    }

    /* Sections container - matches space-y-10 */
    .sections-container {
      display: flex;
      flex-direction: column;
      gap: 2.5rem; /* 40px = 2.5rem */
    }

    /* Section */
    .section {
      display: flex;
      flex-direction: column;
    }

    /* Section header - matches mockup exactly */
    .section-header {
      font-family: var(--font-serif); /* playfair */
      font-size: 1.25rem; /* text-xl = 20px */
      font-weight: 500; /* font-medium */
      line-height: 1.2;
      color: var(--wy-links-modal-header-color, #292524); /* stone-800 from reference */
      margin: 0 0 1.25rem 0; /* 20px = 1.25rem */
    }

    /* Chips container - matches flex flex-wrap gap-3 */
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: calc(var(--spacing-sm, 0.5rem) * 1.5); /* 12px = 1.5 * 8px */
    }

    /* Link chip button - matches mockup exactly */
    .link-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: calc(var(--spacing-sm, 0.5rem) * 1.25) var(--spacing-lg, 1.5rem); /* 10px 24px = 1.25 * 8px, 24px */
      border-radius: 0;
      font-family: var(--ff-sans, 'Inter', sans-serif);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.875rem; /* text-sm = 14px */
      font-weight: 500; /* font-medium */
      cursor: pointer;
      border: none;
      background-color: var(--md-sys-color-surface-container-lowest);
      color: var(--wy-links-modal-chip-text-color, #44403C); /* stone-700 from reference */
      text-decoration: none;
      transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
      position: relative;
      overflow: hidden;
    }

    /* Chip hover state layer */
    .link-chip::before {
      content: '';
      position: absolute;
      inset: 0;
      background-color: color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 15%, transparent);
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
    }

    .link-chip:hover::before {
      opacity: 1;
    }

    /* Chip pressed state */
    .link-chip:active {
      transform: scale(0.97);
    }

    /* Focus state */
    .link-chip:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .link-dropdown {
      position: relative;
      display: inline-flex;
    }

    .link-chip--dropdown {
      gap: var(--spacing-xs, 0.25rem);
      padding-right: var(--spacing-md, 1rem);
    }

    .link-chip__label,
    .link-chip__icon {
      position: relative;
      z-index: 1;
    }

    .link-chip__icon {
      font-size: 1.25rem;
      transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
    }

    .link-chip--dropdown[aria-expanded="true"] .link-chip__icon {
      transform: rotate(180deg);
    }

    .link-menu {
      position: absolute;
      top: calc(100% + var(--spacing-xs, 0.25rem));
      left: 0;
      z-index: 20;
      min-width: 15rem;
      padding: var(--spacing-xs, 0.25rem);
      border: 1px solid var(--paper-edge, #DDD6C8);
      background: var(--paper, #F7F4EE);
      box-shadow: var(--shadow-modal);
    }

    .link-menu__item {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: flex-start;
      min-height: 2.75rem;
      padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
      border: none;
      border-radius: 0;
      background: transparent;
      color: var(--wy-links-modal-chip-text-color, #44403C);
      cursor: pointer;
      font-family: var(--ff-sans, 'Inter', sans-serif);
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      line-height: 1.2;
      text-align: left;
      text-transform: uppercase;
      transition: background-color var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
    }

    .link-menu__item:hover {
      background: color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 12%, transparent);
    }

    .link-menu__item:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: -3px;
    }

    @media (max-width: 600px) {
      .link-dropdown {
        position: static;
      }

      .link-menu {
        left: var(--spacing-md, 1rem);
        right: var(--spacing-md, 1rem);
        min-width: 0;
      }
    }

    /* Palette entry */
    .palette-entry-section {
      padding-bottom: var(--spacing-lg, 24px);
      border-bottom: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 8%, transparent);
      margin-bottom: var(--spacing-lg, 24px);
    }

    .palette-entry-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      height: 40px;
      padding: 0 var(--spacing-md, 16px) 0 var(--spacing-sm, 8px);
      border: 1px solid color-mix(in srgb, var(--md-sys-color-on-surface) 14%, transparent);
      border-radius: 20px;
      background: transparent;
      color: var(--md-sys-color-on-surface, #1A1A1A);
      font-family: 'DM Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: background 120ms ease;
    }

    .palette-entry-btn:hover {
      background: color-mix(in srgb, var(--md-sys-color-on-surface) 6%, transparent);
    }

    .palette-entry-btn:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .palette-entry-btn .material-symbols-outlined {
      font-size: 20px;
      opacity: 0.7;
    }

  `;

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
                ? html`<p style="color: var(--md-sys-color-on-surface-variant); text-align: center; padding: 2rem;">No links available.</p>`
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
