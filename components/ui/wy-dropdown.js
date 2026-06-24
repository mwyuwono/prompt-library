import { LitElement, html, nothing } from 'lit';

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


    // Light DOM: styles live in admin.css (scoped under this element tag).
    createRenderRoot() {
        return this;
    }

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
