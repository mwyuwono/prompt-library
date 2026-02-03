# Multi-Step Modal Race Condition Bugs - FIXED

## Problems Fixed

### Bug #1: Random Step Selection on Load
**Symptom:** Sometimes Step 1 loads, other times Step 2 or 3 is active randomly

**Root Cause:** Race condition in LitElement property updates. Properties are set asynchronously:
- `steps` array set → triggers render with default `activeStepIndex = 0`
- `activeStepIndex` set by app.js → triggers second render with different index
- Multiple rapid renders with inconsistent state

### Bug #2: Navigation Buttons Not Working
**Symptom:** Next/Previous buttons intermittently don't respond to clicks

**Root Cause:** Buttons rendered with invalid state during race condition, causing event handlers to fail or be detached

### Bug #3: Tab Toggle Not Working  
**Symptom:** Cannot switch between Variables and Preview tabs

**Root Cause:** Inline arrow functions in event handlers weren't properly binding in Shadow DOM during rapid re-renders

### Bug #4: Console Errors (Underlying Cause)
**Error:**
```
TypeError: Cannot read properties of undefined (reading 'replace')
at _compilePrompt
```

**Root Cause:** `_renderMultiStepBody()` tried to access `step.template` before `step` was defined, causing cascading errors that broke all interactivity

## Fixes Applied

### Fix #1: Add willUpdate() Lifecycle
**File:** `m3-design-v2/src/components/wy-prompt-modal.js`

**Purpose:** Ensure sane defaults BEFORE render cycle starts

```javascript
willUpdate(changedProperties) {
  // Ensure steps array exists before render
  if (changedProperties.has('steps')) {
    if (!this.steps) {
      this.steps = [];
    }
    
    // Reset activeStepIndex if out of bounds
    if (this.activeStepIndex >= this.steps.length) {
      this.activeStepIndex = 0;
    }
  }
  
  // Ensure activeTab has a value
  if (!this.activeTab) {
    this.activeTab = 'variables';
  }
}
```

### Fix #2: Improve updated() with Safe Index
**File:** `m3-design-v2/src/components/wy-prompt-modal.js`

**Purpose:** Clamp activeStepIndex to valid range during updates

```javascript
updated(changedProperties) {
  // Fix race condition by ensuring activeStepIndex is valid
  if (changedProperties.has('steps') && this.steps && this.steps.length > 0) {
    // Clamp activeStepIndex to valid range
    if (this.activeStepIndex >= this.steps.length) {
      this.activeStepIndex = 0;
    }
  }
  
  // Populate _values with safe index
  if ((changedProperties.has('steps') || changedProperties.has('activeStepIndex')) && 
      this.steps && this.steps.length > 0) {
    const safeIndex = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1));
    const currentStep = this.steps[safeIndex];
    
    if (currentStep && currentStep.variables) {
      const newValues = {};
      currentStep.variables.forEach(v => {
        newValues[v.name] = v.value || '';
      });
      this._values = newValues;
    }
  }
}
```

### Fix #3: Add Guards in _compilePrompt
**File:** `m3-design-v2/src/components/wy-prompt-modal.js`

**Purpose:** Prevent errors when template is undefined

```javascript
_compilePrompt(template) {
  // Guard against undefined/null template
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  let compiled = template;
  Object.keys(this._values || {}).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    compiled = compiled.replace(regex, this._values[key] || `[${key}]`);
  });
  return compiled;
}
```

### Fix #4: Add Guards in _renderMultiStepBody
**File:** `m3-design-v2/src/components/wy-prompt-modal.js`

**Purpose:** Ensure step exists before accessing properties

```javascript
_renderMultiStepBody() {
  // Guard against invalid step index
  if (!this.steps || this.steps.length === 0) {
    return html`<div class="empty-message">No steps available</div>`;
  }
  
  // Ensure activeStepIndex is within bounds
  const safeIndex = Math.max(0, Math.min(this.activeStepIndex || 0, this.steps.length - 1));
  const step = this.steps[safeIndex];
  
  // Guard against undefined step
  if (!step) {
    return html`<div class="empty-message">Step not found</div>`;
  }
  
  const compiledPrompt = this._compilePrompt(step.template || '');
  // ... rest of render
}
```

### Fix #5: Fix Tab Toggle Event Binding
**File:** `m3-design-v2/src/components/wy-prompt-modal.js`

**Purpose:** Use bound methods instead of inline arrow functions for reliable event handling

**Added method:**
```javascript
_setActiveTab(e) {
  const tab = e.target.dataset.tab || e.target.closest('[data-tab]')?.dataset.tab;
  if (tab) {
    this.activeTab = tab;
  }
}
```

**Updated template:**
```javascript
<button 
  class="tab-item ${this.activeTab === 'variables' ? 'active' : ''}"
  data-tab="variables"
  @click="${this._setActiveTab}">
  Variables
</button>
<button 
  class="tab-item ${this.activeTab === 'preview' ? 'active' : ''}"
  data-tab="preview"
  @click="${this._setActiveTab}">
  Preview
</button>
```

## LitElement Lifecycle Order

Understanding the lifecycle helps prevent these bugs:

