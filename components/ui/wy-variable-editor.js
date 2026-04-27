import { LitElement, html, css } from 'lit';

export class WyVariableEditor extends LitElement {
    static properties = {
        variables: { type: Array },
        allowReorder: { type: Boolean, attribute: 'allow-reorder' }
    };

    constructor() {
        super();
        this.variables = [];
        this.allowReorder = true;
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

        .variables-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .variable-item {
            display: flex;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .drag-handle {
            display: flex;
            align-items: center;
            cursor: grab;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            padding: var(--spacing-xs, 4px);
        }

        .drag-handle:active {
            cursor: grabbing;
        }

        .variable-fields {
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

        .field.full-width {
            grid-column: 1 / -1;
        }

        .field-label {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        input, select {
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface, #121714);
            background-color: var(--md-sys-color-surface, #FDFBF7);
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        input:focus, select:focus {
            outline: none;
            border-color: var(--md-sys-color-primary, #282828);
        }

        input[readonly] {
            background-color: color-mix(in srgb, var(--md-sys-color-surface-variant, #F5F2EA) 50%, transparent);
            cursor: not-allowed;
        }

        .name-prefix {
            display: inline-block;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.8125rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-right: var(--spacing-xxs, 2px);
        }

        .toggle-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: var(--spacing-sm, 8px);
            grid-column: 1 / -1;
        }

        .remove-button {
            display: flex;
            align-items: flex-start;
            padding-top: 20px;
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
            detail: { variables: [...this.variables] },
            bubbles: true,
            composed: true
        }));
    }

    _updateVariable(index, field, value) {
        const updated = [...this.variables];
        updated[index] = { ...updated[index], [field]: value };
        this.variables = updated;
        this._emitChange();
    }

    _removeVariable(index) {
        this.variables = this.variables.filter((_, i) => i !== index);
        this._emitChange();
    }

    _addVariable() {
        this.variables = [
            ...this.variables,
            {
                name: '',
                label: '',
                placeholder: '',
                inputType: 'text'
            }
        ];
        this._emitChange();
    }

    render() {
        return html`
            <div class="variables-list">
                ${this.variables.map((variable, index) => html`
                    <div class="variable-item">
                        ${this.allowReorder ? html`
                            <div class="drag-handle">
                                <span class="material-symbols-outlined">drag_indicator</span>
                            </div>
                        ` : ''}
                        <div class="variable-fields">
                            <div class="field">
                                <label class="field-label">
                                    <span class="name-prefix">{{</span>Name<span class="name-prefix">}}</span>
                                </label>
                                <input
                                    type="text"
                                    .value="${variable.name || ''}"
                                    @input="${(e) => this._updateVariable(index, 'name', e.target.value)}"
                                    placeholder="variable-name"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Label</label>
                                <input
                                    type="text"
                                    .value="${variable.label || ''}"
                                    @input="${(e) => this._updateVariable(index, 'label', e.target.value)}"
                                    placeholder="Display Label"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Placeholder</label>
                                <input
                                    type="text"
                                    .value="${variable.placeholder || ''}"
                                    @input="${(e) => this._updateVariable(index, 'placeholder', e.target.value)}"
                                    placeholder="Helper text"
                                >
                            </div>
                            <div class="field">
                                <label class="field-label">Input Type</label>
                                <select
                                    .value="${variable.inputType || 'text'}"
                                    @change="${(e) => this._updateVariable(index, 'inputType', e.target.value)}"
                                >
                                    <option value="text">Text</option>
                                    <option value="toggle">Toggle</option>
                                </select>
                            </div>
                            ${variable.inputType === 'toggle' ? html`
                                <div class="toggle-options">
                                    <div class="field">
                                        <label class="field-label">Off Value</label>
                                        <input
                                            type="text"
                                            .value="${variable.options?.[0] || ''}"
                                            @input="${(e) => {
                                                const newOptions = [...(variable.options || ['', ''])];
                                                newOptions[0] = e.target.value;
                                                this._updateVariable(index, 'options', newOptions);
                                            }}"
                                            placeholder="Value when off"
                                        >
                                    </div>
                                    <div class="field">
                                        <label class="field-label">On Value</label>
                                        <input
                                            type="text"
                                            .value="${variable.options?.[1] || ''}"
                                            @input="${(e) => {
                                                const newOptions = [...(variable.options || ['', ''])];
                                                newOptions[1] = e.target.value;
                                                this._updateVariable(index, 'options', newOptions);
                                            }}"
                                            placeholder="Value when on"
                                        >
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="remove-button">
                            <button 
                                class="icon-button"
                                @click="${() => this._removeVariable(index)}"
                                aria-label="Remove variable"
                            >
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>
                `)}
            </div>
            <button class="add-button" @click="${this._addVariable}">
                <span class="material-symbols-outlined">add</span>
                Add Variable
            </button>
        `;
    }
}

customElements.define('wy-variable-editor', WyVariableEditor);
