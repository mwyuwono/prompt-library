# Post-Mortem: CSS Changes Not Appearing in Admin

**Date:** 2026-02-03  
**Project:** prompt-library  
**Status:** ✅ COMPLETE - All issues resolved, automation implemented

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

## Resolved Issues (Previously Outstanding)

### Issue 4: Sticky Actions Still Not Working After CSS Fix
**Reported:** After applying duplicate selector fix  
**Symptom:** Actions panel still scrolls with page despite correct CSS

**Root Cause: Shadow DOM Scroll Context Isolation**

The CSS was correct (`position: sticky; top: 0;`), but `position: sticky` works relative to the nearest scrollable ancestor. The problem:

```
#main-content (overflow-y: auto) ← Scrolling happens HERE (light DOM)
  └── wy-prompt-editor (Shadow DOM boundary)
        └── .editor-form
              └── .actions (position: sticky) ← Can't see parent scroll context
```

Shadow DOM creates isolation - the `.actions` element couldn't "see" that `#main-content` was scrolling because it's outside the Shadow DOM boundary.

**Resolution:**
- Moved scroll context INTO the Shadow DOM
- Made `.editor-form` the scrollable container (`overflow-y: auto; max-height: calc(100vh - 48px)`)
- Removed `overflow-y: auto` from `#main-content` in admin.css
- Now `.actions` is sticky relative to `.editor-form`'s scroll

**Status:** ✅ RESOLVED

---

### Issue 5: Info Panel Background Still Missing on Public Site
**Reported:** After Shadow DOM CSS fix was applied  
**Symptom:** Step instructions in Essay Topic Discovery still had transparent background

**Root Cause: Stale CDN Cache-Busting Parameter**

The CSS custom property fix was in the local bundle, but `components/index.js` still had the old cache-busting parameter `?v=20260203-featured` instead of the updated one.

**Resolution:**
- Updated `components/index.js` to `?v=20260203-sticky-fix`
- Purged jsDelivr CDN cache
- Committed and pushed changes

**Status:** ✅ RESOLVED

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

### 7. Shadow DOM Scroll Context Isolation Breaks position: sticky

**Problem:** `position: sticky` inside Shadow DOM can't detect scroll context in light DOM parent.

**How it happens:**
```
#parent (overflow-y: auto) ← Scrolling container (light DOM)
  └── my-component (Shadow DOM boundary)
        └── .sticky-element (position: sticky) ← Can't see parent scroll
```

**Result:** Element doesn't stick because it's looking for scroll context within Shadow DOM, which doesn't exist.

**Prevention:**
- **Move scroll context INTO the Shadow DOM**
- Make an internal element the scroll container (`overflow-y: auto; max-height: ...`)
- Sticky element will then work relative to internal scroll context
- Remove `overflow-y: auto` from light DOM parent to prevent double scroll bars

**Example Fix:**
```css
/* Shadow DOM CSS */
.internal-container {
    overflow-y: auto;
    max-height: calc(100vh - 48px);
}

.sticky-header {
    position: sticky;
    top: 0;
}
```

### 8. jsDelivr @main is Unreliable - Use Commit Hashes

**Problem:** jsDelivr CDN `@main` serves inconsistent stale content even after purging.

**Evidence:**
| Source | Bundle Size | Status |
|--------|-------------|--------|
| Local dist/web-components.js | 668,315 bytes | Correct |
| GitHub API | 668,315 bytes | Correct |
| CDN with commit hash `@e5df6a9` | 668,315 bytes | Correct |
| CDN with `@main` | 637,784 bytes | **STALE** |

**Why this happens:**
- jsDelivr has multiple edge servers worldwide
- Each edge server caches independently
- Purge requests don't reliably propagate to all edges
- Different users may get different cached versions of `@main`
- Even "successful" purge responses don't guarantee all edges are updated

**Result:** After pushing changes and purging, some users see new version, others see old version. Debugging nightmare.

**Prevention:**
- **NEVER use `@main` for production CDN imports**
- **Always use commit hashes** (`@abc1234`) - they are immutable
- Commit hash references are cached correctly because they can never change
- No purging needed - just point to the new hash

**Example:**
```javascript
// ❌ BAD - Unreliable
import 'https://cdn.jsdelivr.net/gh/user/repo@main/dist/bundle.js';

// ✅ GOOD - Immutable reference
import 'https://cdn.jsdelivr.net/gh/user/repo@abc1234/dist/bundle.js';
```

**Updated deploy workflow:**
1. Build and commit changes
2. Push to GitHub
3. Capture commit hash: `git rev-parse --short HEAD`
4. Update CDN imports to use that hash
5. Commit consuming project changes

