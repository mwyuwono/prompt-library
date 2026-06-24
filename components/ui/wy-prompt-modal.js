import { LitElement, html, css } from 'lit';
import { live } from 'lit/directives/live.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';

export class WyPromptModal extends LitElement {
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

    .modal-container.visual-selector-modal {
      width: min(94vw, 1120px);
      max-width: 1120px;
    }

    :host([open]) .modal-container {
      transform: translate(-50%, -50%) scale(1);
    }

    /* HEADER STYLES */
    .header {
      padding: var(--spacing-xl, 32px) var(--spacing-xl, 32px) var(--spacing-sm, 8px);
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

    .description-text p { margin: 0 0 0.5em; }
    .description-text p:last-child { margin-bottom: 0; }

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
        display: flex;
        align-items: center;
        gap: var(--spacing-xl, 32px);
        flex-shrink: 0; /* Tabs stay fixed, don't shrink */
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
      min-height: 0;
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
        padding: var(--spacing-lg, 24px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
        background-color: var(--md-sys-color-surface-container-low);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--md-sys-shape-corner-medium, 0);
    }

    .variation-selector-container wy-dropdown {
        width: 100%;
    }

    .body > .variation-selector-container {
        margin: var(--spacing-xl, 32px) 0 0;
    }

    .visual-selector-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
        gap: var(--spacing-lg, 24px);
        padding: 0 var(--spacing-xl, 32px) var(--spacing-xl, 32px);
        align-items: start;
    }

    .visual-selector-main {
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .visual-selector-main .header-main {
        margin-bottom: var(--spacing-md, 16px);
    }

    .visual-selector-main .tabs-container {
        padding-left: 0;
        padding-right: 0;
    }

    .visual-selector-main .body {
        padding: var(--spacing-lg, 24px) 0 0;
    }

    .visual-selected-panel {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-lg, 24px);
        margin-top: var(--spacing-sm, 8px);
        margin-bottom: var(--spacing-lg, 24px);
    }

    .visual-selector-rail {
        position: sticky;
        top: var(--spacing-md, 16px);
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm, 12px);
        max-height: calc(90vh - 128px);
        overflow: auto;
        padding: var(--spacing-md, 16px);
        background-color: var(--md-sys-color-surface-container-low);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: var(--md-sys-shape-corner-medium, 0);
    }

    .variation-select-native {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        min-height: 56px;
        padding: 0 calc(var(--spacing-xl, 32px) + 20px) 0 var(--spacing-lg, 24px);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        background-color: var(--md-sys-color-surface-container-lowest, #FDFBF7);
        color: var(--md-sys-color-on-surface, #1D1B20);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.9375rem;
        font-weight: 500;
        cursor: pointer;
    }

    .variation-select-wrap {
        position: relative;
    }

    .variation-select-wrap .material-symbols-outlined {
        position: absolute;
        right: var(--spacing-md, 16px);
        top: 50%;
        transform: translateY(-50%);
        color: var(--md-sys-color-on-surface-variant, #49454E);
        pointer-events: none;
        font-size: 22px;
    }

    .variation-select-native:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .visual-variation-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(138px, 1fr));
        gap: var(--spacing-sm, 12px);
    }

    .visual-selector-rail .visual-variation-grid {
        grid-template-columns: 1fr;
    }

    .visual-variation-tile {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 100%;
        padding: 0;
        background: var(--md-sys-color-surface-container-lowest, #FDFBF7);
        color: var(--md-sys-color-on-surface, #1D1B20);
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        text-align: left;
        transition:
            border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
            box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .visual-variation-tile::after {
        content: '';
        position: absolute;
        inset: 0;
        background: currentColor;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .visual-variation-tile:hover::after {
        opacity: var(--md-sys-state-hover-opacity, 0.08);
    }

    .visual-variation-tile:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .visual-variation-tile.selected {
        border-color: var(--md-sys-color-primary, #282828);
        box-shadow: inset 0 0 0 1px var(--md-sys-color-primary, #282828);
    }

    .visual-variation-media {
        display: block;
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        background: var(--paper-deep, #EEE8DD);
        border-bottom: 1px solid var(--paper-edge, #DDD6C8);
    }

    .visual-variation-tile.thumbnail-only .visual-variation-media,
    .visual-variation-tile.thumbnail-only .visual-variation-text-tile {
        border-bottom: 0;
    }

    .visual-variation-text-tile {
        display: flex;
        flex: 1;
        min-height: 104px;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-md, 16px);
        background:
            linear-gradient(
                135deg,
                color-mix(in srgb, var(--paper-deep, #EEE8DD) 74%, transparent),
                var(--md-sys-color-surface-container-lowest, #FDFBF7)
            );
        border-bottom: 1px solid var(--paper-edge, #DDD6C8);
    }

    .visual-variation-text-tile .material-symbols-outlined {
        color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 46%, transparent);
        font-size: 30px;
    }

    .visual-variation-copy {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs, 4px);
        padding: var(--spacing-sm, 12px);
        min-width: 0;
    }

    .visual-variation-name {
        color: var(--md-sys-color-on-surface, #1D1B20);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.8125rem;
        font-weight: 700;
        line-height: 1.25;
        overflow-wrap: anywhere;
    }

    .visual-variation-description {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: var(--md-sys-color-text-muted);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        line-height: 1.35;
    }

    .visual-variation-tile.thumbnail-only.has-image .visual-variation-copy {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
    }

    .variation-description-panel {
        margin-top: 0;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .variation-image {
        margin: 0;
    }

    .variation-image img {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 10;
        object-fit: cover;
        border: 1px solid var(--paper-edge, #DDD6C8);
    }

    .variation-image figcaption {
        margin: 8px 0 0;
        color: var(--ink-mute, #6B6B6A);
        font-family: var(--ff-serif, 'Lora', serif);
        font-size: 0.8125rem;
        font-style: italic;
        line-height: 1.35;
        text-align: right;
    }

    .reference-images-panel {
        margin: 0;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .reference-images-list {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--paper-edge, #DDD6C8);
        background: var(--paper, #F7F4EE);
    }

    .reference-image-row {
        display: grid;
        grid-template-columns: 72px minmax(0, 1fr) auto;
        align-items: center;
        gap: var(--spacing-md, 16px);
        min-height: 96px;
        padding: var(--spacing-md, 16px);
    }

    .reference-image-row + .reference-image-row {
        border-top: 1px solid var(--paper-edge, #DDD6C8);
    }

    .reference-image-thumb {
        display: block;
        width: 72px;
        height: 72px;
        object-fit: cover;
        border: 1px solid var(--paper-edge, #DDD6C8);
        background: var(--white, #FFFFFF);
    }

    .reference-image-meta {
        min-width: 0;
        padding-right: var(--spacing-xs, 8px);
    }

    .reference-image-label {
        color: var(--ink, #1A1A1A);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .reference-image-url {
        display: -webkit-box;
        margin-top: 6px;
        color: var(--ink-mute, #6B6B6A);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.75rem;
        line-height: 1.45;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        white-space: pre-line;
    }

    .reference-variable {
        display: inline-block;
        margin-top: 6px;
        color: var(--ink-soft, #A8A49C);
        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
        font-size: 0.6875rem;
        line-height: 1.35;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .reference-image-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        flex-wrap: wrap;
        gap: 6px;
    }

    .reference-image-copy {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 36px;
        padding: 0 10px;
        border: 1px solid var(--paper-edge, #DDD6C8);
        border-radius: 0;
        background: transparent;
        color: var(--ink, #1A1A1A);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.6875rem;
        font-weight: 600;
        line-height: 1.1;
        white-space: nowrap;
        cursor: pointer;
        transition: background-color var(--dur-1, 150ms) var(--ease, ease),
          color var(--dur-1, 150ms) var(--ease, ease);
    }

    .reference-image-copy:hover {
        background: var(--ink, #1A1A1A);
        color: var(--paper, #F7F4EE);
    }

    .reference-image-copy:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 2px;
    }

    .reference-image-copy .material-symbols-outlined {
        font-size: 18px;
        line-height: 1;
    }

    .variation-meta-section + .variation-meta-section {
        margin-top: var(--spacing-md, 16px);
        padding-top: var(--spacing-md, 16px);
        border-top: 1px solid var(--paper-edge, #DDD6C8);
    }

    .prompt-instructions-panel {
        margin-top: 16px;
        --wy-info-panel-bg: transparent;
        --wy-info-panel-padding: 0;
        --wy-info-panel-font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
    }

    .prompt-instructions-heading {
        margin: 0 0 var(--spacing-xxs, 4px);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft, #A8A49C);
    }

    .prompt-instructions-copy {
        margin: 0;
    }

    .prompt-instructions-copy p { margin: 0 0 0.5em; }
    .prompt-instructions-copy p:last-child { margin-bottom: 0; }

    .prompt-instructions-copy ol,
    .prompt-instructions-copy ul {
        margin: 2px 0 0;
        padding-left: 1.4em;
    }

    .prompt-instructions-copy li + li {
        margin-top: 2px;
    }

    .variation-description-heading {
        margin: 0 0 var(--spacing-xxs, 4px);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ink-soft, #A8A49C);
    }

    .variation-name {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--spacing-sm, 8px);
        width: 100%;
        margin: 0;
        padding: 0;
        background: transparent;
        border: 0;
        font-family: var(--ff-serif, 'Lora', serif);
        font-size: 1.125rem;
        font-weight: 500;
        line-height: 1.25;
        color: var(--md-sys-color-text-heading);
        letter-spacing: 0;
        text-align: left;
        cursor: pointer;
    }

    .variation-name:focus-visible {
        outline: 3px solid var(--wy-prompt-modal-focus-ring, color-mix(in srgb, var(--md-sys-color-primary) 18%, transparent));
        outline-offset: 4px;
    }

    .variation-name .material-symbols-outlined {
        flex: 0 0 auto;
        font-size: 20px;
        transition: transform 0.2s;
    }

    .variation-name[aria-expanded="true"] .material-symbols-outlined {
        transform: rotate(180deg);
    }

    .variation-details {
        margin-top: var(--spacing-sm, 8px);
    }

    .variation-description-copy {
        margin: 0;
        font-size: 0.9375rem;
        line-height: 1.6;
        color: var(--md-sys-color-text-muted);
    }

    .variation-description-copy p { margin: 0 0 0.5em; }
    .variation-description-copy p:last-child { margin-bottom: 0; }

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
      display: block;
      width: 100%;
    }

    .form-group wy-option-toggle .label {
      margin: 0 0 var(--spacing-xs, 4px) 0;
      color: var(--md-sys-color-primary);
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.875rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .form-group wy-option-toggle .description {
      margin: 0;
      max-width: 36rem;
      color: color-mix(in srgb, var(--md-sys-color-primary) 70%, transparent);
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
      font-weight: 400;
      line-height: 1.8;
    }

    .form-group wy-option-toggle .switch-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--spacing-md, 16px);
      min-height: 38px;
    }

    .form-group wy-option-toggle .switch-copy {
      min-width: 0;
    }

    .form-group wy-option-toggle .switch-control {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm, 8px);
      justify-self: end;
    }

    .form-group wy-option-toggle .switch-state {
      min-width: 2.5rem;
      text-align: right;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.625rem;
      font-weight: 700;
      line-height: 1.1;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--md-sys-color-primary);
      transition: color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
      user-select: none;
    }

    .form-group wy-option-toggle .switch-button {
      appearance: none;
      position: relative;
      overflow: hidden;
      border: 0;
      padding: 0;
      flex: 0 0 auto;
      width: 52px;
      height: 30px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: var(--wy-option-toggle-off-bg, var(--paper-deep));
      cursor: pointer;
      transition: background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .form-group wy-option-toggle .switch-button.checked {
      background: var(--md-sys-color-primary);
    }

    .form-group wy-option-toggle .switch-button::after {
      content: '';
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
      pointer-events: none;
    }

    .form-group wy-option-toggle .switch-button:hover::after {
      opacity: var(--md-sys-state-hover-opacity, 0.08);
    }

    .form-group wy-option-toggle .switch-button:focus-visible {
      outline: 2px solid var(--md-sys-color-primary);
      outline-offset: 2px;
    }

    .form-group wy-option-toggle .switch-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: var(--md-sys-color-primary);
      transition:
        transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
        background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }

    .form-group wy-option-toggle .switch-button.checked .switch-thumb {
      transform: translateX(22px);
      background: var(--md-sys-color-surface);
    }

    .form-group wy-option-toggle .selected-value-text {
      margin: var(--spacing-sm, 8px) 0 0 0;
      color: color-mix(in srgb, var(--md-sys-color-on-surface) 86%, transparent);
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: var(--md-sys-typescale-body-small-size, 0.875rem);
      font-weight: 400;
      line-height: 1.7;
    }

    .preview-area {
      background: var(--md-sys-color-surface-container-highest);
      border-radius: 0;
      padding: 24px;
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 1rem;
      line-height: 1.7;
      color: var(--md-sys-color-on-surface);
      border: 1px solid var(--md-sys-color-outline-variant);
    }

    /* Markdown element styles within preview-area */
    .preview-area p { margin: 0 0 1em; }
    .preview-area p:last-child { margin-bottom: 0; }
    .preview-area h1, .preview-area h2, .preview-area h3,
    .preview-area h4, .preview-area h5, .preview-area h6 {
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-weight: 600;
      line-height: 1.3;
      margin: 1.2em 0 0.4em;
      color: var(--md-sys-color-on-surface);
    }
    .preview-area h1:first-child, .preview-area h2:first-child,
    .preview-area h3:first-child { margin-top: 0; }
    .preview-area h1 { font-size: 1.4rem; }
    .preview-area h2 { font-size: 1.2rem; }
    .preview-area h3 { font-size: 1.05rem; }
    .preview-area h4, .preview-area h5, .preview-area h6 { font-size: 1rem; }
    .preview-area ul, .preview-area ol {
      margin: 0 0 1em;
      padding-left: 1.5em;
    }
    .preview-area li + li { margin-top: 0.25em; }
    .preview-area blockquote {
      margin: 0 0 1em;
      padding: 0.5em 1em;
      border-left: 3px solid var(--md-sys-color-outline-variant);
      color: var(--ink-mute, #6B6760);
      font-style: italic;
    }
    .preview-area code {
      font-family: 'DM Mono', 'Fira Code', monospace;
      font-size: 0.875em;
      background: var(--md-sys-color-surface-container);
      padding: 0.1em 0.35em;
      border-radius: 3px;
    }
    .preview-area pre {
      background: var(--md-sys-color-surface-container);
      padding: 1em;
      border-radius: 6px;
      overflow-x: auto;
      margin: 0 0 1em;
    }
    .preview-area pre code {
      background: none;
      padding: 0;
      font-size: 0.875rem;
    }
    .preview-area hr {
      border: none;
      border-top: 1px solid var(--md-sys-color-outline-variant);
      margin: 1.2em 0;
    }
    .preview-area table {
      border-collapse: collapse;
      width: 100%;
      margin: 0 0 1em;
      font-size: 0.9rem;
    }
    .preview-area th, .preview-area td {
      text-align: left;
      padding: 6px 12px;
      border: 1px solid var(--md-sys-color-outline-variant);
    }
    .preview-area th {
      background: var(--md-sys-color-surface-container);
      font-weight: 600;
    }
    .preview-area a {
      color: var(--md-sys-color-primary);
      text-decoration: underline;
    }
    .preview-area strong { font-weight: 600; }
    .preview-area em { font-style: italic; }

    .overview::after {
      content: '';
      display: block;
      clear: both;
    }

    .overview-eyebrow {
      display: block;
      margin-bottom: 14px;
      color: var(--ink-soft, #A8A49C);
      font-family: var(--font-sans, 'DM Sans', sans-serif);
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.18em;
      line-height: 1.2;
      text-transform: uppercase;
    }

    .overview-figure {
      float: right;
      width: 206px;
      margin: 2px 0 14px 28px;
    }

    .overview-figure img {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 10;
      object-fit: cover;
      border: 1px solid var(--paper-edge, #DDD6C8);
    }

    .overview-figure figcaption {
      margin: 8px 0 0;
      color: var(--ink-mute, #6B6B6A);
      font-family: var(--ff-serif, 'Lora', serif);
      font-size: 0.8125rem;
      font-style: italic;
      line-height: 1.35;
      text-align: right;
    }

    .overview-lead {
      margin: 0;
      color: var(--ink, #1A1A1A);
      font-family: var(--ff-serif, 'Lora', serif);
      font-size: 1.375rem;
      font-weight: 400;
      line-height: 1.5;
    }

    .overview-lead p { margin: 0 0 0.75em; }
    .overview-lead p:last-child { margin-bottom: 0; }

    .overview-lead ol,
    .overview-lead ul {
      margin: 4px 0 0;
      padding-left: 1.25em;
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
      .header { padding: var(--spacing-lg, 24px) var(--spacing-md, 16px) var(--spacing-sm, 8px); }
      .header-top { align-items: flex-start; }
      .header-main { flex-direction: column; align-items: flex-start; gap: var(--spacing-sm, 8px); margin-bottom: var(--spacing-sm, 8px); }
      .header-actions-left { flex-wrap: wrap; }
      .labeled-btn { min-width: 0; }
      .labeled-btn.primary { padding-right: 12px; }
      .reference-image-row {
        grid-template-columns: 56px minmax(0, 1fr);
        min-height: 72px;
        gap: var(--spacing-sm, 12px);
        padding: var(--spacing-sm, 12px);
      }
      .reference-image-thumb {
        width: 56px;
        height: 56px;
      }
      .reference-image-meta {
        padding-right: 0;
      }
      .reference-image-actions {
        grid-column: 1 / -1;
        justify-content: flex-start;
      }
      .title-group h2 { font-size: 1.75rem; }
      .tabs-container { padding: 0; } /* wy-tabs handles its own mobile padding */
      .variation-selector-container {
        margin: var(--spacing-sm, 8px) var(--spacing-md, 16px) 0;
        padding: var(--spacing-sm, 12px);
        gap: var(--spacing-sm, 8px);
      }
      .visual-selector-layout {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md, 16px);
        padding: 0 var(--spacing-md, 16px) var(--spacing-md, 16px);
      }
      .visual-selector-rail {
        position: static;
        order: -1;
        max-height: none;
        overflow: visible;
        padding: var(--spacing-sm, 12px);
      }
      .visual-selector-rail .visual-variation-grid {
        grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
      }
      .visual-selector-main .body {
        padding-top: var(--spacing-md, 16px);
      }
      .visual-variation-grid {
        grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
      }
      .visual-variation-text-tile {
        min-height: 86px;
      }
      .visual-variation-copy {
        padding: var(--spacing-xs, 8px);
      }
      .variation-description-heading {
        font-size: 0.6875rem;
      }
      .body { padding: var(--spacing-md, 16px); }
      
      /* Tighter button spacing on mobile */
      .header-actions-left {
        gap: 4px;
      }

      .overview-figure {
        float: none;
        width: 100%;
        margin: 0 0 var(--spacing-md, 16px);
      }

      .overview-figure img {
        aspect-ratio: 16 / 10;
        max-height: 220px;
      }

      .overview-lead {
        font-size: 1.125rem;
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
          ${step.instructions}
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
                <span class="visual-variation-name">${name}</span>
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
      <div class="modal-container ${useVisualSelector ? 'visual-selector-modal' : ''}">
        
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
    if (variable.description) return variable.description;
    if (!Array.isArray(options) || options.length < 2 || options[0] !== '' || !options[1]) return '';

    const enabledText = String(options[1]).trim();
    const firstSentenceMatch = enabledText.match(/^.*?[.!?](?:\s|$)/);
    const firstSentence = firstSentenceMatch ? firstSentenceMatch[0].trim() : enabledText;
    return firstSentence.length > 140
      ? `${firstSentence.slice(0, 137).trim()}...`
      : firstSentence;
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
