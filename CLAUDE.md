# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A vanilla JavaScript prompt management tool with zero dependencies and no build process. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

## Running the Application

Since this is a static application with no build process:

```bash
# Development - serve locally (required for fetch to work)
python3 -m http.server 8000
# Then open http://localhost:8000

# Production - deploy as static files to any host (GitHub Pages, Netlify, etc.)
```

No installation, build, or compilation steps required.

## Design System Integration

**CRITICAL: This project uses a shared design system. Before making ANY styling changes, read this section.**

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  m3-design-v2 (GitHub: mwyuwono/m3-design-v2)                  │
│  ├── src/styles/tokens.css  → Colors, typography, spacing      │
│  └── src/styles/main.css    → Base styles, utilities, buttons  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ CDN Import
┌─────────────────────────────────────────────────────────────────┐
│  prompts-library                                                │
│  ├── tokens.css  → Imports design system + legacy mappings     │
│  └── styles.css  → App-specific components only                │
└─────────────────────────────────────────────────────────────────┘
```

### Where to Make Style Changes

| Change Type | Where to Edit | Why |
|-------------|---------------|-----|
| **Colors** (brand palette, semantic colors) | `m3-design-v2/src/styles/tokens.css` | Shared across all projects |
| **Typography** (fonts, type scale) | `m3-design-v2/src/styles/tokens.css` | Consistent reading experience |
| **Spacing tokens** | `m3-design-v2/src/styles/tokens.css` | Consistent rhythm |
| **Motion tokens** (durations, easing) | `m3-design-v2/src/styles/tokens.css` | Consistent feel |
| **Base styles** (body, headings, scrollbars) | `m3-design-v2/src/styles/main.css` | Reusable foundations |
| **Utility classes** (`.btn`, `.text-muted`) | `m3-design-v2/src/styles/main.css` | Reusable patterns |
| **Category colors** (`--wy-color-*`) | `m3-design-v2/src/styles/main.css` | Shared taxonomy |
| **App layout** (`.header-top`, `.controls-bar`) | `prompts-library/styles.css` | App-specific |
| **App components** (`.prompt-card`, `.prompt-modal`) | `prompts-library/styles.css` | App-specific |

### Design System Workflow

When the user requests styling or component changes:

1. **Identify the change type** using the table above
2. **If design system change needed:**
   - Inform the user: "This change should be made in the design system (m3-design-v2) so it applies to all projects"
   - Guide them to make the change there first
   - After pushing to m3-design-v2, **ALWAYS run the full CDN purge** (see [CDN Cache Purging](#cdn-cache-purging-critical) below)
   - **Verify the purge worked** before testing in prompts-library
3. **If app-specific change:** Edit `styles.css` directly

**IMPORTANT FOR DEBUGGING:** If a design system component (e.g., `wy-controls-bar`, `wy-filter-chip`, `wy-modal`) behaves unexpectedly, **always check for stale CDN cache first** before investigating code. Run the full purge commands and hard refresh.

**Current status (2026-01-25):** jsDelivr `@main` is serving a stale `dist/web-components.js`. The app temporarily pins `@ad99b95` until `@main` updates. See the Active Issues section for revert criteria.

### CDN Import Details

The design system is loaded via two mechanisms:

**CSS tokens** (via [tokens.css](tokens.css)):
```css
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css');
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/main.css');
```

**Web Components** (via [components/index.js](components/index.js)):
```javascript
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js';
```
If temporarily pinned to a commit, include a TODO and follow the revert criteria below.

### Import Pinning Policy (Default + Fallback)

**Default: use `@main`.** Only pin to a commit hash as a **temporary fallback** when jsDelivr still serves stale content after a purge.

**Why this matters:**
- Pinning to a commit hash freezes the code at that point in time
- Future fixes and improvements in the design system won't be picked up
- The CDN purge workflow assumes `@main` references are being used

**Temporary fallback pin (only when CDN is stale after purge):**
```javascript
// ✅ Temporary fallback - pin to the known-good commit until CDN updates
// TODO: revert to @main once CDN serves the updated bundle
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@<commit>/dist/web-components.js';
```

**Revert criteria:** When `@main` serves the expected snippet (see verification steps below), restore `@main` and remove the TODO.

**When debugging CDN issues:** Check import paths first. If pinned, confirm why. If `@main` is stale after purge, pin temporarily.

### CDN Cache Purging (CRITICAL)

**jsDelivr aggressively caches content.** After ANY change to m3-design-v2, you MUST run aggressive purge commands to prevent stale styles or broken components.

#### When to Purge

**ALWAYS purge after:**
- Pushing any commit to m3-design-v2
- Debugging unexpected behavior in design system components (e.g., filter chips, controls bar, modals)
- When the app behaves differently than expected based on the design system source code

**Symptoms of stale cache:**
- Components behave differently than their source code suggests
- Style changes made in design system don't appear
- Features work locally in design system but not in consuming projects

#### Full Purge Commands (Run All)

```bash
# === CSS Tokens ===
# Purge with @main reference
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/main.css"

