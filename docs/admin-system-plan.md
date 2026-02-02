# Prompts Library Admin System - Implementation Plan

## Overview

Add a local-only admin interface at `/admin` for editing prompts visually. Changes save to `prompts.json` and are published when committed and pushed to git.

**Core Principle:** All reusable components must be created in the shared design system (`m3-design-v2`) so updates propagate to all consuming projects.

---

## Key Decisions Made

1. **Access Method:** Separate `/admin` page (not toggle mode or per-card edit)
2. **Save Behavior:** Explicit save button (not autosave)
3. **CRUD Scope:** Edit existing prompts + Archive feature (no add/delete for v1)
4. **Variations:** Prompt-level editing only for v1 (variation editing deferred)
5. **Local Server:** Node.js/Express dev server
6. **Archive Behavior:** Hidden from public site only (visible in admin)
7. **Image Management:** Full upload/edit/delete support via UI

---

## Reference Materials

### Mockup Location
```
/Users/mwy/Library/Mobile Documents/com~apple~CloudDocs/Projects/prompts-library/redesign-reference/prompt-editor/
├── screen.png    # Visual mockup
└── code.html     # Example HTML/Tailwind implementation
```

### Mockup UI Summary
- Dark hunter green background (#2C4C3B)
- Two-column layout: 58% editor (left), 42% preview (right)
- Clay/alabaster cards (#F5F2EA, #FDFBF7) for form sections
- Playfair Display serif for headings, Inter/DM Sans for body
- Material Symbols icons throughout
- Rounded corners (1rem default, 1.5rem for cards)
- Sticky live preview panel on right

---

## Architecture

```
m3-design-v2/                    # DESIGN SYSTEM (shared)
├── src/components/
│   ├── wy-prompt-editor.js      # NEW: Main editor component
│   ├── wy-image-upload.js       # NEW: Drag-drop image upload
│   ├── wy-icon-picker.js        # NEW: Icon selection grid
│   ├── wy-variable-editor.js    # NEW: Variable list management
│   ├── wy-code-textarea.js      # NEW: Monospace textarea for templates
│   ├── wy-toggle-field.js       # NEW: Toggle with label/description
│   ├── wy-form-field.js         # EXISTING: Input wrapper
│   ├── wy-dropdown.js           # EXISTING: Select control
│   └── wy-modal.js              # EXISTING: Modal container
├── src/web-components.js        # UPDATE: Register new components
└── dist/web-components.js       # BUILD OUTPUT: CDN bundle

prompts-library/                 # CONSUMING PROJECT
├── admin.html                   # NEW: Admin page (uses web components)
├── admin.js                     # NEW: Admin orchestration logic
├── admin.css                    # NEW: Page-level layout only
├── server.js                    # NEW: Node.js dev server with API
├── package.json                 # NEW: Dependencies (express, multer)
├── prompts.json                 # EXISTING: Now writable via API
├── public/images/               # EXISTING: Image uploads stored here
├── index.html                   # EXISTING: Public site (unchanged)
└── app.js                       # EXISTING: Add archive filter (~5 lines)
```

---

## Data Model

### Current Prompt Schema (prompts.json)
```javascript
{
  "id": "unique-slug",           // Unique identifier
  "title": "Display Name",       // Shown in UI
  "description": "Short desc",   // Summary text
  "category": "Category Name",   // For filtering/grouping
  "image": "public/images/...",  // Optional thumbnail
  "icon": "material_icon_name",  // Google Material Symbol (fallback if no image)
  "featured": true,              // Optional flag for special styling
  "locked": true,                // Edit protection (default: true)

  "variables": [
    {
      "name": "variable_slug",
      "label": "Display Label",
      "placeholder": "Help text",
      "value": "",
      "inputType": "toggle",     // Optional: "toggle" or "text"
      "options": ["", "value"]   // For toggle: off/on values
    }
  ],

  "variations": [...],           // Alternative versions (v1: not editable)
  "template": "Text with {{variable}} substitution"
}
```

### New Field
```javascript
{
  "archived": false  // NEW: Hidden from public site when true
}
```

---

## Design System Components (m3-design-v2)

### Component Architecture Pattern

All components follow LitElement pattern used in existing m3-design-v2 components:

```javascript
import { LitElement, html, css } from 'lit';

export class WyComponentName extends LitElement {
  static properties = {
    prop1: { type: String },
    prop2: { type: Boolean, reflect: true },
    _internalState: { type: String, state: true }
  };

  static styles = css`
    :host { display: block; }
    /* Import fonts for Shadow DOM */
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    /* Use design tokens */
    .element { color: var(--md-sys-color-on-surface); }
  `;

  render() {
    return html`<!-- Template -->`;
  }

  _handleEvent() {
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
}

customElements.define('wy-component-name', WyComponentName);
```

### New Components to Create

---

#### 1. `wy-toggle-field`

Toggle switch with label and description row.

**Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `checked` | Boolean | false | Toggle state |
| `label` | String | "" | Primary label text |
| `description` | String | "" | Secondary description text |
| `disabled` | Boolean | false | Disabled state |

**Events:**
| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ checked: boolean }` | Emitted when toggled |

**Visual Reference (from mockup):**
- Horizontal layout: label+description on left, toggle on right
- Toggle: 56px wide, 28px tall, rounded full
- Checked: hunter green background, white knob
- Unchecked: hunter/20 background

---

#### 2. `wy-image-upload`

Drag-and-drop image upload zone with preview.

**Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | String | "" | Current image path/URL |
| `accept` | String | "image/*" | Accepted MIME types |
| `max-size` | Number | 5242880 | Max file size in bytes (5MB) |
| `label` | String | "Background Texture" | Field label |

**Events:**
| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ file: File }` | Emitted when file selected |
| `remove` | `{}` | Emitted when remove clicked |
| `error` | `{ message: string }` | Emitted on validation error |

**States:**
1. **Empty:** Dashed border zone, cloud_upload icon, "Click to upload or drag and drop", file type hints
2. **Has Image:** Thumbnail preview (object-fit: cover), remove button overlay
3. **Dragging:** Highlighted border (solid, primary color)
4. **Uploading:** Optional progress indicator (can be handled by parent)

**Visual Reference (from mockup):**
- Dashed border: 2px, hunter/20 color
- Border radius: 1rem
- Padding: 2rem
- Icon container: 48px rounded-full, hunter/5 background
- Hover: white background

---

#### 3. `wy-icon-picker`

Grid of selectable Material Symbol icons.

**Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | String | "" | Selected icon name |
| `icons` | Array | [] | Array of icon names to display |
| `columns` | Number | 4 | Grid columns |
| `label` | String | "Card Icon" | Field label |

**Events:**
| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ icon: string }` | Emitted when icon selected |

**Visual Reference (from mockup):**
- Grid of square buttons, aspect-ratio: 1
- Border radius: 0.75rem
- Selected: hunter background, alabaster text, ring-2 ring-offset-2
- Unselected: white background, hunter/60 text, border hunter/10
- Hover: hunter/5 background
- Last item: "+" icon for custom entry (optional)

---

#### 4. `wy-variable-editor`

Sortable list for managing prompt variables.

**Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variables` | Array | [] | Array of variable objects |
| `allow-reorder` | Boolean | true | Enable drag reorder |

