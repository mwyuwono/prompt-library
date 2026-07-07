const DEFAULT_CORPUS_URL = '../../corpus/quick-text.json';
const DEFAULT_PALETTE_URL = '../../corpus/palette.json';
const VISIBILITIES = ['private', 'public', 'local-only'];
const FONT_FAMILIES = ['sans', 'serif'];

class QuickTextLauncher extends HTMLElement {
  static observedAttributes = ['corpus-url', 'palette-url', 'mode'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.corpus = null;
    this.palette = null;
    this.activeCategory = 'all';
    this.searchTerm = '';
    this.focusedIndex = 0;
    this.previewPhrase = null;
    this.editingPhrase = null;
    this.copiedId = null;
    this.expandedPhraseId = null;
    this.highlightedAtomId = null;
    this.variableValues = {};
    this.editingVariableKey = null;
  }

  connectedCallback() {
    this.renderShell();
    this.load();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.load();
  }

  get adminEnabled() {
    return this.getAttribute('mode') === 'admin';
  }

  get publicOnly() {
    return this.getAttribute('mode') === 'public';
  }

  async load() {
    const corpusUrl = this.getAttribute('corpus-url') || DEFAULT_CORPUS_URL;
    const paletteUrl = this.getAttribute('palette-url') || DEFAULT_PALETTE_URL;
    const [corpus, palette] = await Promise.all([
      fetch(corpusUrl, { cache: 'no-store' }).then((res) => res.json()),
      fetch(paletteUrl, { cache: 'no-store' }).then((res) => res.json())
    ]);
    this.corpus = this.publicOnly ? publicCorpus(corpus) : corpus;
    this.palette = palette;
    this.render();
  }

  get filteredPhrases() {
    if (!this.corpus) return [];
    const term = this.searchTerm.trim().toLowerCase();
    return this.corpus.phrases
      .filter((phrase) => this.activeCategory === 'all' || phrase.categoryId === this.activeCategory || (this.activeCategory === 'favorites' && phrase.favorite))
      .filter((phrase) => {
        if (!term) return true;
        return [phrase.title, phrase.summary, phrase.value, ...(phrase.tags || [])].join(' ').toLowerCase().includes(term);
      });
  }

