# Components Summary

This document outlines the core UI components in the Prompt Library application, detailing their functional requirements and structural implementation. This serves as a reference for design system adaptation while preserving existing functionality.

---

## 1. Application Header

**Purpose**: Top-level navigation and branding container

**Functional Requirements**:
- Display application logo and title
- Provide access to external AI tools link
- Show hamburger menu for mobile navigation
- Maintain fixed position at viewport top

**Structure**:
```html
<header class="app-header">
  <div class="logo-container">
    <img src="logo.svg" alt="Logo" class="logo">
    <h1 class="app-title">Prompt Library</h1>
  </div>
  <nav class="header-actions">
    <a href="#" class="ai-tools-link">AI Tools</a>
    <button class="hamburger-menu">☰</button>
  </nav>
</header>
```

**Behavioral Notes**:
- Logo and title align left
- Navigation actions align right
- Flexbox layout for responsive distribution
- Hamburger menu only visible on mobile

---

## 2. Controls Bar

**Purpose**: Primary filtering and view mode controls

**Functional Requirements**:
- Search input for filtering prompts by title/description
- View toggle between list and grid layouts
- Toggle for showing/hiding descriptions and variable counts
- Category filter chips for taxonomy filtering
- Compact 64px minimum height

**Structure**:
```html
<div class="controls-bar">
  <div class="search-container">
    <input type="search" placeholder="Search prompts..." class="search-input">
  </div>

  <div class="view-controls">
    <button class="view-toggle" data-view="list">List</button>
    <button class="view-toggle" data-view="grid">Grid</button>
  </div>

  <button class="details-toggle">Show Details</button>

  <div class="category-chips">
    <button class="chip active" data-category="all">All</button>
    <button class="chip" data-category="Productivity">Productivity</button>
    <button class="chip" data-category="Expertise">Expertise</button>
    <!-- Additional categories... -->
  </div>
</div>
```

**Behavioral Notes**:
- Search filters on input (debounced)
- View toggle updates entire prompt container layout
- Details toggle shows/hides descriptions and variable counts
- Only one chip can be active at a time
- Active chip highlighted with distinct style

---

## 3. Prompt Card (Grid View)

**Purpose**: Summary display of individual prompt in grid layout

**Functional Requirements**:
- Display prompt title
- Show category badge with color coding
- Show variable count badge
- Optionally display description (toggle-able)
- Entire card clickable to open modal
- Fixed 300px width, auto-fills horizontally

**Structure**:
```html
<article class="prompt-card" data-category="Productivity" tabindex="0">
  <div class="card-header">
    <span class="category-badge">Productivity</span>
    <span class="variable-count-badge">3 variables</span>
  </div>

  <h3 class="card-title">Prompt Title</h3>

  <p class="card-description" hidden>
    Brief description of what this prompt does
  </p>
</article>
```

**Behavioral Notes**:
- Category determines badge color via `data-category` attribute
- Description visibility controlled by global details toggle
- Keyboard accessible (Enter/Space opens modal)
- Hover state with elevation change
- Card background neutral with rounded corners

**Category Color Mapping**:
- Productivity: Blue accent
- Expertise: Purple accent
- Travel & Shopping: Green accent

---

## 4. Prompt Row (List View)

**Purpose**: Compact row display of individual prompt in list layout

**Functional Requirements**:
- Display prompt title
- Show category badge
- Show variable count badge
- Optionally display description (toggle-able)
- Entire row clickable to open modal
- Organized by category sections with headers

**Structure**:
```html
<section class="category-section">
  <h2 class="section-header">Productivity</h2>

  <div class="prompt-rows">
    <article class="prompt-row" tabindex="0">
      <div class="row-main">
        <h3 class="row-title">Prompt Title</h3>
        <div class="badges">
          <span class="category-badge">Productivity</span>
          <span class="variable-count-badge">3 variables</span>
        </div>
      </div>

      <p class="row-description" hidden>
        Brief description of what this prompt does
      </p>
    </article>
    <!-- More rows... -->
  </div>
</section>
```

**Behavioral Notes**:
- Transparent backgrounds, no gaps between rows
- Table-like layout for information density
- Section headers group prompts by category
- Description visibility controlled by global details toggle
- Minimal padding for compact display

---

## 5. Prompt Detail Modal

**Purpose**: Full editing and preview interface for individual prompt

**Functional Requirements**:
- Display full prompt details (title, category, description)
- Toggle between locked and editable modes
- Show variation selector (when variations exist)
- Provide tabbed interface (Variables/Preview) in locked mode
- Show action buttons (Copy, Download, Save)
- Animate open/close with spring-like easing
- Blur background without dark overlay

