let assets = [];
let folders = [];
let currentPath = decodeURIComponent(location.hash.replace(/^#/, ''));
let searchTerm = '';
let busy = false;
let uploadMode = 'api';

const S3_BUCKET = 'prompt-library-assets-009019643313';
const S3_PREFIX = 'reference-images/';
const S3_PUBLIC_BASE_URL = `https://${S3_BUCKET}.s3.amazonaws.com/${S3_PREFIX.replace(/\/$/, '')}`;

const grid = document.getElementById('assetGrid');
const folderGrid = document.getElementById('folderGrid');
const breadcrumb = document.getElementById('breadcrumb');
const statusText = document.getElementById('statusText');
const searchInput = document.getElementById('searchInput');
const uploadButton = document.getElementById('uploadButton');
const uploadInput = document.getElementById('uploadInput');
const refreshButton = document.getElementById('refreshButton');
const newFolderButton = document.getElementById('newFolderButton');
const toast = document.getElementById('toast');

const FILE_ICONS = {
    image: 'image',
    audio: 'audio_file',
    video: 'movie',
    pdf: 'picture_as_pdf',
    document: 'description',
    archive: 'folder_zip',
    text: 'article'
};

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

function getFilteredFolders() {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return folders;
    return folders.filter(folder => folder.name?.toLowerCase().includes(normalized));
}

function getAssetKind(asset) {
    const contentType = asset.contentType || '';
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType === 'application/pdf') return 'pdf';
    if (contentType.startsWith('text/')) return 'text';
    if (contentType.includes('zip')) return 'archive';
    if (contentType.includes('word') || contentType.includes('sheet') || contentType.includes('presentation')) return 'document';
    return 'document';
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

function getPathSegments(pathValue = '') {
    return pathValue.split('/').map(segment => segment.trim()).filter(Boolean);
}

function navigateTo(pathValue) {
    currentPath = getPathSegments(pathValue).join('/');
    location.hash = currentPath ? encodeURIComponent(currentPath) : '';
    searchTerm = '';
    searchInput.value = '';
    loadAssets();
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

function renderBreadcrumb() {
    const segments = getPathSegments(currentPath);
    const crumbs = [{ label: 'Home', path: '' }];
    segments.forEach((segment, index) => {
        crumbs.push({ label: segment, path: segments.slice(0, index + 1).join('/') });
    });

    breadcrumb.innerHTML = crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const label = escapeHtml(crumb.label);
        if (isLast) {
            return `<span class="reference-breadcrumb-current">${label}</span>`;
        }
        return `<button type="button" class="reference-breadcrumb-link" data-path="${escapeHtml(crumb.path)}">${label}</button>`;
    }).join('<span class="reference-breadcrumb-sep material-symbols-outlined" aria-hidden="true">chevron_right</span>');

    breadcrumb.querySelectorAll('[data-path]').forEach(button => {
        button.addEventListener('click', () => navigateTo(button.dataset.path));
    });
}

function renderFolders() {
    const filtered = getFilteredFolders();
    if (!filtered.length) {
        folderGrid.innerHTML = '';
        folderGrid.hidden = true;
        return;
    }

    folderGrid.hidden = false;
    folderGrid.innerHTML = filtered.map(folder => `
        <button type="button" class="reference-folder-card" data-folder-path="${escapeHtml(folder.path)}">
            <span class="material-symbols-outlined" aria-hidden="true">folder</span>
            <span class="reference-folder-name" title="${escapeHtml(folder.name)}">${escapeHtml(folder.name)}</span>
        </button>
    `).join('');

    folderGrid.querySelectorAll('[data-folder-path]').forEach(button => {
        button.addEventListener('click', () => navigateTo(button.dataset.folderPath));
    });
}

function renderAssets() {
    const filteredFolders = getFilteredFolders();
    const filteredAssets = getFilteredAssets();
    const totalCount = filteredFolders.length + filteredAssets.length;

    statusText.textContent = busy
        ? 'Loading reference files...'
        : `${totalCount} item${totalCount === 1 ? '' : 's'} shown`;

    renderFolders();

    if (!filteredAssets.length) {
        grid.innerHTML = filteredFolders.length ? '' : `
            <div class="reference-empty-state">
                <span class="material-symbols-outlined" aria-hidden="true">search_off</span>
                <p>No reference files found</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredAssets.map((asset, index) => {
        const kind = getAssetKind(asset);
        const thumb = kind === 'image'
            ? `<img src="${escapeHtml(asset.url)}" alt="" loading="lazy">`
            : `<span class="material-symbols-outlined reference-asset-file-icon" aria-hidden="true">${FILE_ICONS[kind] || 'draft'}</span>`;

        return `
        <article class="reference-asset-card">
            <div class="reference-asset-thumb">
                ${thumb}
                <div class="reference-asset-overlay">
                    <button class="reference-icon-button" type="button" data-copy-index="${index}" aria-label="Copy URL for ${escapeHtml(asset.filename)}" title="Copy URL">
                        <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
                    </button>
                    <a class="reference-icon-button" href="${escapeHtml(asset.url)}" target="_blank" rel="noopener" aria-label="Open ${escapeHtml(asset.filename)}" title="Open in new tab">
                        <span class="material-symbols-outlined" aria-hidden="true">open_in_new</span>
                    </a>
                </div>
            </div>
            <div class="reference-asset-meta">
                <div class="reference-asset-name" title="${escapeHtml(asset.filename)}">${escapeHtml(asset.filename)}</div>
                <div class="reference-asset-detail">${formatBytes(asset.size)}${asset.lastModified ? ` · ${formatDate(asset.lastModified)}` : ''}</div>
            </div>
        </article>
    `;
    }).join('');

    grid.querySelectorAll('[data-copy-index]').forEach(button => {
        button.addEventListener('click', () => {
            const asset = filteredAssets[Number(button.dataset.copyIndex)];
            if (asset?.url) copyUrl(asset.url);
        });
    });
}

async function loadAssets() {
    busy = true;
    renderBreadcrumb();
    renderAssets();
    try {
        const data = await loadAssetsFromApi(currentPath).catch(async error => {
            console.warn('Reference asset API unavailable, using S3 listing:', error);
            return await loadAssetsFromS3();
        });
        assets = data.assets || [];
        folders = data.folders || [];
        uploadMode = data.source === 'api' ? 'api' : 'console';
        renderAssets();
    } catch (error) {
        console.error('Reference asset load failed:', error);
        statusText.textContent = error.message || 'Failed to load reference files';
        folderGrid.innerHTML = '';
        grid.innerHTML = '';
        showToast('Failed to load reference files', 'error');
    } finally {
        busy = false;
        renderAssets();
    }
}

async function loadAssetsFromApi(pathValue = '') {
    const query = pathValue ? `?path=${encodeURIComponent(pathValue)}` : '';
    const response = await fetch(`/api/reference-assets${query}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load reference files');
    }
    return {
        source: 'api',
        assets: data.assets || [],
        folders: data.folders || []
    };
}

async function loadAssetsFromS3() {
    const listUrl = `https://${S3_BUCKET}.s3.amazonaws.com/?list-type=2&prefix=${encodeURIComponent(S3_PREFIX)}`;
    const response = await fetch(listUrl);
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
        .filter(asset => asset.key && !asset.key.endsWith('/'));

    // Fallback mode has no folder support: only surface root-level files.
    const rootAssets = assets
        .filter(asset => !asset.key.slice(S3_PREFIX.length).includes('/'))
        .sort((a, b) => String(b.lastModified || '').localeCompare(String(a.lastModified || '')));

    return {
        source: 's3',
        assets: rootAssets,
        folders: []
    };
}

async function uploadAsset(file, pathValue) {
    const formData = new FormData();
    formData.append('file', file);
    if (pathValue) formData.append('path', pathValue);

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

async function createFolder(name) {
    const response = await fetch('/api/reference-assets/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath: currentPath, name })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create folder');
    }
    return data.folder;
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
        statusText.textContent = 'Uploading reference file...';
        const asset = await uploadAsset(file, currentPath);
        showToast('Reference file uploaded', 'success');
        if (asset?.url) await copyUrl(asset.url);
        await loadAssets();
    } catch (error) {
        console.error('Reference upload failed:', error);
        showToast(error.message || 'Upload failed', 'error');
    } finally {
        uploadInput.value = '';
    }
});

newFolderButton.addEventListener('click', async () => {
    const name = window.prompt('New folder name');
    if (!name || !name.trim()) return;

    try {
        const folder = await createFolder(name.trim());
        showToast('Folder created', 'success');
        await loadAssets();
        if (folder?.path) navigateTo(folder.path);
    } catch (error) {
        console.error('Folder creation failed:', error);
        showToast(error.message || 'Failed to create folder', 'error');
    }
});

searchInput.addEventListener('input', event => {
    searchTerm = event.target.value;
    renderAssets();
});

refreshButton.addEventListener('click', loadAssets);

window.addEventListener('hashchange', () => {
    currentPath = decodeURIComponent(location.hash.replace(/^#/, ''));
    loadAssets();
});

loadAssets();
