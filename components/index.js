/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Cache-bust to avoid stale jsDelivr propagation during updates.
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=20260125';

// Local component: customized wy-toast with shorter duration and no icon
import './wy-toast.js';

console.log('[Components] m3-design-v2 web components registered');