**Variable Object Shape:**
```javascript
{
  name: "variable-slug",
  label: "Display Label",
  placeholder: "Helper text",
  inputType: "text" | "toggle",
  options: ["off-value", "on-value"]  // Only for toggle type
}
```

**Events:**
| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ variables: Array }` | Emitted when variables change |

**Per-Variable UI:**
- Drag handle (left side, `drag_indicator` icon)
- Name input (slug, prefixed display like "{{name}}")
- Label input
- Placeholder input
- Input type dropdown (text/toggle)
- Toggle options row (conditional, only shown when inputType=toggle)
- Remove button (right side, `close` icon)

**Add Variable Button:**
- Below list, secondary style
- Icon: `add`
- Text: "Add Variable"

---

#### 5. `wy-code-textarea`

Monospace textarea for template editing with variable insertion helpers.

**Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | String | "" | Textarea content |
| `variables` | Array | [] | Available variables for chips |
| `placeholder` | String | "" | Placeholder text |
| `rows` | Number | 8 | Visible rows |
| `label` | String | "Template" | Field label |
| `max-length` | Number | 0 | Max characters (0 = unlimited) |

**Events:**
| Event | Detail | Description |
|-------|--------|-------------|
| `input` | `{ value: string }` | Emitted on each keystroke |
| `change` | `{ value: string }` | Emitted on blur |

**Features:**
- Monospace font (font-family: monospace or 'Fira Code')
- Variable chips row below textarea
- Click chip → insert `{{variable-name}}` at cursor position
- Character count display (if max-length set): "245/500 characters"
- Optional: "Markdown supported" hint

---

#### 6. `wy-prompt-editor`

Main editor component that assembles all sub-components.

**Properties:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `prompt` | Object | null | The prompt data to edit |
| `categories` | Array | [] | Available categories for dropdown |
| `icons` | Array | [...] | Available icons for picker |

**Events:**
| Event | Detail | Description |
|-------|--------|-------------|
| `save` | `{ prompt: Object }` | Emitted when save clicked |
| `cancel` | `{}` | Emitted when discard clicked |
| `image-upload` | `{ file: File, promptId: string }` | Emitted when image selected |
| `image-remove` | `{ promptId: string }` | Emitted when image removed |

**Internal Structure:**
```html
<div class="editor-layout">
  <!-- Left Column: Form -->
  <div class="editor-form">
    <!-- Header -->
    <header>
      <nav>Breadcrumbs</nav>
      <h1>Prompt Editor</h1>
      <p>Subtitle</p>
      <div class="actions">
        <button>Discard</button>
        <button>Save Changes</button>
      </div>
    </header>

    <!-- Section 1: Basic Information -->
    <section class="card">
      <wy-form-field label="Prompt Title">
        <input type="text" />
      </wy-form-field>
      <wy-form-field label="Slug">
        <input type="text" />
      </wy-form-field>
      <wy-form-field label="Prompt ID" disabled>
        <input type="text" readonly />
      </wy-form-field>
      <wy-form-field label="Description">
        <textarea></textarea>
      </wy-form-field>
    </section>

    <!-- Section 2: Visuals & Metadata -->
    <section class="card">
      <wy-icon-picker></wy-icon-picker>
      <wy-dropdown label="Category"></wy-dropdown>
      <wy-image-upload></wy-image-upload>
    </section>

    <!-- Section 3: Variables (if applicable) -->
    <section class="card">
      <wy-variable-editor></wy-variable-editor>
    </section>

    <!-- Section 4: Template -->
    <section class="card">
      <wy-code-textarea></wy-code-textarea>
    </section>

    <!-- Section 5: Visibility -->
    <section class="card">
      <wy-toggle-field
        label="Visibility"
        description="Control who can access this prompt">
      </wy-toggle-field>
    </section>
  </div>

  <!-- Right Column: Preview -->
  <div class="editor-preview">
    <h3>Live Preview</h3>
    <div class="preview-status">Updating</div>
    <div class="preview-card">
      <!-- Renders prompt card preview -->
    </div>
  </div>
