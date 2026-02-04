# Complete Controls-Bar Styling Refactor (REVIEWED)

## Context

The `wy-controls-bar` component has inconsistent styling between scrolled and non-scrolled states. All styling must live in the design system (`m3-design-v2`), not in consuming projects.

## Requirements

### 1. Consistent Element Styling (All States)

**Search bar and filter chips should have IDENTICAL styling whether the page is scrolled or not.** The controls-bar container changes appearance on scroll (pill shape, semi-transparent background), but the nested elements (search input, filter chips) should remain visually consistent.

### 2. Required Styling for All Elements

**Search Input (all states):**
- Height: 32px
- Background: `var(--md-sys-color-surface)` (opaque white #FFFFFF in light mode)
- Border: `1px solid transparent` (or `none`)
- Box shadow: `none`
- Text color: `var(--md-sys-color-on-surface)`
- Placeholder: `var(--md-sys-color-on-surface-variant)` with `opacity: 0.7`

**Filter Chips - Inactive (all states):**
- Background: `var(--md-sys-color-surface)` (opaque white #FFFFFF)
- Border: `1px solid transparent` (or `none`)
- Text: `var(--md-sys-color-on-surface)`
- Box shadow: `none`

**Filter Chips - Active (all states):**
- Background: `var(--md-sys-color-primary, #2C4C3B)` (hunter green)
- Border: `transparent`
- Text: `var(--md-sys-color-on-primary, #FFFFFF)` (white)
- Box shadow: `none`

**Filter Chips - Hover (inactive only):**
- Background: Slightly darker using state layer pattern
- Use `::before` pseudo-element with `opacity: var(--md-sys-state-hover-opacity)`
- Text: No change

### 3. Required Change Sequence

**CRITICAL: Follow this exact order to avoid broken intermediate states**

#### Step 1: Update `wy-filter-chip.js` Default Styles

**File:** `m3-design-v2/src/components/wy-filter-chip.js`

**Lines 11-28** (`:host` default styles):
```css
:host {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: var(--wy-filter-chip-padding, 4px 12px);
  border-radius: 9999px;
  font-family: var(--wy-filter-chip-font-family, var(--font-sans, 'DM Sans', sans-serif));
  font-size: var(--wy-filter-chip-font-size, 11px);
  font-weight: var(--wy-filter-chip-font-weight, 500);
  cursor: pointer;
  transition: all 0.15s ease;
  
  /* NEW: Opaque white background by default */
  background-color: var(--wy-filter-chip-bg, var(--md-sys-color-surface));
  border: 1px solid var(--wy-filter-chip-border, transparent);
  color: var(--wy-filter-chip-text, var(--md-sys-color-on-surface));
  
  box-shadow: none; /* Explicitly no shadow */
  user-select: none;
  white-space: nowrap;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
```

**Lines 30-34** (`:host(:hover)` - ADD state layer pattern):
```css
/* Material Design 3 state layer for hover */
:host::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: var(--md-sys-color-on-surface);
  opacity: 0;
  transition: opacity var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard);
  pointer-events: none;
  border-radius: inherit;
}

:host(:hover:not([active]))::before {
  opacity: var(--md-sys-state-hover-opacity, 0.08);
}
```

**Lines 41-47** (`:host([active])` styles):
```css
:host([active]) {
  background-color: var(--wy-filter-chip-active-bg, var(--md-sys-color-primary, #2C4C3B));
  color: var(--wy-filter-chip-active-fg, var(--md-sys-color-on-primary, #FFFFFF));
  border-color: transparent;
  font-weight: var(--wy-filter-chip-font-weight-active, 500);
  box-shadow: none;
}
```

#### Step 2: Update `wy-controls-bar.js` Search Input Default

**File:** `m3-design-v2/src/components/wy-controls-bar.js`

**Lines 235-247** (`.search-input` default styles):
```css
.search-input {
  width: 100%;
  height: 32px;
  background-color: var(--wy-controls-search-bg, var(--md-sys-color-surface));
  border: 1px solid transparent;
  border-radius: 9999px;
  padding: 0 12px 0 36px;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 0.75rem;
  color: var(--md-sys-color-on-surface, #1f2937);
  box-sizing: border-box;
  box-shadow: none;
  transition: all 0.2s;
}
```

#### Step 3: Delete Scrolled State Overrides

**File:** `m3-design-v2/src/components/wy-controls-bar.js`

**DELETE lines 249-261** (`:host([data-scrolled]) .search-input` block):
```css
/* DELETE THIS ENTIRE BLOCK */
:host([data-scrolled]) .search-input {
  height: 32px;
  font-size: 0.75rem;
  background-color: var(--md-sys-color-surface, #fff);
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: 
    height var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized),
    font-size var(--md-sys-motion-duration-medium2, 300ms) var(--md-sys-motion-easing-emphasized),
    background-color var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard),
    border var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard),
    box-shadow var(--md-sys-motion-duration-short2, 200ms) var(--md-sys-motion-easing-standard);
}
```

**DELETE lines 423-429** (`:host([data-scrolled])` filter chip custom property overrides):
```css
/* DELETE THIS ENTIRE BLOCK */
:host([data-scrolled]) {
  --wy-filter-chip-bg: var(--md-sys-color-surface);
  --wy-filter-chip-border: transparent;
  --wy-filter-chip-active-bg: var(--md-sys-color-primary, #2C4C3B);
  --wy-filter-chip-active-fg: var(--md-sys-color-on-primary, #FFFFFF);
}
```

### 4. Local Overrides to Verify are DELETED

**File:** `prompt-library/styles.css`

**Check for and remove these patterns:**

```bash
# Run these commands to verify no color overrides remain
cd /path/to/prompt-library
grep -n "wy-controls-search-bg" styles.css
grep -n "wy-filter-chip-bg" styles.css
grep -n "wy-filter-chip-active" styles.css
grep -n "::part.*controls" styles.css
```

**Expected result:** No matches for color/background properties. Only layout configuration properties should remain:
- ✅ ALLOWED: `--wy-controls-padding-desktop`, `--wy-controls-container-max-width`, etc.
- ❌ FORBIDDEN: Any `--wy-filter-chip-*` color/background overrides
- ❌ FORBIDDEN: Any `::part()` selectors for controls-bar elements

### 5. Deployment

```bash
cd /path/to/m3-design-v2
./scripts/deploy.sh "Standardize controls-bar element styling across all states"
./scripts/verify-deployment.sh
```

**Then hard refresh browser:** `Cmd+Shift+R` (macOS) or `Ctrl+Shift+R` (Windows/Linux)

### 6. Verification Steps

After deployment and hard refresh:

```javascript
const controls = document.querySelector('.controls-bar');
const promptArea = document.querySelector('.prompt-area');

const checkState = (label) => {
  const searchInput = controls.shadowRoot.querySelector('.search-input');
  const inactiveChip = controls.shadowRoot.querySelector('wy-filter-chip:not([active])');
  const activeChip = controls.shadowRoot.querySelector('wy-filter-chip[active]');
  
  console.log(`\n=== ${label} ===`);
  
  // Search input verification
  const searchBg = getComputedStyle(searchInput).backgroundColor;
  const searchBorder = getComputedStyle(searchInput).borderWidth;
  const searchShadow = getComputedStyle(searchInput).boxShadow;
  
  console.log('Search Input:');
  console.log('  BG:', searchBg, searchBg === 'rgb(255, 255, 255)' ? '✅' : '❌');
  console.log('  Border:', searchBorder);
  console.log('  Shadow:', searchShadow, searchShadow === 'none' ? '✅' : '❌');
  
  // Inactive chip verification
  if (inactiveChip) {
    const chipBg = getComputedStyle(inactiveChip).backgroundColor;
    const chipBorder = getComputedStyle(inactiveChip).borderColor;
    const chipShadow = getComputedStyle(inactiveChip).boxShadow;
    
    console.log('Inactive Chip:');
    console.log('  BG:', chipBg, chipBg === 'rgb(255, 255, 255)' ? '✅' : '❌');
    console.log('  Border:', chipBorder, chipBorder === 'rgba(0, 0, 0, 0)' || chipBorder === 'transparent' ? '✅' : '❌');
    console.log('  Shadow:', chipShadow, chipShadow === 'none' ? '✅' : '❌');
  }
  
  // Active chip verification
  if (activeChip) {
    const chipBg = getComputedStyle(activeChip).backgroundColor;
    const chipColor = getComputedStyle(activeChip).color;
    const chipShadow = getComputedStyle(activeChip).boxShadow;
    
    console.log('Active Chip:');
    console.log('  BG:', chipBg, chipBg === 'rgb(44, 76, 59)' ? '✅' : '❌');
    console.log('  Text:', chipColor, chipColor === 'rgb(255, 255, 255)' ? '✅' : '❌');
    console.log('  Shadow:', chipShadow, chipShadow === 'none' ? '✅' : '❌');
  }
};

// Check normal state
checkState('NORMAL STATE (scrollTop = 0)');

// Scroll and check again
promptArea.scrollTo(0, 200);
setTimeout(() => {
  checkState('SCROLLED STATE (scrollTop = 200)');
  console.log('\n✅ All values should be IDENTICAL in both states');
  console.log('   (except controls-bar container itself, which should have pill shape when scrolled)');
}, 600);
```

**Expected output:**
- All checkmarks (✅) in both states
- Search input: `rgb(255, 255, 255)` background, `none` shadow
- Inactive chips: `rgb(255, 255, 255)` background, `transparent` border
- Active chips: `rgb(44, 76, 59)` background, `rgb(255, 255, 255)` text

### 7. Success Criteria

- ✅ Search input looks identical when scrolled vs not scrolled (verified via console)
- ✅ Filter chips (inactive) look identical when scrolled vs not scrolled (verified via console)
- ✅ Filter chips (active) are hunter green with white text in ALL states (verified via console)
- ✅ NO conditional styling based on scroll state for nested elements (only container changes)
- ✅ NO local overrides in `prompt-library/styles.css` for colors or element appearance (verified via grep)
- ✅ Zero console errors in browser DevTools
- ✅ Visual inspection: controls-bar container has pill shape + blur when scrolled, but elements inside remain consistent

## Key Principle

**The controls-bar pill container changes on scroll (background blur, position, padding), but the elements INSIDE (search, chips) maintain consistent appearance regardless of scroll state.**

This creates visual stability for interactive elements while the container provides scrolling feedback.

## Common Mistakes to Avoid

1. ❌ Making changes out of order (update defaults FIRST, delete overrides SECOND)
2. ❌ Keeping `:host([data-scrolled])` overrides for search-input styling
3. ❌ Keeping `:host([data-scrolled])` custom property assignments for filter chips
4. ❌ Leaving any color overrides in `prompt-library/styles.css`
5. ❌ Testing without hard refresh (cached CSS will show old styles)
6. ❌ Assuming changes work without running verification script
7. ❌ Using old hover pattern instead of Material Design 3 state layers

## Files That Should Change

**Design System (`m3-design-v2`):**
1. `src/components/wy-filter-chip.js` - Update default colors, add state layer hover
2. `src/components/wy-controls-bar.js` - Update search input default, delete scrolled overrides

**Consuming Project (`prompt-library`):**
- `styles.css` - Verify no color overrides remain (grep verification)

**Deployment:**
- Run `./scripts/deploy.sh` from `m3-design-v2`
- Automated script handles bundle updates to `prompt-library`
- Hard refresh browser after deployment completes
