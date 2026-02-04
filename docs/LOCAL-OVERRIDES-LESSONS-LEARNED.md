# Local Overrides: Lessons Learned from Controls-Bar Refactor

## What Happened

During the controls-bar styling refactor (Feb 2026), we encountered a cascade of override issues that prevented design system changes from taking effect. This document captures the root causes and prevention strategies.

## The Problem Chain

### Issue 1: Design System Token Defaults Were Wrong

**Location:** `m3-design-v2/src/styles/tokens.css` (lines 243, 251-252, 257, 270)

**Problem:**
```css
--wy-controls-search-bg: var(--md-sys-color-surface-container-high); /* Beige ❌ */
--wy-filter-chip-border: var(--md-sys-color-outline-variant); /* Visible ❌ */
--wy-filter-chip-padding: 8px 16px; /* Wrong height ❌ */
--wy-controls-chip-active-bg: #E8F5E9; /* Light green ❌ */
```

**Impact:** ALL consuming projects inherited these wrong defaults.

**Fix:** Updated tokens.css to use correct semantic tokens:
```css
--wy-controls-search-bg: var(--md-sys-color-surface-container-lowest); /* White ✅ */
--wy-filter-chip-border: transparent; /* No border ✅ */
--wy-filter-chip-padding: 4px 12px; /* Matches search height ✅ */
--wy-controls-chip-active-bg: var(--md-sys-color-primary); /* Hunter green ✅ */
```

### Issue 2: Consuming Project Had Local Overrides

**Location:** `prompt-library/tokens.css` (lines 69-73, now removed)

**Problem:**
```css
/* Override filter chip active state for light background context */
--wy-filter-chip-active-bg: #E8F5E9; /* Light green ❌ */
--wy-filter-chip-active-fg: #002114; /* Dark text ❌ */
```

**Impact:** Even after fixing design system tokens, these local overrides took precedence.

**Fix:** Removed local overrides entirely. Design system tokens now control appearance.

### Issue 3: CDN Cache Prevented Token Updates

**Location:** `prompt-library/tokens.css` (lines 14, 17)

**Problem:**
```css
@import url('...tokens.css'); /* No cache-busting ❌ */
```

**Impact:** After fixing both token files, browsers loaded cached old version.

**Fix:** Added cache-busting parameters:
```css
@import url('...tokens.css?v=20260203-2044'); /* Forces fresh load ✅ */
```

## Token Precedence Chain

Understanding CSS variable cascade is critical:

```
Consuming Project tokens.css (highest priority)
    ↓ (overrides)
Design System tokens.css
    ↓ (overrides)
Component default fallback values
    ↓ (overrides)
Browser defaults (lowest priority)
```

**Example:**
- Component: `background-color: var(--wy-chip-bg, white)`
- Design system tokens.css: `--wy-chip-bg: beige`
- Consuming project tokens.css: `--wy-chip-bg: blue`
- **Result:** Blue wins (consuming project has highest priority)

## Prevention Strategies

### 1. Audit Before Making Changes

**Before editing design system components:**

```bash
# Check design system tokens
grep -n "wy-{component-name}" m3-design-v2/src/styles/tokens.css

# Check consuming project tokens
grep -n "wy-{component-name}" prompt-library/tokens.css
grep -n "wy-{component-name}" plots/app/styles/*.css
```

**Questions to ask:**
- Do global tokens already define this component's styling?
- Are there local overrides in consuming projects?
- Which layer should I update? (tokens.css vs component.js)

### 2. Fix at the Right Layer

**Component tokens belong in `tokens.css` when:**
- They set reasonable defaults for ALL consuming projects
- They use semantic tokens (not hardcoded values)
- They can be overridden for app-specific theming

**Component code should handle:**
- Structure and behavior (render logic, event handlers)
- Fallback values that work without tokens.css
- Layout calculations and responsive behavior

### 3. Remove Local Overrides (Anti-Pattern)

**Local overrides are appropriate ONLY for:**
- ✅ App-specific theming (category colors unique to this app)
- ✅ Layout configuration (max-width, padding for this context)
- ✅ Documented exceptions with clear rationale

**Local overrides are FORBIDDEN for:**
- ❌ Fixing design system bugs (fix the design system instead)
- ❌ Hardcoded colors that duplicate design system
- ❌ Workarounds without documentation

### 4. Always Use Cache-Busting

**For CDN imports (prompt-library, Weaver-Yuwono-Home-Page):**
```css
@import url('...tokens.css?v=YYYYMMDD-HHMM'); /* Update timestamp */
```

**For npm link (plots):**
```bash
npm run dev # Restart dev server to pick up linked changes
```

## Verification Checklist

After making design system changes:

- [ ] Updated design system `tokens.css` if component tokens exist
- [ ] Checked consuming projects for conflicting local overrides
- [ ] Removed any local overrides that are no longer needed
- [ ] Updated cache-busting parameters in consuming projects
- [ ] Deployed design system with deploy.sh
- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] Verified with `getComputedStyle()` that tokens resolve correctly
- [ ] Visual inspection in all consuming projects

## Key Lessons

1. **Component changes alone are not enough** - Check token files first
2. **Token precedence matters** - Local overrides will always win
3. **Cache-busting is mandatory** - CDN purges are not enough
4. **Audit both locations** - Design system AND consuming projects
5. **Remove workarounds** - Don't accumulate technical debt in local overrides
6. **Document exceptions** - If you must override, explain why

## Future Prevention

All CLAUDE.md files now include:
- ✅ "CRITICAL: Audit Local Overrides" sections
- ✅ Grep commands to check for overrides
- ✅ Clear guidelines for when overrides are appropriate
- ✅ Token precedence explanations
- ✅ Cache-busting reminders

This should prevent similar cascading override issues in the future.
