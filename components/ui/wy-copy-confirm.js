import { LitElement, html } from 'lit';

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
  createRenderRoot() {
    return this;
  }

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
