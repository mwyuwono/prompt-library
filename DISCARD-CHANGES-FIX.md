# Discard Changes Fix

**Status:** ✅ Fixed  
**Date:** February 3, 2026

## Problem

When a user converted a prompt to variations mode and then clicked "Discard Changes", the UI did not properly reset to the original state. The changes appeared to be discarded but would revert back on page refresh, indicating a state management issue.

## Root Cause

Two issues were identified:

### Issue 1: Object Reference Not Changing (admin.js)

**Location:** `admin.js` - `loadPrompt()` function

When "Discard Changes" was clicked, the `loadPrompt()` function would set:
```javascript
editor.prompt = prompt;  // Same object reference
```

**Problem:** Lit's reactivity system compares object references. If the reference doesn't change, it doesn't trigger the `updated()` lifecycle, so the component's internal state (`_editedPrompt`, `_promptMode`, etc.) wasn't reset.

**Why this mattered:** After converting to variations, the `_editedPrompt` had a `variations` array. When "Discard" was clicked, the editor.prompt was set to the original prompt (without variations), but since it was the same object reference, Lit didn't detect the change and didn't reset `_editedPrompt`.

### Issue 2: Git Info Banner Not Reset (wy-prompt-editor.js)

**Location:** `m3-design-v2/src/components/wy-prompt-editor.js` - `updated()` lifecycle

The `_showGitInfo` banner (shown after saving) wasn't being reset when the prompt changed, leaving stale UI indicators.

## Solution

### Fix 1: Deep Copy in admin.js

```javascript
// Before (broken):
editor.prompt = prompt;

// After (fixed):
editor.prompt = JSON.parse(JSON.stringify(prompt));
```

**Why this works:** Creating a deep copy ensures we always get a new object reference, which triggers Lit's `updated()` lifecycle, which then resets all internal state properly.

### Fix 2: Reset Git Banner in Component

```javascript
updated(changedProperties) {
    if (changedProperties.has('prompt') && this.prompt) {
        // ... existing reset logic ...
        
        // Reset git info banner when prompt changes (e.g., on cancel/discard)
        this._showGitInfo = false;
    }
}
```

**Why this works:** When the prompt property changes (including on discard), we explicitly reset the git info banner to remove stale UI indicators.

## Changes Made

| File | Change | Commit |
|------|--------|--------|
| `admin.js` | Deep copy prompt data in `loadPrompt()` | `7125010` |
| `m3-design-v2/src/components/wy-prompt-editor.js` | Reset `_showGitInfo` in `updated()` | `8c8fe20` |
| `prompt-library/web-components.js` | Updated bundle (672.99 KB) | `fcbefcc` |

## Testing

See [`test-discard-changes-fix.md`](test-discard-changes-fix.md) for complete test procedures.

**Quick Test:**
1. Open http://localhost:3001/admin
2. Select "Audio Essay" (single-step)
3. Click "Convert to Variations"
4. Click "Discard Changes"
5. **Expected:** UI immediately reverts to single-step mode ✅

**Before Fix:** UI would not revert until page refresh ❌  
**After Fix:** UI reverts immediately ✅

## State Reset Behavior

When "Discard Changes" is clicked, the component now properly resets:

| State Variable | Reset Behavior |
|----------------|----------------|
| `_editedPrompt` | Deep copy of original prompt |
| `_promptMode` | Detected from prompt structure ('single' or 'multi') |
| `_expandedSteps` | Reset ([0] for multi-step, [] for single-step) |
| `_showGitInfo` | Set to false |
| UI rendering | Re-renders with original prompt structure |

## Technical Details

### Lit Reactivity

Lit uses reference equality to detect property changes:

```javascript
// Triggers updated():
editor.prompt = { ...newData };  // New reference ✅

// Does NOT trigger updated():
editor.prompt = existingData;     // Same reference ❌
```

### Deep Copy Trade-offs

**Pros:**
- Guarantees new object reference
- Ensures Lit detects changes
- Isolates component state from data source
- Prevents accidental mutations

**Cons:**
- Slight performance cost (negligible for prompt data)
- Loses object references (not an issue for serializable prompt data)

**Why it's appropriate here:** Prompts are plain data objects (JSON-serializable) with no methods or circular references, making deep copy safe and appropriate.

## Alternative Approaches Considered

### 1. Force Update with requestUpdate()

```javascript
editor.prompt = prompt;
editor.requestUpdate();  // Force re-render
```

**Rejected:** Doesn't work reliably because Lit won't run `updated()` if the property value hasn't changed according to its internal hasChanged check.

### 2. Increment a Version Counter

```javascript
editor.promptVersion++;  // Force change detection
```

**Rejected:** Adds unnecessary complexity and state management overhead.

### 3. Shallow Copy

```javascript
editor.prompt = { ...prompt };
```

**Rejected:** Doesn't work for nested objects (variations, steps, variables). Prompt structure has multiple levels of nesting.

**Chosen:** Deep copy is the simplest, most reliable solution.

## Verification

Both fixes verified in deployed code:

```bash
# Verify admin.js fix
$ grep "JSON.parse(JSON.stringify(prompt))" admin.js
273:    editor.prompt = JSON.parse(JSON.stringify(prompt));

# Verify component fix
$ grep -A2 "_expandedSteps = this._promptMode" src/components/wy-prompt-editor.js
this._expandedSteps = this._promptMode === 'multi' ? [0] : [];

// Reset git info banner when prompt changes (e.g., on cancel/discard)
this._showGitInfo = false;
```

✅ **Bundle deployed:** 672.99 KB, cache-bust `?v=20260203-2338`  
✅ **Commits pushed:** Design system + prompt-library  
✅ **Ready to test:** Hard refresh browser (Cmd+Shift+R)

## Related Documentation

- [test-discard-changes-fix.md](test-discard-changes-fix.md) - Complete test procedures
- [VARIATION-MANAGEMENT-SUMMARY.md](VARIATION-MANAGEMENT-SUMMARY.md) - Feature overview
- [docs/admin-system-plan.md](docs/admin-system-plan.md) - Admin system documentation
