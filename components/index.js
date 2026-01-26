/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Temporarily using commit hash @0036323 to bypass CDN cache until @main updates
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@0036323/dist/web-components.js';

console.log('[Components] m3-design-v2 web components registered');
