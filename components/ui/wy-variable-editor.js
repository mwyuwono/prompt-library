import { LitElement, html } from 'lit';

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


    // Light DOM: styles live in admin.css (scoped under this element tag).
    createRenderRoot() {
        return this;
    }

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
