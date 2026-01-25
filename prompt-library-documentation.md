# Prompt Library Documentation

## Overview

Prompt Library is a static, single-user prompt management tool. Users can browse reusable AI prompts, customize variables, preview compiled output, and copy or download the final text. The interface is built with plain HTML, CSS, and vanilla JavaScript—no frameworks, bundlers, or runtime dependencies.

## Technology Stack

- **HTML/CSS/JS** only
- **No build step** – assets are served statically
- **LocalStorage** – stores variable values and metadata (use count, last used)
- **Google Material Symbols** – sole icon source via web font

## Repository Layout

```
/
├── app.js                 # PromptLibrary class and application logic
├── index.html             # Root document
├── styles.css             # Global styles and design tokens
├── prompts.json           # Prompt catalog (flat array)
├── links.js / links.json  # Supplemental “AI tools” modal content
├── public/
│   └── images/prompts-logo.svg
├── prompt-library-documentation.md  # This document
├── CLAUDE.md              # Implementation notes for contributors
└── vercel.json            # Static deployment configuration
```

Legacy helper files under `prompts-for-implementation/` are retained only as reference text for individual prompts.

## Data Model (`prompts.json`)

`prompts.json` is a flat array of prompt objects:

```json
[
  {
    "id": "audio-essay",
    "title": "Audio Essay Writer",
    "description": "Generate 3,000-word essays optimized for narration",
    "category": "Expertise",
    "template": "Template text with {{variable}} slots",
    "variables": [
      {
        "name": "topic",
        "label": "Essay Topic",
        "placeholder": "e.g., The Sumner Tunnel",
        "inputType": "textarea",
        "rows": 8,
        "value": ""              // populated at runtime only
      }
    ],
    "locked": true                  // runtime state (omit when authoring)
  }
]
```

Key points:
- `name` must match the `{{placeholder}}` token inside `template`
- Variables with long-form input use `inputType: "textarea"` and optional `rows`
- The app assumes unique `id` values and the category set `Productivity`, `Expertise`, or `Travel & Shopping`

## Application Behavior

### View Modes

The application supports two view modes toggled via icon buttons in the controls bar:

**List View (Default)**:
- Prompts organized by category with bold section headers
- Table-like rows with transparent backgrounds and no gaps
- No border-radius or shadows on rows; bottom borders separate items
- Minimal padding for maximum information density
- Descriptions and variable counts hidden by default