  renderShell() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --qt-paper: var(--paper, #f7f4ee);
          --qt-white: var(--white, #fffdf8);
          --qt-ink: var(--ink, #1a1a1a);
          --qt-muted: var(--ink-mute, #6b6b6a);
          --qt-edge: var(--paper-edge, #ddd6c8);
          display: block;
          color: var(--qt-ink);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        * { box-sizing: border-box; }
        .wrap { background: var(--qt-paper); border: 1px solid var(--qt-edge); border-radius: 8px; padding: 14px; }
        .tabs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
        button, input, select, textarea { font: inherit; }
        button {
          position: relative;
          border: 1px solid var(--qt-edge);
          background: var(--qt-white);
          color: var(--qt-ink);
          border-radius: 8px;
          padding: 8px 10px;
          cursor: pointer;
        }
        button::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: var(--qt-ink);
          opacity: 0;
          pointer-events: none;
        }
        button:hover::before { opacity: .05; }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible, .tile:focus-visible {
          outline: 2px solid var(--qt-ink);
          outline-offset: 2px;
        }
        button[aria-pressed="true"] { background: var(--qt-ink); color: #fff; border-color: var(--qt-ink); }
        .bar { display: flex; gap: 8px; align-items: center; margin-bottom: 14px; }
        .search { min-width: 180px; flex: 1; border: 1px solid var(--qt-edge); background: var(--qt-white); border-radius: 8px; padding: 10px 12px; color: var(--qt-ink); }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
        .tile {
          min-height: 112px;
          border: 1px solid color-mix(in srgb, var(--tile-bg) 78%, black);
          background: var(--tile-bg);
          color: var(--tile-text);
          border-radius: 8px;
          padding: 12px;
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 10px;
        }
        .tile-title { font-family: var(--tile-font-family); font-size: var(--tile-font-size); line-height: 1.15; font-weight: 700; overflow-wrap: anywhere; }
        .tile .copied {
          position: absolute;
          right: 8px;
          bottom: 8px;
          color: var(--tile-text);
          font-size: 11px;
          font-weight: 700;
          opacity: .82;
        }
        .empty, .loading { padding: 24px; color: var(--qt-muted); }
        .tile[data-expandable="true"] .tile-title::after {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          margin-left: 6px;
          border-radius: 999px;
          background: currentColor;
          opacity: .55;
          vertical-align: middle;
        }
        .atomic-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, .38);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          z-index: 60;
        }
        .atomic-card {
          --qt-atomic-bg: #22201b;
          --qt-atomic-text: #f4ede0;
          --qt-atomic-chip: #f1e6d3;
          --qt-atomic-chip-text: #22201b;
          --qt-atomic-hover: #e2725b;
          width: clamp(320px, 92vw, 640px);
          min-height: 260px;
          border-radius: 18px;
          background: var(--qt-atomic-bg);
          color: var(--qt-atomic-text);
          padding: 32px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, .35);
          cursor: pointer;
          position: relative;
        }
        .atomic-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: .02em;
          text-transform: uppercase;
          opacity: .6;
          margin-bottom: 18px;
        }
        .atomic-body {
          white-space: pre-wrap;
          line-height: 1.7;
          font-size: calc(var(--tile-font-size, 18px) * 1.15);
          font-family: var(--tile-font-family);
          cursor: copy;
        }
        .atom-chip {
          display: inline-flex;
          align-items: center;
          border: none;
          border-radius: 10px;
          background: var(--qt-atomic-chip);
          color: var(--qt-atomic-chip-text);
          padding: 10px 16px;
          margin: 3px 2px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          min-height: 44px;
          transition: background .12s ease, color .12s ease, transform .12s ease;
        }
        .atom-chip:hover, .atom-chip:focus-visible {
          background: var(--qt-atomic-hover);
          color: #fff;
          outline: none;
          transform: translateY(-1px);
        }
        .var-chip {
          display: inline-flex;
          align-items: center;
          border: 1.5px dashed color-mix(in srgb, var(--qt-atomic-text) 55%, transparent);
          border-radius: 10px;
          background: transparent;
          color: var(--qt-atomic-text);
          padding: 9px 15px;
          margin: 3px 2px;
          font: inherit;
          font-weight: 700;
          font-style: italic;
          cursor: pointer;
          min-height: 44px;
          transition: background .12s ease, color .12s ease, border-color .12s ease;
        }
        .var-chip[data-filled="true"] {
          border-style: solid;
          font-style: normal;
          background: var(--qt-atomic-chip);
          color: var(--qt-atomic-chip-text);
        }
        .var-chip:hover, .var-chip:focus-visible {
          border-color: var(--qt-atomic-hover);
          color: var(--qt-atomic-hover);
          outline: none;
        }
        .var-chip[data-filled="true"]:hover, .var-chip[data-filled="true"]:focus-visible {
          background: var(--qt-atomic-hover);
          color: #fff;
        }
        .var-editor {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: 3px 2px;
        }
        .var-input {
          font: inherit;
          font-weight: 700;
          border: 1.5px solid var(--qt-atomic-hover);
          border-radius: 10px;
          padding: 9px 12px;
          min-height: 44px;
          background: var(--qt-atomic-chip);
          color: var(--qt-atomic-chip-text);
          min-width: 140px;
        }
        .var-choice {
          border: none;
          border-radius: 10px;
          background: var(--qt-atomic-chip);
          color: var(--qt-atomic-chip-text);
          padding: 9px 14px;
          min-height: 44px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .var-choice:hover, .var-choice:focus-visible {
          background: var(--qt-atomic-hover);
          color: #fff;
          outline: none;
        }
        .atomic-hint {
          margin-top: 22px;
          font-size: 12px;
          opacity: .55;
        }
        .atomic-copied {
          position: absolute;
          top: 18px;
          right: 22px;
          font-size: 12px;
          font-weight: 700;
          opacity: .85;
        }
        dialog { border: 1px solid var(--qt-edge); border-radius: 8px; background: var(--qt-white); color: var(--qt-ink); width: min(680px, 92vw); }
        dialog::backdrop { background: rgba(0, 0, 0, .24); }
        .dialog-head { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 12px; }
        .preview { white-space: pre-wrap; line-height: 1.45; }
        .form { display: grid; gap: 10px; }
        .row { display: grid; gap: 4px; }
        .row span { font-size: 12px; color: var(--qt-muted); }
        .row input, .row select, .row textarea {
          width: 100%;
          border: 1px solid var(--qt-edge);
          border-radius: 8px;
          padding: 9px 10px;
          background: var(--qt-paper);
          color: var(--qt-ink);
        }
        .actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; margin-top: 8px; }
        .swatches { display: flex; flex-wrap: wrap; gap: 7px; }
        .swatch {
          width: 28px;
          height: 28px;
          padding: 0;
          border-radius: 999px;
          background: var(--swatch-color);
          border-color: color-mix(in srgb, var(--swatch-color) 72%, black);
        }
        .swatch[aria-pressed="true"] {
          outline: 2px solid var(--qt-ink);
          outline-offset: 2px;
          background: var(--swatch-color);
        }
      </style>
      <div class="wrap">
        <div class="loading">Loading Quick Text...</div>
      </div>
      <dialog id="previewDialog"></dialog>
      <dialog id="editorDialog"></dialog>
      <dialog id="settingsDialog"></dialog>
      <div id="atomicRoot"></div>
    `;
  }

  render() {
    if (!this.corpus || !this.palette) return;
    const favorites = this.corpus.phrases.some((phrase) => phrase.favorite);
    const categories = [
      { id: 'all', name: 'All' },
      ...this.corpus.categories.toSorted((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
      ...(favorites ? [{ id: 'favorites', name: 'Favorites' }] : [])
    ];
    const phrases = this.filteredPhrases;

    this.shadowRoot.querySelector('.wrap').innerHTML = `
      <div class="tabs">
        ${categories.map((category) => `
          <button type="button" data-category="${escapeAttr(category.id)}" aria-pressed="${category.id === this.activeCategory}">
            ${escapeHtml(category.name)}
          </button>
        `).join('')}
      </div>
      <div class="bar">
        <input class="search" type="search" placeholder="Search" value="${escapeAttr(this.searchTerm)}" aria-label="Search phrases">
        ${this.adminEnabled ? '<button type="button" data-action="settings">Settings</button><button type="button" data-action="new">New</button><button type="button" data-action="export">Export</button><button type="button" data-action="export-public">Public export</button>' : ''}
      </div>
      ${phrases.length ? `<div class="grid">${phrases.map((phrase, index) => this.renderTile(phrase, index)).join('')}</div>` : '<div class="empty">No phrases</div>'}
    `;
    this.bindEvents();
    this.renderAtomicOverlay();
  }

  renderTile(phrase, index) {
    const color = this.resolveColor(phrase.color || this.corpus.settings?.defaultTileColor);
    const textColor = this.resolveColor(phrase.textColor || this.corpus.settings?.defaultTextColor);
    const fontSize = Number(this.corpus.settings?.defaultFontSize || 18);
    const fontFamily = this.fontFamily();
    const isExpandable = requiresExpansion(phrase);
    return `
      <button class="tile" type="button" data-index="${index}" data-id="${escapeAttr(phrase.id)}" data-expandable="${isExpandable}" style="--tile-bg:${color};--tile-text:${textColor};--tile-font-size:${fontSize}px;--tile-font-family:${fontFamily}">
        <span class="tile-title">${escapeHtml(phrase.summary || phrase.title)}</span>
        ${this.copiedId === phrase.id ? '<span class="copied">Copied</span>' : ''}
      </button>
    `;
  }

  renderAtomicOverlay() {
    const root = this.shadowRoot.querySelector('#atomicRoot');
    if (!root) return;
    const phrase = this.expandedPhraseId ? this.corpus.phrases.find((item) => item.id === this.expandedPhraseId) : null;
    if (!phrase) {
      root.innerHTML = '';
      return;
    }
    const fontSize = Number(this.corpus.settings?.defaultFontSize || 18);
    const fontFamily = this.fontFamily();
    const variables = parseVariables(phrase.value);
    const segments = segmentsForValue(phrase.value, phrase.atoms, variables);
    root.innerHTML = `
      <div class="atomic-overlay" data-atomic-backdrop>
        <div class="atomic-card" data-atomic-card style="--tile-font-size:${fontSize}px;--tile-font-family:${fontFamily}">
          ${this.copiedId === phrase.id ? '<span class="atomic-copied">Copied</span>' : ''}
          <div class="atomic-title">${escapeHtml(phrase.title)}</div>
          <div class="atomic-body" data-atomic-body>${segments.map((segment) => this.renderSegment(phrase, segment)).join('')}</div>
          <div class="atomic-hint">Click a chip to copy it, fill in a variable, or click anywhere else to copy the full text.</div>
        </div>
      </div>
    `;
    const backdrop = root.querySelector('[data-atomic-backdrop]');
    const card = root.querySelector('[data-atomic-card]');
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) this.collapseAtomic();
    });
    card.querySelectorAll('.atom-chip').forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.stopPropagation();
        this.copyAtom(phrase, chip.dataset.atomId);
      });
      chip.addEventListener('mouseenter', () => { this.highlightedAtomId = chip.dataset.atomId; });
    });
    card.querySelectorAll('.var-chip').forEach((chip) => {
      chip.addEventListener('click', (event) => {
        event.stopPropagation();
        this.editingVariableKey = `${phrase.id}::${chip.dataset.varKey}`;
        this.renderAtomicOverlay();
      });
    });
    card.querySelectorAll('[data-var-editor]').forEach((editor) => {
      editor.addEventListener('click', (event) => event.stopPropagation());
    });
    card.querySelectorAll('.var-choice').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const key = button.closest('[data-var-editor]').dataset.varEditor;
        this.variableValues[`${phrase.id}::${key}`] = button.dataset.varChoice;
        this.editingVariableKey = null;
        this.renderAtomicOverlay();
      });
    });
    card.querySelectorAll('.var-input').forEach((input) => {
      const commit = () => {
        this.variableValues[`${phrase.id}::${input.dataset.varKey}`] = input.value;
        this.editingVariableKey = null;
        this.renderAtomicOverlay();
      };
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          commit();
        } else if (event.key === 'Escape') {
          event.stopPropagation();
          this.editingVariableKey = null;
          this.renderAtomicOverlay();
        }
      });
      input.addEventListener('blur', commit);
      input.focus();
      input.select();
    });
    card.addEventListener('click', () => this.copyFullFromCard(phrase));
  }

  renderSegment(phrase, segment) {
    if (segment.type === 'atom') {
      return `<button class="atom-chip" type="button" data-atom-id="${escapeAttr(segment.id)}">${escapeHtml(segment.text)}</button>`;
    }
    if (segment.type === 'variable') {
      const valueKey = `${phrase.id}::${segment.key}`;
      const filled = this.variableValues[valueKey];
      if (this.editingVariableKey === valueKey) {
        if (segment.choices) {
          return `<span class="var-editor" data-var-editor="${escapeAttr(segment.key)}">${segment.choices.map((choice) => `<button type="button" class="var-choice" data-var-choice="${escapeAttr(choice)}">${escapeHtml(choice)}</button>`).join('')}</span>`;
        }
        return `<span class="var-editor" data-var-editor="${escapeAttr(segment.key)}"><input type="text" class="var-input" data-var-key="${escapeAttr(segment.key)}" value="${escapeAttr(filled || '')}"></span>`;
      }
      return `<button class="var-chip" type="button" data-var-key="${escapeAttr(segment.key)}" data-filled="${filled ? 'true' : 'false'}">${escapeHtml(filled || segment.key)}</button>`;
    }
    return escapeHtml(segment.text);
  }

  bindEvents() {
    this.shadowRoot.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        this.activeCategory = button.dataset.category;
        this.focusedIndex = 0;
        this.render();
      });
    });
    this.shadowRoot.querySelector('.search')?.addEventListener('input', (event) => {
      this.searchTerm = event.target.value;
      this.focusedIndex = 0;
      this.render();
      this.shadowRoot.querySelector('.search')?.focus();
    });
    this.shadowRoot.querySelectorAll('.tile').forEach((tile) => {
      tile.addEventListener('click', () => this.activatePhrase(tile.dataset.id));
      tile.addEventListener('focus', () => { this.focusedIndex = Number(tile.dataset.index); });
    });
    this.shadowRoot.querySelector('[data-action="settings"]')?.addEventListener('click', () => this.openSettings());
    this.shadowRoot.querySelector('[data-action="new"]')?.addEventListener('click', () => this.openEditor());
    this.shadowRoot.querySelector('[data-action="export"]')?.addEventListener('click', () => downloadJson('quick-text.json', this.corpus));
    this.shadowRoot.querySelector('[data-action="export-public"]')?.addEventListener('click', () => downloadJson('quick-text.public.json', publicCorpus(this.corpus)));
    this.addEventListener('keydown', this.handleKeys);
  }

  handleKeys = (event) => {
    if ((event.key === '/' && !isTyping(event)) || (event.key.toLowerCase() === 'f' && event.metaKey)) {
      event.preventDefault();
      this.shadowRoot.querySelector('.search')?.focus();
      return;
    }
    const phrases = this.filteredPhrases;
    if (!phrases.length) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedIndex = Math.min(phrases.length - 1, this.focusedIndex + 1);
      this.focusTile();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedIndex = Math.max(0, this.focusedIndex - 1);
      this.focusTile();
    } else if (event.key === 'Enter' || (event.key.toLowerCase() === 'c' && event.metaKey)) {
      event.preventDefault();
      this.activatePhrase(phrases[this.focusedIndex].id);
    } else if (event.key === ' ') {
      event.preventDefault();
      this.openPreview(phrases[this.focusedIndex]);
    } else if (event.key.toLowerCase() === 'e' && event.metaKey && this.adminEnabled) {
      event.preventDefault();
      this.openEditor(phrases[this.focusedIndex]);
    } else if (event.key.toLowerCase() === 'n' && event.metaKey && this.adminEnabled) {
      event.preventDefault();
      this.openEditor();
    } else if (event.key === 'Escape') {
      if (this.expandedPhraseId) {
        this.collapseAtomic();
      } else {
        this.shadowRoot.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
      }
    }
  };

  focusTile() {
    this.shadowRoot.querySelector(`.tile[data-index="${this.focusedIndex}"]`)?.focus();
  }

  activatePhrase(id) {
    const phrase = this.corpus.phrases.find((item) => item.id === id);
    if (!phrase) return;
    if (requiresExpansion(phrase)) {
      this.expandedPhraseId = id;
      this.render();
      return;
    }
    this.copyPhrase(id);
  }

  async copyPhrase(id) {
    const phrase = this.corpus.phrases.find((item) => item.id === id);
    if (!phrase) return;
    await copyText(phrase.value);
    this.copiedId = id;
    this.render();
    setTimeout(() => {
      if (this.copiedId === id) {
        this.copiedId = null;
        this.render();
      }
    }, 800);
  }

  async copyAtom(phrase, atomId) {
    const atom = (phrase.atoms || []).find((item) => item.id === atomId);
    if (!atom) return;
    await copyText(phrase.value.slice(atom.start, atom.end));
    this.showAtomicCopied(phrase.id);
  }

  async copyFullFromCard(phrase) {
    const prefix = `${phrase.id}::`;
    const values = {};
    Object.keys(this.variableValues).forEach((key) => {
      if (key.startsWith(prefix)) values[key.slice(prefix.length)] = this.variableValues[key];
    });
    await copyText(substituteVariables(phrase.value, values));
    this.showAtomicCopied(phrase.id);
  }

  showAtomicCopied(id) {
    this.copiedId = id;
    this.render();
    setTimeout(() => {
      if (this.copiedId === id) this.copiedId = null;
      if (this.expandedPhraseId === id) this.expandedPhraseId = null;
      this.render();
    }, 650);
  }

  collapseAtomic() {
    if (!this.expandedPhraseId) return;
    this.expandedPhraseId = null;
    this.editingVariableKey = null;
    this.render();
  }

  openPreview(phrase) {
    const dialog = this.shadowRoot.querySelector('#previewDialog');
    dialog.innerHTML = `
      <div class="dialog-head">
        <strong>${escapeHtml(phrase.title)}</strong>
        <button type="button" data-close>Close</button>
      </div>
      <div class="preview">${escapeHtml(phrase.value)}</div>
    `;
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.showModal();
  }

  openEditor(phrase = null) {
    const item = phrase || {
      id: `phrase-${Date.now()}`,
      categoryId: this.corpus.categories[0]?.id || '',
      title: '',
      summary: '',
      value: '',
      color: this.corpus.settings?.defaultTileColor || this.palette.colors[0]?.id,
      textColor: this.corpus.settings?.defaultTextColor || this.palette.colors[0]?.id,
      favorite: false,
      visibility: 'private',
      tags: [],
      atoms: []
    };
    let atoms = (item.atoms || []).map((atom) => ({ ...atom }));
    let currentValue = item.value || '';
    const dialog = this.shadowRoot.querySelector('#editorDialog');

    const renderDialog = () => {
      dialog.innerHTML = `
        <div class="dialog-head">
          <strong>${phrase ? 'Edit Phrase' : 'New Phrase'}</strong>
          <button type="button" data-close>Close</button>
        </div>
        <form class="form">
          ${inputRow('Title', 'title', item.title, true)}
          ${inputRow('Summary', 'summary', item.summary || '')}
          <label class="row"><span>Category</span><select name="categoryId" required>${this.corpus.categories.map((category) => `<option value="${escapeAttr(category.id)}" ${category.id === item.categoryId ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select></label>
          <label class="row"><span>Value</span><textarea name="value" rows="7" required data-value-field>${escapeHtml(currentValue)}</textarea></label>
          <div class="row">
            <span>Atoms (select text in Value, then Add atom)</span>
            <div class="actions" style="justify-content:flex-start">
              <button type="button" data-add-atom>Add atom from selection</button>
            </div>
            ${atoms.length ? `<ul data-atom-list style="list-style:none;padding:0;margin:6px 0 0;display:grid;gap:6px;">
              ${atoms.map((atom) => `
                <li style="display:flex;align-items:center;gap:8px;">
                  <span style="flex:1;overflow-wrap:anywhere;">${escapeHtml(currentValue.slice(atom.start, atom.end))}
                    <span style="color:var(--qt-muted);font-size:11px;"> (${atom.start}-${atom.end})</span>
                  </span>
                  <button type="button" data-remove-atom="${escapeAttr(atom.id)}">Remove</button>
                </li>
              `).join('')}
            </ul>` : '<p style="color:var(--qt-muted);font-size:12px;margin:6px 0 0;">No atoms yet. This card copies as a single unit.</p>'}
          </div>
          <div class="row">
            <span>Variables detected in Value</span>
            ${(() => {
              const detected = parseVariables(currentValue);
              return detected.length
                ? `<div style="display:flex;flex-wrap:wrap;gap:6px;">${detected.map((variable) => `<span style="padding:4px 8px;border-radius:999px;background:var(--qt-edge);font-size:12px;">${escapeHtml(variable.choices ? variable.choices.join(' / ') : variable.key)}</span>`).join('')}</div>`
                : '<p style="color:var(--qt-muted);font-size:12px;margin:6px 0 0;">No {{variables}} detected. Use {{setting}} or {{option one/option two}}.</p>';
            })()}
          </div>
          ${this.swatchRow('Background', 'color', item.color || this.corpus.settings?.defaultTileColor)}
          ${this.swatchRow('Text', 'textColor', item.textColor || this.corpus.settings?.defaultTextColor)}
          <label class="row"><span>Tags</span><input name="tags" value="${escapeAttr((item.tags || []).join(', '))}"></label>
          <label><input name="favorite" type="checkbox" ${item.favorite ? 'checked' : ''}> Favorite</label>
          <label class="row"><span>Visibility</span><select name="visibility" required>${VISIBILITIES.map((visibility) => `<option value="${visibility}" ${visibility === item.visibility ? 'selected' : ''}>${visibility}</option>`).join('')}</select></label>
          <div class="actions">
            ${phrase ? '<button type="button" data-delete>Delete</button><button type="button" data-duplicate>Duplicate</button>' : ''}
            <button type="submit">Save</button>
          </div>
        </form>
      `;
      dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
      this.bindDialogCloseOnBackdrop(dialog);
      this.bindSwatches(dialog);

      const valueField = dialog.querySelector('[data-value-field]');
      valueField.addEventListener('input', () => {
        currentValue = valueField.value;
        dialog.dataset.dirty = 'true';
      });

      dialog.querySelector('[data-add-atom]').addEventListener('click', () => {
        const start = valueField.selectionStart;
        const end = valueField.selectionEnd;
        if (start === end) return;
        atoms = atoms.filter((atom) => end <= atom.start || start >= atom.end);
        atoms.push({ id: `atom-${Date.now()}`, start, end });
        atoms.sort((a, b) => a.start - b.start);
        dialog.dataset.dirty = 'true';
        renderDialog();
      });

      dialog.querySelectorAll('[data-remove-atom]').forEach((button) => {
        button.addEventListener('click', () => {
          atoms = atoms.filter((atom) => atom.id !== button.dataset.removeAtom);
          dialog.dataset.dirty = 'true';
          renderDialog();
        });
      });

      dialog.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const value = String(form.get('value'));
        const validAtoms = atoms.filter((atom) => atom.end <= value.length);
        const next = {
          ...item,
          title: String(form.get('title')).trim(),
          summary: String(form.get('summary')).trim() || String(form.get('title')).trim(),
          categoryId: String(form.get('categoryId')),
          value,
          color: String(form.get('color')),
          textColor: String(form.get('textColor')),
          tags: String(form.get('tags')).split(',').map((tag) => tag.trim()).filter(Boolean),
          favorite: form.get('favorite') === 'on',
          visibility: String(form.get('visibility')),
          updatedAt: new Date().toISOString()
        };
        if (validAtoms.length) next.atoms = validAtoms;
        else delete next.atoms;
        const index = this.corpus.phrases.findIndex((candidate) => candidate.id === next.id);
        if (index >= 0) this.corpus.phrases[index] = next;
        else this.corpus.phrases.push({ ...next, createdAt: new Date().toISOString() });
        this.corpus.updatedAt = new Date().toISOString();
        dialog.close();
        this.render();
      });
      dialog.querySelector('[data-delete]')?.addEventListener('click', () => {
        this.corpus.phrases = this.corpus.phrases.filter((candidate) => candidate.id !== item.id);
        dialog.close();
        this.render();
      });
      dialog.querySelector('[data-duplicate]')?.addEventListener('click', () => {
        const clone = { ...item, atoms: atoms.length ? atoms.map((atom) => ({ ...atom })) : undefined, id: `${item.id}-copy-${Date.now()}`, title: `${item.title} Copy`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        this.corpus.phrases.push(clone);
        dialog.close();
        this.render();
      });
    };

    renderDialog();
    dialog.showModal();
  }