# Purge without version (catches default branch)
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/src/styles/tokens.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/src/styles/main.css"

# Purge with @latest reference
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/src/styles/tokens.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/src/styles/main.css"

# === Web Components Bundle ===
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/dist/web-components.js"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/dist/web-components.js"
```

#### One-Liner for Quick Purge

```bash
for f in src/styles/tokens.css src/styles/main.css dist/web-components.js; do for v in @main "" @latest; do curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2${v}/${f}"; done; done
```

#### Helper Script (Recommended)

```bash
VERIFY_SNIPPET="expected-code-snippet" scripts/design-system-refresh.sh
```

#### Verification Steps

1. Run all purge commands above
2. Wait 2-3 seconds for propagation
3. Verify CSS: `curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css" | grep -A 5 "your-changed-property"`
4. Verify JS: `curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js" | grep "expected-code-snippet"`
5. If still showing old content, purge again and wait longer
6. Hard refresh the browser (Cmd+Shift+R)

#### Why Aggressive Purging Matters

- jsDelivr has multiple edge nodes that may cache independently
- A single purge may not clear all edge caches immediately
- The `@main`, default, and `@latest` references may be cached separately
- **Both CSS and JS bundles must be purged** - components depend on both
- Without proper purging, users may see stale styles or broken behavior for hours

### Available Design Tokens

From the design system, prefer these over hardcoded values:

**Colors:**
- `--md-sys-color-primary`, `--md-sys-color-on-primary`
- `--md-sys-color-background`, `--md-sys-color-on-background`
- `--md-sys-color-surface`, `--md-sys-color-surface-container-*`
- `--md-sys-color-text-main`, `--md-sys-color-text-muted`

**Typography:**
- `--font-serif` (Playfair Display), `--font-sans` (DM Sans)
- `--md-sys-typescale-*-font`, `--md-sys-typescale-*-size`, etc.

**Spacing:**
- `--spacing-layout` (120px), `--spacing-gap` (64px)

**Shape:**
- `--md-sys-shape-corner-medium` (16px), `--md-sys-shape-corner-large` (32px), `--md-sys-shape-corner-full` (9999px)

**Category Colors:**
- `--wy-color-productivity`, `--wy-color-expertise`, `--wy-color-travel`

### Legacy Compatibility

The local [tokens.css](tokens.css) maps old variable names to design system tokens:
- `--color-page-background` → `--md-sys-color-background`
- `--color-text-primary` → `--md-sys-color-text-main`
- `--color-olive` → `--md-sys-color-primary`

When writing new code, prefer the `--md-sys-*` tokens directly.

## Architecture Overview

### Core Design Principles

1. **Vanilla JavaScript only** - No frameworks, no build tools, no npm dependencies
2. **Session-only edits** - Template modifications don't persist across page reloads
3. **Single-user context** - No authentication, database, or server-side logic
4. **Design system first** - Use shared tokens from m3-design-v2; avoid local overrides

### File Structure

```
/
├── index.html       # Main HTML structure
├── app.js           # Single PromptLibrary class orchestrating everything
├── tokens.css       # Design system imports + legacy compatibility mappings
├── styles.css       # App-specific component styles only
└── prompts.json     # Prompt data source
```