</div>
```

---

### Existing Components to Reuse

| Component | Current Location | Usage in Editor |
|-----------|------------------|-----------------|
| `wy-form-field` | `src/components/wy-form-field.js` | Wrap title, description, slug inputs |
| `wy-dropdown` | `src/components/wy-dropdown.js` | Category selector |
| `wy-modal` | `src/components/wy-modal.js` | Confirmation dialogs |
| `wy-toast` | `src/components/wy-toast.js` | Save/error notifications |

---

## Server API (prompts-library/server.js)

### Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "cors": "^2.8.5"
  }
}
```

### Endpoints

#### `GET /api/prompts`
Returns all prompts including archived.

**Response:**
```json
{
  "prompts": [...],
  "categories": ["Creativity", "Productivity", ...]
}
```

#### `GET /api/prompts/:id`
Returns single prompt by ID.

**Response:**
```json
{
  "prompt": { ... }
}
```

#### `PUT /api/prompts/:id`
Updates a prompt.

**Request Body:**
```json
{
  "title": "...",
  "description": "...",
  "category": "...",
  "icon": "...",
  "image": "...",
  "variables": [...],
  "template": "...",
  "archived": false
}
```

**Response:**
```json
{
  "success": true,
  "prompt": { ... }
}
```

#### `POST /api/prompts/:id/archive`
Toggles archive status.

**Response:**
```json
{
  "success": true,
  "archived": true
}
```

