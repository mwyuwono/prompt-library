# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript prompt management tool with a committed local Web Component bundle and no runtime build step. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

## Communication Preferences

**Be concise.** Short status updates over verbose summaries. No markdown documentation files unless explicitly requested.

### Documentation Hygiene

**Clean up temporary documentation at the end of exercises.**

- Delete plans, tests, and other temporary `.md` files when work is complete
- When marking a plan "done" or completing a test, remove the documentation created along the way
- Don't create detailed summaries upon completion unless they provide information not already in the code or elsewhere
- Resist the urge to document what the code already shows clearly

## Running the Application

**Public Site:**
```bash
python3 -m http.server 8000  # Then open http://localhost:8000
```

**Admin Interface:**
```bash
node server.js  # Then open http://localhost:3001/admin.html
```

No build process is required to run either mode. Admin requires Node.js server for API endpoints. Run `npm run build:components` only after editing `components/ui/`.

**Robert Brown Fabric Collection:**
```bash
cd rb-fabric-collection
npm run dev  # Then open http://127.0.0.1:5173/ and /admin
```

This is a separate React/Vite site deployed by its own Vercel project to https://rb.weaver-yuwono.com. Its local admin saves to `rb-fabric-collection/src/data/content.json` and uploaded images under `rb-fabric-collection/public/fabrics/`; commit and push those changes to publish. Production must not expose `/admin` or include admin bundle strings. The local macOS launcher lives at `rb-fabric-collection/Robert Brown Lookbook.app`; source is `rb-fabric-collection/launchers/Robert Brown Lookbook Launcher.applescript`.

## Local Design System

This project is now self-contained. The former shared design-system sources were snapshotted into this repository and are maintained here.

> **Repository override (supersedes global rules).** This repository does **not** consume an external design system (e.g. `m3-design-v2`). For this repo, this clause **supersedes** the global "Design System as the Default Execution Path" rule and the global shadow-DOM / `::part()` guidance. The admin editor is being migrated **away from shadow-DOM web components toward light DOM with plain CSS in `admin.css`** (see below), so design changes can be made directly without the bundle round-trip or shadow boundary. Treat `admin.css` edits to migrated components as the normal path, not a local-override exception.

### Admin Editor: Light-DOM Components

The admin prompt-editor component tree renders in **light DOM** (`createRenderRoot() { return this; }`) and its styles live in `admin.css`, **scoped by element tag** (e.g. `wy-prompt-editor .card { … }`, `wy-variation-editor .variation-card { … }`). This is safe because `admin.html` loads only `tokens.css` + `admin.css` (not `styles.css`), and these editor components are not used by the public/private pages.

- **Migrated (light DOM, styles in `admin.css`):** `wy-prompt-editor`, `wy-variation-editor`, `wy-step-editor`, `wy-variable-editor`, `wy-reference-image-editor`, `wy-image-upload`, `wy-dropdown`, `wy-option-toggle`, `wy-code-textarea`.
- **Still shadow DOM (deferred):** `wy-form-field` (uses a `<slot>`), plus all public/shared components (`wy-button`, `wy-modal`, `wy-prompt-modal`, `wy-toast`, `wy-controls-bar`, `wy-color-palette`, `wy-links-modal`, `wy-copy-confirm`, `wy-filter-chip`, `wy-tabs`, `wy-info-panel`) — do not migrate these.
- The generated editor styles in `admin.css` sit between the `=== BEGIN admin editor (light DOM migrated) — generated ===` / `=== END admin editor (light DOM migrated) ===` comment markers; component blocks are ordered parent-first so descendant tag-scoped rules win on specificity ties. The new variant-selector styles and the requested visual overrides follow the generated component blocks within the same region.
- **Editing CSS for a migrated component does NOT require `npm run build:components`** — edit `admin.css` directly. Only changes to component **markup or JS logic** require a rebuild.

### Canonical Style Guide

When the user says "my style guide", "the style guide", or "design system reference" in this repository, they mean `style-guide-v3.html`. Treat `style-guide.html` and `style-guide-v2.html` as deprecated redirect stubs only.

