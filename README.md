# Prompt Library

A vanilla JavaScript prompt management tool with a committed local Web Component bundle and no runtime build step. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

**Live:** https://oct-19-prompts-rebuild-nbpz1n873-weaver-yuwono.vercel.app
**Production:** https://p.weaver-yuwono.com

## Quick Start

```bash
# Public site (read-only)
python3 -m http.server 8000
open http://localhost:8000

# Admin interface (requires Node.js)
node server.js
open http://localhost:3001/admin.html
```

No build process required to run the app. Static file hosting needed for `fetch('prompts.json')` to work.

## Architecture

**Stack:** HTML/CSS/JS runtime with a committed local Web Component bundle.

**Design system:** Self-contained local tokens and Web Components. Source lives in `tokens.css` and `components/ui/`; the generated browser bundle is committed as `web-components.js`.

```
/
├── index.html          # Public site
├── app.js              # PromptLibrary class
├── styles.css          # Public site styles
├── tokens.css          # Local tokens, base styles, compatibility mappings
├── prompts.json        # Prompt data (flat array)
├── admin.html          # Admin interface
├── admin.js            # Admin orchestration
├── admin.css           # Admin layout
├── server.js           # Express server (admin API)
├── components/ui/      # Local Web Component source
├── web-components.js   # Generated local Web Component bundle
├── components/index.js # Public/private component loader
├── public/images/      # Prompt thumbnails
└── rb-fabric-collection/ # Separate Vite site for rb.weaver-yuwono.com
```

## Data Model

`prompts.json` is a flat JSON array (not wrapped in `{"prompts": [...]}`).

```json
{
  "id": "unique-slug",
  "title": "Display Name",
  "description": "Brief description",
  "category": "Productivity",
  "icon": "material_icon_name",
  "template": "Text with {{variable}} placeholders",
  "variables": [
    {
      "name": "variable",
      "label": "Display Label",
      "placeholder": "Example value",
      "value": "",
      "inputType": "textarea",
      "rows": 8
    }
  ]
}
```

### Variable Types

| Type | Config | Notes |
|------|--------|-------|
| Text (default) | Omit `inputType` | Single-line input |
| Textarea | `"inputType": "textarea"`, optional `"rows"` | Multi-line, auto-resize |
| Toggle | `"inputType": "toggle"`, `"options": ["OFF", "ON"]` | Binary choice |

Conditional visibility: `"dependsOn": "other_var"` + `"hideWhen": "value"`

**Not supported:** `select`, `checkbox`, `radio`

### Prompt Variations

Prompts can include multiple template styles via a `variations` array. Variables are shared across variations. First variation is the default.

### Multi-Step Prompts

Prompts can be multi-step workflows via a `steps` array. Each step has its own `template`, `variables`, `instructions`, and `name`.

## Key Features

- **Two views:** List (default, grouped by category) and Grid (300px cards)
- **Search:** Filters by title, description, category, template content
- **Category chips:** Single-select filtering
- **Modal:** Spring animation open, blur backdrop, Variables/Preview tabs
- **Variable substitution:** `{{variable}}` replaced in real-time preview
- **Copy/Download:** Compiled prompt with usage tracking via localStorage
- **Admin:** Multi-step editor with image upload, icon picker, archive toggle

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Focus search |
| `Cmd/Ctrl+/` | Toggle keyboard reference |
| `Escape` | Close dialogs / clear search |

## Admin System

See [docs/admin-system-plan.md](docs/admin-system-plan.md) for API reference, component details, and troubleshooting.

**Workflow:** Edit in admin -> Save -> Changes written to `prompts.json` -> Commit and push to deploy via Vercel.

## Private Prompt Vault

Private prompts can live in a separate encrypted payload for casual hiding.

- Public prompts stay in `prompts.json`.
- Private prompts should be stored locally in `private-prompts.source.json` (gitignored).
- The private vault UI is served from `private.html`.
- Admin can edit either dataset from `/admin.html` using the `Public` / `Private` switch.
- Only `private-prompts.enc.json` is deployed; the plaintext source file is not.

Generate or refresh the encrypted file with:

```bash
cp private-prompts.source.example.json private-prompts.source.json
echo 'your-passcode' > private-passcode.txt
npm run encrypt:private
```

To change the private passcode later:

```bash
echo 'your-new-passcode' > private-passcode.txt
npm run encrypt:private
```

That re-encrypts the current `private-prompts.source.json` with the new passcode. After that, restart `node server.js` if the admin is already running, then redeploy so the updated `private-prompts.enc.json` is published.

Deploy workflow:
- Public edits: deploy `prompts.json`; prompt preview artwork stays in `public/images/`
- Prompt execution reference images should use the public S3 bucket under `https://prompt-library-assets-009019643313.s3.amazonaws.com/reference-images/`
- Private edits: deploy `private-prompts.enc.json`

## Local Design System

This project owns its component and styling system locally. See [CLAUDE.md](CLAUDE.md) for detailed integration rules.

**Key rules:**
- Edit tokens and base utilities in `tokens.css`
- Edit shared/public component CSS in `components.css`
- Edit admin editor component CSS in `admin.css`
- Edit Web Component markup or logic in `components/ui/`, then run `npm run build:components`
- Use local design tokens, not hardcoded values

## Deployment

Auto-deploys to Vercel on push to `main`. For manual: `vercel --prod`.

## Robert Brown Fabric Collection

`rb-fabric-collection/` is a separate React/Vite site in this repo, deployed by its own Vercel project to https://rb.weaver-yuwono.com. The project root in Vercel is `rb-fabric-collection`, not the repo root.

Local workflow:

```bash
cd rb-fabric-collection
npm run dev
open http://127.0.0.1:5173/
open http://127.0.0.1:5173/admin
```

The fabric admin is local-only. It loads/saves checked-in content through the Vite dev-server API: `src/data/content.json` for text/visibility and `public/fabrics/` for images. After editing, click **Save**, then commit and push to publish. Production blocks `/admin`, and the production bundle should not contain admin code.

There is also a local macOS launcher at `rb-fabric-collection/Robert Brown Lookbook.app` with editable source in `rb-fabric-collection/launchers/Robert Brown Lookbook Launcher.applescript`. The launcher scans ports `5173-5180` for the RB dev server and opens both public/admin pages.

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI coding assistant instructions (local design system rules, CSS standards) |
| [docs/admin-system-plan.md](docs/admin-system-plan.md) | Admin interface API and components |
| [docs/prompt-authoring.md](docs/prompt-authoring.md) | Guidelines for writing prompts |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Documentation standards |
| [docs/backlog.md](docs/backlog.md) | Short list of known follow-up tasks |
| [skills/](skills/) | Agent Skills for AI-assisted development |
