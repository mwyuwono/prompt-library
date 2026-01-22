---
name: material-design-css
description: Expert guidance for implementing Material Design 3 principles using vanilla CSS. Use this skill when building interfaces with Material Design aesthetics, motion tokens, state layers, and design system best practices.
---

# Material Design 3 CSS Skill

## Core Principles

### Design Tokens Over Magic Numbers
**CRITICAL**: Never use hardcoded values. Always use CSS custom properties (variables).

❌ **WRONG:**
```css
.button {
  background-color: #6750a4;
  transition: 0.2s ease;
  border-radius: 8px;
}
```

✅ **CORRECT:**
```css
.button {
  background-color: var(--color-action-primary);
  transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
  border-radius: var(--md-sys-shape-corner-small);
}
```

### CSS Variable Architecture

#### Color Tokens
Define semantic color names, not descriptive ones:
```css
:root {
  /* Surface colors */
  --color-page-background: #fafafa;
  --color-card-surface: #ffffff;
  --color-surface-hover: #f5f5f5;

  /* Text colors */
  --color-text-primary: rgba(0, 0, 0, 0.87);
  --color-text-secondary: rgba(0, 0, 0, 0.60);
  --color-text-disabled: rgba(0, 0, 0, 0.38);

  /* Action colors */
  --color-action-primary: #6750a4;
  --color-action-primary-hover: #7965af;

  /* Border colors */
  --color-border-subtle: rgba(0, 0, 0, 0.08);
  --color-border-medium: rgba(0, 0, 0, 0.12);

  /* Category/accent colors */
  --color-category-productivity: #4285f4;
  --color-category-expertise: #9c27b0;
  --color-category-travel: #0f9d58;
}
```

#### Motion Tokens
Use Material Design 3 motion system:
```css
:root {
  /* Durations */
  --md-sys-motion-duration-short1: 50ms;
  --md-sys-motion-duration-short2: 100ms;
  --md-sys-motion-duration-short3: 150ms;
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms;
  --md-sys-motion-duration-medium2: 300ms;
  --md-sys-motion-duration-medium3: 350ms;
  --md-sys-motion-duration-medium4: 400ms;
  --md-sys-motion-duration-long1: 450ms;
  --md-sys-motion-duration-long2: 500ms;
  --md-sys-motion-duration-long3: 550ms;
  --md-sys-motion-duration-long4: 600ms;

  /* Easing curves */
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-legacy: cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### State Layer Opacities
Material Design 3 uses overlay states, not background color changes:
```css
:root {
  --md-sys-state-hover-opacity: 0.08;
  --md-sys-state-focus-opacity: 0.12;
  --md-sys-state-pressed-opacity: 0.12;
  --md-sys-state-dragged-opacity: 0.16;
}
```

## State Layer Pattern

### The Correct Way to Implement Hover Effects

**CRITICAL**: NEVER change background colors on hover. Always use pseudo-element overlays.

❌ **WRONG:**
```css
.button {
  background-color: var(--color-action-primary);
}

.button:hover {
  background-color: var(--color-action-primary-hover); /* BAD! */
}
```

✅ **CORRECT:**
```css
.button {
  position: relative;
  overflow: hidden;
  background-color: var(--color-action-primary);
}

/* State layer overlay */
.button::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: currentColor; /* or specific color */
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.button:hover::before {
  opacity: var(--md-sys-state-hover-opacity);
}

.button:focus-visible::before {
  opacity: var(--md-sys-state-focus-opacity);
}

