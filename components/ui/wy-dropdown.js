import { LitElement, html, css, nothing } from 'lit';

/**
 * Universal dropdown component with capsule button design
 * Replaces wy-category-select with new visual design matching variants-selector reference
 * 
 * @property {String} label - Optional label text (displayed uppercase above dropdown)
 * @property {String} value - Selected value
 * @property {Array} options - Array of {value, label} objects
 * @property {String} placeholder - Placeholder text when no value selected
 * @property {Boolean} searchable - Enable filtering (not implemented in this version)
 * @property {Boolean} disabled - Disable the dropdown
 * 
 * @fires change - Fired when selection changes, event.detail.value contains new value
 */
export class WyDropdown extends LitElement {
    static properties = {
        label: { type: String },
        value: { type: String },
        options: { type: Array },
        placeholder: { type: String },
        searchable: { type: Boolean },
        disabled: { type: Boolean },
        variant: { type: String },
        _showDropdown: { type: Boolean, state: true },
        _focusedIndex: { type: Number, state: true }
    };

    constructor() {
        super();
        this.label = '';
        this.value = '';
        this.options = [];
        this.placeholder = 'Select option...';
        this.searchable = false;
        this.disabled = false;
        this.variant = 'default';
        this._showDropdown = false;
        this._focusedIndex = -1;
    }

    static styles = css`
        /* Note: Fonts (DM Sans, Material Symbols) should be loaded in consuming page <head> */
        
        :host {
            display: block;
            /* Fallback values for component-specific tokens */
            --wy-dropdown-label-color: #71717A;
            --wy-dropdown-text-color: #52525B;
            --wy-dropdown-icon-color: #52525B;
            --wy-dropdown-bg: var(--md-sys-color-surface-container-lowest, #FDFBF7);
            --wy-dropdown-border: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-border-hover: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-menu-bg: var(--md-sys-color-surface-container-high, #EBE5DE);
            --wy-dropdown-item-hover-bg: var(--md-sys-color-surface-container-high, #EBE5DE);
        }
        
        /* Subtle variant - lighter backgrounds for modal integration */
        :host([variant="subtle"]) {
            --wy-dropdown-bg: var(--md-sys-color-surface-container-low, #FDFBF7);  /* Button bg - lighter than modal */
            --wy-dropdown-border: var(--md-sys-color-outline-variant, #D7D3C8);
            --wy-dropdown-menu-bg: var(--md-sys-color-surface-container-low, #FDFBF7);  /* Menu bg */
            --wy-dropdown-item-hover-bg: var(--md-sys-color-surface-container, #F5F2EA);  /* Item hover */
        }
        
        /* Material Symbols font configuration */
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
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }
        
        .container {
            position: relative;
            display: flex;
            flex-direction: column;
        }
        
        .label {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--wy-dropdown-label-color);
            margin-bottom: var(--spacing-sm, 8px);
            margin-left: var(--spacing-xs, 4px);
        }
        
        .selector {
            position: relative;
            overflow: hidden;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
            background-color: var(--wy-dropdown-bg);
            border: 1px solid var(--wy-dropdown-border);
            border-radius: var(--md-sys-shape-corner-medium, 12px);
            cursor: pointer;
            transition: border-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            text-align: left;
        }
        
        .selector:disabled {
            cursor: not-allowed;
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
        }
        
        /* MD3 State Layer for hover */
        .selector::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
            border-radius: inherit;
        }
        
        .selector:hover:not(:disabled) {
            border-color: var(--wy-dropdown-border-hover);
        }
        
        .selector:hover:not(:disabled)::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }
        
        .selector:focus-visible {
            outline: 3px solid var(--md-sys-color-primary, #282828);
            outline-offset: 2px;
        }
        
        .selector:active:not(:disabled)::before {
            opacity: var(--md-sys-state-pressed-opacity, 0.12);
        }
        
        .value {
            flex: 1;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--wy-dropdown-text-color);
            position: relative;
            z-index: 1;
        }
        
        .value.placeholder {
            opacity: 0.6;
        }
        
        .icon {
            color: var(--wy-dropdown-icon-color);
            transition: color var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                        transform var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            position: relative;
            z-index: 1;
            margin-left: var(--spacing-sm, 8px);
        }
        
        .selector:hover:not(:disabled) .icon {
            color: var(--wy-dropdown-text-color);
        }
        
        .selector.open .icon {
            transform: rotate(180deg);
        }
        
        .dropdown {
            position: absolute;
            top: calc(100% + var(--spacing-xs, 4px));
            left: 0;
            right: 0;
            background-color: var(--wy-dropdown-menu-bg);
            border: 1px solid var(--md-sys-color-outline-variant, #D7D3C8);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            z-index: 100;
            overflow: hidden;
            max-height: 240px;
            overflow-y: auto;
            margin-top: var(--spacing-sm, 8px);
        }
        
        .item {
            position: relative;
            overflow: hidden;
            padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--wy-dropdown-text-color);
            cursor: pointer;
            transition: background-color var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        /* State layer for menu items */
        .item::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }
        
        .item:hover::before,
        .item.focused::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }
        
        .item.selected {
            color: var(--md-sys-color-primary, #282828);
            font-weight: 600;
            background-color: var(--md-sys-color-primary-container, #E8F5E9);
        }
        
        .item.selected::before {
            background-color: var(--md-sys-color-primary, #282828);
        }
        
        .no-results {
            padding: var(--spacing-md, 16px) var(--spacing-lg, 24px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface-variant, #49454E);
            opacity: 0.6;
            font-style: italic;
            text-align: center;
        }
        
        /* Scrollbar styling */
        .dropdown::-webkit-scrollbar {
            width: 8px;
        }
        
        .dropdown::-webkit-scrollbar-track {
            background: transparent;
        }
        
        .dropdown::-webkit-scrollbar-thumb {
            background: var(--md-sys-color-outline-variant, #D7D3C8);
            border-radius: var(--radius-1);
        }
        
        .dropdown::-webkit-scrollbar-thumb:hover {
            background: var(--md-sys-color-outline, #2d4e3c);
        }
    `;

