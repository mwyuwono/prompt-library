import { LitElement, html } from 'lit';

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

    // Light DOM: styles live in admin.css (scoped under wy-step-editor).
    createRenderRoot() {
        return this;
    }

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
