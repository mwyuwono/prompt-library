let assets = [];
let searchTerm = '';
let busy = false;
let uploadMode = 'api';

const S3_BUCKET = 'prompt-library-assets-009019643313';
const S3_PREFIX = 'reference-images/';
const S3_PUBLIC_BASE_URL = `https://${S3_BUCKET}.s3.amazonaws.com/${S3_PREFIX.replace(/\/$/, '')}`;
const S3_LIST_URL = `https://${S3_BUCKET}.s3.amazonaws.com/?list-type=2&prefix=${encodeURIComponent(S3_PREFIX)}`;

const grid = document.getElementById('assetGrid');
const statusText = document.getElementById('statusText');
const searchInput = document.getElementById('searchInput');
const uploadButton = document.getElementById('uploadButton');
const uploadInput = document.getElementById('uploadInput');
const refreshButton = document.getElementById('refreshButton');
const toast = document.getElementById('toast');

function showToast(message, variant = 'info') {
    if (toast?.show) {
        toast.show(message, { variant });
        return;
    }
    console.log(message);
}

function formatBytes(bytes = 0) {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let index = 0;
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(value));
}

function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function getFilteredAssets() {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter(asset => (
        asset.filename?.toLowerCase().includes(normalized) ||
        asset.key?.toLowerCase().includes(normalized) ||
        asset.url?.toLowerCase().includes(normalized)
    ));
}

function getMimeTypeFromKey(key = '') {
    const normalized = key.toLowerCase();
    if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg';
    if (normalized.endsWith('.png')) return 'image/png';
    if (normalized.endsWith('.webp')) return 'image/webp';
    if (normalized.endsWith('.gif')) return 'image/gif';
    if (normalized.endsWith('.svg')) return 'image/svg+xml';
    return 'application/octet-stream';
}

function getUrlFromS3Key(key = '') {
    const relativeKey = key.replace(new RegExp(`^${S3_PREFIX}`), '');
    return `${S3_PUBLIC_BASE_URL}/${relativeKey.split('/').map(encodeURIComponent).join('/')}`;
}

async function copyUrl(url) {
    try {
        await navigator.clipboard.writeText(url);
        showToast('Reference URL copied', 'success');
    } catch (error) {
        console.error('Copy failed:', error);
        showToast('Copy failed', 'error');
    }
}

function renderAssets() {
    const filtered = getFilteredAssets();
    statusText.textContent = busy
        ? 'Loading reference images...'
        : `${filtered.length} image${filtered.length === 1 ? '' : 's'} shown`;

    if (!filtered.length) {
        grid.innerHTML = `
            <div class="reference-empty-state">
                <span class="material-symbols-outlined" aria-hidden="true">image_search</span>
                <p>No reference images found</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map((asset, index) => `
        <article class="reference-asset-card">
            <button class="reference-image-button" type="button" data-copy-index="${index}" aria-label="Copy URL for ${escapeHtml(asset.filename)}">
                <img src="${escapeHtml(asset.url)}" alt="${escapeHtml(asset.filename)}" loading="lazy">
            </button>
            <div class="reference-asset-meta">
                <div class="reference-asset-name" title="${escapeHtml(asset.filename)}">${escapeHtml(asset.filename)}</div>
                <div class="reference-asset-detail">${formatBytes(asset.size)}${asset.lastModified ? ` · ${formatDate(asset.lastModified)}` : ''}</div>
            </div>
            <div class="reference-asset-actions">
                <button class="reference-library-button compact" type="button" data-copy-index="${index}">
                    <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                    Copy URL
                </button>
                <a class="reference-library-button compact secondary" href="${escapeHtml(asset.url)}" target="_blank" rel="noopener">
                    <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                    Open
                </a>
            </div>
        </article>
    `).join('');

    const filteredAssets = filtered;
    grid.querySelectorAll('[data-copy-index]').forEach(button => {
        button.addEventListener('click', () => {
            const asset = filteredAssets[Number(button.dataset.copyIndex)];
            if (asset?.url) copyUrl(asset.url);
        });
    });
}

async function loadAssets() {
    busy = true;
    renderAssets();
    try {
        const data = await loadAssetsFromApi().catch(async error => {
            console.warn('Reference asset API unavailable, using S3 listing:', error);
            return await loadAssetsFromS3();
        });
        assets = data.assets.filter(asset => asset.type === 'image');
        uploadMode = data.source === 'api' ? 'api' : 'console';
        renderAssets();
    } catch (error) {
        console.error('Reference asset load failed:', error);
        statusText.textContent = error.message || 'Failed to load reference images';
        grid.innerHTML = '';
        showToast('Failed to load reference images', 'error');
    } finally {
        busy = false;
        renderAssets();
    }
}

async function loadAssetsFromApi() {
    const response = await fetch('/api/reference-assets');
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load reference assets');
    }
    return {
        source: 'api',
        assets: data.assets || []
    };
}

async function loadAssetsFromS3() {
    const response = await fetch(S3_LIST_URL);
    if (!response.ok) {
        throw new Error(`S3 listing failed with HTTP ${response.status}`);
    }

    const xmlText = await response.text();
    const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
    const parseError = xml.querySelector('parsererror');
    if (parseError) {
        throw new Error('S3 listing response could not be parsed');
    }

    const assets = Array.from(xml.querySelectorAll('Contents'))
        .map(item => {
            const key = item.querySelector('Key')?.textContent || '';
            const filename = key.split('/').pop() || key;
            const contentType = getMimeTypeFromKey(key);
            return {
                key,
                filename,
                url: getUrlFromS3Key(key),
                size: Number(item.querySelector('Size')?.textContent || 0),
                lastModified: item.querySelector('LastModified')?.textContent || null,
                contentType,
                type: contentType.startsWith('image/') ? 'image' : 'file'
            };
        })
        .filter(asset => asset.key && !asset.key.endsWith('/'))
        .sort((a, b) => String(b.lastModified || '').localeCompare(String(a.lastModified || '')));

    return {
        source: 's3',
        assets
    };
}

async function uploadAsset(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/reference-assets/upload', {
        method: 'POST',
        body: formData
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
    }
    return data.asset;
}

uploadButton.addEventListener('click', event => {
    if (uploadMode === 'api') {
        event.preventDefault();
        uploadInput.click();
        return;
    }
});

uploadInput.addEventListener('change', async () => {
    const file = uploadInput.files?.[0];
    if (!file) return;

    try {
        statusText.textContent = 'Uploading reference image...';
        const asset = await uploadAsset(file);
        showToast('Reference image uploaded', 'success');
        if (asset?.url) await copyUrl(asset.url);
        await loadAssets();
    } catch (error) {
        console.error('Reference upload failed:', error);
        showToast(error.message || 'Upload failed', 'error');
    } finally {
        uploadInput.value = '';
    }
});

searchInput.addEventListener('input', event => {
    searchTerm = event.target.value;
    renderAssets();
});

refreshButton.addEventListener('click', loadAssets);

loadAssets();
