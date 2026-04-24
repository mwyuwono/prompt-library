import { LitElement, html, css } from 'lit';

export class WyControlsBar extends LitElement {
    static properties = {
        viewMode: { type: String, attribute: 'view-mode' },
        showDetails: { type: Boolean, attribute: 'show-details' },
        activeCategory: { type: String, attribute: 'active-category' },
        categories: { type: Array },
        searchValue: { type: String, attribute: 'search-value' },
        hideViewToggle: { type: Boolean, attribute: 'hide-view-toggle' },
        hideDetailsToggle: { type: Boolean, attribute: 'hide-details-toggle' },
        showFeaturedOnly: { type: Boolean, attribute: 'show-featured-only' },
        chipVariant: { type: String, attribute: 'chip-variant' },
        isScrolled: { type: Boolean, state: true },
        scrollState: { type: String, state: true }
    };

    constructor() {
        super();
        this.viewMode = 'grid';
        this.showDetails = false;
        this.activeCategory = 'all';
        this.categories = ['Productivity', 'Expertise', 'Travel & Shopping'];
        this.searchValue = '';
        this.hideViewToggle = false;
        this.hideDetailsToggle = false;
        this.showFeaturedOnly = false;
        this.chipVariant = '';
        this.isScrolled = false;
        this.scrollState = 'normal';
        this._scrollEnterThreshold = 64; // px
        this._scrollExitThreshold = 12; // px
        this._minScrollableDistance = 96; // px
        this._returnDuration = 300; // ms
        this._scrollFrame = 0;
        this._returnTimer = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        this._handleScroll = this._handleScroll.bind(this);
        this._handleViewportChange = this._handleViewportChange.bind(this);
        window.addEventListener('resize', this._handleViewportChange, { passive: true });
        
        // Delay finding scroll container to ensure DOM is fully ready
        // Use setTimeout instead of requestAnimationFrame for better timing
        setTimeout(() => {
            this._setupScrollListener();
        }, 100);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener('resize', this._handleViewportChange);
        if (this._scrollFrame) {
            cancelAnimationFrame(this._scrollFrame);
            this._scrollFrame = 0;
        }
        clearTimeout(this._returnTimer);
        this._removeScrollListener();
    }

    _handleViewportChange() {
        this._handleScroll();
        this._syncScrolledHostSurface();
    }

