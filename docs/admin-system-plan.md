# Prompts Library Admin System

**Technical documentation for LLM coding tools**

## Overview

Local-only admin interface at `/admin` for editing prompts visually. Changes save to `prompts.json` and publish when committed to git.

**Access:** http://localhost:3000/admin (requires server.js running)

## Architecture

### Core Components

```
prompt-library/
├── admin.html          # Admin page shell
├── admin.js            # Orchestration logic
├── admin.css           # Page-level layout only
├── server.js           # Express server with API endpoints
├── prompts.json        # Data source (writable via API)
└── web-components.js   # Local design system bundle
```

### Design System Components (from m3-design-v2)

All UI components are Web Components built with Lit 3.x:

- `wy-prompt-editor` - Main multi-step editor
- `wy-image-upload` - Drag-drop image upload
- `wy-icon-picker` - Material Symbols icon selector
- `wy-variable-editor` - Variable list management
- `wy-code-textarea` - Template editor with variable insertion
- `wy-toggle-field` - Toggle with label/description
- `wy-form-field` - Input wrapper (existing)
- `wy-dropdown` - Category selector (existing)
- `wy-modal` - Confirmation dialogs (existing)
- `wy-toast` - Save/error notifications (existing)

**Important:** Design system components are imported locally (`./web-components.js`) with cache-busting for save fix. Not using CDN for admin interface.

---

## Data Model

### Prompt Schema (prompts.json)

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
  "archived": false,             // Hidden from public site when true

  "variables": [
    {
      "name": "variable_slug",
      "label": "Display Label",
      "placeholder": "Help text",
      "value": "",
      "inputType": "toggle",     // Optional: "toggle" or "text"
      "options": ["", "value"],  // For toggle: off/on values
      "dependsOn": "other_var",  // Optional: conditional visibility
      "hideWhen": "value"        // Optional: value that hides this variable
    }
  ],

  "variations": [                // Alternative versions (read-only in v1)
    {
      "id": "variation-id",
      "name": "Style Name",
      "template": "Alternative template"
    }
  ],
  
  "template": "Text with {{variable}} substitution"
}
```

**Important:** JSON is flat array format, not wrapped in `{"prompts": [...]}`.

---

## Web Component APIs

### wy-prompt-editor

Main multi-step editor with 5 sections: Basic Info, Visuals, Variables, Template, Visibility.

**Properties:**
- `prompt` (Object) - Prompt data to edit
- `categories` (Array) - Available categories for dropdown
- `icons` (Array) - Available icons for picker

**Events:**
- `save` → `{ prompt: Object }` - Save button clicked
- `cancel` → `{}` - Discard button clicked
- `image-upload` → `{ file: File, promptId: string }` - Image selected
- `image-remove` → `{ promptId: string }` - Image removed

**Usage:**
```javascript
editor.prompt = promptData;
editor.categories = ['Creativity', 'Productivity', ...];
editor.addEventListener('save', async (e) => {
  await fetch(`/api/prompts/${e.detail.prompt.id}`, {
    method: 'PUT',
    body: JSON.stringify(e.detail.prompt)
  });
});
```

### Supporting Components

| Component | Purpose | Key Properties | Key Events |
|-----------|---------|----------------|------------|
| `wy-toggle-field` | Toggle with label/description | `checked`, `label`, `description` | `change` |
| `wy-image-upload` | Drag-drop image upload | `value`, `label`, `accept` | `change`, `remove`, `error` |
| `wy-icon-picker` | Material Symbols grid selector | `value`, `icons`, `columns` | `change` |
| `wy-variable-editor` | Variable list manager | `variables`, `allow-reorder` | `change` |
| `wy-code-textarea` | Template editor with chip insertion | `value`, `variables`, `rows` | `input`, `change` |
| `wy-form-field` | Input wrapper | `label`, `disabled` | - |
| `wy-dropdown` | Category selector | `value`, `options` | `change` |
| `wy-toast` | Notifications | `message`, `type` | - |

---

## Server API (server.js)

### Starting the Server

```bash
node server.js  # Starts on http://localhost:3000
```

**Dependencies:** express, multer, cors (see package.json)

### API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `GET` | `/api/prompts` | Get all prompts + categories | - | `{ prompts: [...], categories: [...] }` |
| `GET` | `/api/prompts/:id` | Get single prompt | - | `{ prompt: {...} }` |
| `PUT` | `/api/prompts/:id` | Update prompt | Full prompt object | `{ success: true, prompt: {...} }` |
| `POST` | `/api/prompts/:id/archive` | Toggle archive status | - | `{ success: true, archived: boolean }` |
| `POST` | `/api/images/upload` | Upload image (multipart) | `file` field | `{ success: true, path: "public/images/..." }` |
| `DELETE` | `/api/images/:filename` | Delete image | - | `{ success: true }` |

**Image Storage:** Files saved to `public/images/` with timestamp filenames.

**Data Persistence:** All changes write to `prompts.json` immediately (not in-memory).

---

## Admin Page Structure

### admin.html

```html
<body class="admin-page">
  <!-- Left: Prompt List Sidebar -->
  <aside id="prompt-list" class="prompt-list">
    <div class="sidebar-header">
      <h2>Prompts</h2>
      <a href="/index.html" target="_blank">View Public Site</a>
    </div>
    <div id="prompt-list-items"><!-- Populated by JS --></div>
  </aside>

  <!-- Right: Editor or Empty State -->
  <main id="main-content">
    <div id="editor-container">
      <wy-prompt-editor id="editor"></wy-prompt-editor>
    </div>
    <div id="empty-state" class="empty-state">
      <h3>Select a prompt to edit</h3>
    </div>
  </main>

  <!-- Toast Notifications -->
  <wy-toast id="toast"></wy-toast>

  <!-- Import Local Web Components (with save fix) -->
  <script type="module">
    import './web-components.js?v=20260203-save-fix';
  </script>
  <script type="module" src="admin.js"></script>