The `deploy.sh` script now does this automatically.

---

## Complete Checklist for Design System Changes

**Recommended: Use the automated script:**
```bash
cd m3-design-v2
./scripts/deploy.sh "Description of changes"
./scripts/verify-deployment.sh
```

**Manual process (if needed):**

- [ ] 1. Edit source files in `src/components/`
- [ ] 2. Run `npm run build` to create `dist/web-components.js`
- [ ] 3. Commit **both** `src/` and `dist/` files together
- [ ] 4. Push to GitHub
- [ ] 5. Capture commit hash: `HASH=$(git rev-parse --short HEAD)`
- [ ] 6. Copy `dist/web-components.js` to projects using local bundles:
  - [ ] `cp dist/web-components.js ../prompt-library/web-components.js`
- [ ] 7. Update imports in consuming projects:
  - [ ] `prompt-library/admin.html` - Update `?v=` timestamp for local bundle
  - [ ] `prompt-library/components/index.js` - Update commit hash `@xxx` (NOT @main!)
  - [ ] `Weaver-Yuwono-Home-Page/projects/projects.css` - Update commit hash in @import
- [ ] 8. Commit bundle updates in consuming projects
- [ ] 9. Hard refresh browser (`Cmd+Shift+R`) or clear cache
- [ ] 10. Run `./scripts/verify-deployment.sh` to confirm propagation

---

## Troubleshooting Checklist (For Future Reference)

If changes don't appear after running `deploy.sh`, check these in order:

1. **Run verification script first:**
   ```bash
   ./scripts/verify-deployment.sh
   ```

2. **Is the admin server running?**
   - Check: `ps aux | grep "node server"`
   - Restart: `cd prompt-library && node server.js`

3. **Browser cache:**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
   - Or: Open DevTools → Network tab → Check "Disable cache"
   - Or: Test in incognito window

4. **Verify correct URL:**
   - Admin: http://localhost:3000/admin
   - Public: http://localhost:3000

5. **Nuclear option:**
   ```bash
   # Kill all servers
   pkill -f "node server"
   
   # Clear browser cache completely
   # (Do this manually in browser settings)
   
   # Fresh start
   cd prompt-library
   git pull
   node server.js
   # Open http://localhost:3000/admin in incognito
   ```

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

## Prevention Strategy (IMPLEMENTED)

All automation has been created to prevent recurrence:

### 1. ✅ Automated Deploy Script (`m3-design-v2/scripts/deploy.sh`)

One command handles the entire deployment workflow:

```bash
./scripts/deploy.sh "Description of changes"
```

The script automatically:
1. Builds `dist/web-components.js`
2. Commits both `src/` and `dist/` changes
3. Pushes to GitHub
4. Purges jsDelivr CDN cache
5. Copies bundle to `prompt-library`
6. Updates cache-busting parameters in `admin.html` and `components/index.js`
7. Commits `prompt-library` changes

### 2. ✅ Verification Script (`m3-design-v2/scripts/verify-deployment.sh`)

Confirms changes propagated to all consumers:

```bash
./scripts/verify-deployment.sh ["expected-code-snippet"]
```

Checks:
- Bundle sizes match between design system and prompt-library
- CDN is responding with current version
- Cache-busting parameters are consistent
- Git status is clean in both repos

### 3. ✅ Documentation Updated

- `m3-design-v2/CLAUDE.md` - Includes automated deployment instructions
- `prompt-library/CLAUDE.md` - Cache-busting guidance
- `plots/CLAUDE.md` - npm link workflow
- `Weaver-Yuwono-Home-Page/CLAUDE.md` - CDN cache workflow

### 4. Pre-commit Hook (Optional Future Enhancement)

Not yet implemented. Could add as git hook to remind about build step.

---

## Final Status: ✅ COMPLETE

All issues have been resolved and automation has been implemented to prevent recurrence.

**Summary of Fixes:**
1. Featured filter chip - Build was not run ✅
2. Sticky actions - Duplicate CSS selectors + Shadow DOM scroll context isolation ✅
3. Info panel background - :host-context() browser support + stale cache-busting ✅

**Automation Delivered:**
- `scripts/deploy.sh` - One-command deployment
- `scripts/verify-deployment.sh` - Verification of propagation

**To Deploy Future Changes:**
```bash
cd m3-design-v2
# Make your changes to src/
./scripts/deploy.sh "Description of changes"
./scripts/verify-deployment.sh
# Hard refresh browser (Cmd+Shift+R)
```