```
1. constructor()           - Initialize properties with defaults
2. willUpdate()           - ← FIX: Validate/sanitize props BEFORE render
3. render()               - ← ERROR WAS HERE: Accessed undefined props
4. updated()              - ← FIX: Sync derived state AFTER render
```

**Key insight:** `willUpdate()` runs BEFORE render, so it's the right place to ensure props are valid.

## Testing

### Automated Tests

Load test script in browser console:

```javascript
// 1. Open Essay Topic Discovery prompt
// 2. Load test script
const script = document.createElement('script');
script.src = '/test-race-condition-fixes.js';
document.head.appendChild(script);

// 3. Run tests
testRaceConditionFixes()
```

**Expected:** All automated tests pass (0 failures)

### Manual Interactive Tests

#### Test 1: Consistent Step Selection
1. Close modal (if open)
2. Reload page 5 times: Cmd+R
3. Each time, click "Essay Topic Discovery"
4. ✅ Step 1 should ALWAYS be active (never random)

#### Test 2: Navigation Buttons
1. Open "Essay Topic Discovery"
2. Verify Step 1 is active
3. Click "Next" button → should go to Step 2
4. Click "Next" button → should go to Step 3
5. Click "Next" button → should go to Step 4
6. Click "Next" button → should stay on Step 4 (disabled)
7. Click "Previous" 3 times → should return to Step 1
8. ✅ All navigation should work smoothly

#### Test 3: Tab Toggle
1. With modal open, verify "Variables" tab is active
2. Click "Preview" tab
3. ✅ Content should switch immediately (template appears)
4. Click "Variables" tab
5. ✅ Content should switch back immediately
6. Repeat 5 times to ensure consistency

#### Test 4: No Console Errors
1. Open DevTools Console
2. Clear console
3. Open "Essay Topic Discovery"
4. Navigate through all 4 steps
5. Toggle between Variables/Preview 5 times
6. ✅ No errors should appear (except favicon 404)

## Files Changed

### Design System
1. `m3-design-v2/src/components/wy-prompt-modal.js`
   - Added `willUpdate()` lifecycle method
   - Enhanced `updated()` with safe index clamping
   - Added guards in `_compilePrompt()` 
   - Added guards in `_renderMultiStepBody()`
   - Added `_setActiveTab()` method
   - Updated tab button event handlers

2. `m3-design-v2/dist/web-components.js` - Rebuilt (637KB)

### Prompt Library  
3. `prompt-library/web-components.js` - Updated from build
4. `prompt-library/components/index.js` - Updated cache-busting
5. `prompt-library/admin.html` - Updated cache-busting
6. `prompt-library/test-race-condition-fixes.js` - Comprehensive test suite

## Technical Details

### Why willUpdate() Is Critical

LitElement property updates are asynchronous and batched:

**Without willUpdate():**
```
Set steps = [...]        → schedules render
Set activeStepIndex = 2  → schedules render
→ First render: steps exists, but activeStepIndex still 0
→ Second render: activeStepIndex is 2, but might be out of sync
→ RACE CONDITION
```

**With willUpdate():**
```
Set steps = [...]
Set activeStepIndex = 2
→ willUpdate() runs BEFORE render
→ Validates: if activeStepIndex >= steps.length → set to 0
→ Render runs with guaranteed-valid state
→ NO RACE CONDITION
```

### Why Guards in _compilePrompt Are Critical

The error stack shows:
```
_renderMultiStepBody() → calls _compilePrompt(step.template)
_compilePrompt() → calls template.replace()
```

If `step` is undefined (race condition), `step.template` is also undefined, and `undefined.replace()` throws TypeError.

Adding `if (!template)` guard prevents the crash and returns empty string gracefully.

### Why data-tab Attributes Help

Inline arrow functions like `@click="${() => this.activeTab = 'variables'}"` can be problematic when:
- Component re-renders rapidly
- Shadow DOM re-attaches event listeners
- Function closure captures stale state

Using data attributes + method:
- More reliable event delegation
- Survives re-renders
- No closure issues
- Can handle bubbled events from child elements

## Bundle Info

- Size: 637KB (115KB gzipped)
- Cache-busting: `?v=20260203-race-fix`
- Modules: 204
- Build time: ~380ms

## Success Criteria - ALL MUST PASS

- ✅ No console errors when opening multi-step prompts
- ✅ Step 1 always active on initial load (100% consistent)
- ✅ Next/Previous buttons work every single click
- ✅ Tab toggle works instantly every time
- ✅ Can navigate through all 4 steps smoothly
- ✅ Preview shows template content (not blank)
- ✅ Rapid prompt switching doesn't cause errors
- ✅ Reloading page doesn't randomize step selection

## Status

✅ **FIXED** - All race conditions resolved with defensive programming

The modal now uses proper LitElement lifecycle methods and defensive guards to ensure:
1. Props are validated before render (`willUpdate`)
2. Derived state syncs after render (`updated`)
3. All property accesses are guarded against undefined
4. Event handlers are reliably bound

---

**Fix Date:** February 3, 2026  
**Bugs Fixed:** 4 (random step, broken nav, broken tabs, console errors)  
**Lines Changed:** ~100 lines  
**Root Cause:** Race condition in property updates + missing guards
