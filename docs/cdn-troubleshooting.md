# CDN Cache Troubleshooting

This document covers jsDelivr CDN cache management for the m3-design-v2 design system.

## When to Purge

**ALWAYS purge after:**
- Pushing any commit to m3-design-v2
- Debugging unexpected behavior in design system components
- When the app behaves differently than expected based on the source code

**Symptoms of stale cache:**
- Components behave differently than their source code suggests
- Style changes made in design system don't appear
- Features work locally in design system but not in consuming projects

## Full Purge Commands

Run all of these after design system changes:

```bash
# === CSS Tokens ===
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/main.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/src/styles/tokens.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/src/styles/main.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/src/styles/tokens.css"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/src/styles/main.css"

# === Web Components Bundle ===
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2/dist/web-components.js"
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@latest/dist/web-components.js"
```

### One-Liner

```bash
for f in src/styles/tokens.css src/styles/main.css dist/web-components.js; do for v in @main "" @latest; do curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2${v}/${f}"; done; done
```

### Helper Script

```bash
VERIFY_SNIPPET="expected-code-snippet" scripts/design-system-refresh.sh
```

## Verification Steps

1. Run all purge commands above
2. Wait 2-3 seconds for propagation
3. Verify CSS:
   ```bash
   curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css" | grep -A 5 "your-changed-property"
   ```
4. Verify JS:
   ```bash
   curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js" | grep "expected-code-snippet"
   ```
5. If still showing old content, purge again and wait longer
6. Hard refresh the browser (Cmd+Shift+R)

## Why Aggressive Purging Matters

- jsDelivr has multiple edge nodes that cache independently
- A single purge may not clear all edge caches immediately
- The `@main`, default, and `@latest` references are cached separately
- **Both CSS and JS bundles must be purged** - components depend on both
- Without proper purging, users may see stale styles for hours

## Browser Cache Management

### Safari-Specific Behavior

Safari aggressively caches CSS and JS files even with proper `Cache-Control` headers.

**For CDN imports:**
- Use `?v=YYYYMMDD` cache-busting parameters on `@main` imports
- After design system changes, update the version parameter in consuming projects
- Example: `...@main/dist/web-components.js?v=20260130`

**For local CSS/JS files:**
- Add cache-busting parameters: `href="styles.css?v=YYYYMMDD"`
- Update the version parameter whenever the file changes

### Complete Workflow Checklist

After design system changes:
1. Purge jsDelivr CDN cache (run full purge commands)
2. Update `?v=` parameter in `components/index.js`
3. Update `?v=` parameters in `index.html` if CSS imports changed
4. Commit all version bumps together
5. Hard refresh browser (Cmd+Shift+R)

## Lessons Learned

### Filter Chips Not Working (2026-01-24)

**Problem:** Category filter chips stopped responding to clicks.

**Root cause:** Stale jsDelivr CDN cache serving an old version of `wy-filter-chip` that had internal state toggle conflicting with parent-controlled state.

**Fix:** Purge CDN cache. The design system was already fixed.

**Verification:**
```bash
# Should NOT contain "_toggle" near filter-chip
curl -s "https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js" | grep -B50 'customElements.define("wy-filter-chip"' | grep "_toggle"
```

### Icons Rendering as Text (2026-01-24)

**Problem:** Material Symbols icons in `wy-controls-bar` displayed as text ("search", "grid_view").

**Root cause:**
1. Shadow DOM isolates styles - fonts from light DOM don't propagate
2. Import was pinned to old commit hash

**Fix:**
1. Font import added inside component's Shadow DOM (in design system)
2. Updated import to use `@main`

**Lesson:** Web components must import fonts directly in their Shadow DOM styles.

### Nested Shadow DOM Variable Inheritance (2026-01-25)

**Problem:** Filter chip active state showed wrong colors.

**Root cause:** CSS custom properties don't cascade through nested shadow DOM boundaries (component A → component B inside A's shadow).

**Fix:** Set CSS variables on the outer component's host element:
```css
.controls-bar {
    --wy-filter-chip-active-bg: #E8F5E9;
    --wy-filter-chip-active-fg: #002114;
}
```

**Lesson:** For nested shadow components, set variables on the outer host - they cascade to immediate shadow children but not deeper.
