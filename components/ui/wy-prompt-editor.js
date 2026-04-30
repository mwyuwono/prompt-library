import { LitElement, html, css } from 'lit';

export class WyPromptEditor extends LitElement {
    static properties = {
        prompt: { type: Object },
        categories: { type: Array },
        readonly: { type: Boolean },
        _editedPrompt: { type: Object, state: true },
        _promptMode: { type: String, state: true },
        _expandedSteps: { type: Array, state: true },
        _showGitInfo: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.prompt = null;
        this.categories = [];
        this.readonly = false;
        this._editedPrompt = null;
        this._promptMode = 'single';
        this._expandedSteps = [];
        this._showGitInfo = false;
    }

    updated(changedProperties) {
        if (changedProperties.has('prompt') && this.prompt) {
            // Create a deep copy of the prompt for editing
            this._editedPrompt = JSON.parse(JSON.stringify(this.prompt));
            
            // Generate slug from title if slug doesn't exist
            if (!this._editedPrompt.slug && this._editedPrompt.title) {
                this._editedPrompt.slug = this._generateSlug(this._editedPrompt.title);
            }

            // Detect prompt mode (single-step vs multi-step)
            // Note: variations mode is detected by checking for variations array, not by _promptMode
            this._promptMode = (this._editedPrompt.steps && this._editedPrompt.steps.length > 0) 
                ? 'multi' 
                : 'single';
            
            // Expand first step by default for multi-step prompts
            this._expandedSteps = this._promptMode === 'multi' ? [0] : [];
            
            // Reset git info banner when prompt changes (e.g., on cancel/discard)
            this._showGitInfo = false;
        }
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }

        .material-symbols-outlined {
            font-family: 'Material Symbols Outlined';
            font-size: 20px;
        }

        .editor-layout {
            display: grid;
            grid-template-columns: 58% 42%;
            gap: var(--spacing-2xl, 48px);
        }

        .editor-form {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
            overflow-y: auto;
            height: fit-content;
            padding-right: var(--spacing-sm, 8px);
        }

