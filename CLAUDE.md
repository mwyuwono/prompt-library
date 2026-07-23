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
- Prefer deleting completed migration plans, handoff docs, one-off test scripts, and temporary audit reports instead of archiving them in the repo
- Historical context should live in git history unless it is needed to operate the current system

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

**Quick Text:** a separate self-contained subproject at `quick-text/` — a SwiftUI Mac phrase launcher plus a buildless web component, sharing a corpus under `quick-text/corpus/`. It is not part of the main Prompt Library app or its design system. Before working in `quick-text/`, read `quick-text/README.md` (architecture, glossary, feature docs including the macOS Text Replacement sync mechanism) and `quick-text/docs/text-replacement-sync-plan.md` (that feature's design doc, kept current with known gotchas like private-API read-domain requirements and a same-process `UserDefaults` verify-after-write staleness issue). See also `npm run quicktext:validate` / `npm run quicktext:export-public`.

## Local Design System

This project is now self-contained. The former shared design-system sources were snapshotted into this repository and are maintained here.

> **Repository override (supersedes global rules).** This repository does **not** consume a shared external design-system repo. The local `wy-*` components render in light DOM with tag-scoped CSS in either `components.css` (shared/public components) or `admin.css` (admin editor components), so design changes should be made directly in the appropriate local stylesheet.

Do not reintroduce external design-system packages, source paths, or migration docs. `web-components.js` is a committed generated bundle; `web-components.js.map` is ignored.

### Light-DOM Components

The local Web Components render in **light DOM** (`createRenderRoot() { return this; }`) and their styles live in plain CSS, **scoped by element tag**.

- **Shared/public components (light DOM, styles in `components.css`):** `wy-button`, `wy-modal`, `wy-prompt-modal`, `wy-toast`, `wy-controls-bar`, `wy-color-palette`, `wy-links-modal`, `wy-copy-confirm`, `wy-filter-chip`, `wy-tabs`, `wy-info-panel`.
- **Admin editor components (light DOM, styles in `admin.css`):** `wy-prompt-editor`, `wy-variation-editor`, `wy-step-editor`, `wy-variable-editor`, `wy-reference-image-editor`, `wy-image-upload`, `wy-dropdown`, `wy-option-toggle`, `wy-code-textarea`. Former `wy-form-field` usages are now inlined in the admin editor parents as `.form-field` markup.
- `index.html`, `private.html`, and `admin.html` load `tokens.css`, then `components.css`, then their page stylesheet. This lets shared component defaults land before page-level layout/polish.
- The editor styles in `admin.css` sit between the `=== BEGIN admin editor (light DOM migrated) ===` / `=== END admin editor (light DOM migrated) ===` comment markers; component blocks are ordered parent-first so descendant tag-scoped rules win on specificity ties.
- **Editing CSS for a light-DOM component does NOT require `npm run build:components`** — edit `components.css` or `admin.css` directly. Only changes to component **markup or JS logic** require a rebuild.

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
| Shared/public light-DOM `wy-*` components | `components.css` (tag-scoped, e.g. `wy-toast .toast-container`) |
| Admin editor components (light-DOM `wy-*` in the editor tree) | `admin.css` (tag-scoped, e.g. `wy-prompt-editor .card`) |

### Component Build Flow

The app still runs without a build step because `web-components.js` is committed. When editing files in `components/ui/`, regenerate that bundle before testing:

```bash
npm run build:components
```

`components/index.js` loads the committed local bundle for the public and private pages. `admin.html` imports the same local bundle directly.

**Light-DOM component exception:** local `wy-*` CSS lives in `components.css` or `admin.css` (see "Light-DOM Components"). Editing component **CSS** does not require a rebuild; only **markup/JS** changes to those components do.

### Bundle Completeness Check

Every `wy-*` tag used by `index.html`, `private.html`, `admin.html`, or their scripts must be registered from `components/ui/index.js`. When adding or removing components, update `components/ui/index.js`, run `npm run build:components`, and verify `customElements.get('wy-component-name')` resolves in the browser.

### Prompt Validation

Use `node validate-prompts.js` or `npm run validate:prompts` to validate `prompts.json`. The validator does not require a backup file and should remain aligned with current prompt features: prompt-level variables, variation-level variables, step-level variables, `referenceImages`, and literal `{{...}}` examples inside prompt text.

Warnings for literal placeholder examples are acceptable when the placeholder is intentionally instructional text rather than a runtime variable.

### Styling Rules

- Prefer the canonical tokens already defined in `tokens.css`: `--paper`, `--paper-deep`, `--paper-edge`, `--ink`, `--ink-mute`, `--ink-soft`, `--white`, `--ok`, and `--err`.
- Local app-specific layout custom properties are appropriate in `styles.css`.
- For **light-DOM components**, edit styles directly in `components.css` or `admin.css` using tag-scoped selectors.
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
├── components.css   # Shared/public light-DOM web component styles (tag-scoped)
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

When a variation has a `description`, keep it to the unique differentiator of that variation only. Do not repeat the parent prompt's job, input requirements, or shared usage instructions. For example, use `18th Century Hand Colored Plan` instead of `Recreates an uploaded map, satellite view, or site-plan screenshot as...`.

### Recommended Models

Each prompt can carry a `recommendedModels` array that renders as small chips under the title in the prompt detail modal (`wy-prompt-modal`, "Recommended models" label). This tells the user which AI model to run the prompt with.

```json
{
    "recommendedModels": [
        { "vendor": "anthropic", "model": "Claude Sonnet 5", "level": "Light" },
        { "vendor": "openai", "model": "ChatGPT 5.5", "level": "Instant" },
        { "vendor": "google", "model": "Gemini 3.5 Flash", "level": "Medium" },
        { "vendor": "gemma", "model": "Gemma 4 12B", "level": "" }
    ]
}
```

**Rules:**
- `vendor` must be one of `anthropic`, `openai`, `google`, `gemma` (Gemma = local runner for lightweight/offline tasks).
- One entry per vendor maximum, so the array holds at most 4 entries.
- `level` is free-text and optional — use it for the vendor's thinking/reasoning/effort setting (e.g. "Light", "Instant", "Thinking", "High"). Omit or leave empty for models without a meaningful thinking-level toggle.
- Chips always render in the fixed order anthropic → openai → google → gemma, regardless of array order.
- Editable in the admin UI under Basic Information → Recommended Models. Leaving a vendor's model field blank omits that vendor's chip.
- Validated by `validate-prompts.js` (max 4 entries, valid vendor, no duplicate vendors, non-empty `model`).

**Selection logic is two steps, in order — a hard capability gate, then a soft difficulty tier. Never skip straight to tiering.**

1. **Capability gate (hard filter — drop vendors that structurally cannot do the task, don't just deprioritize them):**
   - **Image output required** (the prompt's deliverable is a generated/edited/restyled image, not a text description of one): only vendors whose consumer product actually outputs images are eligible. As of this writing that's `google` and `openai` only — drop `anthropic` and `gemma` entirely, since Claude has no image-generation capability and local Gemma is text/vision-input only. A prompt that merely *writes an image-generation prompt* for later use elsewhere (e.g. a "prompt builder"/"extractor" prompt) is text output, not image output — don't gate those.
   - **Live web search / URL fetching required** (the prompt needs current listings, prices, hours, availability, or to read an arbitrary URL): drop `gemma` — it's a local/offline runner with no default network access. Keep the other three, since their consumer chat products support browsing.
   - Check both gates independently; a prompt can trigger neither, either, or in principle both.
   - When a prompt has multiple variations with different output types, gate by the variation(s) that represent the prompt's primary stated purpose (its `description`), not by an edge-case variation.
2. **Difficulty tier (soft, within the vendors that survive the gate):** pick the model/level that matches the task's actual difficulty — not reflexively the most powerful model available. Favor a fast/cheap model when the task is simple, single-turn, or low-stakes (formatting, extraction, short lookups); reserve top-tier or frontier models for multi-step agentic work, code, precise/technical judgment, or open-ended creative work where quality clearly benefits from more capability. Judge each prompt's actual template and category before assigning — don't apply one tier to an entire category by default.

Do not attempt to rank vendors against each other by output *quality* (e.g. "Gemini is better than GPT at oil-painting style transfer") — that's a subjective, fast-moving claim this file can't keep verified. The gate + tier approach only ever claims "capable of the task" and "roughly the right amount of compute," which is a durable, checkable claim.

**Keeping the model reference current:** vendors release new models and rename thinking-level parameters often. When asked to update recommendations, first search the web for each vendor's current model lineup and thinking/effort/reasoning level names (don't rely on training knowledge — it goes stale). As of July 2026, the reference points were:

| Vendor | Models (fast → frontier) | Thinking/level options |
|---|---|---|
| Anthropic | Claude Haiku 4.5 → Claude Sonnet 5 → Claude Opus 4.8 → Claude Fable 5 | Low / Medium / High / X-High (Opus, Sonnet); Fable 5 has always-on adaptive thinking |
| OpenAI | ChatGPT 5.5 | Instant / Thinking / Pro |
| Google | Gemini 3.5 Flash → Gemini 3.1 Pro | Low / Medium / High (`thinking_level`); Pro is Google's strongest pure-reasoning tier |
| Gemma (local) | Gemma 4 E4B → Gemma 4 12B → Gemma 4 31B | n/a — pick by parameter size for the device/task |

Update this table (and the prompts' `recommendedModels`) whenever a new flagship ships or a vendor renames its thinking-level parameter, so future updates start from accurate information instead of this snapshot.

### Prompt Copy Rules

Keep every prompt `description` as short as possible while still making the prompt's purpose clear to users. Do not put usage instructions, setup steps, or prompt-level instructions in descriptions.

For multi-step prompts, the prompt or variation `description` should describe the entire workflow. Put the actionable instructions for each step in that step's `instructions` field. Do not duplicate the step workflow in prompt-level or variation-level `instructions`.

Format prompt and step instructions for readability. Use markdown lists for numbered or bulleted guidance instead of packing list-like instructions into one paragraph.

### Prompt Preview Images

Prompt preview artwork should be exact `1920x1080` images, which is a `16:9` landscape aspect ratio. The public grid/card UI renders prompt thumbnails in a 16:9 frame, so normalize generated preview images to exact dimensions before committing rather than relying on images that are only visually close to 16:9.

Multi-variant prompt previews have two levels: the prompt-level `image` is the hero/card image, while each `variations[].image` is used for that variant's visual preview.

When an image-generation prompt has multiple variants, save the shared base/reference image used to generate the variant previews in `public/images/` and record it on the prompt as `previewBaseImage`. Use the same saved base image for future variant preview images so the variant set shows standardized results. Add a short `previewBaseImageDescription` when the source or purpose would not be obvious from the filename.

Prompt execution reference images (`referenceImages[].path`) should live in the public S3 asset bucket under `https://prompt-library-assets-009019643313.s3.amazonaws.com/reference-images/`, not in Git. These URLs are substituted into copied prompts and fetched by the image clipboard action.

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
| [docs/backlog.md](docs/backlog.md) | Short list of known follow-up tasks |
| [skills/README.md](skills/README.md) | Available project skills |

**Repository:** https://github.com/mwyuwono/prompt-library
**Live Site:** https://p.weaver-yuwono.com

## Known Issues

_No known issues at this time._