**Structure**:
```html
<div class="modal-overlay">
  <div class="prompt-modal">
    <header class="modal-header">
      <div class="modal-title-group">
        <h2 class="modal-title">Prompt Title</h2>
        <span class="modal-category-badge">Productivity</span>
      </div>

      <div class="modal-toolbar">
        <button class="edit-toggle-btn">
          <span class="lock-icon">🔒</span>
          Edit prompt
        </button>
        <button class="modal-close-btn">×</button>
      </div>
    </header>

    <div class="modal-description">
      Brief description of what this prompt does
    </div>

    <!-- Variation selector (conditional) -->
    <div class="variation-selector" hidden>
      <label>Style:</label>
      <select class="variation-dropdown">
        <option value="standard">Standard</option>
        <option value="casual">Casual & Conversational</option>
      </select>
    </div>

    <div class="modal-body">
      <!-- LOCKED STATE: Tabs + Variables/Preview -->
      <div class="tab-interface">
        <div class="tab-buttons">
          <button class="tab-btn active" data-tab="variables">Variables</button>
          <button class="tab-btn" data-tab="preview">Preview</button>
        </div>

        <div class="tab-content active" data-tab-content="variables">
          <!-- Variable inputs rendered here -->
        </div>

        <div class="tab-content" data-tab-content="preview">
          <pre class="preview-text">Compiled prompt text...</pre>
        </div>
      </div>

      <!-- EDITABLE STATE: Full-width textarea -->
      <div class="template-editor" hidden>
        <textarea class="template-textarea">Template with {{variables}}...</textarea>
      </div>
    </div>

    <footer class="modal-actions">
      <!-- LOCKED STATE -->
      <button class="btn btn-secondary">Download</button>
      <button class="btn btn-primary">Copy to Clipboard</button>

      <!-- EDITABLE STATE -->
      <button class="btn btn-primary save-btn" hidden>Save Changes</button>
    </footer>
  </div>
</div>
```

**Behavioral Notes**:
- Opens with scale animation: 85% → 102% → 100% (0.45s)
- Closes faster (0.25s) with simple fade
- Background blur: 16px with saturation boost
- Header/description/actions fixed, only body scrolls
- Template textarea max-height: 60vh
- Action buttons horizontal on desktop, stack on mobile
- Lock icon hidden entirely in edit mode (not just relabeled)
- Modal remains open while state syncs back to underlying card

---

## 6. Variable Input Controls

**Purpose**: Input fields for prompt variable substitution

**Functional Requirements**:
- Support text input (single-line)
- Support textarea input (multi-line)
- Support toggle input (binary choice)
- Conditional field visibility (dependsOn/hideWhen)
- Auto-resize textareas up to 50vh
- Escape user input to prevent XSS
- Persist values via localStorage

**Structure**:

### Text Input
```html
<div class="variable-field">
  <label class="variable-label">Display Label</label>
  <input
    type="text"
    class="variable-input"
    placeholder="Example value"
    data-variable-name="variable_name"
  >
</div>
```

### Textarea Input
```html
<div class="variable-field">
  <label class="variable-label">Display Label</label>
  <textarea
    class="variable-input variable-textarea"
    rows="10"
    placeholder="Example value"
    data-variable-name="variable_name"
  ></textarea>
</div>
```

### Toggle Input
```html
<div class="variable-field variable-toggle-field">
  <label class="variable-label variable-toggle-label">
    <span class="toggle-label-text">Display Label</span>
    <div class="toggle-switch">
      <input
        type="checkbox"
        class="toggle-input"
        data-variable-name="variable_name"
        data-off-value="Text when OFF"
        data-on-value="Text when ON"
      >
      <span class="toggle-slider"></span>
    </div>
  </label>
</div>
```

**Behavioral Notes**:
- Text inputs use single-line by default
- Textareas auto-resize based on content
- Toggle switches use Material Design pattern
- Conditional fields use `data-depends-on` and `data-hide-when` attributes
- Input values update preview in real-time
- All inputs sanitized before rendering

---

## 7. Tab Interface

**Purpose**: Switch between Variables and Preview views in locked modal state

**Functional Requirements**:
- Two tabs: Variables (default) and Preview
- Active tab highlighted
- Content area updates based on active tab
- Keyboard accessible (Arrow keys navigate tabs)

**Structure**:
```html
<div class="tab-interface">
  <div class="tab-buttons" role="tablist">
    <button
      class="tab-btn active"
      role="tab"
      aria-selected="true"
      data-tab="variables"
    >
      Variables
    </button>
    <button
      class="tab-btn"
      role="tab"
      aria-selected="false"
      data-tab="preview"
    >
      Preview
    </button>
  </div>

  <div class="tab-content active" data-tab-content="variables">
    <!-- Variables form -->
  </div>

  <div class="tab-content" data-tab-content="preview">
    <!-- Compiled preview -->
  </div>
</div>
```

**Behavioral Notes**:
- Only one tab active at a time
- Tab content fades in/out on switch
- Preview updates in real-time as variables change
- Tab buttons have focus-visible states

