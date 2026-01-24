import { LitElement, html, css } from 'lit';

/**
 * Filter chip component for category filtering
 * Adapted from m3-design-v2 with single-select behavior for prompts-library
 */
export class WyFilterChip extends LitElement {
    static properties = {
        label: { type: String },
        value: { type: String },
        active: { type: Boolean, reflect: true },
        count: { type: Number }
    };

    static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-family: var(--font-serif);
      font-size: 0.75rem;
      font-weight: 400;
      line-height: 1.5;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: transparent;
      color: rgba(255, 255, 255, 0.6);
      user-select: none;
      white-space: nowrap;
    }

    :host(:hover) {
      color: rgba(255, 255, 255, 1);
      border-color: rgba(255, 255, 255, 0.4);
      background-color: rgba(255, 255, 255, 0.05);
    }

    :host(:focus-visible) {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
    }

    :host([active]) {
      background-color: #E8F5E9;
      color: #2C4C3B;
      border-color: transparent;
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .count {
      opacity: 0.6;
      font-size: 0.75rem;
    }

    :host([active]) .count {
      opacity: 0.8;
    }
  `;

    render() {
        return html`
      <span>${this.label}</span>
      ${this.count !== undefined ? html`<span class="count">(${this.count})</span>` : ''}
    `;
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('click', this._handleClick);
    }

    _handleClick() {
        // Emit change event with value (for single-select behavior)
        // Parent will manage active state
        this.dispatchEvent(new CustomEvent('chip-select', {
            detail: { value: this.value, label: this.label },
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('wy-filter-chip', WyFilterChip);
