import { LitElement, html, css } from 'lit';

export class WyImageUpload extends LitElement {
    static properties = {
        value: { type: String },
        accept: { type: String },
        maxSize: { type: Number, attribute: 'max-size' },
        label: { type: String },
        _isDragging: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.value = '';
        this.accept = 'image/*';
        this.maxSize = 5242880; // 5MB default
        this.label = 'Background Texture';
        this._isDragging = false;
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

        .upload-zone {
            position: relative;
            border: 2px dashed color-mix(in srgb, var(--md-sys-color-primary, #282828) 20%, transparent);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--spacing-2xl, 48px) var(--spacing-xl, 32px);
            text-align: center;
            cursor: pointer;
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            background-color: transparent;
        }

        .upload-zone:hover {
            background-color: var(--md-sys-color-surface, #FDFBF7);
            border-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 40%, transparent);
        }

        .upload-zone.dragging {
            border-color: var(--md-sys-color-primary, #282828);
            border-style: solid;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
        }

        .upload-zone.has-image {
            padding: 0;
            border-style: solid;
            border-color: var(--md-sys-color-outline-variant, #DDD);
            overflow: hidden;
        }

        .icon-container {
            width: 48px;
            height: 48px;
            margin: 0 auto var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 24px;
            color: var(--md-sys-color-primary, #282828);
        }

        .upload-text {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
            margin-bottom: var(--spacing-xs, 4px);
        }

        .upload-hint {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .image-preview {
            position: relative;
            width: 100%;
            aspect-ratio: 16 / 9;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .remove-button {
            position: absolute;
            top: var(--spacing-sm, 8px);
            right: var(--spacing-sm, 8px);
            width: 32px;
            height: 32px;
            background-color: var(--md-sys-color-error, #FF0101);
            border: none;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .image-preview:hover .remove-button {
            opacity: 1;
        }

        .remove-button:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-error, #FF0101) 90%, black);
        }

        .remove-button .material-symbols-outlined {
            font-size: 18px;
            color: white;
        }

        input[type="file"] {
            display: none;
        }
    `;

    _handleDragOver(e) {
        e.preventDefault();
        this._isDragging = true;
    }

    _handleDragLeave(e) {
        e.preventDefault();
        this._isDragging = false;
    }

    _handleDrop(e) {
        e.preventDefault();
        this._isDragging = false;
        
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            this._handleFile(files[0]);
        }
    }

    _handleFileSelect(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            this._handleFile(files[0]);
        }
    }

    _handleFile(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.dispatchEvent(new CustomEvent('error', {
                detail: { message: 'Please select an image file' },
                bubbles: true,
                composed: true
            }));
            return;
        }

        // Validate file size
        if (file.size > this.maxSize) {
            const maxSizeMB = (this.maxSize / 1048576).toFixed(1);
            this.dispatchEvent(new CustomEvent('error', {
                detail: { message: `File size must be less than ${maxSizeMB}MB` },
                bubbles: true,
                composed: true
            }));
            return;
        }

        // Emit change event with file
        this.dispatchEvent(new CustomEvent('change', {
            detail: { file },
            bubbles: true,
            composed: true
        }));
    }

    _handleRemove(e) {
        e.stopPropagation();
        this.value = '';
        this.dispatchEvent(new CustomEvent('remove', {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    _handleClick() {
        if (!this.value) {
            this.shadowRoot.querySelector('input[type="file"]').click();
        }
    }

    render() {
        const hasImage = !!this.value;

        return html`
            ${this.label ? html`<div class="label">${this.label}</div>` : ''}
            <div 
                class="upload-zone ${this._isDragging ? 'dragging' : ''} ${hasImage ? 'has-image' : ''}"
                @dragover="${this._handleDragOver}"
                @dragleave="${this._handleDragLeave}"
                @drop="${this._handleDrop}"
                @click="${this._handleClick}"
            >
                ${hasImage ? html`
                    <div class="image-preview">
                        <img src="${this.value}" alt="Preview" class="preview-image">
                        <button 
                            class="remove-button" 
                            @click="${this._handleRemove}"
                            aria-label="Remove image"
                        >
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                ` : html`
                    <div class="icon-container">
                        <span class="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <div class="upload-text">Click to upload or drag and drop</div>
                    <div class="upload-hint">PNG, JPG, GIF up to ${(this.maxSize / 1048576).toFixed(1)}MB</div>
                `}
                <input 
                    type="file" 
                    accept="${this.accept}"
                    @change="${this._handleFileSelect}"
                >
            </div>
        `;
    }
}

customElements.define('wy-image-upload', WyImageUpload);
