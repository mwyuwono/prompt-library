import { LitElement, html, css } from 'lit';

/**
 * Reusable info/description panel component
 * Displays informational content in a bordered card with muted styling
 * 
 * @property {String} content - Panel text content (can also use slot for rich content)
 * @property {String} variant - Optional visual variant (reserved for future use)
 */
export class WyInfoPanel extends LitElement {
    static properties = {
        content: { type: String },
        variant: { type: String },
        heading: { type: String }
    };

    constructor() {
        super();
        this.content = '';
        this.variant = 'default';
        this.heading = '';
    }

    static styles = css`
        /* Note: DM Sans font should be loaded in consuming page <head> */
        
        :host {
            display: block;
            /* CSS custom properties for theming - can be overridden by parent component */
            --wy-info-panel-bg: var(--md-sys-color-background, #FDFBF7);
            --wy-info-panel-border: var(--md-sys-color-surface-container-highest, #D7D3C8);
            --wy-info-panel-text-color: #52525B;
            --wy-info-panel-compact-bg: var(--md-sys-color-secondary-container, #E8DDD7);
            --wy-info-panel-compact-border: var(--md-sys-color-outline-variant, #DDD);
            --wy-info-panel-padding: var(--spacing-lg, 24px);
            --wy-info-panel-compact-padding: var(--spacing-md, 16px);
            --wy-info-panel-font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
        }
        
        .panel {
            background-color: var(--wy-info-panel-bg);
            border-radius: var(--md-sys-shape-corner-medium, 16px);
            padding: var(--wy-info-panel-padding);
            color: var(--wy-info-panel-text-color);
            font-family: var(--font-sans, 'DM Sans', sans-serif);
            font-size: var(--wy-info-panel-font-size);
            line-height: 1.6;
            transition: background-color var(--md-sys-motion-duration-short4, 200ms) var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
        }
        
        .panel p {
            margin: 0;
        }
        
        .panel p + p {
            margin-top: var(--spacing-md, 16px);
        }
        
        .panel.compact {
            padding: var(--wy-info-panel-compact-padding);
            background-color: var(--wy-info-panel-compact-bg);
        }
        
        .panel-heading {
            font-family: var(--font-serif, 'Playfair Display', serif);
            font-size: var(--md-sys-typescale-title-medium-size, 1rem);
            color: var(--md-sys-color-on-surface);
            margin: 0;
            font-weight: 500;
        }
        
    /* Support for slotted content */
    ::slotted(*) {
        color: var(--wy-info-panel-text-color);
        font-family: var(--font-sans, 'DM Sans', sans-serif);
    }
    
    ::slotted(p) {
        margin: 0;
    }
    
    ::slotted(p + p) {
        margin-top: var(--spacing-md, 16px);
    }
    `;

    render() {
        const panelClass = this.variant === 'compact' ? 'panel compact' : 'panel';
        
        return html`
            <div class="${panelClass}">
                ${this.heading ? html`<h3 class="panel-heading">${this.heading}</h3>` : ''}
                ${this.content ? html`<p>${this.content}</p>` : html`<slot></slot>`}
            </div>
        `;
    }
}

customElements.define('wy-info-panel', WyInfoPanel);
