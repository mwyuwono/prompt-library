import { LitElement, html, css } from 'lit';

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
  static properties = {
    variant: { type: String },
    size: { type: String },
    icon: { type: String },
    iconPosition: { type: String, attribute: 'icon-position' },
    disabled: { type: Boolean, reflect: true },
    fullWidth: { type: Boolean, attribute: 'full-width' }
  };

  static styles = css`
    /* Fonts are loaded globally via HTML link tags - no @import needed in Shadow DOM */

    :host {
      display: inline-block;
    }

    :host([full-width]) {
      display: block;
      width: 100%;
    }

    :host([full-width]) .button {
      width: 100%;
      justify-content: center;
    }

    :host([disabled]) {
      pointer-events: none;
    }

    .button {
      position: relative;
      overflow: hidden;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      border: none;
      cursor: pointer;
      text-decoration: none;
      font-family: var(--font-sans);
      font-weight: var(--wy-button-font-weight, 500);
      border-radius: var(--radius-0);
      transition: 
        transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
        box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard),
        background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
    }

    /* State layer for hover/focus/pressed */
    .button::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
      pointer-events: none;
      border-radius: inherit;
    }

    /* Focus visible outline */
    .button:focus-visible {
      outline: 3px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    /* ===== SIZE VARIANTS ===== */
    
    /* Large: 56px height */
    .button.size-large {
      height: 56px;
      padding: 16px 40px;
      font-size: 1rem;
    }

    .button.size-large .icon {
      font-size: 18px;
    }

    /* Medium: 44px height (default) */
    .button.size-medium {
      height: 44px;
      padding: 10px 32px;
      font-size: 0.875rem;
    }

    .button.size-medium .icon {
      font-size: 16px;
    }

    /* Small: 32px height */
    .button.size-small {
      height: 32px;
      padding: 6px 20px;
      font-size: 0.75rem;
    }

    .button.size-small .icon {
      font-size: 14px;
    }

    /* ===== PRIMARY VARIANT (Filled Hunter Green) ===== */
    .button.variant-primary {
      background-color: var(--wy-button-primary-bg);
      color: var(--wy-button-primary-fg);
    }

    .button.variant-primary::before {
      background-color: var(--wy-button-primary-fg);
    }

    .button.variant-primary:hover:not(:disabled) {
      background-color: var(--wy-button-primary-hover-bg);
      box-shadow: var(--wy-button-primary-shadow-hover);
      
    }

    .button.variant-primary:hover:not(:disabled)::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .button.variant-primary:active:not(:disabled) {
      transform: translateY(0);
    }

    .button.variant-primary:active:not(:disabled)::before {
      opacity: var(--md-sys-state-pressed-opacity);
    }

    /* ===== SECONDARY VARIANT (Tonal - Warm Clay / Serif) ===== */
    .button.variant-secondary {
      background-color: var(--wy-button-secondary-bg);
      color: var(--wy-button-secondary-fg);
      /* font-family: var(--font-serif); Removed in favor of sans-serif */
    }

    .button.variant-secondary::before {
      background-color: var(--md-sys-color-primary);
    }

    .button.variant-secondary:hover:not(:disabled) {
      background-color: var(--wy-button-secondary-hover-bg);
    }

    .button.variant-secondary:hover:not(:disabled)::before {
      opacity: var(--md-sys-state-hover-opacity);
    }

    .button.variant-secondary:active:not(:disabled)::before {
      opacity: var(--md-sys-state-pressed-opacity);
    }

    /* ===== OUTLINED VARIANT (Editorial) ===== */
    .button.variant-outlined {
      background-color: var(--wy-button-outlined-bg);
      color: var(--wy-button-outlined-fg);
      border: 1px solid var(--wy-button-outlined-border);
      /* font-family: var(--font-serif); Removed in favor of sans-serif */
    }

    .button.variant-outlined::before {
      background-color: var(--wy-button-secondary-bg);
    }

    .button.variant-outlined:hover:not(:disabled) {
      background-color: var(--wy-button-outlined-hover-bg);
    }

    .button.variant-outlined:hover:not(:disabled)::before {
      opacity: 0.3;
    }

    .button.variant-outlined:active:not(:disabled)::before {
      opacity: 0.5;
    }

    /* ===== TEXT VARIANT (Utility - ALL CAPS) ===== */
    .button.variant-text {
      background-color: transparent;
      color: var(--wy-button-text-fg);
      text-transform: uppercase;
      letter-spacing: var(--wy-button-tracking-architectural);
      font-weight: 700;
      font-size: 0.75rem;
    }

    .button.variant-text::before {
      background-color: var(--md-sys-color-primary);
    }

    .button.variant-text.muted {
      color: var(--wy-button-text-fg-muted);
    }

    .button.variant-text:hover:not(:disabled) {
      background-color: var(--wy-button-text-hover-bg);
      color: var(--wy-button-text-fg);
    }

    .button.variant-text:hover:not(:disabled)::before {
      opacity: 0;
    }

    /* Text variant with leading indicator dot */
    .button.variant-text .indicator-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: color-mix(in srgb, currentColor 30%, transparent);
    }

    /* ===== DISABLED STATE ===== */
    .button:disabled {
      opacity: var(--md-sys-state-disabled-opacity);
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    /* ===== ICON STYLING ===== */
    .icon {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
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

    /* Content wrapper for proper ordering */
    .content {
      display: contents;
    }
  `;

  constructor() {
    super();
    this.variant = 'primary';
    this.size = 'medium';
    this.iconPosition = 'trailing';
    this.disabled = false;
    this.fullWidth = false;
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
        part="button"
        ?disabled="${this.disabled}"
        @click="${this._handleClick}"
      >
        ${this.iconPosition === 'leading' ? iconElement : null}
        <span class="label"><slot></slot></span>
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
