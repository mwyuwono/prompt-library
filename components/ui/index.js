/**
 * Project-owned Web Components entry point.
 *
 * The component sources in this folder were snapshotted from the former shared
 * design system and are now maintained locally by prompts-library.
 */

// Material Web dependencies used by the local wy-* components.
import '@material/web/icon/icon.js';
import '@material/web/dialog/dialog.js';

// Local wy-* components used by the public, private, and admin interfaces.
import './wy-button.js';
import './wy-filter-chip.js';
import './wy-controls-bar.js';
import './wy-toast.js';
import './wy-modal.js';
import './wy-tabs.js';
import './wy-form-field.js';
import './wy-dropdown.js';
import './wy-info-panel.js';
import './wy-option-toggle.js';
import './wy-image-upload.js';
import './wy-code-textarea.js';
import './wy-variable-editor.js';
import './wy-variation-editor.js';
import './wy-prompt-editor.js';
import './wy-step-editor.js';
import './wy-prompt-modal.js';
import './wy-links-modal.js';

console.log('[prompts-library] Local web components registered');
