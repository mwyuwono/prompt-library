import { LitElement, html } from 'lit';

class WyColorPalette extends LitElement {
  createRenderRoot() {
    return this;
  }

    static properties = {
        open:      { type: Boolean, reflect: true },
        palettes:  { type: Array },
        _loading:  { state: true },
        _error:    { state: true },
    };

    constructor() {
        super();
        this.open = false;
        this.palettes = [];
        this._loading = false;
        this._error = false;
        this._loaded = false;
        this._copiedChipEl = null;
        this._copiedPaletteId = null;
        this._handleDocKeyDown = this._handleDocKeyDown.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('keydown', this._handleDocKeyDown);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this._handleDocKeyDown);
    }

    updated(changed) {
        if (changed.has('open') && this.open && !this._loaded) {
            this._loadPalettes();
        }
    }

    async _loadPalettes() {
        this._loading = true;
        this._error = false;
        try {
            const res = await fetch('/palettes.json');
            if (!res.ok) throw new Error('fetch failed');
            this.palettes = await res.json();
            this._loaded = true;
        } catch {
            this._error = true;
        } finally {
            this._loading = false;
        }
    }

    async _copyHex(hex, chipEl) {
        try {
            await navigator.clipboard.writeText(hex);
        } catch {
            this._fallbackCopy(hex);
        }
        this._flashChip(chipEl);
        this._dispatchToast(hex);
    }

    async _copyPalette(palette, btnEl) {
        const text = `Color Palette: ${palette.colors.map(c => `${c.name} (${c.hex})`).join(', ')}`;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            this._fallbackCopy(text);
        }
        this._flashCopyBtn(btnEl, palette.paletteId);
        this._dispatchToast(`"${palette.paletteName}" copied`);
    }

    _fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch { /* ignore */ }
        document.body.removeChild(ta);
    }

    _flashChip(chipEl) {
        if (!chipEl) return;
        chipEl.classList.add('copied');
        setTimeout(() => chipEl.classList.remove('copied'), 900);
    }

    _flashCopyBtn(btnEl, paletteId) {
        if (!btnEl) return;
        this._copiedPaletteId = paletteId;
        btnEl.classList.add('copied');
        setTimeout(() => {
            btnEl.classList.remove('copied');
            this._copiedPaletteId = null;
        }, 1200);
    }

    _dispatchToast(message) {
        this.dispatchEvent(new CustomEvent('palette-toast', {
            detail: { message },
            bubbles: true,
            composed: true,
        }));
    }

    close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    _handleScrimClick(e) {
        if (e.target === e.currentTarget) this.close();
    }

    _handleDocKeyDown(e) {
        if (e.key === 'Escape' && this.open) this.close();
    }

    render() {
        return html`
            <div class="scrim" @click="${this._handleScrimClick}"></div>
            <div
                class="panel"
                role="dialog"
                aria-label="Color Palettes"
                aria-modal="true"
            >
                <div class="panel-header">
                    <h2 class="panel-title">Color Palettes</h2>
                    <button
                        class="close-btn"
                        @click="${this.close}"
                        aria-label="Close palette panel"
                    >
                        <span class="ms">close</span>
                    </button>
                </div>
                <div class="panel-body">
                    ${this._loading
                        ? html`<p class="state-msg">Loading…</p>`
                        : this._error
                            ? html`<p class="state-msg">Could not load palettes.</p>`
                            : this.palettes.length === 0
                                ? html`<p class="state-msg">No palettes available.</p>`
                                : this.palettes.map(p => this._renderRow(p))
                    }
                </div>
            </div>
        `;
    }

    _renderRow(palette) {
        return html`
            <div class="palette-row">
                <div class="palette-row-header">
                    <p class="palette-name">${palette.paletteName}</p>
                    <button
                        class="copy-palette-btn"
                        title="Copy palette as text"
                        aria-label="Copy ${palette.paletteName} palette"
                        @click="${(e) => this._copyPalette(palette, e.currentTarget)}"
                    >
                        <span class="ms sm">content_copy</span>
                    </button>
                </div>
                <div class="chips-row">
                    ${palette.colors.map(c => html`
                        <button
                            class="chip"
                            style="background-color: ${c.hex};"
                            title="${c.name} — ${c.hex}"
                            aria-label="Copy ${c.name} (${c.hex})"
                            @click="${(e) => this._copyHex(c.hex, e.currentTarget)}"
                        ></button>
                    `)}
                </div>
            </div>
        `;
    }
}

customElements.define('wy-color-palette', WyColorPalette);