  openSettings() {
    const settings = this.corpus.settings || {};
    const dialog = this.shadowRoot.querySelector('#settingsDialog');
    dialog.innerHTML = `
      <div class="dialog-head">
        <strong>Settings</strong>
        <button type="button" data-close>Close</button>
      </div>
      <form class="form">
        <label class="row"><span>Text size</span><input name="defaultFontSize" type="number" min="14" max="44" value="${Number(settings.defaultFontSize || 18)}"></label>
        ${this.swatchRow('Default background', 'defaultTileColor', settings.defaultTileColor || 'brown-13')}
        ${this.swatchRow('Default text', 'defaultTextColor', settings.defaultTextColor || 'brown-22')}
        <label class="row"><span>Font</span><select name="defaultFontFamily">${FONT_FAMILIES.map((family) => `<option value="${family}" ${family === (settings.defaultFontFamily || 'sans') ? 'selected' : ''}>${family}</option>`).join('')}</select></label>
        <div class="actions">
          <button type="submit">Save</button>
        </div>
      </form>
    `;
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    this.bindDialogCloseOnBackdrop(dialog);
    this.bindSwatches(dialog);
    dialog.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      this.corpus.settings = {
        ...settings,
        defaultFontSize: Number(form.get('defaultFontSize')) || 18,
        defaultTileColor: String(form.get('defaultTileColor')),
        defaultTextColor: String(form.get('defaultTextColor')),
        defaultFontFamily: String(form.get('defaultFontFamily'))
      };
      this.corpus.updatedAt = new Date().toISOString();
      dialog.close();
      this.render();
    });
    dialog.showModal();
  }

  resolveColor(id) {
    return this.palette?.colors?.find((color) => color.id === id)?.hex || '#D2BEB1';
  }

  fontFamily() {
    return this.corpus.settings?.defaultFontFamily === 'serif'
      ? 'Palatino, "Palatino Linotype", Georgia, serif'
      : 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  }

  swatchRow(label, name, selectedId) {
    return `
      <label class="row">
        <span>${escapeHtml(label)}</span>
        <input type="hidden" name="${escapeAttr(name)}" value="${escapeAttr(selectedId || '')}">
        <div class="swatches" data-swatch-group="${escapeAttr(name)}">
          ${(this.palette.colors || []).map((color) => `
            <button class="swatch" type="button" data-swatch-value="${escapeAttr(color.id)}" aria-label="${escapeAttr(color.name)}" aria-pressed="${color.id === selectedId}" style="--swatch-color:${escapeAttr(color.hex)}"></button>
          `).join('')}
        </div>
      </label>
    `;
  }

  bindSwatches(root) {
    root.querySelectorAll('[data-swatch-group]').forEach((group) => {
      const input = root.querySelector(`input[name="${group.dataset.swatchGroup}"]`);
      group.querySelectorAll('[data-swatch-value]').forEach((button) => {
        button.addEventListener('click', () => {
          input.value = button.dataset.swatchValue;
          group.querySelectorAll('[data-swatch-value]').forEach((candidate) => {
            candidate.setAttribute('aria-pressed', String(candidate === button));
          });
          root.dataset.dirty = 'true';
        });
      });
    });
    root.querySelectorAll('input, textarea, select').forEach((field) => {
      field.addEventListener('input', () => { root.dataset.dirty = 'true'; });
      field.addEventListener('change', () => { root.dataset.dirty = 'true'; });
    });
  }

  bindDialogCloseOnBackdrop(dialog) {
    dialog.dataset.dirty = 'false';
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog && dialog.dataset.dirty !== 'true') dialog.close();
    }, { once: true });
  }
}

