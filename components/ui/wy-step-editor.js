import { LitElement, html, css } from 'lit';

export class WyStepEditor extends LitElement {
    static properties = {
        step: { type: Object },
        index: { type: Number },
        total: { type: Number },
        expanded: { type: Boolean }
    };

    constructor() {
        super();
        this.step = null;
        this.index = 0;
        this.total = 1;
        this.expanded = false;
    }

    static styles = css`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1');

        :host {
            display: block;
            margin-bottom: var(--spacing-md, 16px);
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
        }

        .step-card {
            background-color: var(--md-sys-color-surface, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .step-card.expanded {
            border-color: var(--md-sys-color-primary, #282828);
        }

        .step-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            user-select: none;
        }

        .step-header::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .step-header:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .step-badge {
            flex-shrink: 0;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFFFFF);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .step-title {
            flex: 1;
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .collapse-icon {
            flex-shrink: 0;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .step-card.expanded .collapse-icon {
            transform: rotate(180deg);
        }

        .step-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
        }

        .step-card.expanded .step-content {
            grid-template-rows: 1fr;
        }

        .step-content-inner {
            overflow: hidden;
        }

        .step-fields {
            padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .step-controls {
            display: flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
            border-top: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .control-button {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .control-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-on-surface, #121714);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .control-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .control-button:focus-visible {
            outline: 3px solid var(--md-sys-color-primary, #282828);
            outline-offset: 2px;
        }

        .control-button:disabled {
            opacity: var(--md-sys-state-disabled-opacity, 0.38);
            cursor: not-allowed;
        }

        .control-button.delete {
            margin-left: auto;
            border-color: var(--md-sys-color-error, #BA1A1A);
            color: var(--md-sys-color-error, #BA1A1A);
        }

        .control-button.delete::before {
            background-color: var(--md-sys-color-error, #BA1A1A);
        }

        .control-button .material-symbols-outlined {
            font-size: 18px;
        }

        .field-group {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);
        }

        .field-label {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface, #121714);
        }

        .field-description {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-top: calc(-1 * var(--spacing-xs, 4px));
        }

        input,
        textarea {
            width: 100%;
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            color: var(--md-sys-color-on-surface, #121714);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        input:focus,
        textarea:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
        }

        textarea {
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
        }
    `;

    _handleToggle() {
        this.dispatchEvent(new CustomEvent('step-toggle', {
            detail: { index: this.index, expanded: !this.expanded },
            bubbles: true,
            composed: true
        }));
    }

    _handleFieldChange(field, value) {
        if (!this.step) return;

        const updatedStep = {
            ...this.step,
            [field]: value
        };

        this.dispatchEvent(new CustomEvent('step-change', {
            detail: { index: this.index, step: updatedStep },
            bubbles: true,
            composed: true
        }));
    }

    _handleVariableChange(e) {
        this._handleFieldChange('variables', e.detail.variables);
    }

    _handleTemplateChange(e) {
        this._handleFieldChange('template', e.detail.value);
    }

    _handleMoveUp() {
        this.dispatchEvent(new CustomEvent('step-move-up', {
            detail: { index: this.index },
            bubbles: true,
            composed: true
        }));
    }

    _handleMoveDown() {
        this.dispatchEvent(new CustomEvent('step-move-down', {
            detail: { index: this.index },
            bubbles: true,
            composed: true
        }));
    }

    _handleDelete() {
        const confirmMessage = `Delete "${this.step?.name || 'this step'}"?\n\nThis action cannot be undone.`;
        if (confirm(confirmMessage)) {
            this.dispatchEvent(new CustomEvent('step-delete', {
                detail: { index: this.index },
                bubbles: true,
                composed: true
            }));
        }
    }

    render() {
        if (!this.step) {
            return html`<div>No step data</div>`;
        }

        const variableNames = (this.step.variables || []).map(v => v.name);
        const isFirst = this.index === 0;
        const isLast = this.index === this.total - 1;

        return html`
            <div class="step-card ${this.expanded ? 'expanded' : ''}">
                <!-- Header -->
                <div class="step-header" @click="${this._handleToggle}">
                    <div class="step-badge">Step ${this.index + 1}</div>
                    <h3 class="step-title">${this.step.name || 'Unnamed Step'}</h3>
                    <span class="material-symbols-outlined collapse-icon">
                        expand_more
                    </span>
                </div>

                <!-- Content -->
                <div class="step-content">
                    <div class="step-content-inner">
                        <div class="step-fields">
                            <!-- Step Name -->
                            <div class="field-group">
                                <label class="field-label" for="step-name-${this.index}">
                                    Step Name
                                </label>
                                <input
                                    type="text"
                                    id="step-name-${this.index}"
                                    .value="${this.step.name || ''}"
                                    @input="${(e) => this._handleFieldChange('name', e.target.value)}"
                                    placeholder="e.g., Conceptual Decomposition"
                                >
                            </div>

                            <!-- Step ID -->
                            <div class="field-group">
                                <label class="field-label" for="step-id-${this.index}">
                                    Step ID
                                </label>
                                <p class="field-description">
                                    Unique identifier for this step (lowercase, no spaces)
                                </p>
                                <input
                                    type="text"
                                    id="step-id-${this.index}"
                                    .value="${this.step.id || ''}"
                                    @input="${(e) => this._handleFieldChange('id', e.target.value)}"
                                    placeholder="e.g., decomposition"
                                >
                            </div>

                            <!-- Instructions -->
                            <div class="field-group">
                                <label class="field-label" for="step-instructions-${this.index}">
                                    Instructions
                                </label>
                                <p class="field-description">
                                    Helper text shown to users explaining what to do in this step
                                </p>
                                <textarea
                                    id="step-instructions-${this.index}"
                                    .value="${this.step.instructions || ''}"
                                    @input="${(e) => this._handleFieldChange('instructions', e.target.value)}"
                                    placeholder="e.g., Start by entering your topic. This step will identify three distinct conceptual pillars..."
                                ></textarea>
                            </div>

                            <!-- Variables -->
                            <div class="field-group">
                                <label class="field-label">Variables</label>
                                <p class="field-description">
                                    Define input fields for this step
                                </p>
                                <wy-variable-editor
                                    .variables="${this.step.variables || []}"
                                    @change="${this._handleVariableChange}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Template -->
                            <div class="field-group">
                                <label class="field-label">Template</label>
                                <p class="field-description">
                                    Prompt template for this step. Use {{variable-name}} for substitutions.
                                </p>
                                <wy-code-textarea
                                    .value="${this.step.template || ''}"
                                    .variables="${variableNames}"
                                    placeholder="Enter your prompt template here..."
                                    rows="12"
                                    @value-input="${this._handleTemplateChange}"
                                ></wy-code-textarea>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="step-controls">
                            <button
                                class="control-button"
                                @click="${this._handleMoveUp}"
                                ?disabled="${isFirst}"
                                title="Move step up"
                            >
                                <span class="material-symbols-outlined">arrow_upward</span>
                                Move Up
                            </button>
                            <button
                                class="control-button"
                                @click="${this._handleMoveDown}"
                                ?disabled="${isLast}"
                                title="Move step down"
                            >
                                <span class="material-symbols-outlined">arrow_downward</span>
                                Move Down
                            </button>
                            <button
                                class="control-button delete"
                                @click="${this._handleDelete}"
                                title="Delete step"
                            >
                                <span class="material-symbols-outlined">delete</span>
                                Delete Step
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('wy-step-editor', WyStepEditor);
