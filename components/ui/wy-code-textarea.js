import { LitElement, html } from 'lit';

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

    // Light DOM: styles live in admin.css (scoped under wy-code-textarea).
    createRenderRoot() {
        return this;
    }

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
            const textarea = this.querySelector('textarea');
            // Only update textarea value if it's not currently focused (avoid interfering with typing)
            const isFocused = document.activeElement === textarea;
            if (textarea && !isFocused && textarea.value !== this.value) {
                textarea.value = this.value;
            }
        }
    }

    _insertVariable(variableName) {
        const textarea = this.querySelector('textarea');
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
