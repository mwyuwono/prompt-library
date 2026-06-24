import { LitElement, html } from 'lit';

export class WyVariationEditor extends LitElement {
    static properties = {
        variations: { type: Array },
        allowReorder: { type: Boolean, attribute: 'allow-reorder' },
        _selectedIndex: { type: Number, state: true },
        _listExpanded: { type: Boolean, state: true },
        _expandedStepsByVariation: { type: Object, state: true }
    };

    constructor() {
        super();
        this.variations = [];
        this.allowReorder = true;
        this._selectedIndex = 0;
        this._listExpanded = false;
        this._expandedStepsByVariation = {};
        this._dragIndex = null;
    }

    // Light DOM: styles live in admin.css (scoped under wy-variation-editor).
    createRenderRoot() {
        return this;
    }

    _toggleList() {
        this._listExpanded = !this._listExpanded;
    }

    _selectVariation(index) {
        this._selectedIndex = index;
        this._listExpanded = false;
        this._notifyVariationExpand();
    }

    expandVariation(index) {
        if (index < 0 || index >= this.variations.length) return;
        this._selectedIndex = index;
        this._notifyVariationExpand();
        this.requestUpdate();
    }

    getSectionElement(variationIndex, section = 'variation') {
        const card = this.querySelector(`.variation-card[data-variation-index="${variationIndex}"]`);
        if (!card || section === 'variation') return card;
        return card.querySelector(`[data-vsection="${section}"]`) || card;
    }

    _notifyVariationExpand() {
        this.dispatchEvent(new CustomEvent('variation-expand', {
            detail: { index: this._selectedIndex },
            bubbles: true,
            composed: true
        }));
    }

    // --- Drag reorder (selector list) ---
    _onDragStart(e, index) {
        this._dragIndex = index;
        e.dataTransfer.effectAllowed = 'move';
    }

    _onDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    _onDrop(e, index) {
        e.preventDefault();
        const from = this._dragIndex;
        this._dragIndex = null;
        if (from === null || from === index) return;

        const selectedVariation = this.variations[this._selectedIndex];
        const updated = [...this.variations];
        const [moved] = updated.splice(from, 1);
        updated.splice(index, 0, moved);
        this._selectedIndex = updated.indexOf(selectedVariation);
        this._notifyChange(updated);
        this._notifyVariationExpand();
    }

    _onDragEnd() {
        this._dragIndex = null;
    }

    _handleFieldChange(index, field, value) {
        const updatedVariations = [...this.variations];
        updatedVariations[index] = {
            ...updatedVariations[index],
            [field]: value
        };
        this._notifyChange(updatedVariations);
    }

    _handleModeChange(index, newMode) {
        const variation = this.variations[index];
        const updatedVariations = [...this.variations];

        if (newMode === 'multi') {
            // Template → Multi-Step: Convert template to first step
            updatedVariations[index] = {
                ...variation,
                steps: variation.steps || [{
                    id: 'step-1',
                    name: 'Step 1',
                    instructions: '',
                    template: variation.template || '',
                    variables: variation.variables || []
                }]
            };
            // Keep template for hybrid mode support
        } else {
            // Multi-Step → Template: Use first step as template
            const firstStep = variation.steps?.[0];
            updatedVariations[index] = {
                ...variation,
                template: firstStep?.template || variation.template || '',
                variables: firstStep?.variables || variation.variables || [],
                steps: undefined
            };
        }

        this._notifyChange(updatedVariations);
    }

    _handleStepChange(variationIndex, e) {
        const { index: stepIndex, step } = e.detail;
        const updatedVariations = [...this.variations];
        const variation = updatedVariations[variationIndex];

        if (variation.steps) {
            variation.steps[stepIndex] = step;
            this._notifyChange(updatedVariations);
        }
    }

    _handleStepDelete(variationIndex, e) {
        const { index: stepIndex } = e.detail;
        const updatedVariations = [...this.variations];
        const variation = updatedVariations[variationIndex];

        if (variation.steps && variation.steps.length > 1) {
            variation.steps.splice(stepIndex, 1);
            this._notifyChange(updatedVariations);
        } else {
            this._notifyToast('Cannot delete the last step. Convert to template mode instead.', 'warning');
        }
    }

