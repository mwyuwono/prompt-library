import { LitElement, html, css } from 'lit';

export class WyReferenceImageEditor extends LitElement {
    static properties = {
        referenceImages: { type: Array }
    };

    constructor() {
        super();
        this.referenceImages = [];
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
            font-weight: normal;
            font-style: normal;
            line-height: 1;
            letter-spacing: normal;
            text-transform: none;
            display: inline-block;
            white-space: nowrap;
            word-wrap: normal;
            direction: ltr;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            font-feature-settings: 'liga';
        }

        .refs-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .ref-item {
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .ref-item-header {
            display: flex;
            gap: var(--spacing-sm, 8px);
            align-items: flex-start;
            margin-bottom: var(--spacing-sm, 8px);
        }

        .ref-fields {
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-sm, 8px);
        }

        .field {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xxs, 2px);
        }

        .field-label {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        input {
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface, #121714);
            background-color: var(--md-sys-color-surface, #FDFBF7);
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        input:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
        }

        input.invalid {
            border-color: var(--md-sys-color-error, #FF0101);
        }

        .placeholder-hint {
            margin-top: var(--spacing-xs, 4px);
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .placeholder-hint.has-value {
            color: var(--md-sys-color-primary, #282828);
        }

        .validation-error {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-error, #FF0101);
            margin-top: var(--spacing-xxs, 2px);
        }

        .remove-button {
            display: flex;
            align-items: flex-start;
            flex-shrink: 0;
        }

        .icon-button {
            background: none;
            border: none;
            padding: var(--spacing-xs, 4px);
            cursor: pointer;
            color: var(--md-sys-color-error, #FF0101);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .icon-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-error, #FF0101) 10%, transparent);
        }

        .upload-section {
            margin-top: var(--spacing-sm, 8px);
        }

        .add-button {
            margin-top: var(--spacing-md, 16px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: transparent;
            border: 1px solid var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
        }
    `;

    _emitChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { referenceImages: [...this.referenceImages] },
            bubbles: true,
            composed: true
        }));
    }

    _updateItem(index, field, value) {
        const updated = [...this.referenceImages];
        updated[index] = { ...updated[index], [field]: value };
        this.referenceImages = updated;
        this._emitChange();
    }

    _removeItem(index) {
        const item = this.referenceImages[index];
        if (item?.path) {
            this.dispatchEvent(new CustomEvent('reference-image-remove', {
                detail: { index, path: item.path },
                bubbles: true,
                composed: true
            }));
        }
        this.referenceImages = this.referenceImages.filter((_, i) => i !== index);
        this._emitChange();
    }

    _addItem() {
        this.referenceImages = [
            ...this.referenceImages,
            { variable: '', label: '', path: '' }
        ];
        this._emitChange();
    }

    _handleImageChange(e, index) {
        e.stopPropagation();
        const { file } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-upload', {
            detail: { file, index },
            bubbles: true,
            composed: true
        }));
    }

    _handleImageRemove(index) {
        const item = this.referenceImages[index];
        if (item?.path) {
            this.dispatchEvent(new CustomEvent('reference-image-remove', {
                detail: { index, path: item.path },
                bubbles: true,
                composed: true
            }));
        }
        this._updateItem(index, 'path', '');
    }

    _isValidVariable(name) {
        return /^[a-zA-Z0-9_]*$/.test(name);
    }

    render() {
        return html`
            <div class="refs-list">
                ${this.referenceImages.map((ref, index) => {
                    const isInvalid = ref.variable && !this._isValidVariable(ref.variable);
                    const hint = ref.variable && this._isValidVariable(ref.variable)
                        ? `{{${ref.variable}}}`
                        : '{{variable_name}}';
                    return html`
                        <div class="ref-item">
                            <div class="ref-item-header">
                                <div class="ref-fields">
                                    <div class="field">
                                        <label class="field-label">Variable Name</label>
                                        <input
                                            type="text"
                                            class="${isInvalid ? 'invalid' : ''}"
                                            .value="${ref.variable || ''}"
                                            @input="${(e) => this._updateItem(index, 'variable', e.target.value)}"
                                            placeholder="style_ref"
                                        >
                                        ${isInvalid ? html`
                                            <span class="validation-error">Letters, numbers, and underscores only</span>
                                        ` : ''}
                                    </div>
                                    <div class="field">
                                        <label class="field-label">Label</label>
                                        <input
                                            type="text"
                                            .value="${ref.label || ''}"
                                            @input="${(e) => this._updateItem(index, 'label', e.target.value)}"
                                            placeholder="Style Reference"
                                        >
                                    </div>
                                    <div class="field" style="grid-column: 1 / -1;">
                                        <span class="placeholder-hint ${ref.variable && this._isValidVariable(ref.variable) ? 'has-value' : ''}">
                                            Use ${hint} in your template
                                        </span>
                                    </div>
                                </div>
                                <div class="remove-button">
                                    <button
                                        class="icon-button"
                                        @click="${() => this._removeItem(index)}"
                                        aria-label="Remove reference image"
                                    >
                                        <span class="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>
                            <div class="upload-section">
                                <wy-image-upload
                                    label="${ref.label || 'Reference Image'}"
                                    .value="${ref.path || ''}"
                                    @change="${(e) => this._handleImageChange(e, index)}"
                                    @remove="${() => this._handleImageRemove(index)}"
                                ></wy-image-upload>
                            </div>
                        </div>
                    `;
                })}
            </div>
            <button class="add-button" @click="${this._addItem}">
                <span class="material-symbols-outlined">add</span>
                Add Reference Image
            </button>
        `;
    }
}

customElements.define('wy-reference-image-editor', WyReferenceImageEditor);
