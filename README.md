# Prompt Library

A vanilla JavaScript prompt management tool with zero dependencies and no build process. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

**Live:** https://oct-19-prompts-rebuild-nbpz1n873-weaver-yuwono.vercel.app
**Production:** https://p.weaver-yuwono.com

## Quick Start

```bash
# Public site (read-only)
python3 -m http.server 8000
open http://localhost:8000

# Admin interface (requires Node.js)
node server.js
open http://localhost:3000/admin
```

No build process required. Static file hosting needed for `fetch('prompts.json')` to work.

## Architecture

**Stack:** HTML/CSS/JS only. No frameworks, bundlers, or npm dependencies (public site).

**Design system:** Shared `m3-design-v2` via CDN (CSS tokens) and local bundle (Web Components via Lit 3.x).

```
/
├── index.html          # Public site
├── app.js              # PromptLibrary class
├── styles.css          # Public site styles
├── tokens.css          # Design system imports + local overrides
├── prompts.json        # Prompt data (flat array)
├── admin.html          # Admin interface
├── admin.js            # Admin orchestration
├── admin.css           # Admin layout
├── server.js           # Express server (admin API)
├── web-components.js   # Local design system bundle (DO NOT edit directly)
├── components/index.js # Component loader
└── public/images/      # Prompt thumbnails
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

## Design System

This project consumes the shared `m3-design-v2` design system. See [CLAUDE.md](CLAUDE.md) for detailed integration rules.

**Key rules:**
- All styling changes go in `m3-design-v2` unless app-specific
- Never edit `web-components.js` directly (it's a bundled copy)
- Never use `::part()` for structural layout
- Use design tokens, not hardcoded values

## Deployment

Auto-deploys to Vercel on push to `main`. For manual: `vercel --prod`.

## Documentation

| Document | Purpose |
|----------|---------|
| [CLAUDE.md](CLAUDE.md) | AI coding assistant instructions (design system rules, CSS standards) |
| [docs/admin-system-plan.md](docs/admin-system-plan.md) | Admin interface API and components |
| [docs/prompt-authoring.md](docs/prompt-authoring.md) | Guidelines for writing prompts |
| [docs/cdn-troubleshooting.md](docs/cdn-troubleshooting.md) | CDN cache management |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Documentation standards |
| [docs/ARCHIVE.md](docs/ARCHIVE.md) | Historical implementation notes |
| [skills/](skills/) | Agent Skills for AI-assisted development |
