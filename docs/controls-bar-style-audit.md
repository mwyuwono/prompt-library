# Controls-Bar Style Audit

Comprehensive audit of all styling states for search bar and filter chips within the controls-bar component.

**Component:** `wy-controls-bar` (from m3-design-v2)
**Nested Components:** Search input (native), `wy-filter-chip` (web component)
**Consumer:** prompt-library

## Search Bar Styling

| State | Page Scrolled | Height | Background | Border | Box Shadow | Notes |
|-------|---------------|--------|------------|--------|------------|-------|
| Normal | No | 32px | `var(--wy-controls-search-bg, var(--md-sys-color-surface-container-high, #f3f4f6))` | `1px solid var(--md-sys-color-outline-variant, transparent)` | none | |
| Scrolled | Yes | 32px | `var(--md-sys-color-surface, #fff)` | `none` | `0 1px 3px rgba(0, 0, 0, 0.08)` | |
| Focus (normal) | No | 32px | `var(--md-sys-color-surface, #fff)` | `color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent)` | `0 0 0 1px color-mix(...)` | |
| Focus (scrolled) | Yes | 32px | `var(--md-sys-color-surface, #fff)` | `color-mix(in srgb, var(--md-sys-color-primary, #2C4C3B) 20%, transparent)` | `0 0 0 1px color-mix(...)` | |

**Search Icon:**
- Normal: `var(--md-sys-color-on-surface-variant, #9ca3af)` with `opacity: 0.7`
- Focus: `var(--md-sys-color-primary, #2C4C3B)`

**Placeholder:**
- Color: `var(--md-sys-color-on-surface-variant, #9ca3af)` with `opacity: 0.7`

## Filter Chip Styling

### Component Defaults (wy-filter-chip.js)

| State | Page Scrolled | Active | Background | Border | Text Color | Notes |
|-------|---------------|--------|------------|--------|------------|-------|
| Inactive | No | No | `var(--wy-filter-chip-bg, transparent)` | `1px solid var(--wy-filter-chip-border, var(--md-sys-color-outline-variant, #e5e7eb))` | `var(--wy-filter-chip-text, var(--md-sys-color-on-surface-variant, #64748b))` | |
| Inactive Hover | No | No | `var(--wy-filter-chip-hover-bg, var(--md-sys-color-surface-variant, #f9fafb))` | `var(--wy-filter-chip-border-hover, var(--md-sys-color-outline-variant, #e5e7eb))` | `var(--wy-filter-chip-text-hover, var(--md-sys-color-on-surface, #1f2937))` | |
| Active | No | Yes | `var(--wy-filter-chip-active-bg, var(--md-sys-color-primary, #2C4C3B))` | `transparent` | `var(--wy-filter-chip-active-fg, var(--md-sys-color-on-primary, #FFFFFF))` | |

### Scrolled State Overrides (wy-controls-bar.js lines 424-429)

When `controls-bar` has `[data-scrolled]` attribute, it sets these custom properties:

| Property | Value | Purpose |
|----------|-------|---------|
| `--wy-filter-chip-bg` | `var(--md-sys-color-surface)` | Opaque background for inactive chips |
| `--wy-filter-chip-border` | `transparent` | No border for inactive chips |
| `--wy-filter-chip-active-bg` | `var(--md-sys-color-primary, #2C4C3B)` | Hunter green for active chips |
| `--wy-filter-chip-active-fg` | `var(--md-sys-color-on-primary, #FFFFFF)` | White text for active chips |

**Resulting scrolled states:**

| State | Page Scrolled | Active | Background | Border | Text Color | Notes |
|-------|---------------|--------|------------|--------|------------|-------|
| Inactive | Yes | No | `var(--md-sys-color-surface)` | `transparent` | `var(--wy-filter-chip-text, var(--md-sys-color-on-surface-variant, #64748b))` | |
| Active | Yes | Yes | `var(--md-sys-color-primary, #2C4C3B)` | `transparent` | `var(--md-sys-color-on-primary, #FFFFFF)` | |

## Local Overrides (prompt-library/styles.css lines 862-865)

| Property | Value | Purpose | Conflict Risk |
|----------|-------|---------|---------------|
| `--wy-filter-chip-active-bg` | `#E8F5E9` | Light green (not hunter green) | High - Overrides design system default |
| `--wy-filter-chip-active-fg` | `#002114` | Dark green text (not white) | High - Overrides design system default |
| `--wy-filter-chip-min-height` | `44px` | Touch target accessibility | Low - Accessibility enhancement |

**Issue:** Local overrides set active filter chips to light green background (#E8F5E9) with dark green text (#002114), which **conflicts** with the scrolled state trying to set hunter green background with white text.

## Design Tokens Reference

| Token | Light Mode Value | Usage |
|-------|------------------|-------|
| `--md-sys-color-surface` | `#F5F2EA` (Warm Clay) | Opaque backgrounds |
| `--md-sys-color-surface-container-high` | `#f3f4f6` | Search input normal state |
| `--md-sys-color-primary` | `#2C4C3B` (Hunter Green) | Active filter chips |
| `--md-sys-color-on-primary` | `#FFFFFF` (White) | Text on primary |
| `--md-sys-color-on-surface-variant` | `#64748b` | Muted text |
| `--md-sys-color-outline-variant` | `#e5e7eb` | Borders |

## Summary of Issues

### Conflicting Styles

1. **Filter chip active background (LOCAL vs SCROLLED):**
   - Local override: `#E8F5E9` (light green) - lines 862-863
   - Scrolled state: `var(--md-sys-color-primary, #2C4C3B)` (hunter green) - line 427
   - **Conflict:** Local override wins due to CSS specificity

2. **Filter chip active text (LOCAL vs SCROLLED):**
   - Local override: `#002114` (dark green)
   - Scrolled state: `var(--md-sys-color-on-primary, #FFFFFF)` (white)
   - **Conflict:** Local override wins due to CSS specificity

### Resolution Options

**Option A:** Remove local overrides, use design system defaults
- Active chips would be hunter green with white text (all states)

**Option B:** Keep local overrides for normal state, allow scrolled to override
- Active chips: light green (normal), hunter green (scrolled)
- Requires adjusting CSS specificity

**Option C:** Make scrolled state match local preference
- Change scrolled active colors to match light green theme
- Update lines 427-428 to use `#E8F5E9` and `#002114`

## Notes Column
(Empty for user to fill in preferences/decisions)