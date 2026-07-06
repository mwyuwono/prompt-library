import { LitElement, html } from 'lit';
import { live } from 'lit/directives/live.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

export class WyPromptModal extends LitElement {
  createRenderRoot() {
    return this;
  }

  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String },
    category: { type: String },
    description: { type: String },
    instructions: { type: String },
    image: { type: String },
    promptImage: { type: String, attribute: 'prompt-image' },
    variationImage: { type: String, attribute: 'variation-image' },
    template: { type: String },
    variables: { type: Array },
    referenceImages: { type: Array },
    variations: { type: Array },
    variationSelector: { type: String, attribute: 'variation-selector' },
    variationSelectorTileMode: { type: String, attribute: 'variation-selector-tile-mode' },
    fullScreenModal: { type: Boolean, attribute: 'full-screen', reflect: true },
    activeVariationIndex: { type: Number, attribute: 'active-variation-index' },
    mode: { type: String }, // 'locked' or 'edit'
    activeTab: { type: String }, // 'variables' or 'preview'
    steps: { type: Array }, // Array of step objects for multi-step prompts
    activeStepIndex: { type: Number, attribute: 'active-step-index' }, // Current step (0-based)
    descriptionExpanded: { type: Boolean, attribute: 'description-expanded' }, // Mobile description toggle
    variationDetailsExpanded: { type: Boolean, attribute: 'variation-details-expanded' },
    showPalette: { type: Boolean, attribute: 'show-palette' }
  };

  constructor() {
    super();
    this.open = false;
    this.title = '';
    this.category = '';
    this.description = '';
    this.instructions = '';
    this.image = '';
    this.promptImage = '';
    this.variationImage = '';
    this.template = '';
    this.variables = [];
    this.referenceImages = [];
    this.variations = [];
    this.variationSelector = '';
    this.variationSelectorTileMode = 'thumbnail';
    this.fullScreenModal = false;
    this.activeVariationIndex = 0;
    this.mode = 'locked';
    this.activeTab = 'variables';
    this.steps = [];
    this.activeStepIndex = 0;
    this.descriptionExpanded = false;
    this.variationDetailsExpanded = false;
    this.showPalette = false;
    this._values = {};
  }

  willUpdate(changedProperties) {
    // Ensure steps array exists before render
    if (changedProperties.has('steps')) {
      if (!this.steps) {
        this.steps = [];
      }
      
      // Reset activeStepIndex if out of bounds
      if (this.activeStepIndex >= this.steps.length) {
        this.activeStepIndex = 0;
      }
    }
    
    // Ensure activeTab has a value
    if (!this.activeTab) {
      this.activeTab = 'variables';
    }

    if (changedProperties.has('variations') || changedProperties.has('activeVariationIndex')) {
      this._clampActiveVariationIndex();
    }
  }

  updated(changedProperties) {
    // Fix race condition by ensuring activeStepIndex is valid
    if (changedProperties.has('steps') && this.steps && this.steps.length > 0) {
      // Clamp activeStepIndex to valid range
      if (this.activeStepIndex >= this.steps.length) {
        this.activeStepIndex = 0;
      }
    }
    
    // Populate _values from current step's variables
    if ((changedProperties.has('steps') || changedProperties.has('activeStepIndex')) && 
        this.steps && this.steps.length > 0) {
      // Use safe index
      const safeIndex = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1));
      const currentStep = this.steps[safeIndex];
      
      if (currentStep && currentStep.variables) {
        const newValues = {};
        currentStep.variables.forEach(v => {
          newValues[v.name] = v.value || '';
        });
        this._values = newValues;
      }
    }
    
    // When variables change for single-step prompts, populate _values
    if (changedProperties.has('variables') && this.variables) {
      const newValues = {};
      this.variables.forEach(v => {
        newValues[v.name] = v.value || '';
      });
      this._values = newValues;
    }
  }

  // Multi-step navigation methods
  nextStep() {
    if (this.activeStepIndex < this.steps.length - 1) {
      this.activeStepIndex++;
      this.dispatchEvent(new CustomEvent('step-change', {
        detail: { stepIndex: this.activeStepIndex, step: this.steps[this.activeStepIndex] },
        bubbles: true,
        composed: true
      }));
    }
  }

  previousStep() {
    if (this.activeStepIndex > 0) {
      this.activeStepIndex--;
      this.dispatchEvent(new CustomEvent('step-change', {
        detail: { stepIndex: this.activeStepIndex, step: this.steps[this.activeStepIndex] },
        bubbles: true,
        composed: true
      }));
    }
  }

  // Render stepper UI for multi-step prompts
  _renderStepper() {
    if (!this.steps || this.steps.length === 0) return '';
    
    const progressPercent = ((this.activeStepIndex + 1) / this.steps.length) * 100;
    const isFirstStep = this.activeStepIndex === 0;
    const isLastStep = this.activeStepIndex === this.steps.length - 1;
    
    return html`
      <div class="stepper-container">
        <div class="stepper-progress">
              <div class="stepper-progress-bar"
               style="--step-progress: ${progressPercent}%">
          </div>
        </div>
        <div class="stepper-header">
          <span class="stepper-label">
            Step ${this.activeStepIndex + 1} of ${this.steps.length}
          </span>
          <div class="stepper-nav">
            <button 
              class="icon-btn filled"
              ?disabled=${isFirstStep}
              @click=${() => this.previousStep()}
              aria-label="Previous step"
              title="Previous step">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <button 
              class="icon-btn filled"
              ?disabled=${isLastStep}
              @click=${() => this.nextStep()}
              aria-label="Next step"
              title="Next step">
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Toggle description visibility (mobile only)
  _toggleDescription() {
    this.descriptionExpanded = !this.descriptionExpanded;
  }

  // Render markdown text as HTML using marked
  _renderDescriptionMarkdown(text) {
    if (!text) return '';
    return marked.parse(text, { breaks: true });
  }

  _renderPromptIntro(showDescription = true) {
    return html`
      <div class="title-group">
          <h2 @click="${this._toggleDescription}">${this.title}</h2>
          ${showDescription ? html`
            <div class="description-text ${this.descriptionExpanded ? 'expanded' : ''}">${unsafeHTML(this._renderDescriptionMarkdown(this.description))}</div>
          ` : ''}
          ${this.instructions ? html`
            <wy-info-panel class="prompt-instructions-panel">
              <p class="prompt-instructions-heading">Instructions</p>
              <div class="prompt-instructions-copy">${unsafeHTML(this._renderDescriptionMarkdown(this.instructions))}</div>
            </wy-info-panel>
          ` : ''}
      </div>
    `;
  }

  // Render multi-step body content
  _renderMultiStepBody() {
    // Guard against invalid step index
    if (!this.steps || this.steps.length === 0) {
      return html`<div class="empty-message">No steps available</div>`;
    }
    
    // Ensure activeStepIndex is within bounds
    const safeIndex = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1));
    const step = this.steps[safeIndex];
    
    // Guard against undefined step
    if (!step) {
      return html`<div class="empty-message">Step not found</div>`;
    }
    
    const compiledPrompt = this._compilePrompt(step.template || '');
    const hasStepVariables = Array.isArray(step.variables) && step.variables.length > 0;
    const showVariables = hasStepVariables && this.activeTab === 'variables';
    
    return html`
      ${this._renderStepper()}
      
      <!-- Add tabs for Variables/Preview -->
      ${hasStepVariables ? html`
        <div class="tabs-header">
          <button 
            class="tab-item ${this.activeTab === 'variables' ? 'active' : ''}"
            data-tab="variables"
            @click="${this._setActiveTab}">
            Variables
          </button>
          <button 
            class="tab-item ${this.activeTab === 'preview' ? 'active' : ''}"
            data-tab="preview"
            @click="${this._setActiveTab}">
            Full prompt
          </button>
        </div>
      ` : ''}
      
      ${step.instructions ? html`
        <wy-info-panel
          class="step-instructions"
          variant="compact"
          heading="${step.name}">
          <div class="step-instructions-copy">${unsafeHTML(this._renderDescriptionMarkdown(step.instructions))}</div>
        </wy-info-panel>
      ` : ''}
      
      <!-- Conditionally render variables or preview based on active tab -->
      ${showVariables ? html`
        <div class="variables-grid">
          ${step.variables.map(v => this._renderVariable(v))}
        </div>
      ` : html`
        <div class="preview-area">${unsafeHTML(marked.parse(compiledPrompt, { breaks: true }))}</div>
      `}
    `;
  }

  _getActiveStandardTab() {
    if (this.activeTab === 'preview') return 'preview';
    return this.variables && this.variables.length > 0 ? 'variables' : 'overview';
  }

  _clampActiveVariationIndex() {
    if (!this.variations || this.variations.length === 0) {
      this.activeVariationIndex = 0;
      return;
    }

    if (!Number.isInteger(this.activeVariationIndex) || this.activeVariationIndex < 0 || this.activeVariationIndex >= this.variations.length) {
      this.activeVariationIndex = 0;
    }
  }

  _getActiveVariationIndex() {
    if (!this.variations || this.variations.length === 0) return 0;
    return Number.isInteger(this.activeVariationIndex) && this.activeVariationIndex >= 0 && this.activeVariationIndex < this.variations.length
      ? this.activeVariationIndex
      : 0;
  }

  _renderOverview(template) {
    return html`
      <div class="overview">
        <span class="overview-eyebrow">Prompt Overview</span>
        ${this.promptImage ? html`
          <figure class="overview-figure">
            <img src="${this.promptImage}" alt="${this.title}" loading="lazy">
            <figcaption>N&ordm; 01 &mdash; Example output</figcaption>
          </figure>
        ` : ''}
        <div class="overview-lead">${unsafeHTML(this._renderDescriptionMarkdown(this.description))}</div>
      </div>
    `;
  }

  _toggleVariationDetails() {
    this.variationDetailsExpanded = !this.variationDetailsExpanded;
  }

  _usesVisualVariationSelector() {
    return this.variationSelector === 'visual' && this.variations.length > 1;
  }

  _getVisualTileMode() {
    return this.variationSelectorTileMode === 'details' ? 'details' : 'thumbnail';
  }

  _renderVariationSelector(activeVariation) {
    const useVisualSelector = this._usesVisualVariationSelector();
    const selector = this.variations.length > 1 ? html`
      <label class="variation-description-heading" for="variation-select">Variant</label>
      ${useVisualSelector ? this._renderVisualVariationSelector(activeVariation) : html`
        <div class="variation-select-wrap">
          <select
            id="variation-select"
            class="variation-select-native"
            .value=${live(activeVariation?.id || '')}
            @change="${this._handleVariationSelectChange}"
          >
            ${this.variations.map(variation => html`
              <option value="${variation.id}" .selected=${variation.id === activeVariation?.id}>${variation.name}</option>
            `)}
          </select>
          <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
        </div>
      `}
    ` : '';

    const variationMeta = activeVariation?.description || activeVariation?.instructions ? html`
      <wy-info-panel class="variation-description-panel">
        <div class="variation-meta-section">
          <button
            class="variation-name"
            type="button"
            aria-expanded="${this.variationDetailsExpanded ? 'true' : 'false'}"
            @click="${this._toggleVariationDetails}"
          >
            <span>${activeVariation.name}</span>
            <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
          </button>
          ${this.variationDetailsExpanded ? html`
            <div class="variation-details">
              ${activeVariation?.description ? html`
                <div class="variation-description-copy">${unsafeHTML(this._renderDescriptionMarkdown(activeVariation.description))}</div>
              ` : ''}
              ${activeVariation?.instructions ? html`
                <div class="variation-meta-section">
                  <p class="variation-description-heading">Instructions</p>
                  <div class="variation-description-copy">${unsafeHTML(this._renderDescriptionMarkdown(activeVariation.instructions))}</div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </wy-info-panel>
    ` : '';

    const referenceImages = this._getActiveReferenceImages(activeVariation);

    if (!selector && !this.variationImage && !variationMeta && referenceImages.length === 0) return '';

    return html`
      <div class="variation-selector-container">
        ${selector}
        ${this._renderSelectedVariationPanel(activeVariation, variationMeta, referenceImages)}
      </div>
    `;
  }

  _renderSelectedVariationPanel(
    activeVariation,
    variationMeta = this._renderVariationMeta(activeVariation),
    referenceImages = this._getActiveReferenceImages(activeVariation)
  ) {
    if (!this.variationImage && !variationMeta && referenceImages.length === 0) return '';

    return html`
      <div class="visual-selected-panel">
        ${this.variationImage ? html`
          <figure class="variation-image">
            <img src="${this.variationImage}" alt="${activeVariation?.name || this.title}" loading="lazy">
          </figure>
        ` : ''}
        ${variationMeta}
        ${this._renderReferenceImages(referenceImages)}
      </div>
    `;
  }

  _renderVariationMeta(activeVariation) {
    if (!activeVariation?.description && !activeVariation?.instructions) return '';

    return html`
      <wy-info-panel class="variation-description-panel">
        <div class="variation-meta-section">
          <button
            class="variation-name"
            type="button"
            aria-expanded="${this.variationDetailsExpanded ? 'true' : 'false'}"
            @click="${this._toggleVariationDetails}"
          >
            <span>${activeVariation.name}</span>
            <span class="material-symbols-outlined" aria-hidden="true">expand_more</span>
          </button>
          ${this.variationDetailsExpanded ? html`
            <div class="variation-details">
              ${activeVariation?.description ? html`
                <div class="variation-description-copy">${unsafeHTML(this._renderDescriptionMarkdown(activeVariation.description))}</div>
              ` : ''}
              ${activeVariation?.instructions ? html`
                <div class="variation-meta-section">
                  <p class="variation-description-heading">Instructions</p>
                  <div class="variation-description-copy">${unsafeHTML(this._renderDescriptionMarkdown(activeVariation.instructions))}</div>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </wy-info-panel>
    `;
  }

  _renderVisualVariationSelector(activeVariation) {
    const tileMode = this._getVisualTileMode();
    const showTileDetails = tileMode === 'details';

    return html`
      <div class="visual-variation-grid ${showTileDetails ? 'details-mode' : 'thumbnail-mode'}" role="listbox" aria-label="Variant">
        ${this.variations.map((variation, index) => {
          const selected = variation.id === activeVariation?.id;
          const description = variation.description || variation.instructions || '';
          const hasImage = Boolean(variation.image);
          const name = variation.name || `Variant ${index + 1}`;

          return html`
            <button
              type="button"
              class="visual-variation-tile ${selected ? 'selected' : ''} ${showTileDetails ? 'details' : 'thumbnail-only'} ${hasImage ? 'has-image' : 'no-image'}"
              role="option"
              aria-selected="${selected ? 'true' : 'false'}"
              aria-label="${name}"
              @click="${() => this._setVariationById(variation.id)}"
            >
              ${hasImage ? html`
                <img class="visual-variation-media" src="${variation.image}" alt="" loading="lazy">
              ` : html`
                <span class="visual-variation-text-tile" aria-hidden="true">
                  <span class="material-symbols-outlined">auto_awesome</span>
                </span>
              `}
              <span class="visual-variation-copy">
                <span class="visual-variation-name">${name}${selected ? html`<span class="visual-variation-mark" aria-hidden="true"></span>` : ''}</span>
                ${showTileDetails && description ? html`<span class="visual-variation-description">${description}</span>` : ''}
              </span>
            </button>
          `;
        })}
      </div>
    `;
  }

  _getImageUrl(path) {
    if (!path) return '';
    try {
      return new URL(path, window.location.origin).href;
    } catch {
      return path;
    }
  }

  _getReferenceImageMap(activeVariation = this.variations[this.activeVariationIndex]) {
    const refMap = new Map();
    (this.referenceImages || []).forEach(ref => {
      if (ref?.variable && ref?.path) refMap.set(ref.variable, ref);
    });
    (activeVariation?.referenceImages || []).forEach(ref => {
      if (ref?.variable && ref?.path) refMap.set(ref.variable, ref);
    });
    return refMap;
  }

  _getActiveReferenceImages(activeVariation = this.variations[this.activeVariationIndex]) {
    return [...this._getReferenceImageMap(activeVariation).values()];
  }

  _renderReferenceImages(referenceImages) {
    if (!referenceImages.length) return '';

    return html`
      <wy-info-panel class="reference-images-panel">
        <p class="variation-description-heading">Reference Images</p>
        <div class="reference-images-list">
          ${referenceImages.map(ref => {
            const url = this._getImageUrl(ref.path);
            const label = ref.label || ref.variable || 'Reference image';
            const copyText = this._getReferenceImageCopyText(ref, url, label);

            return html`
              <div class="reference-image-row">
                <img class="reference-image-thumb" src="${url}" alt="${label}" loading="lazy">
                <div class="reference-image-meta">
                  <div class="reference-image-label" title="${label}">${label}</div>
                  <span class="reference-image-url" title="${copyText}">${copyText}</span>
                  ${ref.variable ? html`<span class="reference-variable" title="{{${ref.variable}}}">{{${ref.variable}}}</span>` : ''}
                </div>
                <div class="reference-image-actions">
                  <button
                    type="button"
                    class="reference-image-copy"
                    @click="${() => this._copyReferenceImageUrl(ref, url, label)}"
                    aria-label="Copy reference image URL"
                    title="Copy URL and instructions"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">assignment</span>
                    <span>Copy Instruction</span>
                  </button>
                  <button
                    type="button"
                    class="reference-image-copy"
                    @click="${() => this._copyReferenceImageFile(url, label)}"
                    aria-label="Copy reference image file"
                    title="Copy image"
                  >
                    <span class="material-symbols-outlined" aria-hidden="true">image</span>
                    <span>Copy Image</span>
                  </button>
                </div>
              </div>
            `;
          })}
        </div>
      </wy-info-panel>
    `;
  }

  _renderVisualSelectorLayout(activeVariation, standardActiveTab, hasVariables, compiledPrompt, currentTemplate) {
    return html`
      <div class="visual-selector-layout">
        <div class="visual-selector-main">
          <div class="header-main">
              ${this._renderPromptIntro(!(this.mode === 'locked' && !hasVariables))}
          </div>

          ${this._renderSelectedVariationPanel(activeVariation)}

          <div class="tabs-container">
              <wy-tabs active-tab="${standardActiveTab}" @tab-change="${e => this.activeTab = e.detail.tab}">
                <button class="tab-item ${standardActiveTab === (hasVariables ? 'variables' : 'overview') ? 'active' : ''}" role="tab" data-tab="${hasVariables ? 'variables' : 'overview'}">${hasVariables ? 'Variables' : 'Overview'}</button>
                <button class="tab-item ${standardActiveTab === 'preview' ? 'active' : ''}" role="tab" data-tab="preview">Full prompt</button>
              </wy-tabs>
              ${standardActiveTab === 'variables' && this._hasValues() ? html`
                <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
              ` : ''}
          </div>

          <div class="body">
            ${standardActiveTab === 'preview' ? html`
              <div class="preview-area">${unsafeHTML(marked.parse(compiledPrompt, { breaks: true }))}</div>
            ` : hasVariables ? html`
              <div class="variables-grid">
                ${this.variables.map(v => this._renderVariable(v))}
              </div>
            ` : html`
              ${this._renderOverview(currentTemplate)}
            `}
          </div>
        </div>

        <aside class="visual-selector-rail" aria-label="Variants">
          <p class="variation-description-heading">Variant</p>
          ${this._renderVisualVariationSelector(activeVariation)}
        </aside>
      </div>
    `;
  }

  render() {
    const activeVariationIndex = this._getActiveVariationIndex();
    const currentTemplate = this.variations.length > 0
      ? this.variations[activeVariationIndex].template
      : this.template;

    const compiledPrompt = this._compilePrompt(currentTemplate);
    const activeVariation = this.variations[activeVariationIndex];
    const standardActiveTab = this._getActiveStandardTab();
    const hasVariables = this.variables.length > 0;
    const useVisualSelector = this._usesVisualVariationSelector();

    return html`
      <div class="scrim" @click="${this._close}"></div>
      <div class="modal-container ${useVisualSelector ? 'visual-selector-modal' : ''} ${this.fullScreenModal ? 'fullscreen' : ''}">
        
        <!-- HEADER -->
        <header class="header">
            <div class="header-top">
                ${this.mode === 'locked' ? html`
                    <div class="header-actions-left">
                        <button class="labeled-btn primary" @click="${this._handleCopy}" aria-label="Copy to clipboard" title="Copy">
                            <span class="material-symbols-outlined">content_copy</span>
                            <span>Copy Prompt</span>
                        </button>
                        <button class="icon-btn filled" @click="${this._handleCopyLink}" aria-label="Copy link" title="Share">
                            <span class="material-symbols-outlined">link</span>
                        </button>
                        <button class="icon-btn filled" @click="${() => this.mode = 'edit'}" aria-label="Edit prompt" title="Edit">
                            <span class="material-symbols-outlined">edit</span>
                        </button>
                        <button class="icon-btn filled" @click="${this._handleDownload}" aria-label="Download" title="Download">
                            <span class="material-symbols-outlined">download</span>
                        </button>
                        ${this.showPalette ? html`
                        <button class="icon-btn filled" @click="${this._handlePaletteRequest}" aria-label="Color palette" title="Color Palette">
                            <span class="material-symbols-outlined">palette</span>
                        </button>
                        ` : ''}
                    </div>
                ` : html`
                    <div class="header-actions-left">
                        <button class="icon-btn filled" @click="${() => this.mode = 'locked'}" aria-label="Cancel" title="Cancel">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                        <button class="icon-btn primary" @click="${this._handleSave}" aria-label="Save" title="Save">
                            <span class="material-symbols-outlined">save</span>
                        </button>
                    </div>
                `}
                
                <span class="badge category-badge">${this.category}</span>
                
                <div class="header-actions">
                    <button class="icon-btn filled" @click="${this._close}" aria-label="Close modal" title="Close">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        </header>

        <div class="content">
          ${this.mode === 'locked' ? html`
            ${this.steps && this.steps.length > 0 ? html`
              <!-- Multi-step mode -->
              <div class="header-main">
                  ${this._renderPromptIntro()}
              </div>
              <div class="body">
                ${this._renderVariationSelector(activeVariation)}
                ${this._renderMultiStepBody()}
              </div>
            ` : html`
              <!-- Standard mode -->
              ${useVisualSelector ? this._renderVisualSelectorLayout(activeVariation, standardActiveTab, hasVariables, compiledPrompt, currentTemplate) : html`
                <div class="header-main">
                    ${this._renderPromptIntro(!(this.mode === 'locked' && !hasVariables))}
                </div>

                <div class="tabs-container">
                    <wy-tabs active-tab="${standardActiveTab}" @tab-change="${e => this.activeTab = e.detail.tab}">
                      <button class="tab-item ${standardActiveTab === (hasVariables ? 'variables' : 'overview') ? 'active' : ''}" role="tab" data-tab="${hasVariables ? 'variables' : 'overview'}">${hasVariables ? 'Variables' : 'Overview'}</button>
                      <button class="tab-item ${standardActiveTab === 'preview' ? 'active' : ''}" role="tab" data-tab="preview">Full prompt</button>
                    </wy-tabs>
                    ${standardActiveTab === 'variables' && this._hasValues() ? html`
                      <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
                    ` : ''}
                </div>

                ${!(standardActiveTab === 'overview' && !hasVariables) ? html`
                  ${this._renderVariationSelector(activeVariation)}
                ` : ''}

                <div class="body">
                  ${standardActiveTab === 'preview' ? html`
                    <div class="preview-area">${unsafeHTML(marked.parse(compiledPrompt, { breaks: true }))}</div>
                  ` : hasVariables ? html`
                    <div class="variables-grid">
                      ${this.variables.map(v => this._renderVariable(v))}
                    </div>
                  ` : html`
                    ${this._renderOverview(currentTemplate)}
                    ${this._renderVariationSelector(activeVariation)}
                  `}
                </div>
              `}
            `}
          ` : html`
            <div class="header-main">
                ${this._renderPromptIntro()}
            </div>
            <div class="body">
              <textarea 
                class="editor-area" 
                .value="${this.template}"
                @input="${e => this.template = e.target.value}"
              ></textarea>
            </div>
          `}
        </div>
      </div>
    `;
  }

  _getToggleDescription(variable, options) {
    return variable.description || '';
  }

  _getToggleVariant(variable, options, labels) {
    if (variable.control === 'switch' || variable.variant === 'switch') return 'switch';
    if (variable.control === 'segmented' || variable.variant === 'segmented') return 'segmented';

    const displayLabels = Array.isArray(labels) ? labels : options;
    const isBooleanInstruction =
      displayLabels?.[0] === 'Off' &&
      displayLabels?.[1] === 'On' &&
      (options?.[0] === '' || options?.[0] === false || options?.[0] === 'false');

    return isBooleanInstruction ? 'switch' : 'segmented';
  }

  _renderVariable(v) {
    // Support both 'type' and 'inputType' for compatibility
    const inputType = v.inputType || v.type || 'text';

    if (inputType === 'toggle') {
      const options = Array.isArray(v.options) && v.options.length >= 2
        ? [v.options[0], v.options[1]]
        : ['', 'true'];
      const labels = Array.isArray(v.labels) && v.labels.length >= 2
        ? [v.labels[0], v.labels[1]]
        : null;
      const valueDescriptions = Array.isArray(v.optionDescriptions) && v.optionDescriptions.length >= 2
        ? [v.optionDescriptions[0], v.optionDescriptions[1]]
        : null;
      const size = v.size || 'default';
      const currentValue = this._values[v.name];
      const toggleValue = currentValue !== undefined && currentValue !== null
        ? currentValue
        : options[0];
      const toggleDescription = this._getToggleDescription(v, options);
      const toggleVariant = this._getToggleVariant(v, options, labels);

      return html`
        <div class="form-group">
          <wy-option-toggle
            .label="${v.label || ''}"
            .description="${toggleDescription}"
            .options="${options}"
            .labels="${labels}"
            .valueDescriptions="${valueDescriptions}"
            .value="${toggleValue}"
            size="${size}"
            variant="${toggleVariant}"
            show-selected-value-text
            @change="${(e) => this._handleInput(v.name, e.detail.value)}"
          ></wy-option-toggle>
        </div>
      `;
    }

    if (inputType === 'textarea') {
      return html`
        <div class="form-group">
          <label>${v.label}</label>
          <textarea
            placeholder="${v.placeholder || ''}"
            @input="${(e) => this._handleInput(v.name, e.target.value)}"
            .value="${this._values[v.name] || ''}"
            rows="4"
          ></textarea>
          <span class="helper-text">Markdown supported</span>
        </div>
      `;
    }

    // Default: text input
    return html`
      <div class="form-group">
        <label>${v.label}</label>
        <input
          type="text"
          placeholder="${v.placeholder || ''}"
          @input="${(e) => this._handleInput(v.name, e.target.value)}"
          .value="${this._values[v.name] || ''}"
        >
      </div>
    `;
  }

  _handleInput(name, value) {
    this._values = { ...this._values, [name]: value };
    this.dispatchEvent(new CustomEvent('variable-change', {
      detail: { name, value, values: this._values },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }

  _hasValues() {
    return Object.values(this._values).some(v => v && v.length > 0);
  }

  _clearAllVariables() {
    this._values = {};
    this.dispatchEvent(new CustomEvent('variables-cleared', {
      detail: { values: this._values },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }

  _handleVariationChange(e) {
    const index = parseInt(e.target.value);
    this.activeVariationIndex = index;
    this.dispatchEvent(new CustomEvent('variation-change', {
      detail: { index, variation: this.variations[index] },
      bubbles: true,
      composed: true
    }));
  }

  _handleVariationDropdownChange(e) {
    const selectedId = e.detail.value;
    this._setVariationById(selectedId);
  }

  _handleVariationSelectChange(e) {
    this._setVariationById(e.target.value);
  }

  _setVariationById(selectedId) {
    const index = this.variations.findIndex(v => v.id === selectedId);
    if (index !== -1) {
      this.activeVariationIndex = index;
      this.steps = this.variations[index].steps || [];
      this.activeStepIndex = 0;
      this.activeTab = 'variables';
      this.variationDetailsExpanded = false;
      this.dispatchEvent(new CustomEvent('variation-change', {
        detail: { index, variation: this.variations[index] },
        bubbles: true,
        composed: true
      }));
    }
  }

  _compilePrompt(template) {
    // Guard against undefined/null template
    if (!template || typeof template !== 'string') {
      return '';
    }
    
    let compiled = template;
    const refMap = this._getReferenceImageMap();
    refMap.forEach((ref, variable) => {
      compiled = compiled.split(`{{${variable}}}`).join(this._getImageUrl(ref.path));
    });

    Object.keys(this._values || {}).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      compiled = compiled.replace(regex, this._values[key] ?? '');
    });
    return compiled;
  }

  _setActiveTab(e) {
    const tab = e.target.dataset.tab || e.target.closest('[data-tab]')?.dataset.tab;
    if (tab) {
      this.activeTab = tab;
    }
  }

  _close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  async _handleCopy() {
    let textToCopy;
    
    if (this.steps && this.steps.length > 0) {
      // Multi-step mode: compile current step only
      const step = this.steps[this.activeStepIndex];
      textToCopy = this._compilePrompt(step.template);
    } else {
      // Standard mode: existing behavior
      textToCopy = this._compilePrompt(
        this.variations.length > 0 
          ? this.variations[this.activeVariationIndex].template 
          : this.template
      );
    }
    
    const copied = await this._writeTextToClipboard(textToCopy);
    if (copied) {
      this.dispatchEvent(new CustomEvent('copy', {
        detail: { text: textToCopy },
        bubbles: true,
        composed: true
      }));
    } else {
      this.dispatchEvent(new CustomEvent('toast', {
        detail: { message: 'Copy failed', options: { variant: 'error' } },
        bubbles: true,
        composed: true
      }));
    }
  }

  async _copyReferenceImageUrl(ref, url, label = 'Reference image') {
    const text = this._getReferenceImageCopyText(ref, url, label);
    const copied = await this._writeTextToClipboard(text);
    this.dispatchEvent(new CustomEvent('toast', {
      detail: {
        message: copied ? 'Reference image copied' : 'Copy failed',
        options: { variant: copied ? 'success' : 'error' }
      },
      bubbles: true,
      composed: true
    }));
  }

  _getReferenceImageCopyText(ref, url, label = 'Reference image') {
    const instructions = (ref?.instructions || '').trim();
    if (!instructions) return url;

    const textWithUrl = instructions.includes('[URL]') || instructions.includes('{{url}}')
      ? instructions.replaceAll('[URL]', url).replaceAll('{{url}}', url)
      : `${instructions}\n${url}`;

    return `Reference Image:\n${textWithUrl}`;
  }

  async _copyReferenceImageFile(url, label = 'Reference image') {
    const copied = await this._writeImageToClipboard(url);
    this.dispatchEvent(new CustomEvent('toast', {
      detail: {
        message: copied ? `${label} copied as image` : 'Image copy failed',
        options: { variant: copied ? 'success' : 'error' }
      },
      bubbles: true,
      composed: true
    }));
  }

  async _writeImageToClipboard(url) {
    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
        return false;
      }

      const response = await fetch(url);
      if (!response.ok) return false;

      const sourceBlob = await response.blob();
      const pngBlob = sourceBlob.type === 'image/png'
        ? sourceBlob
        : await this._convertImageBlobToPng(sourceBlob);

      if (!pngBlob) return false;
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      return true;
    } catch (error) {
      console.warn('Image clipboard copy failed:', error);
      return false;
    }
  }

  async _convertImageBlobToPng(blob) {
    const objectUrl = URL.createObjectURL(blob);
    try {
      const image = await this._loadImage(objectUrl);
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;

      const context = canvas.getContext('2d');
      if (!context || !canvas.width || !canvas.height) return null;

      context.drawImage(image, 0, 0);
      return await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  _loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  async _writeTextToClipboard(text) {
    try {
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const blob = new Blob([text], { type: 'text/plain' });
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
        return true;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      console.warn('Clipboard API copy failed, trying fallback:', error);
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      return document.execCommand('copy');
    } catch (error) {
      console.warn('Fallback copy failed:', error);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  _handleSave() {
    this.mode = 'locked';
    this.dispatchEvent(new CustomEvent('save', {
      detail: { template: this.template },
      bubbles: true,
      composed: true
    }));
  }

  _handleDownload() {
    let textToDownload;

    if (this.steps && this.steps.length > 0) {
      // Multi-step mode: download current step only
      const step = this.steps[this.activeStepIndex];
      textToDownload = this._compilePrompt(step.template);
    } else {
      // Standard mode: existing behavior
      textToDownload = this._compilePrompt(
        this.variations.length > 0
          ? this.variations[this.activeVariationIndex].template
          : this.template
      );
    }

    this.dispatchEvent(new CustomEvent('download', {
      detail: { text: textToDownload, title: this.title },
      bubbles: true,
      composed: true
    }));
  }

  _handleCopyLink() {
    this.dispatchEvent(new CustomEvent('copy-link', {
      bubbles: true,
      composed: true
    }));
  }

  _handlePaletteRequest() {
    this.dispatchEvent(new CustomEvent('palette-request', {
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('wy-prompt-modal', WyPromptModal);
