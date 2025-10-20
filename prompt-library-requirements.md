# Prompt Library - Technical Requirements

## Project Overview

A personal prompt management tool for storing, customizing, and copying reusable prompts with variable substitution. Built as a vanilla JavaScript application with zero dependencies and no build process.

## Core Objectives

1. **Simplicity First**: Minimize complexity; prefer straightforward implementations
2. **Modularity**: Component-based architecture enabling easy addition of new prompts
3. **Session-Only Edits**: Template modifications don't persist across page reloads
4. **Single-User Context**: No authentication, no database, no server-side logic

## Functional Requirements

### Primary Use Cases

#### Use Case 1: Quick Prompt Copy
1. User views list of available prompts
2. User enters values for prompt variables (e.g., "topic")
3. User clicks "Copy to Clipboard"
4. System compiles prompt by replacing `{{variable}}` placeholders with user inputs
5. System copies compiled prompt to clipboard
6. System provides visual feedback (success message)

#### Use Case 2: Edit and Copy
1. User clicks "Unlock & Edit" on a prompt card
2. System reveals editable textarea with current template
3. User modifies template text directly
4. User clicks "Save Changes"
5. System re-enables variable inputs with edited template
6. User enters variable values
7. User clicks "Copy to Clipboard"
8. System compiles and copies edited version
9. **Note**: Edits are session-only; page reload reverts to original

### Variable System

- Prompts can have 1 to n variables
- Variables use `{{variableName}}` syntax in templates
- Each variable has:
  - `key`: Used in template substitution
  - `label`: Display name for input field
  - `placeholder`: Example text for user guidance

### State Management

Application maintains three state objects (session-only):

```javascript
{
  unlocked: { promptId: boolean },    // Edit mode toggle
  edits: { promptId: string },        // Modified templates
  inputs: { promptId: { var: val } }  // User-entered values
}
```

## Technical Architecture

### File Structure

```
/prompt-library
├── index.html           # Main HTML structure
├── styles.css          # All styling
├── app.js              # Main orchestration
├── prompts.json        # Prompt data
└── components/
    ├── promptCard.js      # Card rendering
    └── templateParser.js  # Variable substitution
```

### Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern layout (Grid/Flexbox)
- **Vanilla JavaScript (ES6+)**: Modules, async/await, arrow functions
- **No frameworks**: No React, Vue, or similar
- **No build tools**: No webpack, Vite, or bundlers
- **No dependencies**: No npm packages

### Data Structure

**prompts.json** schema:

```json
{
  "prompts": [
    {
      "id": "unique-identifier",
      "title": "Prompt Display Name",
      "description": "Brief description of prompt purpose",
      "template": "Template text with {{variable}} placeholders",
      "variables": [
        {
          "key": "variable",
          "label": "Variable Label",
          "placeholder": "Example value"
        }
      ]
    }
  ]
}
```

### Component Specifications

#### promptCard.js

**Purpose**: Generate HTML for individual prompt cards

**Exports**: `createPromptCard(prompt, state)`

**Returns**: HTML string

**Responsibilities**:
- Render prompt title and description
- Generate input fields for each variable
- Display template in locked or unlocked state
- Render action buttons based on state

**States**:
- **Locked** (default): Variables visible, template hidden, "Copy" + "Unlock" buttons
- **Unlocked**: Variables hidden, editable template visible, "Save Changes" button

#### templateParser.js

**Purpose**: Handle variable substitution

**Exports**: `replaceVariables(template, variables)`

**Logic**:
```javascript
// Input: "Create essay about {{topic}} focusing on {{angle}}"
// Variables: { topic: "AI", angle: "ethics" }
// Output: "Create essay about AI focusing on ethics"
```

**Edge Cases**:
- Missing variables → Leave placeholder as-is
- Empty variable values → Replace with empty string
- Multiple instances of same variable → Replace all

#### app.js

**Purpose**: Application orchestration

**Responsibilities**:
1. Fetch prompts.json on page load
2. Initialize state object
3. Render all prompt cards
4. Set up event delegation on container
5. Handle user interactions:
   - Variable input changes
   - Copy to clipboard
   - Unlock/lock toggle
   - Template editing
   - Save changes

**Event Handling Pattern**:
Use event delegation on `#prompts-container` with data attributes:
- `data-action="copy"` → Copy handler
- `data-action="unlock"` → Unlock handler
- `data-action="save"` → Save handler
- `data-id="promptId"` → Identify target prompt

## User Interface Requirements

### Layout

- Single-column layout for prompt cards
- Maximum width: 800px, centered
- Responsive: Stack elements vertically on mobile

### Prompt Card Design

**Elements** (in order):
1. **Header**: Title + description
2. **Variables Section**: Input fields (visible in locked state)
3. **Template Section**: Editable textarea (visible in unlocked state)
4. **Actions**: Button row (changes based on state)

**Visual States**:
- Default: Subtle border, white background
- Unlocked: Highlighted border (e.g., blue accent)
- Focus: Clear focus indicators for accessibility

### Interactions

- **Copy Success**: Brief toast/message ("Copied!")
- **Button States**: Clear hover/active states
- **Textarea**: Auto-resize to content height when unlocked

### Styling Guidelines

- Clean, minimal aesthetic
- Adequate whitespace between cards
- Clear visual hierarchy (title > description > inputs)
- Accessible: WCAG AA contrast ratios, keyboard navigation

