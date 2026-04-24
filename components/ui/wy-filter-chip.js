import { LitElement, html, css } from 'lit';

export class WyFilterChip extends LitElement {
    static properties = {
        label: { type: String },
        active: { type: Boolean, reflect: true },
        count: { type: Number },
        variant: { type: String, reflect: true }
    };

    static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: var(--wy-filter-chip-padding, 5px 13px);
      min-height: var(--wy-filter-chip-min-height, 28px);
      box-sizing: border-box;
      border-radius: 9999px;
      font-family: var(--wy-filter-chip-font-family, var(--font-sans, 'DM Sans', sans-serif));
      font-size: var(--wy-filter-chip-font-size, 11px);
      font-weight: var(--wy-filter-chip-font-weight, 500);
      cursor: pointer;
      transition:
        background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard),
        color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard),
        transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard);
      
      /* Opaque background by default; overridden by variant */
      background-color: var(--wy-filter-chip-bg, var(--md-sys-color-surface));
      border: 0;
      color: var(--wy-filter-chip-text, var(--md-sys-color-on-surface));
      box-shadow: none;
      
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }

    :host(:hover:not([active])) {
      background-color: var(--wy-filter-chip-hover-bg, color-mix(in srgb, var(--wy-button-primary-bg, var(--md-sys-color-primary)) 15%, transparent));
    }

    :host(:focus-visible) {
      outline: 2px solid var(--wy-filter-chip-focus, var(--md-sys-color-primary, #282828));
      outline-offset: 2px;
    }

    :host([active]) {
      background-color: var(--wy-filter-chip-active-bg, var(--md-sys-color-primary, #282828));
      color: var(--wy-filter-chip-active-fg, var(--md-sys-color-on-primary, #FFFFFF));
      border-color: transparent;
      font-weight: var(--wy-filter-chip-font-weight-active, 500);
      box-shadow: none;
    }

    /* Soft variant: no border, Surface Variant background */
    :host([variant="soft"]) {
      background-color: var(--wy-filter-chip-soft-bg, var(--md-sys-color-surface-variant));
      border: none;
      border-width: 0;
    }

    .count {
      opacity: 0.7;
      font-size: 10px;
    }

    :host([active]) .count {
      opacity: 0.85;
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
