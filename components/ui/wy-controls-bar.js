import { LitElement, html } from 'lit';

export class WyControlsBar extends LitElement {
  createRenderRoot() {
    return this;
  }

    static properties = {
        viewMode: { type: String, attribute: 'view-mode' },
        showDetails: { type: Boolean, attribute: 'show-details' },
        activeCategory: { type: String, attribute: 'active-category' },
        categories: { type: Array },
        searchValue: { type: String, attribute: 'search-value' },
        hideViewToggle: { type: Boolean, attribute: 'hide-view-toggle' },
        hideDetailsToggle: { type: Boolean, attribute: 'hide-details-toggle' },
        showFeaturedFilter: { type: Boolean, attribute: 'show-featured-filter' },
        showHiddenFilter: { type: Boolean, attribute: 'show-hidden-filter' },
        showFeaturedOnly: { type: Boolean, attribute: 'show-featured-only' },
        showHiddenOnly: { type: Boolean, attribute: 'show-hidden-only' },
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
        this.showFeaturedFilter = false;
        this.showHiddenFilter = false;
        this.showFeaturedOnly = false;
        this.showHiddenOnly = false;
        this.chipVariant = '';
        this.isScrolled = false;
        this.scrollState = 'normal';
        this._mobileSearchOpen = false;
        this._scrollEnterThreshold = 64;
        this._scrollExitThreshold = 12;
        this._minScrollableDistance = 96;
        this._returnDuration = 160;
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

    _bindChipsTrackScroll() {
        const track = this.querySelector('.chips-track');
        if (!track || this._boundChipsTrack === track) return;
        this._boundChipsTrack = track;
        track.addEventListener('scroll', () => {
            track.classList.toggle('is-chips-scrolled', track.scrollLeft > 0);
        }, { passive: true });
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
                    ? 'var(--wy-controls-floating-return-transform, translateX(-50%) translateY(-4px) scale(0.995))'
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

    updated(changedProperties) {
        if (changedProperties.has('_mobileSearchOpen')) {
            if (this._mobileSearchOpen) {
                this.setAttribute('data-mobile-search', '');
                // Focus the input after animation
                setTimeout(() => {
                    this.querySelector('.search-input')?.focus();
                }, 260);
            } else {
                this.removeAttribute('data-mobile-search');
            }
        }
        this._bindChipsTrackScroll();
    }

    render() {
        this._syncStateAttributes();
        const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
        const showToggles = !this.isScrolled && (!this.hideViewToggle || !this.hideDetailsToggle);

        return html`
      <div class="controls-container">

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
            ${this.showFeaturedFilter ? html`
              <button
                class="chip chip--featured ${this.showFeaturedOnly ? 'active' : ''}"
                aria-pressed="${this.showFeaturedOnly}"
                @click="${this._toggleFeatured}"
              >Featured</button>
            ` : ''}
            ${this.showHiddenFilter ? html`
              <button
                class="chip chip--hidden ${this.showHiddenOnly ? 'active' : ''}"
                aria-pressed="${this.showHiddenOnly}"
                @click="${this._toggleHidden}"
              >Hidden</button>
            ` : ''}
            <button
              class="chip ${this.activeCategory === 'all' && !this.showFeaturedOnly && !this.showHiddenOnly ? 'active' : ''}"
              aria-pressed="${this.activeCategory === 'all' && !this.showFeaturedOnly && !this.showHiddenOnly}"
              @click="${() => this._setCategory('all')}"
            >All</button>
            ${this.categories.map(cat => html`
              <button
                class="chip ${this.activeCategory === cat && !this.showFeaturedOnly && !this.showHiddenOnly ? 'active' : ''}"
                aria-pressed="${this.activeCategory === cat && !this.showFeaturedOnly && !this.showHiddenOnly}"
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
        this.querySelector('.search-input')?.focus();
    }

    dismissSearch({ clear = false } = {}) {
        const searchInput = this.querySelector('.search-input');
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
        if (this.showHiddenOnly) this.showHiddenOnly = false;
        this._notifyChange();
    }

    _toggleFeatured() {
        this.showFeaturedOnly = !this.showFeaturedOnly;
        if (this.showFeaturedOnly) this.showHiddenOnly = false;
        this._notifyChange();
    }

    _toggleHidden() {
        this.showHiddenOnly = !this.showHiddenOnly;
        if (this.showHiddenOnly) this.showFeaturedOnly = false;
        this._notifyChange();
    }

    _notifyChange() {
        this.dispatchEvent(new CustomEvent('filter-change', {
            detail: {
                search: this.searchValue,
                viewMode: this.viewMode,
                showDetails: this.showDetails,
                category: this.activeCategory,
                showFeaturedOnly: this.showFeaturedOnly,
                showHiddenOnly: this.showHiddenOnly
            },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('wy-controls-bar', WyControlsBar);