**Note**: The requirements document mentions a `components/` directory with separate modules (`promptCard.js`, `templateParser.js`), but the **actual implementation** uses a single `PromptLibrary` class in `app.js` that handles all functionality internally.

### State Management

The `PromptLibrary` class maintains state through:
- `prompts` - Original data loaded from JSON
- `filteredPrompts` - Currently displayed prompts after search/filter
- `selectedCategory` - Active category filter
- `searchTerm` - Current search query
- `currentView` - Active view mode ('list' or 'grid', defaults to 'list')
- `showDetails` - Whether descriptions and variable counts are visible (defaults to false)

Each prompt object can have runtime properties:
- `locked` - Boolean for edit mode (default: true)
- `activeTab` - Current tab ('variables' or 'preview')
- `activeVariationId` - ID of currently selected variation (if prompt has variations)
- `variables[].value` - User-entered values for substitution
- `category` - Used for color coding in grid view (set as data attribute on cards)

### Key Architectural Patterns

**Event Delegation**: Uses `data-action` attributes for event handling
```javascript
// Example from attachCardEventListeners()
button.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    // Dispatches to appropriate handler
});
```

**Card & Modal Sync**: State changes update the summary card and any open modal in one pass
```javascript
refreshPromptViews(index) {
    if (index !== null && index !== undefined) {
        this.updatePromptCard(index);
    }

    if (this.activePromptId && this.promptModal?.classList.contains('show')) {
        const modalIndex = this.filteredPrompts.findIndex(p => p.id === this.activePromptId);
        if (modalIndex === -1) {
            this.closePromptModal();
            return;
        }
        this.renderPromptModalContent(this.filteredPrompts[modalIndex], modalIndex);
    }
}
```

**Template Compilation**: Variable substitution using string replacement, with support for variations
```javascript
compilePrompt(prompt) {
    let compiled = this.getActiveTemplate(prompt);
    prompt.variables.forEach(variable => {
        const placeholder = `{{${variable.name}}}`;
        compiled = compiled.split(placeholder).join(variable.value || '');
    });
    return compiled;
}

getActiveTemplate(prompt) {
    if (prompt.variations && prompt.variations.length > 0) {
        const activeId = prompt.activeVariationId || prompt.variations[0].id;
        const variation = prompt.variations.find(v => v.id === activeId);
        return variation?.template || prompt.template || '';
    }
    return prompt.template || '';
}
```

## Data Structure

### prompts.json Schema

The actual implementation uses this structure (differs from requirements doc):

```json
[
    {
        "id": "unique-id",
        "title": "Prompt Title",
        "description": "Brief description",
        "category": "Category Name",  // Used for filtering
        "template": "Template with {{variable}} placeholders",
        "variables": [
            {
                "name": "variable",      // Used in {{variable}} syntax
                "label": "Display Label",
                "placeholder": "Example value",
                "value": "",
                "inputType": "textarea",
                "rows": 8
            }
        ],
        "locked": true  // Runtime state
    }
]
```

**Important**: JSON structure is a flat array, not wrapped in `{"prompts": [...]}`.

`inputType` and `rows` are optional runtime hints; when omitted, the app infers when to render a textarea for long-form input and picks a sensible default height.

### Prompt Variations

Prompts can optionally include multiple template variations, allowing users to choose between different styles or approaches while keeping the same variables and description.

```json
[
    {
        "id": "writing-assistant",
        "title": "Writing Assistant",
        "description": "Improve clarity, flow, and structure with multiple style options",
        "category": "Productivity",
        "variables": [
            {
                "name": "text",
                "label": "Text to Review",
                "placeholder": "Paste your text here",
                "value": ""
            }
        ],
        "variations": [
            {
                "id": "standard",
                "name": "Standard (with Objective Alternative)",
                "template": "Text: {{text}}\n\nImprove clarity and flow..."
            },
            {
                "id": "casual",
                "name": "Casual & Conversational",
                "template": "Text: {{text}}\n\nMake this casual and friendly..."
            },
            {
                "id": "formal",
                "name": "Formal & Professional",
                "template": "Text: {{text}}\n\nMake this formal and professional..."
            }
        ]
    }
]
```

