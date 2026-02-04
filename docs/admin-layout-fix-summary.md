# Admin Layout Double-Scroll Fix

## Problem

The admin page had double-scrolling behavior where:
1. The entire page would scroll slightly (~200-300px beyond viewport)
2. Scrollable sections (sidebar, editor form) would scroll with the page AND have their own independent scrolling
3. This created a jarring UX where you'd scroll a bit, then realize you're scrolling the wrong container

## Root Causes

### 1. Page Container (`admin.css` - `.admin-page`)
```css
/* BEFORE (problematic) */
min-height: 100vh; /* Allows page to grow beyond viewport */

/* AFTER (fixed) */
height: 100vh;      /* Constrains page to exactly viewport height */
overflow: hidden;   /* Prevents page-level scrolling */
```

**Issue**: `min-height: 100vh` allows the grid to expand beyond the viewport if children are taller, causing page-level scroll.

### 2. Main Content Area (`admin.css` - `#main-content`)
```css
/* BEFORE (problematic) */
padding: var(--spacing-md, 16px) var(--spacing-3xl, 64px) var(--spacing-2xl, 48px);
max-width: 100%;
/* No height or overflow constraint */

/* AFTER (fixed) */
padding: var(--spacing-md, 16px) var(--spacing-3xl, 64px) var(--spacing-2xl, 48px);
height: 100vh;      /* Matches parent grid row height */
overflow-y: auto;   /* Allows main content to scroll independently */
max-width: 100%;
```

**Issue**: Without height constraint, main content would expand to fit its children, pushing the page taller than 100vh.

### 3. Editor Layout (`web-components.js` - `.editor-layout`)
```css
/* BEFORE (problematic) */
.editor-layout {
    display: grid;
    grid-template-columns: 58% 42%;
    gap: var(--spacing-2xl, 48px);
    min-height: 100vh;  /* Forces editor to be at least viewport height */
}

/* AFTER (fixed) */
.editor-layout {
    display: grid;
    grid-template-columns: 58% 42%;
    gap: var(--spacing-2xl, 48px);
    /* Removed min-height - let content determine height */
}
```

**Issue**: `min-height: 100vh` in the shadow DOM forced the editor to be at least viewport height, which when combined with page padding, exceeded the main content container's height.

### 4. Editor Form (`web-components.js` - `.editor-form`)
```css
/* BEFORE (problematic) */
.editor-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 24px);
    overflow-y: auto;
    max-height: calc(100vh - 48px);  /* Hardcoded viewport calculation */
    padding-right: var(--spacing-sm, 8px);
}

/* AFTER (fixed) */
.editor-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 24px);
    overflow-y: auto;
    height: fit-content;  /* Natural content height */
    padding-right: var(--spacing-sm, 8px);
}
```

**Issue**: `max-height: calc(100vh - 48px)` was an arbitrary constraint that didn't account for the actual available space within the scrolling main content container.

## Solution Architecture

The fix establishes a clear scrolling hierarchy:

```
┌─ .admin-page (height: 100vh, overflow: hidden) ──────────────────┐
│                                                                   │
│  ┌─ .prompt-list (height: 100vh, overflow-y: auto) ─┐            │
│  │  Sidebar with independent scroll                  │            │
│  │  ↕ Scrolls when content exceeds viewport          │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                   │
│  ┌─ #main-content (height: 100vh, overflow-y: auto) ────────────┐│
│  │  Main editor area with independent scroll                    ││
│  │                                                               ││
│  │  ┌─ wy-prompt-editor (shadow DOM) ────────────────────────┐  ││
│  │  │                                                         │  ││
│  │  │  ┌─ .editor-layout (grid, no min-height) ───────────┐  │  ││
│  │  │  │                                                   │  │  ││
│  │  │  │  ┌─ .editor-form (height: fit-content) ────────┐ │  │  ││
│  │  │  │  │  ↕ Content flows naturally                  │ │  │  ││
│  │  │  │  │  Scrolls via parent #main-content          │ │  │  ││
│  │  │  │  └─────────────────────────────────────────────┘ │  │  ││
│  │  │  │                                                   │  │  ││
│  │  │  │  ┌─ .editor-preview (sticky, height: fit) ────┐ │  │  ││
│  │  │  │  │  📌 Sticks to top as form scrolls          │ │  │  ││
│  │  │  │  └────────────────────────────────────────────┘ │  │  ││
│  │  │  │                                                   │  │  ││
│  │  │  └───────────────────────────────────────────────────┘  │  ││
│  │  │                                                         │  ││
│  │  └─────────────────────────────────────────────────────────┘  ││
│  │                                                               ││
│  └───────────────────────────────────────────────────────────────┘│
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Expected Behaviors After Fix

✅ **Page container**: Exactly 100vh tall, no scrollbar on body
✅ **Sidebar**: Independent vertical scroll when prompt list exceeds viewport
✅ **Main content**: Independent vertical scroll when editor content exceeds viewport
✅ **Preview card**: Sticky positioning within main content scroll context
✅ **No double-scrolling**: Scrolling sidebar doesn't move page, scrolling editor doesn't move page

## Testing

Run the verification script in browser console:
```javascript
// After loading admin page with a prompt selected
await import('./verify-admin-layout.js');
```

All tests should pass with ✓ markers.

## Files Modified

1. **admin.css**: Page container and main content height constraints
2. **web-components.js**: Removed min-height from editor layout, adjusted editor form height

## Related Documentation

- [Admin System Plan](admin-system-plan.md) - Complete admin architecture
- [Design System Integration](../DESIGN-SYSTEM-INTEGRATION.md) - CSS token usage