    _setupScrollListener() {
        // Remove any existing listener first
        this._removeScrollListener();
        
        // Find the scrollable container
        this._scrollContainer = this._findScrollableContainer();
        
        if (this._scrollContainer === window) {
            window.addEventListener('scroll', this._handleScroll, { passive: true });
        } else if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this._handleScroll, { passive: true });
        }
        
        // Check initial scroll position
        this._handleScroll();
    }

    _removeScrollListener() {
        if (this._scrollContainer === window) {
            window.removeEventListener('scroll', this._handleScroll);
        } else if (this._scrollContainer) {
            this._scrollContainer.removeEventListener('scroll', this._handleScroll);
        }
    }

    _findScrollableContainer() {
        // Strategy 1: Check for .prompt-area anywhere in document (common in prompt-library)
        const promptArea = document.querySelector('.prompt-area');
        if (promptArea) {
            const style = window.getComputedStyle(promptArea);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                return promptArea;
            }
        }
        
        // Strategy 2: Check for .main-content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const style = window.getComputedStyle(mainContent);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                return mainContent;
            }
        }
        
        // Strategy 3: Check siblings via parent
        const siblings = this.parentElement?.querySelectorAll('[class*="scroll"], [class*="area"]');
        if (siblings) {
            for (const sibling of siblings) {
                const style = window.getComputedStyle(sibling);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    return sibling;
                }
            }
        }
        
        // Strategy 4: Traverse up the DOM to find nearest scrollable ancestor
        let element = this.parentElement;
        while (element && element !== document.body) {
            const style = window.getComputedStyle(element);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                return element;
            }
            element = element.parentElement;
        }
        
        // Strategy 5: Check document.body
        const bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.overflowY === 'auto' || bodyStyle.overflowY === 'scroll') {
            return document.body;
        }
        
        // Fallback to window
        return window;
    }

    _getScrollMetrics() {
        let rawScrollY = 0;
        let maxScroll = 0;

        if (this._scrollContainer === window) {
            const documentElement = document.documentElement;
            const body = document.body;
            rawScrollY = window.scrollY || documentElement.scrollTop || body.scrollTop || 0;
            maxScroll = Math.max(
                0,
                Math.max(documentElement.scrollHeight, body.scrollHeight) - window.innerHeight
            );
        } else {
            rawScrollY = this._scrollContainer ? this._scrollContainer.scrollTop : 0;
            maxScroll = this._scrollContainer
                ? Math.max(0, this._scrollContainer.scrollHeight - this._scrollContainer.clientHeight)
                : 0;
        }

        return {
            scrollY: Math.min(Math.max(rawScrollY, 0), maxScroll),
            maxScroll
        };
    }

    _handleScroll() {
        if (this._scrollFrame) {
            return;
        }

        this._scrollFrame = requestAnimationFrame(() => {
            this._scrollFrame = 0;
            this._updateScrollState();
        });
    }

    _updateScrollState() {
        const { scrollY, maxScroll } = this._getScrollMetrics();
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        const canFloat = !isMobile && maxScroll >= this._minScrollableDistance;

        if (!canFloat) {
            this._setScrollState('normal');
            return;
        }

        if (this.scrollState === 'normal' || this.scrollState === 'returning') {
            if (scrollY >= this._scrollEnterThreshold) {
                this._setScrollState('floating');
            }
            return;
        }

        if (this.scrollState === 'floating' && scrollY <= this._scrollExitThreshold) {
            this._setScrollState('returning');
        }
    }

    _setScrollState(nextState) {
        if (this.scrollState === nextState) {
            return;
        }

        clearTimeout(this._returnTimer);
        this.scrollState = nextState;
        this.isScrolled = nextState !== 'normal';
        this._syncStateAttributes();
        this.requestUpdate();

        if (nextState === 'returning') {
            this._returnTimer = setTimeout(() => {
                if (this.scrollState === 'returning') {
                    this._setScrollState('normal');
                }
            }, this._returnDuration);
        }
    }

    _syncStateAttributes() {
        if (this.isScrolled) {
            this.setAttribute('data-scrolled', '');
        } else {
            this.removeAttribute('data-scrolled');
        }
        this.setAttribute('data-scroll-state', this.scrollState);
        this._syncScrolledHostSurface();
    }

    _syncScrolledHostSurface() {
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        if (this.isScrolled && !isMobile) {
            this.style.setProperty('background', 'var(--wy-controls-container-bg, var(--wy-controls-bar-bg, transparent))');
            this.style.setProperty('backdrop-filter', 'none');
            this.style.setProperty('-webkit-backdrop-filter', 'none');
            this.style.setProperty('position', 'fixed');
            this.style.setProperty('top', 'var(--wy-controls-floating-top, 16px)');
            this.style.setProperty('right', 'var(--wy-controls-floating-right, auto)');
            this.style.setProperty('left', 'var(--wy-controls-floating-left, 50%)');
            this.style.setProperty('z-index', 'var(--wy-controls-floating-z-index, 100)');
            this.style.setProperty('width', 'var(--wy-controls-floating-width, auto)');
            this.style.setProperty('max-width', 'var(--wy-controls-floating-max-width, min(900px, calc(100% - 32px)))');
            this.style.setProperty('margin-inline', '0');
            this.style.setProperty(
                'transform',
                this.scrollState === 'returning'
                    ? 'var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-8px) scale(0.98))'
                    : 'var(--wy-controls-floating-transform, translateX(-50%))'
            );
        } else {
            this.style.removeProperty('background');
            this.style.removeProperty('backdrop-filter');
            this.style.removeProperty('-webkit-backdrop-filter');
            this.style.removeProperty('position');
            this.style.removeProperty('top');
            this.style.removeProperty('right');
            this.style.removeProperty('left');
            this.style.removeProperty('z-index');
            this.style.removeProperty('width');
            this.style.removeProperty('max-width');
            this.style.removeProperty('margin-inline');
            this.style.removeProperty('transform');
        }
    }

    static styles = css`
    /* Required fonts - load in page <head>:
       <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    */

    :host {
      display: block;
      background-color: var(--wy-controls-bar-bg, transparent);
      border-bottom: var(--wy-controls-bar-border, none);
      padding: var(--wy-controls-bar-padding, 8px 32px);
      width: var(--wy-controls-bar-normal-width, 100%);
      max-width: var(--wy-controls-bar-normal-max-width, none);
      margin-inline: var(--wy-controls-bar-normal-margin-inline, 0);
      box-sizing: border-box;
      
      /* Configurable layout properties */
      --wy-controls-padding-desktop: var(--spacing-xl, 32px);
      --wy-controls-padding-tablet: var(--spacing-lg, 24px);
      --wy-controls-padding-mobile: var(--spacing-md, 16px);
      --wy-controls-padding-scrolled: var(--spacing-sm, 8px);
      --wy-controls-container-max-width: 1600px;
      --wy-controls-container-gap: 12px;
      --wy-controls-container-gap-scrolled: 16px;
      --wy-controls-container-padding-desktop: 0 var(--wy-controls-padding-desktop, 32px);
      --wy-controls-container-padding-tablet: 0 var(--wy-controls-padding-tablet, 24px);
      --wy-controls-container-padding-mobile: 0 var(--wy-controls-padding-mobile, 16px);
      --wy-controls-container-margin-inline: auto;
      --wy-controls-container-bg: transparent;
      --wy-controls-container-radius: 0;
      --wy-controls-floating-top: 16px;
      --wy-controls-floating-right: auto;
      --wy-controls-floating-left: 50%;
      --wy-controls-floating-z-index: 100;
      --wy-controls-floating-width: auto;
      --wy-controls-floating-max-width: min(900px, calc(100% - 32px));
      --wy-controls-floating-transform: translateX(-50%);
      --wy-controls-floating-return-transform: translateX(-50%) translateY(-8px) scale(0.98);
      --wy-controls-bar-padding-scrolled: 8px 24px;
      --wy-controls-search-width: 192px;
      --wy-controls-search-width-scrolled: 280px;
      --wy-controls-category-max-width-scrolled: 600px;
    }

    /* Sticky Pill State - when scrolled */
    :host([data-scrolled]) {
      position: fixed;
      top: var(--wy-controls-floating-top, 16px);
      right: var(--wy-controls-floating-right, auto);
      left: var(--wy-controls-floating-left, 50%);
      transform: var(--wy-controls-floating-transform, translateX(-50%));
      z-index: var(--wy-controls-floating-z-index, 100);
      width: var(--wy-controls-floating-width, auto);
      max-width: var(--wy-controls-floating-max-width, min(900px, calc(100% - 32px)));
      background-color: var(--wy-controls-container-bg, var(--wy-controls-bar-bg, color-mix(in srgb, var(--md-sys-color-surface) 60%, transparent)));
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      border-radius: 9999px;
      overflow: visible; /* Ensure pill shape isn't clipped */
      padding: var(--wy-controls-bar-padding-scrolled, 8px 24px);
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
      transition: 
        top var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        transform var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        max-width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        padding var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        background-color var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        box-shadow var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
        opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    :host([data-scroll-state="returning"]) {
      opacity: 0;
      transform: var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-8px) scale(0.98));
      box-shadow: 0 4px 18px 0 rgba(31, 38, 135, 0);
    }

    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-variation-settings:
        'FILL' var(--wy-controls-icon-fill, 0),
        'wght' var(--wy-controls-icon-weight, 300),
        'GRAD' var(--wy-controls-icon-grad, 0),
        'opsz' var(--wy-controls-icon-opsz, 24);
      font-size: var(--wy-controls-icon-size, 24px);
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-block;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      user-select: none;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    .controls-container {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: var(--wy-controls-container-gap, 12px);
      max-width: var(--wy-controls-container-max-width, 1600px);
      margin: 0 var(--wy-controls-container-margin-inline, auto);
      padding: var(--wy-controls-container-padding-desktop, 0 var(--wy-controls-padding-desktop, 32px));
      background-color: var(--wy-controls-container-bg, transparent);
      border-radius: var(--wy-controls-container-radius, 0);
    }

    :host([data-scrolled]) .controls-container {
      gap: var(--wy-controls-container-gap-scrolled, 16px);
      max-width: 100%;
      padding: var(--wy-controls-container-gap-scrolled, 16px);
      border-radius: 9999px; /* Pill shape for scrolled state */
      transition: gap var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1)),
                  padding var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    /* Search Section */
    .search-section {
      flex: 0 0 auto;
      width: var(--wy-controls-search-width, 192px);
      position: relative;
    }

    :host([data-scrolled]) .search-section {
      width: var(--wy-controls-search-width-scrolled, 280px);
      transition: width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    .search-input {
      width: 100%;
      height: 32px;
      background-color: var(--wy-controls-search-bg, var(--md-sys-color-surface));
      border: 1px solid transparent;
      border-radius: 9999px;
      padding: 0 12px 0 36px;
      font-family: var(--font-body, 'DM Sans', sans-serif);
      font-size: 0.75rem;
      color: var(--md-sys-color-on-surface, #1f2937);
      box-sizing: border-box;
      box-shadow: none;
      transition: all 0.2s;
    }

    .search-input::placeholder {
      color: var(--md-sys-color-on-surface-variant, #9ca3af);
      opacity: 0.7;
    }

    .search-input:focus {
      outline: none;
      background-color: var(--wy-controls-search-bg-focus, var(--wy-controls-search-bg, var(--md-sys-color-surface, #fff)));
      border-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: var(--md-sys-color-on-surface-variant, #9ca3af);
      opacity: 0.7;
      pointer-events: none;
    }

    .search-input:focus + .search-icon {
      color: var(--md-sys-color-primary, #282828);
    }

    /* Divider */
    .divider {
      width: 1px;
      height: 24px;
      background-color: var(--rule, var(--md-sys-color-outline-variant, #e5e7eb));
      flex-shrink: 0;
    }

    /* Toggle Section */
    .toggle-section {
      display: flex;
      align-items: center;
      gap: var(--s-4, 16px);
      flex-shrink: 0;
    }

    :host([data-scrolled]) .toggle-section {
      display: none;
    }

    /* View Toggle */
    .view-toggle {
      background-color: var(--wy-controls-toggle-bg, var(--md-sys-color-surface-container-high, #f3f4f6));
      border: 1px solid var(--md-sys-color-outline-variant, transparent);
      border-radius: 0;
      display: flex;
      padding: 2px;
    }

    .view-btn {
      border: none;
      background: transparent;
      height: 28px;
      width: 28px;
      padding: 0;
      border-radius: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--md-sys-color-on-surface-variant, #9ca3af);
      opacity: 0.7;
      transition: all 0.15s;
    }

    .view-btn:hover:not(.active) {
      color: var(--md-sys-color-on-surface, #1f2937);
      opacity: 1;
    }

    .view-btn.active {
      background-color: var(--md-sys-color-surface, #fff);
      color: var(--md-sys-color-primary, #282828);
      opacity: 1;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px var(--md-sys-color-outline-variant, #e5e7eb);
    }

    .view-btn .material-symbols-outlined,
    .view-btn md-icon {
      font-size: 16px;
      --md-icon-size: 16px;
    }

    /* Details Toggle */
    .details-toggle-control {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .details-toggle-control wy-option-toggle {
      width: auto;
    }

    .toggle-label {
      font-family: var(--font-body, 'DM Sans', sans-serif);
      font-size: 9px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--md-sys-color-on-surface-variant, #64748b);
    }

    /* Category Section */
    .category-section {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      flex: 1;
      padding: 2px 0;
      -ms-overflow-style: none;
      scrollbar-width: none;
      mask-image: linear-gradient(to right, black 90%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
    }

    .category-section::-webkit-scrollbar {
      display: none;
    }

    :host([data-scrolled]) .category-section {
      flex: 0 1 auto;
      max-width: var(--wy-controls-category-max-width-scrolled, 600px);
      transition: max-width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    /* ---------- Tablet (901–1023px): compact single row ---------- */
    @media (min-width: 901px) and (max-width: 1023px) {
      :host {
        padding: var(--wy-controls-bar-padding, var(--s-2, 8px) var(--s-5, 24px));
      }

      .controls-container {
        padding: var(--wy-controls-container-padding-tablet, 0 var(--wy-controls-padding-tablet, var(--s-5, 24px)));
        gap: var(--s-2, 8px);
      }

      .search-section {
        width: 160px;
      }

      .toggle-section {
        gap: var(--s-3, 12px);
      }

      .toggle-label {
        display: none;
      }
    }

    /* ---------- Narrow tablet (769–900px): categories wrap to row 2 ---------- */
    @media (min-width: 769px) and (max-width: 900px) {
      :host {
        padding: var(--wy-controls-bar-padding, var(--s-2, 8px) var(--s-5, 24px));
      }

      .controls-container {
        flex-wrap: wrap;
        gap: var(--s-2, 8px) var(--s-1, 4px);
        padding: var(--wy-controls-container-padding-tablet, 0 var(--wy-controls-padding-tablet, var(--s-5, 24px)));
      }

      .search-section {
        flex: 1 1 auto;
        width: auto;
        min-width: 120px;
        max-width: 240px;
      }

      .divider {
        display: none;
      }

      .toggle-label {
        display: none;
      }

      .toggle-section {
        gap: var(--s-2, 8px);
      }

      .category-section {
        flex: 0 0 100%;
        order: 1;
      }
    }

    /* ---------- Mobile (≤768px): stacked, no sticky pill ---------- */
    @media (max-width: 768px) {
      :host([data-scrolled]) {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: 100%;
        max-width: 100%;
        border-radius: 0;
        padding: var(--wy-controls-bar-padding, var(--s-2, 8px) var(--s-6, 32px));
        background-color: var(--wy-controls-bar-bg, transparent);
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
        box-shadow: none;
      }

      .controls-container {
        flex-wrap: wrap;
        gap: var(--s-2, 8px);
        padding: var(--wy-controls-container-padding-mobile, 0 var(--wy-controls-padding-mobile, var(--s-4, 16px)));
      }

      .search-section,
      :host([data-scrolled]) .search-section {
        flex: 0 0 100%;
        width: 100%;
        order: -1;
      }

      :host([data-scrolled]) .search-input {
        height: 32px;
        font-size: 0.75rem;
        background-color: var(--wy-controls-search-bg, var(--md-sys-color-surface-container-high, #f3f4f6));
      }

      .divider,
      :host([data-scrolled]) .divider {
        display: none;
      }

      .toggle-section {
        gap: var(--s-3, 12px);
      }

      :host([data-scrolled]) .toggle-section {
        display: flex;
      }

      .category-section,
      :host([data-scrolled]) .category-section {
        flex: 0 0 100%;
        width: 100%;
        max-width: 100%;
        order: 1;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
      }
    }
  `;

    render() {
        this._syncStateAttributes();

        return html`
      <div class="controls-container" part="controls-container">
        <div class="search-section">
          <input
            type="search"
            class="search-input"
            placeholder="Search prompts..."
            .value="${this.searchValue}"
            @input="${this._handleSearch}"
          >
          <span class="material-symbols-outlined search-icon">search</span>
        </div>

        ${!this.isScrolled && (!this.hideViewToggle || !this.hideDetailsToggle) ? html`
          <div class="divider"></div>

          <div class="toggle-section">
            ${!this.hideViewToggle ? html`
              <div class="view-toggle">
                <button
                  class="view-btn ${this.viewMode === 'list' ? 'active' : ''}"
                  @click="${() => this._setViewMode('list')}"
                  aria-label="List view"
                >
                  <span class="material-symbols-outlined">format_list_bulleted</span>
                </button>
                <button
                  class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}"
                  @click="${() => this._setViewMode('grid')}"
                  aria-label="Grid view"
                >
                  <span class="material-symbols-outlined">grid_view</span>
                </button>
              </div>
            ` : ''}

            ${!this.hideDetailsToggle ? html`
              <div class="details-toggle-control">
                <wy-option-toggle
                  variant="switch"
                  size="compact"
                  aria-label="Descriptions"
                  .options="${['false', 'true']}"
                  .labels="${['Off', 'On']}"
                  .value="${this.showDetails ? 'true' : 'false'}"
                  @change="${this._setDetailsFromToggle}"
                ></wy-option-toggle>
                <span class="toggle-label">Descriptions</span>
              </div>
            ` : ''}
          </div>

          <div class="divider"></div>
        ` : html`
          ${this.isScrolled ? html`<div class="divider"></div>` : ''}
        `}

        <div class="category-section">
          <wy-filter-chip
            variant="${this.chipVariant || 'default'}"
            label="Featured"
            ?active="${this.showFeaturedOnly}"
            @click="${this._toggleFeatured}"
          ></wy-filter-chip>
          <wy-filter-chip
            variant="${this.chipVariant || 'default'}"
            label="All"
            ?active="${this.activeCategory === 'all' && !this.showFeaturedOnly}"
            @click="${() => this._setCategory('all')}"
          ></wy-filter-chip>
          ${this.categories.map(cat => html`
            <wy-filter-chip
              variant="${this.chipVariant || 'default'}"
              label="${cat}"
              ?active="${this.activeCategory === cat && !this.showFeaturedOnly}"
              @click="${() => this._setCategory(cat)}"
            ></wy-filter-chip>
          `)}
        </div>
      </div>
    `;
    }

    _handleSearch(e) {
        this.searchValue = e.target.value;
        this._notifyChange();
    }

    _setViewMode(mode) {
        this.viewMode = mode;
        this._notifyChange();
    }

    _setDetailsFromToggle(event) {
        this.showDetails = event.detail.checked;
        this._notifyChange();
    }

    _setCategory(cat) {
        this.activeCategory = cat;
        // When selecting a category, deactivate Featured filter
        if (this.showFeaturedOnly) {
            this.showFeaturedOnly = false;
        }
        this._notifyChange();
    }

    _toggleFeatured() {
        this.showFeaturedOnly = !this.showFeaturedOnly;
        this._notifyChange();
    }

    _notifyChange() {
        this.dispatchEvent(new CustomEvent('filter-change', {
            detail: {
                search: this.searchValue,
                viewMode: this.viewMode,
                showDetails: this.showDetails,
                category: this.activeCategory,
                showFeaturedOnly: this.showFeaturedOnly
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('wy-controls-bar', WyControlsBar);
