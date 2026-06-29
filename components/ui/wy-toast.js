import { LitElement, html } from 'lit';

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
  createRenderRoot() {
    return this;
  }

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
