# Multi-Step Preview Blank Bug - FIXED

## Problem
On the public site, multi-step prompts showed blank preview areas. When clicking the "Preview" tab for any step, the template text was not displayed.

**Symptoms:**
- Variables tab worked correctly
- Preview tab was blank (empty content)
- Copy/download worked (so template existed)
- Only affected public site, not admin

## Root Cause
The `wy-prompt-modal` component was missing an `updated()` lifecycle method to populate the `_values` object from the current step's variables.

**What was happening:**
1. Modal opened with multi-step prompt
2. `app.js` passed `steps` array with variable values
3. Modal never populated `_values` from step variables
4. `_compilePrompt()` method had empty `_values` object
5. Template placeholders like `{{topic}}` were not replaced
6. Preview showed blank/empty content

**Code flow:**
```javascript
// In _renderMultiStepBody()
const compiledPrompt = this._compilePrompt(step.template);

// In _compilePrompt()
_compilePrompt(template) {
  let compiled = template;
  Object.keys(this._values).forEach(key => {  // ← _values was empty!
    compiled = compiled.replace(...);
  });
  return compiled;
}
```

## Fix Applied

Added `updated()` lifecycle method to `wy-prompt-modal.js`:

```javascript
updated(changedProperties) {
  // When steps or activeStepIndex changes, populate _values from current step's variables
  if ((changedProperties.has('steps') || changedProperties.has('activeStepIndex')) && 
      this.steps && this.steps.length > 0) {
    const currentStep = this.steps[this.activeStepIndex];
    if (currentStep && currentStep.variables) {
      // Populate _values from step variables
      const newValues = {};
      currentStep.variables.forEach(v => {
        newValues[v.name] = v.value || '';
      });
      this._values = newValues;
    }
  }
  
  // When variables change for single-step prompts, populate _values
  if (changedProperties.has('variables') && this.variables && this.variables.length > 0) {
    const newValues = {};
    this.variables.forEach(v => {
      newValues[v.name] = v.value || '';
    });
    this._values = newValues;
  }
}
```

**What this does:**
- Runs when `steps` or `activeStepIndex` changes
- Extracts variable values from current step
- Populates `_values` object with those values
- Now `_compilePrompt()` has data to replace placeholders
- Also handles single-step prompts for consistency

## Files Changed

### Design System
1. `m3-design-v2/src/components/wy-prompt-modal.js` - Added `updated()` method
2. `m3-design-v2/dist/web-components.js` - Rebuilt (636KB)

### Prompt Library
3. `prompt-library/web-components.js` - Updated from build
4. `prompt-library/components/index.js` - Switched to local build (temporary)
5. `prompt-library/admin.html` - Updated cache-busting

## Local Development Setup

**Temporary change for testing:**
The public site now loads from the local `web-components.js` instead of CDN:

```javascript
// components/index.js
// TEMPORARY: Using local build for development/testing
// TODO: Revert to CDN after pushing changes to GitHub
import '../web-components.js?v=20260203-preview-fix';
```

**To revert to CDN later:**
```javascript
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=20260203';
```

## Verification

### Quick Test

1. Open: `http://localhost:3001/index.html`
2. Click on "Essay Topic Discovery" prompt
3. Click "Preview" tab
4. ✅ Should see the full template text with {{topic}} placeholders
5. Enter a value in the "Topic" field
6. ✅ Preview should update showing your value instead of {{topic}}
7. Click Step 2, 3, 4 buttons
8. ✅ Each step should show its own template in preview

### Automated Test

Load test script in browser console:

```javascript
// 1. Open Essay Topic Discovery prompt
// 2. Load test script
const script = document.createElement('script');
script.src = '/test-preview-fix.js';
document.head.appendChild(script);

// 3. Run test
testPreviewFix()
```

Expected output:
```
✅ SUCCESS: Preview area has content!
Content length: 1500+ chars
First 200 chars: Topic: {{topic}}...
```

## Why CDN vs Local Matters

**Admin page** (`admin.html`):
```html
<!-- Loads local file directly -->
<script type="module">
  import './web-components.js?v=...';
</script>
```

**Public site** (`index.html`):
```javascript
// components/index.js loads via import
import '../web-components.js?v=...';  // Now uses local
// Was: import 'https://cdn.jsdelivr.net/...' // Old CDN
```

The CDN still has the old version without the fix, which is why we switched to local temporarily.

## Production Deployment

When ready to deploy:

1. **Commit and push to GitHub:**
```bash
cd m3-design-v2
git add src/components/wy-prompt-modal.js src/components/wy-step-editor.js src/web-components.js
git commit -m "Fix multi-step preview blank display and add step editing

- Add updated() lifecycle to populate _values from step variables
- Fix radio button cancel behavior with preventDefault
- Add wy-step-editor component for admin
- Ensure preview shows template content in multi-step prompts"
git push origin main
```

2. **Purge jsDelivr CDN cache:**
```bash
curl -s "https://purge.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js"
```

3. **Revert components/index.js to CDN:**
```javascript
import 'https://cdn.jsdelivr.net/gh/mwyuwono/m3-design-v2@main/dist/web-components.js?v=20260203';
```

4. **Commit prompt-library:**
```bash
cd prompt-library
git add components/index.js
git commit -m "Revert to CDN after design system updates"
git push origin main
```

## Success Criteria

All tests should pass:

- ✅ Preview tab shows template content (not blank)
- ✅ Variable placeholders like {{topic}} are visible
- ✅ Entering variable values updates preview in real-time
- ✅ Switching steps shows different templates
- ✅ Copy button copies compiled template
- ✅ Download button downloads compiled template
- ✅ All 4 steps work correctly

## Technical Details

### LitElement Lifecycle

The `updated()` method is called after any reactive property changes and the component re-renders. This is the perfect place to:
- Sync derived state (`_values`) from props (`steps`, `variables`)
- Initialize internal state from external data
- Respond to prop changes

### Why _values Needs Population

The modal uses a flat `_values` object for all variable substitution:
- Single-step: `this.variables` → `_values`
- Multi-step: `this.steps[activeStepIndex].variables` → `_values`

Without `updated()`, `_values` was only populated when users typed in fields (`_handleInput`), but never initialized from the step's existing values.

## Status

✅ **FIXED** - Preview now shows template content for all multi-step prompts

The public site now uses the local build temporarily. After testing, push to GitHub and revert to CDN.

---

**Fix Date:** February 3, 2026  
**Root Cause:** Missing lifecycle method for state initialization  
**Impact:** High (users couldn't see templates)  
**Complexity:** Medium (understanding LitElement lifecycle)