function publicCorpus(corpus) {
  const phrases = (corpus.phrases || []).filter((phrase) => phrase.visibility === 'public');
  const categoryIds = new Set(phrases.map((phrase) => phrase.categoryId));
  return {
    ...corpus,
    categories: (corpus.categories || []).filter((category) => categoryIds.has(category.id)),
    phrases
  };
}

function hasAtoms(phrase) {
  return Array.isArray(phrase.atoms) && phrase.atoms.length > 0;
}

const VARIABLE_PATTERN = /\{\{([^{}]+)\}\}/g;

function parseVariables(value) {
  const text = value || '';
  const pattern = new RegExp(VARIABLE_PATTERN);
  const results = [];
  let match;
  while ((match = pattern.exec(text))) {
    const key = match[1].trim();
    if (!key) continue;
    const start = match.index;
    const end = start + match[0].length;
    const choices = key.includes('/') ? key.split('/').map((part) => part.trim()).filter(Boolean) : null;
    results.push({ key, choices, start, end });
  }
  return results;
}

function hasVariables(phrase) {
  return parseVariables(phrase.value).length > 0;
}

function requiresExpansion(phrase) {
  return hasAtoms(phrase) || hasVariables(phrase);
}

function substituteVariables(value, values) {
  return (value || '').replace(new RegExp(VARIABLE_PATTERN), (match, inner) => {
    const key = inner.trim();
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : match;
  });
}

