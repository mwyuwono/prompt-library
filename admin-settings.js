// ── Palette management ────────────────────────────────────────────────────────

const paletteList       = document.getElementById('paletteList');
const palettesSaveBtn   = document.getElementById('palettesSaveButton');
const palettesDiscardBtn = document.getElementById('palettesDiscardButton');
const palettesStatusEl  = document.getElementById('palettesStatus');
const addPaletteBtn     = document.getElementById('addPaletteButton');

let savedPalettes = [];   // last-saved state (for discard)
let workingPalettes = []; // live editable copy
let isSavingPalettes = false;

function palettesSetStatus(msg, type = '') {
    palettesStatusEl.textContent = msg;
    palettesStatusEl.className = `settings-status${type ? ` ${type}` : ''}`;
}

function palettesMarkDirty() {
    const dirty = JSON.stringify(workingPalettes) !== JSON.stringify(savedPalettes);
    palettesSaveBtn.disabled    = isSavingPalettes || !dirty;
    palettesDiscardBtn.disabled = isSavingPalettes || !dirty;
    if (dirty) palettesSetStatus('Unsaved changes.');
    else if (!isSavingPalettes && !palettesStatusEl.classList.contains('success')) palettesSetStatus('Palettes loaded.');
}

function newColor()   { return { name: '', hex: '#000000' }; }
function newPalette() {
    return {
        paletteId: `p${Date.now()}`,
        paletteName: 'New Palette',
        colors: [newColor()]
    };
}

function renderPaletteList() {
    paletteList.innerHTML = '';
    workingPalettes.forEach((palette, pi) => {
        const item = document.createElement('div');
        item.className = 'palette-item';
        item.dataset.index = pi;

        // Build preview chips HTML
        const chipsHtml = palette.colors.map(c =>
            `<span class="palette-chip-preview" style="--palette-chip-color: ${safeHex(c.hex)}"></span>`
        ).join('');

        // Build color rows HTML
        const colorRowsHtml = palette.colors.map((c, ci) => `
            <div class="color-row" data-color="${ci}">
                <input type="color" class="color-swatch-input" value="${c.hex || '#000000'}" data-ci="${ci}" title="Pick color">
                <input type="text" class="color-hex-input" value="${c.hex || ''}" placeholder="#000000" data-ci="${ci}" maxlength="7">
                <input type="text" class="color-name-input" value="${c.name || ''}" placeholder="Color name" data-ci="${ci}">
                <button class="color-delete-btn" data-ci="${ci}" title="Remove color" aria-label="Remove color">
                    <span class="material-symbols-outlined">remove</span>
                </button>
            </div>
        `).join('');

        item.innerHTML = `
            <div class="palette-item-header">
                <input type="text" class="palette-name-input" value="${escAttr(palette.paletteName)}" placeholder="Palette name" data-pi="${pi}">
                <div class="palette-chips-preview">${chipsHtml}</div>
                <span class="material-symbols-outlined palette-expand-icon">expand_more</span>
            </div>
            <div class="palette-item-body">
                <div class="color-rows">${colorRowsHtml}</div>
                <div class="palette-item-footer">
                    <button class="add-color-btn" data-pi="${pi}">
                        <span class="material-symbols-outlined add-color-icon">add</span>
                        Add Color
                    </button>
                    <button class="palette-delete-btn" data-pi="${pi}" title="Delete palette" aria-label="Delete palette">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
        `;

        // Toggle expand
        item.querySelector('.palette-item-header').addEventListener('click', (e) => {
            if (e.target.classList.contains('palette-name-input')) return; // don't collapse when editing name
            item.classList.toggle('expanded');
        });

        // Palette name edit
        item.querySelector('.palette-name-input').addEventListener('input', (e) => {
            workingPalettes[pi].paletteName = e.target.value;
            palettesMarkDirty();
        });

        // Color fields
        item.querySelectorAll('.color-swatch-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const ci = +e.target.dataset.ci;
                workingPalettes[pi].colors[ci].hex = e.target.value;
                // sync hex text input
                const hexInput = item.querySelector(`.color-hex-input[data-ci="${ci}"]`);
                if (hexInput) hexInput.value = e.target.value;
                renderChipsPreview(item, pi);
                palettesMarkDirty();
            });
        });

        item.querySelectorAll('.color-hex-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const ci = +e.target.dataset.ci;
                let hex = e.target.value.trim();
                if (!hex.startsWith('#') && hex.length > 0) hex = '#' + hex;
                workingPalettes[pi].colors[ci].hex = hex;
                // sync swatch if valid hex
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                    const sw = item.querySelector(`.color-swatch-input[data-ci="${ci}"]`);
                    if (sw) sw.value = hex;
                    renderChipsPreview(item, pi);
                }
                palettesMarkDirty();
            });
        });

        item.querySelectorAll('.color-name-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const ci = +e.target.dataset.ci;
                workingPalettes[pi].colors[ci].name = e.target.value;
                palettesMarkDirty();
            });
        });

        // Delete color
        item.querySelectorAll('.color-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ci = +e.currentTarget.dataset.ci;
                if (workingPalettes[pi].colors.length <= 1) return; // keep at least one
                workingPalettes[pi].colors.splice(ci, 1);
                renderPaletteList();
                palettesMarkDirty();
            });
        });

        // Add color
        item.querySelector('.add-color-btn').addEventListener('click', () => {
            workingPalettes[pi].colors.push(newColor());
            renderPaletteList();
            // Re-expand
            paletteList.children[pi]?.classList.add('expanded');
            palettesMarkDirty();
        });

        // Delete palette
        item.querySelector('.palette-delete-btn').addEventListener('click', () => {
            if (!confirm(`Delete palette "${palette.paletteName}"?`)) return;
            workingPalettes.splice(pi, 1);
            renderPaletteList();
            palettesMarkDirty();
        });

        paletteList.appendChild(item);
    });
}

