import { LitElement, html, css } from 'lit';

export class WyVariationEditor extends LitElement {
    static properties = {
        variations: { type: Array },
        allowReorder: { type: Boolean, attribute: 'allow-reorder' },
        _expandedIndex: { type: Number, state: true },
        _expandedStepsByVariation: { type: Object, state: true }
    };

    constructor() {
        super();
        this.variations = [];
        this.allowReorder = true;
        this._expandedIndex = -1;
        this._expandedStepsByVariation = {};
    }

    static styles = css`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1');

        :host {
            display: block;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
        }

        .variations-list {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .variation-card {
            background-color: var(--md-sys-color-surface-container-low, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variation-card.expanded {
            border-color: var(--md-sys-color-primary, #282828);
        }

        .variation-header {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            user-select: none;
        }

        .variation-header::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .variation-header:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .drag-handle {
            flex-shrink: 0;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: grab;
        }

        .drag-handle:active {
            cursor: grabbing;
        }

        .variation-title {
            flex: 1;
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .variation-badge {
            flex-shrink: 0;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-tertiary, #6E5C4D) 15%, transparent);
            color: var(--md-sys-color-tertiary, #6E5C4D);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .collapse-icon {
            flex-shrink: 0;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .variation-card.expanded .collapse-icon {
            transform: rotate(180deg);
        }

        .variation-content {
            display: grid;
            grid-template-rows: 0fr;
            transition: grid-template-rows var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
        }

        .variation-card.expanded .variation-content {
            grid-template-rows: 1fr;
        }

        .variation-content-inner {
            overflow: hidden;
        }

        .variation-fields {
            padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
        }

        .mode-toggle {
            display: flex;
            gap: var(--spacing-md, 16px);
            padding: var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-tertiary, #6E5C4D) 5%, transparent);
            border-radius: var(--md-sys-shape-corner-small, 8px);
        }

        .mode-toggle label {
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            cursor: pointer;
            user-select: none;
        }

        .mode-toggle input[type="radio"] {
            cursor: pointer;
        }

        .steps-section {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
        }

        .add-step-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-sm, 8px);
            background: transparent;
            border: 1px dashed var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-step-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .add-step-button:hover {
            border-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
        }

        .add-step-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .variation-controls {
            display: flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-tertiary, #6E5C4D) 5%, transparent);
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

        .add-variation-button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-md, 16px);
            background: transparent;
            border: 2px dashed var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            margin-top: var(--spacing-md, 16px);
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .add-variation-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .add-variation-button:hover {
            border-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-primary, #282828);
        }

        .add-variation-button:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .add-variation-button .material-symbols-outlined {
            font-size: 24px;
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

        .section-divider {
            height: 1px;
            background-color: var(--md-sys-color-outline-variant, #DDD);
            margin: var(--spacing-md, 16px) 0;
        }
    `;

    _handleToggle(index) {
        this._expandedIndex = this._expandedIndex === index ? -1 : index;
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
            alert('Cannot delete the last step. Convert to template mode instead.');
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

    _handleMoveUp(index) {
        if (index === 0) return;
        const updatedVariations = [...this.variations];
        [updatedVariations[index - 1], updatedVariations[index]] = 
            [updatedVariations[index], updatedVariations[index - 1]];
        this._notifyChange(updatedVariations);
    }

    _handleMoveDown(index) {
        if (index === this.variations.length - 1) return;
        const updatedVariations = [...this.variations];
        [updatedVariations[index], updatedVariations[index + 1]] = 
            [updatedVariations[index + 1], updatedVariations[index]];
        this._notifyChange(updatedVariations);
    }

    _handleDelete(index) {
        if (this.variations.length === 1) {
            alert('Cannot delete the last variation. Prompts must have at least one variation.');
            return;
        }

        const variation = this.variations[index];
        const confirmMessage = `Delete variation "${variation.name || 'Unnamed'}"?\n\nThis action cannot be undone.`;
        
        if (confirm(confirmMessage)) {
            const updatedVariations = this.variations.filter((_, i) => i !== index);
            this._notifyChange(updatedVariations);
            
            // Adjust expanded index
            if (this._expandedIndex === index) {
                this._expandedIndex = -1;
            } else if (this._expandedIndex > index) {
                this._expandedIndex--;
            }
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
                variables: []
            }
        ];
        this._notifyChange(updatedVariations);
        // Expand the new variation
        this._expandedIndex = updatedVariations.length - 1;
    }

    _notifyChange(updatedVariations) {
        this.dispatchEvent(new CustomEvent('change', {
            detail: { variations: updatedVariations },
            bubbles: true,
            composed: true
        }));
    }