---

## 8. Category Filter Chips

**Purpose**: Filter prompts by category taxonomy

**Functional Requirements**:
- Display all available categories plus "All" option
- Highlight active category
- Filter prompt display on click
- Update count of visible prompts

**Structure**:
```html
<div class="category-chips" role="tablist">
  <button
    class="chip active"
    role="tab"
    aria-selected="true"
    data-category="all"
  >
    All
  </button>
  <button
    class="chip"
    role="tab"
    aria-selected="false"
    data-category="Productivity"
  >
    Productivity
  </button>
  <!-- More chips... -->
</div>
```

**Behavioral Notes**:
- "All" chip active by default
- Only one chip active at a time
- Active chip uses purple highlight
- Clicking chip filters both grid and list views
- Categories derived from prompts.json data

---

## 9. Toast Notification

**Purpose**: Temporary feedback for user actions

**Functional Requirements**:
- Display confirmation messages ("Copied!", "Saved!")
- Auto-dismiss after 3 seconds
- Appear above modals (high z-index)
- Slide in from top or bottom

**Structure**:
```html
<div class="toast show">
  <span class="toast-icon">✓</span>
  <span class="toast-message">Copied to clipboard!</span>
</div>
```

**Behavioral Notes**:
- Animates in with slide + fade
- Automatically removes after duration
- Multiple toasts stack vertically
- High z-index ensures visibility over modals

---

## 10. Button Components

**Purpose**: Consistent action triggers throughout application

**Functional Requirements**:
- Support primary and secondary variants
- Support small size modifier
- Uppercase text styling
- Pill-shaped (rounded corners)
- Hover/focus/active states

**Structure**:
```html
<!-- Primary button -->
<button class="btn btn-primary">Copy to Clipboard</button>

<!-- Secondary button -->
<button class="btn btn-secondary">Download</button>

<!-- Small button -->
<button class="btn btn-sm">Edit</button>
```

**Behavioral Notes**:
- `.btn` provides base styles (uppercase, pill shape)
- `.btn-primary` for main actions (filled, high contrast)
- `.btn-secondary` for secondary actions (outlined)
- `.btn-sm` reduces padding and font size
- All buttons use state layer overlays for hover (no direct background color changes)

---

## Global Design Patterns

### State Layers
All interactive elements use Material Design 3 state layers for hover/focus/pressed states:
- Implemented with `::before` or `::after` pseudo-elements
- Opacity controlled by CSS variables (`--md-sys-state-hover-opacity`, etc.)
- Never change background colors directly on hover

### Color Variables
All colors referenced via CSS custom properties:
- `--color-page-background`
- `--color-card-surface`
- `--color-surface-hover`
- `--color-border-subtle`
- `--color-text-primary`
- `--color-text-secondary`
- `--color-action-primary`
- `--color-action-primary-hover`
- Category colors: `--color-category-productivity`, `--color-category-expertise`, etc.

### Motion Tokens
All animations use motion token variables:
- Durations: `--md-sys-motion-duration-short2`, `--md-sys-motion-duration-medium2`, `--md-sys-motion-duration-long1`
- Easing: `--md-sys-motion-easing-standard`, `--md-sys-motion-easing-emphasized`, `--md-sys-motion-easing-legacy`

### Accessibility Requirements
- All interactive elements have `:focus-visible` states
- Focus outline: `3px solid var(--color-action-primary)` with `2px` offset
- Adequate color contrast (WCAG AA minimum)
- Keyboard navigation support throughout
- ARIA attributes for semantic structure

### Typography Scale
- Display font: Playfair Display (modal titles)
- Body font: System font stack
- Consistent scale for headings, body, labels, captions

---

## Data Flow

### Event Delegation
All card/row events use `data-action` attributes:
```javascript
// Example pattern
element.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  // Dispatch to handler
});
```

### State Synchronization
Modal and underlying card stay in sync via `refreshPromptViews()`:
- Updates summary card when index provided
- Updates open modal if prompt ID matches
- Closes modal if filtered prompt no longer exists

### Variable Substitution
Template compilation uses string replacement:
```javascript
// Pseudo-code
compiled = template.split('{{variable}}').join(value || '');
```

### Variation Handling
When variations exist:
- Dropdown selector appears above variables section
- First variation selected by default
- User input preserved when switching variations
- Only template changes; variables stay the same

---

## Implementation Notes

### No Framework Dependencies
- Pure vanilla JavaScript
- No build process
- Zero npm dependencies
- Static file deployment

### Session-Only Edits
- Template modifications don't persist
- Values stored in localStorage only
- Original templates from prompts.json remain unchanged

### XSS Protection
All user input escaped via `escapeHTML()` before rendering:
```javascript
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
```

### Browser Support
- Modern clipboard API with fallback
- CSS Grid and Flexbox for layout
- CSS custom properties for theming
- No IE11 support required
