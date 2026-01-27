/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Using @802d520 - Latest: dropdown subtle variant with Container Low background
// TODO: Switch back to @main after ~24 hours when CDN branch pointer updates
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@802d520/dist/web-components.js';

console.log('[Components] m3-design-v2 web components registered');
