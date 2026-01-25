---
name: visual-qa
description: Automatically detect and fix visual issues in web applications. Use after CSS/styling changes to catch contrast problems, invisible elements, spacing issues, and dark mode inconsistencies. Requires a local dev server running.
---

# Visual QA

Detect and fix visual issues in web applications by capturing screenshots in light and dark mode, analyzing for common problems, and proposing fixes.

## Prerequisites

- Local development server running (e.g., `python3 -m http.server 8000`)
- Playwright installed: `pip install playwright && playwright install chromium`

## Workflow

### 1. Capture Screenshots

Run the screenshot script to capture the page in both color schemes:

```bash
python3 skills/visual-qa/scripts/capture.py --url http://localhost:8000 --output /tmp/visual-qa
```

This produces:
- `/tmp/visual-qa/light.png` - Light mode screenshot
- `/tmp/visual-qa/dark.png` - Dark mode screenshot
- `/tmp/visual-qa/report.json` - Page metadata and element visibility data

### 2. Analyze Screenshots

Read both screenshots and analyze for these common issues:

**Contrast Issues**
- Text or icons that blend into the background
- Elements visible in one mode but not the other
- Placeholder text that's hard to read

**Visibility Issues**
- Elements present in DOM but not visible (check report.json for elements with zero dimensions or opacity)
- Icons rendering as text (font not loaded)
- Missing images or broken assets

**Spacing Issues**
- Elements too close together (cramped)
- Inconsistent margins/padding between sections
- Border collisions (borders touching without proper spacing)

**Dark Mode Specific**
- Hardcoded colors that don't adapt (look for pure white #fff or black #000)
- CSS custom properties not cascading through Shadow DOM
- Fallback values being used instead of theme tokens

### 3. Investigate Flagged Issues

For each issue found, use the inspect script to get computed styles:

```bash
python3 skills/visual-qa/scripts/inspect.py --url http://localhost:8000 --selector ".search-input" --color-scheme dark
```

This returns:
- Computed color, background-color, opacity, visibility
- CSS custom property values as resolved
- Bounding box dimensions
- Whether element is in Shadow DOM

### 4. Determine Root Cause

Common causes and solutions:

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Element invisible in dark mode | Hardcoded light color | Use `var(--md-sys-color-*)` token |
| Icon shows as text | Font not loaded in Shadow DOM | Add `@import` for font in component styles |
| Low contrast text | Opacity too low or wrong color token | Adjust opacity or use correct `on-surface` variant |
| Spacing too tight | Missing margin/padding | Add spacing using `var(--space-*)` tokens |
| Style not applying | CSS specificity or Shadow DOM boundary | Check selector specificity or use `::part()` |

### 5. Apply Fixes

Based on the root cause:

1. **Design system component issue** - Edit the component in m3-design-v2, rebuild, commit, purge CDN
2. **App-specific CSS issue** - Edit styles.css in the consuming project
3. **Shadow DOM theming issue** - Set CSS custom properties on the host element

After fixing, re-run capture to verify the fix.

## Quick Check Command

For a fast visual sanity check without full analysis:

```bash
python3 skills/visual-qa/scripts/capture.py --url http://localhost:8000 --output /tmp/visual-qa --quick
```

This captures only dark mode (where issues are most common) and skips metadata collection.

## Integration with Design System

When issues are found in `wy-*` web components:

1. The fix belongs in `m3-design-v2/src/components/wy-*.js`
2. After editing, run `npm run build` in m3-design-v2
3. Commit and push to trigger CDN update
4. Purge jsDelivr cache:
   ```bash
   for f in dist/web-components.js; do for v in @main "" @latest; do curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2${v}/${f}"; done; done
   ```
5. Hard refresh the app (Cmd+Shift+R)

## What This Skill Does NOT Do

- Pixel-perfect visual regression testing (no baseline comparison)
- Automated accessibility audits (use axe-core for that)
- Performance testing
- Cross-browser testing (Chromium only)