**Variations Behavior:**
- When a prompt has variations, a dropdown selector appears in the modal above the variables section
- The first variation is selected by default
- User input values are preserved when switching between variations
- Only the template changes; variables, description, and category remain the same
- Download filenames include the variation name (e.g., `writing-assistant--casual-conversational.txt`)
- Cards in the grid view do not indicate that variations exist
- Prompts without a `variations` array continue to use the single `template` property (backward compatible)

### Variable Types and Input Controls

Variables in prompts use simple string substitution via `{{variable_name}}` syntax. The application supports the following input types:

#### Standard Text Input (Default) ✅ SUPPORTED
```json
{
    "name": "variable_name",
    "label": "Display Label",
    "placeholder": "Example value",
    "value": ""
}
```
When `inputType` is omitted, renders as a single-line text input. **This is the most reliable input type.**

#### Textarea Input ✅ SUPPORTED
```json
{
    "name": "variable_name",
    "label": "Display Label",
    "placeholder": "Example value",
    "value": "",
    "inputType": "textarea",
    "rows": 10
}
```
For multi-line text input. The `rows` property controls initial height.

#### Toggle Input ✅ SUPPORTED
```json
{
    "name": "variable_name",
    "label": "Display Label",
    "inputType": "toggle",
    "options": [
        "Text when toggle is OFF",
        "Text when toggle is ON"
    ],
    "value": ""
}
```
Renders as a Material Design toggle switch. When toggled:
- **OFF** (default): Inserts `options[0]` into the template
- **ON**: Inserts `options[1]` into the template

**Common pattern for optional instructions:**
```json
{
    "name": "mask_instructions",
    "label": "Masked Image",
    "inputType": "toggle",
    "options": [
        "",
        "Limit all edits to only the areas masked by the user. Ensure the mask is not visible in the resulting image."
    ],
    "value": ""
}
```
When OFF, inserts nothing (empty string). When ON, inserts the full instruction text.

**Conditional field visibility:**
Use `dependsOn` and `hideWhen` to show/hide fields based on toggle state:
```json
{
    "name": "mode",
    "label": "Mode",
    "inputType": "toggle",
    "options": ["Option A", "Option B"],
    "value": ""
},
{
    "name": "conditional_field",
    "label": "Conditional Field",
    "placeholder": "Only shown when Option A is selected",
    "value": "",
    "dependsOn": "mode",
    "hideWhen": "Option A"
}
```
The `conditional_field` is hidden when `mode` value equals "Option A", and shown otherwise.

#### Unsupported Input Types ❌ DO NOT USE

The following input types are **not supported** and will cause rendering issues:

- **`inputType: "select"`** - Does not render as dropdown; falls back to text input with broken placeholder
- **`inputType: "checkbox"`** - Not implemented
- **`inputType: "radio"`** - Not implemented

**Never use these in prompt definitions.**

## UI Components

### Global UI Patterns

- **Header**: Flexbox layout with logo on left, title beside it, and nav actions (AI Tools + hamburger) on right
- **Controls Bar**: Compact 64px min-height bar with search, view toggle (list/grid), descriptions toggle, and category chips
- **Buttons**: Share a `.btn` base (uppercase, pill-shaped) with `.btn-primary` and `.btn-secondary` variants; `.btn-sm` for compact contexts
- **Search**: Compact input without keyboard shortcut hint, focuses main content on interaction
- **Hover States**: Consistent Material Design 3 state layers (`--md-sys-state-hover-opacity`) across all interactive elements
- **CSS Variables**: Modal blur (`--modal-blur-amount`), category colors (`--category-*`), and M3 design tokens are defined in `:root`

### View Modes

**List View (Default)**:
- Prompts organized by category with section headers
- Table-like rows with transparent backgrounds, no gaps, no border-radius
- Minimal padding for information density
- Shows title and badges; descriptions/variable counts hidden by default

**Grid View**:
- Fixed 300px card width, auto-fills horizontally
- Category badges color-coded per category (blue/Productivity, purple/Expertise, green/Travel & Shopping)
- Cards maintain neutral background with rounded corners and elevation

### Prompt Cards (Grid View)