.button:active::before {
  opacity: var(--md-sys-state-pressed-opacity);
}
```

### State Layers for Different Element Types

#### Cards
```css
.card {
  position: relative;
  overflow: hidden;
  background-color: var(--color-card-surface);
  transition: box-shadow var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--color-text-primary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.card:hover::before {
  opacity: var(--md-sys-state-hover-opacity);
}
```

#### List Items
```css
.list-item {
  position: relative;
  overflow: hidden;
}

.list-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--color-action-primary);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.list-item:hover::before {
  opacity: var(--md-sys-state-hover-opacity);
}
```

## Color Mixing with CSS

Use `color-mix()` for creating tinted backgrounds:
```css
.category-badge {
  background-color: color-mix(
    in srgb,
    var(--category-color) 16%,
    var(--color-card-surface)
  );
  color: var(--category-color);
}
```

This creates a subtle tint of the category color mixed with the base surface color.

## Elevation and Shadows

Material Design uses elevation levels:
```css
:root {
  --md-sys-elevation-1: 0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-2: 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15);
  --md-sys-elevation-3: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.3);
  --md-sys-elevation-4: 0 6px 10px 4px rgba(0, 0, 0, 0.15), 0 2px 3px rgba(0, 0, 0, 0.3);
  --md-sys-elevation-5: 0 8px 12px 6px rgba(0, 0, 0, 0.15), 0 4px 4px rgba(0, 0, 0, 0.3);
}

.card {
  box-shadow: var(--md-sys-elevation-1);
}

.modal {
  box-shadow: var(--md-sys-elevation-5);
}
```

## Typography System

### Type Scale
```css
:root {
  /* Display styles */
  --md-sys-typescale-display-large-size: 57px;
  --md-sys-typescale-display-large-line-height: 64px;
  --md-sys-typescale-display-large-weight: 400;

  /* Headline styles */
  --md-sys-typescale-headline-large-size: 32px;
  --md-sys-typescale-headline-large-line-height: 40px;
  --md-sys-typescale-headline-large-weight: 400;

  /* Body styles */
  --md-sys-typescale-body-large-size: 16px;
  --md-sys-typescale-body-large-line-height: 24px;
  --md-sys-typescale-body-large-weight: 400;

  /* Label styles */
  --md-sys-typescale-label-large-size: 14px;
  --md-sys-typescale-label-large-line-height: 20px;
  --md-sys-typescale-label-large-weight: 500;
}

.headline {
  font-size: var(--md-sys-typescale-headline-large-size);
  line-height: var(--md-sys-typescale-headline-large-line-height);
  font-weight: var(--md-sys-typescale-headline-large-weight);
}
```

## Transitions and Animations

### Standard Transitions
```css
/* Short interactions (hover, focus) */
.interactive {
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

/* Medium interactions (expand/collapse) */
.expandable {
  transition: max-height var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-legacy);
}

/* Long interactions (modals, page transitions) */
.modal {
  transition: all var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-emphasized);
}
```

### Emphasized Motion
Material Design 3 uses emphasized easing for important transitions:
```css
.modal.show {
  animation: modal-enter var(--md-sys-motion-duration-long1) var(--md-sys-motion-easing-emphasized);
}

