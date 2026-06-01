import { LitElement, html, css } from 'lit';

export class WyPromptEditor extends LitElement {
    static properties = {
        prompt: { type: Object },
        categories: { type: Array },
        heroImageStatus: { type: Object },
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
            grid-template-columns: minmax(190px, 240px) minmax(0, 1fr);
            gap: var(--spacing-xl, 32px);
            align-items: start;
        }

        .editor-form {
            grid-column: 2;
            grid-row: 2;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-lg, 24px);
            height: fit-content;
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
            grid-column: 2;
            grid-row: 1;
            display: flex;
            justify-content: flex-end;
            gap: var(--spacing-sm, 8px);
            margin: 0 0 var(--spacing-md, 16px) 0;
            position: sticky;
            top: var(--spacing-lg, 24px);
            z-index: 5;
            padding: var(--spacing-sm, 8px);
            background-color: var(--md-sys-color-background, #FDFBF7);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
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

        .editor-nav {
            grid-column: 1;
            grid-row: 1 / span 2;
            position: sticky;
            top: var(--spacing-lg, 24px);
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm, 8px);
            padding: var(--spacing-md, 16px) 0;
            border-top: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-bottom: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .editor-nav-toggle {
            display: none;
        }

        .editor-nav-title {
            margin: 0 0 var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .editor-nav-list {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .editor-nav-item {
            width: 100%;
            min-height: 32px;
            padding: 6px 8px;
            border: 0;
            border-left: 2px solid transparent;
            background: transparent;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            cursor: pointer;
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            line-height: 1.25;
            text-align: left;
            transition:
                border-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
                background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .editor-nav-item:hover {
            color: var(--md-sys-color-on-surface, #121714);
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 5%, transparent);
        }

        .editor-nav-item.active {
            color: var(--md-sys-color-primary, #282828);
            border-left-color: var(--md-sys-color-primary, #282828);
            font-weight: 600;
        }

        .editor-nav-item.subitem {
            min-height: 28px;
            padding-left: 20px;
            font-size: 0.8125rem;
        }

        .editor-nav-item.variant {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 0.9375rem;
            color: var(--md-sys-color-on-surface, #121714);
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

        .hero-generator {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-md, 16px);
            margin-top: var(--spacing-lg, 24px);
            padding-top: var(--spacing-lg, 24px);
            border-top: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .hero-generator-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: var(--spacing-md, 16px);
        }

        .hero-generator-title {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: 1.0625rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
            margin: 0;
        }

        .hero-provider-status {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.75rem;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
            margin: var(--spacing-xs, 4px) 0 0;
        }

        .hero-controls {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: var(--spacing-md, 16px);
        }

        .hero-control-label {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs, 4px);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface, #121714);
        }

        .hero-control-label select,
        .hero-prompt-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
            border-radius: var(--md-sys-shape-corner-small, 8px);
            background-color: var(--md-sys-color-background, #FDFBF7);
            color: var(--md-sys-color-on-surface, #121714);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.9375rem;
        }

        .hero-control-label select {
            min-height: 40px;
            padding: 0 var(--spacing-sm, 8px);
        }

        .hero-prompt-textarea {
            min-height: 220px;
            padding: var(--spacing-sm, 8px);
            line-height: 1.45;
            resize: vertical;
        }

        .hero-actions,
        .hero-preview-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--spacing-sm, 8px);
            align-items: center;
        }

        .hero-preview-shell {
            display: flex;
            flex-direction: column;
            gap: var(--spacing-sm, 8px);
        }

        .hero-preview-image {
            width: 100%;
            aspect-ratio: 16 / 9;
            object-fit: cover;
            border-radius: var(--md-sys-shape-corner-small, 8px);
            border: 1px solid var(--md-sys-color-outline-variant, #DDD);
        }

        .hero-status-message,
        .hero-error-message {
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: 0.875rem;
            line-height: 1.4;
            margin: 0;
        }

        .hero-status-message {
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .hero-error-message {
            color: var(--err, #B3261E);
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
            background: color-mix(in srgb, var(--ink, #1A1A1A) 5%, transparent);
            border: 0;
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
            color: var(--md-sys-color-primary, #282828);
        }

        .button-small {
            padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
            font-size: 0.8125rem;
            display: flex;
            align-items: center;
            gap: var(--spacing-xs, 4px);
            white-space: nowrap;
        }

        /* Refined admin polish layer */
        .editor-layout {
            grid-template-columns: 216px minmax(0, 1fr);
            grid-template-rows: auto 1fr;
            gap: 20px;
            max-width: 1140px;
            margin: 0 auto;
            padding: 0px clamp(20px, 20px, 56px) 96px;
        }

        .actions {
            grid-column: 1 / -1;
            grid-row: 1;
            align-items: center;
            justify-content: space-between;
            gap: var(--spacing-sm, 8px);
            margin: 12px 0 28px;
            top: 12px;
            padding: 10px 12px 10px 18px;
            background: color-mix(in srgb, var(--surface-2, #FFF) 86%, var(--paper, #F7F4EE));
            backdrop-filter: blur(10px) saturate(120%);
            -webkit-backdrop-filter: blur(10px) saturate(120%);
            border: 0;
            border-radius: var(--radius-3, 16px);
            box-shadow: 0 10px 28px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
        }

        .toolbar-context {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
        }

        .toolbar-title {
            max-width: min(48vw, 520px);
            overflow: hidden;
            color: var(--ink, #1A1A1A);
            font-family: var(--font-serif, 'Lora', serif);
            font-size: 1.0625rem;
            font-weight: 600;
            line-height: 1.2;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .toolbar-dirty {
            flex-shrink: 0;
            width: 7px;
            height: 7px;
            margin-top: 1px;
            border-radius: 50%;
            background: var(--accent-terracotta, #C18A4D);
            box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-terracotta, #C18A4D) 16%, transparent);
        }

        .toolbar-actions {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm, 8px);
            flex-shrink: 0;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.01em;
            padding: 0.55rem 1.25rem;
        }

        .button-secondary {
            border: 0;
            background: color-mix(in srgb, var(--ink, #1A1A1A) 5%, transparent);
        }

        .editor-nav {
            grid-column: 1;
            grid-row: 2;
            top: 84px;
            gap: var(--spacing-xs, 4px);
            padding: 14px 12px;
            background: var(--surface-1, var(--paper, #F7F4EE));
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: 0 10px 26px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .editor-nav-title,
        .card-title::before {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.6875rem;
            font-weight: 700;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .editor-nav-title {
            padding: 0 6px 8px;
            margin: 0;
        }

        .editor-nav-item {
            position: relative;
            min-height: 32px;
            padding: 7px 10px 7px 14px;
            border-left: 0;
            border-radius: var(--radius-2, 10px);
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.8125rem;
            font-weight: 500;
        }

        .editor-nav-item::before {
            content: '';
            position: absolute;
            left: 6px;
            top: 50%;
            width: 2px;
            height: 0;
            border-radius: 3px;
            background: var(--md-sys-color-primary, #282828);
            transform: translateY(-50%);
            transition: height var(--md-sys-motion-duration-short2, 150ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }

        .editor-nav-item.active {
            border-left-color: transparent;
            background-color: color-mix(in srgb, var(--md-sys-color-primary, #282828) 6%, transparent);
        }

        .editor-nav-item.active::before {
            height: 14px;
        }

        .editor-nav-item.subitem {
            padding-left: 24px;
            font-size: 0.78rem;
        }

        .editor-form {
            grid-column: 2;
            grid-row: 2;
        }

        .editor-header {
            margin-bottom: 2px;
            padding-bottom: 0;
        }

        .breadcrumbs {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.8125rem;
        }

        h1,
        .card-title,
        .hero-generator-title {
            font-family: var(--font-serif, 'Lora', serif);
            letter-spacing: -0.015em;
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 6px;
        }

        .subtitle {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.95rem;
        }

        .card {
            background: var(--surface-2, #FFF);
            border: 0;
            border-radius: var(--radius-3, 16px);
            padding: 26px 28px;
            box-shadow: 0 12px 32px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .card-title {
            font-size: 1.375rem;
            margin-bottom: var(--spacing-md, 16px);
        }

        .card-title::before {
            content: attr(data-eyebrow);
            display: block;
            margin-bottom: 7px;
        }

        .card-description {
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.875rem;
            line-height: 1.6;
        }

        .mode-toggle {
            display: inline-flex;
            gap: var(--spacing-xs, 4px);
            padding: var(--spacing-xs, 4px);
            width: max-content;
            max-width: 100%;
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            background: var(--paper-deep, #EEE8DD);
        }

        .mode-toggle label {
            border-radius: var(--md-sys-shape-corner-full, 9999px);
            padding: 0.5rem 1.1rem;
            font-family: var(--font-body, 'Inter', sans-serif);
            font-size: 0.8125rem;
            font-weight: 600;
            color: var(--md-sys-color-on-surface-variant, #5E6E66);
        }

        .mode-toggle label:has(input:checked) {
            background: var(--md-sys-color-primary, #282828);
            color: var(--md-sys-color-on-primary, #FFF);
        }

        .mode-toggle input[type="radio"] {
            position: absolute;
            opacity: 0;
            pointer-events: none;
        }

        .info-banner {
            display: flex;
            border: 0;
            background: color-mix(in srgb, var(--accent-sage, #7D8E39) 12%, var(--surface-2, #FFF));
            border-radius: var(--radius-2, 10px);
        }

        .hero-control-label,
        .card-header-with-action,
        .hero-provider-status,
        .hero-status-message,
        .hero-error-message {
            font-family: var(--font-body, 'Inter', sans-serif);
        }

        .hero-control-label select,
        .hero-prompt-textarea {
            background: var(--field-bg, #FBF9F4);
            border: 0;
            border-radius: var(--radius-2, 10px);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
        }

        .visibility-settings {
            display: grid;
            gap: var(--spacing-md, 16px);
        }

        .visibility-setting {
            display: grid;
            grid-template-columns: 40px minmax(0, 1fr);
            gap: var(--spacing-md, 16px);
            align-items: center;
            padding: 18px 20px;
            border: 0;
            border-radius: var(--radius-2, 10px);
            background: var(--field-bg, #FBF9F4);
            box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ink, #1A1A1A) 6%, transparent);
        }

        .visibility-setting.archive {
            background: color-mix(in srgb, var(--err, #B3261E) 4%, var(--field-bg, #FBF9F4));
        }

        .visibility-icon {
            display: inline-grid;
            place-items: center;
            width: 40px;
            height: 40px;
            border-radius: var(--md-sys-shape-corner-full, 999px);
            background: var(--surface-2, #FFF);
            color: var(--ink, #1A1A1A);
            box-shadow: 0 4px 12px color-mix(in srgb, var(--ink, #1A1A1A) 7%, transparent);
        }

        .visibility-setting.archive .visibility-icon {
            color: var(--err, #B3261E);
            box-shadow: 0 4px 12px color-mix(in srgb, var(--err, #B3261E) 10%, transparent);
        }

        .visibility-icon .material-symbols-outlined {
            font-size: 21px;
        }

        .visibility-setting wy-option-toggle {
            --wy-option-toggle-off-bg: var(--paper-deep, #EEE8DD);
        }

        @media (max-width: 1200px) {
            .editor-layout {
                grid-template-columns: 1fr;
                gap: var(--spacing-lg, 24px);
            }

            .actions {
                grid-column: 1;
                grid-row: 1;
                top: 12px;
                margin: 8px 0 0;
                border-radius: var(--radius-3, 16px);
            }

            .toolbar-title {
                max-width: 46vw;
            }

            .editor-nav {
                grid-column: 1;
                grid-row: 2;
                top: 64px;
                z-index: 4;
                background: var(--surface-1, var(--paper, #F7F4EE));
                padding: var(--spacing-sm, 8px);
                border: 0;
                border-radius: var(--radius-2, 10px);
            }

            .editor-form {
                grid-column: 1;
                grid-row: 3;
            }

            .editor-nav-toggle {
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                min-height: 40px;
                border: 0;
                background: transparent;
                color: var(--md-sys-color-on-surface, #121714);
                cursor: pointer;
                font-family: var(--font-sans, 'DM Sans', sans-serif);
                font-size: 0.875rem;
                font-weight: 600;
                text-align: left;
            }

            .editor-nav-toggle .material-symbols-outlined {
                transition: transform var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
            }

            .editor-nav.open .editor-nav-toggle .material-symbols-outlined {
                transform: rotate(180deg);
            }

            .editor-nav-title {
                display: none;
            }

            .editor-nav-list {
                display: none;
                max-height: min(56vh, 520px);
                overflow-y: auto;
                padding-top: var(--spacing-xs, 4px);
            }

            .editor-nav.open .editor-nav-list {
                display: flex;
            }

            .hero-controls {
                grid-template-columns: 1fr;
            }

            .visibility-setting {
                grid-template-columns: 1fr;
                gap: var(--spacing-sm, 8px);
            }
        }
    `;

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

        return `You are helping me design a hero image for a reusable prompt in my prompt library.

I will paste the full subject prompt below. Read it closely and infer what the prompt does, who it is for, what outcome it helps create, and what kind of visual metaphor would make that functionality immediately understandable on a prompt-library website.

Subject prompt:
${subjectPrompt}

Your task:
Once you understand the subject prompt, generate the hero image to illustrate the functionality and user benefit of the subject prompt, not merely decorate its topic.

Design approach:
- Identify the core action, transformation, or decision the subject prompt enables.
- Choose one strong visual concept that communicates that function clearly and elegantly while maintaining the user's high-end editorial aesthetic. Prefer natural colors and materials over flashy graphics or simulated technology.
- Prefer concrete editorial scenes, refined object compositions, workspace vignettes, crafted materials, before/after tension, or symbolic arrangements that feel natural and premium.
- Avoid generic AI imagery, glowing robot brains, floating chat bubbles, obvious interface mockups, or literal screenshots unless the subject prompt explicitly requires them.
- Avoid visible text, labels, UI elements, diagrams, captions, watermarks, or decorative typography unless essential to the subject prompt.
- Keep the image suitable as a 16:9 website hero: clean focal point, generous negative space, strong crop, legible at card size, and not too busy. Focus on the action of the subject prompt and exclude unrelated elements.
- The user is inspired by the work of Bruce Weber, Jean-Jacques Lequeu, Sally Mann, James Dakin, Tina Barney, Cy Twombly, Edward Hopper.

Required output:
Return only the finished hero image. Do not include analysis, headings, options, or explanation.

The style requirements: minimalist, editorial and refined. Photography should only be used if relevant and should be in the style of a high end publication like World of Interiors Magazine or Kinfolk magazine. If photography is not required, prefer graphics that feel both minimalist and classic--imagine a Sir Jon Soane drawing on a solid backdrop or an architectural rendering by Charles Bullfinch.
- Output requirements: 16:9 aspect ratio, high-resolution, clean composition for a website hero, no visible prompt text, no labels, no watermarks, no overly literal AI imagery unless the use case explicitly calls for it.

Generate the image exactly as a polished 16:9 website hero image.`;
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

    _markDirty() {
        if (!this._isDirty) {
            this._isDirty = true;
        }
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
        this._heroMessage = image ? 'Preview generated. Accept it to attach it as this prompt image.' : '';
    }

    setHeroImageError(message) {
        this._heroBusy = false;
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
            alert('Cannot delete the last step.\n\nConvert to single-step mode instead.');
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
            this._editedPrompt.variations.forEach((variation, index) => {
                const id = `variation-${index}`;
                items.push({
                    id,
                    label: variation.name || `Variation ${index + 1}`,
                    type: 'variant',
                    variationIndex: index
                });

                if (index === this._openVariationIndex) {
                    const hasSteps = variation.steps && variation.steps.length > 0;
                    items.push({ id: `${id}-description`, label: 'Description', type: 'subitem', variationIndex: index, vsection: 'description' });
                    items.push({ id: `${id}-instructions`, label: 'Instructions', type: 'subitem', variationIndex: index, vsection: 'instructions' });
                    items.push({ id: `${id}-image`, label: 'Image', type: 'subitem', variationIndex: index, vsection: 'image' });
                    items.push({ id: `${id}-${hasSteps ? 'steps' : 'variables'}`, label: hasSteps ? 'Steps' : 'Variables', type: 'subitem', variationIndex: index, vsection: hasSteps ? 'steps' : 'variables' });
                    if (!hasSteps) {
                        items.push({ id: `${id}-template`, label: 'Template', type: 'subitem', variationIndex: index, vsection: 'template' });
                    }
                }
            });
        } else {
            items.push({ id: 'prompt-type', label: 'Prompt Type' });
            if (this._promptMode === 'single') {
                items.push({ id: 'variables', label: 'Variables' });
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
            const variationEditor = this.shadowRoot?.querySelector('wy-variation-editor');
            variationEditor?.expandVariation(item.variationIndex);
            this._openVariationIndex = item.variationIndex;
            await this.updateComplete;
            await variationEditor?.updateComplete;
            const target = variationEditor?.getSectionElement(item.variationIndex, item.vsection || 'variation');
            this._scrollTargetIntoView(target);
            return;
        }

        this._scrollTargetIntoView(this.shadowRoot?.querySelector(`[data-section="${item.id}"]`));
    }

    _scrollTargetIntoView(target) {
        if (!target) return;
        target.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    _handleVariationExpand(e) {
        this._openVariationIndex = e.detail?.index ?? -1;
    }

    _handleWindowScroll() {
        if (!this._editedPrompt) return;
        const sections = [...this.shadowRoot.querySelectorAll('[data-section]')]
            .map(element => ({ id: element.dataset.section, element }));
        const variationEditor = this.shadowRoot?.querySelector('wy-variation-editor');

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
            <div class="hero-generator">
                <div class="hero-generator-header">
                    <div>
                        <h3 class="hero-generator-title">Generate Hero Image</h3>
                        <p class="hero-provider-status">
                            ${hasConfiguredProvider
                                ? 'Preview first, then attach the version you like.'
                                : 'Configure GEMINI_API_KEY or OPENAI_API_KEY before generating.'}
                        </p>
                    </div>
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
                    <div class="card" data-section="visuals">
                        <h2 class="card-title" data-eyebrow="Section 02">Visuals & Metadata</h2>
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
                            <wy-variation-editor
                                .variations="${this._editedPrompt.variations}"
                                @change="${this._handleVariationsChange}"
                                @variation-expand="${this._handleVariationExpand}"
                                @image-upload="${this._handleVariationImageChange}"
                                @image-remove="${this._handleVariationImageRemove}"
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

                            <!-- Template -->
                            <div class="card" data-section="template">
                                <h2 class="card-title" data-eyebrow="Section 05">Template</h2>
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
                                    description="Featured prompts are highlighted and sorted to the top of the library."
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
                                    label="Archive Prompt"
                                    description="Archived prompts are hidden from the public site but remain editable here."
                                    .options="${['false', 'true']}"
                                    .labels="${['Off', 'On']}"
                                    .value="${this._editedPrompt.archived ? 'true' : 'false'}"
                                    @change="${(e) => this._handleFieldChange('archived', e.detail.checked)}"
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
