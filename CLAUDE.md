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

**Card Re-rendering**: State changes trigger full card re-render via `replaceWith()`
```javascript
toggleLock(index) {
    prompt.locked = !prompt.locked;
    const newCard = this.createPromptCard(prompt, index);
    card.replaceWith(newCard);
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
                "value": ""              // Runtime state
            }
        ],
        "locked": true  // Runtime state
    }
]
```

**Important**: JSON structure is a flat array, not wrapped in `{"prompts": [...]}`.

## UI Components

### Tab Interface (Locked State)

When a prompt card is locked (default), it shows:
- **Variables tab** (default) - Input fields for all variables
- **Preview tab** - Compiled prompt with variables substituted

Preview updates in real-time as variables are typed.

### Filter Chips

Categories are displayed as clickable chips above the grid:
- "All" chip is active by default
- Clicking a category filters the grid
- Active chip highlighted in purple

### Card States

- **Locked** (default): Shows tabs (Variables/Preview), lock icon 🔒, "Copy to Clipboard" button
- **Unlocked**: Shows editable textarea, unlock icon 🔓, "Save Changes" button

## Implementation Notes

### Adding New Prompts

Edit `prompts.json` - no code changes needed. Ensure:
- Unique `id`
- Valid `category` (will auto-populate in filter chips)
- Variables use `{{name}}` syntax matching variable objects
- Variable `name` field matches placeholder text in template

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

## Important Deviations from Requirements

The implementation differs from `prompt-library-requirements.md` in these ways:

1. **Architecture**: Single class in `app.js` instead of separate component modules
2. **JSON structure**: Flat array instead of wrapped object
3. **Data attributes**: Uses `name` instead of `key` for variables
4. **UI additions**: Tab interface and category chips not in original spec
5. **State properties**: Uses `locked` and `activeTab` on prompt objects directly

When making changes, follow the actual implementation patterns rather than the requirements document.
