/**
 * Component Registry for prompts-library
 *
 * Loads Web Components from m3-design-v2 design system
 * Components are registered as custom elements via Lit 3.x
 */

// TEMPORARY: Using local build for development/testing
// TODO: Revert to CDN after pushing changes to GitHub
// import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=202602021941';
import '../web-components.js?v=20260203-save-fix';

console.log('[Components] m3-design-v2 web components registered (LOCAL BUILD)');
