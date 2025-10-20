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

Each prompt object can have runtime properties:
- `locked` - Boolean for edit mode (default: true)
- `activeTab` - Current tab ('variables' or 'preview')
- `variables[].value` - User-entered values for substitution

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

- Header uses a three-column grid: title anchored left, logo centered, and nav actions (AI Tools + hamburger) aligned right
- Buttons share a `.btn` base (uppercase, pill-shaped) with `.btn-primary` (purple fill) and `.btn-secondary` (neutral surface) variants reused across the app; `.btn-sm` is available for compact contexts (e.g., modal header controls)
- The global search control mirrors the same pill silhouette to keep top-level inputs cohesive

### Prompt Summary Cards

- Display title, category chip, short description, and a variable count badge
- Entire card is keyboard-focusable and opens the modal on click/Enter/Space
- Material Symbols supply iconography where needed (e.g., buttons inside cards and modals)

### Prompt Detail Modal

- Opens as an overlay when a summary card is activated (mirrors the AI tools modal pattern)
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

- Current taxonomy is consolidated to `Productivity`, `Expertise`, and `Travel & Shopping`
- Reuse existing labels when introducing new prompts to keep chip filters consistent

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
