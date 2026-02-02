/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// TEMPORARY: Pinned to commit hash due to CDN throttle. Revert to @main after Feb 3, 2026.
// TODO: Revert to @main with cache-busting after CDN cache expires
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@d4c15a4/dist/web-components.js';

console.log('[Components] m3-design-v2 web components registered');
