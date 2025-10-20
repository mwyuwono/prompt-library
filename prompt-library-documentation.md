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

### Prompt Cards

- Summary cards show title, category chip, description, and variable count badge
- Clicking or pressing <kbd>Enter</kbd>/<kbd>Space</kbd> opens the modal detail view
- Hover states keep elements in place (no translate or extra shadows)

### Prompt Modal

- Header row: left-aligned title/category, centered logo (outside modal), right-aligned small button (`btn-sm`) that toggles between **Edit Prompt** (`mode_edit`) and **Save changes** (`check`) and a close control
- Description sits beneath the header and does not scroll
- Main content area scrolls independently; buttons along the bottom stay fixed
- Locked state shows Variables / Preview tabs with “Clear All” action; unlocked state shows a resizable textarea that auto-grows without adding a second scrollbar
- Actions provide **Copy** and **Download** buttons (copy updates usage metadata)

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

- Design tokens (colors, spacing, typography) are defined in `styles.css`
- `.btn` is the shared button base; `.btn-primary`, `.btn-secondary`, and `.btn-sm` supply color and size variants
- Material Symbols weight can be tuned globally via the comment next to `.material-symbols-outlined`
- **Styling note**: the maintainer is actively adjusting CSS manually—avoid touching existing styles unless explicitly requested or when introducing a new feature (initial styles are acceptable, but plan for follow-up refinements)

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
