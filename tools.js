let tools = [];
let skills = [];
let filteredTools = [];
let selectedSlug = null;
let currentView = 'grid';
let currentCatalog = 'tools';

const toolSearchInput = document.getElementById('toolSearchInput');
const toolTypeFilter = document.getElementById('toolTypeFilter');
const toolStatusFilter = document.getElementById('toolStatusFilter');
const toolListItems = document.getElementById('toolListItems');
const toolsGrid = document.getElementById('toolsGrid');
const toolDetail = document.getElementById('toolDetail');
const toolsCount = document.getElementById('toolsCount');
const toolsSourceStatus = document.getElementById('toolsSourceStatus');
const toast = document.getElementById('toast');
const gridViewButton = document.getElementById('gridViewButton');
const listViewButton = document.getElementById('listViewButton');
const toolsCatalogButton = document.getElementById('toolsCatalogButton');
const skillsCatalogButton = document.getElementById('skillsCatalogButton');
const catalogKicker = document.getElementById('catalogKicker');
const catalogTitle = document.getElementById('catalogTitle');

initToolsBrowser();

async function initToolsBrowser() {
    setupEventListeners();
    await loadTools();
}

function setupEventListeners() {
    toolSearchInput.addEventListener('input', applyFilters);
    toolTypeFilter.addEventListener('change', applyFilters);
    toolStatusFilter.addEventListener('change', applyFilters);

    gridViewButton.addEventListener('click', () => setView('grid'));
    listViewButton.addEventListener('click', () => setView('list'));
    toolsCatalogButton.addEventListener('click', () => setCatalog('tools'));
    skillsCatalogButton.addEventListener('click', () => setCatalog('skills'));
}

async function loadTools() {
    try {
        const [toolsData, skillsData] = await Promise.all([
            fetchCatalog('/api/tools', 'tools'),
            fetchCatalog('/api/skills', 'skills')
        ]);

        tools = toolsData.tools || [];
        skills = skillsData.skills || [];
        selectedSlug = getSlugFromHash() || getCurrentItems()[0]?.slug || null;

        applyFilters();
    } catch (error) {
        toolsSourceStatus.textContent = 'Unable to read local catalogs.';
        renderError(error);
    }
}

async function fetchCatalog(url, key) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        ...data,
        [key]: data[key] || []
    };
}

function populateFilters(types, statuses) {
    toolTypeFilter.innerHTML = '<option value="">All types</option>';
    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        toolTypeFilter.appendChild(option);
    });

    toolStatusFilter.innerHTML = '<option value="">All statuses</option>';
    statuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        toolStatusFilter.appendChild(option);
    });
}

function applyFilters() {
    const items = getCurrentItems();
    const query = toolSearchInput.value.trim().toLowerCase();
    const type = toolTypeFilter.value;
    const status = toolStatusFilter.value;

    filteredTools = items.filter(tool => {
        const searchText = [
            tool.title,
            tool.slug,
            tool.type,
            tool.status,
            tool.overview,
            tool.keyInvocation,
            tool.usageNotes,
            tool.routing,
            tool.folderPath
        ].join(' ').toLowerCase();

        return (!query || searchText.includes(query)) &&
            (!type || tool.type === type) &&
            (!status || tool.status === status);
    }).sort((a, b) => scoreToolMatch(b, query) - scoreToolMatch(a, query));

    if (!filteredTools.some(tool => tool.slug === selectedSlug)) {
        selectedSlug = filteredTools[0]?.slug || null;
    }

    renderTools();
}

function renderTools() {
    const items = getCurrentItems();
    const noun = getCatalogNoun();
    populateFiltersFromItems(items);
    toolSearchInput.placeholder = `Search ${noun.plural.toLowerCase()}...`;
    toolsSourceStatus.textContent = getCatalogStatusText();
    catalogKicker.textContent = currentCatalog === 'skills' ? 'Local Skill Roots' : 'Bullfinch Registry';
    catalogTitle.textContent = currentCatalog === 'skills' ? 'Custom Skills' : 'Local Tools';
    toolsCount.textContent = `${filteredTools.length} of ${items.length} ${noun.plural.toLowerCase()}`;
    renderSidebarList();
    renderToolCards();
    renderDetail();
}

