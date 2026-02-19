/**
 * Fabric Colorizer — shared logic for gallery and colorizer pages.
 * Session-only; no persistence.
 */

const MANIFEST_PATH = './designs-manifest.json';
const SWATCHES_PATH = '../fabric-palette/shareable-color-swatches.json';

/**
 * Fetch and return the designs manifest (array of design objects).
 * @returns {Promise<Array<{id: string, title: string, description: string, thumbnail: string, svgPath: string, layers: Array<{id: string, label: string}>}>>}
 */
async function fetchManifest() {
  const res = await fetch(MANIFEST_PATH);
  if (!res.ok) throw new Error('Failed to load designs manifest');
  return res.json();
}

/**
 * Fetch shareable color swatches (primary hex + name per entry).
 * @returns {Promise<Array<{name: string, hex: string}>>}
 */
async function fetchSwatches() {
  const res = await fetch(SWATCHES_PATH);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data.map((entry) => ({
    name: entry.primary?.name || entry.title || 'Swatch',
    hex: entry.primary?.hex || '#999999',
  })) : [];
}

/**
 * Get design by id from manifest.
 * @param {string} designId
 * @returns {Promise<Object|null>}
 */
async function getDesignById(designId) {
  const manifest = await fetchManifest();
  return manifest.find((d) => d.id === designId) || null;
}

/**
 * Load SVG from path and inject into container. Returns the SVG element and a copy of initial layer fills for Reset All.
 * @param {string} svgPath - Relative path to SVG
 * @param {HTMLElement} container
 * @returns {Promise<{svgEl: SVGElement, initialFills: Record<string, string>}>}
 */
async function loadAndInjectSVG(svgPath, container) {
  const response = await fetch(svgPath);
  const svgText = await response.text();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl = document.importNode(svgDoc.documentElement, true);
  svgEl.removeAttribute('width');
  svgEl.removeAttribute('height');
  svgEl.style.cssText = 'width: 100%; height: 100%;';
  container.innerHTML = '';
  container.appendChild(svgEl);

  const initialFills = {};
  const layerGroups = svgEl.querySelectorAll('g[id^="layer-"]');
  layerGroups.forEach((g) => {
    const id = g.getAttribute('id');
    if (id) initialFills[id] = g.getAttribute('fill') || '#cccccc';
  });
  return { svgEl, initialFills };
}

/**
 * Apply a fill color to a layer (and its fill-inheriting children).
 * @param {SVGElement} svgEl - Root SVG element
 * @param {string} layerId - e.g. "layer-body"
 * @param {string} hex - e.g. "#2C4C3B"
 */
function applyColorToLayer(svgEl, layerId, hex) {
  const g = svgEl.getElementById(layerId);
  if (!g) return;
  g.setAttribute('fill', hex);
  g.querySelectorAll('path, rect, circle, polygon, ellipse, polyline').forEach((el) => {
    if (el.getAttribute('fill') !== 'none') {
      el.setAttribute('fill', hex);
    }
  });
}

/**
 * Download the current SVG as a file.
 * @param {SVGElement} svgEl
 * @param {string} designId
 */
function downloadSVG(svgEl, designId) {
  const serializer = new XMLSerializer();
  const svgString =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    serializer.serializeToString(svgEl.cloneNode(true));
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${designId}-colorized.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Export for use in both pages
window.FabricColorizer = {
  fetchManifest,
  fetchSwatches,
  getDesignById,
  loadAndInjectSVG,
  applyColorToLayer,
  downloadSVG,
};