        .editor-header {
            padding-bottom: var(--spacing-md, 16px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .breadcrumbs {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-bottom: var(--spacing-sm, 8px);
        }

        .breadcrumbs a {
            color: var(--md-sys-color-primary, #282828);
            text-decoration: none;
        }

        .breadcrumbs a:hover {
            text-decoration: underline;
        }

        h1 {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 2rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0 0 var(--spacing-xs, 4px) 0;
        }

        .subtitle {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 1rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin-bottom: var(--spacing-md, 16px);
        }

        .info-banner {
            padding: var(--spacing-md, 16px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
            border-left: 4px solid var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .info-banner p {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
            line-height: 1.5;
        }

        .info-banner code {
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.8125rem;
            padding: 2px 6px;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
        }

        .actions {
            display: flex;
            gap: var(--spacing-sm, 8px);
            margin: 0 0 var(--spacing-md, 16px) 0;
        }

        .button {
            padding: var(--spacing-sm, 8px) var(--spacing-lg, 24px);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .button-secondary {
            background-color: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            color: var(--md-sys-color-on-surface, #121714);
        }

        .button-secondary:hover {
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
        }

        .button-primary {
            background-color: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFFFFF);
        }

        .button-primary:hover {
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 90%, black);
        }

        .card {
            background-color: var(--md-sys-color-surface, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-large, 24px);
            padding: var(--spacing-lg, 24px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .card-title {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0 0 var(--spacing-md, 16px) 0;
        }

        .editor-preview {
            position: sticky;
            top: var(--spacing-lg, 24px);
            height: fit-content;
        }

        .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-title {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .preview-status {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-primary, #282828);
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
        }

        .preview-card {
            background-color: var(--md-sys-color-surface, #F5F2EA);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--spacing-lg, 24px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .preview-image {
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            border-radius: var(--md-sys-shape-corner-small, 8px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-badge {
            display: inline-block;
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            color: var(--md-sys-color-primary, #282828);
            border-radius: var(--md-sys-shape-corner-xs, 4px);
            margin-bottom: var(--spacing-sm, 8px);
        }

        .preview-title-text {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0 0 var(--spacing-sm, 8px) 0;
        }

        .preview-description {
            font-family: var(--font-body, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin: 0;
        }

        .preview-icon {
            width: 48px;
            height: 48px;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 10%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: var(--spacing-md, 16px);
        }

        .preview-icon .material-symbols-outlined {
            font-size: 24px;
            color: var(--md-sys-color-primary, #282828);
        }

        .mode-toggle {
            display: flex;
            gap: var(--spacing-md, 16px);
            padding: var(--spacing-md, 16px);
            background-color: var(--md-sys-color-surface-variant, #F5F2EA);
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

        .card-description {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
            line-height: 1.5;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin: 0 0 var(--spacing-md, 16px) 0;
        }

        .add-step-button {
            width: 100%;
            margin-top: var(--spacing-md, 16px);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--spacing-xs, 4px);
        }

        .card-header-with-action {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--spacing-md, 16px);
            margin-bottom: var(--spacing-md, 16px);
        }

        .card-header-with-action > div {
            flex: 1;
        }

        .button-ghost {
            background: transparent;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            color: var(--md-sys-color-primary, #282828);
            position: relative;
            overflow: hidden;
        }

        .button-ghost::before {
            content: '';
            position: absolute;
            inset: 0;
            background-color: var(--md-sys-color-primary, #282828);
            opacity: 0;
            transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            pointer-events: none;
        }

        .button-ghost:hover::before {
            opacity: var(--md-sys-state-hover-opacity, 0.08);
        }

        .button-ghost:hover {
            border-color: var(--md-sys-color-primary, #282828);
        }

        .button-small {
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            font-size: 0.8125rem;
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            white-space: nowrap;
        }

        @media (max-width: 1200px) {
            .editor-layout {
                grid-template-columns: 1fr;
            }

            .editor-preview {
                position: static;
            }
        }
    `;

    _generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    _handleFieldChange(field, value) {
        if (!this._editedPrompt) return;
        
        this._editedPrompt = {
            ...this._editedPrompt,
            [field]: value
        };

        // Auto-generate slug when title changes
        if (field === 'title') {
            this._editedPrompt.slug = this._generateSlug(value);
        }

        this.requestUpdate();
    }

    _getTextareaValue(codeTextarea) {
        const textarea = codeTextarea?.shadowRoot?.querySelector('textarea');
        return textarea ? textarea.value : null;
    }

    _syncStandardTemplateForSave() {
        const codeTextarea = this.shadowRoot.querySelector('wy-code-textarea');
        const value = this._getTextareaValue(codeTextarea);
        if (value !== null) {
            this._editedPrompt.template = value;
        }
    }

    _syncStepTemplatesForSave(stepEditors, steps) {
        if (!stepEditors || !steps) return;

        stepEditors.forEach((stepEditor, index) => {
            const codeTextarea = stepEditor.shadowRoot?.querySelector('wy-code-textarea');
            const value = this._getTextareaValue(codeTextarea);
            if (value !== null && steps[index]) {
                steps[index].template = value;
            }
        });
    }

    _syncVariationTemplatesForSave() {
        const variationEditor = this.shadowRoot.querySelector('wy-variation-editor');
        const variations = this._editedPrompt?.variations;
        if (!variationEditor || !variations) return;

        const variationCards = variationEditor.shadowRoot?.querySelectorAll('.variation-card') || [];
        variationCards.forEach((card, index) => {
            const variation = variations[index];
            if (!variation) return;

            if (variation.steps && variation.steps.length > 0) {
                const stepEditors = card.querySelectorAll('wy-step-editor');
                this._syncStepTemplatesForSave(stepEditors, variation.steps);
                return;
            }

            const codeTextarea = card.querySelector('wy-code-textarea');
            const value = this._getTextareaValue(codeTextarea);
            if (value !== null) {
                variation.template = value;
            }
        });
    }

    _handleSave() {
        if (this._editedPrompt?.variations?.length > 0) {
            this._syncVariationTemplatesForSave();
        } else if (this._promptMode === 'multi') {
            this._syncStepTemplatesForSave(
                this.shadowRoot.querySelectorAll('wy-step-editor'),
                this._editedPrompt.steps
            );
        } else {
            this._syncStandardTemplateForSave();
        }
        
        // Show git info banner after save
        this._showGitInfo = true;
        
        this.dispatchEvent(new CustomEvent('save', {
            detail: { prompt: this._editedPrompt },
            bubbles: true,
            composed: true
        }));
    }

    _handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel', {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    _getPreviewImage() {
        if (this._editedPrompt?.variations?.length > 0) {
            return this._editedPrompt.image || this._editedPrompt.variations[0]?.image || '';
        }

        return this._editedPrompt?.image || '';
    }

    setImageValue({ target = 'prompt', variationIndex = null, variationId = null } = {}, imagePath = '') {
        if (!this._editedPrompt) return;

        const resolvedVariationIndex = variationId
            ? this._editedPrompt.variations?.findIndex(variation => variation.id === variationId)
            : variationIndex;

        if (target === 'variation' && Number.isInteger(resolvedVariationIndex) && this._editedPrompt.variations?.[resolvedVariationIndex]) {
            const variations = [...this._editedPrompt.variations];
            variations[resolvedVariationIndex] = {
                ...variations[resolvedVariationIndex],
                image: imagePath
            };
            this._editedPrompt = {
                ...this._editedPrompt,
                variations
            };
            return;
        }

        this._editedPrompt = {
            ...this._editedPrompt,
            image: imagePath
        };
    }

    _handleImageChange(e) {
        const { file } = e.detail;
        this.dispatchEvent(new CustomEvent('image-upload', {
            detail: { file, promptId: this._editedPrompt?.id, target: 'prompt' },
            bubbles: true,
            composed: true
        }));
    }

    _handleImageRemove() {
        this._handleFieldChange('image', '');
        this.dispatchEvent(new CustomEvent('image-remove', {
            detail: { promptId: this._editedPrompt?.id, target: 'prompt' },
            bubbles: true,
            composed: true
        }));
    }

    _handleVariationImageChange(e) {
        e.stopPropagation();
        const { file, target, variationIndex, variationId } = e.detail;
        this.dispatchEvent(new CustomEvent('image-upload', {
            detail: { file, promptId: this._editedPrompt?.id, target, variationIndex, variationId },
            bubbles: true,
            composed: true
        }));
    }

    _handleVariationImageRemove(e) {
        e.stopPropagation();
        const { target, variationIndex, variationId } = e.detail;
        this.dispatchEvent(new CustomEvent('image-remove', {
            detail: { promptId: this._editedPrompt?.id, target, variationIndex, variationId },
            bubbles: true,
            composed: true
        }));
    }

    _handleVariationsChange(e) {
        if (!e.detail?.variations) return;
        this._handleFieldChange('variations', e.detail.variations);
    }

    _handleModeChange(event, newMode) {
        if (newMode === this._promptMode) return;
        
        // Show confirmation modal
        const confirmMessage = newMode === 'multi'
            ? 'Convert to multi-step prompt?\n\nThis will move your template and variables into a single step.'
            : 'Convert to single-step prompt?\n\nThis will use Step 1 as the template and discard other steps.';
        
        if (!confirm(confirmMessage)) {
            // Prevent the radio button from changing
            event.preventDefault();
            // Force re-render to reset radio buttons to current mode
            this.requestUpdate();
            return;
        }
        
        this._convertPromptMode(newMode);
    }

    _convertPromptMode(newMode) {
        if (newMode === 'multi') {
            // Single → Multi: Create one step from existing template
            this._editedPrompt.steps = [{
                id: 'step-1',
                name: 'Step 1',
                instructions: '',
                template: this._editedPrompt.template || '',
                variables: this._editedPrompt.variables || []
            }];
            // Clear top-level template/variables
            this._editedPrompt.template = '';
            this._editedPrompt.variables = [];
            this._expandedSteps = [0];
        } else {
            // Multi → Single: Use first step as template
            const firstStep = this._editedPrompt.steps?.[0];
            this._editedPrompt.template = firstStep?.template || '';
            this._editedPrompt.variables = firstStep?.variables || [];
            delete this._editedPrompt.steps;
            this._expandedSteps = [];
        }
        
        this._promptMode = newMode;
        this.requestUpdate();
    }

    /**
     * Convert standard prompt to variations mode
     */
    _convertToVariations() {
        const variation = {
            id: 'variation-1',
            name: 'Default',
            description: '',
            image: this._editedPrompt.image || ''
        };

        if (this._promptMode === 'single') {
            // Single-step → Single-step variation
            variation.template = this._editedPrompt.template || '';
            variation.variables = [...(this._editedPrompt.variables || [])];
        } else {
            // Multi-step → Multi-step variation
            variation.steps = [...(this._editedPrompt.steps || [])];
            variation.variables = [...(this._editedPrompt.variables || [])];
        }

        this._editedPrompt.variations = [variation];
        delete this._editedPrompt.template;
        delete this._editedPrompt.steps;
        delete this._editedPrompt.image;
        this._promptMode = 'single'; // Reset mode
        this.requestUpdate();
    }

    /**
     * Convert variations mode back to standard
     */
    async _convertFromVariations() {
        if (!this._editedPrompt.variations || this._editedPrompt.variations.length === 0) {
            return;
        }

        // Show confirmation dialog
        const confirmed = confirm(
            'Convert to standard mode?\n\n' +
            'This will use the first variation as the template. ' +
            'Other variations will be removed. This cannot be undone.'
        );

        if (!confirmed) return;

        const firstVariation = this._editedPrompt.variations[0];
        
        if (firstVariation.steps) {
            // Multi-step variation → Multi-step
            this._editedPrompt.steps = [...firstVariation.steps];
            this._promptMode = 'multi';
            this._expandedSteps = [0];
        } else {
            // Single-step variation → Single-step
            this._editedPrompt.template = firstVariation.template || '';
            this._promptMode = 'single';
        }

        this._editedPrompt.variables = [...(firstVariation.variables || [])];
        this._editedPrompt.image = firstVariation.image || '';
        delete this._editedPrompt.variations;
        this.requestUpdate();
    }

    _handleStepChange(e) {
        const { index, step } = e.detail;
        this._editedPrompt.steps[index] = step;
        this.requestUpdate();
    }

    _handleStepDelete(e) {
        const { index } = e.detail;
        if (this._editedPrompt.steps.length === 1) {
            alert('Cannot delete the last step.\n\nConvert to single-step mode instead.');
            return;
        }
        this._editedPrompt.steps.splice(index, 1);
        // Update expanded steps indices
        this._expandedSteps = this._expandedSteps
            .map(i => i > index ? i - 1 : i)
            .filter(i => i < this._editedPrompt.steps.length);
        this.requestUpdate();
    }

    _handleStepMoveUp(e) {
        const { index } = e.detail;
        if (index === 0) return;
        const steps = this._editedPrompt.steps;
        [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
        // Update expanded state
        if (this._expandedSteps.includes(index)) {
            this._expandedSteps = this._expandedSteps.filter(i => i !== index);
            this._expandedSteps.push(index - 1);
        } else if (this._expandedSteps.includes(index - 1)) {
            this._expandedSteps = this._expandedSteps.filter(i => i !== index - 1);
            this._expandedSteps.push(index);
        }
        this.requestUpdate();
    }

    _handleStepMoveDown(e) {
        const { index } = e.detail;
        if (index === this._editedPrompt.steps.length - 1) return;
        const steps = this._editedPrompt.steps;
        [steps[index], steps[index + 1]] = [steps[index + 1], steps[index]];
        // Update expanded state
        if (this._expandedSteps.includes(index)) {
            this._expandedSteps = this._expandedSteps.filter(i => i !== index);
            this._expandedSteps.push(index + 1);
        } else if (this._expandedSteps.includes(index + 1)) {
            this._expandedSteps = this._expandedSteps.filter(i => i !== index + 1);
            this._expandedSteps.push(index);
        }
        this.requestUpdate();
    }

    _handleStepToggle(e) {
        const { index } = e.detail;
        const expandedIndex = this._expandedSteps.indexOf(index);
        if (expandedIndex > -1) {
            this._expandedSteps.splice(expandedIndex, 1);
        } else {
            this._expandedSteps.push(index);
        }
        this.requestUpdate();
    }

    _handleAddStep() {
        const newStepNumber = this._editedPrompt.steps.length + 1;
        const newStep = {
            id: `step-${newStepNumber}`,
            name: `Step ${newStepNumber}`,
            instructions: '',
            template: '',
            variables: []
        };
        this._editedPrompt.steps.push(newStep);
        // Expand the new step
        this._expandedSteps.push(this._editedPrompt.steps.length - 1);
        this.requestUpdate();
    }

    render() {
        if (!this._editedPrompt) {
            return html`<div>No prompt loaded</div>`;
        }

        const categoryOptions = this.categories.map(cat => ({ value: cat, label: cat }));
        const variableNames = (this._editedPrompt.variables || []).map(v => v.name);

        return html`
            <div class="editor-layout">
                <!-- Left Column: Form -->
                <div class="editor-form">
                    <!-- Header -->
                    <div class="editor-header">
                        <nav class="breadcrumbs">
                            <a href="#" @click="${(e) => { e.preventDefault(); window.location.hash = ''; }}">← Back to prompts list</a>
                        </nav>
                        <h1>Prompt Editor</h1>
                        <p class="subtitle">Edit prompt details and template</p>
                    </div>
                    
                    ${this._showGitInfo ? html`
                        <div class="info-banner">
                            <p><strong>Changes saved to prompts.json.</strong> Run <code>git add prompts.json && git commit -m "Update prompts" && git push</code> to publish. To undo: <code>git checkout -- prompts.json</code></p>
                        </div>
                    ` : ''}

                    <!-- Section 1: Basic Information -->
                    <div class="card">
                        <h2 class="card-title">Basic Information</h2>
                        <wy-form-field label="Prompt Title" id="title" required>
                            <input
                                type="text"
                                id="title"
                                .value="${this._editedPrompt.title || ''}"
                                @input="${(e) => this._handleFieldChange('title', e.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-form-field label="Slug" id="slug" description="URL-friendly identifier (auto-generated from title)">
                            <input
                                type="text"
                                id="slug"
                                .value="${this._editedPrompt.slug || ''}"
                                @input="${(e) => this._handleFieldChange('slug', e.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-form-field label="Prompt ID" id="id" description="Unique identifier (read-only)">
                            <input
                                type="text"
                                id="id"
                                .value="${this._editedPrompt.id || ''}"
                                disabled
                                readonly
                            >
                        </wy-form-field>
                        <wy-form-field label="Description" id="description">
                            <textarea
                                id="description"
                                rows="3"
                                .value="${this._editedPrompt.description || ''}"
                                @input="${(e) => this._handleFieldChange('description', e.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </wy-form-field>
                        <wy-form-field label="Instructions" id="instructions" description="Usage notes shown in the prompt modal and only on expanded prompt cards">
                            <textarea
                                id="instructions"
                                rows="4"
                                .value="${this._editedPrompt.instructions || ''}"
                                @input="${(e) => this._handleFieldChange('instructions', e.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </wy-form-field>
                    </div>

                    <!-- Section 2: Visuals & Metadata -->
                    <div class="card">
                        <h2 class="card-title">Visuals & Metadata</h2>
                        <wy-form-field label="Icon" id="icon" description="Material Symbol icon name (e.g., 'restaurant', 'code', 'music_note')">
                            <input
                                type="text"
                                id="icon"
                                .value="${this._editedPrompt.icon || ''}"
                                @input="${(e) => this._handleFieldChange('icon', e.target.value)}"
                                placeholder="icon_name"
                                ?disabled="${this.readonly}"
                            >
                        </wy-form-field>
                        <wy-dropdown
                            label="Category"
                            .value="${this._editedPrompt.category || ''}"
                            .options="${categoryOptions}"
                            @change="${(e) => this._handleFieldChange('category', e.detail.value)}"
                        ></wy-dropdown>
                        <wy-image-upload
                            label="Prompt Image"
                            .value="${this._editedPrompt.image || ''}"
                            @change="${this._handleImageChange}"
                            @remove="${this._handleImageRemove}"
                        ></wy-image-upload>
                    </div>

                    <!-- Section 3: Content Structure -->
                    ${this._editedPrompt.variations && this._editedPrompt.variations.length > 0 ? html`
                        <!-- Variations Mode -->
                        <div class="card">
                            <div class="card-header-with-action">
                                <div>
                                    <h2 class="card-title">Variations</h2>
                                    <p class="card-description">
                                        This prompt has multiple variations. Each variation can be a simple template or multi-step workflow.
                                    </p>
                                </div>
                                <button 
                                    class="button button-ghost button-small"
                                    @click="${this._convertFromVariations}"
                                    title="Convert back to standard mode"
                                >
                                    <span class="material-symbols-outlined">undo</span>
                                    Convert to Standard
                                </button>
                            </div>
                            <wy-variation-editor
                                .variations="${this._editedPrompt.variations}"
                                @change="${this._handleVariationsChange}"
                                @image-upload="${this._handleVariationImageChange}"
                                @image-remove="${this._handleVariationImageRemove}"
                            ></wy-variation-editor>
                        </div>
                    ` : html`
                        <!-- Standard Mode (No Variations) -->
                        <div class="card">
                            <div class="card-header-with-action">
                                <h2 class="card-title">Prompt Type</h2>
                                <button 
                                    class="button button-ghost button-small"
                                    @click="${this._convertToVariations}"
                                    title="Create multiple variations of this prompt"
                                >
                                    <span class="material-symbols-outlined">library_add</span>
                                    Convert to Variations
                                </button>
                            </div>
                            <div class="mode-toggle">
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="single" 
                                        ?checked="${this._promptMode === 'single'}"
                                        @click="${(e) => this._handleModeChange(e, 'single')}"
                                    >
                                    Single Step
                                </label>
                                <label>
                                    <input 
                                        type="radio" 
                                        name="mode" 
                                        value="multi" 
                                        ?checked="${this._promptMode === 'multi'}"
                                        @click="${(e) => this._handleModeChange(e, 'multi')}"
                                    >
                                    Multi-Step
                                </label>
                            </div>
                        </div>

                        <!-- Single-Step Content -->
                        ${this._promptMode === 'single' ? html`
                            <!-- Variables -->
                            <div class="card">
                                <h2 class="card-title">Variables</h2>
                                <wy-variable-editor
                                    .variables="${this._editedPrompt.variables || []}"
                                    @change="${(e) => this._handleFieldChange('variables', e.detail.variables)}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Template -->
                            <div class="card">
                                <h2 class="card-title">Template</h2>
                                <wy-code-textarea
                                    label="Prompt Template"
                                    .value="${this._editedPrompt.template || ''}"
                                    .variables="${variableNames}"
                                    placeholder="Enter your prompt template here. Use {{variable-name}} for substitutions."
                                    rows="12"
                                    @value-input="${(e) => this._handleFieldChange('template', e.detail.value)}"
                                ></wy-code-textarea>
                            </div>
                        ` : ''}

                        <!-- Multi-Step Content -->
                        ${this._promptMode === 'multi' ? html`
                            <div class="card">
                                <h2 class="card-title">Steps</h2>
                                <p class="card-description">
                                    Define the sequence of prompts. Users will follow these steps in order.
                                </p>
                                
                                ${(this._editedPrompt.steps || []).map((step, index) => html`
                                    <wy-step-editor
                                        .step="${step}"
                                        .index="${index}"
                                        .total="${this._editedPrompt.steps.length}"
                                        .expanded="${this._expandedSteps.includes(index)}"
                                        @step-change="${this._handleStepChange}"
                                        @step-delete="${this._handleStepDelete}"
                                        @step-move-up="${this._handleStepMoveUp}"
                                        @step-move-down="${this._handleStepMoveDown}"
                                        @step-toggle="${this._handleStepToggle}"
                                    ></wy-step-editor>
                                `)}
                                
                                <button 
                                    class="button button-secondary add-step-button" 
                                    @click="${this._handleAddStep}"
                                >
                                    <span class="material-symbols-outlined">add</span>
                                    Add Step
                                </button>
                            </div>
                        ` : ''}
                    `}

                    <!-- Section 5: Visibility -->
                    <div class="card">
                        <h2 class="card-title">Visibility</h2>
                        <wy-option-toggle
                            label="Featured"
                            description="Featured prompts are highlighted and sorted to the top of the library"
                            .options="${['false', 'true']}"
                            .labels="${['Off', 'On']}"
                            .value="${this._editedPrompt.featured ? 'true' : 'false'}"
                            @change="${(e) => this._handleFieldChange('featured', e.detail.checked)}"
                        ></wy-option-toggle>
                        <wy-option-toggle
                            label="Archive Prompt"
                            description="Archived prompts are hidden from the public site but remain editable here"
                            .options="${['false', 'true']}"
                            .labels="${['Off', 'On']}"
                            .value="${this._editedPrompt.archived ? 'true' : 'false'}"
                            @change="${(e) => this._handleFieldChange('archived', e.detail.checked)}"
                        ></wy-option-toggle>
                    </div>
                </div>

                <!-- Right Column: Preview -->
                <div class="editor-preview">
                    <div class="actions">
                        <button class="button button-secondary" @click="${this._handleCancel}">
                            Discard
                        </button>
                        <button class="button button-primary" @click="${this._handleSave}">
                            Save
                        </button>
                    </div>
                    
                    <div class="preview-header">
                        <h3 class="preview-title">Live Preview</h3>
                        <span class="preview-status">Updating</span>
                    </div>
                    <div class="preview-card">
                        ${this._getPreviewImage() ? html`
                            <img src="${this._getPreviewImage()}" alt="Preview" class="preview-image">
                        ` : this._editedPrompt.icon ? html`
                            <div class="preview-icon">
                                <span class="material-symbols-outlined">${this._editedPrompt.icon}</span>
                            </div>
                        ` : ''}
                        ${this._editedPrompt.category ? html`
                            <div class="preview-badge">${this._editedPrompt.category}</div>
                        ` : ''}
                        <h3 class="preview-title-text">${this._editedPrompt.title || 'Untitled Prompt'}</h3>
                        <p class="preview-description">${this._editedPrompt.description || 'No description provided.'}</p>
                        ${this._editedPrompt.instructions ? html`
                            <p class="preview-description"><strong>Instructions:</strong> ${this._editedPrompt.instructions}</p>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('wy-prompt-editor', WyPromptEditor);
