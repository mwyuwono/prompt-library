---
name: prompt-library-architecture
description: Architecture-specific guidance for the Prompt Library project. Use this skill when working on this vanilla JavaScript prompt management tool to understand its unique patterns, data structures, and implementation conventions.
---

# Prompt Library Architecture Skill

## Project Identity

This is a **vanilla JavaScript prompt management tool** with zero dependencies and no build process. Users can store, customize, and copy reusable AI prompts with variable substitution using `{{variable}}` syntax.

## Core Design Principles

1. **Vanilla JavaScript only** - No frameworks, no build tools, no npm dependencies
2. **Session-only edits** - Template modifications don't persist across page reloads
3. **Single-user context** - No authentication, database, or server-side logic
4. **Static deployment** - Deploys to Vercel automatically on push to main

## File Structure

```
/
├── index.html       # Main HTML structure
├── app.js          # Single PromptLibrary class orchestrating everything
├── styles.css      # All styling using Material Design 3 tokens
├── tokens.css      # Design system variables
├── prompts.json    # Prompt data source
├── links.js        # AI tools external links management
├── links.json      # AI tools links data
├── CLAUDE.md       # Project documentation and coding standards
└── skills/         # Agent Skills directory
    ├── vanilla-js-development/
    ├── material-design-css/
    └── prompt-library-architecture/
```

## Architecture: Single Class Pattern

The entire application is orchestrated by a single `PromptLibrary` class in `app.js`. This is a **deliberate architectural decision** for simplicity.

❌ **DO NOT:**
- Create separate component modules
- Split functionality into multiple files
- Add framework-like abstractions

✅ **DO:**
- Keep all logic in the PromptLibrary class
- Add methods to the existing class
- Use event delegation for dynamic interactions

## State Management

### Application State
The `PromptLibrary` class maintains:
```javascript
{
  prompts: [],              // Original data from JSON
  filteredPrompts: [],      // Currently displayed prompts
  selectedCategory: 'all',  // Active category filter
  searchTerm: '',           // Current search query
  currentView: 'list',      // 'list' or 'grid'
  showDetails: false,       // Toggle for descriptions/variable counts
  activePromptId: null      // Currently open modal prompt ID
}
```

### Prompt Object Runtime Properties
Each prompt can have these runtime properties added:
```javascript
{
  // From prompts.json (static)
  id: 'unique-id',
  title: 'Prompt Title',
  description: 'Brief description',
  category: 'Category Name',
  template: 'Template with {{variable}}',  // OR variations array
  variables: [...],

  // Added at runtime (dynamic)
  locked: true,                    // Edit mode toggle
  activeTab: 'variables',          // 'variables' or 'preview'
  activeVariationId: 'var-id',     // Selected variation (if applicable)
  variables[].value: 'user input'  // User-entered values
}
```

## Key Architectural Patterns

### 1. Event Delegation with Data Attributes

**Pattern:**
```javascript
setupEventListeners() {
  document.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action && typeof this[action] === 'function') {
      this[action](e);
    }
  });
}
```

**Usage in HTML:**
```html
<button data-action="handleClick" data-id="123">Click me</button>
```

This allows dynamic content to have working event handlers without re-attaching listeners.

### 2. Card & Modal Synchronization

When state changes (e.g., variable input, variation selection), both the summary card AND the open modal must update:

```javascript
refreshPromptViews(index) {
  // Update the card in the grid/list
  if (index !== null && index !== undefined) {
    this.updatePromptCard(index);
  }

  // Update the open modal if it exists
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

**Critical Rule:** Always call `refreshPromptViews(index)` after state changes, never update card or modal individually.

### 3. Template Compilation

Variable substitution uses simple string replacement:

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

## Data Structure: prompts.json

### Standard Prompt (Single Template)
```json
{
  "id": "unique-id",
  "title": "Prompt Title",
  "description": "Brief description",
  "category": "Productivity",
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
```

### Prompt with Variations
```json
{
  "id": "unique-id",
  "title": "Prompt Title",
  "description": "Brief description",
  "category": "Productivity",
  "variables": [...],  // Shared across all variations
  "variations": [
    {
      "id": "variation-1",
      "name": "Variation Name",
      "template": "First template with {{variable}}"
    },
    {
      "id": "variation-2",
      "name": "Another Style",
      "template": "Second template with {{variable}}"
    }
  ]
}
```

**Important Rules:**
- Prompts with variations do NOT have a `template` property
- Variables are shared across all variations
- First variation is selected by default
- Variation selector only appears when 2+ variations exist

### Variable Input Types

#### Text Input (Default)
```json
{
  "name": "variable_name",
  "label": "Display Label",
  "placeholder": "Example value",
  "value": ""
}
```

#### Textarea Input
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

#### Toggle Input
```json
{
  "name": "variable_name",
  "label": "Display Label",
  "inputType": "toggle",
  "options": [
    "Text when OFF",
    "Text when ON"
  ],
  "value": ""
}
```

#### Conditional Fields (with dependsOn/hideWhen)
```json
{
  "name": "mode",
  "inputType": "toggle",
  "options": ["Option A", "Option B"],
  "value": ""
},
{
  "name": "conditional_field",
  "label": "Conditional Field",
  "dependsOn": "mode",
  "hideWhen": "Option A",
  "value": ""
}
```

**CRITICAL:** DO NOT use `inputType: "select"`, `"checkbox"`, or `"radio"` - they are not supported.

## UI Views and States

### View Modes
1. **List View** (default): Prompts organized by category with section headers, table-like rows
2. **Grid View**: Fixed 300px cards with category color coding

### Modal States
1. **Locked** (default): Shows Variables/Preview tabs, Copy + Download buttons
2. **Editable**: Shows template textarea, Save Changes button

### Component Behaviors

#### Category Filter Chips
- "All" chip is active by default
- Clicking a category filters the grid
- Active chip highlighted with primary color

#### Search
- Debounced input (300ms delay)
- Searches title and description fields
- Updates `filteredPrompts` array

#### Modal Animations
- Opens: Spring-like animation (scale 0.85 → 1.02 → 1.0)
- Closes: Simple fade + scale (0.25s)
- Background: 16px blur with saturation boost

## CSS Architecture

### Design System
Uses CSS custom properties defined in `tokens.css` and `styles.css`:

```css
:root {
  /* Colors */
  --color-page-background: #fafafa;
  --color-card-surface: #ffffff;
  --color-text-primary: rgba(0, 0, 0, 0.87);
  --color-action-primary: #6750a4;

  /* Motion */
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);

  /* State layers */
  --md-sys-state-hover-opacity: 0.08;

  /* Category colors */
  --color-category-productivity: #4285f4;
  --color-category-expertise: #9c27b0;
  --color-category-travel: #0f9d58;
}
```

### Critical CSS Rules

1. **NEVER use `!important`** - Fix specificity issues properly
2. **NEVER use hardcoded colors** - Always use CSS variables
3. **NEVER change background colors on hover** - Use state layer overlays
4. **ALWAYS use motion tokens** - Never use magic numbers like `0.2s`

### State Layer Pattern (Required for Hover Effects)
```css
.interactive {
  position: relative;
  overflow: hidden;
}

