import { LitElement, html, css } from 'lit';

/**
 * Toast notification component
 * Adapted from m3-design-v2 for prompts-library
 */
export class WyToast extends LitElement {
    static properties = {
        message: { type: String },
        show: { type: Boolean, reflect: true },
        duration: { type: Number }
    };

    constructor() {
        super();
        this.message = '';
        this.show = false;
        this.duration = 2000; // Match existing toast duration
        this._timer = null;
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
      transition: transform var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-spring),
                  opacity var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-standard);
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
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .icon {
      color: var(--md-sys-color-primary-fixed);
      font-size: 20px;
    }

    .message {
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 500;
    }
  `;

    render() {
        return html`
      <div class="toast-container">
        <span class="message">${this.message}</span>
      </div>
    `;
    }

    updated(changedProperties) {
        if (changedProperties.has('show') && this.show) {
            if (this._timer) clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                this.show = false;
                this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
            }, this.duration);
        }
    }
}

customElements.define('wy-toast', WyToast);