function renderSidebarList() {
    if (!filteredTools.length) {
        toolListItems.innerHTML = `
            <div class="server-error-state">
                <span class="material-symbols-outlined">search_off</span>
                <h3>No tools found</h3>
                <p>Adjust search or filters.</p>
            </div>
        `;
        return;
    }

    toolListItems.innerHTML = filteredTools.map(tool => `
        <button class="prompt-item tool-sidebar-item ${tool.slug === selectedSlug ? 'active' : ''}" type="button" data-slug="${escapeAttribute(tool.slug)}">
            <span class="material-symbols-outlined">${getToolIcon(tool)}</span>
                <span class="prompt-item-content">
                    <span class="prompt-item-title">${escapeHtml(tool.title)}</span>
                    <span class="prompt-item-category">${escapeHtml(tool.type || getCatalogNoun().singular)}</span>
                </span>
        </button>
    `).join('');

    toolListItems.querySelectorAll('[data-slug]').forEach(item => {
        item.addEventListener('click', () => selectTool(item.dataset.slug));
    });
}

function renderToolCards() {
    toolsGrid.dataset.view = currentView;

    if (!filteredTools.length) {
        toolsGrid.innerHTML = '';
        return;
    }

    toolsGrid.innerHTML = filteredTools.map(tool => `
        <article class="tool-card ${tool.slug === selectedSlug ? 'selected' : ''}" data-slug="${escapeAttribute(tool.slug)}">
            <div class="tool-card-icon">
                <span class="material-symbols-outlined">${getToolIcon(tool)}</span>
            </div>
            <div class="tool-card-body">
                <div class="tool-card-meta">
                    <span>${escapeHtml(tool.type || getCatalogNoun().singular)}</span>
                    <span>${escapeHtml(tool.status || 'Active')}</span>
                </div>
                <h2>${escapeHtml(tool.title)}</h2>
                <p>${escapeHtml(summarize(tool.overview, 190))}</p>
            </div>
        </article>
    `).join('');

    toolsGrid.querySelectorAll('[data-slug]').forEach(card => {
        card.addEventListener('click', () => selectTool(card.dataset.slug));
    });
}

function renderDetail() {
    const tool = filteredTools.find(item => item.slug === selectedSlug);

    if (!tool) {
        toolDetail.innerHTML = `
            <div class="tool-empty-detail">
                <span class="material-symbols-outlined">construction</span>
                <h2>Select a ${escapeHtml(getCatalogNoun().singular.toLowerCase())}</h2>
                <p>Choose a ${escapeHtml(getCatalogNoun().singular.toLowerCase())} to view documentation and invocation notes.</p>
            </div>
        `;
        return;
    }

    window.location.hash = tool.slug;

    toolDetail.innerHTML = `
        <header class="tool-detail-header">
            <div>
                <p class="tools-kicker">${escapeHtml(tool.type || getCatalogNoun().singular)}</p>
                <h2>${escapeHtml(tool.title)}</h2>
            </div>
            <span class="tool-status-pill">${escapeHtml(tool.status || 'Active')}</span>
        </header>

        ${renderTextSection('Overview', tool.overview)}
        ${renderTextSection('How to invoke', tool.keyInvocation, true)}
        ${renderSourceSection(tool)}
        ${renderTextSection('Routing', tool.routing)}
        ${renderTextSection('Usage notes', tool.usageNotes)}
        ${renderPathSection(tool)}
    `;

    toolDetail.querySelectorAll('[data-copy]').forEach(button => {
        button.addEventListener('click', () => copyText(button.dataset.copy));
    });
}

