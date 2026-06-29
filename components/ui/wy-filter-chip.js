import { LitElement, html } from 'lit';

export class WyFilterChip extends LitElement {
  createRenderRoot() {
    return this;
  }

    static properties = {
        label: { type: String },
        active: { type: Boolean, reflect: true },
        count: { type: Number },
        variant: { type: String, reflect: true }
    };

    render() {
        return html`
      <span>${this.label}</span>
      ${this.count !== undefined ? html`<span class="count">(${this.count})</span>` : ''}
    `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.setAttribute('role', 'button');
        this.setAttribute('tabindex', '0');
        this.addEventListener('keydown', this._handleKeydown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('keydown', this._handleKeydown);
    }

    _handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
    }
}

customElements.define('wy-filter-chip', WyFilterChip);