</body>
```

### admin.js Key Functions

```javascript
// State
let prompts = [];
let categories = [];
let currentPromptId = null;

// Core Functions
async function loadPrompts() {
  const { prompts, categories } = await fetch('/api/prompts').then(r => r.json());
  // Store in module state
}

function loadPrompt(id) {
  const prompt = prompts.find(p => p.id === id);
  editor.prompt = prompt;
  editor.categories = categories;
  window.location.hash = id;
  hideEmptyState();
}

function renderPromptList() {
  // Render sidebar items with active/archived states
  // Attach click handlers to load prompts
}

// Event Handlers
editor.addEventListener('save', async (e) => {
  await fetch(`/api/prompts/${e.detail.prompt.id}`, {
    method: 'PUT',
    body: JSON.stringify(e.detail.prompt)
  });
  showToast('Prompt saved successfully');
  await loadPrompts();
  renderPromptList();
});

editor.addEventListener('image-upload', async (e) => {
  const formData = new FormData();
  formData.append('file', e.detail.file);
  const { path } = await fetch('/api/images/upload', {
    method: 'POST',
    body: formData
  }).then(r => r.json());
  
  editor.prompt = { ...editor.prompt, image: path };
});
```

### Layout (admin.css)

```css
.admin-page {
  display: grid;
  grid-template-columns: 280px 1fr;  /* Sidebar + main */
  min-height: 100vh;
}

#prompt-list {
  background: var(--md-sys-color-surface);
  border-right: 1px solid var(--md-sys-color-outline-variant);
  overflow-y: auto;
}

.prompt-item {
  /* Hover states, active state, archived styling */
}

