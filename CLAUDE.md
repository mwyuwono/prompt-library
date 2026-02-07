# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript prompt management tool with zero dependencies and no build process. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

## Running the Application

**Public Site:**
```bash
python3 -m http.server 8000  # Then open http://localhost:8000
```

**Admin Interface:**
```bash
node server.js  # Then open http://localhost:3000/admin
```

No build process required for either mode. Admin requires Node.js server for API endpoints.

## Design System Integration

**CRITICAL: This project uses a shared design system (m3-design-v2). Before making ANY styling changes, read this section.**

### Default Change Locus

**All component and styling changes must be made in the shared design system repo (`m3-design-v2`) so updates propagate to all consuming projects.**

- Do **not** implement local overrides unless explicitly requested
- If a local override is unavoidable, call it out and confirm before proceeding
- First verify whether a component is sourced from the design system and update it there

### Where to Make Style Changes

| Change Type | Where to Edit |
|-------------|---------------|
| Colors, typography, spacing, motion, state tokens | `m3-design-v2/src/styles/tokens.css` |
| Base styles, utility classes, category colors | `m3-design-v2/src/styles/main.css` |
| Web Components (`wy-toast`, `wy-controls-bar`, etc.) | `m3-design-v2/src/components/` |
| App layout (`.header-top`, `.controls-bar`) | `prompts-library/styles.css` |
| App components (`.prompt-card`, `.prompt-modal`) | `prompts-library/styles.css` |

### CRITICAL: Audit Local Overrides Before Design System Changes

**ALWAYS check for local token overrides before making design system changes.**

Token precedence chain (highest to lowest):
1. Consuming project `tokens.css` (this file)
2. Design system `m3-design-v2/src/styles/tokens.css`
3. Component defaults in `m3-design-v2/src/components/*.js`

**Before making design system changes, audit for overrides:**

```bash
# Check this project's tokens.css for component-specific overrides
grep -n "wy-filter-chip\|wy-controls\|wy-modal\|wy-button" tokens.css

# If found, determine if they should be:
# ✅ KEPT: App-specific theming (e.g., category colors)
# ❌ REMOVED: Workarounds for design system bugs (now fixed)
```

**Red flags (indicates local override should be removed):**
- Hardcoded colors (e.g., `#E8F5E9`) instead of tokens
- Comments like "Override for..." or "Fix for..."
- Values that contradict design system intent
- Duplicate tokens already in design system

**When local overrides ARE appropriate:**
- App-specific theming that shouldn't propagate to other projects
- Layout configuration (padding, max-width, gaps)
- Context-specific adjustments documented with rationale

**When local overrides are FORBIDDEN:**
- Colors, borders, shadows (use design system tokens)
- Component structural layout (use custom properties, not ::part())
- Workarounds for design system bugs (fix the design system instead)

### CRITICAL: Never Use ::part() for Structural Layout

**Using ::part() to override component structural layout is FORBIDDEN.**

If you find yourself writing `::part()` selectors for padding, gaps, max-width, or responsive behavior, **STOP IMMEDIATELY**. This indicates the design system component needs refactoring, not local overrides.

**Anti-Pattern (FORBIDDEN):**
```css
/* ❌ NEVER DO THIS */
.controls-bar::part(controls-container) {
    padding-left: 32px;          /* ❌ Structural layout override */
    gap: 16px;                   /* ❌ Structural layout override */
    max-width: none;             /* ❌ Structural layout override */
}
```

**Correct Approach:**
1. **Add CSS custom properties** to the component in `m3-design-v2`
2. **Set custom property values** in consuming project
3. **Never use ::part()** for layout

```css
/* ✅ CORRECT - Configure via custom properties */
.controls-bar {
    --wy-controls-padding-desktop: 32px;
    --wy-controls-container-gap: var(--spacing-md);
    --wy-controls-container-max-width: none;
}
```

**If you see ::part() overrides in this codebase:** They are legacy anti-patterns that should be refactored. Do not add more.

### CRITICAL: web-components.js is a Bundled Copy

**NEVER edit web-components.js directly in prompt-library.**

This file is a bundled copy from `m3-design-v2/dist/web-components.js`. Any direct edits will be overwritten the next time the design system is deployed.

**To fix web component bugs:**
1. Edit source components in `m3-design-v2/src/components/`
2. Run `m3-design-v2/scripts/deploy.sh "description"`
3. Changes automatically propagate to prompt-library and all consuming projects

**Exception:** Quick local testing only - but changes must be ported to design system source before pushing.

### CDN Import Details

**CSS tokens** (via `tokens.css`):
```css
/* Update ?v= timestamp after design system changes to force browser cache refresh */
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css?v=YYYYMMDD-HHMM');
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/main.css?v=YYYYMMDD-HHMM');
```

**Web Components** (via `components/index.js`):
```javascript
// Uses commit hash pinning for reliability (auto-updated by deploy.sh)
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@<commit>/dist/web-components.js';
```

### Import Policy

**Web components use commit hash pinning** (`@abc1234`) for reliability. The `m3-design-v2/scripts/deploy.sh` script automatically updates this hash after each deployment.

CSS tokens still use `@main` (less frequently updated, cache issues less critical).

