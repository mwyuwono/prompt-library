import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export class WyPromptModal extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String },
    category: { type: String },
    description: { type: String },
    image: { type: String },
    template: { type: String },
    variables: { type: Array },
    variations: { type: Array },
    activeVariationIndex: { type: Number, attribute: 'active-variation-index' },
    mode: { type: String }, // 'locked' or 'edit'
    activeTab: { type: String }, // 'variables' or 'preview'
    steps: { type: Array }, // Array of step objects for multi-step prompts
    activeStepIndex: { type: Number, attribute: 'active-step-index' }, // Current step (0-based)
    descriptionExpanded: { type: Boolean, attribute: 'description-expanded' } // Mobile description toggle
  };

  constructor() {
    super();
    this.open = false;
    this.title = '';
    this.category = '';
    this.description = '';
    this.image = '';
    this.template = '';
    this.variables = [];
    this.variations = [];
    this.activeVariationIndex = 0;
    this.mode = 'locked';
    this.activeTab = 'variables';
    this.steps = [];
    this.activeStepIndex = 0;
    this.descriptionExpanded = false;
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

  static styles = css`
    /* Required fonts - load in page <head>:
       <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,899&display=swap" rel="stylesheet">
       <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    */

    /* Material Symbols base styling */
    .material-symbols-outlined {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: 24px;
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

    :host {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 2000;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease;
    }

    :host([open]) {
      pointer-events: auto;
      opacity: 1;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.3); /* Darker scrim for focus */
      backdrop-filter: blur(4px);
    }

    .modal-container {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      background: var(--wy-prompt-modal-surface, var(--paper, #F7F4EE));
      border-radius: 0;
      box-shadow: var(--shadow-modal);
      transform: translate(-50%, -50%) scale(0.95);
      transition: transform 0.3s cubic-bezier(0.2, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      overflow: hidden; /* Clip content to border-radius */
      border: 1px solid var(--paper-edge, #DDD6C8);
      font-family: var(--ff-sans, 'Inter', sans-serif);
    }

    :host([open]) .modal-container {
      transform: translate(-50%, -50%) scale(1);
    }

    /* HEADER STYLES */
    .header {
      padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md, 16px);
      flex-shrink: 0; /* Header stays fixed, doesn't shrink */
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        gap: 12px;
    }

    .header-actions-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 0 0 auto;
    }

    /* Icon Button - Perfect circle with centered icon */
    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        padding: 0;
        transition: background-color 0.2s, transform 0.15s;
    }

    .icon-btn.filled {
        background: transparent;
        color: var(--ink, #1A1A1A);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
    }

    .icon-btn.filled:hover {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
    }

    .icon-btn.primary {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
        border-radius: 0;
    }

    .icon-btn.primary:hover {
        opacity: 0.9;
        transform: scale(1.05);
    }

    .icon-btn:disabled {
        opacity: 0.38;
        cursor: not-allowed;
    }

    .icon-btn:disabled:hover {
        transform: none;
    }

    .icon-btn .material-symbols-outlined {
        font-size: 20px;
        line-height: 1;
    }

    /* Labeled Button - Icon with text label */
    .labeled-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 40px;
        padding: 0 16px 0 12px;
        border-radius: 0;
        border: none;
        cursor: pointer;
        font-family: var(--font-sans);
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s, transform 0.15s;
    }

    .labeled-btn.primary {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-size: 12px;
    }

    .labeled-btn.primary:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }

    .labeled-btn .material-symbols-outlined {
        font-size: 18px;
        line-height: 1;
    }

    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 24px;
        margin-bottom: var(--spacing-lg, 24px);
    }

    /* Header-main inside content (for multi-step prompts) */
    .content > .header-main {
        padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) var(--spacing-lg, 24px);
    }

    .badge {
      display: none; /* Hidden on all screen sizes */
      padding: 4px 0;
      background: transparent;
      color: var(--ink-mute, #6B6B6A);
      border-radius: 0;
      font-family: var(--ff-serif, 'Lora', serif);
      font-style: italic;
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em; /* Wider tracking */
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      pointer-events: none; /* Prevent badge from blocking clicks */
    }

    .title-group h2 {
      font-family: var(--ff-serif, 'Lora', serif);
      font-size: 2.5rem; /* Larger Title */
      font-weight: 500;
      letter-spacing: -0.015em;
      margin: 0 0 12px 0;
      color: var(--md-sys-color-text-heading);
      line-height: 1.1;
    }

    .description-text {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 1rem;
      font-weight: 300;
      line-height: 1.6;
      color: var(--md-sys-color-text-muted);
      margin: 0;
    }

    .description-text ol,
    .description-text ul {
      margin: 2px 0 0;
      padding-left: 1.4em;
    }

    .description-text li + li {
      margin-top: 2px;
    }

    .customize-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
        border: none;
        padding: 10px 20px;
        border-radius: 0;
        font-family: var(--ff-sans, 'Inter', sans-serif);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .customize-btn:hover {
        opacity: 0.9;
    }

    /* TABS */
    .tabs-container {
        padding: 0 var(--spacing-xl, 32px);
        border-bottom: 1px solid var(--md-sys-color-outline-variant);
        display: flex;
        align-items: center;
        gap: var(--spacing-xl, 32px);
        flex-shrink: 0; /* Tabs stay fixed, don't shrink */
    }

    .reference-image {
        margin: var(--spacing-lg, 24px) var(--spacing-xl, 32px) 0;
        flex-shrink: 0;
    }

    .reference-image img {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        border: 1px solid var(--paper-edge, #DDD6C8);
    }

    .tabs-container wy-tabs {
        flex: 1;
    }

    .clear-btn {
        background: none;
        border: none;
        color: var(--md-sys-color-text-heading);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 0;
        transition: background 0.2s;
        white-space: nowrap;
    }

    .clear-btn:hover {
        background: var(--md-sys-color-surface-container-high);
    }

    .clear-btn:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .tab-item {
        background: none;
        border: none;
        padding: 12px 0 16px 0;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--md-sys-color-on-surface-variant);
        cursor: pointer;
        position: relative;
        transition: color 0.2s;
        margin: 0;
        border-bottom: 2px solid transparent;
    }

    .tab-item:hover {
        color: var(--md-sys-color-text-heading);
    }

    .tab-item.active {
        color: var(--md-sys-color-text-heading);
        font-weight: 700;
        border-bottom-color: var(--md-sys-color-text-heading);
    }
    
    /* CONTENT */
    .content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .body {
        padding: var(--spacing-xl, 32px);
        flex: 1;
    }

    .variation-selector-container {
        margin: var(--spacing-xl, 32px) var(--spacing-xl, 32px) 0;
        padding: var(--spacing-md, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
        background-color: var(--md-sys-color-surface-container-high);
        border-radius: var(--md-sys-shape-corner-medium, 12px);
    }

    .variation-selector-container wy-dropdown {
        width: 100%;
    }

    .variation-description-panel {
        margin-top: 0;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .variation-description-heading {
        margin: 0 0 var(--spacing-xxs, 4px);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
    }

    .variation-description-copy {
        margin: 0;
    }

    /* Legacy selector styles (kept for backwards compatibility) */
    .variation-selector {
        margin: 0 var(--spacing-xl, 32px) var(--spacing-md, 16px);
        padding: var(--spacing-sm, 12px);
        background: var(--md-sys-color-surface-container-low);
        border-radius: var(--md-sys-shape-corner-small, 8px);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm, 12px);
    }

    .variation-label {
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: var(--md-sys-color-on-surface-variant);
    }

    .variation-select {
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        color: var(--md-sys-color-on-surface);
        background: transparent;
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        padding: 6px 12px;
    }

    /* FORMS */
    .variables-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
    }

    .form-group label {
        display: block;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: var(--md-sys-color-text-heading);
        margin-bottom: 8px;
    }

    .form-group input, .form-group textarea {
        width: 100%;
        box-sizing: border-box;
        padding: 16px; /* Increased padding for breathing room */
        border: 1px solid var(--md-sys-color-outline-variant);
        border-radius: 0;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 1rem;
        color: var(--md-sys-color-on-surface);
        background: var(--md-sys-color-surface-container-lowest);
        transition: all 0.2s;
    }

    .form-group input:focus, .form-group textarea:focus {
        outline: none;
        border-color: var(--md-sys-color-primary);
        box-shadow: 0 0 0 2px var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
    }

    .helper-text {
        display: block;
        text-align: right;
        font-size: 0.75rem;
        color: var(--md-sys-color-text-muted);
        margin-top: 4px;
    }

    .form-group wy-option-toggle {
      --md-sys-typescale-body-medium: 500 1rem/1.45 var(--font-sans, 'DM Sans', sans-serif);
    }

    .preview-area {
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 0;
      padding: 24px;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 1rem;
      line-height: 1.7;
      color: var(--md-sys-color-on-surface);
      white-space: pre-wrap;
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    .editor-area {
        width: 100%;
        height: 100%;
        min-height: 300px;
        border: none;
        background: none;
        resize: none;
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--md-sys-color-on-surface);
    }
    .editor-area:focus { outline: none; }

    /* WY-INFO-PANEL THEMING */
    wy-info-panel {
        --wy-info-panel-padding: var(--spacing-md, 16px);
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    wy-info-panel[variant="compact"],
    wy-info-panel.step-instructions {
        --wy-info-panel-compact-bg: var(--md-sys-color-secondary-container, #E8DDD7);
        --wy-info-panel-compact-border: var(--md-sys-color-outline-variant, #DDD);
        --wy-info-panel-compact-padding: var(--spacing-md, 16px);
    }

    /* STEP NAVIGATION BUTTONS (for multi-step prompts) */
    .secondary-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background: transparent;
        border: 1px solid var(--ink, #1A1A1A);
        color: var(--ink, #1A1A1A);
        padding: 12px 24px;
        border-radius: 0;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }
    .secondary-btn:hover {
        background: var(--md-sys-color-surface-container-high);
        border-color: var(--md-sys-color-outline);
    }

    /* STEPPER STYLES */
    .stepper-container {
      position: sticky;
      top: 0;
      background: var(--wy-prompt-modal-surface, var(--md-sys-color-surface));
      z-index: 10;
      margin-bottom: var(--spacing-md, 16px);
    }

    .stepper-progress {
      height: 4px;
      background: var(--md-sys-color-surface-container-highest);
      border-radius: var(--radius-0);
      overflow: hidden;
      margin-bottom: var(--spacing-md, 16px);
    }

    .stepper-progress-bar {
      height: 100%;
      background: var(--md-sys-color-primary);
      transition: width var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
    }

    .stepper-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stepper-label {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--md-sys-color-primary);
      font-weight: 500;
    }

    .stepper-nav {
      display: flex;
      gap: var(--spacing-xs, 4px);
    }

    .step-instructions {
      margin-bottom: var(--spacing-lg, 24px);
    }

    .tabs-header {
      display: flex;
      gap: 24px;
      padding-top: var(--spacing-xl, 32px);
      padding-bottom: 0;
      padding-left: 0;
      padding-right: 0;
      border-bottom: 1px solid var(--md-sys-color-outline-variant);
      margin-bottom: var(--spacing-lg, 24px);
    }

    .tab-item {
      background: none;
      border: none;
      padding: 8px 0;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--md-sys-color-on-surface-variant);
      cursor: pointer;
      position: relative;
      transition: color 0.2s;
      border-bottom: 2px solid transparent;
    }

    .tab-item:hover {
      color: var(--md-sys-color-primary);
    }

    .tab-item.active {
      color: var(--md-sys-color-primary);
      font-weight: 700;
      border-bottom-color: var(--md-sys-color-primary);
    }

    @media (max-width: 600px) {
      .modal-container {
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
      .header { padding: var(--spacing-lg, 24px) var(--spacing-md, 16px) var(--spacing-md, 16px); }
      .header-main { flex-direction: column; align-items: flex-start; gap: var(--spacing-md, 16px); }
      .title-group h2 { font-size: 1.75rem; }
      .tabs-container { padding: 0; } /* wy-tabs handles its own mobile padding */
      .reference-image { margin: 0 var(--spacing-md, 16px) var(--spacing-md, 16px); }
      .body { padding: var(--spacing-md, 16px); }
      
      /* Tighter button spacing on mobile */
      .header-actions-left {
        gap: 4px;
      }
      
      /* Mobile description toggle */
      .title-group h2 {
        cursor: pointer;
      }
      
      .description-text {
        display: none;
      }
      
      .description-text.expanded {
        display: block;
      }
      
      /* Step navigation styles (for multi-step prompts) */
      .step-navigation {
        flex-direction: row;
        gap: 12px;
      }
      .step-navigation .secondary-btn {
        flex: 1;
        min-width: 0;
      }
    }
    `;

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
               style="width: ${progressPercent}%">
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

  // Render description as lightweight markdown (ordered/unordered lists, bold)
  _renderDescriptionMarkdown(text) {
    if (!text) return '';
    const escapeHTML = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const processInline = (str) => escapeHTML(str).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (!/^(\d+\.|-|\*) /m.test(text)) return escapeHTML(text);
    const lines = text.split('\n');
    const parts = [];
    let listItems = null;
    let listType = null;
    const flushList = () => {
      if (listItems) {
        parts.push(`<${listType}>${listItems.join('')}</${listType}>`);
        listItems = null; listType = null;
      }
    };
    lines.forEach(line => {
      const trimmed = line.trim();
      const ol = trimmed.match(/^(\d+)\.\s+(.+)/);
      if (ol) { if (listType === 'ul') flushList(); if (!listItems) { listItems = []; listType = 'ol'; } listItems.push(`<li>${processInline(ol[2])}</li>`); return; }
      const ul = trimmed.match(/^[-*]\s+(.+)/);
      if (ul) { if (listType === 'ol') flushList(); if (!listItems) { listItems = []; listType = 'ul'; } listItems.push(`<li>${processInline(ul[1])}</li>`); return; }
      flushList();
      if (trimmed) parts.push(processInline(trimmed));
    });
    flushList();
    return parts.join('');
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
    
    return html`
      ${this._renderStepper()}
      
      <!-- Add tabs for Variables/Preview -->
      ${step.variables && step.variables.length > 0 ? html`
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
            Preview
          </button>
        </div>
      ` : ''}
      
      <wy-info-panel 
        class="step-instructions"
        variant="compact"
        heading="${step.name}">
        ${step.instructions}
      </wy-info-panel>
      
      <!-- Conditionally render variables or preview based on active tab -->
      ${this.activeTab === 'variables' ? html`
        <div class="variables-grid">
          ${step.variables.map(v => this._renderVariable(v))}
        </div>
      ` : html`
        <div class="preview-area">${compiledPrompt}</div>
      `}
    `;
  }

  render() {
    const currentTemplate = this.variations.length > 0
      ? this.variations[this.activeVariationIndex].template
      : this.template;

    const compiledPrompt = this._compilePrompt(currentTemplate);
    const activeVariation = this.variations[this.activeVariationIndex];

    return html`
      <div class="scrim" @click="${this._close}"></div>
      <div class="modal-container">
        
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
            
            ${!(this.steps && this.steps.length > 0) ? html`
              <div class="header-main">
                  <div class="title-group">
                      <h2 @click="${this._toggleDescription}">${this.title}</h2>
                      <div class="description-text ${this.descriptionExpanded ? 'expanded' : ''}">${unsafeHTML(this._renderDescriptionMarkdown(this.description))}</div>
                  </div>
                  
                  ${this.mode === 'locked' ? html`` : ''}
              </div>
            ` : ''}
        </header>

        ${this.image ? html`
          <div class="reference-image">
            <img src="${this.image}" alt="${this.title}">
          </div>
        ` : ''}

        ${this.mode === 'locked' && this.variables.length > 0 && !(this.steps && this.steps.length > 0) ? html`
          <div class="tabs-container">
              <wy-tabs active-tab="${this.activeTab}" @tab-change="${e => this.activeTab = e.detail.tab}">
                <button class="tab-item ${this.activeTab === 'variables' ? 'active' : ''}" role="tab" data-tab="variables">Variables</button>
                <button class="tab-item ${this.activeTab === 'preview' ? 'active' : ''}" role="tab" data-tab="preview">Final Preview</button>
              </wy-tabs>
              ${this.activeTab === 'variables' && this._hasValues() ? html`
                <button class="clear-btn" @click="${this._clearAllVariables}">Clear All</button>
              ` : ''}
          </div>
        ` : ''}

        <div class="content">
          ${this.mode === 'locked' ? html`
            ${this.steps && this.steps.length > 0 ? html`
              <!-- Multi-step mode -->
              <div class="header-main">
                  <div class="title-group">
                      <h2 @click="${this._toggleDescription}">${this.title}</h2>
                      <div class="description-text ${this.descriptionExpanded ? 'expanded' : ''}">${unsafeHTML(this._renderDescriptionMarkdown(this.description))}</div>
                  </div>
              </div>
              <div class="body">
                ${this._renderMultiStepBody()}
              </div>
            ` : html`
              <!-- Standard mode -->
              ${this.variations.length > 1 ? html`
                <div class="variation-selector-container">
                  <wy-dropdown
                    label="STYLE"
                    .value="${activeVariation?.id || ''}"
                    .options="${this.variations.map(v => ({ value: v.id, label: v.name }))}"
                    variant="subtle"
                    @change="${this._handleVariationDropdownChange}"
                  ></wy-dropdown>
                  ${activeVariation?.description ? html`
                    <wy-info-panel class="variation-description-panel">
                      <p class="variation-description-heading">Variant: ${activeVariation.name}</p>
                      <p class="variation-description-copy">${activeVariation.description}</p>
                    </wy-info-panel>
                  ` : ''}
                </div>
              ` : ''}

              <div class="body">
                ${this.activeTab === 'variables' && this.variables.length > 0 ? html`
                  <div class="variables-grid">
                    ${this.variables.map(v => this._renderVariable(v))}
                  </div>
                ` : html`
                  <div class="preview-area">${compiledPrompt}</div>
                `}
              </div>
            `}
          ` : html`
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

      return html`
        <div class="form-group">
          <wy-option-toggle
            .label="${v.label || ''}"
            .options="${options}"
            .labels="${labels}"
            .valueDescriptions="${valueDescriptions}"
            .value="${toggleValue}"
            size="${size}"
            variant="switch"
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
    const index = this.variations.findIndex(v => v.id === selectedId);
    if (index !== -1) {
      this.activeVariationIndex = index;
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

  _handleCopy() {
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
    
    const blob = new Blob([textToCopy], { type: 'text/plain' });
    navigator.clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
    this.dispatchEvent(new CustomEvent('copy', {
      detail: { text: textToCopy },
      bubbles: true,
      composed: true
    }));
    this.dispatchEvent(new CustomEvent('toast', {
      detail: { message: 'Copied to clipboard!' },
      bubbles: true,
      composed: true
    }));
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
}

customElements.define('wy-prompt-modal', WyPromptModal);
