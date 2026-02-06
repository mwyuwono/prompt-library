# Admin System

Local-only admin interface for editing prompts visually. Changes save to `prompts.json` and publish when committed to git.

**Access:** `node server.js` then open http://localhost:3000/admin

## Architecture

```
admin.html          # Page shell
admin.js            # Orchestration (state, event handlers, sidebar)
admin.css           # Layout (280px sidebar + main grid)
server.js           # Express server with API endpoints
web-components.js   # Local design system bundle (DO NOT use CDN for admin)
```

### Web Components (from m3-design-v2, Lit 3.x)

| Component | Purpose |
|-----------|---------|
| `wy-prompt-editor` | Main editor (5 sections: Basic Info, Visuals, Variables, Template, Visibility) |
| `wy-image-upload` | Drag-drop image upload with preview |
| `wy-icon-picker` | Material Symbols grid selector |
| `wy-variable-editor` | Variable list CRUD with conditional visibility |
| `wy-code-textarea` | Template editor with variable chip insertion |
| `wy-step-editor` | Multi-step prompt step cards with reordering |
| `wy-toggle-field` | Toggle with label/description |
| `wy-form-field` | Input wrapper |
| `wy-dropdown` | Category selector |
| `wy-toast` | Notifications |

## Server API

**Dependencies:** express, multer, cors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prompts` | All prompts + categories |
| `GET` | `/api/prompts/:id` | Single prompt |
| `PUT` | `/api/prompts/:id` | Update prompt (full object) |
| `POST` | `/api/prompts/:id/archive` | Toggle archive status |
| `POST` | `/api/images/upload` | Upload image (multipart `file` field) |
| `DELETE` | `/api/images/:filename` | Delete image |

Images saved to `public/images/` with timestamp filenames. All changes write to `prompts.json` immediately.

## wy-prompt-editor API

**Properties:** `prompt` (Object), `categories` (Array), `icons` (Array)

**Events:**
- `save` -> `{ prompt }` - Save clicked
- `cancel` -> `{}` - Discard clicked
- `image-upload` -> `{ file, promptId }` - Image selected
- `image-remove` -> `{ promptId }` - Image removed

## Workflow

1. Start server: `node server.js`
2. Open http://localhost:3000/admin
3. Select prompt from sidebar (URL hash routing)
4. Edit -> Save -> `prompts.json` updated immediately
5. `git add prompts.json public/images/ && git push` to deploy via Vercel

**Archive:** Toggling archive hides prompts from public site (`app.js` filters `!p.archived`). Prompts remain in JSON and admin.

## Known Limitations

- **Add/Delete prompts:** Use JSON editing (archive for soft-delete)
- **Variable reordering:** Add/remove supported, not drag reorder

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Editor doesn't appear | Check `admin.html` imports local `web-components.js` (not CDN) |
| Save does nothing | Verify using local bundle with save fix |
| Image upload fails | Ensure `public/images/` directory exists |
| Archived prompt still visible | Verify `app.js` has `filter(p => !p.archived)` |

## Design System Source

Components built with Lit 3.x from `m3-design-v2`. Admin uses local copy (`web-components.js`) with save fix. Do not switch to CDN without verifying multi-step form submission works.