### CDN Cache Issues

If design system changes don't appear, see [docs/cdn-troubleshooting.md](docs/cdn-troubleshooting.md) for purge commands and verification steps.

### CRITICAL: Cache-Busting for Design System Changes

**ALWAYS check and update cache-busting parameters in `tokens.css` after design system changes.**

When design system tokens or styles change in `m3-design-v2`:

1. **Update cache-busting parameters** in `tokens.css` (lines 14, 17):
   ```css
   @import url('...tokens.css?v=YYYYMMDD-HHMM');
   @import url('...main.css?v=YYYYMMDD-HHMM');
   ```

2. **Update to current timestamp** (e.g., `?v=20260203-2044`)

3. **Why this matters:**
   - Web components use commit hash pinning (auto-updated by deploy.sh)
   - CSS tokens use `@main` which is CDN-cached
   - Without cache-busting, browsers load stale CSS even after CDN purge
   - This causes wrong colors, borders, spacing despite correct component code

4. **Verification:**
   After updating cache-busting and hard refresh (Cmd+Shift+R), use `getComputedStyle()` to verify tokens resolve to correct values.

### Available Design Tokens

Prefer these over hardcoded values:
- **Colors**: `--md-sys-color-primary`, `--md-sys-color-background`, `--md-sys-color-surface-*`, `--md-sys-color-text-main`
- **Typography**: `--font-serif`, `--font-sans`, `--md-sys-typescale-*`
- **Spacing**: `--spacing-xxs` (2px) through `--spacing-3xl` (64px)
- **Shape**: `--md-sys-shape-corner-xs` through `--md-sys-shape-corner-full`
- **Motion**: `--md-sys-motion-duration-short1` through `long4`, `--md-sys-motion-easing-*`
- **State**: `--md-sys-state-hover-opacity`, `--md-sys-state-focus-opacity`
- **Category**: `--wy-color-productivity`, `--wy-color-expertise`, `--wy-color-travel`

## Architecture Overview

### Core Principles

1. **Vanilla JavaScript only** - No frameworks, no build tools, no npm dependencies
2. **Session-only edits** - Template modifications don't persist across page reloads
3. **Single-user context** - No authentication, database, or server-side logic
4. **Design system first** - Use shared tokens; avoid local overrides

### File Structure

```
/
├── index.html       # Public site (read-only)
├── app.js           # Public site logic (PromptLibrary class)
├── admin.html       # Admin interface (editable)
├── admin.js         # Admin orchestration logic
├── admin.css        # Admin page layout
├── server.js        # Express server with API endpoints
├── tokens.css       # Design system imports + legacy compatibility mappings
├── styles.css       # Public site component styles
├── prompts.json     # Prompt data source (writable via admin API)
└── web-components.js # Local design system bundle (with save fix)
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

**Design System First:**
- Check if design system provides what you need before adding CSS
- Prefer `--md-sys-*` tokens over legacy `--color-*` variables
- Add reusable tokens to design system, not locally

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

**CRITICAL CDN Cache Management:** After pushing changes to m3-design-v2, always wait 2-3 minutes before purging jsDelivr CDN (purges are throttled to max 10/hour per file), and if throttled, temporarily pin consuming projects to the commit hash (e.g., `@abc1234`) with a TODO to revert to `@main` within 24 hours, rather than repeatedly purging which will fail.

```bash
git add . && git commit -m "Description

Co-Authored-By: Claude <noreply@anthropic.com>" && git push
```

**One branch at a time**: Only one non-main branch should exist at any time. At the start of a conversation, check `git branch` and alert the user if more than one non-main branch exists so stale branches can be cleaned up before proceeding.

### Design System Deployment

**All design system changes should be deployed via the automated script in m3-design-v2:**

```bash
cd ../m3-design-v2
./scripts/deploy.sh "Description of changes"
./scripts/verify-deployment.sh
```

This automatically:
- Builds and commits design system changes
- Copies bundle to `prompt-library/web-components.js`
- Updates `admin.html` cache-busting parameter
- Updates `components/index.js` commit hash
- Commits prompt-library changes

**After deployment:** Push prompt-library changes and hard refresh browser (`Cmd+Shift+R`).

**Troubleshooting:** See [docs/cdn-troubleshooting.md](docs/cdn-troubleshooting.md)

## Admin System

This project includes a local-only admin interface for editing prompts visually.

**Documentation:** [docs/admin-system-plan.md](docs/admin-system-plan.md)

**Quick Start:**
1. Start server: `node server.js`
2. Open: http://localhost:3000/admin
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
- Web Components from m3-design-v2 (local bundle with save fix)
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
| [docs/cdn-troubleshooting.md](docs/cdn-troubleshooting.md) | CDN cache purging and verification |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Documentation standards |
| [docs/ARCHIVE.md](docs/ARCHIVE.md) | Historical implementation notes |
| [skills/visual-qa/SKILL.md](skills/visual-qa/SKILL.md) | Screenshot testing after CSS changes |

**Repository:** https://github.com/mwyuwono/prompt-library
**Live Site:** https://p.weaver-yuwono.com

## Known Issues

_No known issues at this time._