#### `POST /api/images/upload`
Uploads image file.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "success": true,
  "path": "public/images/filename.jpg"
}
```

#### `DELETE /api/images/:filename`
Deletes image file.

**Response:**
```json
{
  "success": true
}
```

### Server Implementation Notes

```javascript
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: 'public/images/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Helper: Read/write prompts.json
const PROMPTS_FILE = './prompts.json';
const readPrompts = () => JSON.parse(fs.readFileSync(PROMPTS_FILE, 'utf8'));
const writePrompts = (data) => fs.writeFileSync(PROMPTS_FILE, JSON.stringify(data, null, 2));

// Routes...
```

---

## Admin Page (prompts-library)

### admin.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Prompt Editor - Admin</title>

  <!-- Design System -->
  <link rel="stylesheet" href="tokens.css">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" rel="stylesheet">

  <!-- Page Styles -->
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-page">
  <!-- Prompt List (sidebar or separate view) -->
  <aside id="prompt-list">
    <!-- Populated by admin.js -->
  </aside>

  <!-- Editor -->
  <main>
    <wy-prompt-editor id="editor"></wy-prompt-editor>
  </main>

  <!-- Toast notifications -->
  <wy-toast id="toast"></wy-toast>

  <!-- Design System Components -->
  <script type="module">
    import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=TIMESTAMP';
  </script>

  <!-- Admin Logic -->
  <script type="module" src="admin.js"></script>
</body>
</html>
```

### admin.js

```javascript
// State
let prompts = [];
let categories = [];
let currentPromptId = null;

// DOM Elements
const editor = document.getElementById('editor');
const promptList = document.getElementById('prompt-list');
const toast = document.getElementById('toast');

// Initialize
async function init() {
  await loadPrompts();
  renderPromptList();
  setupEventListeners();

  // Load first prompt or from URL hash
  const hashId = window.location.hash.slice(1);
  if (hashId && prompts.find(p => p.id === hashId)) {
    loadPrompt(hashId);
  }
}

// API Calls
async function loadPrompts() {
  const res = await fetch('/api/prompts');
  const data = await res.json();
  prompts = data.prompts;
  categories = data.categories;
}

async function savePrompt(prompt) {
  const res = await fetch(`/api/prompts/${prompt.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prompt)
  });
  return res.json();
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData
  });
  return res.json();
}

