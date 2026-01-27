/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Using @4759b3b - all @import errors fixed, components register properly
// TODO: Switch back to @main after ~24 hours when CDN branch pointer updates
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@4759b3b/dist/web-components.js';

console.log('[Components] m3-design-v2 web components registered');