    _renderVariation(variation, index) {
        const isExpanded = this._expandedIndex === index;
        const isFirst = index === 0;
        const isLast = index === this.variations.length - 1;
        const hasSteps = variation.steps && variation.steps.length > 0;
        const hasTemplate = variation.template || (!hasSteps);
        const variationMode = hasSteps ? 'multi' : 'single';
        const variableNames = (variation.variables || []).map(v => v.name);

        return html`
            <div class="variation-card ${isExpanded ? 'expanded' : ''}">
                <!-- Header -->
                <div class="variation-header" @click="${() => this._handleToggle(index)}">
                    ${this.allowReorder ? html`
                        <span class="material-symbols-outlined drag-handle">drag_indicator</span>
                    ` : ''}
                    <h3 class="variation-title">${variation.name || 'Unnamed Variation'}</h3>
                    ${hasSteps ? html`
                        <span class="variation-badge">Multi-Step</span>
                    ` : ''}
                    <span class="material-symbols-outlined collapse-icon">expand_more</span>
                </div>

                <!-- Content -->
                <div class="variation-content">
                    <div class="variation-content-inner">
                        <div class="variation-fields">
                            <!-- Variation Name -->
                            <wy-form-field label="Variation Name" required>
                                <input
                                    type="text"
                                    .value="${variation.name || ''}"
                                    @input="${(e) => this._handleFieldChange(index, 'name', e.target.value)}"
                                    placeholder="e.g., Tina Barney Style Photo"
                                    @click="${(e) => e.stopPropagation()}"
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
                                    @click="${(e) => e.stopPropagation()}"
                                >
                            </wy-form-field>

                            <!-- Variation Description -->
                            <wy-form-field label="Description">
                                <textarea
                                    rows="3"
                                    .value="${variation.description || ''}"
                                    @input="${(e) => this._handleFieldChange(index, 'description', e.target.value)}"
                                    placeholder="Description shown in variation selector"
                                    @click="${(e) => e.stopPropagation()}"
                                ></textarea>
                            </wy-form-field>

                            <div @click="${(e) => e.stopPropagation()}">
                                <wy-image-upload
                                    label="Variation Image"
                                    .value="${variation.image || ''}"
                                    @change="${(e) => this._handleImageChange(index, e)}"
                                    @remove="${() => this._handleImageRemove(index)}"
                                ></wy-image-upload>
                            </div>

                            <!-- Mode Toggle -->
                            <div class="mode-toggle" @click="${(e) => e.stopPropagation()}">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode-${index}" 
                                        value="single" 
                                        ?checked="${variationMode === 'single'}"
                                        @change="${() => this._handleModeChange(index, 'single')}"
                                    >
                                    Template
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode-${index}" 
                                        value="multi" 
                                        ?checked="${variationMode === 'multi'}"
                                        @change="${() => this._handleModeChange(index, 'multi')}"
                                    >
                                    Multi-Step
                                </label>
                            </div>

                            ${hasTemplate && !hasSteps ? html`
                                <!-- Template Mode -->
                                <div class="section-divider"></div>
                                
                                <!-- Variables -->
                                <div class="field-group">
                                    <label class="field-label">Variables</label>
                                    <p class="field-description">
                                        Define input fields for this variation
                                    </p>
                                    <wy-variable-editor
                                        .variables="${variation.variables || []}"
                                        @change="${(e) => this._handleVariableChange(index, e)}"
                                        @click="${(e) => e.stopPropagation()}"
                                    ></wy-variable-editor>
                                </div>

                                <!-- Template -->
                                <div class="field-group">
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
                                        @click="${(e) => e.stopPropagation()}"
                                    ></wy-code-textarea>
                                </div>
                            ` : ''}

                            ${hasSteps ? html`
                                <!-- Multi-Step Mode -->
                                <div class="section-divider"></div>
                                
                                <div class="field-group">
                                    <label class="field-label">Steps</label>
                                    <p class="field-description">
                                        Define the sequence of prompts for this variation
                                    </p>
                                    <div class="steps-section" @click="${(e) => e.stopPropagation()}">
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
                        <div class="variation-controls" @click="${(e) => e.stopPropagation()}">
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
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="variations-list">
                ${this.variations.map((variation, index) => 
                    this._renderVariation(variation, index)
                )}
            </div>
            <button class="add-variation-button" @click="${this._handleAddVariation}">
                <span class="material-symbols-outlined">add</span>
                Add Variation
            </button>
        `;
    }
}

customElements.define('wy-variation-editor', WyVariationEditor);