    _handleStepMoveUp(variationIndex, e) {
        const { index: stepIndex } = e.detail;
        if (stepIndex === 0) return;

        const updatedVariations = [...this.variations];
        const steps = updatedVariations[variationIndex].steps;
        [steps[stepIndex - 1], steps[stepIndex]] = [steps[stepIndex], steps[stepIndex - 1]];
        this._notifyChange(updatedVariations);
    }

    _handleStepMoveDown(variationIndex, e) {
        const { index: stepIndex } = e.detail;
        const updatedVariations = [...this.variations];
        const steps = updatedVariations[variationIndex].steps;

        if (stepIndex === steps.length - 1) return;

        [steps[stepIndex], steps[stepIndex + 1]] = [steps[stepIndex + 1], steps[stepIndex]];
        this._notifyChange(updatedVariations);
    }

    _handleStepToggle(variationIndex, e) {
        const { index: stepIndex } = e.detail;
        const currentExpanded = this._expandedStepsByVariation[variationIndex] || [];
        const stepIndexInArray = currentExpanded.indexOf(stepIndex);

        if (stepIndexInArray > -1) {
            // Step is currently expanded, collapse it
            currentExpanded.splice(stepIndexInArray, 1);
        } else {
            // Step is currently collapsed, expand it
            currentExpanded.push(stepIndex);
        }

        this._expandedStepsByVariation = {
            ...this._expandedStepsByVariation,
            [variationIndex]: [...currentExpanded]
        };
        this.requestUpdate();
    }

    _handleAddStep(variationIndex) {
        const updatedVariations = [...this.variations];
        const variation = updatedVariations[variationIndex];

        if (!variation.steps) {
            variation.steps = [];
        }

        const newStepNumber = variation.steps.length + 1;
        variation.steps.push({
            id: `step-${newStepNumber}`,
            name: `Step ${newStepNumber}`,
            instructions: '',
            template: '',
            variables: []
        });

        this._notifyChange(updatedVariations);
    }

    _handleVariableChange(variationIndex, e) {
        this._handleFieldChange(variationIndex, 'variables', e.detail.variables);
    }

    _handleTemplateChange(variationIndex, e) {
        this._handleFieldChange(variationIndex, 'template', e.detail.value);
    }

    _handleImageChange(variationIndex, e) {
        e.stopPropagation();
        const { file } = e.detail;
        this.dispatchEvent(new CustomEvent('image-upload', {
            detail: { file, target: 'variation', variationIndex, variationId: this.variations[variationIndex]?.id },
            bubbles: true,
            composed: true
        }));
    }

    _handleImageRemove(variationIndex) {
        this._handleFieldChange(variationIndex, 'image', '');
        this.dispatchEvent(new CustomEvent('image-remove', {
            detail: { target: 'variation', variationIndex, variationId: this.variations[variationIndex]?.id },
            bubbles: true,
            composed: true
        }));
    }