async function deleteImage(filename) {
  const res = await fetch(`/api/images/${filename}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Event Handlers
function setupEventListeners() {
  editor.addEventListener('save', async (e) => {
    try {
      await savePrompt(e.detail.prompt);
      showToast('Prompt saved successfully');
      await loadPrompts();
      renderPromptList();
    } catch (err) {
      showToast('Error saving prompt', 'error');
    }
  });

  editor.addEventListener('cancel', () => {
    // Reload current prompt to discard changes
    if (currentPromptId) {
      loadPrompt(currentPromptId);
    }
  });

  editor.addEventListener('image-upload', async (e) => {
    const { file } = e.detail;
    const result = await uploadImage(file);
    if (result.success) {
      // Update editor with new image path
      editor.prompt = { ...editor.prompt, image: result.path };
    }
  });

  editor.addEventListener('image-remove', async (e) => {
    const currentImage = editor.prompt.image;
    if (currentImage) {
      const filename = currentImage.split('/').pop();
      await deleteImage(filename);
      editor.prompt = { ...editor.prompt, image: '' };
    }
  });
}

// Rendering
function renderPromptList() {
  promptList.innerHTML = prompts.map(p => `
    <div class="prompt-item ${p.archived ? 'archived' : ''}" data-id="${p.id}">
      <span class="material-symbols-outlined">${p.icon || 'article'}</span>
      <span class="title">${p.title}</span>
      ${p.archived ? '<span class="badge">Archived</span>' : ''}
    </div>
  `).join('');

  // Click handlers
  promptList.querySelectorAll('.prompt-item').forEach(item => {
    item.addEventListener('click', () => loadPrompt(item.dataset.id));
  });
}

function loadPrompt(id) {
  const prompt = prompts.find(p => p.id === id);
  if (prompt) {
    currentPromptId = id;
    editor.prompt = prompt;
    editor.categories = categories;
    window.location.hash = id;
  }
}

function showToast(message, type = 'success') {
  toast.show(message, type);
}

// Start
init();
```

### admin.css

```css
/* Page-level layout only - no component styling */

.admin-page {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: var(--md-sys-color-background);
}

#prompt-list {
  background: var(--md-sys-color-surface);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  padding: 1rem;
  overflow-y: auto;
}

.prompt-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 150ms;
}

.prompt-item:hover {
  background: var(--md-sys-color-surface-variant);
}

.prompt-item.archived {
  opacity: 0.6;
}

.prompt-item .badge {
  font-size: 0.75rem;
  background: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
}

main {
  padding: 2rem;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-page {
    grid-template-columns: 1fr;
  }

  #prompt-list {
    display: none; /* Or convert to modal/drawer */
  }
}
```

---

## Public Site Update (app.js)

Add archive filter near the top where prompts are loaded:

```javascript
// In loadPrompts() or wherever prompts are fetched/rendered
const visiblePrompts = prompts.filter(p => !p.archived);

// Use visiblePrompts instead of prompts for rendering
renderPrompts(visiblePrompts);
```

---

## Git Workflow & Recovery

### Publishing Changes

1. Make edits in admin UI → Save
2. Changes written to `prompts.json` immediately (local only)
3. Commit: `git add prompts.json public/images/ && git commit -m "Update prompts"`
4. Push: `git push origin main`
5. Vercel auto-deploys updated site

### Reverting Unintended Changes

**Before committing (discard local changes):**
```bash
git checkout -- prompts.json public/images/
```

**After committing (safe revert - creates new commit):**
```bash
git log --oneline -10          # Find commit to revert
git revert HEAD                # Revert most recent commit
git push origin main
```

**After committing (destructive reset - rewrites history):**
```bash
git log --oneline -10          # Find commit hash to reset to
git reset --hard <commit-hash>
git push --force origin main   # Requires force push
```

### Admin UI Info Banner

Display at top of editor:

> **Changes are local until committed.** Run `git commit` and `git push` to publish. To undo uncommitted changes: `git checkout -- prompts.json`. To undo a committed change: `git revert HEAD`.

---

## Implementation Phases

### Phase 1: Design System Components (m3-design-v2)
1. Create `wy-toggle-field` (simplest, establishes pattern)
2. Create `wy-image-upload`
3. Create `wy-icon-picker`
4. Create `wy-code-textarea`
5. Create `wy-variable-editor`
6. Create `wy-prompt-editor` (assembles all above)
7. Register in `src/web-components.js`
8. Build: `npm run build`
9. Push to GitHub and purge CDN cache

### Phase 2: Server & API (prompts-library)
1. Create `package.json` with express, multer, cors
2. Create `server.js` with all endpoints
3. Test API endpoints with curl

### Phase 3: Admin Page (prompts-library)
1. Create `admin.html` shell
2. Create `admin.js` orchestration
3. Create `admin.css` layout
4. Wire up all interactions
5. Test full flow

### Phase 4: Public Site Update
1. Add archive filter to `app.js`
2. Test archived prompts are hidden from public site

---

## Verification Checklist

### Design System
- [ ] All 6 new components render in isolation (dev server)
- [ ] Components emit correct events with proper detail
- [ ] Components use design tokens (no hardcoded colors)
- [ ] Shadow DOM fonts load correctly
- [ ] Built bundle works via CDN

### Server
- [ ] `npm install` installs dependencies
- [ ] `node server.js` starts without errors on port 3000
- [ ] `GET /api/prompts` returns all prompts
- [ ] `PUT /api/prompts/:id` updates prompts.json
- [ ] `POST /api/images/upload` saves file to public/images/
- [ ] `DELETE /api/images/:filename` removes file

### Admin UI
- [ ] Page loads at http://localhost:3000/admin
- [ ] Prompt list shows all prompts (archived indicated)
- [ ] Click prompt → loads in editor
- [ ] Edit title → Save → prompts.json updated
- [ ] Upload image → file in public/images/, path in editor
- [ ] Remove image → file deleted, field cleared
- [ ] Archive toggle → prompt hidden from public site
- [ ] Variable editor → add/remove/reorder works
- [ ] Live preview updates as fields change
- [ ] Discard button reloads original data

### Public Site
- [ ] Archived prompts do not appear
- [ ] Non-archived prompts display normally

---

## Out of Scope (Future Versions)

- Variation editing (templates within variations)
- Adding new prompts via UI
- Deleting prompts permanently (use archive instead)
- Undo/history within the UI
- Bulk operations
- Collaborative editing
- Version history / diff view
