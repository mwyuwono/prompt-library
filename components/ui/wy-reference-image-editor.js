import { LitElement, html } from 'lit';

export class WyReferenceImageEditor extends LitElement {
    static properties = {
        referenceImages: { type: Array }
    };

    constructor() {
        super();
        this.referenceImages = [];
    }


    // Light DOM: styles live in admin.css (scoped under this element tag).
    createRenderRoot() {
        return this;
    }

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
            { variable: '', label: '', path: '', instructions: '' }
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
                                    <div class="field full-width">
                                        <span class="placeholder-hint ${ref.variable && this._isValidVariable(ref.variable) ? 'has-value' : ''}">
                                            Use ${hint} in your template
                                        </span>
                                    </div>
                                    <div class="field full-width">
                                        <label class="field-label">Copy Instructions</label>
                                        <textarea
                                            .value="${ref.instructions || ''}"
                                            @input="${(e) => this._updateItem(index, 'instructions', e.target.value)}"
                                            placeholder="Follow the composition in the provided reference image, which is available at [URL]"
                                        ></textarea>
                                        <span class="placeholder-hint">
                                            Optional. Use [URL] or {{url}} where the image URL should appear.
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
