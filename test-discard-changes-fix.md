# Test: Discard Changes After Variation Conversion

## Bug Fixed

**Issue:** Converting a prompt to variations and then clicking "Discard Changes" would not properly reset the UI. Changes appeared to be discarded but would revert on page refresh.

**Root Cause:** `loadPrompt()` was setting the same object reference, so Lit's reactivity system wasn't detecting the change and not triggering the `updated()` lifecycle.

**Fix Applied:**
1. **admin.js** - Create deep copy when loading prompt: `editor.prompt = JSON.parse(JSON.stringify(prompt))`
2. **wy-prompt-editor.js** - Reset `_showGitInfo` banner on prompt change

## Test Procedure

### Test 1: Single-Step → Variations → Discard

1. **Setup:**
   - Open http://localhost:3001/admin
   - Select "Audio Essay" (single-step prompt)

2. **Convert to Variations:**
   - Click "Convert to Variations" button
   - **Expected:** Variation editor appears with 1 variation

3. **Discard Changes:**
   - Click "Discard Changes" button
   - **Expected:** 
     - ✅ UI immediately reverts to single-step mode
     - ✅ "Prompt Type" section with Single Step/Multi-Step radio buttons appears
     - ✅ Template and variables are restored
     - ✅ No variations editor visible
     - ✅ Toast: "Changes discarded"

4. **Verify State:**
   - Check console logs for "Loading prompt: audio-essay"
   - Verify no errors in console
   - **No page refresh needed** - changes should revert immediately

### Test 2: Multi-Step → Variations → Discard

1. **Setup:**
   - Select "Essay Topic Discovery" (multi-step prompt with 4 steps)

2. **Convert to Variations:**
   - Click "Convert to Variations" button
   - **Expected:** Variation editor appears with 1 multi-step variation (4 steps)

3. **Discard Changes:**
   - Click "Discard Changes" button
   - **Expected:**
     - ✅ UI immediately reverts to multi-step mode
     - ✅ All 4 steps are visible
     - ✅ No variations editor visible
     - ✅ Toast: "Changes discarded"

### Test 3: Variations → Standard → Discard

1. **Setup:**
   - Select "Writing Assistant" (already has variations)

2. **Convert to Standard:**
   - Click "Convert to Standard" button
   - Confirm dialog
   - **Expected:** Standard mode with first variation as template

3. **Discard Changes:**
   - Click "Discard Changes" button
   - **Expected:**
     - ✅ UI immediately reverts to variations mode
     - ✅ Variation editor appears
     - ✅ All original variations are restored
     - ✅ Toast: "Changes discarded"

### Test 4: Multiple Conversions → Discard

1. **Setup:**
   - Select "Audio Essay" (single-step)

2. **Multiple Conversions:**
   - Convert to Variations
   - Add a second variation
   - Edit the first variation's name
   - Edit the template

3. **Discard Changes:**
   - Click "Discard Changes" button
   - **Expected:**
     - ✅ UI reverts to original single-step mode
     - ✅ All edits discarded
     - ✅ No variations present

### Test 5: Git Info Banner Reset

1. **Setup:**
   - Select any prompt
   - Make any edit (e.g., change title)
   - Click "Save Changes"
   - **Expected:** Git info banner appears

2. **Discard After Save:**
   - Make another edit (e.g., convert to variations)
   - Click "Discard Changes"
   - **Expected:**
     - ✅ Git info banner disappears
     - ✅ UI resets correctly
     - ✅ No stale state indicators

## Technical Verification

### Console Logging

When you click "Discard Changes", you should see:

```
Loading prompt: [prompt-id]
Found prompt: [prompt-title]
Editor element: <wy-prompt-editor>
Editor is defined: true
Prompt set on editor
```

### State Reset Checklist

After clicking "Discard Changes", verify these internal states are reset:

- [ ] `_editedPrompt` - Deep copy of original prompt
- [ ] `_promptMode` - Correctly set to 'single' or 'multi'
- [ ] `_expandedSteps` - Reset (empty for single, [0] for multi)
- [ ] `_showGitInfo` - Set to false
- [ ] UI reflects original prompt structure (variations vs standard)

## Deployment Info

**Commits:**
- Design System: `8c8fe20` - Fix cancel/discard changes state reset for variations
- Prompt Library: `7125010` - Fix: Ensure prompt property changes trigger re-render on discard

**Bundle:**
- Size: 672.99 KB
- Cache-bust: `?v=20260203-2338`

## Success Criteria

✅ **All tests pass** - Changes revert immediately without page refresh  
✅ **No console errors** - Clean execution of discard operation  
✅ **Proper toast notifications** - "Changes discarded" appears  
✅ **State consistency** - Repeated conversions and discards work correctly  
✅ **Git banner reset** - Stale UI indicators are cleared  

## Known Behavior (Not Bugs)

- **Unsaved conversions:** If you convert to variations, save, then discard, the saved conversion persists (expected - save committed to prompts.json)
- **URL hash:** Hash remains on current prompt ID after discard (expected - user stays on same prompt)
- **Sidebar:** Active prompt remains highlighted after discard (expected - prompt is still loaded)