    render() {
        const selectedOption = this.options.find(opt => opt.value === this.value);
        const displayValue = selectedOption ? selectedOption.label : this.placeholder;
        const isPlaceholder = !selectedOption;

        return html`
            <div class="container">
                ${this.label ? html`<div class="label">${this.label}</div>` : nothing}
                <button 
                    class="selector ${this._showDropdown ? 'open' : ''}"
                    @click="${this._toggleDropdown}"
                    @blur="${this._handleBlur}"
                    @keydown="${this._handleKeyDown}"
                    ?disabled="${this.disabled}"
                    aria-haspopup="listbox"
                    aria-expanded="${this._showDropdown}"
                >
                    <span class="value ${isPlaceholder ? 'placeholder' : ''}">${displayValue}</span>
                    <span class="material-symbols-outlined icon">expand_more</span>
                </button>
                ${this._showDropdown ? html`
                    <div class="dropdown" role="listbox">
                        ${this.options.length > 0 ? this.options.map((option, i) => html`
                            <div 
                                class="item ${option.value === this.value ? 'selected' : ''} ${i === this._focusedIndex ? 'focused' : ''}"
                                role="option"
                                aria-selected="${option.value === this.value}"
                                @mousedown="${(e) => { e.preventDefault(); this._select(option.value); }}"
                                @mouseenter="${() => this._focusedIndex = i}"
                            >
                                ${option.label}
                            </div>
                        `) : html`<div class="no-results">No options available</div>`}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    _toggleDropdown() {
        if (!this.disabled) {
            this._showDropdown = !this._showDropdown;
            this._focusedIndex = this.options.findIndex(opt => opt.value === this.value);
        }
    }

    _handleBlur() {
        // Delay to allow mousedown on menu items to fire first
        setTimeout(() => {
            this._showDropdown = false;
        }, 150);
    }

    _handleKeyDown(e) {
        if (this.disabled) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!this._showDropdown) {
                this._showDropdown = true;
                this._focusedIndex = this.options.findIndex(opt => opt.value === this.value);
            } else {
                this._focusedIndex = Math.min(this._focusedIndex + 1, this.options.length - 1);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this._showDropdown) {
                this._focusedIndex = Math.max(this._focusedIndex - 1, 0);
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!this._showDropdown) {
                this._showDropdown = true;
                this._focusedIndex = this.options.findIndex(opt => opt.value === this.value);
            } else if (this._focusedIndex >= 0 && this.options[this._focusedIndex]) {
                this._select(this.options[this._focusedIndex].value);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this._showDropdown = false;
            this.renderRoot.querySelector('.selector')?.blur();
        } else if (e.key === 'Home') {
            e.preventDefault();
            if (this._showDropdown) {
                this._focusedIndex = 0;
            }
        } else if (e.key === 'End') {
            e.preventDefault();
            if (this._showDropdown) {
                this._focusedIndex = this.options.length - 1;
            }
        }
    }

    _select(value) {
        if (this.value !== value) {
            this.value = value;
            this.dispatchEvent(new CustomEvent('change', { 
                detail: { value },
                bubbles: true,
                composed: true
            }));
        }
        this._showDropdown = false;
    }
}

customElements.define('wy-dropdown', WyDropdown);
