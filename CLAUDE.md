# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript prompt management tool with zero dependencies and no build process. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

## Running the Application

```bash
python3 -m http.server 8000  # Then open http://localhost:8000
```

No installation, build, or compilation steps required.

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

### CDN Import Details

**CSS tokens** (via `tokens.css`):
```css
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css');
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/main.css');
```

**Web Components** (via `components/index.js`):
```javascript
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=20260130';
```

### Import Policy

Prefer `@main` with cache-busting (`?v=YYYYMMDD`). Only pin to commit hashes as emergency fallback with a documented reason and revert deadline (24-48h max).

### CDN Cache Issues

If design system changes don't appear or components behave unexpectedly, **check for stale CDN cache first**. See [docs/cdn-troubleshooting.md](docs/cdn-troubleshooting.md) for purge commands and verification steps.

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
├── index.html       # Main HTML structure
├── app.js           # Single PromptLibrary class orchestrating everything
├── tokens.css       # Design system imports + legacy compatibility mappings
├── styles.css       # App-specific component styles only
└── prompts.json     # Prompt data source
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

```bash
git add . && git commit -m "Description

Co-Authored-By: Claude <noreply@anthropic.com>" && git push
```

## See Also

- **Visual QA**: [skills/visual-qa/SKILL.md](skills/visual-qa/SKILL.md) - Screenshot testing after CSS changes
- **CDN Troubleshooting**: [docs/cdn-troubleshooting.md](docs/cdn-troubleshooting.md) - Cache purging and verification
- **Repository**: https://github.com/mwyuwono/prompt-library
- **Live Site**: https://oct-19-prompts-rebuild-nbpz1n873-weaver-yuwono.vercel.app

## Known Issues

_No known issues at this time._
