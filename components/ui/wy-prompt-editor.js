import { LitElement, html } from 'lit';

export class WyPromptEditor extends LitElement {
    static properties = {
        prompt: { type: Object },
        categories: { type: Array },
        heroImageStatus: { type: Object },
        heroImageMasterPrompt: { type: Object },
        readonly: { type: Boolean },
        _editedPrompt: { type: Object, state: true },
        _promptMode: { type: String, state: true },
        _expandedSteps: { type: Array, state: true },
        _showGitInfo: { type: Boolean, state: true },
        _heroProvider: { type: String, state: true },
        _heroQuality: { type: String, state: true },
        _heroPrompt: { type: String, state: true },
        _heroPromptDirty: { type: Boolean, state: true },
        _heroPreview: { type: String, state: true },
        _heroPreviewMimeType: { type: String, state: true },
        _heroPreviewMetadata: { type: Object, state: true },
        _heroBusy: { type: Boolean, state: true },
        _heroMessage: { type: String, state: true },
        _heroError: { type: String, state: true },
        _heroGeneratorOpen: { type: Boolean, state: true },
        _activeSection: { type: String, state: true },
        _navOpen: { type: Boolean, state: true },
        _openVariationIndex: { type: Number, state: true },
        _isDirty: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.prompt = null;
        this.categories = [];
        this.heroImageStatus = null;
        this.heroImageMasterPrompt = null;
        this.readonly = false;
        this._editedPrompt = null;
        this._promptMode = 'single';
        this._expandedSteps = [];
        this._showGitInfo = false;
        this._heroProvider = 'google';
        this._heroQuality = 'draft';
        this._heroPrompt = '';
        this._heroPromptDirty = false;
        this._heroPreview = '';
        this._heroPreviewMimeType = '';
        this._heroPreviewMetadata = null;
        this._heroBusy = false;
        this._heroMessage = '';
        this._heroError = '';
        this._heroGeneratorOpen = false;
        this._activeSection = 'basic';
        this._navOpen = false;
        this._openVariationIndex = -1;
        this._isDirty = false;
        this._handleWindowScroll = this._handleWindowScroll.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('scroll', this._handleWindowScroll, { passive: true });
    }

    disconnectedCallback() {
        window.removeEventListener('scroll', this._handleWindowScroll);
        super.disconnectedCallback();
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
            this._activeSection = 'basic';
            this._navOpen = false;
            this._openVariationIndex = -1;
            this._isDirty = false;
            this._resetHeroImageState();
        }

        if (changedProperties.has('heroImageStatus') && this.heroImageStatus) {
            this._heroProvider = this._getDefaultHeroProvider();
        }

