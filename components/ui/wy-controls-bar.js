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
        scrollState: { type: String, state: true },
        _mobileSearchOpen: { type: Boolean, state: true },
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
        this._mobileSearchOpen = false;
        this._scrollEnterThreshold = 64;
        this._scrollExitThreshold = 12;
        this._minScrollableDistance = 96;
        this._returnDuration = 300;
        this._scrollFrame = 0;
        this._returnTimer = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        this._handleScroll = this._handleScroll.bind(this);
        this._handleViewportChange = this._handleViewportChange.bind(this);
        window.addEventListener('resize', this._handleViewportChange, { passive: true });
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
        this._removeScrollListener();
        this._scrollContainer = this._findScrollableContainer();
        if (this._scrollContainer === window) {
            window.addEventListener('scroll', this._handleScroll, { passive: true });
        } else if (this._scrollContainer) {
            this._scrollContainer.addEventListener('scroll', this._handleScroll, { passive: true });
        }
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
        const promptArea = document.querySelector('.prompt-area');
        if (promptArea) {
            const style = window.getComputedStyle(promptArea);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') return promptArea;
        }
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const style = window.getComputedStyle(mainContent);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') return mainContent;
        }
        const siblings = this.parentElement?.querySelectorAll('[class*="scroll"], [class*="area"]');
        if (siblings) {
            for (const sibling of siblings) {
                const style = window.getComputedStyle(sibling);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') return sibling;
            }
        }
        let element = this.parentElement;
        while (element && element !== document.body) {
            const style = window.getComputedStyle(element);
            if (style.overflowY === 'auto' || style.overflowY === 'scroll') return element;
            element = element.parentElement;
        }
        const bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.overflowY === 'auto' || bodyStyle.overflowY === 'scroll') return document.body;
        return window;
    }

    _getScrollMetrics() {
        let rawScrollY = 0;
        let maxScroll = 0;
        if (this._scrollContainer === window) {
            const documentElement = document.documentElement;
            const body = document.body;
            rawScrollY = window.scrollY || documentElement.scrollTop || body.scrollTop || 0;
            maxScroll = Math.max(0, Math.max(documentElement.scrollHeight, body.scrollHeight) - window.innerHeight);
        } else {
            rawScrollY = this._scrollContainer ? this._scrollContainer.scrollTop : 0;
            maxScroll = this._scrollContainer
                ? Math.max(0, this._scrollContainer.scrollHeight - this._scrollContainer.clientHeight)
                : 0;
        }
        return { scrollY: Math.min(Math.max(rawScrollY, 0), maxScroll), maxScroll };
    }

    _handleScroll() {
        if (this._scrollFrame) return;
        this._scrollFrame = requestAnimationFrame(() => {
            this._scrollFrame = 0;
            this._updateScrollState();
        });
    }

    _updateScrollState() {
        const { scrollY, maxScroll } = this._getScrollMetrics();
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        const canFloat = !isMobile && maxScroll >= this._minScrollableDistance;
        if (!canFloat) { this._setScrollState('normal'); return; }
        if (this.scrollState === 'normal' || this.scrollState === 'returning') {
            if (scrollY >= this._scrollEnterThreshold) this._setScrollState('floating');
            return;
        }
        if (this.scrollState === 'floating' && scrollY <= this._scrollExitThreshold) {
            this._setScrollState('returning');
        }
    }

    _setScrollState(nextState) {
        if (this.scrollState === nextState) return;
        clearTimeout(this._returnTimer);
        this.scrollState = nextState;
        this.isScrolled = nextState !== 'normal';
        this._syncStateAttributes();
        this.requestUpdate();
        if (nextState === 'returning') {
            this._returnTimer = setTimeout(() => {
                if (this.scrollState === 'returning') this._setScrollState('normal');
            }, this._returnDuration);
        }
    }

    _syncStateAttributes() {
        if (this.isScrolled) this.setAttribute('data-scrolled', '');
        else this.removeAttribute('data-scrolled');
        this.setAttribute('data-scroll-state', this.scrollState);
        this._syncScrolledHostSurface();
    }

    _syncScrolledHostSurface() {
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        if (this.isScrolled && !isMobile) {
            this.style.setProperty('background', 'var(--paper, #FFFAF5)');
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
    :host {
      display: block;
      background-color: transparent;
      padding: var(--s-3, 12px) var(--s-7, 32px);
      width: 100%;
      box-sizing: border-box;
      position: relative;

      --wy-controls-floating-top: 16px;
      --wy-controls-floating-right: auto;
      --wy-controls-floating-left: 50%;
      --wy-controls-floating-z-index: 100;
      --wy-controls-floating-width: auto;
      --wy-controls-floating-max-width: min(900px, calc(100% - 32px));
      --wy-controls-radius: var(--radius-pill, 999px);
    }

    /* Bottom hairline */
    :host::after {
      content: '';
      position: absolute;
      left: var(--s-7, 32px);
      right: var(--s-7, 32px);
      bottom: 0;
      height: 1px;
      background: var(--paper-edge, #E8E2DA);
    }

    :host([data-scrolled]) {
      position: fixed;
      top: var(--wy-controls-floating-top, 16px);
      left: var(--wy-controls-floating-left, 50%);
      transform: var(--wy-controls-floating-transform, translateX(-50%));
      z-index: var(--wy-controls-floating-z-index, 100);
      width: var(--wy-controls-floating-width, auto);
      max-width: var(--wy-controls-floating-max-width, min(900px, calc(100% - 32px)));
      background: var(--paper, #F7F4EE);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      padding: var(--s-2, 8px) var(--s-5, 24px);
      box-shadow: 0 12px 40px rgba(26, 26, 26, 0.08);
      transition:
        top 300ms cubic-bezier(0.2, 0, 0, 1),
        transform 300ms cubic-bezier(0.2, 0, 0, 1),
        padding 300ms cubic-bezier(0.2, 0, 0, 1),
        box-shadow 300ms cubic-bezier(0.2, 0, 0, 1),
        opacity 200ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host([data-scrolled])::after {
      display: none;
    }

    :host([data-scroll-state="returning"]) {
      opacity: 0;
      transform: var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-8px) scale(0.98));
      box-shadow: none;
    }

    /* ---- Controls container ---- */
    .controls-container {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: var(--s-5, 24px);
      max-width: 1600px;
      margin: 0 auto;
    }

    :host([data-scrolled]) .controls-container {
      gap: var(--s-4, 16px);
      max-width: 100%;
    }

    /* ---- Search ---- */
    .search-section {
      flex: 0 0 auto;
      width: 260px;
      position: relative;
      transition: width 250ms cubic-bezier(0.2, 0, 0, 1);
    }

    :host([data-scrolled]) .search-section {
      width: 280px;
    }

    .search-input {
      width: 100%;
      height: 36px;
      padding: 0 var(--s-4, 16px) 0 40px;
      background: transparent;
      color: var(--ink, #1A1A1A);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 13px;
      font-weight: 400;
      outline: none;
      box-sizing: border-box;
      transition:
        background 150ms cubic-bezier(0.2, 0, 0, 1),
        border-color 150ms cubic-bezier(0.2, 0, 0, 1),
        box-shadow 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .search-input::placeholder {
      color: var(--ink-mute, #868685);
      font-weight: 300;
    }

    .search-input:hover {
      border-color: var(--ink-soft, #A8A49C);
    }

    .search-input:focus {
      background: transparent;
      border-color: var(--ink, #1A1A1A);
      box-shadow: none;
    }

    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 18px;
      line-height: 1;
      color: var(--ink-mute, #868685);
      pointer-events: none;
      user-select: none;
      transition: color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .search-section:focus-within .search-icon {
      color: var(--ink, #282828);
    }

    .search-clear {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 22px;
      height: 22px;
      display: none;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--ink-mute, #868685);
      cursor: pointer;
      padding: 0;
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 16px;
      line-height: 1;
      transition: background 150ms cubic-bezier(0.2, 0, 0, 1), color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .search-clear:hover {
      background: color-mix(in srgb, var(--ink, #282828) 8%, transparent);
      color: var(--ink, #282828);
    }

    .search-section.has-value .search-clear {
      display: flex;
    }

    /* ---- Divider ---- */
    .divider {
      width: 1px;
      height: 20px;
      background: var(--paper-edge, #E8E2DA);
      flex-shrink: 0;
    }

    /* ---- Toggles ---- */
    .toggle-section {
      display: flex;
      align-items: center;
      gap: var(--s-5, 24px);
      flex-shrink: 0;
    }

    :host([data-scrolled]) .toggle-section {
      display: none;
    }

    /* View toggle pill */
    .view-toggle {
      display: inline-flex;
      align-items: center;
      background: transparent;
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      padding: 2px;
      height: 32px;
      box-sizing: border-box;
    }

    .view-btn {
      width: 26px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      border-radius: var(--wy-controls-radius, 999px);
      color: var(--ink-mute, #868685);
      cursor: pointer;
      padding: 0;
      font-family: 'Material Symbols Outlined';
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
      font-size: 16px;
      line-height: 1;
      transition: background 150ms cubic-bezier(0.2, 0, 0, 1), color 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .view-btn:hover {
      color: var(--ink, #282828);
    }

    .view-btn.active {
      background: var(--ink, #1A1A1A);
      color: var(--paper, #F7F4EE);
      box-shadow: none;
    }

    /* Details toggle (custom checkbox) */
    .details-toggle-control {
      display: inline-flex;
      align-items: center;
      gap: var(--s-2, 8px);
      cursor: pointer;
      user-select: none;
    }

    .details-toggle-control input[type="checkbox"] {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .toggle-track {
      width: 28px;
      height: 16px;
      background: var(--paper-edge, #E8E2DA);
      border-radius: 9999px;
      position: relative;
      flex-shrink: 0;
      transition: background 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .toggle-thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 12px;
      height: 12px;
      background: var(--white, #fff);
      border-radius: 50%;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
      transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .details-toggle-control.is-on .toggle-track {
      background: var(--ink, #282828);
    }

    .details-toggle-control.is-on .toggle-thumb {
      transform: translateX(12px);
    }

    .toggle-label {
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--ink-mute, #868685);
      white-space: nowrap;
    }

    /* ---- Category chips ---- */
    .category-section {
      flex: 1 1 auto;
      min-width: 0;
      position: relative;
    }

    .chips-track {
      display: flex;
      align-items: center;
      gap: var(--s-2, 8px);
      overflow-x: auto;
      padding: 2px 24px 2px 0;
      scroll-behavior: smooth;
      scrollbar-width: none;
      -ms-overflow-style: none;
      -webkit-overflow-scrolling: touch;
      -webkit-mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
      mask-image: linear-gradient(to right, black calc(100% - 28px), transparent 100%);
    }

    .chips-track::-webkit-scrollbar {
      display: none;
    }

    :host([data-scrolled]) .category-section {
      flex: 0 1 auto;
      max-width: 600px;
      transition: max-width 300ms cubic-bezier(0.2, 0, 0, 1);
    }

    .chip {
      flex-shrink: 0;
      height: 28px;
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      color: var(--ink-mute, #6B6B6A);
      border: 1px solid var(--paper-edge, #DDD6C8);
      border-radius: var(--wy-controls-radius, 999px);
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      white-space: nowrap;
      cursor: pointer;
      transition:
        color 150ms cubic-bezier(0.2, 0, 0, 1),
        background 150ms cubic-bezier(0.2, 0, 0, 1),
        border-color 150ms cubic-bezier(0.2, 0, 0, 1),
        transform 150ms cubic-bezier(0.2, 0, 0, 1);
    }

    .chip:hover {
      color: var(--ink, #282828);
      border-color: color-mix(in srgb, var(--ink, #282828) 25%, var(--paper-edge, #E8E2DA));
      background: color-mix(in srgb, var(--ink, #282828) 3%, transparent);
    }

    .chip:active {
      transform: scale(0.98);
    }

    .chip.active {
      background: var(--ink, #282828);
      color: var(--paper, #FFFAF5);
      border-color: var(--ink, #282828);
    }

    .chip.active:hover {
      background: color-mix(in srgb, var(--ink, #282828) 92%, var(--paper, #FFFAF5));
    }

    /* Featured dot marker */
    .chip--featured::before {
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      opacity: 0.9;
      flex-shrink: 0;
    }

    /* ---- Mobile cancel button ---- */
    .mobile-cancel {
      flex: 0 0 auto;
      display: none;
      height: 36px;
      padding: 0 var(--s-2, 8px);
      background: transparent;
      border: none;
      font-family: var(--ff-sans, 'Inter', system-ui, sans-serif);
      font-size: 13px;
      font-weight: 500;
      color: var(--ink, #282828);
      cursor: pointer;
    }

    /* ---- Mobile (≤768px) ---- */
    @media (max-width: 768px) {
      :host {
        padding: var(--s-3, 12px) var(--s-4, 16px);
      }

      :host::after {
        left: var(--s-4, 16px);
        right: var(--s-4, 16px);
      }

      :host([data-scrolled]) {
        position: relative;
        top: auto;
        left: auto;
        transform: none;
        width: 100%;
        max-width: 100%;
        border-radius: 0;
        padding: var(--s-3, 12px) var(--s-4, 16px);
        background: transparent;
        box-shadow: none;
      }

      :host([data-scrolled])::after {
        display: block;
        left: var(--s-4, 16px);
        right: var(--s-4, 16px);
      }

      .controls-container {
        gap: var(--s-3, 12px);
      }

      .divider,
      .toggle-section {
        display: none;
      }

      /* Collapsed: search is an icon button */
      .search-section {
        flex: 0 0 auto;
        width: 36px;
        transition:
          width 250ms cubic-bezier(0.2, 0, 0, 1),
          flex 250ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-input {
        width: 36px;
        height: 36px;
        padding: 0;
        background: transparent;
        color: transparent;
        border-radius: var(--wy-controls-radius, 999px);
        font-size: 16px;
        cursor: pointer;
        transition:
          width 250ms cubic-bezier(0.2, 0, 0, 1),
          padding 250ms cubic-bezier(0.2, 0, 0, 1),
          background 250ms cubic-bezier(0.2, 0, 0, 1),
          color 150ms cubic-bezier(0.2, 0, 0, 1) 100ms,
          border-radius 250ms cubic-bezier(0.2, 0, 0, 1),
          border-color 150ms cubic-bezier(0.2, 0, 0, 1),
          box-shadow 150ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-input::placeholder {
        color: transparent;
        transition: color 150ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-icon {
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--ink, #282828);
        transition:
          left 250ms cubic-bezier(0.2, 0, 0, 1),
          transform 250ms cubic-bezier(0.2, 0, 0, 1),
          color 150ms cubic-bezier(0.2, 0, 0, 1);
      }

      .search-clear {
        display: none !important;
      }

      /* Category section: flex fills remaining space */
      .category-section {
        flex: 1 1 auto;
        min-width: 0;
        transition:
          opacity 250ms cubic-bezier(0.2, 0, 0, 1),
          transform 250ms cubic-bezier(0.2, 0, 0, 1),
          max-width 250ms cubic-bezier(0.2, 0, 0, 1);
      }

      /* Search open state */
      :host([data-mobile-search]) .search-section {
        flex: 1 1 auto;
        width: auto;
      }

      :host([data-mobile-search]) .search-input {
        width: 100%;
        padding: 0 var(--s-4, 16px) 0 40px;
        background: transparent;
        color: var(--ink, #1A1A1A);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--wy-controls-radius, 999px);
        cursor: text;
      }

      :host([data-mobile-search]) .search-input::placeholder {
        color: var(--ink-mute, #868685);
      }

      :host([data-mobile-search]) .search-icon {
        left: 14px;
        transform: translate(0, -50%);
        color: var(--ink-mute, #868685);
      }

      :host([data-mobile-search]) .search-section.has-value .search-clear {
        display: flex !important;
      }

      :host([data-mobile-search]) .category-section {
        opacity: 0;
        max-width: 0;
        transform: translateX(12px);
        pointer-events: none;
        overflow: hidden;
      }

      :host([data-mobile-search]) .mobile-cancel {
        display: inline-flex;
        align-items: center;
      }
    }

    /* ---- Tablet narrow (769–900px) ---- */
    @media (min-width: 769px) and (max-width: 900px) {
      .controls-container {
        flex-wrap: wrap;
        gap: var(--s-2, 8px) var(--s-1, 4px);
      }

      .search-section {
        flex: 1 1 auto;
        width: auto;
        min-width: 120px;
        max-width: 240px;
      }

      .divider { display: none; }

      .toggle-label { display: none; }

      .toggle-section { gap: var(--s-2, 8px); }

      .category-section {
        flex: 0 0 100%;
        order: 1;
      }
    }

    /* ---- Tablet (901–1023px) ---- */
    @media (min-width: 901px) and (max-width: 1023px) {
      :host {
        padding: var(--s-2, 8px) var(--s-5, 24px);
      }

      .controls-container {
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
  `;

    updated(changedProperties) {
        if (changedProperties.has('_mobileSearchOpen')) {
            if (this._mobileSearchOpen) {
                this.setAttribute('data-mobile-search', '');
                // Focus the input after animation
                setTimeout(() => {
                    this.shadowRoot?.querySelector('.search-input')?.focus();
                }, 260);
            } else {
                this.removeAttribute('data-mobile-search');
            }
        }
    }

    render() {
        this._syncStateAttributes();
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        const showToggles = !this.isScrolled && (!this.hideViewToggle || !this.hideDetailsToggle);

        return html`
      <div class="controls-container" part="controls-container">

        <div class="search-section ${this.searchValue ? 'has-value' : ''}">
          <input
            type="search"
            class="search-input"
            placeholder="Search prompts…"
            .value="${this.searchValue}"
            @input="${this._handleSearch}"
            @focus="${this._handleSearchFocus}"
            @click="${this._handleSearchFocus}"
            aria-label="Search prompts"
          >
          <span class="search-icon" aria-hidden="true">search</span>
          <button
            class="search-clear"
            @click="${this._clearSearch}"
            aria-label="Clear search"
            tabindex="${this.searchValue ? '0' : '-1'}"
          >close</button>
        </div>

        ${showToggles ? html`
          <div class="divider"></div>
          <div class="toggle-section">
            ${!this.hideViewToggle ? html`
              <div class="view-toggle" role="group" aria-label="View mode">
                <button
                  class="view-btn ${this.viewMode === 'list' ? 'active' : ''}"
                  @click="${() => this._setViewMode('list')}"
                  aria-label="List view"
                  aria-pressed="${this.viewMode === 'list'}"
                >format_list_bulleted</button>
                <button
                  class="view-btn ${this.viewMode === 'grid' ? 'active' : ''}"
                  @click="${() => this._setViewMode('grid')}"
                  aria-label="Grid view"
                  aria-pressed="${this.viewMode === 'grid'}"
                >grid_view</button>
              </div>
            ` : ''}
            ${!this.hideDetailsToggle ? html`
              <label
                class="details-toggle-control ${this.showDetails ? 'is-on' : ''}"
                @click="${this._toggleDetails}"
              >
                <input
                  type="checkbox"
                  ?checked="${this.showDetails}"
                  tabindex="0"
                  aria-label="Show descriptions"
                >
                <span class="toggle-track">
                  <span class="toggle-thumb"></span>
                </span>
                <span class="toggle-label">Descriptions</span>
              </label>
            ` : ''}
          </div>
          <div class="divider"></div>
        ` : this.isScrolled ? html`<div class="divider"></div>` : ''}

        <div class="category-section">
          <div class="chips-track" role="tablist">
            <button
              class="chip chip--featured ${this.showFeaturedOnly ? 'active' : ''}"
              aria-pressed="${this.showFeaturedOnly}"
              @click="${this._toggleFeatured}"
            >Featured</button>
            <button
              class="chip ${this.activeCategory === 'all' && !this.showFeaturedOnly ? 'active' : ''}"
              aria-pressed="${this.activeCategory === 'all' && !this.showFeaturedOnly}"
              @click="${() => this._setCategory('all')}"
            >All</button>
            ${this.categories.map(cat => html`
              <button
                class="chip ${this.activeCategory === cat && !this.showFeaturedOnly ? 'active' : ''}"
                aria-pressed="${this.activeCategory === cat && !this.showFeaturedOnly}"
                @click="${() => this._setCategory(cat)}"
              >${cat}</button>
            `)}
          </div>
        </div>

        <button
          class="mobile-cancel"
          @click="${this._closeMobileSearch}"
          aria-label="Close search"
        >Cancel</button>

      </div>
    `;
    }

    _handleSearch(e) {
        this.searchValue = e.target.value;
        this._notifyChange();
    }

    _handleSearchFocus() {
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        if (isMobile && !this._mobileSearchOpen) {
            this._mobileSearchOpen = true;
        }
    }

    _clearSearch() {
        this.searchValue = '';
        this._notifyChange();
        this.shadowRoot?.querySelector('.search-input')?.focus();
    }

    dismissSearch({ clear = false } = {}) {
        const searchInput = this.shadowRoot?.querySelector('.search-input');
        if (clear) {
            this.searchValue = '';
            this._notifyChange();
        }
        this._mobileSearchOpen = false;
        searchInput?.blur();
    }

    _closeMobileSearch() {
        this.dismissSearch({ clear: true });
    }

    _setViewMode(mode) {
        this.viewMode = mode;
        this._notifyChange();
    }

    _toggleDetails(e) {
        e.preventDefault();
        this.showDetails = !this.showDetails;
        this._notifyChange();
    }

    _setCategory(cat) {
        this.activeCategory = cat;
        if (this.showFeaturedOnly) this.showFeaturedOnly = false;
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
