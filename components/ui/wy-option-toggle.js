import { LitElement, html } from 'lit';

export class WyOptionToggle extends LitElement {
    static properties = {
        options: { type: Array },
        labels: { type: Array },
        valueDescriptions: { type: Array },
        value: { type: String },
        checked: { type: Boolean, reflect: true },
        label: { type: String },
        description: { type: String },
        disabled: { type: Boolean, reflect: true },
        variant: { type: String, reflect: true },
        size: { type: String, reflect: true },
        showSelectedValueText: { type: Boolean, attribute: 'show-selected-value-text' },
        ariaLabel: { type: String, attribute: 'aria-label' }
    };

    constructor() {
        super();
        this.options = null;
        this.labels = null;
        this.valueDescriptions = null;
        this.value = '';
        this.checked = false;
        this.label = '';
        this.description = '';
        this.disabled = false;
        this.variant = 'segmented';
        this.size = 'default';
        this.showSelectedValueText = false;
        this.ariaLabel = '';
    }


    // Light DOM: styles live in admin.css (scoped under this element tag).
    createRenderRoot() {
        return this;
    }

    willUpdate(changedProperties) {
        if (!this._hasValidOptions()) {
            this.checked = false;
            return;
        }

        if (changedProperties.has('value') || changedProperties.has('options')) {
            const nextChecked = this.value === this.options[1];
            if (this.checked !== nextChecked) {
                this.checked = nextChecked;
            }
        } else if (changedProperties.has('checked')) {
            const nextValue = this.checked ? this.options[1] : this.options[0];
            if (this.value !== nextValue) {
                this.value = nextValue;
            }
        }
    }

    _hasValidOptions() {
        return Array.isArray(this.options) && this.options.length === 2;
    }

    _getDisplayLabel(index) {
        if (Array.isArray(this.labels) && this.labels.length === 2 && this.labels[index]) {
            return this.labels[index];
        }

        if (this._hasValidOptions() && this.options[index] !== '') {
            return this.options[index];
        }

        return index === 0 ? 'Off' : 'On';
    }

    _getSelectedIndex() {
        return this.checked ? 1 : 0;
    }

    _getSelectedValue() {
        if (!this._hasValidOptions()) return '';
        return this.options[this._getSelectedIndex()] ?? '';
    }

    _getSelectedDescription() {
        const index = this._getSelectedIndex();
        if (Array.isArray(this.valueDescriptions) && this.valueDescriptions.length === 2 && this.valueDescriptions[index]) {
            return this.valueDescriptions[index];
        }
        const selectedValue = this._getSelectedValue();
        if (selectedValue) return selectedValue;
        return 'No additional prompt instruction will be added.';
    }

    _getA11yLabel() {
        return this.ariaLabel || this.label || 'Option toggle';
    }

    _select(index) {
        if (this.disabled || !this._hasValidOptions()) return;
        if (index !== 0 && index !== 1) return;

        const nextChecked = index === 1;
        const nextValue = this.options[index];
        const didChange = this.checked !== nextChecked || this.value !== nextValue;

        this.checked = nextChecked;
        this.value = nextValue;

        if (didChange) {
            this.dispatchEvent(new CustomEvent('change', {
                detail: { checked: this.checked, value: this.value },
                bubbles: true,
                composed: true
            }));
        }
    }

    _handleKeyDown(event, index) {
        if (this.disabled) return;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            this._select(1);
            this.renderRoot.querySelector('[data-index="1"]')?.focus();
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this._select(0);
            this.renderRoot.querySelector('[data-index="0"]')?.focus();
            return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this._select(index);
        }
    }

    _handleSwitchKeyDown(event) {
        if (this.disabled) return;

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            this._select(1);
            return;
        }

        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            this._select(0);
            return;
        }

        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            this._select(this.checked ? 0 : 1);
        }
    }

    render() {
        const hasValidOptions = this._hasValidOptions();
        const selectedIndex = this._getSelectedIndex();
        const ariaLabel = this._getA11yLabel();
        const showSelectedValueText = this.showSelectedValueText && hasValidOptions;

        return html`
            ${this.variant === 'switch' ? html`
                <div class="switch-row">
                    <div class="switch-copy">
                        ${this.label ? html`<p class="label">${this.label}</p>` : ''}
                        ${this.description ? html`<p class="description">${this.description}</p>` : ''}
                    </div>
                    <div class="switch-control">
                        <span class="switch-state">${this._getDisplayLabel(selectedIndex)}</span>
                        <button
                            type="button"
                            class="switch-button ${this.checked ? 'checked' : ''}"
                            role="switch"
                            aria-checked="${this.checked}"
                            aria-label="${ariaLabel}"
                            ?disabled="${this.disabled || !hasValidOptions}"
                            @click="${() => this._select(this.checked ? 0 : 1)}"
                            @keydown="${(event) => this._handleSwitchKeyDown(event)}"
                        >
                            <span class="switch-thumb"></span>
                        </button>
                    </div>
                </div>
            ` : html`
                ${this.label ? html`<p class="label">${this.label}</p>` : ''}
                ${this.description ? html`<p class="description">${this.description}</p>` : ''}
                <div class="group" role="group" aria-label="${ariaLabel}">
                    ${[0, 1].map((index) => html`
                        <button
                            type="button"
                            class="option ${selectedIndex === index ? 'selected' : ''}"
                            data-index="${index}"
                            aria-pressed="${selectedIndex === index}"
                            tabindex="${selectedIndex === index ? '0' : '-1'}"
                            ?disabled="${this.disabled || !hasValidOptions}"
                            @click="${() => this._select(index)}"
                            @keydown="${(event) => this._handleKeyDown(event, index)}"
                        >
                            ${this._getDisplayLabel(index)}
                        </button>
                    `)}
                </div>
            `}
            ${showSelectedValueText ? html`
                <p class="selected-value-text">${this._getSelectedDescription()}</p>
            ` : ''}
        `;
    }
}

customElements.define('wy-option-toggle', WyOptionToggle);