function renderTextSection(title, content, preferCode = false) {
    if (!content || !content.trim()) {
        return `
            <section class="tool-detail-section muted">
                <h3>${escapeHtml(title)}</h3>
                <p>No ${escapeHtml(title.toLowerCase())} documented yet.</p>
            </section>
        `;
    }

    const display = preferCode ? extractCodeOrText(content) : content.trim();
    const copyButton = preferCode
        ? `<button class="tool-copy-button" type="button" data-copy="${escapeAttribute(display)}">
                <span class="material-symbols-outlined">content_copy</span>
                Copy
           </button>`
        : '';

    return `
        <section class="tool-detail-section">
            <div class="tool-section-heading">
                <h3>${escapeHtml(title)}</h3>
                ${copyButton}
            </div>
            ${preferCode ? `<pre>${escapeHtml(display)}</pre>` : renderMarkdownLite(content)}
        </section>
    `;
}

function renderSourceSection(tool) {
    if (!tool.keySources?.length) {
        return `
            <section class="tool-detail-section muted">
                <h3>Key sources</h3>
                <p>No key sources documented yet.</p>
            </section>
        `;
    }

    return `
        <section class="tool-detail-section">
            <h3>Key sources</h3>
            <ul class="tool-source-list">
                ${tool.keySources.map(source => `
                    <li>
                        <span>${escapeHtml(source.label || source.target)}</span>
                        ${source.note ? `<small>${escapeHtml(source.note)}</small>` : ''}
                        ${source.target ? `<button class="tool-copy-button compact" type="button" data-copy="${escapeAttribute(source.target)}">
                            <span class="material-symbols-outlined">content_copy</span>
                            Copy
                        </button>` : ''}
                    </li>
                `).join('')}
            </ul>
        </section>
    `;
}

function renderPathSection(tool) {
    const primaryLabel = currentCatalog === 'skills' ? 'SKILL.md' : 'README';
    const configPath = currentCatalog === 'skills' && tool.configPath
        ? `<div>
                <dt>Agent config</dt>
                <dd>
                    <code>${escapeHtml(tool.configPath)}</code>
                    <button class="tool-copy-button compact" type="button" data-copy="${escapeAttribute(tool.configPath)}">
                        <span class="material-symbols-outlined">content_copy</span>
                        Copy
                    </button>
                </dd>
            </div>`
        : '';

    return `
        <section class="tool-detail-section">
            <h3>Paths</h3>
            <dl class="tool-paths">
                <div>
                    <dt>${escapeHtml(getCatalogNoun().singular)} folder</dt>
                    <dd>
                        <code>${escapeHtml(tool.folderPath)}</code>
                        <button class="tool-copy-button compact" type="button" data-copy="${escapeAttribute(tool.folderPath)}">
                            <span class="material-symbols-outlined">content_copy</span>
                            Copy
                        </button>
                    </dd>
                </div>
                <div>
                    <dt>${primaryLabel}</dt>
                    <dd>
                        <code>${escapeHtml(tool.readmePath)}</code>
                        <button class="tool-copy-button compact" type="button" data-copy="${escapeAttribute(tool.readmePath)}">
                            <span class="material-symbols-outlined">content_copy</span>
                            Copy
                        </button>
                    </dd>
                </div>
                ${configPath}
            </dl>
        </section>
    `;
}

function selectTool(slug) {
    selectedSlug = slug;
    renderTools();
}

function setCatalog(catalog) {
    if (currentCatalog === catalog) return;

    currentCatalog = catalog;
    toolTypeFilter.value = '';
    toolStatusFilter.value = '';
    selectedSlug = getCurrentItems()[0]?.slug || null;
    toolsCatalogButton.classList.toggle('active', catalog === 'tools');
    skillsCatalogButton.classList.toggle('active', catalog === 'skills');
    applyFilters();
}

function setView(view) {
    currentView = view;
    gridViewButton.classList.toggle('active', view === 'grid');
    listViewButton.classList.toggle('active', view === 'list');
    renderToolCards();
}

function getCurrentItems() {
    return currentCatalog === 'skills' ? skills : tools;
}

function getCatalogNoun() {
    return currentCatalog === 'skills'
        ? { singular: 'Skill', plural: 'Skills' }
        : { singular: 'Tool', plural: 'Tools' };
}

