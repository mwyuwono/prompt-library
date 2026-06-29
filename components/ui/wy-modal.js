import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export class WyModal extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { type: String },
    maxWidth: { type: String, attribute: 'max-width' },
    fullScreen: { type: Boolean, attribute: 'full-screen' },
    bodyHtml: { type: String, attribute: false }
  };

  constructor() {
    super();
    this.open = false;
    this.heading = '';
    this.maxWidth = '560px';
    this.fullScreen = false;
    this.bodyHtml = '';
    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  connectedCallback() {
    // Capture body/action children before Lit replaces the light-DOM contents.
    this._captureModalNodes();
    super.connectedCallback();
    document.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeyDown);
  }

  render() {
    if (!this.open) return html``;

    return html`
      <div class="modal-overlay" @click="${this._handleOverlayClick}">
        <div
          class="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wyModalHeading"
          style="--wy-modal-max-width: ${this.maxWidth}"
        >
          <h2 class="headline-text" id="wyModalHeading">${this.heading}</h2>
          <form method="dialog" class="modal-content">${this.bodyHtml ? unsafeHTML(this.bodyHtml) : ''}</form>
          <div class="footer-actions"></div>
        </div>
      </div>
    `;
  }

  willUpdate(changedProperties) {
    if (changedProperties.has('open') && this.open) {
      this._captureModalNodes();
    }
  }

  firstUpdated() {
    this._projectModalNodes();
  }

  updated() {
    this._projectModalNodes();
  }

  _projectModalNodes() {
    const body = this.querySelector('.modal-content');
    const actions = this.querySelector('.footer-actions');
    if (!this.bodyHtml && body && !body.childNodes.length && this._bodyNodes?.length) body.append(...this._bodyNodes);
    if (actions && !actions.childNodes.length && this._actionNodes?.length) actions.append(...this._actionNodes);
  }

  _captureModalNodes() {
    const children = Array.from(this.childNodes).filter(node => {
      if (node.nodeType === Node.COMMENT_NODE) return false;
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return false;
      return !(node.nodeType === Node.ELEMENT_NODE && node.classList.contains('modal-overlay'));
    });
    if (!children.length) return;
    this._actionNodes = children.filter(node =>
      node.nodeType === Node.ELEMENT_NODE && node.getAttribute('slot') === 'actions'
    );
    this._bodyNodes = children.filter(node =>
      !(node.nodeType === Node.ELEMENT_NODE && node.getAttribute('slot') === 'actions')
    );
    this._actionNodes.forEach(node => node.removeAttribute('slot'));
    children.forEach(node => node.remove());
  }

  show() {
    this.open = true;
  }

  close() {
    this.open = false;
  }

  _handleClose(e) {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', {
      detail: e?.detail,
      bubbles: true,
      composed: true
    }));
  }

  _handleOverlayClick(e) {
    if (e.target === e.currentTarget) this._handleClose(e);
  }

  _handleKeyDown(e) {
    if (e.key === 'Escape' && this.open) this._handleClose(e);
  }
}

customElements.define('wy-modal', WyModal);
