import { LitElement, html } from 'lit';

/**
 * wy-controls-bar
 *
 * Floating glass pill used at every viewport. On phones it sits at the bottom
 * with an upward category card; above 640px it sits at the top with a downward
 * category menu (see components.css, pill blocks).
 *
 * Events: `filter-change` (detail: search, category, showFeaturedOnly,
 * showHiddenOnly, sortMode, showDetails, viewMode) and `tools-toggle`.
 */
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
    showFeaturedFilter: { type: Boolean, attribute: 'show-featured-filter' },
    showHiddenFilter: { type: Boolean, attribute: 'show-hidden-filter' },
    showFeaturedOnly: { type: Boolean, attribute: 'show-featured-only' },
    showHiddenOnly: { type: Boolean, attribute: 'show-hidden-only' },
    sortMode: { type: String, attribute: 'sort-mode' },
    toolsButton: { type: Boolean, attribute: 'tools-button' },
    toolsOpen: { type: Boolean, attribute: 'tools-open' },
    _mobileSearchOpen: { type: Boolean, state: true },
    _sheetOpen: { type: Boolean, state: true },
  };

  constructor() {
    super();
    this.viewMode = 'grid';
    this.showDetails = false;
    this.activeCategory = 'all';
    this.categories = ['Productivity', 'Expertise', 'Travel & Shopping'];
    this.searchValue = '';
    this.showFeaturedFilter = false;
    this.showHiddenFilter = false;
    this.showFeaturedOnly = false;
    this.showHiddenOnly = false;
    this.sortMode = 'custom';
    this.toolsButton = false;
    this.toolsOpen = false;
    this._mobileSearchOpen = false;
    this._sheetOpen = false;
    this._handleSheetKeydown = this._handleSheetKeydown.bind(this);
    this._handleOutsidePointer = this._handleOutsidePointer.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('data-mobile-bar', '');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleSheetKeydown);
    document.removeEventListener('pointerdown', this._handleOutsidePointer);
  }

  updated(changedProperties) {
    if (changedProperties.has('_mobileSearchOpen')) {
      if (this._mobileSearchOpen) {
        this.setAttribute('data-mobile-search', '');
        this.querySelector('.search-input')?.focus();
      } else {
        this.removeAttribute('data-mobile-search');
      }
    }
    if (changedProperties.has('_sheetOpen')) {
      if (this._sheetOpen) {
        document.addEventListener('keydown', this._handleSheetKeydown);
        document.addEventListener('pointerdown', this._handleOutsidePointer);
        requestAnimationFrame(() => {
          this.querySelector('.m-tile[aria-pressed="true"]')?.focus();
        });
      } else {
        document.removeEventListener('keydown', this._handleSheetKeydown);
        document.removeEventListener('pointerdown', this._handleOutsidePointer);
      }
    }
  }

  _activeFilterLabel() {
    if (this.showFeaturedOnly) return 'Featured';
    if (this.showHiddenOnly) return 'Hidden';
    return this.activeCategory === 'all' ? 'All prompts' : this.activeCategory;
  }

  _mobileFilterOptions() {
    const options = [];
    const noFlag = !this.showFeaturedOnly && !this.showHiddenOnly;
    options.push({ label: 'All', active: this.activeCategory === 'all' && noFlag, select: () => this._setCategory('all') });
    if (this.showFeaturedFilter) {
      options.push({ label: 'Featured', active: this.showFeaturedOnly, select: () => { if (!this.showFeaturedOnly) this._toggleFeatured(); } });
    }
    if (this.showHiddenFilter) {
      options.push({ label: 'Hidden', active: this.showHiddenOnly, select: () => { if (!this.showHiddenOnly) this._toggleHidden(); } });
    }
    this.categories.forEach(cat => {
      options.push({ label: cat, category: true, active: this.activeCategory === cat && noFlag, select: () => this._setCategory(cat) });
    });
    return options;
  }

  _renderMenuTile(option) {
    return html`
      <button
        type="button"
        class="m-tile"
        aria-pressed="${option.active}"
        @click="${() => { option.select(); this._closeSheet(); }}"
      >${option.label}</button>
    `;
  }

  render() {
    const sortLabel = this.sortMode === 'modified' ? 'Date modified' : 'Custom';
    return html`
      ${this._sheetOpen ? html`
        <div class="m-scrim" @click="${this._closeSheet}"></div>
        <div class="m-sheet" id="mobileFilterSheet" role="dialog" aria-modal="true" aria-label="Filter prompts">
          <div class="m-eyebrow">Category</div>
          <div class="m-tiles">
            ${this._mobileFilterOptions().filter(o => !o.category).map(option => this._renderMenuTile(option))}
            <a class="m-tile m-tile-link" href="./private.html" style="text-decoration: none;">Private</a>
            <span class="m-rule" aria-hidden="true"></span>
            ${this._mobileFilterOptions().filter(o => o.category).map(option => this._renderMenuTile(option))}
          </div>
        </div>
      ` : ''}
      <div class="m-bar ${this._mobileSearchOpen ? 'is-searching' : ''}" role="toolbar" aria-label="Browse prompts">
        ${this._mobileSearchOpen ? html`
          <span class="m-icon m-search-icon" aria-hidden="true">search</span>
          <input
            type="search"
            class="search-input m-search-input"
            placeholder="Search prompts…"
            .value="${this.searchValue}"
            @input="${this._handleSearch}"
            @keydown="${this._handleSearchKeydown}"
            aria-label="Search prompts"
            enterkeyhint="search"
          >
          <button type="button" class="m-btn" @click="${this._closeMobileSearch}" aria-label="Close search">
            <span class="m-icon" aria-hidden="true">close</span>
          </button>
        ` : html`
          <a class="m-logo" href="./" aria-label="Prompts home">
            <img src="public/images/prompts-logo.svg" alt="" width="34" height="34">
          </a>
          <button type="button" class="m-btn" @click="${this._openMobileSearch}" aria-label="Search prompts">
            <span class="m-icon" aria-hidden="true">search</span>
          </button>
          <span class="m-divider" aria-hidden="true"></span>
          <button
            type="button"
            class="m-category"
            aria-haspopup="dialog"
            aria-expanded="${this._sheetOpen}"
            aria-controls="mobileFilterSheet"
            @click="${this._toggleSheet}"
          >
            <span class="m-category-label">${this._activeFilterLabel()}</span>
            <span class="m-icon" aria-hidden="true">${this._sheetOpen ? 'expand_more' : 'expand_less'}</span>
          </button>
          <span class="m-divider" aria-hidden="true"></span>
          <button
            type="button"
            class="m-btn"
            aria-label="Order by date modified"
            aria-pressed="${this.sortMode === 'modified'}"
            title="Order: ${sortLabel}"
            @click="${() => this._applySortMode(this.sortMode === 'modified' ? 'custom' : 'modified')}"
          >
            <span class="m-icon" aria-hidden="true">swap_vert</span>
          </button>
          ${this.toolsButton ? html`
            <button
              type="button"
              class="m-btn"
              aria-label="AI tools"
              aria-haspopup="dialog"
              aria-expanded="${this.toolsOpen}"
              @click="${this._toggleTools}"
            >
              ${this.toolsOpen ? html`<span class="m-icon" aria-hidden="true">close</span>` : html`
                <svg class="m-dots" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><circle cx="6" cy="6" r="1.7"/><circle cx="12" cy="6" r="1.7"/><circle cx="18" cy="6" r="1.7"/><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/><circle cx="6" cy="18" r="1.7"/><circle cx="12" cy="18" r="1.7"/><circle cx="18" cy="18" r="1.7"/></svg>
              `}
            </button>
          ` : ''}
        `}
      </div>
    `;
  }

  _toggleSheet() {
    if (!this._sheetOpen && this.toolsOpen) this._dispatchToolsToggle();
    this._sheetOpen = !this._sheetOpen;
  }

  _closeSheet() {
    if (!this._sheetOpen) return;
    this._sheetOpen = false;
    requestAnimationFrame(() => this.querySelector('.m-category')?.focus());
  }

  _handleSheetKeydown(e) {
    if (e.key === 'Escape' && this._sheetOpen) {
      e.preventDefault();
      this._closeSheet();
    }
  }

  _handleOutsidePointer(e) {
    if (!this._sheetOpen || e.composedPath().includes(this)) return;
    this._sheetOpen = false;
  }

  _toggleTools() {
    if (this._sheetOpen) this._sheetOpen = false;
    this._dispatchToolsToggle();
  }

  _dispatchToolsToggle() {
    this.dispatchEvent(new CustomEvent('tools-toggle', { bubbles: true, composed: true }));
  }

  _openMobileSearch() {
    this._sheetOpen = false;
    if (this.toolsOpen) this._dispatchToolsToggle();
    this._mobileSearchOpen = true;
  }

  /** Public: expand the pill into search (used by the Ctrl/Cmd+K shortcut). */
  openSearch() {
    this._openMobileSearch();
  }

  _handleSearchKeydown(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      this._closeMobileSearch();
    } else if (e.key === 'Enter') {
      e.target.blur();
    }
  }

  _applySortMode(mode) {
    this.sortMode = mode === 'modified' ? 'modified' : 'custom';
    this._notifyChange();
  }

  _handleSearch(e) {
    this.searchValue = e.target.value;
    this._notifyChange();
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
        showHiddenOnly: this.showHiddenOnly,
        sortMode: this.sortMode
      },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('wy-controls-bar', WyControlsBar);
