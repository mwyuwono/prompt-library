/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import design system web components (built bundle from dist/)
// Using @main with cache-busting parameter
// Update ?v= parameter after design system changes to bust browser cache
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=202602021757';

console.log('[Components] m3-design-v2 web components registered');
