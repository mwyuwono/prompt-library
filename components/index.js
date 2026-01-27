/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Using @cc1632c temporarily until CDN @main updates (includes wy-dropdown and wy-info-panel)
// TODO: Switch back to @main after ~24 hours when CDN branch pointer updates
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@cc1632c/dist/web-components.js';

console.log('[Components] m3-design-v2 web components registered');