@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  50% {
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Smooth Max-Height Transitions
For accordion-style reveals:
```css
.collapsible {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition:
    max-height var(--md-sys-motion-duration-medium2) var(--md-sys-motion-easing-legacy),
    opacity var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.collapsible.expanded {
  max-height: 500px; /* Set to reasonable max */
  opacity: 1;
}
```

## Shape and Borders

### Corner Radius Tokens
```css
:root {
  --md-sys-shape-corner-none: 0;
  --md-sys-shape-corner-extra-small: 4px;
  --md-sys-shape-corner-small: 8px;
  --md-sys-shape-corner-medium: 12px;
  --md-sys-shape-corner-large: 16px;
  --md-sys-shape-corner-extra-large: 28px;
  --md-sys-shape-corner-full: 9999px;
}

.button {
  border-radius: var(--md-sys-shape-corner-full); /* Pill shape */
}

.card {
  border-radius: var(--md-sys-shape-corner-large);
}
```

## Accessibility

### Focus Indicators
Always provide clear focus states:
```css
.interactive:focus-visible {
  outline: 3px solid var(--color-action-primary);
  outline-offset: 2px;
}

/* For elements with ::before overlays */
.button:focus-visible {
  outline: 3px solid var(--color-action-primary);
  outline-offset: 2px;
}

.button:focus-visible::before {
  opacity: var(--md-sys-state-focus-opacity);
}
```

### Color Contrast
Ensure WCAG AA compliance:
```css
/* Light backgrounds need dark text */
.light-surface {
  background-color: var(--color-card-surface);
  color: var(--color-text-primary); /* rgba(0, 0, 0, 0.87) */
}

/* Dark backgrounds need light text */
.dark-surface {
  background-color: var(--color-page-background);
  color: var(--color-text-primary);
}
```

## Critical CSS Quality Rules

### 1. NEVER Use !important
❌ **WRONG:**
```css
.button {
  background-color: red !important; /* NEVER DO THIS */
}
```

Fix specificity issues by:
- Increasing selector specificity
- Reordering rules
- Using attribute selectors for utilities

### 2. ALWAYS Use CSS Variables
❌ **WRONG:**
```css
.card {
  background-color: #ffffff;
  transition: 0.2s;
}
```

✅ **CORRECT:**
```css
.card {
  background-color: var(--color-card-surface);
  transition: var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}
```

### 3. NEVER Change Background Colors on Hover
Use state layer overlays instead (see State Layer Pattern above).

### 4. Group Related Properties
```css
.element {
  /* Positioning */
  position: relative;
  top: 0;
  left: 0;

  /* Box model */
  display: flex;
  width: 100%;
  padding: 16px;
  margin: 0;

  /* Typography */
  font-size: 16px;
  line-height: 24px;
  color: var(--color-text-primary);

  /* Visual */
  background-color: var(--color-card-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  box-shadow: var(--md-sys-elevation-1);

  /* Animation */
  transition: all var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}
```

### 5. Remove Empty Rulesets
❌ **WRONG:**
```css
.unused-class {
  /* Empty or commented out */
}
```

Delete empty rules entirely.

## Common Patterns

### Backdrop Blur Effect
```css
.modal-backdrop {
  backdrop-filter: blur(var(--modal-blur-amount, 16px)) saturate(1.2);
  background-color: rgba(255, 255, 255, 0.1);
}
```

### Pill-Shaped Buttons
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: var(--md-sys-shape-corner-full);
  border: none;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background-color: var(--color-action-primary);
  color: white;
}

.btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: white;
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2) var(--md-sys-motion-easing-standard);
  pointer-events: none;
}

.btn:hover::before {
  opacity: var(--md-sys-state-hover-opacity);
}
```

### Badge Components
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: var(--md-sys-shape-corner-small);
  font-size: 12px;
  font-weight: 500;
  background-color: color-mix(in srgb, var(--badge-color) 16%, var(--color-card-surface));
  color: var(--badge-color);
}
```

### Toggle Switches
```css
.toggle-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-container:focus-within {
  outline: 3px solid var(--color-action-primary);
  outline-offset: 2px;
  border-radius: var(--md-sys-shape-corner-small);
}

.toggle {
  position: relative;
  width: 52px;
  height: 32px;
  background-color: var(--color-border-medium);
  border-radius: var(--md-sys-shape-corner-full);
  transition: background-color var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

.toggle::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  transition: transform var(--md-sys-motion-duration-short4) var(--md-sys-motion-easing-standard);
}

input:checked + .toggle {
  background-color: var(--color-action-primary);
}

input:checked + .toggle::after {
  transform: translateX(20px);
}
```

## When to Use This Skill

✅ **Use Material Design CSS when:**
- Building modern web applications with polished UI
- Consistency with Material Design is desired
- Implementing state layers, motion, and elevation
- Using design tokens for maintainability

❌ **Consider alternatives when:**
- Building minimalist/brutalist designs
- Brand guidelines conflict with Material Design
- Need for unique, non-standard aesthetics

## Resources

- Material Design 3 Guidelines: https://m3.material.io/
- Color system: https://m3.material.io/styles/color/system
- Motion system: https://m3.material.io/styles/motion
- Elevation system: https://m3.material.io/styles/elevation