function renderChipsPreview(item, pi) {
    const preview = item.querySelector('.palette-chips-preview');
    if (!preview) return;
    preview.innerHTML = workingPalettes[pi].colors.map(c =>
        `<span class="palette-chip-preview" style="--palette-chip-color: ${safeHex(c.hex)}"></span>`
    ).join('');
}

function escAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function safeHex(value) {
    const text = String(value || '').trim();
    return /^#[0-9a-fA-F]{6}$/.test(text) ? text : 'var(--paper-edge)';
}

async function loadPalettes() {
    try {
        const res = await fetch('/api/palettes');
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load palettes.');
        savedPalettes    = data.palettes || [];
        workingPalettes  = JSON.parse(JSON.stringify(savedPalettes));
        renderPaletteList();
        palettesSetStatus('Palettes loaded.');
        palettesSaveBtn.disabled    = true;
        palettesDiscardBtn.disabled = true;
    } catch (err) {
        palettesSetStatus(err.message || 'Failed to load palettes.', 'error');
        palettesSaveBtn.disabled    = true;
        palettesDiscardBtn.disabled = true;
    }
}

async function savePalettes() {
    isSavingPalettes = true;
    palettesSetStatus('Saving…');
    palettesMarkDirty();
    try {
        const res = await fetch('/api/palettes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ palettes: workingPalettes })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save palettes.');
        savedPalettes = JSON.parse(JSON.stringify(workingPalettes));
        palettesSetStatus('Palettes saved.', 'success');
    } catch (err) {
        palettesSetStatus(err.message || 'Failed to save palettes.', 'error');
    } finally {
        isSavingPalettes = false;
        palettesMarkDirty();
    }
}

addPaletteBtn.addEventListener('click', () => {
    workingPalettes.push(newPalette());
    renderPaletteList();
    // Auto-expand the new palette
    const last = paletteList.lastElementChild;
    if (last) last.classList.add('expanded');
    palettesMarkDirty();
});

palettesSaveBtn.addEventListener('click', savePalettes);
palettesDiscardBtn.addEventListener('click', () => {
    workingPalettes = JSON.parse(JSON.stringify(savedPalettes));
    renderPaletteList();
    palettesMarkDirty();
});

loadPalettes();

// ── Hero image master prompt ──────────────────────────────────────────────────

const masterPromptInput = document.getElementById('heroMasterPrompt');
const saveButton = document.getElementById('saveButton');
const discardButton = document.getElementById('discardButton');
const statusEl = document.getElementById('settingsStatus');

let savedMasterPrompt = '';
let isSaving = false;

function setStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = `settings-status${type ? ` ${type}` : ''}`;
}

function getValidationError(value) {
    const normalized = value.trim();
    if (!normalized) return 'Master prompt is required.';
    if (!normalized.includes('{{subject_prompt}}')) return 'Master prompt must include {{subject_prompt}}.';
    return '';
}

function updateActions() {
    const isDirty = masterPromptInput.value !== savedMasterPrompt;
    const hasValidationError = Boolean(getValidationError(masterPromptInput.value));
    saveButton.disabled = isSaving || !isDirty || hasValidationError;
    discardButton.disabled = isSaving || !isDirty;

    if (isDirty && hasValidationError) {
        setStatus(getValidationError(masterPromptInput.value), 'error');
    } else if (isDirty) {
        setStatus('Unsaved changes.');
    } else if (!isSaving && !statusEl.classList.contains('success')) {
        setStatus('Settings loaded.');
    }
}

async function loadSettings() {
    try {
        const response = await fetch('/api/admin-settings');
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to load admin settings.');
        }

        savedMasterPrompt = data.settings?.heroImage?.masterPrompt || '';
        masterPromptInput.value = savedMasterPrompt;
        updateActions();
    } catch (error) {
        setStatus(error.message || 'Failed to load admin settings.', 'error');
        saveButton.disabled = true;
        discardButton.disabled = true;
    }
}

async function saveSettings() {
    const validationError = getValidationError(masterPromptInput.value);
    if (validationError) {
        setStatus(validationError, 'error');
        updateActions();
        return;
    }

    isSaving = true;
    setStatus('Saving settings...');
    updateActions();

    try {
        const response = await fetch('/api/admin-settings/hero-image', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ masterPrompt: masterPromptInput.value })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Failed to save admin settings.');
        }

        savedMasterPrompt = data.settings?.heroImage?.masterPrompt || masterPromptInput.value.trim();
        masterPromptInput.value = savedMasterPrompt;
        setStatus('Settings saved.', 'success');
    } catch (error) {
        setStatus(error.message || 'Failed to save admin settings.', 'error');
    } finally {
        isSaving = false;
        updateActions();
    }
}

masterPromptInput.addEventListener('input', updateActions);
saveButton.addEventListener('click', saveSettings);
discardButton.addEventListener('click', () => {
    masterPromptInput.value = savedMasterPrompt;
    updateActions();
});

loadSettings();