#empty-state {
  /* Centered message when no prompt selected */
}
```

---

## Public Site Integration

### Archive Filtering (app.js)

Archived prompts are hidden from public site:

```javascript
// In PromptLibrary class
async loadPrompts() {
  const response = await fetch('prompts.json');
  const allPrompts = await response.json();
  
  // Filter out archived prompts
  this.prompts = allPrompts.filter(p => !p.archived);
  this.filteredPrompts = this.prompts;
  this.renderPrompts();
}
```

**Important:** Archive status only affects public site visibility. Prompts remain in `prompts.json` and are visible/editable in admin interface.

---

## Workflow

### Making Changes

1. Start server: `node server.js`
2. Open admin: http://localhost:3000/admin
3. Select prompt from sidebar
4. Edit in multi-step form
5. Click "Save Changes"
6. Changes written to `prompts.json` immediately

### Publishing to Production

```bash
git add prompts.json public/images/
git commit -m "Update prompts

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

Vercel auto-deploys on push to `main`.

### Reverting Changes

**Before committing:**
```bash
git checkout -- prompts.json public/images/
```

**After committing:**
```bash
git revert HEAD  # Creates new commit undoing changes
git push origin main
```

---

## Implementation Status

**✅ Completed** - All features implemented and tested.

### Features Delivered

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-step editor (`wy-prompt-editor`) | ✅ | 5 sections: Basic Info, Visuals, Variables, Template, Visibility |
| Image upload/delete | ✅ | Drag-drop with preview, removes old file on update |
| Icon picker | ✅ | Material Symbols grid selector |
| Variable editor | ✅ | Add/remove/reorder with conditional visibility support |
| Template editor | ✅ | Variable chip insertion, character count |
| Archive toggle | ✅ | Hides prompts from public site |
| Server API | ✅ | Express with 6 endpoints |
| Admin interface | ✅ | Sidebar navigation, empty state, toast notifications |
| Public site filtering | ✅ | Archived prompts excluded from index |
| Save fix | ✅ | Local web-components bundle with multi-step form submission fix |

### Known Limitations

- **Variation editing:** Read-only in current version (prompts with variations can be edited, but variations themselves cannot be added/removed/edited)
- **Add/Delete prompts:** Use JSON editing for now (archive for soft-delete)
- **Drag reordering:** Variables can be added/removed but not reordered (would require drag-drop implementation)

### Testing Checklist

When modifying admin system, verify:

- [ ] `node server.js` starts on port 3000
- [ ] `/admin` loads with prompt list
- [ ] Click prompt → editor loads with all 5 sections
- [ ] Edit fields → Save → `prompts.json` updated
- [ ] Upload image → file in `public/images/`, path saved
- [ ] Toggle archive → prompt hidden from index.html
- [ ] Cancel → reloads original data
- [ ] Toast notifications show for save/error states
- [ ] Browser back/forward navigation works with URL hash

---

## Troubleshooting

### Web Components Not Loading

**Symptom:** Editor doesn't appear, console shows undefined custom elements.

**Fix:** Check `admin.html` imports local `web-components.js` with save fix:
```html
<script type="module">
  import './web-components.js?v=20260203-save-fix';
</script>
```

### Save Button Not Working

**Symptom:** Click save, nothing happens.

**Fix:** Multi-step form needs save fix. Verify using local bundle (not CDN).

### Images Not Uploading

**Symptom:** Upload fails with 404 or 500 error.

**Fix:** Ensure `public/images/` directory exists and server has write permissions.

### Archived Prompts Still Visible on Public Site

**Symptom:** Archive toggle works in admin but prompt still shows on index.html.

**Fix:** Verify `app.js` filters archived prompts:
```javascript
this.prompts = allPrompts.filter(p => !p.archived);
```

---

## Design System Source

All Web Components are built with **Lit 3.x** and sourced from **m3-design-v2** repository.

**Local Build:** This project uses a local copy (`web-components.js`) with save fix applied. Do not switch to CDN import without verifying multi-step form submission works.

**For Updates:** See `m3-design-v2/CLAUDE.md` for component development patterns and commit workflow.
