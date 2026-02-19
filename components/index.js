/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// Import from CDN (deployed to all environments)
// Using commit hash instead of @main for reliable CDN delivery
// @main is unreliable - see docs/css-changes-not-appearing-postmortem.md Lesson 8
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@cc988fd/dist/web-components.js';

console.log('[Components] m3-design-v2 web components registered (CDN)');
