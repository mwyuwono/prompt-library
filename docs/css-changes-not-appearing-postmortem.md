# Post-Mortem: CSS Changes Not Appearing in Admin

**Date:** 2026-02-03  
**Project:** prompt-library  
**Status:** IN PROGRESS - Outstanding issues remain

## Summary

After implementing multiple CSS changes to design system components (sticky actions panel, info panel background color), changes were not appearing in the admin interface despite multiple rebuilds, commits, and cache-busting attempts.

## Timeline of Issues

### Issue 1: Featured Filter Chip Not Appearing in Controls Bar
**Reported:** After implementing Featured prompts feature  
**Symptom:** Heart icons visible, but Featured filter chip missing from controls bar  

**Root Cause:**  
Design system source files were updated but `dist/web-components.js` was not rebuilt.

**Resolution:**  
- Ran `npm run build` in m3-design-v2
- Copied `dist/web-components.js` to `prompt-library/web-components.js`
- Updated cache-busting parameter in `components/index.js` (public site)

**Status:** ✅ RESOLVED

---

### Issue 2: Sticky Actions Panel Not Working
**Reported:** After implementing sticky positioning for Save/Discard buttons  
**Symptom:** Actions panel scrolls with page instead of sticking to top

**Root Cause(s):**

1. **Duplicate CSS Selectors** (PRIMARY CAUSE)
   - Two `.actions` selectors existed in `wy-prompt-editor.js`:
     - Line 74: `position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px);`
     - Line 140: `display: flex; gap: var(--spacing-sm, 8px);`
   - CSS cascade rule: When selectors have equal specificity, last one wins
   - Second selector completely overwrote first, removing sticky positioning
   
2. **Build Not Run After Source Changes**
   - Commits d68cab2 and 4457d35 modified source files
   - Did NOT run `npm run build` to update `dist/web-components.js`
   - Distribution bundle remained stale

3. **Bundle Not Copied to Consuming Project**
   - Even when `dist/` was built, it wasn't copied to `prompt-library/web-components.js`
   - Admin uses local bundle, not CDN

4. **Cache-Busting Parameter Not Updated**
   - `admin.html` kept old `?v=20260203-save-fix` parameter
   - Browser served cached version even after bundle was updated

**Resolution:**
- Merged duplicate `.actions` selectors into single definition
- Rebuilt design system: `npm run build`
- Copied to prompt-library: `cp dist/web-components.js ../prompt-library/web-components.js`
- Updated cache-busting parameter in `admin.html` to `?v=20260203-1627`
- Committed all changes

**Status:** ✅ RESOLVED (pending user verification)

---

### Issue 3: Info Panel Background Color Not Appearing
**Reported:** Same session as sticky actions  
**Symptom:** Info panel compact variant not showing secondary-container background in step instructions (Essay Topic Discovery)

**Root Cause #1 (Initial):**
- Source changes were made (commit d60c26e)
- Build WAS run and bundle WAS updated
- BUT cache-busting parameter in `admin.html` was not updated
- Browser served cached version of bundle

**Root Cause #2 (PRIMARY - Discovered after cache-busting update):**
- **Shadow DOM CSS Specificity + Browser Support**
- Used `:host-context(wy-prompt-modal)` pseudo-class to style components inside modal
- `:host-context()` has **poor cross-browser support**:
  - Firefox: **Not supported at all**
  - Safari: Buggy implementation
  - Chrome: **Deprecated** (removed from standards track)
- When `:host-context()` doesn't work:
  - Rule 2 (transparent background) is ignored
  - Rule 3 (compact secondary-container) is ignored
  - Only Rule 1 (base `.panel.compact`) applies
- Result: Background color MAY appear in some browsers but not others
- **CSS cascade conflict**: Even in supporting browsers, Rule 2 (transparent) may override Rule 3

**Technical Deep Dive:**

