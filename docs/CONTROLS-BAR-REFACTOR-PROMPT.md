# Complete Controls-Bar Styling Refactor

## Context

The `wy-controls-bar` component has inconsistent styling between scrolled and non-scrolled states. All styling must live in the design system (`m3-design-v2`), not in consuming projects.

**Reference:** See `docs/controls-bar-style-audit.md` for complete current state analysis.

## Requirements

### 1. Consistent Element Styling (All States)

**Search bar and filter chips should have IDENTICAL styling whether the page is scrolled or not.** The controls-bar container changes appearance on scroll (pill shape, semi-transparent background), but the nested elements (search input, filter chips) should remain visually consistent.

### 2. Required Styling for All Elements

**Search Input (all states):**
- Height: 32px
- Background: Opaque white (`var(--md-sys-color-surface)`)
- Border: None
- Box shadow: Subtle (`0 1px 3px rgba(0, 0, 0, 0.08)`)
- Text color: `var(--md-sys-color-on-surface)`
- Placeholder: `var(--md-sys-color-on-surface-variant)` with `opacity: 0.7`

**Filter Chips - Inactive (all states):**
- Background: Opaque white (`var(--md-sys-color-surface)`)
- Border: None (transparent)
- Text: `var(--md-sys-color-on-surface)`
- Box shadow: Subtle (`0 1px 3px rgba(0, 0, 0, 0.08)`)

**Filter Chips - Active (all states):**
- Background: Hunter green (`var(--md-sys-color-primary, #2C4C3B)`)
- Border: None (transparent)
- Text: White (`var(--md-sys-color-on-primary, #FFFFFF)`)
- Box shadow: Subtle (`0 1px 3px rgba(0, 0, 0, 0.08)`)

**Filter Chips - Hover (inactive only):**
- Background: Slightly darker white or subtle tint
- Maintain subtle shadow
- Text: Slightly darker for affordance

### 3. Where Changes Must Be Made

**Design System ONLY** (`m3-design-v2/src/components/`):

**File:** `wy-controls-bar.js`
- Update `.search-input` default styles (lines ~235-247) to match requirements above
- Remove `:host([data-scrolled]) .search-input` style changes (lines ~249-261) - search should look identical in all states

**File:** `wy-filter-chip.js`
- Update `:host` default styles (lines ~11-28) to use opaque backgrounds
- Update `:host([active])` styles (lines ~41-47) to use hunter green + white
- Update `:host(:hover)` styles (lines ~30-34) for subtle hover effect
- Remove any scrolled-state-specific styling

**File:** `wy-controls-bar.js` 
- **DELETE** lines 423-429 (scrolled state custom property overrides for filter chips)
- Filter chips should look the same in all states

### 4. Local Overrides to Verify are DELETED

**File:** `prompt-library/styles.css`

Verify these lines are completely removed:
- NO `--wy-controls-search-bg` overrides
- NO `--wy-filter-chip-*` color overrides  
- NO `::part()` selectors for controls-bar elements
- ONLY layout configuration custom properties should remain

### 5. Verification Steps

After making changes:

1. **Build and deploy design system:**
   ```bash
   cd m3-design-v2
   ./scripts/deploy.sh "Standardize controls-bar element styling across all states"
   ./scripts/verify-deployment.sh
   ```

2. **Hard refresh browser** (Cmd+Shift+R)

3. **Run this verification in console:**
   ```javascript
   const controls = document.querySelector('.controls-bar');
   const promptArea = document.querySelector('.prompt-area');
   
   const checkState = (label) => {
     const searchInput = controls.shadowRoot.querySelector('.search-input');
     const inactiveChip = controls.shadowRoot.querySelector('wy-filter-chip:not([active])');
     const activeChip = controls.shadowRoot.querySelector('wy-filter-chip[active]');
     
     console.log(`\n=== ${label} ===`);
     console.log('Search - BG:', getComputedStyle(searchInput).backgroundColor);
     console.log('Search - Border:', getComputedStyle(searchInput).borderWidth);
     console.log('Search - Shadow:', getComputedStyle(searchInput).boxShadow);
     
     if (inactiveChip) {
       console.log('Inactive Chip - BG:', getComputedStyle(inactiveChip).backgroundColor);
       console.log('Inactive Chip - Border:', getComputedStyle(inactiveChip).borderColor);
     }
     
     if (activeChip) {
       console.log('Active Chip - BG:', getComputedStyle(activeChip).backgroundColor);
       console.log('Active Chip - Color:', getComputedStyle(activeChip).color);
     }
   };
   
   // Check normal state
   checkState('NORMAL STATE');
   
   // Scroll and check again
   promptArea.scrollTo(0, 200);
   setTimeout(() => {
     checkState('SCROLLED STATE');
     console.log('\n✅ Values should be IDENTICAL in both states');
   }, 600);
   ```

4. **Expected output:** All values should be IDENTICAL between normal and scrolled states

### 6. Success Criteria

- ✅ Search input looks identical when scrolled vs not scrolled
- ✅ Filter chips (inactive) look identical when scrolled vs not scrolled  
- ✅ Filter chips (active) are hunter green with white text in ALL states
- ✅ NO conditional styling based on scroll state (except controls-bar container itself)
- ✅ NO local overrides in prompt-library/styles.css for colors or element appearance
- ✅ Zero console errors

## Key Principle

**The controls-bar pill container changes on scroll (background blur, position, padding), but the elements INSIDE (search, chips) maintain consistent appearance regardless of scroll state.**

This creates visual stability for interactive elements while the container provides scrolling feedback.

## Common Mistakes to Avoid

1. ❌ Keeping `:host([data-scrolled])` overrides for search-input styling
2. ❌ Keeping `:host([data-scrolled])` custom property assignments for filter chips
3. ❌ Leaving any color overrides in prompt-library/styles.css
4. ❌ Testing without hard refresh (cached CSS will show old styles)
5. ❌ Assuming changes work without running verification script

## Files That Should Change

**Design System:**
- `m3-design-v2/src/components/wy-controls-bar.js` (remove scrolled search input styles)
- `m3-design-v2/src/components/wy-filter-chip.js` (update default colors)

**Consuming Project:**
- `prompt-library/styles.css` (verify no color overrides remain)

**Deployment:**
- Run `./scripts/deploy.sh` from m3-design-v2
- Automated script handles bundle updates to prompt-library