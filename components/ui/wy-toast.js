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
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%) translateY(calc(100% + 32px)) scale(0.96);
      z-index: 3000;
      pointer-events: none;
      transition:
        transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 220ms ease;
      opacity: 0;
    }

    :host([show]) {
      transform: translateX(-50%) translateY(0) scale(1);
      opacity: 1;
      pointer-events: auto;
    }

    @supports not (backdrop-filter: blur(1px)) {
      .toast-container {
        background: rgba(26, 26, 26, 0.92);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: opacity 180ms ease;
        transform: translateX(-50%) translateY(0) scale(1);
      }
      :host([show]) {
        opacity: 1;
      }
    }

    .toast-container {
      background: rgba(26, 26, 26, 0.62);
      backdrop-filter: blur(20px) saturate(140%);
      -webkit-backdrop-filter: blur(20px) saturate(140%);
      color: rgba(247, 244, 238, 0.96);
      padding: 12px 20px;
      border-radius: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow:
        0 0 0 1px rgba(247, 244, 238, 0.12),
        inset 0 1px 0 rgba(247, 244, 238, 0.08),
        0 4px 16px rgba(0, 0, 0, 0.32),
        0 1px 4px rgba(0, 0, 0, 0.24);
      max-width: calc(100vw - 32px);
    }

    .toast-container.has-actions {
      width: min(420px, calc(100vw - 32px));
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      gap: 16px 12px;
      padding: 16px;
    }

    .icon {
      font-family: 'Material Symbols Outlined';
      font-size: 18px;
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
      flex-shrink: 0;
    }

    .icon.variant-success {
      color: rgba(247, 244, 238, 0.72);
    }

    .icon.variant-info {
      color: rgba(247, 244, 238, 0.72);
    }

    .icon.variant-error {
      color: #E89B7E;
    }

    .icon.variant-warning {
      color: #D9C28A;
    }

    .message {
      font-family: 'Inter', var(--font-body, sans-serif);
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1.4;
      color: rgba(247, 244, 238, 0.96);
    }

    .toast-container.has-actions .icon.variant-success {
      display: none;
    }

    .toast-container.has-actions .message {
      grid-column: 1;
      grid-row: 1;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.3;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toast-container.has-actions .actions {
      grid-column: 1 / -1;
      grid-row: 2;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      width: 100%;
    }

    .action {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 36px;
      padding: 0 14px;
      border-radius: 0;
      background: rgba(247, 244, 238, 0.12);
      color: rgba(247, 244, 238, 0.96);
      font-family: 'Inter', var(--font-body, sans-serif);
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1;
      text-decoration: none;
      white-space: nowrap;
      border: 1px solid rgba(247, 244, 238, 0.16);
    }

    .toast-container.has-actions .action {
      min-height: 40px;
      padding: 0 14px;
      font-size: 0.8125rem;
      font-weight: 600;
      min-width: 0;
    }

    .action:focus-visible {
      outline: 2px solid rgba(247, 244, 238, 0.72);
      outline-offset: 2px;
    }

    .dismiss {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: rgba(247, 244, 238, 0.6);
      cursor: pointer;
      font: inherit;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .dismiss:hover {
      color: rgba(247, 244, 238, 0.96);
    }

    .dismiss .icon {
      font-size: 18px;
    }

    .toast-container.has-actions .dismiss {
      grid-column: 2;
      grid-row: 1;
      align-self: start;
      justify-self: end;
      width: 28px;
      height: 28px;
      transform: translate(4px, -4px);
    }

    .dismiss:focus-visible {
      outline: 2px solid rgba(247, 244, 238, 0.72);
      outline-offset: 2px;
    }

    @media (max-width: 480px) {
      .toast-container {
        width: calc(100vw - 32px);
        flex-wrap: wrap;
        justify-content: center;
        padding: 14px 16px;
      }

      .actions {
        order: 3;
        width: 100%;
        justify-content: center;
      }

      .toast-container.has-actions {
        width: calc(100vw - 32px);
        grid-template-columns: 1fr auto;
        gap: 16px 12px;
        padding: 16px;
        justify-content: initial;
      }

      .toast-container.has-actions .actions {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .toast-container.has-actions .action {
        min-height: 44px;
      }

      .toast-container.has-actions .dismiss {
        width: 28px;
        height: 28px;
        transform: translate(4px, -4px);
      }
    }
  `;

    render() {
        const hasActions = Boolean(this.actions?.length);

        return html`
      <div class="toast-container ${hasActions ? 'has-actions' : ''}">
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
