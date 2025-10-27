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

## Architecture Overview

### Core Design Principles

1. **Vanilla JavaScript only** - No frameworks, no build tools, no npm dependencies
2. **Session-only edits** - Template modifications don't persist across page reloads
3. **Single-user context** - No authentication, database, or server-side logic

### File Structure

```
/
├── index.html       # Main HTML structure
├── app.js          # Single PromptLibrary class orchestrating everything
├── styles.css      # All styling (no preprocessors)
└── prompts.json    # Prompt data source
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

**Template Compilation**: Variable substitution using string replacement
```javascript
compilePrompt(prompt) {
    let compiled = prompt.template;
    prompt.variables.forEach(variable => {
        const placeholder = `{{${variable.name}}}`;
        compiled = compiled.split(placeholder).join(variable.value || '');
    });
    return compiled;
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
- Header shows the prompt title and category
- Toolbar surfaces an `Edit prompt` call-to-action button (with lock icons) that toggles edit mode
- Modal body height animates between state changes (e.g., switching tabs) to soften large content shifts
- Modal remains open while state changes propagate back to the underlying summary card via `refreshPromptViews()`
- Only the scroll area containing prompt variables/template scrolls; the header, description, and action buttons remain fixed for consistent access
- Template editor textarea is capped at viewport height and scrollable so the modal chrome stays fixed

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

**Consistency**:
- All interactive elements use Material Design 3 state layers for hover/focus/pressed states
- State layer opacity controlled by `--md-sys-state-hover-opacity`, `--md-sys-state-focus-opacity`, `--md-sys-state-pressed-opacity`
- Avoid changing background colors directly on hover; use pseudo-element overlays instead

**Variables**:
- Keep colors within the new descriptive palette (`--color-page-background`, `--color-card-surface`, `--color-surface-hover`, `--color-border-subtle`, `--color-text-primary`, `--color-text-secondary`, `--color-action-primary`, `--color-action-primary-hover`)
- Category accents live in `--color-category-*`
- Modal effects use `--modal-blur-amount`
- Motion/typography/state tokens still rely on the existing `--md-sys-*` variables

**Transitions**:
- Description/badge visibility uses smooth max-height and opacity transitions
- Modal animations use spring-like easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
- Standard interactions use M3 motion durations and easing curves

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
