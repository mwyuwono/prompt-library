const PAYLOAD_URL = 'private-prompts.enc.json';
const PBKDF2_ITERATIONS = 250000;

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const gate = document.getElementById('vaultGate');
const appRoot = document.getElementById('vaultApp');
const form = document.getElementById('vaultUnlockForm');
const passcodeInput = document.getElementById('vaultPasscode');
const message = document.getElementById('vaultMessage');
const unlockButton = document.getElementById('vaultUnlockButton');

form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const passcode = passcodeInput.value;
    if (!passcode) {
        setMessage('Enter a passcode to continue.', 'error');
        return;
    }

    setBusy(true);
    setMessage('Unlocking private prompts...', '');

    try {
        const payload = await fetchEncryptedPayload();
        const prompts = await decryptPrompts(passcode, payload);

        gate.hidden = true;
        appRoot.hidden = false;
        passcodeInput.value = '';
        setMessage('', '');

        new window.PromptLibrary({
            prompts,
            filterArchived: true,
            startFeaturedOnly: false
        });
        hideFeaturedFilter();
    } catch (error) {
        console.error('Private vault unlock failed:', error);
        setMessage('Unable to unlock private prompts. Check the passcode and try again.', 'error');
        passcodeInput.select();
    } finally {
        setBusy(false);
    }
});

async function fetchEncryptedPayload() {
    const response = await fetch(PAYLOAD_URL, { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Failed to load encrypted payload (${response.status})`);
    }

    const payload = await response.json();
    if (!payload || payload.version !== 1 || !payload.salt || !payload.iv || !payload.ciphertext) {
        throw new Error('Encrypted payload format is invalid');
    }

    return payload;
}

async function decryptPrompts(passcode, payload) {
    const key = await deriveKey(passcode, payload.salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: base64ToUint8Array(payload.iv) },
        key,
        base64ToUint8Array(payload.ciphertext)
    );

    const prompts = JSON.parse(textDecoder.decode(decryptedBuffer));
    if (!Array.isArray(prompts)) {
        throw new Error('Decrypted payload is not an array');
    }

    return prompts;
}

async function deriveKey(passcode, saltBase64) {
    const baseKey = await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(passcode),
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: base64ToUint8Array(saltBase64),
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
}

function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let index = 0; index < binaryString.length; index += 1) {
        bytes[index] = binaryString.charCodeAt(index);
    }
    return bytes;
}

function setBusy(isBusy) {
    unlockButton.disabled = isBusy;
    unlockButton.textContent = isBusy ? 'Unlocking...' : 'Continue';
    passcodeInput.disabled = isBusy;
}

function setMessage(text, tone) {
    message.textContent = text;
    message.dataset.tone = tone || '';
}

function hideFeaturedFilter() {
    const controlsBar = document.getElementById('controlsBar');
    if (!controlsBar) {
        return;
    }

    const apply = () => {
        const featuredChip = controlsBar.shadowRoot?.querySelector('wy-filter-chip[label="Featured"]');
        if (featuredChip) {
            featuredChip.style.display = 'none';
        }
    };

    const attachObserver = () => {
        if (!controlsBar.shadowRoot || controlsBar.__privateVaultFeaturedObserver) {
            return;
        }

        const observer = new MutationObserver(() => apply());
        observer.observe(controlsBar.shadowRoot, { childList: true, subtree: true });
        controlsBar.__privateVaultFeaturedObserver = observer;
        apply();
    };

    customElements.whenDefined('wy-controls-bar').then(() => {
        apply();
        attachObserver();
        requestAnimationFrame(apply);
    });
}