function segmentsForValue(value, atoms, variables) {
  const text = value || '';
  const ranges = [
    ...(atoms || [])
      .filter((atom) => typeof atom.start === 'number' && typeof atom.end === 'number' && atom.end > atom.start && atom.end <= text.length)
      .map((atom) => ({ start: atom.start, end: atom.end, kind: 'atom', atom })),
    ...(variables || []).map((variable) => ({ start: variable.start, end: variable.end, kind: 'variable', variable }))
  ].sort((a, b) => a.start - b.start);
  const segments = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) segments.push({ type: 'text', text: text.slice(cursor, range.start) });
    if (range.kind === 'atom') {
      segments.push({ type: 'atom', id: range.atom.id, text: text.slice(range.start, range.end) });
    } else {
      segments.push({ type: 'variable', key: range.variable.key, choices: range.variable.choices, text: text.slice(range.start, range.end) });
    }
    cursor = range.end;
  }
  if (cursor < text.length) segments.push({ type: 'text', text: text.slice(cursor) });
  return segments;
}

function inputRow(label, name, value, required = false) {
  return `<label class="row"><span>${label}</span><input name="${name}" value="${escapeAttr(value || '')}" ${required ? 'required' : ''}></label>`;
}

function isTyping(event) {
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.composedPath()[0]?.tagName);
}

function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the local textarea copy path.
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.inset = '0 auto auto -9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    if (!document.execCommand('copy')) throw new Error('copy failed');
  } finally {
    document.body.removeChild(textArea);
  }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

customElements.define('quick-text-launcher', QuickTextLauncher);