Shadow DOM CSS has 3 specificity rules:
1. `.panel.compact` (base) - Always applies
2. `:host-context(wy-prompt-modal) .panel` - Sets transparent (overrides base)
3. `:host-context(wy-prompt-modal) .panel.compact` - Sets secondary-container (should override #2)

Problem: If browser doesn't support `:host-context()`, Rules 2&3 ignored → base applies.
If browser partially supports, Rule 2 might apply without Rule 3 working.

**Resolution:**
- **Removed all `:host-context()` rules** from wy-info-panel.js
- **Replaced with CSS custom properties** (standard way to theme Shadow DOM):
  - `--wy-info-panel-bg`
  - `--wy-info-panel-border`
  - `--wy-info-panel-compact-bg`
  - `--wy-info-panel-compact-border`
  - `--wy-info-panel-padding`
  - `--wy-info-panel-compact-padding`
  - `--wy-info-panel-font-size`
- **wy-prompt-modal.js sets these variables** for components inside modal
- CSS custom properties reliably penetrate Shadow DOM in all browsers
- Rebuilt bundle (668.19 kB)
- Updated cache-busting to `?v=20260203-shadow-fix`

**Status:** ✅ RESOLVED (pending user verification)

---

## Outstanding Issues

### Issue 4: Changes Still Not Visible After All Fixes
**Reported:** After applying all fixes above  
**Symptom:** User reports changes still not visible in admin

**Possible Causes to Investigate:**

1. **Server Not Restarted**
   - Admin requires Node.js server (`node server.js`)
   - Server may be serving old files from memory/cache
   - Solution: Restart server, reload page

2. **Browser Service Worker Cache**
   - Some browsers cache module imports aggressively
   - Cache-busting parameter may not be enough
   - Solution: Clear browser cache completely, or use DevTools to disable cache

3. **Module Import Caching**
   - ES modules (`<script type="module">`) are cached by browser
   - Even with `?v=` parameter, browser may serve cached module
   - Solution: Add timestamp to cache-busting (e.g., `?v=20260203-162750`)

4. **Git Not Pulled on Server**
   - If running server from different directory
   - May be serving old files that haven't been pulled
   - Solution: `git pull` in server directory

5. **Wrong URL/Port**
   - User may be accessing wrong server instance
   - Check if accessing http://localhost:3000/admin or http://localhost:8001/admin
   - Solution: Verify correct URL

**Status:** 🔍 INVESTIGATING

---

## System Architecture Context

### Design System Distribution (m3-design-v2)

**Build Process:**
```bash
npm run build  # Creates dist/web-components.js (minified bundle)
```

**Consuming Methods:**

| Project | Method | Import Location | Notes |
|---------|--------|-----------------|-------|
| prompt-library (admin) | Local bundle | `admin.html` imports `./web-components.js` | Requires manual copy from m3-design-v2 |
| prompt-library (public) | CDN | `components/index.js` imports from jsDelivr | Auto-updates after CDN purge |
| plots | npm link | Imports from `node_modules/wy-family-office` | Live updates, no cache-busting |
| Weaver-Yuwono-Home-Page | CDN | CSS imports from jsDelivr | Requires cache-busting parameter updates |

### Cache Layers

```
User Browser
  ↓
Cache-Busting Parameter (?v=YYYYMMDD-description)
  ↓
ES Module Cache (for <script type="module">)
  ↓
[If CDN] jsDelivr CDN Cache (24hr default)
  ↓
[If Local] Node.js Server Static File Serving
  ↓
File System (web-components.js)
  ↓
Git Repository
```

**Each layer can cause stale content!**

---

## Lessons Learned

### 1. Duplicate CSS Selectors Are Silent Killers

**Problem:** CSS allows duplicate selectors without error. Last one silently wins.

**Prevention:**
- Search for duplicate selectors before committing CSS changes
- Use unique, descriptive class names to avoid collisions
- Consider CSS linting to catch duplicates

**Command to Check:**
```bash
# Find duplicate selectors in a file
grep -o "^\s*\.[a-z-]*\s*{" file.css | sort | uniq -d
```

### 2. Source Changes ≠ Distribution Changes

**Problem:** Modifying `src/` files doesn't automatically update `dist/` bundle.

**Prevention:**
- **ALWAYS run `npm run build` after modifying source files**
- Include `dist/` files in the same commit as `src/` changes
- Add git hook to remind about build step

**Workflow:**
```bash
# 1. Edit source
vim src/components/wy-component.js

# 2. Build (REQUIRED)
npm run build

# 3. Commit both
git add src/components/wy-component.js dist/web-components.js
git commit -m "Update component"
```

### 3. Distribution Bundle Must Be Copied to Consuming Projects

**Problem:** Updating `m3-design-v2/dist/` doesn't update `prompt-library/web-components.js`.

**Prevention:**
- After every m3-design-v2 build, copy bundle to consuming projects with local bundles
- Document which projects use local bundles vs CDN
- Consider automation script

**Command:**
```bash
# After building m3-design-v2
cp dist/web-components.js ../prompt-library/web-components.js
```

### 4. Cache-Busting Parameters Must Be Updated

**Problem:** Even with new bundle, browser serves cached version if `?v=` parameter unchanged.

**Prevention:**
- **Update cache-busting parameter every time bundle is copied**
- Use timestamp format: `?v=YYYYMMDD-HHMM` for uniqueness
- Grep for old parameters before committing

**Files to Update (prompt-library):**
- `admin.html` line 52: `./web-components.js?v=YYYYMMDD-HHMM`
- `components/index.js` line 9: CDN URL with `?v=YYYYMMDD`

**Command to Find:**
```bash
grep -r "web-components.js?v=" admin.html components/index.js
```

### 5. Multiple Cache Layers Create Confusion

**Problem:** Browser cache + ES module cache + CDN cache = hard to debug.

**Prevention:**
- Use DevTools with "Disable cache" while developing
- Test in incognito/private window
- Document all cache layers for each project

### 6. Shadow DOM :host-context() Has Poor Browser Support

**Problem:** Using `:host-context(wy-prompt-modal)` to style components based on parent context.

**Browser Support Issues:**
- Firefox: Not supported at all
- Safari: Buggy implementation
- Chrome: Deprecated (removed from standards track)

**Result:** Styles don't apply consistently across browsers, creating hard-to-debug issues.

**Prevention:**
- **NEVER use `:host-context()` for Shadow DOM styling**
- Use **CSS custom properties** (CSS variables) instead
- CSS variables reliably penetrate Shadow DOM boundaries
- Standard pattern for web component theming

**Example:**

```css
/* ❌ BAD - Uses :host-context() */
:host-context(parent-component) .child {
    background-color: red;
}

/* ✅ GOOD - Uses CSS custom properties */
:host {
    --child-bg: var(--default-color);
}
.child {
    background-color: var(--child-bg);
}
```

Then parent component sets variables:
```css
child-component {
    --child-bg: red;
}
```

---

## Complete Checklist for Design System Changes

When making changes to m3-design-v2 components:

- [ ] 1. Edit source files in `src/components/`
- [ ] 2. Run `npm run build` to create `dist/web-components.js`
- [ ] 3. Commit **both** `src/` and `dist/` files together
- [ ] 4. Push to GitHub
- [ ] 5. Purge jsDelivr CDN cache (for CDN-consuming projects)
- [ ] 6. Copy `dist/web-components.js` to projects using local bundles:
  - [ ] `cp dist/web-components.js ../prompt-library/web-components.js`
- [ ] 7. Update cache-busting parameters in consuming projects:
  - [ ] `prompt-library/admin.html` - Change `?v=` to current timestamp
  - [ ] `prompt-library/components/index.js` - Update `?v=` parameter
  - [ ] `Weaver-Yuwono-Home-Page/projects/projects.css` - Update `?v=` in @import
- [ ] 8. Commit bundle updates in consuming projects
- [ ] 9. Hard refresh browser (`Cmd+Shift+R`) or clear cache
- [ ] 10. Verify changes appear in all consuming projects

---

## Outstanding Questions

1. **Is the admin server running?**
   - Check: `ps aux | grep "node server"`
   - Verify: http://localhost:3000/admin or http://localhost:8001/admin?

2. **Has the server been restarted since bundle update?**
   - Node.js may cache require() modules
   - Solution: Restart `node server.js`

3. **Is browser cache fully cleared?**
   - Try: Open DevTools → Network tab → Check "Disable cache"
   - Try: Incognito window
   - Try: Clear all browser data for localhost

4. **Are we accessing the correct URL?**
   - Multiple servers may be running on different ports
   - Verify which port has the updated files

---

## Next Steps

1. User confirms which specific changes are still not appearing:
   - [ ] Sticky actions panel?
   - [ ] Info panel background color?
   - [ ] Featured toggle?
   - [ ] Variation editor?

2. Verify server status and URL:
   - [ ] Check which server is running
   - [ ] Confirm URL being accessed
   - [ ] Restart server with latest files

3. Nuclear option if all else fails:
   - [ ] Kill all Node.js/Python servers
   - [ ] Clear browser cache completely
   - [ ] `cd prompt-library && git pull`
   - [ ] `node server.js`
   - [ ] Open http://localhost:3000/admin in incognito window

---

## Files Modified This Session

**m3-design-v2:**
- `src/components/wy-controls-bar.js` - Added Featured filter chip
- `src/components/wy-prompt-editor.js` - Added Featured toggle, fixed duplicate .actions
- `src/components/wy-variation-editor.js` - NEW component for variation editing
- `src/components/wy-info-panel.js` - Added secondary-container background for compact variant
- `src/components/wy-prompt-modal.js` - Fixed padding to use design system variables
- `src/web-components.js` - Registered wy-variation-editor
- `dist/web-components.js` - Rebuilt multiple times
- `CLAUDE.md` - Added cache-busting guidance

**prompt-library:**
- `prompts.json` - Added `featured: false` to all prompts
- `app.js` - Added Featured filtering, sorting, heart icons, modal state reset
- `styles.css` - Updated card-icon-container for featured heart icon
- `components/index.js` - Updated cache-busting parameters
- `admin.html` - Updated cache-busting parameter multiple times
- `web-components.js` - Copied from m3-design-v2 multiple times
- `CLAUDE.md` - Added cache-busting parameter management section

**plots:**
- `CLAUDE.md` - Added npm link cache-busting guidance

**Weaver-Yuwono-Home-Page:**
- `CLAUDE.md` - Added cache-busting workflow

---

## Prevention Strategy (TO DO)

Once all issues resolved, create:

1. **Pre-commit Hook** - Reminds to build dist/ if src/ changed
2. **Build Script** - Automates build + copy + cache-busting update
3. **Verification Script** - Tests that changes appear in all consuming projects
4. **Documentation** - Step-by-step checklist in CLAUDE.md files

---

## Status: AWAITING USER FEEDBACK

Please check the admin page now and confirm:
1. What URL are you accessing? (http://localhost:3000/admin or other?)
2. Which changes are still not visible?
3. Can you open DevTools → Network tab and verify `web-components.js?v=20260203-1627` is being loaded (not an older version)?