        if (changedProperties.has('heroImageMasterPrompt') && this._editedPrompt && !this._heroPromptDirty) {
            this._heroPrompt = this._buildHeroImagePrompt();
        }
    }

    // Light DOM: styles live in admin.css (scoped under wy-prompt-editor).
    createRenderRoot() {
        return this;
    }

    _generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    _getDefaultHeroProvider() {
        const providers = this.heroImageStatus?.providers || {};
        if (providers.google?.configured) return 'google';
        if (providers.openai?.configured) return 'openai';
        return this._heroProvider || 'google';
    }

    _resetHeroImageState() {
        this._heroProvider = this._getDefaultHeroProvider();
        this._heroQuality = 'draft';
        this._heroPrompt = this._buildHeroImagePrompt();
        this._heroPromptDirty = false;
        this._heroPreview = '';
        this._heroPreviewMimeType = '';
        this._heroPreviewMetadata = null;
        this._heroBusy = false;
        this._heroMessage = '';
        this._heroError = '';
        this._heroGeneratorOpen = false;
    }

    _getPromptTemplateSummary(prompt) {
        if (prompt.variations?.length) {
            return prompt.variations.map((variation, index) => {
                const body = variation.steps?.length
                    ? variation.steps.map(step => `${step.name || step.id || 'Step'}:\n${step.template || ''}`).join('\n\n')
                    : variation.template || '';

                return [
                    `Variation ${index + 1}: ${variation.name || variation.id || 'Untitled'}`,
                    variation.description ? `Description: ${variation.description}` : '',
                    body
                ].filter(Boolean).join('\n');
            }).join('\n\n---\n\n');
        }

        if (prompt.steps?.length) {
            return prompt.steps.map(step => `${step.name || step.id || 'Step'}:\n${step.template || ''}`).join('\n\n');
        }

        return prompt.template || '';
    }

    _buildHeroImagePrompt() {
        if (!this._editedPrompt) return '';

        const prompt = this._editedPrompt;
        const subjectPrompt = [
            `Title: ${prompt.title || 'Untitled Prompt'}`,
            prompt.category ? `Category: ${prompt.category}` : '',
            prompt.description ? `Description: ${prompt.description}` : '',
            prompt.instructions ? `Instructions: ${prompt.instructions}` : '',
            `Prompt content:\n${this._getPromptTemplateSummary(prompt) || 'No prompt content yet.'}`
        ].filter(Boolean).join('\n\n');

        const masterTemplate = this.heroImageMasterPrompt?.template || '';
        if (masterTemplate.includes('{{subject_prompt}}')) {
            return masterTemplate.replaceAll('{{subject_prompt}}', subjectPrompt);
        }

        return [
            masterTemplate || 'Generate a polished 16:9 website hero image for this prompt library entry.',
            `Subject prompt:\n${subjectPrompt}`
        ].join('\n\n');
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

        if (!this._heroPromptDirty) {
            this._heroPrompt = this._buildHeroImagePrompt();
        }

        this._markDirty();
        this.requestUpdate();
    }

    static RECOMMENDED_MODEL_VENDORS = [
        { vendor: 'anthropic', label: 'Anthropic' },
        { vendor: 'openai', label: 'OpenAI' },
        { vendor: 'google', label: 'Google Gemini' },
        { vendor: 'gemma', label: 'Gemma (local)' }
    ];

    _getRecommendedModelEntry(vendor) {
        return (this._editedPrompt?.recommendedModels || []).find(m => m.vendor === vendor) || null;
    }

    _handleRecommendedModelChange(vendor, field, value) {
        if (!this._editedPrompt) return;

        const existing = this._editedPrompt.recommendedModels || [];
        const entry = existing.find(m => m.vendor === vendor);
        let next;

        if (entry) {
            next = existing.map(m => m.vendor === vendor ? { ...m, [field]: value } : m);
        } else {
            next = [...existing, { vendor, model: '', level: '', [field]: value }];
        }

        // Drop entries with an empty model name so blank rows don't emit chips
        next = next.filter(m => (m.model || '').trim());

        this._handleFieldChange('recommendedModels', next);
    }

    _renderRecommendedModelsEditor() {
        return html`
            <div class="recommended-models-editor">
                ${WyPromptEditor.RECOMMENDED_MODEL_VENDORS.map(({ vendor, label }) => {
                    const entry = this._getRecommendedModelEntry(vendor);
                    return html`
                        <div class="recommended-model-row">
                            <span class="recommended-model-vendor-label">${label}</span>
                            <input
                                type="text"
                                placeholder="Model name"
                                .value="${entry?.model || ''}"
                                @input="${(e) => this._handleRecommendedModelChange(vendor, 'model', e.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                            <input
                                type="text"
                                placeholder="Thinking level (optional)"
                                .value="${entry?.level || ''}"
                                @input="${(e) => this._handleRecommendedModelChange(vendor, 'level', e.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                    `;
                })}
            </div>
        `;
    }

    _markDirty() {
        if (!this._isDirty) {
            this._isDirty = true;
        }
    }

    _getTextareaValue(codeTextarea) {
        const textarea = codeTextarea?.querySelector('textarea');
        return textarea ? textarea.value : null;
    }

    _syncStandardTemplateForSave() {
        const codeTextarea = this.querySelector('wy-code-textarea');
        const value = this._getTextareaValue(codeTextarea);
        if (value !== null) {
            this._editedPrompt.template = value;
        }
    }

    _syncStepTemplatesForSave(stepEditors, steps) {
        if (!stepEditors || !steps) return;

        stepEditors.forEach((stepEditor, index) => {
            const codeTextarea = stepEditor.querySelector('wy-code-textarea');
            const value = this._getTextareaValue(codeTextarea);
            if (value !== null && steps[index]) {
                steps[index].template = value;
            }
        });
    }

    _syncVariationTemplatesForSave() {
        const variationEditor = this.querySelector('wy-variation-editor');
        const variations = this._editedPrompt?.variations;
        if (!variationEditor || !variations) return;

        // Only the currently-selected variation is rendered, so map cards by their
        // data-variation-index rather than by loop position.
        const variationCards = variationEditor.querySelectorAll('.variation-card') || [];
        variationCards.forEach((card) => {
            const index = Number(card.dataset.variationIndex);
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
                this.querySelectorAll('wy-step-editor'),
                this._editedPrompt.steps
            );
        } else {
            this._syncStandardTemplateForSave();
        }
        
        // Show git info banner after save
        this._showGitInfo = true;
        this._isDirty = false;
        
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
            this._markDirty();
            return;
        }

        this._editedPrompt = {
            ...this._editedPrompt,
            image: imagePath
        };
        this._markDirty();
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

    setReferenceImageValue(index, imagePath) {
        if (!this._editedPrompt) return;
        const refs = [...(this._editedPrompt.referenceImages || [])];
        if (refs[index]) {
            refs[index] = { ...refs[index], path: imagePath };
            this._editedPrompt = { ...this._editedPrompt, referenceImages: refs };
            this._markDirty();
        }
    }

    _handleRefImageUpload(e) {
        const { file, index } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-upload', {
            detail: { file, promptId: this._editedPrompt?.id, index },
            bubbles: true,
            composed: true
        }));
    }

    _handleRefImageRemove(e) {
        const { index, path } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-remove', {
            detail: { promptId: this._editedPrompt?.id, index, path },
            bubbles: true,
            composed: true
        }));
    }

    _handleVariationRefImageUpload(e) {
        e.stopPropagation();
        const { file, index, variationIndex, variationId } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-upload', {
            detail: { file, promptId: this._editedPrompt?.id, index, variationIndex, variationId },
            bubbles: true,
            composed: true
        }));
    }

    _handleVariationRefImageRemove(e) {
        e.stopPropagation();
        const { index, path, variationIndex, variationId } = e.detail;
        this.dispatchEvent(new CustomEvent('reference-image-remove', {
            detail: { promptId: this._editedPrompt?.id, index, path, variationIndex, variationId },
            bubbles: true,
            composed: true
        }));
    }

    setVariationReferenceImageValue(variationIndex, refIndex, imagePath) {
        if (!this._editedPrompt) return;
        const variations = [...(this._editedPrompt.variations || [])];
        if (!variations[variationIndex]) return;
        const refs = [...(variations[variationIndex].referenceImages || [])];
        if (refs[refIndex]) {
            refs[refIndex] = { ...refs[refIndex], path: imagePath };
            variations[variationIndex] = { ...variations[variationIndex], referenceImages: refs };
            this._editedPrompt = { ...this._editedPrompt, variations };
            this._markDirty();
        }
    }

    _handleHeroProviderChange(e) {
        this._heroProvider = e.target.value;
        this._heroError = '';
    }

    _handleHeroQualityChange(e) {
        this._heroQuality = e.target.value;
        this._heroError = '';
    }

    _handleHeroPromptInput(e) {
        this._heroPrompt = e.target.value;
        this._heroPromptDirty = true;
        this._heroError = '';
    }

    _handleHeroGeneratorToggle(e) {
        this._heroGeneratorOpen = e.currentTarget.open;
    }

    _handleResetHeroPrompt() {
        this._heroPrompt = this._buildHeroImagePrompt();
        this._heroPromptDirty = false;
        this._heroMessage = 'Prompt reset from current editor fields.';
        this._heroError = '';
    }

    _handleGenerateHeroImage() {
        if (!this._heroPrompt.trim()) {
            this._heroError = 'Add prompt text before generating.';
            return;
        }

        const providerStatus = this.heroImageStatus?.providers?.[this._heroProvider];
        if (!providerStatus?.configured) {
            this._heroError = this._heroProvider === 'openai'
                ? 'OPENAI_API_KEY is not configured on the Admin server.'
                : 'GEMINI_API_KEY is not configured on the Admin server.';
            return;
        }

        this._heroBusy = true;
        this._heroGeneratorOpen = true;
        this._heroError = '';
        this._heroMessage = 'Generating preview...';

        this.dispatchEvent(new CustomEvent('hero-image-generate', {
            detail: {
                provider: this._heroProvider,
                quality: this._heroQuality,
                prompt: this._heroPrompt
            },
            bubbles: true,
            composed: true
        }));
    }

    setHeroImagePreview({ image = '', mimeType = 'image/png', metadata = null } = {}) {
        this._heroPreview = image;
        this._heroPreviewMimeType = mimeType;
        this._heroPreviewMetadata = metadata;
        this._heroBusy = false;
        this._heroError = '';
        this._heroGeneratorOpen = true;
        this._heroMessage = image ? 'Preview generated. Accept it to attach it as this prompt image.' : '';
    }

    setHeroImageError(message) {
        this._heroBusy = false;
        this._heroGeneratorOpen = true;
        this._heroError = message || 'Hero image generation failed.';
        this._heroMessage = '';
    }

    _handleUseHeroImage() {
        if (!this._heroPreview) {
            this._heroError = 'Generate a preview before attaching it.';
            return;
        }

        this._heroBusy = true;
        this._heroError = '';
        this._heroMessage = 'Saving generated image...';

        this.dispatchEvent(new CustomEvent('hero-image-use', {
            detail: {
                promptId: this._editedPrompt?.id,
                image: this._heroPreview,
                mimeType: this._heroPreviewMimeType,
                metadata: this._heroPreviewMetadata
            },
            bubbles: true,
            composed: true
        }));
    }

    setHeroImageAccepted(imagePath) {
        this.setImageValue({ target: 'prompt' }, imagePath);
        this._heroBusy = false;
        this._heroError = '';
        this._heroMessage = 'Generated image attached. Save the prompt to keep this change.';
        this._heroGeneratorOpen = false;
        this._heroPreview = '';
        this._heroPreviewMimeType = '';
        this._heroPreviewMetadata = null;
    }

    _handleClearHeroPreview() {
        this._heroPreview = '';
        this._heroPreviewMimeType = '';
        this._heroPreviewMetadata = null;
        this._heroMessage = '';
        this._heroError = '';
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
        if (!Array.isArray(e.detail?.variations)) return;
        this._handleFieldChange('variations', e.detail.variations);
    }

    _handleVariationSelectorChange(enabled) {
        if (!this._editedPrompt) return;

        if (enabled) {
            this._handleFieldChange('variationSelector', 'visual');
            return;
        }

        const { variationSelector, variationSelectorTileMode, fullScreenModal, ...promptWithoutSelector } = this._editedPrompt;
        this._editedPrompt = promptWithoutSelector;
        this._markDirty();
        this.requestUpdate();
    }

    _handleVariationTileModeChange(mode) {
        if (!this._editedPrompt || this._editedPrompt.variationSelector !== 'visual') return;
        const nextMode = mode === 'details' ? 'details' : 'thumbnail';
        this._handleFieldChange('variationSelectorTileMode', nextMode);
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
        this._markDirty();
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
        this._markDirty();
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
        delete this._editedPrompt.variationSelector;
        delete this._editedPrompt.variationSelectorTileMode;
        delete this._editedPrompt.fullScreenModal;
        this._markDirty();
        this.requestUpdate();
    }

    _handleStepChange(e) {
        const { index, step } = e.detail;
        this._editedPrompt.steps[index] = step;
        this._markDirty();
        this.requestUpdate();
    }

    _handleStepDelete(e) {
        const { index } = e.detail;
        if (this._editedPrompt.steps.length === 1) {
            this._notifyToast('Cannot delete the last step. Convert to single-step mode instead.', 'warning');
            return;
        }
        this._editedPrompt.steps.splice(index, 1);
        // Update expanded steps indices
        this._expandedSteps = this._expandedSteps
            .map(i => i > index ? i - 1 : i)
            .filter(i => i < this._editedPrompt.steps.length);
        this._markDirty();
        this.requestUpdate();
    }

    _notifyToast(message, type = 'info') {
        this.dispatchEvent(new CustomEvent('toast', {
            detail: { message, type },
            bubbles: true,
            composed: true
        }));
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
        this._markDirty();
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
        this._markDirty();
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
        this._markDirty();
        this.requestUpdate();
    }

    _getNavItems() {
        if (!this._editedPrompt) return [];

        const items = [
            { id: 'basic', label: 'Basic Information' },
            { id: 'visuals', label: 'Visuals & Metadata' }
        ];

        if (this._editedPrompt.variations?.length) {
            items.push({ id: 'variations', label: 'Variations' });
            // Only the active variant is shown in the nav to reduce clutter; one variant
            // is editable at a time and selection is driven from the Variations card.
            const activeIndex = this._openVariationIndex >= 0 ? this._openVariationIndex : 0;
            const variation = this._editedPrompt.variations[activeIndex];
            if (variation) {
                const index = activeIndex;
                const id = `variation-${index}`;
                items.push({
                    id,
                    label: variation.name || `Variation ${index + 1}`,
                    type: 'variant',
                    variationIndex: index
                });

                const hasSteps = variation.steps && variation.steps.length > 0;
                items.push({ id: `${id}-description`, label: 'Description', type: 'subitem', variationIndex: index, vsection: 'description' });
                items.push({ id: `${id}-instructions`, label: 'Instructions', type: 'subitem', variationIndex: index, vsection: 'instructions' });
                items.push({ id: `${id}-image`, label: 'Image', type: 'subitem', variationIndex: index, vsection: 'image' });
                items.push({ id: `${id}-${hasSteps ? 'steps' : 'variables'}`, label: hasSteps ? 'Steps' : 'Variables', type: 'subitem', variationIndex: index, vsection: hasSteps ? 'steps' : 'variables' });
                if (!hasSteps) {
                    items.push({ id: `${id}-template`, label: 'Template', type: 'subitem', variationIndex: index, vsection: 'template' });
                }
            }
        } else {
            items.push({ id: 'prompt-type', label: 'Prompt Type' });
            if (this._promptMode === 'single') {
                items.push({ id: 'variables', label: 'Variables' });
                items.push({ id: 'reference-images', label: 'Reference Images' });
                items.push({ id: 'template', label: 'Template' });
            } else {
                items.push({ id: 'steps', label: 'Steps' });
            }
        }

        items.push({ id: 'visibility', label: 'Visibility' });
        return items;
    }

    _renderEditorNav() {
        const items = this._getNavItems();
        const activeItem = items.find(item => item.id === this._activeSection) || items[0];

        return html`
            <nav class="editor-nav ${this._navOpen ? 'open' : ''}" aria-label="Prompt editor sections">
                <button
                    class="editor-nav-toggle"
                    type="button"
                    @click="${() => { this._navOpen = !this._navOpen; }}"
                    aria-expanded="${this._navOpen ? 'true' : 'false'}"
                >
                    <span>${activeItem?.label || 'Jump to section'}</span>
                    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                </button>
                <p class="editor-nav-title">Jump to</p>
                <div class="editor-nav-list">
                    ${items.map(item => html`
                        <button
                            class="editor-nav-item ${item.type || ''} ${this._activeSection === item.id ? 'active' : ''}"
                            type="button"
                            title="${item.label}"
                            @click="${() => this._jumpToNavItem(item)}"
                        >${item.label}</button>
                    `)}
                </div>
            </nav>
        `;
    }

    async _jumpToNavItem(item) {
        if (!item) return;
        this._activeSection = item.id;
        this._navOpen = false;

        if (Number.isInteger(item.variationIndex)) {
            const variationEditor = this.querySelector('wy-variation-editor');
            variationEditor?.expandVariation(item.variationIndex);
            this._openVariationIndex = item.variationIndex;
            await this.updateComplete;
            await variationEditor?.updateComplete;
            const target = variationEditor?.getSectionElement(item.variationIndex, item.vsection || 'variation');
            this._scrollTargetIntoView(target);
            return;
        }

        this._scrollTargetIntoView(this.querySelector(`[data-section="${item.id}"]`));
    }

    _scrollTargetIntoView(target) {
        if (!target) return;
        target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    _renderPromptImageControl() {
        const image = this._editedPrompt?.image || '';

        if (!image) {
            return html`
                <wy-image-upload
                    label="Prompt Image"
                    compact
                    @change="${this._handleImageChange}"
                    @remove="${this._handleImageRemove}"
                ></wy-image-upload>
            `;
        }

        return html`
            <div class="label">Prompt Image</div>
            <div class="prompt-image-card">
                <details>
                    <summary class="prompt-image-summary">
                        <img class="prompt-image-thumbnail" src="${image}" alt="Prompt hero thumbnail">
                        <span class="prompt-image-copy">
                            <span class="prompt-image-title">Hero image attached</span>
                            <span class="prompt-image-hint">Open to preview larger. Remove it to upload a replacement.</span>
                        </span>
                    </summary>
                    <div class="prompt-image-expanded">
                        <img src="${image}" alt="Prompt hero preview">
                    </div>
                </details>
                <button
                    class="prompt-image-remove"
                    type="button"
                    @click="${this._handleImageRemove}"
                    aria-label="Remove image"
                    title="Remove image"
                >
                    <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
            </div>
        `;
    }

    _renderPreviewBaseImage() {
        const image = this._editedPrompt?.previewBaseImage || '';
        if (!image) return '';

        const description = this._editedPrompt.previewBaseImageDescription ||
            'Shared before image used to generate this prompt family’s variant previews.';

        return html`
            <div class="preview-base-image-field">
                <div class="label">Canonical Preview Base Image</div>
                <p class="field-description">
                    Shown as the before image beside the prompt overview thumbnail on the published site.
                </p>
                <figure class="preview-base-image-card">
                    <img src="${image}" alt="${description}">
                    <figcaption>
                        <span class="preview-base-image-title">Before image</span>
                        <span class="preview-base-image-description">${description}</span>
                        <code>${image}</code>
                    </figcaption>
                </figure>
            </div>
        `;
    }

    _handleVariationExpand(e) {
        this._openVariationIndex = e.detail?.index ?? -1;
    }

    _handleWindowScroll() {
        if (!this._editedPrompt) return;
        const sections = [...this.querySelectorAll('[data-section]')]
            .map(element => ({ id: element.dataset.section, element }));
        const variationEditor = this.querySelector('wy-variation-editor');

        if (variationEditor && this._openVariationIndex >= 0) {
            ['description', 'instructions', 'image', 'variables', 'template', 'steps'].forEach(section => {
                const element = variationEditor.getSectionElement?.(this._openVariationIndex, section);
                if (element && element.dataset?.vsection === section) {
                    sections.push({
                        id: `variation-${this._openVariationIndex}-${section}`,
                        element
                    });
                }
            });
        }

        let nearest = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        sections.forEach(({ id, element }) => {
            const distance = Math.abs(element.getBoundingClientRect().top - 120);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = id;
            }
        });

        if (nearest && nearest !== this._activeSection) {
            this._activeSection = nearest;
        }
    }

    _renderHeroImageGenerator() {
        const providers = this.heroImageStatus?.providers || {};
        const providerOptions = [
            { value: 'google', label: 'Google Nano Banana 2', configured: Boolean(providers.google?.configured) },
            { value: 'openai', label: 'OpenAI GPT Image', configured: Boolean(providers.openai?.configured) }
        ];
        const hasConfiguredProvider = providerOptions.some(option => option.configured);
        const selectedProviderConfigured = providerOptions.find(option => option.value === this._heroProvider)?.configured;
        const previewUrl = this._heroPreview
            ? `data:${this._heroPreviewMimeType || 'image/png'};base64,${this._heroPreview}`
            : '';

        return html`
            <details
                class="hero-generator"
                .open="${this._heroGeneratorOpen}"
                @toggle="${this._handleHeroGeneratorToggle}"
            >
                <summary class="hero-generator-summary">
                    <span class="hero-generator-summary-text">
                        <span class="hero-generator-title">Generate Hero Image</span>
                        <span class="hero-provider-status">
                            ${hasConfiguredProvider
                                ? 'Preview and attach a generated image.'
                                : 'Image generation needs an API key.'}
                        </span>
                    </span>
                    <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
                </summary>

                <div class="hero-generator-body">
                    <div class="hero-generator-header">
                        <div class="hero-controls">
                            <label class="hero-control-label">
                                Provider
                                <select
                                    .value="${this._heroProvider}"
                                    @change="${this._handleHeroProviderChange}"
                                    ?disabled="${this._heroBusy}"
                                >
                                    ${providerOptions.map(option => html`
                                        <option value="${option.value}">
                                            ${option.label}${option.configured ? '' : ' (not configured)'}
                                        </option>
                                    `)}
                                </select>
                            </label>
                            <label class="hero-control-label">
                                Quality
                                <select
                                    .value="${this._heroQuality}"
                                    @change="${this._handleHeroQualityChange}"
                                    ?disabled="${this._heroBusy}"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="standard">Standard</option>
                                    <option value="final">Final</option>
                                </select>
                            </label>
                        </div>
                        <div class="hero-generator-tools">
                            <a
                                class="button button-ghost button-small"
                                href="/admin-settings.html#hero-image-master-prompt"
                                title="Edit the persistent master prompt used by this generator"
                            >
                                <span class="material-symbols-outlined">edit</span>
                                Edit Master
                            </a>
                            <button
                                class="button button-ghost button-small"
                                type="button"
                                @click="${this._handleResetHeroPrompt}"
                                ?disabled="${this._heroBusy}"
                            >
                                <span class="material-symbols-outlined">refresh</span>
                                Reset Prompt
                            </button>
                        </div>
                    </div>

                    <label class="hero-control-label">
                        Image prompt
                        <textarea
                            class="hero-prompt-textarea"
                            .value="${this._heroPrompt}"
                            @input="${this._handleHeroPromptInput}"
                            ?disabled="${this._heroBusy}"
                        ></textarea>
                    </label>

                    <div class="hero-actions">
                        <button
                            class="button button-primary"
                            type="button"
                            @click="${this._handleGenerateHeroImage}"
                            ?disabled="${this._heroBusy || !selectedProviderConfigured}"
                        >
                            ${this._heroPreview ? 'Regenerate Preview' : 'Generate Preview'}
                        </button>
                        ${this._heroPreview ? html`
                            <button
                                class="button button-secondary"
                                type="button"
                                @click="${this._handleClearHeroPreview}"
                                ?disabled="${this._heroBusy}"
                            >
                                Clear Preview
                            </button>
                        ` : ''}
                    </div>

                    ${this._heroError ? html`<p class="hero-error-message">${this._heroError}</p>` : ''}
                    ${this._heroMessage ? html`<p class="hero-status-message">${this._heroMessage}</p>` : ''}

                    ${previewUrl ? html`
                        <div class="hero-preview-shell">
                            <img class="hero-preview-image" src="${previewUrl}" alt="Generated hero preview">
                            <div class="hero-preview-actions">
                                <button
                                    class="button button-primary"
                                    type="button"
                                    @click="${this._handleUseHeroImage}"
                                    ?disabled="${this._heroBusy}"
                                >
                                    Use as Hero
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </details>
        `;
    }

    render() {
        if (!this._editedPrompt) {
            return html`<div>No prompt loaded</div>`;
        }

        const categoryOptions = this.categories.map(cat => ({ value: cat, label: cat }));
        const variableNames = (this._editedPrompt.variables || []).map(v => v.name);

        return html`
            <div class="editor-layout">
                <div class="actions">
                    <div class="toolbar-context">
                        <span class="toolbar-title">${this._editedPrompt.title || 'Untitled Prompt'}</span>
                        ${this._isDirty ? html`<span class="toolbar-dirty" title="Unsaved changes"></span>` : ''}
                    </div>
                    <div class="toolbar-actions">
                        <button class="button button-secondary" @click="${this._handleCancel}">
                            Discard
                        </button>
                        <button class="button button-primary" @click="${this._handleSave}">
                            Save
                        </button>
                    </div>
                </div>

                ${this._renderEditorNav()}

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
                    <div class="card" data-section="basic">
                        <h2 class="card-title" data-eyebrow="Section 01">Basic Information</h2>
                        <div class="form-field">
                            <label class="field-label" for="title">Prompt Title<span class="req">*</span></label>
                            <input
                                type="text"
                                id="title"
                                .value="${this._editedPrompt.title || ''}"
                                @input="${(e) => this._handleFieldChange('title', e.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="slug">Slug</label>
                            <p class="field-description">URL-friendly identifier (auto-generated from title)</p>
                            <input
                                type="text"
                                id="slug"
                                .value="${this._editedPrompt.slug || ''}"
                                @input="${(e) => this._handleFieldChange('slug', e.target.value)}"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="id">Prompt ID</label>
                            <p class="field-description">Unique identifier (read-only)</p>
                            <input
                                type="text"
                                id="id"
                                .value="${this._editedPrompt.id || ''}"
                                disabled
                                readonly
                            >
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="description">Description</label>
                            <textarea
                                id="description"
                                rows="3"
                                .value="${this._editedPrompt.description || ''}"
                                @input="${(e) => this._handleFieldChange('description', e.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </div>
                        <div class="form-field">
                            <label class="field-label" for="instructions">Instructions</label>
                            <p class="field-description">Usage notes shown in the prompt modal and only on expanded prompt cards</p>
                            <textarea
                                id="instructions"
                                rows="4"
                                .value="${this._editedPrompt.instructions || ''}"
                                @input="${(e) => this._handleFieldChange('instructions', e.target.value)}"
                                ?disabled="${this.readonly}"
                            ></textarea>
                        </div>
                    </div>

                    <!-- Section 1.5: Recommended Models -->
                    <div class="card" data-section="recommended-models">
                        <h2 class="card-title" data-eyebrow="Section 01">Recommended Models</h2>
                        <p class="card-description">
                            Up to one model per vendor (Anthropic, OpenAI, Google, Gemma). Leave the model field blank to omit a vendor's chip.
                        </p>
                        ${this._renderRecommendedModelsEditor()}
                    </div>

                    <!-- Section 2: Visuals & Metadata -->
                    <div class="card" data-section="visuals">
                        <h2 class="card-title" data-eyebrow="Section 02">Visuals & Metadata</h2>
                        <div class="form-field">
                            <label class="field-label" for="icon">Icon</label>
                            <p class="field-description">Material Symbol icon name (e.g., 'restaurant', 'code', 'music_note')</p>
                            <input
                                type="text"
                                id="icon"
                                .value="${this._editedPrompt.icon || ''}"
                                @input="${(e) => this._handleFieldChange('icon', e.target.value)}"
                                placeholder="icon_name"
                                ?disabled="${this.readonly}"
                            >
                        </div>
                        <wy-dropdown
                            label="Category"
                            .value="${this._editedPrompt.category || ''}"
                            .options="${categoryOptions}"
                            @change="${(e) => this._handleFieldChange('category', e.detail.value)}"
                        ></wy-dropdown>
                        ${this._renderPromptImageControl()}
                        ${this._renderPreviewBaseImage()}
                        ${this._renderHeroImageGenerator()}
                    </div>

                    <!-- Section 3: Content Structure -->
                    ${this._editedPrompt.variations && this._editedPrompt.variations.length > 0 ? html`
                        <!-- Variations Mode -->
                        <div class="card" data-section="variations">
                            <div class="card-header-with-action">
                                <div>
                                    <h2 class="card-title" data-eyebrow="Section 03">Variations</h2>
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
                            <div class="variation-display-setting">
                                <span class="variation-display-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">grid_view</span>
                                </span>
                                <div class="variation-display-options">
                                    <wy-option-toggle
                                        size="compact"
                                        label="Variant Selector"
                                        .options="${['dropdown', 'visual']}"
                                        .labels="${['Dropdown', 'Visual']}"
                                        .value="${this._editedPrompt.variationSelector === 'visual' ? 'visual' : 'dropdown'}"
                                        @change="${(e) => this._handleVariationSelectorChange(e.detail.value === 'visual')}"
                                    ></wy-option-toggle>
                                    ${this._editedPrompt.variationSelector === 'visual' ? html`
                                        <wy-option-toggle
                                            size="compact"
                                            label="Tiles"
                                            .options="${['thumbnail', 'details']}"
                                            .labels="${['Thumbnail only', 'Title + description']}"
                                            .value="${this._editedPrompt.variationSelectorTileMode === 'details' ? 'details' : 'thumbnail'}"
                                            @change="${(e) => this._handleVariationTileModeChange(e.detail.value)}"
                                        ></wy-option-toggle>

                                        <wy-option-toggle
                                            variant="switch"
                                            size="compact"
                                            label="Full-screen modal"
                                            description="Expands prompts with many visual variants."
                                            .options="${[false, true]}"
                                            .labels="${['Off', 'On']}"
                                            .value="${this._editedPrompt.fullScreenModal === true}"
                                            @change="${(e) => this._handleFieldChange('fullScreenModal', e.detail.value === true)}"
                                        ></wy-option-toggle>
                                    ` : ''}
                                </div>
                            </div>
                            <wy-variation-editor
                                .variations="${this._editedPrompt.variations}"
                                @change="${this._handleVariationsChange}"
                                @variation-expand="${this._handleVariationExpand}"
                                @image-upload="${this._handleVariationImageChange}"
                                @image-remove="${this._handleVariationImageRemove}"
                                @reference-image-upload="${this._handleVariationRefImageUpload}"
                                @reference-image-remove="${this._handleVariationRefImageRemove}"
                            ></wy-variation-editor>
                        </div>
                    ` : html`
                        <!-- Standard Mode (No Variations) -->
                        <div class="card" data-section="prompt-type">
                            <div class="card-header-with-action">
                                <h2 class="card-title" data-eyebrow="Section 03">Prompt Type</h2>
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
                            <div class="card" data-section="variables">
                                <h2 class="card-title" data-eyebrow="Section 04">Variables</h2>
                                <wy-variable-editor
                                    .variables="${this._editedPrompt.variables || []}"
                                    @change="${(e) => this._handleFieldChange('variables', e.detail.variables)}"
                                ></wy-variable-editor>
                            </div>

                            <!-- Reference Images -->
                            <div class="card" data-section="reference-images">
                                <div class="card-header-with-action">
                                    <div>
                                        <h2 class="card-title" data-eyebrow="Section 05">Reference Images</h2>
                                        <p class="card-description">Upload images and reference them in your template with {{variable_name}}. Their public URLs are substituted when the prompt is copied.</p>
                                    </div>
                                    <a class="button-secondary" href="/reference-library.html" target="_blank" rel="noopener">
                                        <span class="material-symbols-outlined" aria-hidden="true">image_search</span>
                                        Browse
                                    </a>
                                </div>
                                <wy-reference-image-editor
                                    .referenceImages="${this._editedPrompt.referenceImages || []}"
                                    @change="${(e) => this._handleFieldChange('referenceImages', e.detail.referenceImages)}"
                                    @reference-image-upload="${this._handleRefImageUpload}"
                                    @reference-image-remove="${this._handleRefImageRemove}"
                                ></wy-reference-image-editor>
                            </div>

                            <!-- Template -->
                            <div class="card" data-section="template">
                                <h2 class="card-title" data-eyebrow="Section 06">Template</h2>
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
                            <div class="card" data-section="steps">
                                <h2 class="card-title" data-eyebrow="Section 04">Steps</h2>
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
                    <div class="card" data-section="visibility">
                        <h2 class="card-title" data-eyebrow="Section Final">Visibility</h2>
                        <div class="visibility-settings">
                            <div class="visibility-setting">
                                <span class="visibility-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">hotel_class</span>
                                </span>
                                <wy-option-toggle
                                    variant="switch"
                                    size="compact"
                                    label="Featured"
                                    description="Highlights and sorts this prompt first."
                                    .options="${['false', 'true']}"
                                    .labels="${['Off', 'On']}"
                                    .value="${this._editedPrompt.featured ? 'true' : 'false'}"
                                    @change="${(e) => this._handleFieldChange('featured', e.detail.checked)}"
                                ></wy-option-toggle>
                            </div>
                            <div class="visibility-setting archive">
                                <span class="visibility-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">inventory_2</span>
                                </span>
                                <wy-option-toggle
                                    variant="switch"
                                    size="compact"
                                    label="Archived"
                                    description="Archived prompts are hidden from the public site but remain editable here."
                                    .options="${['false', 'true']}"
                                    .labels="${['Off', 'On']}"
                                    .value="${this._editedPrompt.archived ? 'true' : 'false'}"
                                    @change="${(e) => this._handleFieldChange('archived', e.detail.checked)}"
                                ></wy-option-toggle>
                            </div>
                            <div class="visibility-setting">
                                <span class="visibility-icon" aria-hidden="true">
                                    <span class="material-symbols-outlined">palette</span>
                                </span>
                                <wy-option-toggle
                                    variant="switch"
                                    size="compact"
                                    label="Color Palette"
                                    description="Shows the palette tool in the prompt modal."
                                    .options="${['false', 'true']}"
                                    .labels="${['Off', 'On']}"
                                    .value="${this._editedPrompt.showPalette ? 'true' : 'false'}"
                                    @change="${(e) => this._handleFieldChange('showPalette', e.detail.checked)}"
                                ></wy-option-toggle>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        `;
    }
}

customElements.define('wy-prompt-editor', WyPromptEditor);
