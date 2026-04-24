import { LitElement, html, css } from 'lit';

export class WyFormField extends LitElement {
    static properties = {
        label: { type: String },
        id: { type: String },
        description: { type: String },
        error: { type: String },
        required: { type: Boolean }
    };

    static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 24px;
      width: 100%;
    }

    .label-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    label {
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--md-sys-color-on-surface-variant);
    }

    .required-mark {
      color: var(--err);
      margin-left: 2px;
    }

    .description {
      font-family: var(--font-body);
      font-size: 0.8125rem;
      color: var(--md-sys-color-on-surface-variant);
      opacity: 0.7;
      margin-bottom: 4px;
    }

    .error {
      font-family: var(--font-body);
      font-size: 0.75rem;
      color: var(--err);
      margin-top: 4px;
    }

    ::slotted(input),
    ::slotted(textarea),
    ::slotted(select) {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      border-radius: 0;
      border: 1px solid var(--md-sys-color-outline-variant);
      background-color: var(--md-sys-color-surface-container-lowest);
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--md-sys-color-on-surface);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    ::slotted(input:focus),
    ::slotted(textarea:focus),
    ::slotted(select:focus) {
      outline: none;
      border-color: var(--md-sys-color-primary);
      box-shadow: 0 0 0 1px var(--ink);
    }

    ::slotted([aria-invalid="true"]) {
      border-color: var(--err);
    }
  `;

    render() {
        return html`
      <div class="label-container">
        ${this.label ? html`<label for="${this.id}">${this.label}${this.required ? html`<span class="required-mark">*</span>` : ''}</label>` : ''}
      </div>
      ${this.description ? html`<div class="description">${this.description}</div>` : ''}
      <slot></slot>
      ${this.error ? html`<div class="error" id="${this.id}-error">${this.error}</div>` : ''}
    `;
    }
}

customElements.define('wy-form-field', WyFormField);
