/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import local bundle for workspace verification of in-flight design system changes.
// Keep the URL versioned to avoid stale browser caches while testing.
import '../web-components.js?v=20260319-1532';

console.log('[Components] m3-design-v2 web components registered (local bundle)');