- Display title below category badge header
- Category badge and variable count badge in top-left corner
- Descriptions and variable counts toggle-able via controls bar
- Entire card is keyboard-focusable and opens the modal on click/Enter/Space
- Material Symbols supply iconography where needed

### Prompt Detail Modal

**Animation & Appearance**:
- Opens with spring-like animation: scales from 85% to 102% to 100% over 0.45s
- Closes faster (0.25s) with simple scale/fade
- Background uses 16px blur with saturation boost, no dark overlay
- Enhanced shadow for visibility against blurred background

**Layout**:
- Header shows the prompt title using display font (Playfair Display) and category
- Toolbar surfaces an `Edit prompt` call-to-action button (with lock icons) that toggles edit mode
- Lock button is hidden entirely when in edit mode (not just relabeled)
- Modal body has reduced spacing for visual tightness
- Variation selector dropdown appears above the variables section (when variations exist)
- Modal body height uses min-height to prevent jumping when switching tabs
- Modal remains open while state changes propagate back to the underlying summary card via `refreshPromptViews()`
- Only the scroll area containing prompt variables/template scrolls; the header, description, and action buttons remain fixed for consistent access
- Template editor textarea is capped at viewport height (max-height: 60vh) and scrollable so the modal chrome stays fixed
- Action buttons are arranged horizontally with equal width on desktop, stack vertically on mobile

### Tab Interface (Locked State)

When the prompt remains locked inside the modal:
- **Variables tab** (default) – Input fields for variable substitution
- **Preview tab** – Compiled prompt rendered with current variable values

Preview updates in real time as variables change.

### Filter Chips

Categories are displayed as clickable chips above the grid:
- "All" chip is active by default
- Clicking a category filters the grid
- Active chip highlighted in purple

### Modal States

- **Locked** (default): Shows Variables/Preview tabs, "Copy to Clipboard" + "Download" buttons, and the `Edit prompt` CTA that unlocks the template
- **Editable**: Displays a full-width textarea for direct template edits, lock icon on the CTA switches to open state, and actions collapse to a "Save Changes" button

## Implementation Notes

### Adding New Prompts

Edit `prompts.json` - no code changes needed. Ensure:
- Unique `id`
- Valid `category` (will auto-populate in filter chips)
- Variables use `{{name}}` syntax matching variable objects
- Variable `name` field matches placeholder text in template

### Adding Prompt Variations

To add variations to an existing prompt:
1. Remove the single `template` property
2. Add a `variations` array with at least 2 variation objects
3. Each variation needs: `id` (unique within prompt), `name` (display label), `template` (the prompt text)
4. Variables remain at the prompt level and are shared across all variations
5. The first variation in the array is selected by default
6. Variation selector only appears when 2 or more variations exist

Example workflow:
```javascript
// Before (single template):
{
    "id": "my-prompt",
    "title": "My Prompt",
    "template": "Original template with {{variable}}",
    "variables": [...]
}

// After (with variations):
{
    "id": "my-prompt",
    "title": "My Prompt",
    "variations": [
        {
            "id": "style-a",
            "name": "Style A",
            "template": "Template A with {{variable}}"
        },
        {
            "id": "style-b",
            "name": "Style B",
            "template": "Template B with {{variable}}"
        }
    ],
    "variables": [...]
}
```

### Category Conventions

- Current taxonomy is consolidated to `Productivity`, `Expertise`, and `Travel & Shopping` (with optional `Lifestyle` / `Inspiration` accents ready)
- Reuse existing labels when introducing new prompts to keep chip filters consistent
- Category badges derive from the accent tokens (`--color-category-*`) with `color-mix()` to create soft backgrounds

### Variable Input Heuristics

- Long-form variables (labels/placeholders mentioning "text", "notes", "email", etc.) automatically render as multi-line textareas
- These textarea inputs auto-resize up to a 50vh cap and persist values via the same localStorage mechanism as single-line fields

### Feedback

- Toast notifications sit above modals (`z-index` > overlay) so confirmations like “Copied!” remain visible

### Clipboard API

Uses modern `navigator.clipboard.writeText()` with fallback:
```javascript
try {
    await navigator.clipboard.writeText(text);
} catch {
    // Fallback using execCommand for older browsers
}
```

### XSS Protection

