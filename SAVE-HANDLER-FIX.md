# Multi-Step Template Save Bug - FIXED

## Problem
When editing step templates in the admin and clicking Save, the template content was not being saved to prompts.json. This caused:
- Preview tab to show blank/empty content
- Copy button to copy nothing
- Template data to be lost

## Root Cause

The `_handleSave()` method in `wy-prompt-editor` only handled single-step prompts:

```javascript
// OLD CODE - Only works for single-step
_handleSave() {
  // Get fresh template value from THE textarea component
  const codeTextarea = this.shadowRoot.querySelector('wy-code-textarea');
  if (codeTextarea) {
    const textarea = codeTextarea.shadowRoot?.querySelector('textarea');
    if (textarea) {
      this._editedPrompt.template = textarea.value;  // ← Single template only
    }
  }
  
  this.dispatchEvent(new CustomEvent('save', { ... }));
}
```

**Problem:** For multi-step prompts, there are MULTIPLE `wy-code-textarea` components (one per step editor), and the save handler wasn't reading their values.

**Why this happened:**
- The `wy-step-editor` emits `step-change` events when fields change
- These events update `_editedPrompt.steps[index]` in memory
- BUT `wy-code-textarea` uses property binding (`.value="${...}"`), which doesn't always sync back to the parent immediately
- When Save is clicked, the latest textarea DOM values weren't being captured
- The saved JSON had empty or missing template fields

## Fix Applied

Updated `_handleSave()` to handle both single-step and multi-step prompts:

```javascript
_handleSave() {
  if (this._promptMode === 'multi') {
    // For multi-step prompts: Get fresh template values from each step editor
    const stepEditors = this.shadowRoot.querySelectorAll('wy-step-editor');
    stepEditors.forEach((stepEditor, index) => {
      const codeTextarea = stepEditor.shadowRoot?.querySelector('wy-code-textarea');
      if (codeTextarea) {
        const textarea = codeTextarea.shadowRoot?.querySelector('textarea');
        if (textarea && this._editedPrompt.steps[index]) {
          // Read current DOM value directly to ensure we get latest edits
          this._editedPrompt.steps[index].template = textarea.value;
        }
      }
    });
  } else {
    // For single-step prompts: Get fresh template value from the textarea component
    const codeTextarea = this.shadowRoot.querySelector('wy-code-textarea');
    if (codeTextarea) {
      const textarea = codeTextarea.shadowRoot?.querySelector('textarea');
      if (textarea) {
        // Read current DOM value directly to ensure we get latest edits
        this._editedPrompt.template = textarea.value;
      }
    }
  }
  
  this.dispatchEvent(new CustomEvent('save', {
    detail: { prompt: this._editedPrompt },
    bubbles: true,
    composed: true
  }));
}
```

## How It Works

### Multi-Step Save Process

1. User clicks "Save Changes" button
2. `_handleSave()` detects `_promptMode === 'multi'`
3. Finds all `wy-step-editor` components in Shadow DOM
4. For each step editor:
   - Finds its `wy-code-textarea` child
   - Reaches into the textarea's Shadow DOM
   - Reads the raw `textarea.value` from the DOM
   - Updates `_editedPrompt.steps[index].template` with fresh value
5. Dispatches `save` event with complete data
6. API route saves to `prompts.json`

### Why Direct DOM Access Is Necessary

LitElement property binding (`.value="${...}"`) is:
- One-way by default (parent → child)
- Async updates
- May not reflect latest user input immediately

**Direct DOM access ensures:**
- Get actual current value from textarea element
- Capture in-progress edits before save
- No race conditions or stale data

## Data Recovery

Step 1's template was lost during the buggy save. I've restored it from git history to the value you had previously entered (the updated version with "Context: This is step 1..." introduction).

**Current template** (lines 516 in prompts.json):
- Starts with: "Context: This is step 1 of a multi-step prompt..."
- Includes conceptual analysis instructions
- ~2400 characters long

If this isn't the template you wanted, you can:
1. Open admin: `http://localhost:3001/admin.html#audio-essay-discovery`
2. Expand Step 1
3. Edit the template field
4. Click "Save Changes" (now works correctly)

## Files Changed

1. `m3-design-v2/src/components/wy-prompt-editor.js` - Fixed `_handleSave()` method
2. `m3-design-v2/dist/web-components.js` - Rebuilt (638KB)
3. `prompt-library/web-components.js` - Updated from build
4. `prompt-library/admin.html` - Updated cache-busting (`?v=20260203-save-fix`)
5. `prompt-library/components/index.js` - Updated cache-busting
6. `prompt-library/prompts.json` - Template field restored for step 1

## Testing

### Verify the Fix

1. **Open admin:** `http://localhost:3001/admin.html#audio-essay-discovery`
2. **Edit Step 1 template** - Make a small change
3. **Click "Save Changes"**
4. **Reload admin** - Verify change persisted
5. **Check prompts.json** - Verify template field exists and has content

### Test Public Site

1. **Open site:** `http://localhost:3001/index.html`
2. **Click "Essay Topic Discovery"**
3. **Click "Preview" tab**
4. ✅ Template should appear (not blank)
5. **Fill in Topic field**
6. ✅ Preview should update with value
7. **Click "Copy" button**
8. ✅ Should copy template to clipboard
9. **Paste somewhere** - Verify content exists

### Debug If Still Not Working

Load debug script:
```javascript
const script = document.createElement('script');
script.src = '/debug-step-template.js';
document.head.appendChild(script);
debugStepTemplate();
```

This will show:
- All steps and their template status
- Current step data
- _values object contents
- Compilation test results
- DOM element status

## Success Criteria

After fix:
- ✅ Editing step templates in admin saves correctly
- ✅ All step templates persist in prompts.json
- ✅ Preview tab shows template content
- ✅ Copy button copies compiled template
- ✅ No data loss on save

## Technical Details

### Shadow DOM Traversal

The save handler uses this traversal pattern:
```
wy-prompt-editor (shadowRoot)
  └─ wy-step-editor (shadowRoot)
      └─ wy-code-textarea (shadowRoot)
          └─ textarea (native element)  ← Read .value from here
```

Three levels of Shadow DOM require:
1. `this.shadowRoot.querySelectorAll('wy-step-editor')` - Get all step editors
2. `stepEditor.shadowRoot.querySelector('wy-code-textarea')` - Get textarea component
3. `codeTextarea.shadowRoot.querySelector('textarea')` - Get native textarea
4. `textarea.value` - Read current value

### Why This Pattern Is Needed

LitElement components use Shadow DOM to encapsulate their internals. We can't just query `.querySelector('textarea')` from the top level - we must traverse each Shadow boundary explicitly.

This is the same pattern used for single-step saves, now extended to handle multiple step editors.

## Status

✅ **FIXED** - Multi-step template editing now saves correctly

Templates will persist when you edit and save in the admin.

---

**Fix Date:** February 3, 2026  
**Root Cause:** Save handler didn't read DOM values from multi-step editors  
**Impact:** Critical (data loss)  
**Complexity:** Medium (Shadow DOM traversal)