Use `style-guide-v3.html` as the single visual reference for tokens, typography, spacing, motion, app layout, public prompt components, and local `wy-*` web components. The Prompt Library logo asset is `public/images/prompts-logo.svg`; reuse that path for brand mark examples unless the user provides a different logo.

### Where to Make Style Changes

| Change Type | Where to Edit |
|-------------|---------------|
| Colors, typography, spacing, motion, state tokens | `tokens.css` |
| Base styles, utility classes, category colors | `tokens.css` |
| App layout (`.header-top`, `.controls-bar`) | `styles.css` |
| Public app components (`.prompt-card`, list rows, vault UI) | `styles.css` |
| Admin editor components (light-DOM `wy-*` in the editor tree) | `admin.css` (tag-scoped, e.g. `wy-prompt-editor .card`) |
| Shared/public web components still on shadow DOM (`wy-toast`, `wy-controls-bar`, modals, `wy-form-field`) | `components/ui/*.js` |

### Component Build Flow

The app still runs without a build step because `web-components.js` is committed. When editing files in `components/ui/`, regenerate that bundle before testing:

```bash
npm run build:components
```

`components/index.js` loads the committed local bundle for the public and private pages. `admin.html` imports the same local bundle directly.

**Light-DOM admin editor exception:** components in the admin editor tree render in light DOM with styles in `admin.css` (see "Admin Editor: Light-DOM Components"). Editing their **CSS** does not require a rebuild; only **markup/JS** changes to those components do.

### Bundle Completeness Check

Every `wy-*` tag used by `index.html`, `private.html`, `admin.html`, or their scripts must be registered from `components/ui/index.js`. When adding or removing components, update `components/ui/index.js`, run `npm run build:components`, and verify `customElements.get('wy-component-name')` resolves in the browser.

### Styling Rules

- Prefer the canonical tokens already defined in `tokens.css`: `--paper`, `--paper-deep`, `--paper-edge`, `--ink`, `--ink-mute`, `--ink-soft`, `--white`, `--ok`, and `--err`.
- Legacy `--md-sys-*` aliases still resolve and are used by existing components for compatibility.
- Local app-specific layout custom properties are appropriate in `styles.css`.
- For **migrated admin editor components** (light DOM), edit styles directly in `admin.css` using tag-scoped selectors. For **components still on shadow DOM**, avoid `::part()` for structural layout — prefer component custom properties or edit the component source in `components/ui/`.
- When a user identifies a specific Admin UI polish issue, audit sibling controls and repeated component patterns for the same issue before implementing. Apply the fix consistently across similar instances unless the user explicitly scopes the request to one element. Examples: button radius, field surface color, spacing rhythm, menu shadows, and typography hierarchy.
- Dark mode is not supported. Do not add `prefers-color-scheme: dark` blocks.

### External Assets

Google Fonts and Material Symbols are still loaded externally. Treat those as font assets, not as the removed shared design system. If offline-capable styling becomes a goal, vendor or replace fonts in a separate pass.

## Architecture Overview

### Core Principles

1. **Vanilla JavaScript runtime** - Static pages plus a committed local Web Component bundle
2. **Session-only edits** - Template modifications don't persist across page reloads
3. **Single-user context** - No authentication, database, or server-side logic
4. **Local design system first** - Use `tokens.css` and `components/ui/`; avoid scattered overrides

### File Structure

```
/
├── index.html       # Public site (read-only)
├── app.js           # Public site logic (PromptLibrary class)
├── admin.html       # Admin interface (editable)
├── admin.js         # Admin orchestration logic
├── admin.css        # Admin page layout + light-DOM editor component styles (tag-scoped)
├── server.js        # Express server with API endpoints
├── tokens.css       # Local tokens, base styles, and compatibility mappings
├── styles.css       # Public site component styles
├── prompts.json     # Prompt data source (writable via admin API)
├── components/ui/   # Local Web Component source
├── web-components.js # Generated local Web Component bundle
└── rb-fabric-collection/ # Separate Vite site for rb.weaver-yuwono.com
```

### State Management

