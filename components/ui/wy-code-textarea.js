import { LitElement, html, css } from 'lit';

export class WyCodeTextarea extends LitElement {
    static properties = {
        value: { type: String },
        variables: { type: Array },
        placeholder: { type: String },
        rows: { type: Number },
        label: { type: String },
        maxLength: { type: Number, attribute: 'max-length' }
    };

    constructor() {
        super();
        this.value = '';
        this.variables = [];
        this.placeholder = '';
        this.rows = 8;
        this.label = 'Template';
        this.maxLength = 0;
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .label {
            font-family: var(--font-display, 'Playfair Display', serif);
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: var(--md-sys-color-text-heading, #121714);
            margin-bottom: var(--spacing-sm, 8px);
            display: block;
        }

        textarea {
            width: 100%;
            box-sizing: border-box;
            padding: var(--spacing-md, 16px);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            background-color: transparent;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.875rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface, #121714);
            resize: vertical;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        textarea:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
        }

        textarea::placeholder {
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            opacity: 0.6;
        }

        .variable-chips {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-xs, 4px);
            margin-top: var(--spacing-sm, 8px);
        }

        .variable-chip {
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xxs, 2px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.75rem;
            color: var(--md-sys-color-primary, #282828);
            cursor: pointer;
            border: 1px solid color-mix(in srgb, var(--md-sys-color-primary, #282828) 30%, transparent);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variable-chip:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
            border-color: var(--md-sys-color-primary, #282828);
        }

        .char-count {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            text-align: right;
            margin-top: var(--spacing-xs, 4px);
        }

        .char-count.over-limit {
            color: var(--md-sys-color-error, #FF0101);
        }
    `;

    _handleInput(e) {
        // Update internal value to keep it in sync
        this.value = e.target.value;
        
        // Notify parent of the change
        this.dispatchEvent(new CustomEvent('value-input', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    _handleChange(e) {
        this.value = e.target.value; // Update on blur
        this.dispatchEvent(new CustomEvent('value-change', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));
    }

    updated(changedProperties) {
        if (changedProperties.has('value')) {
            const textarea = this.shadowRoot.querySelector('textarea');
            // Only update textarea value if it's not currently focused (avoid interfering with typing)
            // Check shadowRoot.activeElement for proper shadow DOM focus detection
            const isFocused = this.shadowRoot.activeElement === textarea;
            if (textarea && !isFocused && textarea.value !== this.value) {
                textarea.value = this.value;
            }
        }
    }

    _insertVariable(variableName) {
        const textarea = this.shadowRoot.querySelector('textarea');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const textBefore = this.value.substring(0, start);
        const textAfter = this.value.substring(end);
        
        const insertion = `{{${variableName}}}`;
        this.value = textBefore + insertion + textAfter;
        
        // Dispatch input event
        this.dispatchEvent(new CustomEvent('value-input', {
            detail: { value: this.value },
            bubbles: true,
            composed: true
        }));

        // Set cursor position after insertion
        this.updateComplete.then(() => {
            const newPosition = start + insertion.length;
            textarea.setSelectionRange(newPosition, newPosition);
            textarea.focus();
        });
    }

    render() {
        const charCount = this.value.length;
        const showCharCount = this.maxLength > 0;
        const isOverLimit = showCharCount && charCount > this.maxLength;

        return html`
            ${this.label ? html`<div class="label">${this.label}</div>` : ''}
            <textarea
                placeholder="${this.placeholder}"
                rows="${this.rows}"
                maxlength="${this.maxLength > 0 ? this.maxLength : ''}"
                @input="${this._handleInput}"
                @change="${this._handleChange}"
            ></textarea>
            ${this.variables && this.variables.length > 0 ? html`
                <div class="variable-chips">
                    ${this.variables.map(varName => html`
                        <button 
                            class="variable-chip"
                            @click="${() => this._insertVariable(varName)}"
                            type="button"
                        >
                            {{${varName}}}
                        </button>
                    `)}
                </div>
            ` : ''}
            ${showCharCount ? html`
                <div class="char-count ${isOverLimit ? 'over-limit' : ''}">
                    ${charCount}${this.maxLength > 0 ? ` / ${this.maxLength}` : ''} characters
                </div>
            ` : ''}
        `;
    }
}

customElements.define('wy-code-textarea', WyCodeTextarea);