All user inputs are escaped via `escapeHTML()` before rendering to prevent injection attacks.

### CSS Quality Standards

**CRITICAL: Design System First**:
- **Before adding any new CSS**, check if the design system (m3-design-v2) already provides what you need
- **Prefer design system tokens** (`--md-sys-*`, `--wy-*`) over legacy variables (`--color-*`)
- If a token should be reusable, add it to the design system, not locally
- See the [Design System Integration](#design-system-integration) section for the full workflow

**CRITICAL: NO !important Declarations**:
- **NEVER use `!important`** in CSS except for true utility classes that must override everything
- If specificity conflicts arise, resolve them by:
  - Increasing selector specificity (e.g., adding a class or parent selector)
  - Reordering rules in the source file
  - Using attribute selectors `[hidden]` for utilities
- `!important` breaks the cascade and makes maintenance extremely difficult

**Consistency**:
- All interactive elements use Material Design 3 state layers for hover/focus/pressed states
- State layer opacity controlled by `--md-sys-state-hover-opacity`, `--md-sys-state-focus-opacity`, `--md-sys-state-pressed-opacity`
- **NEVER change background colors directly on hover**; always use pseudo-element overlays (`:before` or `:after`) instead
- Example pattern:
  ```css
  .element {
    position: relative;
    overflow: hidden;
  }
  .element::before {
    content: '';
    position: absolute;
    inset: 0;
    background-color: var(--md-sys-color-primary);
    opacity: 0;
    transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
    pointer-events: none;
  }
  .element:hover::before {
    opacity: var(--md-sys-state-hover-opacity);
  }
  ```

**Variables**:
- **Prefer M3 tokens**: `--md-sys-color-*`, `--md-sys-typescale-*`, `--md-sys-shape-*`
- **Legacy fallback**: `--color-page-background`, `--color-text-primary`, etc. (mapped to M3 tokens)
- **NEVER use hardcoded color values** like `#ffffff` or `#000000` - always use CSS variables
- Use `color-mix()` with variables: `color-mix(in srgb, var(--md-sys-color-primary) 16%, transparent)`
- Category accents use `--wy-color-*` tokens from the design system

**Transitions & Animations**:
- **Always use motion token variables** for durations and easing curves
- Common patterns:
  - Short interactions: `var(--md-sys-motion-duration-short4)` (200ms) with `var(--md-sys-motion-easing-standard)`
  - Medium interactions: `var(--md-sys-motion-duration-medium2)` (300ms) with `var(--md-sys-motion-easing-legacy)`
  - Long interactions: `var(--md-sys-motion-duration-long1)` (450ms) with `var(--md-sys-motion-easing-emphasized)`
- **NEVER use magic numbers** like `0.2s` or `0.3s` - always reference the motion tokens
- Description/badge visibility uses smooth max-height and opacity transitions
- Modal animations use spring-like easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`

**Accessibility**:
- All interactive elements must have `:focus-visible` states with clear outlines
- Standard pattern: `outline: 3px solid var(--color-action-primary); outline-offset: 2px;`
- Ensure adequate color contrast (WCAG AA minimum):
  - Dark backgrounds require light text (`var(--color-page-background)`)
  - Light backgrounds use `var(--color-text-primary)` or `var(--color-text-secondary)`
- Toggle controls should use `:focus-within` for the label container

**Code Organization**:
- Remove empty rulesets - they serve no purpose
- Consolidate duplicate rules - check for multiple declarations of the same selector
- Group related properties together (positioning, box model, typography, visual, animation)
- Comment major sections clearly

## Git Workflow and Deployment

This project is hosted on GitHub and automatically deploys to Vercel on every push to `main`.

- `vercel.json` pins the deployment to static hosting (`@vercel/static`); update it whenever new top-level assets need to be explicitly listed
- Custom domain (`p.weaver-yuwono.com`) is managed in Vercel; domain must remain pointed at Vercel's CNAME

### Repository Information
- **GitHub**: https://github.com/mwyuwono/prompt-library
- **Live Site**: https://oct-19-prompts-rebuild-nbpz1n873-weaver-yuwono.vercel.app

### When Making Changes

**IMPORTANT**: Always commit changes to Git and keep the repository up to date.

```bash
# After making changes, commit them
git add .
git commit -m "Description of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub (auto-deploys to Vercel)
git push origin main
```

### Commit Guidelines

- Create commits for all meaningful changes
- Use descriptive commit messages that explain the "why"
- Include the Claude Code attribution footer
- Push to trigger automatic deployment

### Requirements Document Maintenance

The `prompt-library-documentation.md` file should be kept synchronized with the actual implementation. When making significant changes:

1. **Update code files** first
2. **Update `prompt-library-documentation.md`** to reflect implementation changes
3. **Update this CLAUDE.md** if architectural patterns change
4. **Commit all changes together** so documentation stays in sync

**Note**: The requirements document may lag behind implementation. When in doubt, the actual code is the source of truth.

## Important Deviations from Requirements

The implementation differs from the original requirements draft in these ways:

1. **Architecture**: Single class in `app.js` instead of separate component modules
2. **JSON structure**: Flat array instead of wrapped object
3. **Data attributes**: Uses `name` instead of `key` for variables
4. **UI workflow**: Uses summary cards + modal overlay rather than inline expansion described in the original spec
5. **State properties**: Uses `locked` and `activeTab` on prompt objects directly

When making changes, follow the actual implementation patterns rather than the requirements document.

## Known Issues

_No known issues at this time._

## Resolved Issues

### Category Filter Chips Not Working (RESOLVED 2026-01-24)

**Resolution:** The design system (m3-design-v2) was already fixed in commit `521f36c`. The issue was a stale jsDelivr CDN cache serving an old version of `wy-filter-chip` with internal toggle behavior. CDN cache was purged and the fix is now live.

**What was wrong:** The `wy-filter-chip` component had a `_toggle()` method that managed its own `active` state internally, conflicting with `wy-controls-bar`'s parent-controlled state management via Lit's `?active` binding.

**The fix:** `wy-filter-chip` is now purely presentational - it does not toggle its own state. It only handles keyboard accessibility (Enter/Space to click). The parent component (`wy-controls-bar`) manages all active state via the `?active` binding and `@click` handlers.

**Lesson learned:** When filter chips stop working, first check if the CDN cache is stale:
```bash
# Purge the web-components bundle
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/dist/web-components.js"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/dist/web-components.js"

# Verify fix is served (should NOT contain "_toggle" near filter-chip)
curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js" | grep -B50 'customElements.define("wy-filter-chip"' | grep "_toggle"
```

### Material Symbols Icons Not Rendering in Controls Bar (RESOLVED 2026-01-24)

**Symptoms:** The search icon, list view icon, and grid view icons in `wy-controls-bar` displayed as text (e.g., "search", "format_list_bulleted", "grid_view") instead of icons.

**Root cause:** Two issues:
1. The `wy-controls-bar` web component uses Shadow DOM, which isolates styles. The Material Symbols font loaded in `index.html` doesn't propagate into Shadow DOM.
2. The `components/index.js` was pinned to an old commit hash (`@521f36c`) instead of `@main`, so even after fixing the design system, the fix wasn't picked up.

**The fix:**
1. Added Material Symbols font import directly inside `wy-controls-bar`'s Shadow DOM styles in the design system
2. Updated `components/index.js` to use `@main` instead of the pinned commit hash

**Lesson learned:**
- Web components using Shadow DOM must import fonts directly in their styles - fonts don't inherit from the light DOM
- Prefer upstream fixes in the design system over local overrides; reserve app-level patches for temporary hotfixes only
- Never pin CDN imports to commit hashes; always use `@main` so fixes propagate automatically
- When design system fixes don't appear, check both CDN cache AND import paths

### Controls Bar Bundle Stale on jsDelivr (RESOLVED 2026-01-25)

**Resolution:** CDN purge succeeded and `@main` now serves the updated bundle. The import was reverted from `@ad99b95` back to `@main`.

**What was fixed:** The `wy-filter-chip` component now uses configurable CSS custom properties (`--wy-filter-chip-active-bg`, `--wy-filter-chip-active-fg`, etc.) allowing consuming projects to customize chip appearance via CSS variables.
