# Admin System

Local-only admin interface for editing prompts visually. Public changes save to `prompts.json`. Private changes save to `private-prompts.source.json` and refresh `private-prompts.enc.json` when a passcode is configured.

**Access:** `node server.js` then open http://localhost:3001/admin.html

## Architecture

```
admin.html          # Page shell
admin.js            # Orchestration (state, event handlers, sidebar)
admin.css           # Layout (280px sidebar + main grid)
server.js           # Express server with API endpoints
components/ui/      # Local Web Component source
web-components.js   # Generated local Web Component bundle
private-prompts.source.json  # Local plaintext private prompts (gitignored)
private-prompts.enc.json     # Deployed encrypted private vault payload
private-passcode.txt         # Local passcode file used for vault encryption (gitignored)
```

### Web Components (local, Lit 3.x)

| Component | Purpose |
|-----------|---------|
| `wy-prompt-editor` | Main editor (5 sections: Basic Info, Visuals, Variables, Template, Visibility) |
| `wy-image-upload` | Drag-drop image upload with preview |
| `wy-variable-editor` | Variable list CRUD with conditional visibility |
| `wy-code-textarea` | Template editor with variable chip insertion |
| `wy-step-editor` | Multi-step prompt step cards with reordering |
| `wy-option-toggle` | Toggle with label/description |
| `wy-form-field` | Input wrapper |
| `wy-dropdown` | Category selector |
| `wy-toast` | Notifications |

## Server API

**Dependencies:** express, multer, cors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/prompts?dataset=public\|private` | All prompts + categories for the selected dataset |
| `GET` | `/api/prompts/:id?dataset=public\|private` | Single prompt |
| `POST` | `/api/prompts?dataset=public\|private` | Create a new prompt shell |
| `PUT` | `/api/prompts/:id?dataset=public\|private` | Update prompt (full object) |
| `POST` | `/api/prompts/:id/archive?dataset=public\|private` | Toggle archive status |
| `POST` | `/api/images/upload` | Upload image (multipart `file` field) |
| `DELETE` | `/api/images/:filename` | Delete image |

Images save to `public/images/` with timestamp filenames. Public edits write to `prompts.json` immediately. Private edits write to `private-prompts.source.json`, then also regenerate `private-prompts.enc.json` if `PRIVATE_PROMPTS_PASSPHRASE` or `private-passcode.txt` is available.

## wy-prompt-editor API

**Properties:** `prompt` (Object), `categories` (Array), `icons` (Array)

**Events:**
- `save` -> `{ prompt }` - Save clicked
- `cancel` -> `{}` - Discard clicked
- `image-upload` -> `{ file, promptId }` - Image selected
- `image-remove` -> `{ promptId }` - Image removed

## Workflow

1. Start server: `node server.js`
2. Open http://localhost:3001/admin.html
3. Choose `Public` or `Private` in the sidebar
4. Select a prompt from sidebar, or click `New Prompt`
5. Edit -> Save
6. Deploy the changed files:
   Public: `prompts.json` and any images
   Private: `private-prompts.enc.json` and any images if used

**Archive:** Toggling archive hides prompts from public site (`app.js` filters `!p.archived`). Prompts remain in JSON and admin.

## Passcode Rotation

To change the private vault passcode:

1. Update `private-passcode.txt` locally, or set a new `PRIVATE_PROMPTS_PASSPHRASE`.
2. Run `npm run encrypt:private`.
3. Restart `node server.js` if the admin is already running.
4. Deploy the updated `private-prompts.enc.json`.

Changing the passcode does not modify prompt content. It only re-encrypts the existing private source file.

## Known Limitations

- **Add/Delete prompts:** Use JSON editing (archive for soft-delete)
- **Variable reordering:** Add/remove supported, not drag reorder

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Editor doesn't appear | Check `admin.html` imports local `web-components.js?v=...` and run `npm run build:components` if component source changed |
| Save does nothing | Verify the generated local bundle is current |
| Private save warns that vault was not updated | Add `private-passcode.txt` or `PRIVATE_PROMPTS_PASSPHRASE`, then save again or run `npm run encrypt:private` |
| Image upload fails | Ensure `public/images/` directory exists |
| Archived prompt still visible | Verify `app.js` has `filter(p => !p.archived)` |

## Component Source

Components are maintained in `components/ui/` and bundled into `web-components.js` with `npm run build:components`. Public/private pages load the bundle through `components/index.js`; admin imports the same local bundle directly. After changing component source, rebuild and verify modal registration plus multi-step form submission.
