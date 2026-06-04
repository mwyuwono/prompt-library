import { LitElement, html, css } from 'lit';

class WyColorPalette extends LitElement {
    static properties = {
        open:      { type: Boolean, reflect: true },
        palettes:  { type: Array },
        _loading:  { state: true },
        _error:    { state: true },
    };

    static styles = css`
        :host {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 1500;
            pointer-events: none;
            font-family: var(--ff-sans, 'Inter', sans-serif);
        }

        :host([open]) {
            pointer-events: auto;
        }

        .scrim {
            position: absolute;
            inset: 0;
            background: transparent;
            pointer-events: none;
        }

        :host([open]) .scrim {
            pointer-events: auto;
        }

        .panel {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 320px;
            max-width: 100vw;
            background: var(--paper, #F7F4EE);
            border-left: 1px solid var(--paper-edge, #DDD6C8);
            box-shadow: var(--shadow-modal, -4px 0 32px rgba(0,0,0,0.14));
            display: flex;
            flex-direction: column;
            transform: translateX(100%);
            transition: transform var(--dur-2, 350ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            pointer-events: auto;
            overflow: hidden;
        }

        :host([open]) .panel {
            transform: translateX(0);
        }

        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--s-3, 12px) var(--s-4, 16px) var(--s-3, 12px) var(--s-5, 24px);
            border-bottom: 1px solid var(--paper-edge, #DDD6C8);
            flex-shrink: 0;
        }

        .panel-title {
            font-family: var(--ff-serif, 'Lora', serif);
            font-style: italic;
            font-size: var(--fs-body-l, 16px);
            font-weight: 500;
            color: var(--ink, #1A1A1A);
            margin: 0;
        }

        .close-btn {
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-pill, 9999px);
            color: var(--ink-mute, #6B6B6A);
            position: relative;
            overflow: hidden;
            transition: color var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            flex-shrink: 0;
        }

        .close-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--ink, #1A1A1A);
            opacity: 0;
            transition: opacity var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            border-radius: inherit;
            pointer-events: none;
        }

        .close-btn:hover::before { opacity: 0.06; }
        .close-btn:hover { color: var(--ink, #1A1A1A); }

        .close-btn:focus-visible {
            outline: 2px solid var(--ink, #1A1A1A);
            outline-offset: 2px;
        }

        .panel-body {
            flex: 1;
            overflow-y: auto;
            padding: var(--s-4, 16px) var(--s-5, 24px);
            display: flex;
            flex-direction: column;
            gap: var(--s-5, 24px);
        }

        .palette-row {
            display: flex;
            flex-direction: column;
            gap: var(--s-2, 8px);
        }

        .palette-row-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--s-2, 8px);
        }

        .palette-name {
            font-size: var(--fs-body-s, 13px);
            font-weight: 500;
            color: var(--ink, #1A1A1A);
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .copy-palette-btn {
            width: 28px;
            height: 28px;
            background: transparent;
            border: none;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-pill, 9999px);
            color: var(--ink-soft, #A8A49C);
            position: relative;
            overflow: hidden;
            transition: color var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            flex-shrink: 0;
        }

        .copy-palette-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: var(--ink, #1A1A1A);
            opacity: 0;
            transition: opacity var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
            border-radius: inherit;
            pointer-events: none;
        }

        .copy-palette-btn:hover::before { opacity: 0.06; }
        .copy-palette-btn:hover { color: var(--ink, #1A1A1A); }

        .copy-palette-btn:focus-visible {
            outline: 2px solid var(--ink, #1A1A1A);
            outline-offset: 2px;
        }

        .copy-palette-btn.copied {
            color: var(--ok, #386A20);
        }

        .chips-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--s-1, 4px);
        }

        .chip {
            width: 20px;
            height: 20px;
            border-radius: var(--radius-1, 2px);
            border: 1px solid rgba(26, 26, 26, 0.12);
            cursor: pointer;
            flex-shrink: 0;
            position: relative;
            background: transparent;
            padding: 0;
            transition: transform var(--dur-1, 150ms) var(--ease, cubic-bezier(0.2, 0.6, 0.2, 1));
        }

        .chip:hover {
            transform: scale(1.3);
            z-index: 1;
        }

        .chip:active {
            transform: scale(1.1);
        }

        .chip:focus-visible {
            outline: 2px solid var(--ink, #1A1A1A);
            outline-offset: 2px;
        }

        .chip.copied {
            outline: 2px solid var(--ok, #386A20);
            outline-offset: 2px;
        }

        .ms {
            font-family: 'Material Symbols Outlined';
            font-size: 18px;
            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
            line-height: 1;
            display: inline-flex;
            user-select: none;
        }

        .ms.sm {
            font-size: 16px;
        }

        .state-msg {
            text-align: center;
            padding: var(--s-7, 48px) var(--s-4, 16px);
            color: var(--ink-mute, #6B6B6A);
            font-size: var(--fs-body-s, 13px);
        }

        @media (prefers-reduced-motion: reduce) {
            .panel { transition: none; }
            .chip  { transition: none; }
        }

        @media (max-width: 480px) {
            .panel {
                top: auto;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 65vh;
                transform: translateY(100%);
                border-left: none;
                border-top: 1px solid var(--paper-edge, #DDD6C8);
                border-radius: var(--radius-3, 16px) var(--radius-3, 16px) 0 0;
                box-shadow: 0 -4px 32px rgba(0,0,0,0.12);
            }
            :host([open]) .panel {
                transform: translateY(0);
            }
        }
    `;

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
