import { LitElement, html, css } from 'lit';

/**
 * WyCopyConfirm - copy confirmation panel with quick-launch links.
 *
 * @element wy-copy-confirm
 * @prop {Boolean} show - Controls visibility.
 * @prop {Number} duration - Auto-dismiss duration in ms.
 * @prop {Array} links - Up to three { name, url } links to render.
 * @prop {String} title - Panel heading.
 *
 * @fires dismiss
 * @fires link-click
 */
export class WyCopyConfirm extends LitElement {
    static properties = {
        show: { type: Boolean, reflect: true },
        duration: { type: Number },
        links: { type: Array },
        title: { type: String }
    };

    constructor() {
        super();
        this.show = false;
        this.duration = 4000;
        this.links = [];
        this.title = 'Copied!';
        this._timer = null;
        this._handleDocumentPointerDown = this._handleDocumentPointerDown.bind(this);
        this._handleDocumentKeyDown = this._handleDocumentKeyDown.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('pointerdown', this._handleDocumentPointerDown);
        document.addEventListener('keydown', this._handleDocumentKeyDown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('pointerdown', this._handleDocumentPointerDown);
        document.removeEventListener('keydown', this._handleDocumentKeyDown);
        this._clearTimer();
    }

    static styles = css`
    :host {
      display: block;
      position: fixed;
      left: 50%;
      width: min(80vw, 420px);
      bottom: calc(32px + env(safe-area-inset-bottom, 0px));
      z-index: 3000;
      pointer-events: none;
      opacity: 0;
      transform: translateX(-50%) translateY(16px) scale(0.98);
      transform-origin: 50% 100%;
      transition:
        transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1),
        opacity 220ms cubic-bezier(0.2, 0.6, 0.2, 1);
      will-change: transform, opacity;
    }

    :host([show]) {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
      pointer-events: auto;
    }

    @media (min-width: 640px) {
      :host {
        width: min(80vw, 420px);
      }
    }

    .container {
      background-color: var(--ink, #1A1A1A);
      color: var(--paper, #F7F4EE);
      padding: 16px;
      border-radius: 8px;
      box-shadow:
        0 18px 48px -12px rgba(13, 13, 13, 0.45),
        0 6px 16px -6px rgba(13, 13, 13, 0.28);
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    .title {
      margin: 0;
      color: var(--paper, #F7F4EE);
      font-family: var(--ff-sans, var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif));
      font-size: 18px;
      font-weight: 600;
      line-height: 1.2;
      letter-spacing: 0.005em;
    }

    .close {
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--paper, #F7F4EE);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      transition: background-color 160ms ease;
    }

    .close:hover {
      background-color: color-mix(in srgb, var(--paper, #F7F4EE) 10%, transparent);
    }

    .close:focus-visible,
    .chip:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--paper, #F7F4EE) 62%, transparent);
      outline-offset: 2px;
    }

    .ms {
      font-family: 'Material Symbols Outlined';
      font-size: 24px;
      font-weight: normal;
      font-style: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      display: inline-flex;
      font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .chips {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .chip {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 52px;
      box-sizing: border-box;
      padding: 14px 18px;
      border: 0;
      border-radius: 999px;
      background-color: color-mix(in srgb, var(--paper, #F7F4EE) 58%, transparent);
      color: var(--ink, #1A1A1A);
      font-family: var(--ff-sans, var(--font-body, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif));
      font-size: 16px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: 0.04em;
      text-decoration: none;
      cursor: pointer;
      transition:
        background-color 160ms ease,
        transform 160ms ease;
    }

    .chip:hover {
      background-color: color-mix(in srgb, var(--paper, #F7F4EE) 72%, transparent);
    }

    .chip:active {
      transform: scale(0.98);
    }

    @media (prefers-reduced-motion: reduce) {
      :host {
        transition: opacity 200ms linear;
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
  `;

    render() {
        const links = (this.links || []).slice(0, 3);

        return html`
      <div class="container" role="dialog" aria-live="polite" aria-labelledby="copyConfirmTitle">
        <div class="header">
          <h3 class="title" id="copyConfirmTitle">${this.title}</h3>
          <button class="close" type="button" @click="${this._dismiss}" aria-label="Close">
            <span class="ms">close</span>
          </button>
        </div>
        <div class="chips">
          ${links.map(link => html`
            <a
              class="chip"
              href="${link.url}"
              target="_blank"
              rel="noopener noreferrer"
              @click="${() => this._onLinkClick(link)}"
            >${link.name}</a>
          `)}
        </div>
      </div>
    `;
    }

    updated(changedProperties) {
        if (changedProperties.has('show')) {
            this._clearTimer();
            if (this.show && this.duration > 0) {
                this._timer = setTimeout(() => this._dismiss(), this.duration);
            }
        }
    }

    _handleDocumentPointerDown(event) {
        if (!this.show || event.composedPath().includes(this)) {
            return;
        }
        this._dismiss();
    }

    _handleDocumentKeyDown(event) {
        if (this.show && event.key === 'Escape') {
            this._dismiss();
        }
    }

    _clearTimer() {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }
    }

    _dismiss() {
        if (!this.show) {
            return;
        }
        this._clearTimer();
        this.show = false;
        this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
    }

    _onLinkClick(link) {
        this.dispatchEvent(new CustomEvent('link-click', {
            detail: { link },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('wy-copy-confirm', WyCopyConfirm);