## Example Prompts

Include these three prompts in initial `prompts.json`:

### 1. Audio Essay Generator
```json
{
  "id": "audio-essay",
  "title": "Audio Essay Generator",
  "description": "Creates engaging essays optimized for listening",
  "template": "Create an engaging audio essay about {{topic}}. Use conversational language suitable for listening, include compelling narratives and examples, maintain a warm and authoritative tone, and structure it with clear transitions. Aim for 5-7 minutes of listening time.",
  "variables": [
    {
      "key": "topic",
      "label": "Essay Topic",
      "placeholder": "e.g., The evolution of design systems"
    }
  ]
}
```

### 2. Code Review Assistant
```json
{
  "id": "code-review",
  "title": "Code Review Assistant",
  "description": "Generates thorough code review guidelines",
  "template": "Review this {{language}} code with focus on {{focus}}. Provide specific, actionable feedback organized by: 1) Critical issues, 2) Improvements, 3) Positive observations. Include code examples where helpful.",
  "variables": [
    {
      "key": "language",
      "label": "Programming Language",
      "placeholder": "e.g., JavaScript"
    },
    {
      "key": "focus",
      "label": "Review Focus",
      "placeholder": "e.g., performance, security, readability"
    }
  ]
}
```

### 3. Meeting Prep
```json
{
  "id": "meeting-prep",
  "title": "Meeting Preparation",
  "description": "Generates meeting preparation framework",
  "template": "Help me prepare for a {{meeting_type}} about {{topic}}. Provide: 1) Key questions to ask, 2) Potential discussion points, 3) Possible outcomes, 4) Follow-up actions. Context: {{context}}",
  "variables": [
    {
      "key": "meeting_type",
      "label": "Meeting Type",
      "placeholder": "e.g., client kickoff, team retrospective"
    },
    {
      "key": "topic",
      "label": "Main Topic",
      "placeholder": "e.g., Q4 product strategy"
    },
    {
      "key": "context",
      "label": "Additional Context",
      "placeholder": "e.g., First meeting with new stakeholder"
    }
  ]
}
```

## Implementation Guidelines

### Code Quality Standards

1. **ES6+ Features**: Use modern JavaScript (modules, arrow functions, template literals)
2. **Pure Functions**: Keep components stateless where possible
3. **Single Responsibility**: Each function does one thing well
4. **Descriptive Naming**: Clear variable and function names
5. **Comments**: Document non-obvious logic only

### Browser Compatibility

Target: Modern evergreen browsers (last 2 versions)
- Chrome/Edge
- Firefox
- Safari

No IE11 support required.

### Performance Considerations

- Render optimization: Use DocumentFragment for batch DOM updates
- Event delegation: Single listener on container vs. per-card listeners
- Minimal re-renders: Only update changed state

### Accessibility Requirements

- Semantic HTML5 elements
- ARIA labels where needed
- Keyboard navigation support (Tab, Enter, Escape)
- Focus management in unlocked state
- Screen reader friendly

## Testing Scenarios

### Manual Test Cases

1. **Load Application**
   - All prompts render correctly
   - No console errors

2. **Basic Copy Flow**
   - Enter variable values
   - Click copy
   - Verify clipboard contains compiled prompt
   - Verify success feedback appears

3. **Edit Flow**
   - Click unlock
   - Modify template text
   - Click save
   - Enter variable values
   - Copy and verify edited template used

4. **Multi-Variable Handling**
   - Test prompt with 3 variables
   - Verify all substitutions work
   - Test with some variables empty

5. **Session Persistence**
   - Make edits to template
   - Refresh page
   - Verify reverts to original

6. **Edge Cases**
   - Empty variable values
   - Special characters in inputs
   - Very long template text
   - Rapid clicking of buttons

## Deployment

### Hosting Options

1. **GitHub Pages**: Push to repo, enable in settings
2. **Netlify**: Drag-and-drop deployment
3. **Local**: Open `index.html` in browser

All options work identically (static files only).

### File Serving

- All files must be accessible via relative paths
- JSON file loaded via fetch (requires http:// or https://)
- For local testing, use `python -m http.server` or similar

## Future Extensibility

The architecture should support future additions:

1. **New Prompts**: Add to JSON, no code changes
2. **Categories/Tags**: Add to data structure, filter UI
3. **Search**: Filter prompts by keyword
4. **Export/Import**: JSON download/upload
5. **Keyboard Shortcuts**: Ctrl+C to copy, E to edit, etc.

Design decisions should not preclude these additions.

## Success Criteria

The implementation is successful when:

1. ✅ User can copy any prompt with variables in under 10 seconds
2. ✅ User can edit any template and copy modified version
3. ✅ Adding new prompts requires only JSON editing
4. ✅ Code is clean, readable, and well-organized
5. ✅ Application works without internet (after initial load)
6. ✅ No runtime errors in browser console
7. ✅ Responsive on mobile and desktop

## Out of Scope

The following are explicitly NOT required:

- User authentication
- Prompt persistence across sessions (for edits)
- Server-side logic
- Database integration
- Complex state management libraries
- CSS preprocessors
- TypeScript
- Testing frameworks
- Analytics/tracking
- Multi-user support
- Prompt sharing features
- Version control for prompts

---

**Document Version**: 1.0  
**Last Updated**: October 19, 2025  
**Target Completion**: Single development session
