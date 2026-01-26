# Prompt Cards Visibility Issue - FIXED ✅

**Date:** January 26, 2026  
**Issue:** Prompt cards invisible (opacity: 0) but clickable  
**Root Cause:** Missing motion tokens breaking CSS animations  
**Status:** ✅ Resolved

---

## Problem Detected with Playwright

```
Automated detection found:
  - Cards rendered: 9 ✅
  - Cards opacity: 0 ❌
  - Animation name: none ❌
  - Motion tokens: EMPTY ❌
```

The cards had `opacity: 0` and were waiting for a CSS animation to fade them in, but the animation wasn't running.

---

## Root Cause Analysis

### CSS Animation Pattern:
```css
.view-grid .prompt-card {
    opacity: 0;
    transform: scale(0.9);
    animation: cardAppear 0.35s var(--md-sys-motion-easing-emphasized) forwards;
}

@keyframes cardAppear {
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```

### The Problem:
The animation uses `var(--md-sys-motion-easing-emphasized)` but this token was **empty/undefined**:

```
--md-sys-motion-easing-emphasized: "" (EMPTY!)
```

When a CSS `var()` resolves to an empty value, the entire declaration becomes invalid, causing:
- `animation: cardAppear 0.35s  forwards` ← Invalid, becomes `animation: none`
- Cards stuck at `opacity: 0`
- Animation never runs

### Why Were Tokens Missing?

The tokens.css imports from CDN:
```css
@import url('https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/src/styles/tokens.css');
```

The CDN import was either:
- Not loading properly on localhost
- Cached with an old version
- Or @import in local dev server not working correctly

---

## Fix Applied

Added motion token fallbacks to [tokens.css](tokens.css):

```css
:root {
  /* Motion tokens - Fallback if CDN import fails */
  --md-sys-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --md-sys-motion-easing-emphasized-decelerate: cubic-bezier(0.05, 0.7, 0.1, 1);
  --md-sys-motion-easing-emphasized-accelerate: cubic-bezier(0.3, 0, 0.8, 0.15);
  --md-sys-motion-easing-legacy: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Duration tokens - Fallback if CDN import fails */
  --md-sys-motion-duration-short1: 50ms;
  --md-sys-motion-duration-short2: 100ms;
  --md-sys-motion-duration-short3: 150ms;
  --md-sys-motion-duration-short4: 200ms;
  --md-sys-motion-duration-medium1: 250ms;
  --md-sys-motion-duration-medium2: 300ms;
  --md-sys-motion-duration-medium3: 350ms;
  --md-sys-motion-duration-medium4: 400ms;
}
```

---

## Verification Results

### Before Fix (Playwright):
```
Motion tokens: EMPTY
Card opacity: 0
Animation name: none
Visible cards: 0/9
```

### After Fix (Playwright):
```
Motion tokens: ✅ Loaded
Card opacity: 1
Animation name: cardAppear
Visible cards: 9/9
```

**Automated verification confirmed all cards visible!**

---

## Component Adaptation Prompt Status

### Added to Library:
- ✅ prompts.json updated (prompt #22)
- ✅ component-adaptation.txt created
- ✅ All 3 input fields configured
- ✅ JSON validation passed

### To See the New Prompt:

**Option 1: Hard Refresh**
Press **Cmd+Shift+R** (Mac) or **Ctrl+Shift+F5** (Windows) to reload prompts.json

**Option 2: Navigate to Productivity**
Click the **Productivity** filter chip in the top controls bar

**The prompt will appear as:**
```
Title: Component Adaptation (Design System)
Category: Productivity  
Icon: 🧩 widgets
Description: Adapt external components to m3-design-v2 design system
             with automated Playwright verification and 100% token usage
```

---

## Files Modified

1. **tokens.css** - Added motion token fallbacks (fixes card visibility)
2. **prompts.json** - Added component-adaptation prompt entry
3. **prompts-for-implementation/component-adaptation.txt** - Complete workflow

---

## Next Steps

1. **Hard refresh** your browser (Cmd+Shift+R)
2. **Click** "Productivity" category filter
3. **Find** "Component Adaptation (Design System)" prompt
4. **Test** by filling in the form and generating
5. **Use** for real component adaptations!

---

## Summary

**Issue:** Cards invisible due to missing CSS animation tokens  
**Detection:** Automated Playwright inspection  
**Fix:** Added fallback motion tokens to tokens.css  
**Result:** All cards now visible, animations working  
**New Prompt:** Ready to use in Productivity category  

**Refresh your browser to see everything working!** 🎉