The `PromptLibrary` class maintains:
- `prompts` / `filteredPrompts` - Data and filtered view
- `selectedCategory` / `searchTerm` - Active filters
- `currentView` - 'list' or 'grid' (default: 'list')
- `showDetails` - Description visibility (default: false)

Each prompt object has runtime properties: `locked`, `activeTab`, `activeVariationId`, `variables[].value`

## Data Structure

### prompts.json Schema

```json
[
    {
        "id": "unique-id",
        "title": "Prompt Title",
        "description": "Brief description",
        "category": "Category Name",
        "template": "Template with {{variable}} placeholders",
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
]
```

**Important**: JSON is a flat array, not wrapped in `{"prompts": [...]}`.

### Prompt Variations

Prompts can include multiple template variations:

```json
{
    "id": "my-prompt",
    "variations": [
        { "id": "style-a", "name": "Style A", "template": "..." },
        { "id": "style-b", "name": "Style B", "template": "..." }
    ],
    "variables": [...]
}
```

First variation is default. User input preserved when switching. Variables shared across variations.

### Prompt Preview Images

Multi-variant prompt previews have two levels: the prompt-level `image` is the hero/card image, while each `variations[].image` is used for that variant's visual preview.

When generating or refreshing preview images, existing generated previews may be visually 16:9 but not exact. Normalize final project copies to exact `1920x1080` before final validation.

### Variable Types

**Supported:**
- Default text input (omit `inputType`)
- `inputType: "textarea"` with optional `rows`
- `inputType: "toggle"` with `options: ["OFF text", "ON text"]`
- Conditional visibility: `dependsOn` + `hideWhen`

**NOT supported** (will break): `select`, `checkbox`, `radio`

## CSS Quality Standards

**Local Tokens First:**
- Check `tokens.css` before adding new CSS variables
- Prefer canonical tokens like `--paper`, `--ink`, and `--s-*` for new styles
- Keep reusable component styling in `components/ui/`, not page-level overrides

**Rules:**
- **NEVER use `!important`** - resolve specificity conflicts properly
- **NEVER hardcode colors** - always use CSS variables
- **NEVER change background on hover directly** - use pseudo-element overlays with state opacity
- **Always use motion tokens** for durations/easing, not magic numbers like `0.2s`

**Accessibility:**
- All interactive elements need `:focus-visible` states
- Ensure WCAG AA color contrast minimum

## Git Workflow

Auto-deploys to Vercel on push to `main`.


## Admin System

This project includes a local-only admin interface for editing prompts visually.

**Documentation:** [docs/admin-system-plan.md](docs/admin-system-plan.md)

**Quick Start:**
1. Start server: `node server.js`
2. Open: http://localhost:3001/admin.html
3. Select prompt from sidebar
4. Edit in multi-step form
5. Save changes → updates `prompts.json`
6. Commit and push to publish

**Key Features:**
- Multi-step editor (Basic Info, Visuals, Variables, Template, Visibility)
- Image upload/delete with drag-drop
- Material Symbols icon picker
- Variable editor with conditional visibility
- Archive toggle (hides from public site)
- Live preview panel

**Architecture:**
- Local Web Components from `components/ui/` bundled into `web-components.js`
- Express server with 6 API endpoints
- Sidebar navigation with URL hash routing
- Changes write to `prompts.json` immediately

See [docs/admin-system-plan.md](docs/admin-system-plan.md) for complete API reference, component details, and troubleshooting.

## See Also

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview, architecture, data model |
| [docs/admin-system-plan.md](docs/admin-system-plan.md) | Admin API reference and components |
| [docs/prompt-authoring.md](docs/prompt-authoring.md) | Prompt writing guidelines |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Documentation standards |
| [docs/ARCHIVE.md](docs/ARCHIVE.md) | Historical implementation notes |
| [skills/visual-qa/SKILL.md](skills/visual-qa/SKILL.md) | Screenshot testing after CSS changes |

**Repository:** https://github.com/mwyuwono/prompt-library
**Live Site:** https://p.weaver-yuwono.com

## Known Issues

_No known issues at this time._