**Grid View**:
- Cards displayed in a responsive grid (300px fixed width per card)
- Category badges are color-coded by category:
  - **Productivity**: Light blue background (#E8F4F8) with blue text (#4A90A4)
  - **Expertise**: Light purple background (#F3EEF8) with purple text (#7B5FA0)
  - **Travel & Shopping**: Light green background (#EEF8F3) with green text (#5FA07B)
- Cards maintain neutral background with rounded corners and subtle elevation
- Descriptions and variable counts toggle-able via "Descriptions" switch

### Prompt Cards/Items

- Show title, category badge, and optionally description/variable count
- Clicking or pressing <kbd>Enter</kbd>/<kbd>Space</kbd> opens the modal detail view
- Consistent Material Design 3 hover states using state layer overlays (no background color changes)

### Prompt Modal

**Animation**:
- Opens with spring-like animation (0.45s): scales from 85% through 102% to 100%
- Closes quickly (0.25s) with simple scale and fade
- Background uses 16px blur with color saturation, no dark overlay
- Enhanced shadow for visibility

**Layout**:
- Header row: left-aligned title/category, centered logo (outside modal), right-aligned small button (`btn-sm`) that toggles between **Edit Prompt** (`mode_edit`) and **Save changes** (`check`) and a close control
- Description sits beneath the header and does not scroll
- **Variation Selector** (when available): Dropdown menu appears below description, above variables section
  - Only visible when a prompt has multiple variations
  - Allows switching between different template styles
  - User input is preserved when switching variations
- Main content area scrolls independently; buttons along the bottom stay fixed
- Locked state shows Variables / Preview tabs with "Clear All" action; unlocked state shows a resizable textarea that auto-grows without adding a second scrollbar
- Actions provide **Copy** and **Download** buttons (copy updates usage metadata)

### Prompt Variations

Some prompts offer multiple variations - different template styles for the same purpose. For example, the Writing Assistant prompt includes variations like "Casual & Conversational", "Formal & Professional", and "Concise & Direct".

**How Variations Work:**
- A dropdown selector appears above the variables section when a prompt has multiple variations
- Select a variation to change the underlying prompt template
- Your input values are preserved when switching between variations
- The Preview tab updates to show the compiled prompt with the selected variation
- Downloaded files include the variation name in the filename (e.g., `writing-assistant--casual-conversational.txt`)
- Cards in the main grid don't indicate whether variations exist - you'll see the selector when you open the modal

### Search & Filters

- Search input filters by title, description, category, or template contents in real time
- When the search field is focused:
  - <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> focuses the field (global shortcut)
  - <kbd>Escape</kbd> clears the current search term and defocuses the input
- Category chips filter the grid; the active chip is highlighted in purple

### Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>K</kbd> | Focus search |
| <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>/</kbd> | Toggle keyboard reference modal |
| <kbd>Escape</kbd> | Close dialogs / clear search when search is active |

### Persistence & Local Storage

- Variable values persist per prompt using the key `prompt_vars_<id>`
- Metadata (`prompt_meta_<id>`) tracks `useCount`, `lastUsed`, and `isFavorite` (future use)
- Clearing variables removes the corresponding storage entry

## Styling System

**Design Tokens**:
- Core palette uses eight descriptive variables (`--color-page-background`, `--color-card-surface`, `--color-surface-hover`, `--color-border-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-action-primary`, `--color-action-primary-hover`)
- Category accents supply per-chip hues (`--color-category-productivity`, `--color-category-expertise`, `--color-category-travel`, `--color-category-lifestyle`, `--color-category-inspiration`)
- Material tokens (`--md-sys-*`) now focus on motion, typography, state-layer opacity, and elevation
- Modal effects (`--modal-blur-amount`) remain tweakable in `:root`

**Interactive States**:
- All hover/focus/pressed states use M3 state layers (pseudo-element overlays)
- State opacity controlled by `--md-sys-state-hover-opacity` and related variables
- Consistent across tabs, buttons, chips, cards, and list items

**Buttons**:
- `.btn` is the shared button base; `.btn-primary`, `.btn-secondary`, and `.btn-sm` supply color and size variants
- Material Symbols weight can be tuned globally via the comment next to `.material-symbols-outlined`

**Transitions**:
- Description/badge visibility: smooth max-height + opacity + margin transitions
- Modal: spring-like easing `cubic-bezier(0.34, 1.56, 0.64, 1)` for opening
- Standard interactions: M3 motion durations and easing curves

### Design System Update Checklist

1. Make the change in `m3-design-v2` and rebuild the bundle.
2. Push to `main`, then run `VERIFY_SNIPPET="expected-code-snippet" scripts/design-system-refresh.sh`.
3. Verify `@main` serves the change; if stale after purge, temporarily pin the commit in `components/index.js` with a TODO.
4. Revert the pin once `@main` serves the updated bundle.

### CSS Quality Guidelines

When modifying `styles.css`, follow these critical best practices:

**Design System First**:
- Prefer adding or adjusting shared styles in `m3-design-v2` when the change is reusable across projects
- ALWAYS avoid local overrides whenever possible; treat local CSS patches as temporary hotfixes only
- Keep local CSS limited to app-specific layout and components; avoid shadow-DOM overrides unless explicitly temporary

**DO NOT Use `!important`**:
- **Never** use `!important` declarations (they break cascade and make maintenance difficult)
- Resolve specificity conflicts by increasing selector specificity or reordering rules
- Only exception: true utility classes like `[hidden]` that must override everything

**Always Use CSS Variables**:
- Never use hardcoded colors like `#ffffff`, `#000000`, etc.
- Always reference design tokens: `var(--color-card-surface)`, `var(--color-text-primary)`
- Use `color-mix()` with variables for tints: `color-mix(in srgb, var(--category-color) 16%, var(--color-card-surface))`

**Use Motion Tokens for Animations**:
- Never use magic numbers like `0.2s` or `300ms`
- Always use motion tokens: `var(--md-sys-motion-duration-short4)`, `var(--md-sys-motion-easing-standard)`
- Common patterns:
  - Short interactions: 200ms (`--md-sys-motion-duration-short4`)
  - Medium interactions: 300ms (`--md-sys-motion-duration-medium2`)
  - Long interactions: 450ms (`--md-sys-motion-duration-long1`)

**State Layers for Hover/Focus**:
- Never change `background-color` directly on `:hover`
- Always use pseudo-element overlays (`::before` or `::after`) with opacity changes
- Example: `.element::before` with `opacity: var(--md-sys-state-hover-opacity)` on hover

**Accessibility Requirements**:
- All interactive elements need `:focus-visible` states
- Standard pattern: `outline: 3px solid var(--color-action-primary); outline-offset: 2px;`
- Ensure WCAG AA contrast ratios (dark backgrounds need light text)

**Code Quality**:
- Remove empty rulesets
- Consolidate duplicate selectors
- Group properties logically (position → box model → typography → visual → animation)

## Adding or Editing Prompts

1. Duplicate an existing object in `prompts.json`
2. Update `id`, `title`, `description`, `category`, `template`, and variable definitions
3. Keep categories within the existing set (`Productivity`, `Expertise`, `Travel & Shopping`)
4. Run a quick JSON formatter/validator
5. Test locally and verify the prompt renders correctly in both locked and editable states

## Local Development

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

Static file hosting is required for `fetch('prompts.json')` to succeed; opening `index.html` from the filesystem will block the request.

## Deployment

- The project auto-deploys to Vercel when commits land on `main`
- `vercel.json` enumerates all static assets (`@vercel/static`); Vercel serves files relative to the repo root
- Production domain: `p.weaver-yuwono.com`
- For manual redeploys: `vercel --prod`

## Maintenance Tips

- Keep documentation (`CLAUDE.md`, this file) synchronized with UI updates
- When adjusting layout or hover states, verify the experience on both desktop and mobile breakpoints
- If a deployment serves an unstyled page, ensure static assets aren’t being rewritten (see `vercel.json` history)