    _handleRefImageChange(variationIndex, e) {
        e.stopPropagation();
        const { file, index } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-upload', {
            detail: { file, index, variationIndex, variationId: this.variations[variationIndex]?.id },
            bubbles: true,
            composed: true
        }));
    }

    _handleRefImageRemove(variationIndex, e) {
        e.stopPropagation();
        const { index, path } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-remove', {
            detail: { index, path, variationIndex, variationId: this.variations[variationIndex]?.id },
            bubbles: true,
            composed: true
        }));
    }

    _handleRefImageListChange(variationIndex, e) {
        if (!Array.isArray(e.detail?.referenceImages)) return;
        this._handleFieldChange(variationIndex, 'referenceImages', e.detail.referenceImages);
    }

    _handleMoveUp(index) {
        if (index === 0) return;
        const updatedVariations = [...this.variations];
        [updatedVariations[index - 1], updatedVariations[index]] =
            [updatedVariations[index], updatedVariations[index - 1]];
        if (this._selectedIndex === index) this._selectedIndex = index - 1;
        else if (this._selectedIndex === index - 1) this._selectedIndex = index;
        this._notifyChange(updatedVariations);
        this._notifyVariationExpand();
    }

    _handleMoveDown(index) {
        if (index === this.variations.length - 1) return;
        const updatedVariations = [...this.variations];
        [updatedVariations[index], updatedVariations[index + 1]] =
            [updatedVariations[index + 1], updatedVariations[index]];
        if (this._selectedIndex === index) this._selectedIndex = index + 1;
        else if (this._selectedIndex === index + 1) this._selectedIndex = index;
        this._notifyChange(updatedVariations);
        this._notifyVariationExpand();
    }

    _handleDelete(index) {
        if (this.variations.length === 1) {
            this._notifyToast('Cannot delete the last variation. Prompts must have at least one variation.', 'warning');
            return;
        }

        const variation = this.variations[index];
        const confirmMessage = `Delete variation "${variation.name || 'Unnamed'}"?\n\nThis action cannot be undone.`;

        if (confirm(confirmMessage)) {
            const updatedVariations = this.variations.filter((_, i) => i !== index);

            // Keep the selection in range after removal
            if (this._selectedIndex >= index && this._selectedIndex > 0) {
                this._selectedIndex--;
            }
            if (this._selectedIndex > updatedVariations.length - 1) {
                this._selectedIndex = updatedVariations.length - 1;
            }

            this._notifyChange(updatedVariations);
            this._notifyVariationExpand();
        }
    }

    _handleAddVariation() {
        const newNumber = this.variations.length + 1;
        const updatedVariations = [
            ...this.variations,
            {
                id: `variation-${newNumber}`,
                name: `Variation ${newNumber}`,
                description: '',
                image: '',
                template: '',
                variables: [],
                referenceImages: []
            }
        ];
        // Focus the new variation
        this._selectedIndex = updatedVariations.length - 1;
        this._listExpanded = false;
        this._notifyChange(updatedVariations);
        this._notifyVariationExpand();
    }

    _notifyChange(updatedVariations) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { variations: updatedVariations },
            bubbles: true,
            composed: true
        }));
    }

    _notifyToast(message, type = 'info') {
        this.dispatchEvent(new CustomEvent('toast', {
            detail: { message, type },
            bubbles: true,
            composed: true
        }));
    }

    _renderVariation(variation, index) {
        const isFirst = index === 0;
        const isLast = index === this.variations.length - 1;
        const hasSteps = variation.steps && variation.steps.length > 0;
        const hasTemplate = variation.template || (!hasSteps);
        const variableNames = (variation.variables || []).map(v => v.name);

        return html`
            <div class="variation-card expanded" data-variation-index="${index}">
                <!-- Header -->
                <div class="variation-header">
                    <h3 class="variation-title">${variation.name || 'Unnamed Variation'}</h3>
                    ${hasSteps ? html`
                        <span class="variation-badge">Multi-Step</span>
                    ` : ''}
                </div>

                <!-- Fields -->
                <div class="variation-fields">
                    <!-- Variation Name -->
                    <wy-form-field label="Variation Name" required>
                        <input
                            type="text"
                            .value="${variation.name || ''}"
                            @input="${(e) => this._handleFieldChange(index, 'name', e.target.value)}"
                            placeholder="e.g., Tina Barney Style Photo"
                        >
                    </wy-form-field>

                    <!-- Variation ID -->
                    <wy-form-field
                        label="Variation ID"
                        description="Unique identifier (lowercase, no spaces)"
                    >
                        <input
                            type="text"
                            .value="${variation.id || ''}"
                            @input="${(e) => this._handleFieldChange(index, 'id', e.target.value)}"
                            placeholder="e.g., tina-barney"
                        >
                    </wy-form-field>

                    <!-- Variation Description -->
                    <wy-form-field label="Description" data-vsection="description">
                        <textarea
                            rows="3"
                            .value="${variation.description || ''}"
                            @input="${(e) => this._handleFieldChange(index, 'description', e.target.value)}"
                            placeholder="Description shown in variation selector"
                        ></textarea>
                    </wy-form-field>

                    <!-- Variation Instructions -->
                    <wy-form-field
                        data-vsection="instructions"
                        label="Instructions"
                        description="Optional usage notes shown with this variant. Supports lightweight Markdown such as **bold** and lists."
                    >
                        <textarea
                            rows="4"
                            .value="${variation.instructions || ''}"
                            @input="${(e) => this._handleFieldChange(index, 'instructions', e.target.value)}"
                            placeholder="e.g., Upload with this variant:&#10;1. Your artwork&#10;2. The reference image"
                        ></textarea>
                    </wy-form-field>

                    <div data-vsection="image">
                        <wy-image-upload
                            label="Variation Image"
                            .value="${variation.image || ''}"
                            @change="${(e) => this._handleImageChange(index, e)}"
                            @remove="${() => this._handleImageRemove(index)}"
                        ></wy-image-upload>
                    </div>

                    <!-- Mode Toggle -->
                    <div class="mode-toggle">
                        <label>
                            <input
                                type="radio"
                                name="mode-${index}"
                                value="single"
                                ?checked="${!hasSteps}"
                                @change="${() => this._handleModeChange(index, 'single')}"
                            >
                            Template
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="mode-${index}"
                                value="multi"
                                ?checked="${hasSteps}"
                                @change="${() => this._handleModeChange(index, 'multi')}"
                            >
                            Multi-Step
                        </label>
                    </div>

                    ${hasTemplate && !hasSteps ? html`
                        <!-- Template Mode -->
                        <div class="section-divider"></div>

                        <!-- Variables -->
                        <div class="field-group" data-vsection="variables">
                            <label class="field-label">Variables</label>
                            <p class="field-description">
                                Define input fields for this variation
                            </p>
                            <wy-variable-editor
                                .variables="${variation.variables || []}"
                                @change="${(e) => this._handleVariableChange(index, e)}"
                            ></wy-variable-editor>
                        </div>

                        <!-- Reference Images -->
                        <div class="field-group" data-vsection="reference-images">
                            <label class="field-label">Reference Images</label>
                            <p class="field-description">
                                Upload images and reference them with {{variable_name}}. URLs are substituted when the prompt is copied.
                            </p>
                            <wy-reference-image-editor
                                .referenceImages="${variation.referenceImages || []}"
                                @change="${(e) => this._handleRefImageListChange(index, e)}"
                                @reference-image-upload="${(e) => this._handleRefImageChange(index, e)}"
                                @reference-image-remove="${(e) => this._handleRefImageRemove(index, e)}"
                            ></wy-reference-image-editor>
                        </div>

                        <!-- Template -->
                        <div class="field-group" data-vsection="template">
                            <label class="field-label">Template</label>
                            <p class="field-description">
                                Prompt template for this variation. Use {{variable-name}} for substitutions.
                            </p>
                            <wy-code-textarea
                                .value="${variation.template || ''}"
                                .variables="${variableNames}"
                                placeholder="Enter your prompt template here..."
                                rows="12"
                                @value-input="${(e) => this._handleTemplateChange(index, e)}"
                            ></wy-code-textarea>
                        </div>
                    ` : ''}

                    ${hasSteps ? html`
                        <!-- Multi-Step Mode -->
                        <div class="section-divider"></div>

                        <div class="field-group" data-vsection="steps">
                            <label class="field-label">Steps</label>
                            <p class="field-description">
                                Define the sequence of prompts for this variation
                            </p>
                            <div class="steps-section">
                                ${variation.steps.map((step, stepIndex) => {
                                    const expandedSteps = this._expandedStepsByVariation[index] || [];
                                    const isExpanded = expandedSteps.includes(stepIndex);
                                    return html`
                                    <wy-step-editor
                                        .step="${step}"
                                        .index="${stepIndex}"
                                        .total="${variation.steps.length}"
                                        .expanded="${isExpanded}"
                                        @step-change="${(e) => this._handleStepChange(index, e)}"
                                        @step-delete="${(e) => this._handleStepDelete(index, e)}"
                                        @step-move-up="${(e) => this._handleStepMoveUp(index, e)}"
                                        @step-move-down="${(e) => this._handleStepMoveDown(index, e)}"
                                        @step-toggle="${(e) => this._handleStepToggle(index, e)}"
                                    ></wy-step-editor>
                                `;})}
                                <button
                                    class="add-step-button"
                                    @click="${() => this._handleAddStep(index)}"
                                >
                                    <span class="material-symbols-outlined">add</span>
                                    Add Step
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Variation Controls -->
                <div class="variation-controls">
                    ${this.allowReorder ? html`
                        <button
                            class="control-button"
                            @click="${() => this._handleMoveUp(index)}"
                            ?disabled="${isFirst}"
                            title="Move variation up"
                        >
                            <span class="material-symbols-outlined">arrow_upward</span>
                            Move Up
                        </button>
                        <button
                            class="control-button"
                            @click="${() => this._handleMoveDown(index)}"
                            ?disabled="${isLast}"
                            title="Move variation down"
                        >
                            <span class="material-symbols-outlined">arrow_downward</span>
                            Move Down
                        </button>
                    ` : ''}
                    <button
                        class="control-button delete"
                        @click="${() => this._handleDelete(index)}"
                        ?disabled="${this.variations.length === 1}"
                        title="Delete variation"
                    >
                        <span class="material-symbols-outlined">delete</span>
                        Delete Variation
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        const count = this.variations?.length || 0;
        const selectedIndex = Math.min(Math.max(this._selectedIndex, 0), Math.max(0, count - 1));
        const selected = count > 0 ? this.variations[selectedIndex] : null;
        const selectedHasSteps = selected?.steps && selected.steps.length > 0;

        return html`
            <div class="variation-selector ${this._listExpanded ? 'expanded' : ''}">
                <button
                    type="button"
                    class="variation-selector-toggle"
                    @click="${this._toggleList}"
                    aria-expanded="${this._listExpanded ? 'true' : 'false'}"
                >
                    <span class="variation-selector-eyebrow">Editing variant</span>
                    <span class="variation-selector-current">
                        ${selected?.name || 'Unnamed Variation'}
                        ${selectedHasSteps ? html`<span class="variation-badge">Multi-Step</span>` : ''}
                    </span>
                    <span class="variation-selector-meta">${selectedIndex + 1} / ${count}</span>
                    <span class="material-symbols-outlined variation-selector-chevron">expand_more</span>
                </button>

                ${this._listExpanded ? html`
                    <div class="variation-selector-list" role="listbox">
                        ${this.variations.map((variation, index) => html`
                            <div
                                class="variation-row ${index === selectedIndex ? 'selected' : ''}"
                                role="option"
                                aria-selected="${index === selectedIndex ? 'true' : 'false'}"
                                draggable="${this.allowReorder ? 'true' : 'false'}"
                                @dragstart="${(e) => this._onDragStart(e, index)}"
                                @dragover="${this._onDragOver}"
                                @drop="${(e) => this._onDrop(e, index)}"
                                @dragend="${this._onDragEnd}"
                                @click="${() => this._selectVariation(index)}"
                            >
                                ${this.allowReorder ? html`
                                    <span class="material-symbols-outlined variation-row-handle" title="Drag to reorder">drag_indicator</span>
                                ` : ''}
                                <span class="variation-row-title">${variation.name || 'Unnamed Variation'}</span>
                                ${variation.steps && variation.steps.length > 0 ? html`
                                    <span class="variation-badge">Multi-Step</span>
                                ` : ''}
                                ${index === selectedIndex ? html`
                                    <span class="material-symbols-outlined variation-row-check">check</span>
                                ` : ''}
                            </div>
                        `)}
                        <button class="add-variation-button" @click="${this._handleAddVariation}">
                            <span class="material-symbols-outlined">add</span>
                            Add Variation
                        </button>
                    </div>
                ` : ''}
            </div>

            ${selected ? this._renderVariation(selected, selectedIndex) : ''}
        `;
    }
}

customElements.define('wy-variation-editor', WyVariationEditor);
