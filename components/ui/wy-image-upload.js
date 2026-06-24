import { LitElement, html } from 'lit';

export class WyImageUpload extends LitElement {
    static properties = {
        value: { type: String },
        accept: { type: String },
        maxSize: { type: Number, attribute: 'max-size' },
        label: { type: String },
        compact: { type: Boolean },
        _isDragging: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.value = '';
        this.accept = 'image/*';
        this.maxSize = 5242880; // 5MB default
        this.label = 'Background Texture';
        this.compact = false;
        this._isDragging = false;
    }


    // Light DOM: styles live in admin.css (scoped under this element tag).
    createRenderRoot() {
        return this;
    }

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
            this.querySelector('input[type="file"]').click();
        }
    }

    render() {
        const hasImage = !!this.value;

        return html`
            ${this.label ? html`<div class="label">${this.label}</div>` : ''}
            <div 
                class="upload-zone ${this.compact ? 'compact' : ''} ${this._isDragging ? 'dragging' : ''} ${hasImage ? 'has-image' : ''}"
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
                ` : this.compact ? html`
                    <div class="compact-empty">
                        <div class="icon-container">
                            <span class="material-symbols-outlined">cloud_upload</span>
                        </div>
                        <div>
                            <div class="upload-text">Upload prompt image</div>
                            <div class="upload-hint">PNG, JPG, GIF up to ${(this.maxSize / 1048576).toFixed(1)}MB</div>
                        </div>
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
