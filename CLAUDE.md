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

### Where to Make Style Changes

| Change Type | Where to Edit |
|-------------|---------------|
| Colors, typography, spacing, motion, state tokens | `tokens.css` |
| Base styles, utility classes, category colors | `tokens.css` |
| App layout (`.header-top`, `.controls-bar`) | `styles.css` |
| Public app components (`.prompt-card`, list rows, vault UI) | `styles.css` |
| Web Components (`wy-toast`, `wy-controls-bar`, admin editor, modals) | `components/ui/*.js` |

### Component Build Flow

The app still runs without a build step because `web-components.js` is committed. When editing files in `components/ui/`, regenerate that bundle before testing:

```bash
npm run build:components
```

`components/index.js` loads the committed local bundle for the public and private pages. `admin.html` imports the same local bundle directly.

### Bundle Completeness Check

Every `wy-*` tag used by `index.html`, `private.html`, `admin.html`, or their scripts must be registered from `components/ui/index.js`. When adding or removing components, update `components/ui/index.js`, run `npm run build:components`, and verify `customElements.get('wy-component-name')` resolves in the browser.

### Styling Rules

- Prefer the canonical tokens already defined in `tokens.css`: `--paper`, `--paper-deep`, `--paper-edge`, `--ink`, `--ink-mute`, `--ink-soft`, `--white`, `--ok`, and `--err`.
- Legacy `--md-sys-*` aliases still resolve and are used by existing components for compatibility.
- Local app-specific layout custom properties are appropriate in `styles.css`.
- Avoid `::part()` for structural layout. Prefer component custom properties or edit the component source in `components/ui/`.
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
├── admin.css        # Admin page layout
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
