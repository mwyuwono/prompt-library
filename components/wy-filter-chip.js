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
      padding: var(--wy-filter-chip-padding, 0.25rem 0.75rem);
      border-radius: 9999px;
      font-family: var(--wy-filter-chip-font-family, var(--font-serif));
      font-size: var(--wy-filter-chip-font-size, 0.75rem);
      font-weight: var(--wy-filter-chip-font-weight, 400);
      line-height: 1.5;
      font-style: var(--wy-filter-chip-font-style, italic);
      cursor: pointer;
      transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
      border: 1px solid var(--wy-filter-chip-border, var(--md-sys-color-outline-variant));
      background-color: transparent;
      color: var(--wy-filter-chip-text, var(--md-sys-color-on-background));
      user-select: none;
      white-space: nowrap;
    }

    :host(:hover) {
      color: var(--wy-filter-chip-text-hover, var(--wy-filter-chip-text, var(--md-sys-color-on-background)));
      border-color: var(--wy-filter-chip-border-hover, var(--md-sys-color-outline));
      background-color: var(--wy-filter-chip-hover-bg, var(--md-sys-color-surface-variant));
    }

    :host(:focus-visible) {
      outline: 2px solid var(--wy-filter-chip-focus, var(--md-sys-color-primary));
      outline-offset: 2px;
    }

    :host([active]) {
      background-color: var(--wy-filter-chip-active-bg, var(--md-sys-color-primary));
      color: var(--wy-filter-chip-active-fg, var(--md-sys-color-on-primary));
      border-color: transparent;
      font-weight: var(--wy-filter-chip-font-weight-active, 500);
      box-shadow: var(--wy-filter-chip-shadow, none);
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