.interactive::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--color-action-primary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.interactive:hover::before {
  opacity: var(--md-sys-state-hover-opacity);
}
```

## Adding New Prompts

### Workflow
1. Edit `prompts.json` directly
2. Add new prompt object with unique `id`
3. Ensure `category` matches existing categories (or add new category)
4. Use `{{variable}}` syntax in template
5. Define variables with matching `name` properties
6. Reload page - no build step needed

### Category Conventions
Current taxonomy:
- **Productivity** - Work-related tasks, writing, organization
- **Expertise** - Domain-specific knowledge, analysis, review
- **Travel & Shopping** - Planning, recommendations, comparisons
- **Lifestyle** (optional) - Personal development, creativity
- **Inspiration** (optional) - Creative prompts, ideation

**Rule:** Reuse existing categories when possible to keep filter chips consistent.

### Variable Input Heuristics
The app auto-detects when to use textareas:
- Labels/placeholders mentioning "text", "notes", "email", "content"
- Automatically rendered as multi-line textareas
- Auto-resize up to 50vh height cap

## Development Workflow

### Local Development
```bash
# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Git and Deployment
```bash
# After making changes
git add .
git commit -m "Description of changes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub (auto-deploys to Vercel)
git push origin main
```

**Important:**
- Always commit changes
- Push to main branch for auto-deployment
- Vercel serves from main branch
- Custom domain: p.weaver-yuwono.com

## Security

### XSS Prevention
Always escape user input before rendering:

```javascript
escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Use when rendering user content
renderUserContent(content) {
  return `<div>${this.escapeHTML(content)}</div>`;
}
```

## Common Patterns

### Clipboard API
```javascript
async copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    this.showToast('Copied to clipboard!');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.showToast('Copied to clipboard!');
  }
}
```

### Toast Notifications
```javascript
showToast(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger reflow for animation
  toast.offsetHeight;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
```

### LocalStorage
```javascript
// Save state
localStorage.setItem('key', JSON.stringify(value));

// Load state
const value = JSON.parse(localStorage.getItem('key') || 'null');
```

## Important Deviations from Original Requirements

The actual implementation differs from the requirements document in these ways:

1. **Architecture**: Single class in `app.js` instead of separate component modules
2. **JSON structure**: Flat array instead of wrapped object
3. **Data attributes**: Uses `name` instead of `key` for variables
4. **UI workflow**: Summary cards + modal overlay (not inline expansion)
5. **State properties**: Uses `locked` and `activeTab` on prompt objects directly

**Rule:** Follow the actual implementation patterns, not the requirements document.

## Documentation Maintenance

When making significant changes:

1. **Update code files** first
2. **Update CLAUDE.md** to reflect implementation changes
3. **Update this skill** if architectural patterns change
4. **Commit all changes together** to keep documentation in sync

## When to Use This Skill

✅ **Use this skill when:**
- Adding new features to the Prompt Library
- Modifying existing prompts or UI components
- Understanding the application architecture
- Debugging state management issues
- Adding new variable input types
- Implementing new modal behaviors

❌ **Do not use this skill for:**
- General vanilla JavaScript questions (use vanilla-js-development skill)
- CSS/styling questions (use material-design-css skill)
- Unrelated projects

## Quick Reference

### File Locations
- Main app logic: `app.js`
- Prompts data: `prompts.json`
- Styles: `styles.css`, `tokens.css`
- Documentation: `CLAUDE.md`
- Skills: `skills/*/SKILL.md`

### Key Methods
- `loadPrompts()` - Fetch and parse prompts.json
- `filterPrompts()` - Apply search and category filters
- `renderPromptGrid()` - Render prompt cards
- `openPromptModal(promptId)` - Open detail modal
- `compilePrompt(prompt)` - Compile template with variables
- `refreshPromptViews(index)` - Sync card and modal state
- `copyToClipboard(text)` - Copy compiled prompt

### Common Tasks
- Add prompt: Edit `prompts.json`, reload
- Add category: Add to prompts, update CSS variables
- Add variable type: Extend variable rendering logic in app.js
- Change styling: Edit `styles.css` using design tokens
- Deploy: Commit and push to main branch
