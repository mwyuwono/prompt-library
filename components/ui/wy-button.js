import { LitElement, html } from 'lit';

/**
 * WyButton - A button component following the Weaver-Yuwono Visual Identity Guide v1.0
 * 
 * @element wy-button
 * 
 * @prop {String} variant - Button variant: 'primary' | 'secondary' | 'outlined' | 'text' (default: 'primary')
 * @prop {String} size - Button size: 'large' | 'medium' | 'small' (default: 'medium')
 * @prop {String} icon - Material icon name (optional)
 * @prop {String} iconPosition - Icon position: 'leading' | 'trailing' (default: 'trailing')
 * @prop {Boolean} disabled - Disabled state
 * @prop {Boolean} fullWidth - Full width button
 * 
 * @fires click - Fired when button is clicked (unless disabled)
 * 
 * @csspart button - The button element
 * 
 * @example
 * <wy-button>Request Access</wy-button>
 * <wy-button variant="secondary" icon="north_east">View Portfolio</wy-button>
 * <wy-button variant="outlined" size="large">Legacy Planning</wy-button>
 * <wy-button variant="text">Legal Notice</wy-button>
 */
export class WyButton extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    variant: { type: String },
    size: { type: String },
    icon: { type: String },
    iconPosition: { type: String, attribute: 'icon-position' },
    disabled: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, attribute: 'full-width' },
    label: { type: String }
  };

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'medium';
    this.iconPosition = 'trailing';
    this.disabled = false;
    this.fullWidth = false;
    this.label = '';
    this._capturedLabel = false;
  }

  connectedCallback() {
    // Light DOM replaces the former single text slot with a label property,
    // while preserving existing declarative child text at call sites.
    if (!this._capturedLabel && !this.label) {
      this.label = this.textContent.trim();
      this._capturedLabel = true;
    }
    Array.from(this.childNodes).forEach(node => node.remove());
    super.connectedCallback();
  }

  render() {
    const classes = [
      'button',
      `variant-${this.variant}`,
      `size-${this.size}`
    ].join(' ');

    const iconElement = this.icon
      ? html`<span class="icon">${this.icon}</span>`
      : null;

    return html`
      <button 
        class="${classes}" 
        ?disabled="${this.disabled}"
        @click="${this._handleClick}"
      >
        ${this.iconPosition === 'leading' ? iconElement : null}
        <span class="label">${this.label}</span>
        ${this.iconPosition === 'trailing' ? iconElement : null}
      </button>
    `;
  }

  _handleClick(e) {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

customElements.define('wy-button', WyButton);
