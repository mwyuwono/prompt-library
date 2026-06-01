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
