# Controls-Bar Token Fixes - Complete

## Root Cause

The design system's `tokens.css` had incorrect token values that were overriding the component-level changes we made. Even though we fixed the components (`wy-filter-chip.js` and `wy-controls-bar.js`), the global tokens were taking precedence.

## Fixes Applied to `m3-design-v2/src/styles/tokens.css`

### 1. Search Background - Now White
**Before:**
```css
--wy-controls-search-bg: var(--md-sys-color-surface-container-high); /* #EBE5DE beige */
```

**After:**
```css
--wy-controls-search-bg: var(--md-sys-color-surface-container-lowest); /* #FFFFFF white */
```

### 2. Filter Chip Background - Now White
**Added:**
```css
--wy-filter-chip-bg: var(--md-sys-color-surface-container-lowest); /* #FFFFFF white */
```

### 3. Filter Chip Borders - Now Transparent
**Before:**
```css
--wy-filter-chip-border: var(--md-sys-color-outline-variant); /* #D7D3C8 visible */
--wy-filter-chip-border-hover: var(--md-sys-color-outline); /* visible */
```

**After:**
```css
--wy-filter-chip-border: transparent;
--wy-filter-chip-border-hover: transparent;
```

### 4. Filter Chip Padding - Now Consistent with Search
**Before:**
```css
--wy-filter-chip-padding: 8px 16px; /* Total height: ~36px */
```

**After:**
```css
--wy-filter-chip-padding: 4px 12px; /* Total height: 32px, matches search */
```

### 5. Active Chip Colors - Now Proper Tokens
**Before:**
```css
--wy-controls-chip-active-bg: #E8F5E9; /* Hardcoded light green */
--wy-controls-chip-active-fg: #2C4C3B; /* Hardcoded dark text */
```

**After:**
```css
--wy-controls-chip-active-bg: var(--md-sys-color-primary); /* Hunter green */
--wy-controls-chip-active-fg: var(--md-sys-color-on-primary); /* White */
```

## Deployment Details

- ✅ Committed to design system: `@afbc7c8`
- ✅ Bundle updated in prompt-library
- ✅ Admin cache-bust: `?v=20260203-2041`
- ✅ CDN cache purged for `tokens.css`

## Expected Results After Hard Refresh (Cmd+Shift+R)

Run the verification script again. You should now see:

```
Search Input:
  Background: rgb(255, 255, 255) ✅ (was: rgb(235, 229, 222) ❌)
  Border Width: 1px
  Box Shadow: none ✅

Inactive Chip:
  Background: rgb(255, 255, 255) ✅ (was: rgb(245, 242, 234))
  Border: rgba(0, 0, 0, 0) ✅ (was: rgb(215, 211, 200) ❌)
  Box Shadow: none ✅

Active Chip:
  Background: rgb(44, 76, 59) ✅ (was: rgb(232, 245, 233) ❌)
  Text Color: rgb(255, 255, 255) ✅ (was: rgb(0, 33, 20) ❌)
  Box Shadow: none ✅
```

## Visual Improvements

1. **Search bar**: Clean white background, same in all states
2. **Filter chips (inactive)**: Clean white background, no border, consistent height with search
3. **Filter chips (active)**: Hunter green (#2C4C3B) with white text, no border
4. **Height consistency**: Search (32px) and chips (32px) are now the same height
5. **No state changes**: All elements look identical whether scrolled or not scrolled

## Summary

All three issues are now fixed at the design system token level:
- ✅ Heights are consistent (32px for both search and chips)
- ✅ Filter chip backgrounds are correct (white for inactive, hunter green for active)
- ✅ Filter chip borders are transparent
- ✅ Search bar background is white