function getCatalogStatusText() {
    if (currentCatalog === 'skills') {
        return `Reading ${skills.length} custom skills from ~/.codex/skills and ~/.agents/skills.`;
    }

    return `Reading ${tools.length} active tools from Bullfinch.`;
}

function populateFiltersFromItems(items) {
    const selectedType = toolTypeFilter.value;
    const selectedStatus = toolStatusFilter.value;
    const types = [...new Set(items.map(item => item.type).filter(Boolean))].sort();
    const statuses = [...new Set(items.map(item => item.status).filter(Boolean))].sort();

    populateFilters(types, statuses);
    if (types.includes(selectedType)) toolTypeFilter.value = selectedType;
    if (statuses.includes(selectedStatus)) toolStatusFilter.value = selectedStatus;
}

function scoreToolMatch(tool, query) {
    if (!query) return 0;

    const title = String(tool.title || '').toLowerCase();
    const slug = String(tool.slug || '').toLowerCase();
    const type = String(tool.type || '').toLowerCase();

    if (title === query) return 100;
    if (title.startsWith(query)) return 80;
    if (title.includes(query)) return 60;
    if (slug.includes(query)) return 40;
    if (type.includes(query)) return 20;
    return 0;
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied.');
    } catch (error) {
        showToast('Copy failed.');
    }
}

function showToast(message) {
    if (toast?.show) {
        toast.show(message);
        return;
    }
    console.log(message);
}

function renderError(error) {
    toolsCount.textContent = 'Unavailable';
    toolsGrid.innerHTML = '';
    toolListItems.innerHTML = '';
    toolDetail.innerHTML = `
        <div class="server-error-state">
            <span class="material-symbols-outlined">error</span>
            <h3>Tools unavailable</h3>
            <p>${escapeHtml(error.message || 'Unable to load tools.')}</p>
        </div>
    `;
}

function getSlugFromHash() {
    return window.location.hash.replace(/^#/, '').trim();
}

function getToolIcon(tool) {
    const text = `${tool.type} ${tool.title}`.toLowerCase();
    if (currentCatalog === 'skills') return 'extension';
    if (text.includes('app') || text.includes('dashboard')) return 'dashboard';
    if (text.includes('script') || text.includes('cli') || text.includes('python')) return 'terminal';
    if (text.includes('library') || text.includes('catalog')) return 'inventory_2';
    if (text.includes('prompt')) return 'psychology';
    if (text.includes('reminder')) return 'notifications';
    return 'construction';
}

function summarize(value = '', max = 160) {
    const clean = value
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/[#>*_`[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (clean.length <= max) return clean;
    return `${clean.slice(0, max - 1).trim()}...`;
}

function extractCodeOrText(value = '') {
    const codeBlocks = [...value.matchAll(/```(?:\w+)?\n([\s\S]*?)```/g)].map(match => match[1].trim());
    return (codeBlocks.length ? codeBlocks.join('\n\n') : stripListMarkers(value)).trim();
}

function stripListMarkers(value = '') {
    return value
        .split(/\r?\n/)
        .map(line => line.replace(/^[-*]\s+/, ''))
        .join('\n');
}

function renderMarkdownLite(value = '') {
    const lines = value.trim().split(/\r?\n/);
    const html = [];
    let list = [];

    const flushList = () => {
        if (!list.length) return;
        html.push(`<ul>${list.map(item => `<li>${formatInline(item)}</li>`).join('')}</ul>`);
        list = [];
    };

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList();
            return;
        }

        const listMatch = trimmed.match(/^[-*]\s+(.+)/);
        if (listMatch) {
            list.push(listMatch[1]);
            return;
        }

        flushList();
        html.push(`<p>${formatInline(trimmed)}</p>`);
    });

    flushList();
    return html.join('');
}

function formatInline(value = '') {
    return escapeHtml(value)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeAttribute(value = '') {
    return escapeHtml(value).replace(/\n/g, '&#10;');
}
