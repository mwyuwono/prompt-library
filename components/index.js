/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Using specific commit hash to bypass stale CDN cache (fix for filter chip _toggle bug)
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@521f36c/dist/web-components.js';

// Local component: customized wy-toast with shorter duration and no icon
import './wy-toast.js';

console.log('[Components] m3-design-v2 web components registered');
