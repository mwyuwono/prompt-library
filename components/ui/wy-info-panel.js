import { LitElement, html } from 'lit';

/**
 * Reusable info/description panel component
 * Displays informational content in a bordered card with muted styling
 * 
 * @property {String} content - Panel text content (can also use slot for rich content)
 * @property {String} variant - Optional visual variant (reserved for future use)
 */
export class WyInfoPanel extends LitElement {
  createRenderRoot() {
    return this;
  }

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

    connectedCallback() {
        // Preserve rich light-DOM children that previously projected through
        // the default slot.
        if (!this._capturedContentNodes) {
            this._contentNodes = Array.from(this.childNodes);
            this._contentNodes.forEach(node => node.remove());
            this._capturedContentNodes = true;
        }
        super.connectedCallback();
    }

    render() {
        const panelClass = this.variant === 'compact' ? 'panel compact' : 'panel';
        
        return html`
            <div class="${panelClass}">
                ${this.heading ? html`<h3 class="panel-heading">${this.heading}</h3>` : ''}
                ${this.content ? html`<p>${this.content}</p>` : html`<div class="panel-content"></div>`}
            </div>
        `;
    }

    firstUpdated() {
        this._projectContent();
    }

    updated() {
        this._projectContent();
    }

    _projectContent() {
        if (this.content) return;
        const target = this.querySelector('.panel-content');
        if (!target || target.childNodes.length || !this._contentNodes?.length) return;
        target.append(...this._contentNodes);
    }
}

customElements.define('wy-info-panel', WyInfoPanel);
