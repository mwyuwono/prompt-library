import { LitElement, html, css } from 'lit';

/**
 * WyToast - A toast notification component with variant support
 *
 * @element wy-toast
 *
 * @prop {String} message - The message to display
 * @prop {Boolean} show - Controls visibility (reflects to attribute)
 * @prop {Number} duration - Auto-dismiss duration in ms (default: 3000)
 * @prop {String} variant - Toast variant: 'success' | 'error' | 'warning' | 'info' (default: 'success')
 * @prop {Array} actions - Optional action links: [{ label, href }]
 * @prop {Boolean} dismissible - Whether to show a dismiss button
 *
 * @fires dismiss - Fired when toast is dismissed (auto or manual)
 *
 * @example
 * <wy-toast message="Successfully saved!" variant="success"></wy-toast>
 * <wy-toast message="Failed to save" variant="error"></wy-toast>
 */
export class WyToast extends LitElement {
    static properties = {
        message: { type: String },
        show: { type: Boolean, reflect: true },
        duration: { type: Number },
        variant: { type: String },
        actions: { type: Array },
        dismissible: { type: Boolean }
    };

    constructor() {
        super();
        this.message = '';
        this.show = false;
        this.duration = 3000;
        this.variant = 'success';
        this.actions = [];
        this.dismissible = false;
        this._timer = null;
    }

    /**
     * Get the icon name based on variant
     */
    get _icon() {
        switch (this.variant) {
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'check_circle';
        }
    }

    static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      z-index: 3000;
      pointer-events: none;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s;
      opacity: 0;
    }

    :host([show]) {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    .toast-container {
      background-color: var(--md-sys-color-inverse-surface);
      color: var(--md-sys-color-inverse-on-surface);
      padding: 12px 24px;
      border-radius: 0;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: var(--shadow-modal);
      max-width: calc(100vw - 32px);
    }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 20px;
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

    /* Variant-specific icon colors */
    .icon.variant-success {
      color: var(--wy-toast-success-color, var(--md-sys-color-primary));
    }

    .icon.variant-error {
      color: var(--wy-toast-error-color, #FF0101);
    }

    .icon.variant-warning {
      color: var(--wy-toast-warning-color, var(--md-sys-color-secondary));
    }

    .icon.variant-info {
      color: var(--wy-toast-info-color, var(--md-sys-color-secondary));
    }

    .message {
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 0 16px;
      border-radius: var(--radius-pill, 999px);
      background-color: var(--md-sys-color-inverse-on-surface);
      color: var(--md-sys-color-inverse-surface);
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1;
      text-decoration: none;
      white-space: nowrap;
    }

    .dismiss {
      width: 32px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: var(--radius-pill, 999px);
      background: transparent;
      color: currentColor;
      cursor: pointer;
      font: inherit;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .dismiss .icon {
      font-size: 20px;
    }

    .action:focus-visible,
    .dismiss:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      .toast-container {
        width: min(100%, 480px);
        flex-wrap: wrap;
        justify-content: center;
        padding: 16px;
      }

      .actions {
        order: 3;
        width: 100%;
        justify-content: center;
      }
    }
  `;

    render() {
        return html`
      <div class="toast-container">
        <span class="icon variant-${this.variant}">${this._icon}</span>
        <span class="message">${this.message}</span>
        ${this.actions?.length ? html`
          <div class="actions">
            ${this.actions.map(action => html`
              <a class="action" href="${action.href}" target="_blank" rel="noopener noreferrer">${action.label}</a>
            `)}
          </div>
        ` : ''}
        ${this.dismissible ? html`
          <button class="dismiss" type="button" @click="${this._dismiss}" aria-label="Dismiss notification">
            <span class="icon">close</span>
          </button>
        ` : ''}
      </div>
    `;
    }

    _dismiss() {
        if (this._timer) clearTimeout(this._timer);
        this.show = false;
        this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
    }

    updated(changedProperties) {
        if (changedProperties.has('show') && this.show) {
            if (this._timer) clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this._dismiss();
            }, this.duration);
        }
    }
}

customElements.define('wy-toast', WyToast);
